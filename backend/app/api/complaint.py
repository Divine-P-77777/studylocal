from datetime import datetime, timedelta
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Header, Request
from app.core.limiter import limiter
from app.db.mongodb import mongo_client
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

VALID_TYPES = {"feedback", "issue", "complaint"}

@router.post("/")
@limiter.limit("3/minute;5/day")  # Strict per-user rate limit
async def create_complaint(request: Request, data: Dict[str, Any], x_user_id: str = Header(...)):
    """
    Log a user complaint, feedback, or issue report.
    Rate-limited to 3/minute and 5/day per user.
    """
    # Validate type
    submission_type = data.get("type", "complaint").lower()
    if submission_type not in VALID_TYPES:
        raise HTTPException(status_code=422, detail=f"Invalid type. Must be one of: {', '.join(VALID_TYPES)}")

    # Validate description length
    description = data.get("description", "").strip()
    if not description or len(description) < 10:
        raise HTTPException(status_code=422, detail="Description must be at least 10 characters.")
    if len(description) > 2000:
        raise HTTPException(status_code=422, detail="Description must not exceed 2000 characters.")

    try:
        complaint = {
            "reporterId": x_user_id,
            "type": submission_type,
            "reason": data.get("reason", f"Dashboard Support: {submission_type.upper()}"),
            "description": description,
            "status": "pending",
            "createdAt": datetime.utcnow()
        }
        await mongo_client.db.Complaint.insert_one(complaint)
        logger.info(f"[Complaint API] {submission_type} submitted by {x_user_id}")
        return {"success": True, "message": f"{submission_type.capitalize()} submitted successfully. Thank you!"}
    except Exception as e:
        logger.error(f"[Complaint API] Failed to save: {e}")
        raise HTTPException(status_code=500, detail="Internal server error. Please try again.")
