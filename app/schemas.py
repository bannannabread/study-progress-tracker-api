from pydantic import BaseModel, Field
from typing import Optional

class TopicCreate(BaseModel):
    title: str
    description: str
    status: str = "not_started"
    minutes_spent: int = 0

class TopicUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = Field(default = None, pattern = "^(not_started|in_progress|done)$")
    minutes_spent: Optional[int] = Field(default = None, ge = 0)

    