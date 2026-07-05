"""
CampusConnect AI - Database Seeder
Seeds: 1 admin, 10 faculty, 100 students, 8 departments,
       15 classrooms, 20 events, 30 complaints, 10 announcements
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timedelta, date, time
import random
from faker import Faker
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import (
    User, UserRole, UserStatus, Department, Classroom, Timetable,
    Attendance, AttendanceStatus, Event, EventStatus, EventRegistration,
    Complaint, ComplaintCategory, ComplaintStatus, ComplaintPriority,
    Announcement, Notification, NotificationType, ActivityLog, DayOfWeek
)
from app.utils.auth import hash_password
from app.config import settings

fake = Faker()
random.seed(42)
Faker.seed(42)

DEPARTMENTS = [
    {"name": "Computer Science & Engineering", "code": "CSE"},
    {"name": "Electronics & Communication", "code": "ECE"},
    {"name": "Mechanical Engineering", "code": "ME"},
    {"name": "Civil Engineering", "code": "CE"},
    {"name": "Information Technology", "code": "IT"},
    {"name": "Electrical Engineering", "code": "EE"},
    {"name": "Business Administration", "code": "MBA"},
    {"name": "Applied Sciences", "code": "AS"},
]

BUILDINGS = ["Block A", "Block B", "Block C", "Science Block", "Tech Tower", "Innovation Hub"]
FACILITIES_OPTIONS = [
    ["Projector", "AC", "WiFi"],
    ["Projector", "AC", "WiFi", "Whiteboard"],
    ["AC", "WiFi", "Lab Equipment"],
    ["Projector", "WiFi"],
    ["AC", "Whiteboard", "WiFi"],
    ["Projector", "AC", "Smart Board", "WiFi"],
    ["Lab Equipment", "WiFi", "AC"],
    ["Projector", "AC"],
]

SUBJECTS = [
    "Data Structures & Algorithms", "Computer Networks", "Database Management",
    "Operating Systems", "Software Engineering", "Machine Learning",
    "Digital Electronics", "Signal Processing", "Control Systems",
    "Thermodynamics", "Fluid Mechanics", "Structural Analysis",
    "Surveying", "Business Analytics", "Quantum Physics",
    "Linear Algebra", "Probability & Statistics", "Web Technologies",
    "Cloud Computing", "Cybersecurity"
]

EVENT_DATA = [
    {"title": "National Hackathon 2025", "category": "Technical", "venue": "Innovation Hub"},
    {"title": "AI & ML Workshop", "category": "Workshop", "venue": "Tech Tower Lab"},
    {"title": "Campus Placement Drive - TCS", "category": "Placement", "venue": "Auditorium"},
    {"title": "Inter-College Robotics Competition", "category": "Technical", "venue": "Robotics Lab"},
    {"title": "Annual Sports Day", "category": "Sports", "venue": "Sports Complex"},
    {"title": "Cultural Fest - Harmony 2025", "category": "Cultural", "venue": "Open Ground"},
    {"title": "Research Paper Symposium", "category": "Academic", "venue": "Conference Hall"},
    {"title": "Cloud Computing Bootcamp", "category": "Workshop", "venue": "Block A Lab"},
    {"title": "Entrepreneurship Summit", "category": "Seminar", "venue": "Auditorium"},
    {"title": "Photography Contest", "category": "Cultural", "venue": "Art Gallery"},
    {"title": "Guest Lecture: Future of AI", "category": "Academic", "venue": "Seminar Hall"},
    {"title": "Blood Donation Camp", "category": "Social", "venue": "Medical Centre"},
    {"title": "Campus Placement - Infosys", "category": "Placement", "venue": "Auditorium"},
    {"title": "Debate Competition", "category": "Cultural", "venue": "Seminar Hall"},
    {"title": "Green Campus Initiative", "category": "Social", "venue": "Campus Grounds"},
    {"title": "DevOps Workshop", "category": "Workshop", "venue": "Tech Tower Lab"},
    {"title": "Mathematics Olympiad", "category": "Academic", "venue": "Block B"},
    {"title": "Alumni Meet 2025", "category": "Social", "venue": "Auditorium"},
    {"title": "Cybersecurity Awareness Week", "category": "Technical", "venue": "Block C"},
    {"title": "Design Thinking Sprint", "category": "Workshop", "venue": "Innovation Hub"},
]

COMPLAINT_DATA = [
    ("Projector not working in Lab 3", "The projector in Lab 3 Block A has been broken for 2 weeks", "electrical"),
    ("No water in Boys Hostel", "Water supply has been disrupted in the boys hostel for 3 days", "water"),
    ("WiFi down in Library", "Library WiFi has been intermittent for past week, affecting study sessions", "wifi"),
    ("Broken chairs in Classroom 201", "Multiple chairs in room 201 are broken and unsafe to sit on", "furniture"),
    ("Dirty washrooms Block C", "Washrooms in Block C 2nd floor are not cleaned regularly", "cleaning"),
    ("Short circuit in Lab 2", "There was a spark from one of the sockets in Lab 2, very dangerous", "electrical"),
    ("Leaking roof in Corridor", "The corridor near room 105 has a leaking roof during rain", "water"),
    ("WiFi not working in Hostel", "Hostel WiFi has been down for 5 days, students cannot access resources", "wifi"),
    ("Broken whiteboard markers", "All whiteboard markers in Block B are dry and need replacement", "other"),
    ("AC not working in CSE Dept", "Air conditioning in the CSE department office is broken", "electrical"),
    ("Tables damaged in seminar hall", "Several tables in the seminar hall have sharp broken edges", "furniture"),
    ("Toilet flush broken in Block A", "Multiple toilet flushes not working in Block A washrooms", "water"),
    ("Network printer offline", "The shared network printer has been offline for a week", "wifi"),
    ("Garbage not collected", "Garbage bins near Block D have not been emptied in 3 days", "cleaning"),
    ("Street lights not working", "Street lights in the parking area are not working, safety concern at night", "electrical"),
    ("Drinking water cooler broken", "Water cooler near the library entrance is out of service", "water"),
    ("WiFi password not updated", "The WiFi password posted on the notice board is outdated", "wifi"),
    ("Damaged floor tiles", "Floor tiles in the corridor are broken and pose a tripping hazard", "other"),
    ("Foul smell in basement", "There is a foul smell coming from the basement near the store room", "cleaning"),
    ("Power fluctuation in lab", "Frequent power fluctuations in the electronics lab damaging equipment", "electrical"),
    ("Chair broken in library", "Chair at reading table 5 in the library is broken", "furniture"),
    ("No hot water in hostel", "Hot water system in the hostel bathroom is not functioning", "water"),
    ("WiFi speed very slow", "WiFi speed in Block C is extremely slow, affecting online classes", "wifi"),
    ("Rat infestation in cafeteria", "Rats spotted in the cafeteria, urgent pest control needed", "cleaning"),
    ("Elevator not working", "The elevator in Block B has been out of service for a week", "other"),
    ("Fan not working in classroom 305", "Ceiling fan in room 305 is not working, very hot during afternoon classes", "electrical"),
    ("Water tap leaking", "Water tap in the boys washroom Block A is continuously leaking", "water"),
    ("No WiFi signal on 4th floor", "4th floor of Block C has no WiFi coverage", "wifi"),
    ("Mold on classroom walls", "Visible mold growth on the walls of rooms 401 and 402", "cleaning"),
    ("Projector cable damaged", "HDMI cable for the projector in seminar room is damaged", "other"),
]

ANNOUNCEMENTS = [
    ("🎉 Mid-Semester Exam Schedule Released", "The mid-semester examination schedule has been released. Students are advised to check their timetables and prepare accordingly. All exams will be conducted in the main examination hall.", "all"),
    ("📅 Diwali Holiday Notice", "The campus will remain closed from October 31 to November 5 on account of Diwali. Wish you all a happy and safe Diwali!", "all"),
    ("🏢 Campus Placement Drive - TCS & Infosys", "A major placement drive will be conducted on campus next week. Final year students from all departments are eligible. Register through the placement cell before the deadline.", "student"),
    ("📚 Library Hours Extended", "The library will now remain open until 11 PM on weekdays to support students during examination season. Please carry your ID cards.", "all"),
    ("🔬 Research Grants Available", "Faculty members are invited to apply for the annual research grant. Applications must be submitted by the end of this month.", "faculty"),
    ("⚠️ Campus WiFi Maintenance", "Campus WiFi will undergo scheduled maintenance this Saturday from 10 PM to 2 AM. Plan accordingly.", "all"),
    ("🎓 Convocation Ceremony 2025", "The annual convocation ceremony is scheduled for December 15, 2025. All graduating students must collect their gowns from the administrative office.", "student"),
    ("📝 Faculty Feedback Forms", "Annual faculty performance evaluation forms are now available. All faculty members must complete them by month end.", "faculty"),
    ("🏋️ New Sports Facilities", "The campus has added new sports facilities including a badminton court and table tennis area. Students can book slots through the sports office.", "student"),
    ("🌿 Green Campus Week", "CampusConnect celebrates Green Campus Week next week. Join activities including tree planting, waste segregation awareness, and energy conservation drives.", "all"),
]


def seed():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Clear existing data (except admin)
        print("🧹 Clearing existing data...")
        db.query(ActivityLog).delete()
        db.query(Notification).delete()
        db.query(Announcement).delete()
        db.query(Complaint).delete()
        db.query(EventRegistration).delete()
        db.query(Event).delete()
        db.query(Attendance).delete()
        db.query(Timetable).delete()
        db.query(Classroom).delete()
        db.query(User).filter(User.role != UserRole.admin).delete()
        db.query(Department).delete()
        db.commit()

        # ── Admin ─────────────────────────────────────
        print("👤 Creating admin...")
        admin = db.query(User).filter(User.role == UserRole.admin).first()
        if not admin:
            admin = User(
                name="Campus Administrator",
                email=settings.ADMIN_EMAIL,
                password_hash=hash_password(settings.ADMIN_PASSWORD),
                role=UserRole.admin,
                status=UserStatus.approved,
                phone="+91-9000000000",
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)

        # ── Departments ───────────────────────────────
        print("🏢 Creating departments...")
        departments = []
        for dept_data in DEPARTMENTS:
            dept = Department(name=dept_data["name"], code=dept_data["code"])
            db.add(dept)
            departments.append(dept)
        db.commit()
        for d in departments:
            db.refresh(d)

        # ── Faculty ───────────────────────────────────
        print("👨‍🏫 Creating 10 faculty members...")
        faculty_members = []
        faculty_names = [
            "Dr. Rajesh Kumar", "Dr. Priya Sharma", "Prof. Arun Mehta",
            "Dr. Sunita Patel", "Prof. Vikram Singh", "Dr. Anita Gupta",
            "Prof. Ravi Krishnan", "Dr. Meera Nair", "Prof. Suresh Reddy", "Dr. Kavita Joshi"
        ]
        for i, name in enumerate(faculty_names):
            fac = User(
                name=name,
                email=f"faculty{i+1}@campusconnect.edu",
                password_hash=hash_password("Faculty@123"),
                role=UserRole.faculty,
                status=UserStatus.approved,
                department_id=departments[i % len(departments)].id,
                faculty_id=f"FAC{2025001 + i}",
                phone=f"+91-{random.randint(7000000000, 9999999999)}",
            )
            db.add(fac)
            faculty_members.append(fac)
        db.commit()
        for f in faculty_members:
            db.refresh(f)

        # Set HODs
        for i, dept in enumerate(departments):
            if i < len(faculty_members):
                dept.hod_id = faculty_members[i].id
        db.commit()

        # ── Students ──────────────────────────────────
        print("🎓 Creating 100 students...")
        students = []
        for i in range(100):
            dept = random.choice(departments)
            student = User(
                name=fake.name(),
                email=f"student{i+1}@campusconnect.edu",
                password_hash=hash_password("Student@123"),
                role=UserRole.student,
                status=UserStatus.approved,
                department_id=dept.id,
                student_id=f"STU{2025001 + i}",
                phone=f"+91-{random.randint(7000000000, 9999999999)}",
                semester=random.choice([1, 2, 3, 4, 5, 6, 7, 8]),
                address=fake.address(),
            )
            db.add(student)
            students.append(student)
        db.commit()
        for s in students:
            db.refresh(s)

        # ── Classrooms ────────────────────────────────
        print("🏫 Creating 15 classrooms...")
        classrooms = []
        for i in range(15):
            room = Classroom(
                building=random.choice(BUILDINGS),
                room_number=f"{random.choice(['A', 'B', 'C', 'D'])}{101 + i}",
                capacity=random.choice([30, 40, 50, 60, 80, 100, 120]),
                facilities=random.choice(FACILITIES_OPTIONS),
                floor=random.randint(0, 4),
                is_available=True,
            )
            db.add(room)
            classrooms.append(room)
        db.commit()
        for r in classrooms:
            db.refresh(r)

        # ── Timetables ────────────────────────────────
        print("📅 Creating timetables...")
        time_slots = [
            (time(9, 0), time(10, 0)),
            (time(10, 0), time(11, 0)),
            (time(11, 0), time(12, 0)),
            (time(13, 0), time(14, 0)),
            (time(14, 0), time(15, 0)),
            (time(15, 0), time(16, 0)),
        ]
        days = list(DayOfWeek)
        timetables = []
        used_slots = set()

        for fac in faculty_members:
            for _ in range(4):
                day = random.choice(days)
                slot = random.choice(time_slots)
                room = random.choice(classrooms)
                slot_key = (room.id, day, slot[0])
                if slot_key not in used_slots:
                    used_slots.add(slot_key)
                    tt = Timetable(
                        subject=random.choice(SUBJECTS),
                        faculty_id=fac.id,
                        classroom_id=room.id,
                        department_id=fac.department_id,
                        day=day,
                        start_time=slot[0],
                        end_time=slot[1],
                        semester=random.choice([1, 2, 3, 4, 5, 6]),
                        academic_year="2025-2026",
                    )
                    db.add(tt)
                    timetables.append(tt)
        db.commit()
        for tt in timetables:
            db.refresh(tt)

        # ── Attendance ────────────────────────────────
        print("✅ Creating attendance records...")
        dept_students = {dept.id: [s for s in students if s.department_id == dept.id] for dept in departments}
        att_count = 0
        for tt in timetables[:20]:  # Limit to avoid too many records
            dept_s = dept_students.get(tt.department_id, students[:10])
            sample_students = dept_s[:min(20, len(dept_s))]
            for day_offset in range(30):
                att_date = date.today() - timedelta(days=30 - day_offset)
                for student in sample_students:
                    rand = random.random()
                    if rand < 0.75:
                        status = AttendanceStatus.present
                    elif rand < 0.90:
                        status = AttendanceStatus.absent
                    else:
                        status = AttendanceStatus.late
                    att = Attendance(
                        timetable_id=tt.id,
                        student_id=student.id,
                        date=att_date,
                        status=status,
                        marked_by=tt.faculty_id,
                    )
                    db.add(att)
                    att_count += 1
                    if att_count % 500 == 0:
                        db.commit()
        db.commit()
        print(f"   Created {att_count} attendance records")

        # ── Events ────────────────────────────────────
        print("🎉 Creating 20 events...")
        events = []
        for i, ev_data in enumerate(EVENT_DATA):
            fac = random.choice(faculty_members)
            ev_date = datetime.utcnow() + timedelta(days=random.randint(-10, 60))
            status = random.choice([EventStatus.approved, EventStatus.approved, EventStatus.approved, EventStatus.pending])
            event = Event(
                title=ev_data["title"],
                description=fake.paragraph(nb_sentences=4),
                faculty_id=fac.id,
                venue=ev_data["venue"],
                event_date=ev_date,
                registration_deadline=ev_date - timedelta(days=2),
                max_participants=random.choice([50, 100, 150, 200, None]),
                status=status,
                category=ev_data["category"],
            )
            db.add(event)
            events.append(event)
        db.commit()
        for e in events:
            db.refresh(e)

        # ── Event Registrations ───────────────────────
        print("📝 Creating event registrations...")
        for event in events:
            if event.status == EventStatus.approved:
                sample = random.sample(students, min(random.randint(10, 40), len(students)))
                for student in sample:
                    reg = EventRegistration(event_id=event.id, student_id=student.id)
                    db.add(reg)
        db.commit()

        # ── Complaints ────────────────────────────────
        print("📣 Creating 30 complaints...")
        priorities = [ComplaintPriority.high, ComplaintPriority.medium, ComplaintPriority.low]
        statuses = [ComplaintStatus.pending, ComplaintStatus.in_progress, ComplaintStatus.resolved]
        categories = list(ComplaintCategory)
        for i, (title, desc, cat) in enumerate(COMPLAINT_DATA):
            student = random.choice(students)
            complaint = Complaint(
                student_id=student.id,
                category=ComplaintCategory[cat],
                title=title,
                description=desc,
                status=random.choices(statuses, weights=[0.4, 0.35, 0.25])[0],
                ai_priority=random.choice(priorities),
                ai_priority_reason="Auto-classified during seeding",
                location=f"Block {random.choice(['A', 'B', 'C', 'D'])}, Room {random.randint(100, 500)}",
            )
            db.add(complaint)
        db.commit()

        # ── Announcements ─────────────────────────────
        print("📢 Creating 10 announcements...")
        for title, content, target in ANNOUNCEMENTS:
            ann = Announcement(
                admin_id=admin.id,
                title=title,
                content=content,
                target_role=target,
                category="General",
                is_pinned=random.choice([True, False]),
            )
            db.add(ann)
        db.commit()

        # ── Notifications ─────────────────────────────
        print("🔔 Creating sample notifications...")
        notif_messages = [
            ("Welcome to CampusConnect AI!", "Your account is set up and ready.", NotificationType.general),
            ("Attendance Warning", "Your attendance in Database Management is below 75%.", NotificationType.attendance),
            ("New Event: Hackathon 2025", "A new hackathon event is now open for registration.", NotificationType.event),
            ("Complaint Resolved", "Your complaint about WiFi has been resolved.", NotificationType.complaint),
        ]
        sample_users = students[:20] + faculty_members[:5]
        for user in sample_users:
            for title, msg, ntype in notif_messages[:random.randint(1, 4)]:
                notif = Notification(
                    user_id=user.id,
                    title=title,
                    message=msg,
                    type=ntype,
                    is_read=random.choice([True, False]),
                )
                db.add(notif)
        db.commit()

        # ── Activity Logs ─────────────────────────────
        print("📊 Creating activity logs...")
        log_actions = [
            "User logged in", "Marked attendance", "Raised complaint",
            "Registered for event", "Updated profile", "Viewed timetable"
        ]
        all_users = [admin] + faculty_members + students[:30]
        for user in all_users:
            for _ in range(random.randint(1, 5)):
                log = ActivityLog(
                    user_id=user.id,
                    action=random.choice(log_actions),
                    entity_type=random.choice(["attendance", "event", "complaint", "user"]),
                    entity_id=random.randint(1, 50),
                    created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30)),
                )
                db.add(log)
        db.commit()

        print("\n" + "="*60)
        print("✅ DATABASE SEEDED SUCCESSFULLY!")
        print("="*60)
        print(f"👤 Admin: {settings.ADMIN_EMAIL} / {settings.ADMIN_PASSWORD}")
        print(f"👨‍🏫 Faculty: faculty1@campusconnect.edu / Faculty@123")
        print(f"🎓 Student: student1@campusconnect.edu / Student@123")
        print(f"🏢 Departments: {len(departments)}")
        print(f"🏫 Classrooms: {len(classrooms)}")
        print(f"📅 Timetable entries: {len(timetables)}")
        print(f"✅ Attendance records: {att_count}")
        print(f"🎉 Events: {len(events)}")
        print(f"📣 Complaints: 30")
        print(f"📢 Announcements: 10")
        print("="*60)

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
