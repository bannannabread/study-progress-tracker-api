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

#Format: {pokemon_id: (evolution_id, level_required)}
EVOLUTION_DATA = {
    # Gen 1 Starters
    1: (2, 16),    # Bulbasaur -> Ivysaur at 16
    2: (3, 32),    # Ivysaur -> Venusaur at 32
    4: (5, 16),    # Charmander -> Charmeleon at 16
    5: (6, 36),    # Charmeleon -> Charizard at 36
    7: (8, 16),    # Squirtle -> Wartortle at 16
    8: (9, 36),    # Wartortle -> Blastoise at 36
    
    # Common Pokémon evolutions
    10: (11, 7),   # Caterpie -> Metapod at 7
    11: (12, 10),  # Metapod -> Butterfree at 10
    13: (14, 7),   # Weedle -> Kakuna at 7
    14: (15, 10),  # Kakuna -> Beedrill at 10
    16: (17, 18),  # Pidgey -> Pidgeotto at 18
    17: (18, 36),  # Pidgeotto -> Pidgeot at 36
    19: (20, 20),  # Rattata -> Raticate at 20
    21: (22, 20),  # Spearow -> Fearow at 20
    23: (24, 22),  # Ekans -> Arbok at 22
    25: (26, 22),  # Pikachu -> Raichu (we'll use level for simplicity)
    27: (28, 22),  # Sandshrew -> Sandslash at 22
    29: (30, 16),  # Nidoran♀ -> Nidorina at 16
    30: (31, 36),  # Nidorina -> Nidoqueen (with stone, but we'll use level)
    32: (33, 16),  # Nidoran♂ -> Nidorino at 16
    33: (34, 36),  # Nidorino -> Nidoking
    35: (36, 36),  # Clefairy -> Clefable
    37: (38, 36),  # Vulpix -> Ninetales
    39: (40, 36),  # Jigglypuff -> Wigglytuff
    41: (42, 22),  # Zubat -> Golbat at 22
    43: (44, 21),  # Oddish -> Gloom at 21
    44: (45, 36),  # Gloom -> Vileplume
    46: (47, 24),  # Paras -> Parasect at 24
    48: (49, 31),  # Venonat -> Venomoth at 31
    50: (51, 26),  # Diglett -> Dugtrio at 26
    52: (53, 28),  # Meowth -> Persian at 28
    54: (55, 33),  # Psyduck -> Golduck at 33
    56: (57, 28),  # Mankey -> Primeape at 28
    58: (59, 36),  # Growlithe -> Arcanine
    60: (61, 25),  # Poliwag -> Poliwhirl at 25
    61: (62, 36),  # Poliwhirl -> Poliwrath
    63: (64, 16),  # Abra -> Kadabra at 16
    64: (65, 36),  # Kadabra -> Alakazam (normally trade)
    66: (67, 28),  # Machop -> Machoke at 28
    67: (68, 36),  # Machoke -> Machamp
    69: (70, 21),  # Bellsprout -> Weepinbell at 21
    70: (71, 36),  # Weepinbell -> Victreebel
    72: (73, 30),  # Tentacool -> Tentacruel at 30
    74: (75, 25),  # Geodude -> Graveler at 25
    75: (76, 36),  # Graveler -> Golem
    77: (78, 40),  # Ponyta -> Rapidash at 40
    79: (80, 37),  # Slowpoke -> Slowbro at 37
    81: (82, 30),  # Magnemite -> Magneton at 30
    84: (85, 31),  # Doduo -> Dodrio at 31
    86: (87, 34),  # Seel -> Dewgong at 34
    88: (89, 38),  # Grimer -> Muk at 38
    90: (91, 36),  # Shellder -> Cloyster
    92: (93, 25),  # Gastly -> Haunter at 25
    93: (94, 36),  # Haunter -> Gengar
    95: (208, 30), # Onix -> Steelix (Gen 2, using level)
    96: (97, 26),  # Drowzee -> Hypno at 26
    98: (99, 28),  # Krabby -> Kingler at 28
    100: (101, 30),# Voltorb -> Electrode at 30
    102: (103, 36),# Exeggcute -> Exeggutor
    104: (105, 28),# Cubone -> Marowak at 28
    108: (463, 33),# Lickitung -> Lickilicky (Gen 4)
    109: (110, 35),# Koffing -> Weezing at 35
    111: (112, 42),# Rhyhorn -> Rhydon at 42
    116: (117, 32),# Horsea -> Seadra at 32
    117: (230, 45),# Seadra -> Kingdra (Gen 2)
    118: (119, 33),# Goldeen -> Seaking at 33
    120: (121, 36),# Staryu -> Starmie
    123: (212, 30),# Scyther -> Scizor (Gen 2)
    129: (130, 20),# Magikarp -> Gyarados at 20
    133: (134, 20),# Eevee -> Vaporeon (water stone, using level)
    138: (139, 40),# Omanyte -> Omastar at 40
    140: (141, 40),# Kabuto -> Kabutops at 40
    147: (148, 30),# Dratini -> Dragonair at 30
    148: (149, 55),# Dragonair -> Dragonite at 55
}

def check_evolution(pokemon_id: int, current_level: int) -> Optional[dict]:
    """Check if a Pokemon should evolve based on data"""
    if pokemon_id not in EVOLUTION_DATA:
        return None

    evolution_id, required_level = EVOLUTION_DATA[pokemon_id]

    if current_level >= required_level:
        evolution_data = fetch_pokemon_data(evolution_id)
        if evolution_data:
            return {
                "evolves_to_id": evolution_id,
                "evolves_to_name": evolution_data["name"],
                "evolves_to_sprite": evolution_data["sprite_url"],
                "required_level": required_level
            }
    return None

