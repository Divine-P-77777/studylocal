from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class EnrolmentModel(BaseModel):
    tutorId: str # ObjectId as string
    studentId: str # Auth0 ID
    subject: Optional[str] = None
    status: str = "pending" # pending, confirmed, cancelled
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    confirmedAt: Optional[datetime] = None

def serialize_enrolment(doc) -> dict:
    return {
        "_id": str(doc["_id"]),
        "tutorId": str(doc["tutorId"]),
        "studentId": doc["studentId"],
        "subject": doc.get("subject"),
        "status": doc.get("status", "pending"),
        "createdAt": doc.get("createdAt"),
        "confirmedAt": doc.get("confirmedAt"),
    }
