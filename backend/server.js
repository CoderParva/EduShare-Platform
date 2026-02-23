const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const stringSimilarity = require('string-similarity');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create directories
const uploadsDir = path.join(__dirname, 'uploads');
const assignmentsDir = path.join(__dirname, 'assignments');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(assignmentsDir)) fs.mkdirSync(assignmentsDir);

// ==================== DATA STORES ====================
const fileStore = new Map();
const assignments = new Map();
const submissions = new Map();
const quizzes = new Map();
const quizAttempts = new Map();
const forumThreads = new Map();
const forumReplies = new Map();
const users = new Map();
const sessions = new Map();

// ==================== HELPER FUNCTIONS ====================
function generateCode() {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
}

function generateId() {
    return crypto.randomBytes(8).toString('hex');
}

// ==================== FILE UPLOAD CONFIG ====================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = req.baseUrl && req.baseUrl.includes('assignment') ? assignmentsDir : uploadsDir;
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueId = crypto.randomBytes(8).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueId}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }
});

// ==================== USER AUTHENTICATION ====================

// Register User
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name, role } = req.body;

    try {
        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = Array.from(users.values()).find(u => u.email === email.toLowerCase());
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userId = generateId();
        const user = {
            id: userId,
            email: email.toLowerCase(),
            password: hashedPassword,
            name,
            role,
            createdAt: new Date()
        };

        users.set(userId, user);

        const sessionToken = crypto.randomBytes(32).toString('hex');
        sessions.set(sessionToken, {
            userId,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        res.json({
            success: true,
            message: 'Registration successful',
            token: sessionToken,
            user: {
                id: userId,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = Array.from(users.values()).find(u => u.email === email.toLowerCase());
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const sessionToken = crypto.randomBytes(32).toString('hex');
        sessions.set(sessionToken, {
            userId: user.id,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        res.json({
            success: true,
            message: 'Login successful',
            token: sessionToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Verify Session
app.get('/api/auth/verify', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const session = sessions.get(token);
    if (!session) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    if (new Date() > session.expiresAt) {
        sessions.delete(token);
        return res.status(401).json({ error: 'Session expired' });
    }

    const user = users.get(session.userId);
    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }

    res.json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        }
    });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
        sessions.delete(token);
    }

    res.json({ success: true, message: 'Logged out successfully' });
});

// ==================== FILE SHARING ====================
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const code = generateCode();
        const fileData = {
            code: code,
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadTime: new Date(),
            expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };

        fileStore.set(code, fileData);

        setTimeout(() => {
            const filePath = path.join(uploadsDir, fileData.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            fileStore.delete(code);
        }, 24 * 60 * 60 * 1000);

        res.json({
            success: true,
            code: code,
            filename: req.file.originalname,
            size: req.file.size,
            expiryTime: fileData.expiryTime
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

app.get('/api/fileinfo/:code', (req, res) => {
    const code = req.params.code.toUpperCase();
    const fileData = fileStore.get(code);

    if (!fileData) {
        return res.status(404).json({ error: 'File not found' });
    }

    if (new Date() > fileData.expiryTime) {
        fileStore.delete(code);
        return res.status(410).json({ error: 'File has expired' });
    }

    res.json({
        filename: fileData.originalName,
        size: fileData.size,
        uploadTime: fileData.uploadTime,
        expiryTime: fileData.expiryTime
    });
});

app.get('/api/download/:code', (req, res) => {
    const code = req.params.code.toUpperCase();
    const fileData = fileStore.get(code);

    if (!fileData) {
        return res.status(404).json({ error: 'File not found or expired' });
    }

    if (new Date() > fileData.expiryTime) {
        fileStore.delete(code);
        return res.status(410).json({ error: 'File has expired' });
    }

    const filePath = path.join(uploadsDir, fileData.filename);
    
    if (!fs.existsSync(filePath)) {
        fileStore.delete(code);
        return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, fileData.originalName);
});

// ==================== ASSIGNMENTS ====================
app.post('/api/assignments/create', (req, res) => {
    const { teacherId, teacherName, title, description, subject, deadline, maxMarks } = req.body;
    
    const assignmentId = generateId();
    const assignment = {
        id: assignmentId,
        teacherId,
        teacherName,
        title,
        description,
        subject,
        deadline: new Date(deadline),
        maxMarks: parseInt(maxMarks),
        createdAt: new Date(),
        submissions: []
    };
    
    assignments.set(assignmentId, assignment);
    
    res.json({ 
        success: true, 
        assignmentId,
        message: 'Assignment created successfully' 
    });
});

app.get('/api/assignments/list', (req, res) => {
    const assignmentList = Array.from(assignments.values())
        .map(a => ({
            id: a.id,
            teacherName: a.teacherName,
            title: a.title,
            subject: a.subject,
            deadline: a.deadline,
            maxMarks: a.maxMarks,
            submissionCount: a.submissions.length,
            createdAt: a.createdAt
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(assignmentList);
});

app.get('/api/assignments/:id', (req, res) => {
    const assignment = assignments.get(req.params.id);
    
    if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
    }
    
    res.json(assignment);
});

app.post('/api/assignments/:id/submit', upload.single('file'), (req, res) => {
    const assignmentId = req.params.id;
    const { studentId, studentName } = req.body;
    
    const assignment = assignments.get(assignmentId);
    if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
    }
    
    const submissionKey = `${assignmentId}-${studentId}`;
    if (submissions.has(submissionKey)) {
        return res.status(400).json({ error: 'You have already submitted this assignment' });
    }
    
    const now = new Date();
    const isLate = now > assignment.deadline;
    
    const submissionId = generateId();
    const submission = {
        id: submissionId,
        assignmentId,
        studentId,
        studentName,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        submittedAt: now,
        marks: null,
        feedback: '',
        status: isLate ? 'late' : 'pending'
    };
    
    submissions.set(submissionKey, submission);
    assignment.submissions.push(submissionId);
    
    res.json({ 
        success: true, 
        submissionId,
        status: submission.status,
        message: isLate ? 'Submitted late - may be penalized' : 'Submitted successfully'
    });
});

app.get('/api/assignments/:id/submissions', (req, res) => {
    const assignmentId = req.params.id;
    
    const submissionList = Array.from(submissions.values())
        .filter(s => s.assignmentId === assignmentId)
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    res.json(submissionList);
});

app.post('/api/submissions/:id/grade', (req, res) => {
    const { marks, feedback } = req.body;
    const submissionId = req.params.id;
    
    const submissionKey = Array.from(submissions.keys())
        .find(key => submissions.get(key).id === submissionId);
    
    const submission = submissions.get(submissionKey);
    if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
    }
    
    submission.marks = parseInt(marks);
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedAt = new Date();
    
    res.json({ 
        success: true, 
        message: 'Graded successfully' 
    });
});

// ==================== QUIZZES ====================
app.post('/api/quizzes/create', (req, res) => {
    const { teacherId, teacherName, title, subject, duration, questions } = req.body;
    
    const quizId = generateId();
    const quiz = {
        id: quizId,
        teacherId,
        teacherName,
        title,
        subject,
        duration: parseInt(duration),
        questions,
        createdAt: new Date(),
        attempts: 0
    };
    
    quizzes.set(quizId, quiz);
    
    res.json({ 
        success: true, 
        quizId,
        message: 'Quiz created successfully' 
    });
});

app.get('/api/quizzes/list', (req, res) => {
    const quizList = Array.from(quizzes.values())
        .map(q => ({
            id: q.id,
            teacherName: q.teacherName,
            title: q.title,
            subject: q.subject,
            duration: q.duration,
            questionCount: q.questions.length,
            attempts: q.attempts,
            createdAt: q.createdAt
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(quizList);
});

app.get('/api/quizzes/:id', (req, res) => {
    const quiz = quizzes.get(req.params.id);
    
    if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
    }
    
    const quizData = {
        ...quiz,
        questions: quiz.questions.map(q => ({
            id: q.id,
            question: q.question,
            type: q.type,
            options: q.options,
            marks: q.marks
        }))
    };
    
    res.json(quizData);
});

app.post('/api/quizzes/:id/submit', (req, res) => {
    const quizId = req.params.id;
    const { studentId, studentName, answers } = req.body;
    
    const quiz = quizzes.get(quizId);
    if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
    }
    
    let totalMarks = 0;
    let scoredMarks = 0;
    const results = [];
    
    quiz.questions.forEach((question) => {
        totalMarks += question.marks;
        const studentAnswer = answers[question.id];
        const isCorrect = studentAnswer === question.correctAnswer;
        
        if (isCorrect) {
            scoredMarks += question.marks;
        }
        
        results.push({
            questionId: question.id,
            question: question.question,
            studentAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect,
            marks: isCorrect ? question.marks : 0
        });
    });
    
    const attemptId = generateId();
    const attempt = {
        id: attemptId,
        quizId,
        studentId,
        studentName,
        scoredMarks,
        totalMarks,
        percentage: ((scoredMarks / totalMarks) * 100).toFixed(2),
        results,
        submittedAt: new Date()
    };
    
    quizAttempts.set(attemptId, attempt);
    quiz.attempts += 1;
    
    res.json({ 
        success: true,
        attemptId,
        scoredMarks,
        totalMarks,
        percentage: attempt.percentage,
        results
    });
});

// ==================== FORUM ====================
app.post('/api/forum/threads/create', (req, res) => {
    const { userId, userName, subject, title, content } = req.body;
    
    const threadId = generateId();
    const thread = {
        id: threadId,
        userId,
        userName,
        subject,
        title,
        content,
        createdAt: new Date(),
        replies: [],
        views: 0,
        upvotes: 0
    };
    
    forumThreads.set(threadId, thread);
    
    res.json({ 
        success: true, 
        threadId,
        message: 'Thread created successfully' 
    });
});

app.get('/api/forum/threads', (req, res) => {
    const { subject } = req.query;
    
    let threadList = Array.from(forumThreads.values());
    
    if (subject && subject !== 'all') {
        threadList = threadList.filter(t => t.subject === subject);
    }
    
    threadList = threadList
        .map(t => ({
            id: t.id,
            userName: t.userName,
            subject: t.subject,
            title: t.title,
            content: t.content.substring(0, 150) + '...',
            createdAt: t.createdAt,
            replyCount: t.replies.length,
            views: t.views,
            upvotes: t.upvotes
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(threadList);
});

app.get('/api/forum/threads/:id', (req, res) => {
    const thread = forumThreads.get(req.params.id);
    
    if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
    }
    
    thread.views += 1;
    
    const replies = thread.replies.map(replyId => forumReplies.get(replyId));
    
    res.json({ ...thread, replies });
});

app.post('/api/forum/threads/:id/reply', (req, res) => {
    const threadId = req.params.id;
    const { userId, userName, content } = req.body;
    
    const thread = forumThreads.get(threadId);
    if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
    }
    
    const replyId = generateId();
    const reply = {
        id: replyId,
        threadId,
        userId,
        userName,
        content,
        createdAt: new Date(),
        upvotes: 0
    };
    
    forumReplies.set(replyId, reply);
    thread.replies.push(replyId);
    
    res.json({ 
        success: true, 
        replyId,
        message: 'Reply added successfully' 
    });
});

app.post('/api/forum/threads/:id/upvote', (req, res) => {
    const thread = forumThreads.get(req.params.id);
    
    if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
    }
    
    thread.upvotes += 1;
    
    res.json({ success: true, upvotes: thread.upvotes });
});

// ==================== PLAGIARISM ====================
app.post('/api/plagiarism/check', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const filePath = req.file.path;
        const content = fs.readFileSync(filePath, 'utf8');
        
        const referenceTexts = [
            "This is a sample reference text about computer science and programming.",
            "Machine learning is a subset of artificial intelligence that focuses on data.",
            "Web development involves creating websites using HTML, CSS, and JavaScript."
        ];
        
        const similarities = referenceTexts.map((refText, index) => {
            const similarity = stringSimilarity.compareTwoStrings(content, refText);
            return {
                source: `Reference Document ${index + 1}`,
                similarity: (similarity * 100).toFixed(2),
                matched: similarity > 0.3
            };
        });
        
        const maxSimilarity = Math.max(...similarities.map(s => parseFloat(s.similarity)));
        
        fs.unlinkSync(filePath);
        
        res.json({
            success: true,
            fileName: req.file.originalname,
            overallScore: maxSimilarity.toFixed(2),
            status: maxSimilarity > 50 ? 'High Plagiarism' : maxSimilarity > 30 ? 'Medium Plagiarism' : 'Original',
            details: similarities.filter(s => parseFloat(s.similarity) > 10),
            checkedAt: new Date()
        });
        
    } catch (error) {
        console.error('Plagiarism check error:', error);
        res.status(500).json({ error: 'Plagiarism check failed' });
    }
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        modules: {
            users: users.size,
            sessions: sessions.size,
            fileSharing: fileStore.size,
            assignments: assignments.size,
            quizzes: quizzes.size,
            forumThreads: forumThreads.size
        },
        timestamp: new Date()
    });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(`🚀 EduShare Server running on http://localhost:${PORT}`);
    console.log(`📊 Active modules:`);
    console.log(`   - Users: ${users.size}`);
    console.log(`   - Active Sessions: ${sessions.size}`);
    console.log(`   - File Sharing: ${fileStore.size} files`);
    console.log(`   - Assignments: ${assignments.size}`);
    console.log(`   - Quizzes: ${quizzes.size}`);
    console.log(`   - Forum Threads: ${forumThreads.size}`);
});