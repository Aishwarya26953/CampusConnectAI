from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import AIMessage, AIResponse
from app.utils.auth import get_current_user
from app.utils.ai import get_ai_response

router = APIRouter(prefix="/ai", tags=["AI Assistant"])


@router.post("/chat", response_model=AIResponse)
def chat_with_ai(
    payload: AIMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Build context about the user
    context = f"""
Name: {current_user.name}
Role: {current_user.role.value}
Email: {current_user.email}
"""
    if current_user.department:
        context += f"Department: {current_user.department.name}\n"
    if current_user.semester:
        context += f"Semester: {current_user.semester}\n"

    result = get_ai_response(payload.message, context)
    return AIResponse(
        response=result["response"],
        suggestions=result.get("suggestions", [])
    )
