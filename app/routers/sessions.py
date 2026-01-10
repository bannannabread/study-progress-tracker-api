from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from ..database import get_session
from ..models import StudySession, Topic
from ..session_schemas import SessionCreate, SessionEnd, SessionResponse
from datetime import datetime

router = APIRouter(prefix = "/sessions", tags = ["Sessions"])

# create new study session
@router.post("/start", response_model = SessionResponse)
def start_session(session_data: SessionCreate, db: Session = Depends(get_session)):
    """Start a new study session for a topic"""
    topic = db.get(Topic, session_data.topic_id)

    # if topic does not exist, return error
    if not topic:
        raise HTTPException(status_code = 404, detail = "Topic not found")
    
    # create new session
    session = StudySession(
        topic_id = session_data.topic_id,
        start_time = datetime.utcnow()
    )

    # add to database
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

# end study session
@router.post("/{session_id}/end", response_model = SessionResponse)
def end_session(session_id: int, session_data: SessionEnd, db: Session = Depends(get_session)):
    """End a study session and update topic's total minutes"""
    study_session = db.get(StudySession, session_id)

    # study session does not exist
    if not study_session:
        raise HTTPException(status_code = 404, detail = "Session not found")
    
    # study session already ended
    if study_session.end_time is not None:
        raise HTTPException(status_code = 404, detail = "Session already ended")

    study_session.end_time = datetime.utcnow()
    study_session.duration_minutes = session_data.duration_minutes

    # update the topic's minutes spent
    topic = db.get(Topic, study_session.topic_id)
    if topic:
        topic.minutes_spent += session_data.duration_minutes

        if topic.status == "not_started":
            topic.status = "in_progress"

    # save it
    db.add(study_session)
    db.commit()
    db.refresh(study_session)
    return study_session

@router.get("/", response_model = list[SessionResponse])
def get_sessions(topic_id: int = None, db: Session = Depends(get_session)):
    """Get all sessions"""
    query = select(StudySession)
    if topic_id:
        query = query.where(StudySession.topic_id == topic_id)
    sessions = db.exec(query).all()
    return sessions

@router.get("/{session_id}", response_model = SessionResponse)
def get_single_session(session_id: int, db: Session = Depends(get_session)):
    """Get a specific session"""
    session = db.get(StudySession, session_id)
    if not session:
        raise HTTPException(status_code = 404, detail = "Session not found")
    return session

@router.delete("/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_session)):
    """Delete a session (remove from history but does not update the topic's minutes)"""
    session = db.get(StudySession, session_id)
    if not session:
        raise HTTPException(status_code = 404, detail = "Session not found")
    
    db.delete(session)
    db.commit()
    return {"message": "Session deleted successfully"}