from typing import Optional, List
from app.db.mongodb import mongo_client
from app.db.redis_client import redis_client
from app.models.tutor import serialize_tutor
import json
import logging

logger = logging.getLogger(__name__)

class ProfileService:
    @staticmethod
    async def get_tutor_by_auth0(auth0_id: str) -> Optional[dict]:
        try:
            # Check cache
            cache_key = f"tutor_profile:{auth0_id}"
            cached = await redis_client.get(cache_key)
            if cached:
                return json.loads(cached)

            # DB Lookup
            tutor = await mongo_client.db.TutorProfile.find_one({"auth0Id": auth0_id})
            if tutor:
                res = serialize_tutor(tutor)
                await redis_client.set(cache_key, json.dumps(res, default=str), 300) # 5m TTL
                return res
            return None
        except Exception as e:
            logger.error(f"[ProfileService] Get tutor error: {e}")
            return None
    @staticmethod
    async def get_user_profile(auth0_id: str) -> Optional[dict]:
        try:
            # DB Lookup
            user = await mongo_client.db.User.find_one({"sub": auth0_id})
            if user:
                # Return all fields except internal MongoDB IDs
                data = {k: v for k, v in user.items() if k != "_id"}
                data["_id"] = str(user["_id"])
                return data
            return None
        except Exception as e:
            logger.error(f"[ProfileService] Get user error: {e}")
            return None

profile_service = ProfileService()
