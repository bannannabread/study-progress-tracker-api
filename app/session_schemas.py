from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SessionCreate(BaseModel):
    topic_id: int

class SessionEnd(BaseModel):
    duration_minutes: int

class SessionResponse(BaseModel):
    id: int
    topic_id: int
    start_time: datetime
    end_time: Optional[datetime]
    duration_minutes: int

    class Config:
        from_attributes = True