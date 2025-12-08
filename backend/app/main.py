from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, crud
from .database import engine, SessionLocal, Base
from .routes import user
app = FastAPI()
app.include_router(user.router, prefix="/user", tags=["User"])


# @app.get("/ping")
# def ping():
#     return {"message": "pong"}

Base.metadata.create_all(bind=engine)

# Allow CORS from frontend
origins = [
    "http://localhost:5173",
    "https://frabjous-paletas-46f6e7.netlify.app",
    "https://crossdomain-recommender-production-4785.up.railway.app",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency for DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# @app.post("/register", response_model=schemas.UserResponse)
# def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
#     db_user = crud.get_user_by_email(db, user.email)
#     if db_user:
#         raise HTTPException(status_code=400, detail="Email already registered")
#     return crud.create_user(db, user)

@app.get("/")
def read_root():
    return {"status": "ok"}
