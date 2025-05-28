from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class Period(BaseModel):
    start: datetime
    end: datetime

class AccountSummary(BaseModel):
    totalContacts: int
    newContacts: int
    messagesSent: int
    messagesReceived: int
    automatedMessages: int
    automationRate: float
    period: Period

class TriggerMetric(BaseModel):
    type: str
    starts: int

class NodeEngagement(BaseModel):
    nodeId: str
    engagements: int

class FlowAnalytics(BaseModel):
    flowId: str
    name: str
    triggers: List[TriggerMetric]
    totalStarts: int
    completions: int
    completionRate: float
    nodeEngagement: List[NodeEngagement]
    period: Period

class ContactGrowth(BaseModel):
    date: datetime
    newContacts: int 