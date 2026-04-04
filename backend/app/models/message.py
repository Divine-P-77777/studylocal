from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class MessageModel(BaseModel):
    roomId: str
    senderId: str
    senderName: str
    recipientId: str # Added for notification targeting
    message: str
    fileUrl: Optional[str] = None # Added for Cloudinary media support
    messageType: str = "text" # Added: "text", "image", "video", etc.
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    isRead: bool = False
    readAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

def serialize_message(doc) -> dict:
    return {
        "_id": str(doc["_id"]),
        "roomId": doc["roomId"],
        "senderId": doc["senderId"],
        "senderName": doc["senderName"],
        "recipientId": doc.get("recipientId", ""), # Fallback for legacy
        "message": doc["message"],
        "fileUrl": doc.get("fileUrl"),
        "messageType": doc.get("messageType", "text"),
        "timestamp": doc["timestamp"],
        "isRead": doc.get("isRead", False),
        "readAt": doc.get("readAt"),
    }
