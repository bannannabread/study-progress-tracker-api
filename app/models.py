from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Topic(SQLModel, table = True): #sqlmodel variable allows Topic class to map to a database table automatically
    id: Optional[int] = Field(default = None, primary_key = True) # think of id as a class with a default constructor = 0, but managed by the database
    title: str
    description: str
    status: str = "not_started"
    minutes_spent: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


# models.py defines the Topic class and its data (id, title, description, etc.).
# By inheriting from SQLModel, each Topic object maps directly to a database table.
# The id is Optional because we don’t need to assign it manually; the database generates it automatically.
# id also serves as the primary key and main identifier for each Topic.