import json
from typing import Any, Dict, Optional
import aioredis
from app.core.config import settings

class RedisService:
    def __init__(self):
        self.redis = None

    async def init(self):
        """Initialize Redis connection."""
        if not self.redis:
            self.redis = await aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )

    async def close(self):
        """Close Redis connection."""
        if self.redis:
            await self.redis.close()
            self.redis = None

    async def add_to_queue(self, queue_name: str, data: Dict[str, Any]) -> bool:
        """Add a job to a queue."""
        try:
            await self.init()
            await self.redis.rpush(queue_name, json.dumps(data))
            return True
        except Exception as e:
            print(f"Error adding to queue: {str(e)}")
            return False

    async def get_from_queue(self, queue_name: str) -> Optional[Dict[str, Any]]:
        """Get a job from a queue."""
        try:
            await self.init()
            data = await self.redis.lpop(queue_name)
            return json.loads(data) if data else None
        except Exception as e:
            print(f"Error getting from queue: {str(e)}")
            return None

    async def add_to_delayed_queue(
        self,
        queue_name: str,
        data: Dict[str, Any],
        delay_seconds: int
    ) -> bool:
        """Add a job to a delayed queue using sorted set."""
        try:
            await self.init()
            score = await self.redis.time()
            score = score[0] + delay_seconds
            await self.redis.zadd(
                f"{queue_name}:delayed",
                {json.dumps(data): score}
            )
            return True
        except Exception as e:
            print(f"Error adding to delayed queue: {str(e)}")
            return False

    async def get_ready_delayed_jobs(self, queue_name: str) -> list[Dict[str, Any]]:
        """Get jobs that are ready to be processed from delayed queue."""
        try:
            await self.init()
            current_time = (await self.redis.time())[0]
            
            # Get jobs with score <= current time
            jobs = await self.redis.zrangebyscore(
                f"{queue_name}:delayed",
                "-inf",
                current_time
            )
            
            if not jobs:
                return []
            
            # Remove these jobs from the delayed queue
            await self.redis.zremrangebyscore(
                f"{queue_name}:delayed",
                "-inf",
                current_time
            )
            
            return [json.loads(job) for job in jobs]
        except Exception as e:
            print(f"Error getting delayed jobs: {str(e)}")
            return []

    async def set_lock(self, key: str, value: str, expiry_seconds: int) -> bool:
        """Set a distributed lock."""
        try:
            await self.init()
            return await self.redis.set(
                f"lock:{key}",
                value,
                ex=expiry_seconds,
                nx=True
            )
        except Exception as e:
            print(f"Error setting lock: {str(e)}")
            return False

    async def release_lock(self, key: str, value: str) -> bool:
        """Release a distributed lock."""
        try:
            await self.init()
            # Only delete if the value matches (it's our lock)
            current_value = await self.redis.get(f"lock:{key}")
            if current_value == value:
                await self.redis.delete(f"lock:{key}")
                return True
            return False
        except Exception as e:
            print(f"Error releasing lock: {str(e)}")
            return False

redis_service = RedisService() 