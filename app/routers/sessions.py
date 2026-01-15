from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from ..database import get_session
from ..models import StudySession, Topic
from ..session_schemas import SessionCreate, SessionEnd, SessionResponse
from datetime import datetime
from ..pokemon.pokemon_utils import calculate_level_from_exp, EXP_PER_MINUTE, check_evolution, fetch_pokemon_data

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.post("/start", response_model=SessionResponse)
def start_session(session_data: SessionCreate, db: Session = Depends(get_session)):
    """Start a new study session for a topic"""
    # Verify topic exists
    topic = db.get(Topic, session_data.topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Create new session
    new_session = StudySession(
        topic_id=session_data.topic_id,
        start_time=datetime.utcnow()
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@router.post("/{session_id}/end", response_model=SessionResponse)
def end_session(session_id: int, session_data: SessionEnd, db: Session = Depends(get_session)):
    """End a study session and update topic's total minutes"""
    # Get session
    study_session = db.get(StudySession, session_id)
    if not study_session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if study_session.end_time is not None:
        raise HTTPException(status_code=400, detail="Session already ended")
    
    # Update session
    study_session.end_time = datetime.utcnow()
    study_session.duration_minutes = session_data.duration_minutes
    
    # Update topic's total minutes
    topic = db.get(Topic, study_session.topic_id)
    evolution_data = None
    
    if topic:
        topic.minutes_spent += session_data.duration_minutes
        
        # Auto-update status to in_progress if it was not_started
        if topic.status == "not_started":
            topic.status = "in_progress"
        
        # Add EXP to Pokémon if assigned
        if topic.pokemon_id:
            exp_gained = session_data.duration_minutes * EXP_PER_MINUTE
            old_level = topic.pokemon_level
            topic.pokemon_exp += exp_gained
            
            # Calculate new level
            new_level, _ = calculate_level_from_exp(topic.pokemon_exp)
            topic.pokemon_level = new_level
            
            # Check for evolution
            if new_level > old_level:
                evolution_check = check_evolution(topic.pokemon_id, new_level)
                if evolution_check:
                    # Evolve the Pokémon!
                    evolution_data = {
                        "evolved": True,
                        "from_name": topic.pokemon_name,
                        "from_id": topic.pokemon_id,
                        "to_name": evolution_check["evolves_to_name"],
                        "to_id": evolution_check["evolves_to_id"],
                        "at_level": new_level
                    }
                    
                    # Update topic with evolved Pokémon
                    topic.pokemon_id = evolution_check["evolves_to_id"]
                    topic.pokemon_name = evolution_check["evolves_to_name"]
                    topic.pokemon_sprite_url = evolution_check["evolves_to_sprite"]
    
    db.add(study_session)
    db.add(topic)
    db.commit()
    db.refresh(study_session)
    
    # Return session with evolution data if it happened
    response = study_session.dict()
    if evolution_data:
        response["evolution"] = evolution_data
    
    return response

@router.get("/", response_model=list[SessionResponse])
def get_sessions(topic_id: int = None, db: Session = Depends(get_session)):
    """Get all sessions, optionally filtered by topic_id"""
    query = select(StudySession)
    if topic_id:
        query = query.where(StudySession.topic_id == topic_id)
    sessions = db.exec(query).all()
    return sessions

@router.get("/{session_id}", response_model=SessionResponse)
def get_session(session_id: int, db: Session = Depends(get_session)):
    """Get a specific session"""
    session = db.get(StudySession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.delete("/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_session)):
    """Delete a session (removes it from history but doesn't update topic minutes)"""
    session = db.get(StudySession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    db.delete(session)
    db.commit()
    return {"message": "Session deleted successfully"}