import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Enum, ForeignKey,
    Text, Float, JSON, Date, Time
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    faculty = "faculty"
    student = "student"


class UserStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"
    late = "late"


class EventStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    completed = "completed"


class ComplaintCategory(str, enum.Enum):
    electrical = "electrical"
    wifi = "wifi"
    furniture = "furniture"
    water = "water"
    cleaning = "cleaning"
    other = "other"


class ComplaintStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    resolved = "resolved"


class ComplaintPriority(str, enum.Enum):
    high = "high"
    medium = "medium"
    low = "low"


class NotificationType(str, enum.Enum):
    registration = "registration"
    attendance = "attendance"
    complaint = "complaint"
    event = "event"
    announcement = "announcement"
    general = "general"


class DayOfWeek(str, enum.Enum):
    monday = "monday"
    tuesday = "tuesday"
    wednesday = "wednesday"
    thursday = "thursday"
    friday = "friday"
    saturday = "saturday"


# ─────────────────────────────────────────────
# User
# ─────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.student)
    status = Column(Enum(UserStatus), nullable=False, default=UserStatus.pending)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    profile_image = Column(String(500), nullable=True)
    student_id = Column(String(50), nullable=True, unique=True)
    faculty_id = Column(String(50), nullable=True, unique=True)
    semester = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    department = relationship("Department", back_populates="users", foreign_keys=[department_id])
    attendance_records = relationship("Attendance", back_populates="student", foreign_keys="Attendance.student_id")
    marked_attendance = relationship("Attendance", back_populates="marked_by_faculty", foreign_keys="Attendance.marked_by")
    event_registrations = relationship("EventRegistration", back_populates="student")
    complaints = relationship("Complaint", back_populates="student", foreign_keys="Complaint.student_id")
    assigned_complaints = relationship("Complaint", back_populates="assigned_to_user", foreign_keys="Complaint.assigned_to")
    announcements = relationship("Announcement", back_populates="admin")
    notifications = relationship("Notification", back_populates="user")
    activity_logs = relationship("ActivityLog", back_populates="user")
    timetables = relationship("Timetable", back_populates="faculty")
    created_events = relationship("Event", back_populates="faculty")


# ─────────────────────────────────────────────
# Department
# ─────────────────────────────────────────────
class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, unique=True)
    code = Column(String(20), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    hod_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    users = relationship("User", back_populates="department", foreign_keys="User.department_id")
    hod = relationship("User", foreign_keys=[hod_id])
    timetables = relationship("Timetable", back_populates="department")


# ─────────────────────────────────────────────
# Classroom
# ─────────────────────────────────────────────
class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, index=True)
    building = Column(String(100), nullable=False)
    room_number = Column(String(50), nullable=False, unique=True)
    capacity = Column(Integer, nullable=False)
    facilities = Column(JSON, nullable=True)
    is_available = Column(Boolean, default=True)
    floor = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    timetables = relationship("Timetable", back_populates="classroom")


# ─────────────────────────────────────────────
# Timetable
# ─────────────────────────────────────────────
class Timetable(Base):
    __tablename__ = "timetables"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String(200), nullable=False)
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    day = Column(Enum(DayOfWeek), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    semester = Column(Integer, nullable=False, default=1)
    academic_year = Column(String(20), nullable=False, default="2025-2026")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    faculty = relationship("User", back_populates="timetables")
    classroom = relationship("Classroom", back_populates="timetables")
    department = relationship("Department", back_populates="timetables")
    attendance = relationship("Attendance", back_populates="timetable")


# ─────────────────────────────────────────────
# Attendance
# ─────────────────────────────────────────────
class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    timetable_id = Column(Integer, ForeignKey("timetables.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatus), nullable=False, default=AttendanceStatus.absent)
    marked_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    timetable = relationship("Timetable", back_populates="attendance")
    student = relationship("User", back_populates="attendance_records", foreign_keys=[student_id])
    marked_by_faculty = relationship("User", back_populates="marked_attendance", foreign_keys=[marked_by])


# ─────────────────────────────────────────────
# Event
# ─────────────────────────────────────────────
class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    venue = Column(String(300), nullable=False)
    event_date = Column(DateTime(timezone=True), nullable=False)
    registration_deadline = Column(DateTime(timezone=True), nullable=True)
    max_participants = Column(Integer, nullable=True)
    status = Column(Enum(EventStatus), nullable=False, default=EventStatus.pending)
    category = Column(String(100), nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    faculty = relationship("User", back_populates="created_events")
    registrations = relationship("EventRegistration", back_populates="event")


# ─────────────────────────────────────────────
# Event Registration
# ─────────────────────────────────────────────
class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    registered_at = Column(DateTime(timezone=True), server_default=func.now())

    event = relationship("Event", back_populates="registrations")
    student = relationship("User", back_populates="event_registrations")


# ─────────────────────────────────────────────
# Complaint
# ─────────────────────────────────────────────
class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(Enum(ComplaintCategory), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(ComplaintStatus), nullable=False, default=ComplaintStatus.pending)
    ai_priority = Column(Enum(ComplaintPriority), nullable=True)
    ai_priority_reason = Column(Text, nullable=True)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    resolution_note = Column(Text, nullable=True)
    location = Column(String(300), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    student = relationship("User", back_populates="complaints", foreign_keys=[student_id])
    assigned_to_user = relationship("User", back_populates="assigned_complaints", foreign_keys=[assigned_to])


# ─────────────────────────────────────────────
# Announcement
# ─────────────────────────────────────────────
class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(300), nullable=False)
    content = Column(Text, nullable=False)
    target_role = Column(String(50), nullable=True)  # 'all', 'faculty', 'student'
    category = Column(String(100), nullable=True)
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    admin = relationship("User", back_populates="announcements")


# ─────────────────────────────────────────────
# Notification
# ─────────────────────────────────────────────
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(300), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), nullable=False, default=NotificationType.general)
    is_read = Column(Boolean, default=False)
    related_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")


# ─────────────────────────────────────────────
# Activity Log
# ─────────────────────────────────────────────
class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(300), nullable=False)
    entity_type = Column(String(100), nullable=True)
    entity_id = Column(Integer, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="activity_logs")
