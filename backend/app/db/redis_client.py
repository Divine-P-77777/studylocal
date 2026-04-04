from upstash_redis.asyncio import Redis
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class RedisClient:
    def __init__(self):
        self.redis: Redis = None
        self.is_connected = False
        self._failed_permanently = False

    async def connect(self):
        if self._failed_permanently:
            return None
        
        if not settings.UPSTASH_REDIS_REST_URL or not settings.UPSTASH_REDIS_REST_TOKEN:
            logger.info("[Redis] Upstash credentials not set — caching disabled.")
            self._failed_permanently = True
            return None

        try:
            # Upstash Redis is HTTP-based, so connection is immediate
            self.redis = Redis(
                url=settings.UPSTASH_REDIS_REST_URL, 
                token=settings.UPSTASH_REDIS_REST_TOKEN
            )
            # Test connection with a ping
            await self.redis.ping()
            self.is_connected = True
            logger.info("[Redis] Connected to Upstash successfully.")
        except Exception as e:
            logger.warning(f"[Redis] Upstash connection failed: {e}. Falling back to MongoDB.")
            self.is_connected = False
            self._failed_permanently = True
            self.redis = None

    async def get(self, key: str):
        if not self.is_connected or not self.redis:
            return None
        try:
            return await self.redis.get(key)
        except Exception as e:
            logger.error(f"[Redis] Get error for key {key}: {e}")
            return None

    async def set(self, key: str, value: str, expire: int = 60 * 60):
        if not self.is_connected or not self.redis:
            return False
        try:
            # Upstash SDK uses 'ex' for expiry seconds
            await self.redis.set(key, value, ex=expire)
            return True
        except Exception as e:
            logger.error(f"[Redis] Set error for key {key}: {e}")
            return False

    async def close(self):
        # Upstash AsyncRedis uses a session that should be closed
        if self.redis:
            await self.redis.close()

redis_client = RedisClient()
