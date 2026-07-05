from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import (
    auth, admin, users, departments, classrooms,
    timetables, attendance, events, complaints,
    announcements, notifications, ai_assistant
)

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CampusConnect AI",
    description="Smart Campus Management System API",
    version="1.0.0",
    contact={"name": "CampusConnect AI Team"},
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
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


@app.get("/", tags=["Root"])
def root():
    return {
        "name": "CampusConnect AI",
        "version": "1.0.0",
        "tagline": "Smart Campus. Smart Management. Smart Future.",
        "docs": "/docs",
        "status": "running",
    }


@app.get("/health", tags=["Root"])
def health():
    return {"status": "healthy"}
