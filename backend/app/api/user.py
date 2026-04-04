from fastapi import APIRouter, HTTPException, Body, Request
from app.core.limiter import limiter
from app.services.profile_service import profile_service
from app.db.mongodb import mongo_client
from typing import Dict, Any

router = APIRouter()

@router.get("/{auth0_id}")
@limiter.limit("20/minute")
async def get_user_profile(request: Request, auth0_id: str):
    user = await profile_service.get_user_profile(auth0_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/tutor/{auth0_id}")
@limiter.limit("20/minute")
async def get_tutor_profile(request: Request, auth0_id: str):
    tutor = await profile_service.get_tutor_by_auth0(auth0_id)
    if not tutor:
        raise HTTPException(status_code=404, detail="Tutor not found")
    return tutor

@router.post("/sync")
@limiter.limit("5/minute")
async def sync_user_profile(request: Request, data: Dict[str, Any]):
    """
    Upsert user data (typically called on login/signup).
    """
    auth0_id = data.get("sub")
    if not auth0_id:
        raise HTTPException(status_code=400, detail="Missing 'sub' (Auth0 ID)")

    email = data.get("email")
    update_data = {
        "fullName": data.get("fullName", data.get("name")),
        "photoUrl": data.get("photoUrl", data.get("picture")),
        "email": email,
        "auth0Id": auth0_id, # Backwards compatibility
        "sub": auth0_id      # Primary ID
    }
    
    # Auto-assign Admin role if email is in the list
    from app.core.config import settings
    if email and email in settings.ADMIN_EMAILS:
        update_data["role"] = "admin"

    # Filter out None values
    update_data = {k: v for k, v in update_data.items() if v is not None}

    try:
        await mongo_client.db.User.update_one(
            {"sub": auth0_id},
            {"$set": update_data},
            upsert=True
        )
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.patch("/{auth0_id}")
async def update_user_profile(request: Request, auth0_id: str, data: Dict[str, Any]):
    """
    Update user profile data (e.g. from Onboarding).
    """
    try:
        # Filter out _id if present in data
        update_data = {k: v for k, v in data.items() if k not in ["_id", "auth0Id", "sub"]}
        
        result = await mongo_client.db.User.update_one(
            {"sub": auth0_id},
            {"$set": update_data},
            upsert=True
        )
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
