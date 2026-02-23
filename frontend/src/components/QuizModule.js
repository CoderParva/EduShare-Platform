import React, { useState, useEffect } from 'react';
import './Quiz.css';
import CreateQuiz from './CreateQuiz';
import TakeQuiz from './TakeQuiz';

function QuizModule({ userRole, userId, userName }) {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [showTakeQuiz, setShowTakeQuiz] = useState(false);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/quizzes/list');
            const data = await response.json();
            setQuizzes(data);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTakeQuiz = (quiz) => {
        setSelectedQuiz(quiz);
        setShowTakeQuiz(true);
    };

    const handleQuizComplete = () => {
        setShowTakeQuiz(false);
        setSelectedQuiz(null);
        fetchQuizzes();
    };

    if (userRole === 'teacher' && showCreate) {
        return (
            <div className="quiz-module">
                <button 
                    className="back-btn"
                    onClick={() => setShowCreate(false)}
                >
                    ← Back to Quiz List
                </button>
                <CreateQuiz 
                    teacherId={userId} 
                    teacherName={userName}
                    onSuccess={() => {
                        setShowCreate(false);
                        fetchQuizzes();
                    }}
                />
            </div>
        );
    }

    if (showTakeQuiz && selectedQuiz) {
        return (
            <div className="quiz-module">
                <button 
                    className="back-btn"
                    onClick={() => setShowTakeQuiz(false)}
                >
                    ← Back to Quiz List
                </button>
                <TakeQuiz 
                    quizId={selectedQuiz.id}
                    studentId={userId}
                    studentName={userName}
                    onComplete={handleQuizComplete}
                />
            </div>
        );
    }

    return (
        <div className="quiz-module">
            <div className="quiz-header">
                <h2>📊 Quizzes</h2>
                {userRole === 'teacher' && (
                    <button 
                        className="create-btn"
                        onClick={() => setShowCreate(true)}
                    >
                        + Create New Quiz
                    </button>
                )}
            </div>

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading quizzes...</p>
                </div>
            ) : (
                <>
                    {quizzes.length === 0 ? (
                        <div className="no-data">
                            <p>📭 No quizzes available</p>
                        </div>
                    ) : (
                        <div className="quiz-grid">
                            {quizzes.map(quiz => (
                                <div key={quiz.id} className="quiz-card">
                                    <div className="quiz-subject">{quiz.subject}</div>
                                    <h3>{quiz.title}</h3>
                                    <div className="quiz-info">
                                        <div className="info-item">
                                            <span>👨‍🏫 Created by:</span>
                                            <span>{quiz.teacherName}</span>
                                        </div>
                                        <div className="info-item">
                                            <span>❓ Questions:</span>
                                            <span>{quiz.questionCount}</span>
                                        </div>
                                        <div className="info-item">
                                            <span>⏱️ Duration:</span>
                                            <span>{quiz.duration} minutes</span>
                                        </div>
                                        <div className="info-item">
                                            <span>👥 Attempts:</span>
                                            <span>{quiz.attempts}</span>
                                        </div>
                                    </div>
                                    {userRole === 'student' && (
                                        <button 
                                            className="take-quiz-btn"
                                            onClick={() => handleTakeQuiz(quiz)}
                                        >
                                            Start Quiz →
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default QuizModule;