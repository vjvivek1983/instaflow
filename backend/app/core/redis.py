import json
from typing import Any, Optional
import aioredis
from app.core.config import settings

class RedisService:
    def __init__(self):
        self.redis: Optional[aioredis.Redis] = None

    async def init(self):
        if not self.redis:
            self.redis = await aioredis.from_url(
                f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}",
                password=settings.REDIS_PASSWORD,
                encoding="utf-8",
                decode_responses=True
            )

    async def close(self):
        if self.redis:
            await self.redis.close()
            self.redis = None

    async def get(self, key: str) -> Any:
        if not self.redis:
            await self.init()
        value = await self.redis.get(key)
        return json.loads(value) if value else None

    async def set(self, key: str, value: Any, expire: int = None) -> bool:
        if not self.redis:
            await self.init()
        value = json.dumps(value)
        if expire:
            return await self.redis.set(key, value, ex=expire)
        return await self.redis.set(key, value)

    async def delete(self, key: str) -> int:
        if not self.redis:
            await self.init()
        return await self.redis.delete(key)

    async def enqueue(self, queue_name: str, data: Any) -> bool:
        if not self.redis:
            await self.init()
        return await self.redis.rpush(queue_name, json.dumps(data))

    async def dequeue(self, queue_name: str) -> Any:
        if not self.redis:
            await self.init()
        value = await self.redis.lpop(queue_name)
        return json.loads(value) if value else None

    async def get_queue_length(self, queue_name: str) -> int:
        if not self.redis:
            await self.init()
        return await self.redis.llen(queue_name)

redis_service = RedisService() 