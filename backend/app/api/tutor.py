from fastapi import APIRouter, HTTPException, Query, Header, Request
from app.core.limiter import limiter
from app.services.tutor_service import tutor_service
from typing import Optional, List, Dict, Any
import logging

logger = logging.getLogger(__name__)

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

@router.patch("/{tutor_id}")
@limiter.limit("10/minute")
async def update_tutor(request: Request, tutor_id: str, data: Dict[str, Any], x_user_id: str = Header(...)):
    """
    Partially update a tutor profile.
    """
    res = await tutor_service.update_tutor_profile(tutor_id, data, x_user_id)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res
