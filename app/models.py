from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List

class Topic(SQLModel, table = True): #sqlmodel variable allows Topic class to map to a database table automatically
    id: Optional[int] = Field(default = None, primary_key = True) # think of id as a class with a default constructor = 0, but managed by the database
    title: str = Field(index = True)
    description: Optional[str] = None
    status: str = Field(default = "not_started")
    minutes_spent: int = Field(default = 0)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    pokemon_id: Optional[int] = None
    pokemon_name: Optional[str] = None
    pokemon_level: int = 1
    pokemon_exp: int = 0
    pokemon_sprite_url: Optional[str] = None

    sessions: List["StudySession"] = Relationship(back_populates="topic")
# models.py defines the Topic class and its data (id, title, description, etc.).
# By inheriting from SQLModel, each Topic object maps directly to a database table.
# The id is Optional because we don’t need to assign it manually; the database generates it automatically.
# id also serves as the primary key and main identifier for each Topic.

class StudySession(SQLModel, table = True):
    id: Optional[int] = Field(default = None, primary_key = True) # think of id as a class with a default constructor = 0, but managed by the database
    topic_id: int = Field(foreign_key = "topic.id")
    start_time: datetime = Field(default_factory = datetime.utcnow)
    end_time: Optional[datetime] = None
    duration_minutes: int = Field(default = 0)

    topic: Optional[Topic] = Relationship(back_populates = "sessions")

