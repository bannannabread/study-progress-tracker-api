from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = "sqlite:///database.db"          # creates a sql file for data
engine = create_engine(DATABASE_URL, echo=True) # engine connects to database.db and sends sql commands and recieves data

def get_session():
    with Session(engine) as session:    # a session is an interaction with the database
        yield session                   # 

# This sets up a SQLite database file (database.db) if it doesn't exist,
# and creates an "engine" + session provider to communicate with it.
# The session allows routes to read from and write to the database safely.