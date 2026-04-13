import random
import logging
from datetime import datetime, timedelta
from typing import Optional
from app.db.mongodb import mongo_client
from app.services.email_service import send_otp_email

logger = logging.getLogger(__name__)

class OTPService:
    @staticmethod
    def generate_code(length: int = 6) -> str:
        """Generates a random 6-digit numeric OTP."""
        return "".join([str(random.randint(0, 9)) for _ in range(length)])

    @staticmethod
    async def get_daily_otp_count(auth0_id: str) -> int:
        """Counts how many OTPs were requested by this user in the last 24 hours."""
        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
        count = await mongo_client.db.OTPLog.count_documents({
            "auth0Id": auth0_id,
            "requestedAt": {"$gt": twenty_four_hours_ago}
        })
        return count

    @staticmethod
    async def send_otp(auth0_id: str, email: str) -> dict:
        """
        Main entry point for sending OTP: checks limits, generates, saves, and sends.
        """
        # 1. Check Daily Limit
        count = await OTPService.get_daily_otp_count(auth0_id)
        if count >= 2:
            return {"success": False, "message": "Daily OTP limit reached (max 2 per day). Please try again tomorrow."}

        # 2. Generate and Save Code
        otp_code = OTPService.generate_code()
        expiry = datetime.utcnow() + timedelta(minutes=10) # OTP valid for 10 mins

        # Invalidate any previous codes for this user
        await mongo_client.db.OTPCode.delete_many({"auth0Id": auth0_id})

        await mongo_client.db.OTPCode.insert_one({
            "auth0Id": auth0_id,
            "code": otp_code,
            "expiresAt": expiry
        })

        # 3. Log the Request
        await mongo_client.db.OTPLog.insert_one({
            "auth0Id": auth0_id,
            "requestedAt": datetime.utcnow()
        })

        # 4. Send Email
        sent = send_otp_email(email, otp_code)
        if not sent:
            return {
                "success": False, 
                "message": "Failed to send email. Please check your SMTP settings."
            }

        return {
            "success": True, 
            "message": f"An OTP has been sent to your registered email {email}",
            "remaining_attempts": 2 - (count + 1)
        }

    @staticmethod
    async def verify_otp(auth0_id: str, code: str) -> dict:
        """
        Verifies the given code and creates a 20-minute edit session if valid.
        """
        record = await mongo_client.db.OTPCode.find_one({
            "auth0Id": auth0_id,
            "code": code,
            "expiresAt": {"$gt": datetime.utcnow()}
        })

        if not record:
            return {"success": False, "message": "Invalid or expired OTP code."}

        # Success: Delete the code and create an edit session
        await mongo_client.db.OTPCode.delete_one({"_id": record["_id"]})
        
        # Create a session valid for 20 minutes
        session_expiry = datetime.utcnow() + timedelta(minutes=20)
        
        # Upsert session
        await mongo_client.db.ProfileEditSession.update_one(
            {"auth0Id": auth0_id},
            {"$set": {"expiresAt": session_expiry, "verifiedAt": datetime.utcnow()}},
            upsert=True
        )

        return {
            "success": True, 
            "message": "OTP verified! You can now edit your profile for 20 minutes.",
            "expiresAt": session_expiry.isoformat()
        }

    @staticmethod
    async def is_edit_session_active(auth0_id: str) -> bool:
        """Checks if a user has an active, non-expired edit session."""
        session = await mongo_client.db.ProfileEditSession.find_one({
            "auth0Id": auth0_id,
            "expiresAt": {"$gt": datetime.utcnow()}
        })
        return session is not None

otp_service = OTPService()
