from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Department, User
from app.schemas import DepartmentCreate, DepartmentUpdate, DepartmentOut
from app.utils.auth import get_current_user, require_admin
from app.utils.helpers import log_activity

router = APIRouter(prefix="/departments", tags=["Departments"])


# Public endpoint - used by registration page
@router.get("/", response_model=List[DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()


# Admin only
@router.post("/", response_model=DepartmentOut, status_code=201)
def create_department(
    payload: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    existing = db.query(Department).filter(
        (Department.name == payload.name) |
        (Department.code == payload.code)
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Department name or code already exists"
        )

    dept = Department(**payload.dict())

    db.add(dept)
    db.commit()
    db.refresh(dept)

    log_activity(
        db,
        current_user.id,
        f"Created department: {dept.name}",
        "department",
        dept.id
    )

    return dept


@router.get("/{dept_id}", response_model=DepartmentOut)
def get_department(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dept = db.query(Department).filter(Department.id == dept_id).first()

    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    return dept


@router.put("/{dept_id}", response_model=DepartmentOut)
def update_department(
    dept_id: int,
    payload: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    dept = db.query(Department).filter(Department.id == dept_id).first()

    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    for field, value in payload.dict(exclude_none=True).items():
        setattr(dept, field, value)

    db.commit()
    db.refresh(dept)

    log_activity(
        db,
        current_user.id,
        f"Updated department: {dept.name}",
        "department",
        dept_id
    )

    return dept


@router.delete("/{dept_id}")
def delete_department(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    dept = db.query(Department).filter(Department.id == dept_id).first()

    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    log_activity(
        db,
        current_user.id,
        f"Deleted department: {dept.name}",
        "department",
        dept_id
    )

    db.delete(dept)
    db.commit()

    return {"message": "Department deleted successfully"}