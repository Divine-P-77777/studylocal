from datetime import datetime
from typing import Optional, List
from bson import ObjectId
from app.db.mongodb import mongo_client
from app.models.enrolment import serialize_enrolment
import logging

logger = logging.getLogger(__name__)

class EnrolmentService:
    @staticmethod
    async def create_enrolment(tutor_id: str, student_id: str, subject: Optional[str] = None) -> dict:
        try:
            # Check if active enrolment already exists
            existing = await mongo_client.db.Enrolment.find_one({
                "tutorId": ObjectId(tutor_id),
                "studentId": student_id,
                "status": {"$in": ["pending", "confirmed"]}
            })
            
            if existing:
                return {"success": False, "message": "An active enrolment already exists."}

            new_enrolment = {
                "tutorId": ObjectId(tutor_id),
                "studentId": student_id,
                "subject": subject,
                "status": "pending",
                "createdAt": datetime.utcnow()
            }
            
            result = await mongo_client.db.Enrolment.insert_one(new_enrolment)
            new_enrolment["_id"] = result.inserted_id
            return {"success": True, "enrolment": serialize_enrolment(new_enrolment)}
        except Exception as e:
            logger.error(f"[EnrolmentService] Create error: {e}")
            return {"success": False, "message": "Internal server error"}

    @staticmethod
    async def confirm_enrolment(enrolment_id: str, student_id: str) -> dict:
        try:
            enrolment = await mongo_client.db.Enrolment.find_one({"_id": ObjectId(enrolment_id)})
            if not enrolment:
                return {"success": False, "message": "Enrolment not found"}
            
            if enrolment["studentId"] != student_id:
                return {"success": False, "message": "Unauthorized"}

            await mongo_client.db.Enrolment.update_one(
                {"_id": ObjectId(enrolment_id)},
                {"$set": {"status": "confirmed", "confirmedAt": datetime.utcnow()}}
            )
            
            updated = await mongo_client.db.Enrolment.find_one({"_id": ObjectId(enrolment_id)})
            return {"success": True, "enrolment": serialize_enrolment(updated)}
        except Exception as e:
            logger.error(f"[EnrolmentService] Confirm error: {e}")
            return {"success": False, "message": "Internal server error"}

    @staticmethod
    async def cancel_enrolment(enrolment_id: str, user_id: str) -> dict:
        try:
            enrolment = await mongo_client.db.Enrolment.find_one({"_id": ObjectId(enrolment_id)})
            if not enrolment:
                return {"success": False, "message": "Enrolment not found"}
            
            # Authenticated user must be either student or tutor for this deal
            # (Note: tutorId is an ObjectId, studentId is an Auth0 string)
            # Find the tutor profile for the current user to check ownership
            tutor_profile = await mongo_client.db.TutorProfile.find_one({"auth0Id": user_id})
            is_student = enrolment["studentId"] == user_id
            is_tutor = tutor_profile and str(tutor_profile["_id"]) == str(enrolment["tutorId"])
            
            if not (is_student or is_tutor):
                return {"success": False, "message": "Unauthorized"}

            await mongo_client.db.Enrolment.update_one(
                {"_id": ObjectId(enrolment_id)},
                {"$set": {"status": "cancelled", "cancelledAt": datetime.utcnow()}}
            )
            return {"success": True, "message": "Deal cancelled successfully"}
        except Exception as e:
            logger.error(f"[EnrolmentService] Cancel error: {e}")
            return {"success": False, "message": "Internal server error"}

    @staticmethod
    async def get_user_enrolments(user_id: str) -> dict:
        try:
            # 1. Fetch as student (match auth0 ID)
            as_student_cursor = mongo_client.db.Enrolment.find({"studentId": user_id}).sort("createdAt", -1)
            as_student = await as_student_cursor.to_list(length=100)
            
            # 2. Fetch as tutor (match tutor profile _id)
            tutor_profile = await mongo_client.db.TutorProfile.find_one({"auth0Id": user_id})
            as_tutor = []
            if tutor_profile:
                as_tutor_cursor = mongo_client.db.Enrolment.find({"tutorId": tutor_profile["_id"]}).sort("createdAt", -1)
                as_tutor = await as_tutor_cursor.to_list(length=100)
            
            return {
                "asStudent": [serialize_enrolment(e) for e in as_student],
                "asTutor": [serialize_enrolment(e) for e in as_tutor]
            }
        except Exception as e:
            logger.error(f"[EnrolmentService] Get list error: {e}")
            return {"asStudent": [], "asTutor": []}

    @staticmethod
    async def get_enrolment_for_chat(tutor_id: str, student_id: str) -> Optional[dict]:
        try:
            enrolment = await mongo_client.db.Enrolment.find_one({
                "tutorId": ObjectId(tutor_id),
                "studentId": student_id,
                "status": {"$in": ["pending", "confirmed"]}
            })
            return serialize_enrolment(enrolment) if enrolment else None
        except Exception:
            return None

enrolment_service = EnrolmentService()
