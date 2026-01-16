# Studymon

A gamified study tracker that combines productivity with Pokémon! Train your Pokémon by studying. The more you learn, the stronger your Pokémon become.

![Studymon Banner](https://via.placeholder.com/800x200/3b82f6/ffffff?text=Studymon+-+Study+Tracker+Meets+Pokemon)

## Features

### Core Functionality
- **Study Timer** - Track your study sessions with a timer
- **Subject Management** - Create and organize multiple study subjects
- **Session History** - View all your past study sessions
- **Statistics Dashboard** - Visualize your study progress with charts and graphs

### Pokémon Integration
- **Starter Selection** - Choose between Bulbasaur, Charmander, or Squirtle for your first subject
- **Safari Zone** - Catch random Pokémon for new subjects (Gen 1 Pokémon only currently)
- **EXP System** - Earn 50 EXP per minute of studying
- **Leveling** - Pokémon level up as you study more
- **Evolution** - Pokémon automatically evolve at certain levels
- **Ace Pokémon Display** - Top bar shows your highest-level Pokémon

### Progress Tracking
- **EXP Bars** - Visual progress bars showing how close you are to the next level
- **Study Time** - Total time spent on each subject
- **Subject Status** - Track subjects as not started, in progress, or completed
- **Session Filtering** - Filter history by subject

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLModel** - SQL database ORM with Pydantic integration
- **SQLite** - Lightweight database
- **PokéAPI** - External API for Pokémon data

### Frontend
- **React** - UI library
- **JavaScript (ES6+)** - Programming language
- **CSS3** - Styling with custom animations
- **Fetch API** - HTTP requests

## Installation

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd study-tracker
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Python dependencies**
```bash
pip install fastapi uvicorn sqlmodel requests
```

4. **Run the backend server**
```bash
uvicorn app.main:app --reload
or
python -m uvicorn app.main:app --reload

```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd study-tracker-frontend  # or wherever your React app is
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

Frontend will be available at `http://localhost:3000`

## Project Structure

```
study-tracker/
├── app/
│   ├── main.py                 # FastAPI app entry point
│   ├── database.py             # Database configuration
│   ├── models.py               # SQLModel database models
│   ├── schemas.py              # Pydantic schemas for topics
│   ├── session_schemas.py      # Pydantic schemas for sessions
│   ├── pokemon/
│   │   └── pokemon_utils.py    # Pokémon utilities and evolution logic
│   └── routers/
│       ├── topics.py           # Topic/subject routes
│       ├── sessions.py         # Study session routes
│       └── pokemon.py          # Pokémon-specific routes
├── database.db                 # SQLite database file
└── src/                        # React frontend
    ├── components/
    │   ├── subjects/
    │   │   ├── SubjectsList.jsx
    │   │   └── SubjectForm.jsx
    │   ├── timer/
    │   │   └── Timer.jsx
    │   ├── history/
    │   │   └── History.jsx
    │   ├── statistics/
    │   │   └── Statistics.jsx
    │   ├── StarterSelection.jsx
    │   ├── AcePokemonBar.jsx
    │   └── EvolutionNotification.jsx
    ├── App.jsx
    └── App.css
```

## How to Use

### First Time Setup
1. Launch the app
2. Choose your starter Pokémon (Bulbasaur, Charmander, or Squirtle)
3. Create your first subject

### Adding New Subjects
1. Click "Add Subject" on the Subjects tab
2. Enter subject name and description
3. Click "Enter Safari Zone" to find a Pokémon
4. Choose from 3 random Pokémon encounters
5. Create your subject with your chosen Pokémon

### Studying
1. Go to the Timer tab
2. Select a subject
3. Click "Start" to begin timing
4. Study!
5. Click "Stop & Save" when done
6. Your Pokémon gains EXP automatically

### Evolution
- Pokémon evolve automatically at specific levels
- Evolution animations trigger when you complete a study session
- Example: Charmander evolves into Charmeleon at level 16

## API Endpoints

### Topics
- `POST /topics/` - Create a new topic
- `GET /topics/` - Get all topics
- `GET /topics/{id}` - Get specific topic
- `PATCH /topics/{id}` - Update topic
- `DELETE /topics/{id}` - Delete topic
- `PATCH /topics/{id}/assign-pokemon` - Assign Pokémon to topic

### Sessions
- `POST /sessions/start` - Start study session
- `POST /sessions/{id}/end` - End study session (triggers evolution check)
- `GET /sessions/` - Get all sessions
- `GET /sessions/{id}` - Get specific session
- `DELETE /sessions/{id}` - Delete session

### Pokémon
- `GET /pokemon/starters` - Get starter Pokémon (Bulbasaur, Charmander, Squirtle)
- `GET /pokemon/{id}` - Get specific Pokémon data
- `GET /pokemon/random/encounter` - Get random Pokémon (Safari Zone)

## Customization

### Adjusting EXP Rate
In `app/pokemon/pokemon_utils.py`:
```python
EXP_PER_MINUTE = 50  # Change this value
```

### Evolution Levels
Edit `EVOLUTION_DATA` dictionary in `app/pokemon/pokemon_utils.py` to add or modify evolution requirements.

### Pokémon Range
Modify the Safari Zone range in `app/routers/pokemon.py`:
```python
random_id = random.randint(1, 151)  # Currently Gen 1 only
```

## Troubleshooting

### Backend won't start
- Make sure Python virtual environment is activated
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify port 8000 is not already in use

### Frontend won't start
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Check that backend is running on port 8000
- Verify port 3000 is not already in use

### Database issues
- Delete `database.db` to reset the database
- Restart the backend server to recreate tables

### Evolution not showing
- Evolution only triggers when using the Timer UI, not the API docs
- Check browser console (F12) for errors
- Make sure `EvolutionNotification.jsx` is properly imported

## Future Enhancements

- [ ] Sound effects for evolutions and level-ups
- [ ] Pokédex to track all caught Pokémon
- [ ] Trading system between subjects
- [ ] Achievements/badges for study milestones
- [ ] Dark mode toggle
- [ ] Mobile app version
- [ ] Multi-user support with authentication
- [ ] Study streaks and daily goals
- [ ] Shiny Pokémon variants (rare encounters)

## License

MIT License - feel free to use this project however you'd like!

## Acknowledgments

- [PokéAPI](https://pokeapi.co/) for Pokémon data and sprites
- Game Freak and Nintendo for creating Pokémon
- FastAPI and React communities for excellent documentation
- My friends, for pushing me to do my best in everything

## Author
Created with ❤️ by Megan Mae Jacob

---

**Happy Studying! Train hard and catch 'em all!**