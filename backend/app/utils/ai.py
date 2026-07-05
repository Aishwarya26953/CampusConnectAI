import json
from typing import Optional

import google.generativeai as genai

from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

CAMPUS_SYSTEM_PROMPT = """
You are CampusConnect AI Assistant, an intelligent helper for a Smart Campus Management System.

You help students, faculty, and administrators with:
- Finding classrooms and facilities
- Answering attendance questions
- Providing event information
- Checking complaint status
- Explaining campus rules
- Helping users navigate the system

Campus Rules:
- Minimum attendance required: 75%
- Students below 75% receive attendance warnings
- Events require faculty creation and admin approval
- Complaint categories: electrical, wifi, furniture, water, cleaning, other
- Registration requires admin approval before login

Be friendly, concise, and helpful.
"""


def get_ai_response(user_message: str, context: Optional[str] = None) -> dict:
    """Generate AI response."""

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")

        prompt = CAMPUS_SYSTEM_PROMPT

        if context:
            prompt += f"\n\nUser Context:\n{context}"

        prompt += f"\n\nUser Question:\n{user_message}"

        response = model.generate_content(prompt)

        text = response.text

        msg = user_message.lower()

        if "attendance" in msg:
            suggestions = [
                "Check my attendance percentage",
                "View attendance history",
                "How many classes do I need?"
            ]
        elif "event" in msg:
            suggestions = [
                "Upcoming events",
                "Register for event",
                "Event schedule"
            ]
        elif "complaint" in msg:
            suggestions = [
                "Raise complaint",
                "Complaint status",
                "View complaints"
            ]
        else:
            suggestions = [
                "Dashboard",
                "Announcements",
                "Notifications"
            ]

        return {
            "response": text,
            "suggestions": suggestions
        }

    except Exception as e:
        return {
            "response": f"I'm having trouble connecting to the AI service.\n\nError: {str(e)}",
            "suggestions": [
                "Dashboard",
                "Announcements",
                "Contact Admin"
            ]
        }


def predict_complaint_priority(title: str, description: str, category: str) -> dict:
    """Predict complaint priority."""

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")

        prompt = f"""
You are an expert campus administrator.

Complaint Category: {category}

Title:
{title}

Description:
{description}

Return ONLY JSON.

{{
    "priority":"high|medium|low",
    "reason":"short explanation"
}}
"""

        response = model.generate_content(prompt)

        text = response.text.strip()

        if text.startswith("```"):
            text = text.replace("```json", "").replace("```", "").strip()

        return json.loads(text)

    except Exception:
        return {
            "priority": "medium",
            "reason": "Auto-classified as medium priority."
        }