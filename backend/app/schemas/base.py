from datetime import datetime
from uuid import UUID
from pydantic import BaseModel

class IDSchema(BaseModel):
    id: UUID

class TimestampedSchema(BaseModel):
    created_at: datetime
    updated_at: datetime 