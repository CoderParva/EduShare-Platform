# EduShare - Academic Collaboration Platform

A complete educational platform for students and teachers with file sharing, assignments, quizzes, discussion forum, and plagiarism detection.

---

## Overview

**EduShare** is a web-based platform that brings all essential educational tools into one place. Instead of using multiple websites for assignments, quizzes, and discussions, everything is available here.

### What It Does
- Secure Login - Students and teachers have separate accounts
- File Sharing - Upload files and share with a simple code
- Assignments - Teachers create, students submit, teachers grade
- Quizzes - Auto-graded quizzes with instant results
- Discussion Forum - Ask questions and help each other
- Plagiarism Checker - Check if work is original

---

## Technology Used

**Frontend:**
- React.js - For the user interface
- CSS - For styling
- JavaScript - For functionality

**Backend:**
- Node.js - Server runtime
- Express.js - Web framework
- Bcrypt - Password encryption
- Multer - File uploads

---

## How to Run

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend (in new terminal):**
```bash
cd frontend
npm install
npm start
```

### Step 2: Access Application
Open browser and go to: `http://localhost:3000`

---

## Project Structure
```
EduShare-Platform/
├── backend/
│   ├── server.js           # Main server file
│   ├── uploads/            # Uploaded files
│   ├── assignments/        # Assignment submissions
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   ├── App.js          # Main app
    │   └── App.css
    └── package.json
```

---

## Project Information

**Guide:** Dr. Manish Kumar Thakur  
**Institution:** Vellore Institute of Technology, Bhopal  
**Course:** DSN4092 - Capstone Project  
**Phase:** 2

---

## Features

### For Students:
- Register and login securely
- Submit assignments before deadline
- Take quizzes and get instant results
- Participate in subject-wise discussions
- Check documents for plagiarism
- Share files using unique codes

### For Teachers:
- Create assignments with deadlines
- Grade student submissions with feedback
- Create auto-graded quizzes
- Monitor discussion forums
- Track student performance

---

## Future Plans

- Add database (MongoDB) for permanent storage
- Deploy online (AWS/Heroku)
- Email notifications for deadlines
- Mobile app
- Video lectures
- Live classes

---

## How It Works

1. User registers with email and password (encrypted)
2. Login gives access to all modules
3. Students can submit work, take quizzes, ask questions
4. Teachers can create assignments, grade work, create quizzes
5. Everyone can share files and check plagiarism

---

## Main Modules

### 1. Authentication
- Secure registration and login
- Password hashing with bcrypt
- Session management

### 2. File Sharing
- Upload files (up to 100MB)
- Get unique 6-character code
- Files auto-delete after 24 hours

### 3. Assignments
- Teachers create assignments
- Students submit work
- Teachers grade with feedback
- Late submission tracking

### 4. Quizzes
- Multiple choice and true/false questions
- Timed quizzes with countdown
- Auto-grading with instant results
- Score history

### 5. Discussion Forum
- Subject-based categories
- Create threads and reply
- Upvote helpful answers
- View popular discussions

### 6. Plagiarism Checker
- Upload documents
- Text similarity analysis
- Percentage score
- Match details

---

## Quick Start

1. Clone repository
2. Install backend dependencies: `cd backend && npm install`
3. Install frontend dependencies: `cd frontend && npm install`
4. Start backend: `cd backend && npm start`
5. Start frontend: `cd frontend && npm start`
6. Open `http://localhost:3000` in browser

---

## License

MIT License - Free to use and modify

---

**VIT Bhopal - January 2026**