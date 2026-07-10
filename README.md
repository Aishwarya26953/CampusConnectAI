# CampusConnect AI – Smart Campus Management System

## About the Project

CampusConnect AI is a full-stack web application developed to make campus management easier and more organized.

The main idea of this project is to provide a single platform where students, faculty, and administrators can manage different campus activities.

The application provides separate dashboards based on the user role. Students can check attendance, events, announcements, and timetables. Faculty members can manage attendance and access academic information. Administrators can manage users, departments, classrooms, events, complaints, and other campus activities.

The project also includes an AI Assistant using the Google Gemini API to help users with their queries.

---

## Live Project

### Frontend

The frontend is deployed on Vercel.

https://campus-connect-ai-chi.vercel.app

### Backend

The backend API is deployed on Render.

https://campusconnectai-2.onrender.com

### API Documentation

Swagger API documentation is available at:

https://campusconnectai-2.onrender.com/docs

---

## Features

### User Authentication

- User registration and login
- JWT authentication
- Password hashing
- Role-based access
- Separate dashboards for Admin, Faculty, and Student
- Admin approval for newly registered users

### Admin Module

- View dashboard statistics
- Manage students and faculty
- Approve new user registrations
- Manage departments
- Manage classrooms
- Manage timetables
- Manage campus events
- Create announcements
- View complaints
- Manage notifications

### Faculty Module

- Faculty dashboard
- View assigned classes
- Manage student attendance
- View timetable
- View announcements
- View events
- Receive notifications

### Student Module

- Student dashboard
- View attendance
- View timetable
- View announcements
- Register for campus events
- Submit complaints
- Receive notifications
- Use the AI Assistant

### AI Assistant

- Integrated with Google Gemini API
- Users can ask questions through the application
- AI-generated responses are displayed in the student dashboard

---

## Technologies Used

### Frontend

- React.js
- Vite
- JavaScript
- React Router
- Axios
- CSS

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn

### Database

- PostgreSQL

### Authentication

- JWT
- Passlib
- bcrypt

### AI Integration

- Google Gemini API

### Deployment

- Vercel for frontend deployment
- Render for backend deployment
- GitHub for source code and version control

---

## Project Structure

```text
CampusConnectAI/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── admin.py
│   │   │   ├── users.py
│   │   │   ├── departments.py
│   │   │   ├── classrooms.py
│   │   │   ├── timetables.py
│   │   │   ├── attendance.py
│   │   │   ├── events.py
│   │   │   ├── complaints.py
│   │   │   ├── announcements.py
│   │   │   ├── notifications.py
│   │   │   └── ai_assistant.py
│   │   │
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## How to Run the Project Locally

### 1. Clone the Repository

```bash
git clone https://github.com/Aishwarya26953/CampusConnectAI.git
```

Move into the project directory:

```bash
cd CampusConnectAI
```

---

## Backend Setup

Move to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment:

```bash
venv\Scripts\activate
```

Install the required packages:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the backend folder and add the required environment variables:

```env
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

The backend will run on:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

Open another terminal and move to the frontend folder:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Run the frontend:

```bash
npm run dev
```

---

## Deployment Details

### Frontend Deployment

The frontend is deployed on Vercel.

Deployment settings:

```text
Root Directory: frontend
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

Live Frontend:

https://campus-connect-ai-chi.vercel.app

### Backend Deployment

The backend is deployed on Render.

Deployment settings:

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Live Backend:

https://campusconnectai-2.onrender.com

Swagger API Documentation:

https://campusconnectai-2.onrender.com/docs

---

## Challenges Faced

While developing this project, I faced some problems during backend and frontend deployment.

Some of the main problems were:

- Connecting the PostgreSQL database with the deployed backend
- Configuring environment variables correctly
- Fixing password hashing compatibility issues between Passlib and bcrypt
- Connecting the deployed frontend with the backend API
- Solving CORS errors between Vercel and Render
- Configuring the correct Python version for backend deployment

By solving these problems, I learned more about full-stack development, database connections, API integration, debugging, GitHub, and cloud deployment.

---

## What I Learned

Through this project, I learned:

- How to develop REST APIs using FastAPI
- How to build a frontend using React and Vite
- How to connect frontend and backend applications
- How to work with PostgreSQL databases
- How JWT authentication works
- How role-based access can be implemented
- How to integrate the Google Gemini API
- How to use Git and GitHub for version control
- How to deploy frontend applications on Vercel
- How to deploy backend applications on Render
- How to debug deployment and CORS issues

---

## Future Improvements

In the future, I would like to add:

- QR code-based attendance
- Face recognition attendance
- Mobile application
- Real-time chat between students and faculty
- Email notifications
- Push notifications
- Better AI-based student assistance
- Advanced analytics dashboard
- Automatic timetable generation

---

## Conclusion

CampusConnect AI is a project developed to simplify campus management by providing different features for students, faculty, and administrators in a single application.

This project helped me understand the complete process of full-stack application development, starting from frontend and backend development to database integration, authentication, AI integration, GitHub version control, and cloud deployment.

The project can be improved further by adding more automation, real-time features, and AI-based services.

---

## Developer

**M. A. Aishwarya**

Student Developer interested in Full-Stack Development, Python, Artificial Intelligence, and Machine Learning.

---

## Project Links

**GitHub Repository:**  
https://github.com/Aishwarya26953/CampusConnectAI

**Live Frontend:**  
https://campus-connect-ai-chi.vercel.app

**Backend API:**  
https://campusconnectai-2.onrender.com

**API Documentation:**  
https://campusconnectai-2.onrender.com/docs

---

## Support

If you like this project, you can give the repository a star.

Thank you for visiting my project!
