from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from app.database import engine
from app.routers import topics

app = FastAPI(title = "Study Progress Tracker") # creates a FastAPI application instance, app is a backend "app object"

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)    # creates all the database tables, if not already existing

app.include_router(topics.router)           # routers/topics is the group of routes (POST, GET, etc)

# main.py creates the FastAPI app, sets up the database tables on startup,
# and includes the routes defined in topics.py so the app can handle requests
# like GET /topics and POST /topics.