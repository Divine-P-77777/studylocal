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
    ts = doc.get("timestamp")
    read_at = doc.get("readAt")
    return {
        "_id": str(doc["_id"]),
        "roomId": doc["roomId"],
        "senderId": doc["senderId"],
        "senderName": doc["senderName"],
        "recipientId": doc.get("recipientId", ""),
        "message": doc["message"],
        "fileUrl": doc.get("fileUrl"),
        "messageType": doc.get("messageType", "text"),
        # Always convert datetime → ISO string so Socket.IO / json.dumps can serialize it
        "timestamp": ts.isoformat() if hasattr(ts, "isoformat") else ts,
        "isRead": doc.get("isRead", False),
        "readAt": read_at.isoformat() if hasattr(read_at, "isoformat") else read_at,
    }

