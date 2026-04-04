from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class TutorProfileModel(BaseModel):
    auth0Id: str
    fullName: str
    bio: Optional[str] = None
    subjects: List[str] = []
    qualifications: List[str] = []
    experience: Optional[str] = None
    pricePerHour: Optional[float] = 0.0
    photoUrl: Optional[str] = None
    averageRating: float = 0.0
    totalReviews: int = 0
    isVerified: bool = False
    createdAt: datetime = Field(default_factory=datetime.utcnow)

def serialize_tutor(doc) -> dict:
    if not doc: return {}
    return {
        "_id": str(doc["_id"]),
        "auth0Id": doc.get("auth0Id"),
        "fullName": doc.get("fullName"),
        "bio": doc.get("bio"),
        "subjects": doc.get("subjects"),
        "qualifications": doc.get("qualifications"),
        "experience": doc.get("experience"),
        "pricePerHour": doc.get("pricePerHour"),
        "photoUrl": doc.get("photoUrl"),
        "averageRating": doc.get("averageRating"),
        "totalReviews": doc.get("totalReviews"),
        "isVerified": doc.get("isVerified"),
        "marketingStatus": doc.get("marketingStatus", "pending"),
        "area": doc.get("area"),
        "monthlyFee": doc.get("monthlyFee"),
        "tuitionMode": doc.get("tuitionMode"),
        "contactInfo": doc.get("contactInfo") or {},
        "createdAt": doc.get("createdAt").isoformat() if isinstance(doc.get("createdAt"), datetime) else doc.get("createdAt"),
    }
