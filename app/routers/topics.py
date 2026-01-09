from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import Topic
from app.schemas import TopicUpdate
from app.schemas import TopicCreate
from typing import Optional

router = APIRouter(prefix = "/topics", tags = ["Topics"])
# router creates all the routes used (post, get, get specific id) and sets that
# they will all start with /topics, also added a tag to group them together

@router.post("/")
def create_topic(topic_data: TopicCreate, session: Session = Depends(get_session)):
    topic = Topic(**topic_data.dict())
    session.add(topic)
    session.commit()
    session.refresh(topic)
    return topic
# recieves new Topic object
# mark it to add to database, then adds it (commit)
# then reloads obj with its id and returns it as json

@router.get("/")
def list_topics(session: Session = Depends(get_session)):
    return session.exec(select(Topic)).all()
# return every topic

@router.get("/{topic_id}")
def get_topic(topic_id: int, session: Session = Depends(get_session)):
    topic = session.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code = 404, detail = "Topic not found")
    return topic
# looks up topic by primary key (id)
# if doesnt exist, raises a 404 error
# otherwise, returns it

@router.patch("/{topic_id}")
def update_topic(topic_id: int, topic_update: TopicUpdate, session: Session = Depends(get_session)):
    topic = session.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code = 404, detail = "Topic not found")

    # update certain fields
    update_data = topic_update.dict(exclude_unset = True)
    for key, value in update_data.items():
        setattr(topic, key, value)

    session.add(topic)
    session.commit()
    session.refresh(topic)
    return topic

@router.delete("/{topic_id}")
def delete_topic(topic_id: int, session: Session = Depends(get_session)):
    topic = session.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code = 404, detail = "Topic not found")

    session.delete(topic)
    session.commit()
    return { "message": "Topic deleted successfully" }

@router.get("/") # filter/search topics by status
def list_topics(status: Optional[str] = None, session: Session = Depends(get_session)):
    query = select(Topic)
    if status:
        query = query.where(Topic.status == status)
    return session.exec(query).all()

# topics.py defines the routes for managing Topic objects:
# - POST /topics: create a new topic in the database
# - GET /topics: return all topics
# - GET /topics/{topic_id}: return a single topic by id or 404 if not found
# Each route uses a database session injected via FastAPI's dependency system.