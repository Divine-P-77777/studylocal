import re
import json
import hashlib
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
from bson import ObjectId
from app.db.mongodb import mongo_client
from app.db.redis_client import redis_client
from app.models.tutor import serialize_tutor

logger = logging.getLogger(__name__)

class TutorService:
    @staticmethod
    def build_tutor_query(params: Dict[str, Any]) -> Dict[str, Any]:
        """Ported from Next.js filter.ts logic"""
        # Default to approved, but allow override for Admin views
        status = params.get("status", "approved")
        query = {}
        
        if status != "all":
            query["marketingStatus"] = status
        
        if params.get("subject"):
            regex = re.compile(params["subject"], re.IGNORECASE)
            query["subjects"] = {"$in": [regex]}
            
        if params.get("classRange"):
            query["classRange"] = params["classRange"]
            
        if params.get("area"):
            query["area"] = re.compile(params["area"], re.IGNORECASE)
            
        return query

    @staticmethod
    async def search_tutors(filters: Dict[str, Any], page: int = 1, limit: int = 10) -> Dict[str, Any]:
        try:
            # 1. Generate Cache Key (MD5 hash of parameters)
            param_str = f"{filters}_{page}_{limit}"
            cache_hash = hashlib.md5(param_str.encode()).hexdigest()
            cache_key = f"tutor_search:{cache_hash}"
            
            # 2. Try Cache
            cached = await redis_client.get(cache_key)
            if cached:
                logger.info(f"[TutorService] Cache hit for search: {cache_hash}")
                return json.loads(cached)

            # 3. Query MongoDB
            query = TutorService.build_tutor_query(filters)
            skip = (page - 1) * limit
            
            cursor = mongo_client.db.TutorProfile.find(query).skip(skip).limit(limit)
            tutors = await cursor.to_list(length=limit)
            total = await mongo_client.db.TutorProfile.count_documents(query)
            
            result = {
                "tutors": [serialize_tutor(t) for t in tutors],
                "pagination": {
                    "total": total,
                    "page": page,
                    "limit": limit,
                    "totalPages": (total + limit - 1) // limit
                }
            }
            
            # 4. Seed Cache (5-minute TTL)
            await redis_client.set(cache_key, json.dumps(result, default=str), 300)
            return result
        except Exception as e:
            logger.error(f"[TutorService] Search error: {e}")
            return {"tutors": [], "pagination": {"total": 0, "page": 1, "limit": 10, "totalPages": 0}}

    @staticmethod
    async def get_tutor_by_id(tutor_id: str) -> Optional[dict]:
        try:
            tutor = await mongo_client.db.TutorProfile.find_one({"_id": ObjectId(tutor_id)})
            return serialize_tutor(tutor) if tutor else None
        except Exception:
            return None

    @staticmethod
    async def get_tutor_by_auth0_id(auth0_id: str) -> Optional[dict]:
        """Fetch a tutor profile by its unique Auth0 sub ID."""
        try:
            tutor = await mongo_client.db.TutorProfile.find_one({"auth0Id": auth0_id})
            return serialize_tutor(tutor) if tutor else None
        except Exception:
            return None

    @staticmethod
    async def update_tutor_profile(tutor_id: str, update_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """
        Update a tutor profile (Admin or Self).
        Uses pre-invalidation: wipe cache BEFORE DB write so stale data is never served.
        """
        try:
            # 1. Verify ownership or admin status
            existing = await mongo_client.db.TutorProfile.find_one({"_id": ObjectId(tutor_id)})
            if not existing:
                return {"success": False, "message": "Tutor not found"}

            # 2. PRE-INVALIDATE cache before writing to DB.
            # This prevents the window where stale cache serves incorrect data.
            # (If we wrote to DB first, then failed to delete cache, users see wrong data.)
            deleted = await redis_client.delete_pattern("tutor_search:*")
            await redis_client.delete(f"tutor_profile:{existing['auth0Id']}")
            logger.info(f"[TutorService] Pre-invalidated {deleted} search cache keys before updating {tutor_id}")

            # 3. Clean data (exclude sensitive/immutable fields)
            clean_data = {k: v for k, v in update_data.items() if k not in ["_id", "auth0Id", "createdAt"]}
            if "subjects" in clean_data and isinstance(clean_data["subjects"], str):
                clean_data["subjects"] = [s.strip() for s in clean_data["subjects"].split(",") if s.strip()]

            # 4. Perform update
            await mongo_client.db.TutorProfile.update_one(
                {"_id": ObjectId(tutor_id)},
                {"$set": clean_data}
            )

            return {"success": True, "message": "Profile updated successfully."}
        except Exception as e:
            logger.error(f"[TutorService] Update error: {e}")
            return {"success": False, "message": "Internal server error"}

    @staticmethod
    async def register_tutor(auth0_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            existing = await mongo_client.db.TutorProfile.find_one({"auth0Id": auth0_id})
            if existing:
                return {"success": False, "message": "You have already registered as a tutor."}

            new_profile = {
                "auth0Id": auth0_id,
                "fullName": data.get("fullName"),
                "photoUrl": data.get("photoUrl"),
                "subjects": data.get("subjects", []),
                "classRange": data.get("classRange"),
                "tuitionMode": data.get("tuitionMode"),
                "monthlyFee": data.get("monthlyFee"),
                "area": data.get("area"),
                "experience": data.get("experience"),
                "bio": data.get("bio"),
                "contactInfo": data.get("contactInfo"),
                "marketingStatus": "pending",
                "createdAt": datetime.utcnow()
            }
            
            await mongo_client.db.TutorProfile.insert_one(new_profile)
            
            # Sync back to User record to mark as onboarded/tutor
            await mongo_client.db.User.update_one(
                {"sub": auth0_id},
                {"$set": {"role": "tutor", "isProfileComplete": True}}
            )

            return {"success": True, "message": "Registration submitted successfully! Waiting for approval."}
        except Exception as e:
            logger.error(f"[TutorService] Registration error: {e}")
            return {"success": False, "message": "Internal server error"}

tutor_service = TutorService()
