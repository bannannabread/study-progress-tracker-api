from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import Topic
from app.schemas import TopicUpdate
from app.schemas import TopicCreate
from typing import Optional
from ..pokemon.pokemon_utils import (fetch_pokemon_data, calculate_level_from_exp, EXP_PER_MINUTE, STARTER_POKEMON)

router = APIRouter(prefix = "/topics", tags = ["Topics"])
# router creates all the routes used (post, get, get specific id) and sets that
# they will all start with /topics, also added a tag to group them together

@router.post("/")
def create_topic(topic_data: TopicCreate, pokemon_id: int = None, db: Session = Depends(get_session)):
    """Create a new topic with optional Pokemon assignment"""
    topic_dict = topic_data.dict()
    if pokemon_id:
        pokemon_data = fetch_pokemon_data(pokemon_id)
        if pokemon_data:
            topic_dict = {
                **topic_dict,
                "pokemon_id": pokemon_data["id"],
                "pokemon_name": pokemon_data["name"],
                "pokemon_sprite_url": pokemon_data["sprite_url"],
                "pokemon_level": 1,
                "pokemon_exp": 0
            }
    topic = Topic(**topic_dict)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic
# recieves new Topic object
# mark it to add to database, then adds it (commit)
# then reloads obj with its id and returns it as json

@router.get("/", response_model = list[Topic])
def list_topics(status: str = None, db: Session = Depends(get_session)):
    """Get all topics, optionally filtered by status"""
    query = select(Topic)
    if status:
        query = query.where(Topic.status == status)
    topics = db.exec(query).all()
    return topics

@router.get("/{topic_id}", response_model = Topic)
def get_topic(topic_id: int, db: Session = Depends(get_session)):
    """Get a specific topic"""
    topic = db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code = 404, detail = "Topic not found")
    return topic
# looks up topic by primary key (id)
# if doesnt exist, raises a 404 error
# otherwise, returns it

@router.patch("/{topic_id}", response_model = Topic)
def update_topic(topic_id: int, topic_data: TopicUpdate, db: Session = Depends(get_session)):
    """Update a topic"""
    topic = db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code = 404, detail = "Topic not found")

    # update certain fields
    update_data = topic_data.dict(exclude_unset = True)
    for key, value in update_data.items():
        setattr(topic, key, value)

    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic

@router.patch("/{topic_id}/assign-pokemon")
def assign_pokemon(topic_id: int, pokemon_id: int, db: Session = Depends(get_session)):
    """Assign a pokemon to a topic"""
    topic = db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code = 404, detail = "Topic not found")
    
    pokemon_data = fetch_pokemon_data(pokemon_id)
    if not pokemon_data:
        raise HTTPException(status_code = 404, detail = "Pokemon not found")

    topic.pokemon_id = pokemon_data["id"]
    topic.pokemon_name = pokemon_data["name"]
    topic.pokemon_sprite_url = pokemon_data["sprite_url"]
    topic.pokemon_level = 1
    topic.pokemon_exp = 0

    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic

@router.post("/{topic_id}/add-exp")
def add_exp_to_pokemon(topic_id: int, minutes: int, db: Session = Depends(get_session)):
    """
    Add EXP to topic's Pokémon based on study minutes.
    Automatically levels up if enough EXP.
    """
    topic = db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    if not topic.pokemon_id:
        raise HTTPException(status_code=400, detail="Topic has no Pokémon assigned")
    
    # Calculate EXP gained
    exp_gained = minutes * EXP_PER_MINUTE
    topic.pokemon_exp += exp_gained
    
    # Calculate new level
    new_level, exp_in_level = calculate_level_from_exp(topic.pokemon_exp)
    old_level = topic.pokemon_level
    topic.pokemon_level = new_level
    
    db.add(topic)
    db.commit()
    db.refresh(topic)
    
    return {
        "exp_gained": exp_gained,
        "total_exp": topic.pokemon_exp,
        "old_level": old_level,
        "new_level": new_level,
        "leveled_up": new_level > old_level
    }


@router.delete("/{topic_id}")
def delete_topic(topic_id: int, db: Session = Depends(get_session)):
    """Delete a topic"""
    topic = db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code = 404, detail = "Topic not found")

    db.delete(topic)
    db.commit()
    return { "message": "Topic deleted successfully" }

@router.get("/starters/list")
def get_starters():
    """Get the three starter pokemon"""
    starters = []
    for name, pokemon_id in STARTER_POKEMON.items():
        data = fetch_pokemon_data(pokemon_id)
        if data:
            starters.append(data)
    
    return starters

# topics.py defines the routes for managing Topic objects:
# - POST /topics: create a new topic in the database
# - GET /topics: return all topics
# - GET /topics/{topic_id}: return a single topic by id or 404 if not found
# Each route uses a database session injected via FastAPI's dependency system.

