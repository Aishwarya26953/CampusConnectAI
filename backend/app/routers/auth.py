from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole, UserStatus, NotificationType
from app.schemas import UserRegister, UserLogin, Token
from app.utils.auth import hash_password, verify_password, create_access_token
from app.utils.helpers import log_activity, create_notification
from app.config import settings
import re

router = APIRouter(prefix="/auth", tags=["Authentication"])


def validate_password_strength(password: str):
    if len(password) < settings.PASSWORD_MIN_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Password must be at least {settings.PASSWORD_MIN_LENGTH} characters long"
        )

    if not re.search(r"[A-Z]", password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one uppercase letter"
        )

    if not re.search(r"[a-z]", password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one lowercase letter"
        )

    if not re.search(r"[0-9]", password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one number"
        )


@router.post("/register", response_model=dict, status_code=201)
def register(
    payload: UserRegister,
    request: Request,
    db: Session = Depends(get_db)
):
    print("\n========== REGISTER REQUEST ==========")
    print(payload)

    validate_password_strength(payload.password)

    existing = db.query(User).filter(User.email == payload.email).first()

    if existing:
        print("EMAIL ALREADY EXISTS")
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    if payload.role == UserRole.admin:
        raise HTTPException(
            status_code=400,
            detail="Admin account cannot be registered"
        )

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        status=UserStatus.pending,
        department_id=payload.department_id,
        phone=payload.phone,
        student_id=payload.student_id,
        faculty_id=payload.faculty_id,
        semester=payload.semester,
    )

    db.add(user)

    print("Saving user...")
    print("Name:", user.name)
    print("Email:", user.email)
    print("Role:", user.role)
    print("Status:", user.status)

    db.commit()
    db.refresh(user)

    print("USER SAVED SUCCESSFULLY")
    print("Database ID:", user.id)
    print("=====================================\n")

    log_activity(
        db,
        user.id,
        f"User registered as {payload.role.value}",
        "user",
        user.id,
        ip_address=request.client.host if request.client else None
    )

    admin = db.query(User).filter(User.role == UserRole.admin).first()

    if admin:
        create_notification(
            db,
            admin.id,
            "New Registration Request",
            f"{payload.name} has registered as {payload.role.value} and is awaiting approval.",
            NotificationType.registration,
            user.id
        )

    return {
        "message": "Registration successful. Waiting for admin approval.",
        "user_id": user.id
    }


@router.post("/login", response_model=Token)
def login(
    payload: UserLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    print("LOGIN:", payload.email)

    user = db.query(User).filter(User.email == payload.email).first()

    if not user:
        print("User not found")
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(payload.password, user.password_hash):
        print("Wrong password")
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if user.role != UserRole.admin:
        if user.status == UserStatus.pending:
            raise HTTPException(
                status_code=403,
                detail="Your account is pending admin approval"
            )

        if user.status == UserStatus.rejected:
            raise HTTPException(
                status_code=403,
                detail="Your account has been rejected"
            )

    token = create_access_token(
        {"sub": str(user.id)}
    )

    log_activity(
        db,
        user.id,
        "User logged in",
        "user",
        user.id,
        ip_address=request.client.host if request.client else None
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }