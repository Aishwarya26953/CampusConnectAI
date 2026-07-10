from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import (
    auth, admin, users, departments, classrooms,
    timetables, attendance, events, complaints,
    announcements, notifications, ai_assistant
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CampusConnect AI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://campus-connect-ai-chi.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(users.router)
app.include_router(departments.router)
app.include_router(classrooms.router)
app.include_router(timetables.router)
app.include_router(attendance.router)
app.include_router(events.router)
app.include_router(complaints.router)
app.include_router(announcements.router)
app.include_router(notifications.router)
app.include_router(ai_assistant.router)


@app.get("/")
def root():
    return {"status": "running"}


@app.get("/health")
def health():
    return {"status": "healthy"}