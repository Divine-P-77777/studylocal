import json
import logging
from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from app.db.mongodb import mongo_client
from app.db.redis_client import redis_client
from app.models.message import serialize_message, MessageModel

logger = logging.getLogger(__name__)

class ChatService:
    @staticmethod
    async def get_messages(room_id: str) -> List[dict]:
        if not room_id:
            return []

        cache_key = f"messages:{room_id}"
        
        # 1. Try Cache
        cached = await redis_client.get(cache_key)
        if cached:
            logger.info(f"[ChatService] Cache hit for room: {room_id}")
            return json.loads(cached)

        # 2. Query MongoDB
        try:
            cursor = mongo_client.db.Message.find({"roomId": room_id}).sort("timestamp", 1)
            messages = await cursor.to_list(length=200)
            result = [serialize_message(msg) for msg in messages]
            
            # 3. Seed Cache (JSON serialization of result)
            # Use string representation for timestamps for JSON
            await redis_client.set(cache_key, json.dumps(result, default=str), 30)
            return result
        except Exception as e:
            logger.error(f"[ChatService] Error fetching history for {room_id}: {e}")
            return []

    @staticmethod
    async def save_message(
        room_id: str, 
        sender_id: str, 
        sender_name: str, 
        recipient_id: str, # Required for unread counts
        message: str, 
        file_url: Optional[str] = None, 
        message_type: str = "text", 
        is_read: bool = False
    ) -> Optional[dict]:
        try:
            new_msg = {
                "roomId": room_id,
                "senderId": sender_id,
                "senderName": sender_name,
                "recipientId": recipient_id,
                "message": message,
                "fileUrl": file_url,
                "messageType": message_type,
                "timestamp": datetime.utcnow(),
                "isRead": is_read,
                "readAt": datetime.utcnow() if is_read else None
            }
            result = await mongo_client.db.Message.insert_one(new_msg)
            new_msg["_id"] = result.inserted_id
            
            # Invalidate Cache
            await redis_client.delete(f"messages:{room_id}")
            
            return serialize_message(new_msg)
        except Exception as e:
            logger.error(f"[ChatService] Save error: {e}")
            return None

    @staticmethod
    async def delete_message(message_id: str, user_id: str, room_id: str) -> bool:
        try:
            # Only the sender can delete their own message
            res = await mongo_client.db.Message.delete_one({"_id": ObjectId(message_id), "senderId": user_id})
            if res.deleted_count > 0:
                await redis_client.delete(f"messages:{room_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"[ChatService] Delete error: {e}")
            return False

    @staticmethod
    async def get_unread_count(user_id: str) -> int:
        try:
            count = await mongo_client.db.Message.count_documents({
                "recipientId": user_id,
                "isRead": False
            })
            return count
        except Exception as e:
            logger.error(f"[ChatService] Unread count error: {e}")
            return 0

    @staticmethod
    async def mark_as_read(room_id: str, user_id: str) -> bool:
        try:
            result = await mongo_client.db.Message.update_many(
                {"roomId": room_id, "senderId": {"$ne": user_id}, "isRead": False},
                {"$set": {"isRead": True, "readAt": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"[ChatService] Mark-as-read error: {e}")
            return False

chat_service = ChatService()
