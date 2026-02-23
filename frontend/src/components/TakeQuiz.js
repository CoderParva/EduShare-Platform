import React, { useState, useEffect } from 'react';
import './Quiz.css';

function TakeQuiz({ quizId, studentId, studentName, onComplete }) {
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    useEffect(() => {
        if (quizStarted && timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (quizStarted && timeLeft === 0) {
            handleSubmit();
        }
    }, [timeLeft, quizStarted]);

    const fetchQuiz = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}`);
            const data = await response.json();
            setQuiz(data);
            setTimeLeft(data.duration * 60); // Convert to seconds
        } catch (error) {
            console.error('Error fetching quiz:', error);
        } finally {
            setLoading(false);
        }
    };

    const startQuiz = () => {
        setQuizStarted(true);
    };

    const handleAnswerSelect = (questionId, answer) => {
        setAnswers({
            ...answers,
            [questionId]: answer
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/quizzes/${quizId}/submit`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        studentId,
                        studentName,
                        answers
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setResult(data);
                setQuizCompleted(true);
            } else {
                alert(data.error || 'Failed to submit quiz');
            }
        } catch (error) {
            alert('Error submitting quiz: ' + error.message);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Loading quiz...</p>
            </div>
        );
    }

    if (quizCompleted && result) {
        return (
            <div className="quiz-result">
                <div className="result-icon">
                    {result.percentage >= 70 ? '🎉' : result.percentage >= 50 ? '👍' : '📚'}
                </div>
                <h2>Quiz Completed!</h2>
                <div className="result-score">
                    <div className="score-circle">
                        <span className="score-percentage">{result.percentage}%</span>
                    </div>
                    <p className="score-details">
                        {result.scoredMarks} / {result.totalMarks} marks
                    </p>
                </div>

                <div className="result-breakdown">
                    <h3>Answer Breakdown</h3>
                    {result.results.map((item, index) => (
                        <div 
                            key={index} 
                            className={`result-item ${item.isCorrect ? 'correct' : 'incorrect'}`}
                        >
                            <div className="result-item-header">
                                <span>Question {index + 1}</span>
                                <span className={item.isCorrect ? 'correct-badge' : 'incorrect-badge'}>
                                    {item.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                                </span>
                            </div>
                            <p className="result-question">{item.question}</p>
                            <p className="result-answer">
                                <strong>Your answer:</strong> {item.studentAnswer || 'Not answered'}
                            </p>
                            {!item.isCorrect && (
                                <p className="result-correct-answer">
                                    <strong>Correct answer:</strong> {item.correctAnswer}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                <button className="back-btn" onClick={onComplete}>
                    Back to Quizzes
                </button>
            </div>
        );
    }

    if (!quizStarted) {
        return (
            <div className="quiz-intro">
                <h2>{quiz.title}</h2>
                <div className="quiz-intro-details">
                    <div className="intro-item">
                        <span className="intro-icon">❓</span>
                        <div>
                            <strong>Questions</strong>
                            <p>{quiz.questions.length}</p>
                        </div>
                    </div>
                    <div className="intro-item">
                        <span className="intro-icon">⏱️</span>
                        <div>
                            <strong>Duration</strong>
                            <p>{quiz.duration} minutes</p>
                        </div>
                    </div>
                    <div className="intro-item">
                        <span className="intro-icon">📊</span>
                        <div>
                            <strong>Total Marks</strong>
                            <p>{quiz.questions.reduce((sum, q) => sum + q.marks, 0)}</p>
                        </div>
                    </div>
                </div>
                <div className="quiz-instructions">
                    <h3>Instructions:</h3>
                    <ul>
                        <li>✓ Answer all questions before time runs out</li>
                        <li>✓ You can navigate between questions</li>
                        <li>✓ Quiz will auto-submit when time ends</li>
                        <li>✓ Make sure you have a stable internet connection</li>
                    </ul>
                </div>
                <button className="start-quiz-btn" onClick={startQuiz}>
                    Start Quiz →
                </button>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
        <div className="take-quiz-container">
            <div className="quiz-header-bar">
                <div className="quiz-progress">
                    <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
                <div className={`quiz-timer ${timeLeft < 60 ? 'warning' : ''}`}>
                    ⏱️ {formatTime(timeLeft)}
                </div>
            </div>

            <div className="question-container">
                <div className="question-header">
                    <h3>Question {currentQuestionIndex + 1}</h3>
                    <span className="question-marks">{currentQuestion.marks} marks</span>
                </div>
                <p className="question-text">{currentQuestion.question}</p>

                <div className="answers-container">
                    {currentQuestion.type === 'multiple-choice' ? (
                        currentQuestion.options.map((option, index) => (
                            <div
                                key={index}
                                className={`answer-option ${
                                    answers[currentQuestion.id] === option ? 'selected' : ''
                                }`}
                                onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                            >
                                <span className="option-letter">
                                    {String.fromCharCode(65 + index)}
                                </span>
                                <span className="option-text">{option}</span>
                            </div>
                        ))
                    ) : (
                        <>
                            <div
                                className={`answer-option ${
                                    answers[currentQuestion.id] === 'True' ? 'selected' : ''
                                }`}
                                onClick={() => handleAnswerSelect(currentQuestion.id, 'True')}
                            >
                                <span className="option-letter">T</span>
                                <span className="option-text">True</span>
                            </div>
                            <div
                                className={`answer-option ${
                                    answers[currentQuestion.id] === 'False' ? 'selected' : ''
                                }`}
                                onClick={() => handleAnswerSelect(currentQuestion.id, 'False')}
                            >
                                <span className="option-letter">F</span>
                                <span className="option-text">False</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="quiz-navigation">
                <button
                    className="nav-btn"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                >
                    ← Previous
                </button>

                {currentQuestionIndex === quiz.questions.length - 1 ? (
                    <button
                        className="submit-quiz-btn"
                        onClick={handleSubmit}
                    >
                        Submit Quiz ✅
                    </button>
                ) : (
                    <button
                        className="nav-btn"
                        onClick={handleNext}
                    >
                        Next →
                    </button>
                )}
            </div>

            <div className="answer-summary">
                <p>Answered: {Object.keys(answers).length} / {quiz.questions.length}</p>
            </div>
        </div>
    );
}

export default TakeQuiz;