from typing import Dict, List, Optional, Any
from pydantic import BaseModel, UUID4
from app.models.flow import FlowStatus, TriggerType
from app.schemas.base import IDSchema, TimestampedSchema

class FlowNodeBase(BaseModel):
    id: str
    type: str
    name: str
    content: Optional[Dict[str, Any]] = None
    connections: List[Dict[str, Any]] = []

class FlowDefinition(BaseModel):
    startNodeId: str
    nodes: List[FlowNodeBase]

class FlowBase(BaseModel):
    name: str
    description: Optional[str] = None
    flow_definition: FlowDefinition
    status: FlowStatus = FlowStatus.DRAFT

class FlowCreate(FlowBase):
    instagram_account_id: UUID4

class FlowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    flow_definition: Optional[FlowDefinition] = None
    status: Optional[FlowStatus] = None

class FlowInDBBase(FlowBase, IDSchema, TimestampedSchema):
    instagram_account_id: UUID4

class Flow(FlowInDBBase):
    pass

class FlowResponse(FlowInDBBase):
    pass

class TriggerBase(BaseModel):
    type: TriggerType
    keyword: Optional[str] = None
    post_permalink: Optional[str] = None
    status: FlowStatus = FlowStatus.ACTIVE

class TriggerCreate(TriggerBase):
    flow_id: UUID4

class TriggerUpdate(BaseModel):
    keyword: Optional[str] = None
    post_permalink: Optional[str] = None
    status: Optional[FlowStatus] = None

class TriggerInDBBase(TriggerBase, IDSchema, TimestampedSchema):
    flow_id: UUID4

class Trigger(TriggerInDBBase):
    pass

class TriggerResponse(TriggerInDBBase):
    pass 