from fastapi import APIRouter, HTTPException, Query, Header, Request
from app.core.limiter import limiter
from app.services.tutor_service import tutor_service
from app.services.otp_service import otp_service
from app.services.profile_service import profile_service
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import logging

class OTPVerifyRequest(BaseModel):
    code: str

router = APIRouter()

@router.get("/")
@limiter.limit("60/minute")
async def get_tutors(
    request: Request,
    subject: Optional[str] = None,
    classRange: Optional[str] = None,
    area: Optional[str] = None,
    status: Optional[str] = "approved",
    page: int = Query(1, gt=0),
    limit: int = Query(10, gt=0),
    x_user_id: Optional[str] = Header(None)
):
    """
    Paginated search for tutors with filters. Supports 'status' for Admin views.
    """
    # Security: If status is not 'approved', verify admin role
    if status != "approved":
        if not x_user_id:
            raise HTTPException(status_code=401, detail="Authentication required for administrative views")
        
        from app.services.profile_service import profile_service
        from app.core.config import settings
        
        user = await profile_service.get_user_profile(x_user_id)
        
        # Self-healing/Resilient check: check role OR check email if available in record
        is_admin = False
        if user:
            # 1. Check direct role
            if user.get("role") == "admin":
                is_admin = True
            # 2. Check if email is in ADMIN_EMAILS (fallback if role not synced)
            elif user.get("email") in settings.ADMIN_EMAILS:
                is_admin = True
        
        logger.info(f"[Tutor API] Admin check for {x_user_id}: is_admin={is_admin}")
        
        if not is_admin:
            raise HTTPException(status_code=403, detail="Admin privileges required to filter by status")

    filters = {
        "subject": subject,
        "classRange": classRange,
        "area": area,
        "status": status
    }
    return await tutor_service.search_tutors(filters, page, limit)

@router.get("/{tutor_id}")
async def get_tutor_by_id(tutor_id: str):
    """
    Fetch a single tutor by MongoDB ObjectId.
    """
    tutor = await tutor_service.get_tutor_by_id(tutor_id)
    if not tutor:
        raise HTTPException(status_code=404, detail="Tutor not found")
    return tutor

@router.get("/me/profile")
async def get_my_tutor_profile(request: Request, x_user_id: str = Header(...)):
    """
    Fetch the tutor profile for the current logged-in user.
    """
    tutor = await tutor_service.get_tutor_by_auth0_id(x_user_id)
    if not tutor:
        raise HTTPException(status_code=404, detail="No tutor profile found for this user.")
    return tutor

@router.post("/register")
@limiter.limit("5/minute")
async def register_tutor(request: Request, data: Dict[str, Any], x_user_id: str = Header(...)):
    """
    Handle tutor registration for the current user.
    """
    res = await tutor_service.register_tutor(x_user_id, data)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res

@router.post("/otp/send")
@limiter.limit("5/minute")
async def send_tutor_otp(request: Request, x_user_id: str = Header(...)):
    """
    Sends an OTP to the tutor's registered email for profile update verification.
    """
    # 1. Fetch user's profile to get email
    user = await profile_service.get_user_profile(x_user_id)
    if not user or not user.get("email"):
        raise HTTPException(status_code=404, detail="User email not found. Please ensure your account has a verified email.")
    
    # 2. Check if user is a tutor
    tutor = await tutor_service.get_tutor_by_auth0_id(x_user_id)
    if not tutor:
        raise HTTPException(status_code=403, detail="Only registered tutors can update their profiles via OTP.")

    # 3. Check if rejected
    if tutor.get("marketingStatus") == "rejected":
        raise HTTPException(status_code=403, detail="Access denied. Your tutor registration has been rejected.")

    # 4. Trigger OTP send
    res = await otp_service.send_otp(x_user_id, user["email"])
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    
    return res

@router.post("/otp/verify")
@limiter.limit("5/minute")
async def verify_tutor_otp(request: Request, data: OTPVerifyRequest, x_user_id: str = Header(...)):
    """
    Verifies the OTP and unlocks the profile for 20 minutes.
    """
    res = await otp_service.verify_otp(x_user_id, data.code)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res

@router.patch("/{tutor_id}")
@limiter.limit("10/minute")
async def update_tutor(request: Request, tutor_id: str, data: Dict[str, Any], x_user_id: str = Header(...)):
    """
    Partially update a tutor profile. Requires active 20-min session.
    """
    # 1. Security Check: Is edit session active?
    is_session_active = await otp_service.is_edit_session_active(x_user_id)
    if not is_session_active:
        raise HTTPException(status_code=403, detail="Authentication required. Please verify via OTP to unlock profile editing.")

    # 2. Ownership Check: Can this user edit this specific tutor profile?
    existing_tutor = await tutor_service.get_tutor_by_id(tutor_id)
    if not existing_tutor:
        raise HTTPException(status_code=404, detail="Tutor profile not found.")
    
    if existing_tutor.get("auth0Id") != x_user_id:
        logger.warning(f"[Security] User {x_user_id} attempted to edit tutor profile {tutor_id} belonging to {existing_tutor.get('auth0Id')}")
        raise HTTPException(status_code=403, detail="Permission denied. You can only edit your own profile.")

    # 2. Field Protection: Prevent updates to sensitive fields
    restricted_fields = ["fullName", "auth0Id", "_id", "createdAt", "marketingStatus"]
    for field in restricted_fields:
        if field in data:
            del data[field]
    
    # Deep check for contactInfo to protect email and phone
    if "contactInfo" in data:
        if isinstance(data["contactInfo"], dict):
            if "email" in data["contactInfo"]:
                del data["contactInfo"]["email"]
            if "phone" in data["contactInfo"]:
                del data["contactInfo"]["phone"]
    
    # 3. Perform update
    res = await tutor_service.update_tutor_profile(tutor_id, data, x_user_id)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res
