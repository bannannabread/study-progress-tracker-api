from fastapi import APIRouter
from ..pokemon.pokemon_utils import fetch_pokemon_data, STARTER_POKEMON
import random

router = APIRouter(prefix="/pokemon", tags=["Pokemon"])

@router.get("/starters")
def get_starters():
    """Get the three starter Pokémon (Bulbasaur, Charmander, Squirtle)"""
    starters = []
    for name, pokemon_id in STARTER_POKEMON.items():
        data = fetch_pokemon_data(pokemon_id)
        if data:
            starters.append(data)
    return starters

@router.get("/{pokemon_id}")
def get_pokemon(pokemon_id: int):
    """Get data for a specific Pokémon by ID"""
    data = fetch_pokemon_data(pokemon_id)
    if not data:
        return {"error": "Pokémon not found"}
    return data

@router.get("/random/encounter")
def random_encounter():
    """Safari Zone: Get a random Pokémon (1-151 for Gen 1)"""
    random_id = random.randint(1, 151)
    data = fetch_pokemon_data(random_id)
    return data if data else {"error": "Failed to find Pokémon"}