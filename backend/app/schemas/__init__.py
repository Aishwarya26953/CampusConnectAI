from datetime import datetime, date, time
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, validator
from app.models import (
    UserRole, UserStatus, AttendanceStatus, EventStatus,
    ComplaintCategory, ComplaintStatus, ComplaintPriority,
    NotificationType, DayOfWeek
)


# ─────────────────────────────────────────────
# Auth Schemas
# ─────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole
    department_id: Optional[int] = None
    phone: Optional[str] = None
    student_id: Optional[str] = None
    faculty_id: Optional[str] = None
    semester: Optional[int] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        return v
    
    @validator('name')
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters long')
        return v.strip()


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class TokenData(BaseModel):
    user_id: Optional[int] = None


# ─────────────────────────────────────────────
# User Schemas
# ─────────────────────────────────────────────
class DepartmentMin(BaseModel):
    id: int
    name: str
    code: str

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    status: UserStatus
    department_id: Optional[int] = None
    department: Optional[DepartmentMin] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_image: Optional[str] = None
    student_id: Optional[str] = None
    faculty_id: Optional[str] = None
    semester: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    department_id: Optional[int] = None
    semester: Optional[int] = None


class UserStatusUpdate(BaseModel):
    status: UserStatus


# ─────────────────────────────────────────────
# Department Schemas
# ─────────────────────────────────────────────
class DepartmentCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    hod_id: Optional[int] = None


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    hod_id: Optional[int] = None


class DepartmentOut(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None
    hod_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# Classroom Schemas
# ─────────────────────────────────────────────
class ClassroomCreate(BaseModel):
    building: str
    room_number: str
    capacity: int
    facilities: Optional[List[str]] = []
    floor: Optional[int] = None
    is_available: bool = True


class ClassroomUpdate(BaseModel):
    building: Optional[str] = None
    room_number: Optional[str] = None
    capacity: Optional[int] = None
    facilities: Optional[List[str]] = None
    floor: Optional[int] = None
    is_available: Optional[bool] = None


class ClassroomOut(BaseModel):
    id: int
    building: str
    room_number: str
    capacity: int
    facilities: Optional[List[str]] = []
    floor: Optional[int] = None
    is_available: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# Timetable Schemas
# ─────────────────────────────────────────────
class TimetableCreate(BaseModel):
    subject: str
    faculty_id: int
    classroom_id: int
    department_id: int
    day: DayOfWeek
    start_time: time
    end_time: time
    semester: int = 1
    academic_year: str = "2025-2026"


class TimetableUpdate(BaseModel):
    subject: Optional[str] = None
    faculty_id: Optional[int] = None
    classroom_id: Optional[int] = None
    department_id: Optional[int] = None
    day: Optional[DayOfWeek] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    semester: Optional[int] = None
    academic_year: Optional[str] = None


class TimetableOut(BaseModel):
    id: int
    subject: str
    faculty_id: int
    classroom_id: int
    department_id: int
    day: DayOfWeek
    start_time: time
    end_time: time
    semester: int
    academic_year: str
    faculty: Optional[UserOut] = None
    classroom: Optional[ClassroomOut] = None
    department: Optional[DepartmentOut] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# Attendance Schemas
# ─────────────────────────────────────────────
class AttendanceRecord(BaseModel):
    student_id: int
    status: AttendanceStatus


class AttendanceMark(BaseModel):
    timetable_id: int
    date: date
    records: List[AttendanceRecord]


class AttendanceUpdate(BaseModel):
    status: AttendanceStatus


class AttendanceOut(BaseModel):
    id: int
    timetable_id: int
    student_id: int
    date: date
    status: AttendanceStatus
    marked_by: Optional[int] = None
    timetable: Optional[TimetableOut] = None
    student: Optional[UserOut] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AttendanceSummary(BaseModel):
    student_id: int
    total_classes: int
    present: int
    absent: int
    late: int
    percentage: float
    classes_needed_for_75: int


# ─────────────────────────────────────────────
# Event Schemas
# ─────────────────────────────────────────────
class EventCreate(BaseModel):
    title: str
    description: str
    venue: str
    event_date: datetime
    registration_deadline: Optional[datetime] = None
    max_participants: Optional[int] = None
    category: Optional[str] = None


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    venue: Optional[str] = None
    event_date: Optional[datetime] = None
    registration_deadline: Optional[datetime] = None
    max_participants: Optional[int] = None
    category: Optional[str] = None
    status: Optional[EventStatus] = None


class EventOut(BaseModel):
    id: int
    title: str
    description: str
    faculty_id: int
    venue: str
    event_date: datetime
    registration_deadline: Optional[datetime] = None
    max_participants: Optional[int] = None
    status: EventStatus
    category: Optional[str] = None
    image_url: Optional[str] = None
    faculty: Optional[UserOut] = None
    registration_count: int = 0
    is_registered: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# Complaint Schemas
# ─────────────────────────────────────────────
class ComplaintCreate(BaseModel):
    category: ComplaintCategory
    title: str
    description: str
    location: Optional[str] = None


class ComplaintUpdate(BaseModel):
    status: Optional[ComplaintStatus] = None
    assigned_to: Optional[int] = None
    resolution_note: Optional[str] = None


class ComplaintOut(BaseModel):
    id: int
    student_id: int
    category: ComplaintCategory
    title: str
    description: str
    status: ComplaintStatus
    ai_priority: Optional[ComplaintPriority] = None
    ai_priority_reason: Optional[str] = None
    assigned_to: Optional[int] = None
    resolution_note: Optional[str] = None
    location: Optional[str] = None
    student: Optional[UserOut] = None
    assigned_to_user: Optional[UserOut] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# Announcement Schemas
# ─────────────────────────────────────────────
class AnnouncementCreate(BaseModel):
    title: str
    content: str
    target_role: Optional[str] = "all"
    category: Optional[str] = None
    is_pinned: bool = False


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    target_role: Optional[str] = None
    category: Optional[str] = None
    is_pinned: Optional[bool] = None


class AnnouncementOut(BaseModel):
    id: int
    admin_id: int
    title: str
    content: str
    target_role: Optional[str] = None
    category: Optional[str] = None
    is_pinned: bool
    admin: Optional[UserOut] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# Notification Schemas
# ─────────────────────────────────────────────
class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: NotificationType
    is_read: bool
    related_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# Activity Log Schemas
# ─────────────────────────────────────────────
class ActivityLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    details: Optional[Any] = None
    ip_address: Optional[str] = None
    user: Optional[UserOut] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# Analytics Schemas
# ─────────────────────────────────────────────
class DashboardStats(BaseModel):
    total_students: int
    total_faculty: int
    total_departments: int
    total_classrooms: int
    total_events: int
    total_complaints: int
    pending_approvals: int
    active_complaints: int
    average_attendance: float


# ─────────────────────────────────────────────
# AI Assistant
# ─────────────────────────────────────────────
class AIMessage(BaseModel):
    message: str


class AIResponse(BaseModel):
    response: str
    suggestions: Optional[List[str]] = []


# ─────────────────────────────────────────────
# Classroom Recommendation
# ─────────────────────────────────────────────
class ClassroomRecommendRequest(BaseModel):
    required_capacity: int
    day: DayOfWeek
    start_time: time
    end_time: time
    required_facilities: Optional[List[str]] = []
