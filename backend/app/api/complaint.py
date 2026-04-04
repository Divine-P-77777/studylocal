from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Header, Request
from app.core.limiter import limiter
from app.db.mongodb import mongo_client

router = APIRouter()

@router.post("/")
@limiter.limit("10/minute")
async def create_complaint(request: Request, data: Dict[str, Any], x_user_id: str = Header(...)):
    """
    Log a user complaint/report.
    """
    try:
        complaint = {
            "reporterId": x_user_id,
            "targetId": data.get("targetId"),
            "reason": data.get("reason"),
            "description": data.get("description"),
            "status": "pending",
            "createdAt": datetime.utcnow()
        }
        await mongo_client.db.Complaint.insert_one(complaint)
        return {"success": True, "message": "Complaint filed successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
