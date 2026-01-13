import requests
from typing import Optional

EXP_PER_MINUTE = 50

def get_exp_for_level(level: int) -> int:
    """Get total EXP needed to reach a level"""
    if level <= 1:
        return 0
    return level ** 3

def calculate_level_from_exp(exp: int) -> tuple[int, int]:
    """Calculate level & remaining EXP from total EXP in format: (level, exp_in_curr_level)"""
    level = 1
    while get_exp_for_level(level + 1) <= exp:
        level += 1

    exp_for_curr_level = get_exp_for_level(level)
    remaining_exp = exp - exp_for_curr_level
    return level, remaining_exp

def get_exp_for_next_level(current_level: int, current_exp: int) -> int:
    """Get how much exp needed until next level"""
    exp_for_next = get_exp_for_level(level + 1)
    exp_for_curr = get_exp_for_level(level)
    needed = exp_for_next - exp_for_curr
    exp_in_level = current_exp - exp_for_curr
    return needed - exp_in_level
def fetch_pokemon_data(pokemon_id: int) -> Optional[dict]:
    """Fetch Pokémon data from PokeAPI"""
    try:
        response = requests.get(f"https://pokeapi.co/api/v2/pokemon/{pokemon_id}")
        if response.status_code == 200:
            data = response.json()
            return {
                "id": data["id"],
                "name": data["name"].capitalize(),
                "sprite_url": data["sprites"]["front_default"],
            }
    except Exception as e:
        print(f"Error fetching Pokémon data: {e}")
    return None

STARTER_POKEMON = {
    "bulbasaur": 1,
    "charmander": 4,
    "squirtle": 7
}