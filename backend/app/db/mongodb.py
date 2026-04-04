from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging
import pymongo

logger = logging.getLogger(__name__)

class MongoClient:
    def __init__(self):
        self.client: AsyncIOMotorClient = None
        self.db = None

    async def connect(self):
        if not settings.MONGODB_URI:
            raise Exception("MONGODB_URI not set")
        
        try:
            self.client = AsyncIOMotorClient(settings.MONGODB_URI)
            self.db = self.client[settings.MONGODB_DB_NAME]
            # Test connection
            await self.client.admin.command('ping')
            logger.info(f"[MongoDB] Connected to database: {settings.MONGODB_DB_NAME}")
            
            # Create Indexes
            await self.create_indexes()
        except Exception as e:
            logger.error(f"[MongoDB] Connection failed: {e}")
            raise e

    async def create_indexes(self):
        try:
            # ── TutorProfile Indexes ─────────────────────────────────────────
            # Unique index for Auth0 lookups
            await self.db.TutorProfile.create_index("auth0Id", unique=True)
            # Multikey index for subject filtering
            await self.db.TutorProfile.create_index("subjects")
            # Index for area search (case-insensitive)
            await self.db.TutorProfile.create_index([("area", pymongo.ASCENDING)])
            # Indices for sorting
            await self.db.TutorProfile.create_index([("monthlyFee", pymongo.ASCENDING)])
            await self.db.TutorProfile.create_index([("averageRating", pymongo.DESCENDING)])
            
            # ── Message Indexes ──────────────────────────────────────────────
            # Compound index for fast room history retrieval
            await self.db.Message.create_index([("roomId", pymongo.ASCENDING), ("timestamp", pymongo.ASCENDING)])
            
            # ── User Indexes ─────────────────────────────────────────────────
            await self.db.User.create_index("sub", unique=True)
            
            logger.info("[MongoDB] Indexes verified/created successfully.")
        except Exception as e:
            logger.error(f"[MongoDB] Error creating indexes: {e}")

    async def close(self):
        if self.client:
            self.client.close()

mongo_client = MongoClient()
