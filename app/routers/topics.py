from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import Topic

router = APIRouter(prefix = "/topics", tags = ["Topics"])
# router creates all the routes used (post, get, get specific id) and sets that
# they will all start with /topics, also added a tag to group them together

@router.post("/")
def create_topic(topic: Topic, session: Session = Depends(get_session)):
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

# topics.py defines the routes for managing Topic objects:
# - POST /topics: create a new topic in the database
# - GET /topics: return all topics
# - GET /topics/{topic_id}: return a single topic by id or 404 if not found
# Each route uses a database session injected via FastAPI's dependency system.