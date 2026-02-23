import React, { useState } from 'react';
import './Quiz.css';

function CreateQuiz({ teacherId, teacherName, onSuccess }) {
    const [quizData, setQuizData] = useState({
        title: '',
        subject: 'Computer Science',
        duration: 30
    });
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState({
        question: '',
        type: 'multiple-choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        marks: 1
    });
    const [creating, setCreating] = useState(false);

    const subjects = [
        'Computer Science',
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'English',
        'History',
        'Geography'
    ];

    const handleQuizDataChange = (e) => {
        setQuizData({
            ...quizData,
            [e.target.name]: e.target.value
        });
    };

    const handleQuestionChange = (e) => {
        setCurrentQuestion({
            ...currentQuestion,
            [e.target.name]: e.target.value
        });
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...currentQuestion.options];
        newOptions[index] = value;
        setCurrentQuestion({
            ...currentQuestion,
            options: newOptions
        });
    };

    const addQuestion = () => {
        if (!currentQuestion.question || !currentQuestion.correctAnswer) {
            alert('Please fill in question and correct answer');
            return;
        }

        if (currentQuestion.type === 'multiple-choice') {
            const filledOptions = currentQuestion.options.filter(opt => opt.trim() !== '');
            if (filledOptions.length < 2) {
                alert('Please provide at least 2 options');
                return;
            }
        }

        const questionWithId = {
            ...currentQuestion,
            id: 'q' + Date.now()
        };

        setQuestions([...questions, questionWithId]);
        setCurrentQuestion({
            question: '',
            type: 'multiple-choice',
            options: ['', '', '', ''],
            correctAnswer: '',
            marks: 1
        });
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!quizData.title || questions.length === 0) {
            alert('Please add quiz title and at least one question');
            return;
        }

        setCreating(true);

        try {
            const response = await fetch('http://localhost:5000/api/quizzes/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    teacherId,
                    teacherName,
                    ...quizData,
                    questions
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Quiz created successfully!');
                if (onSuccess) onSuccess();
            } else {
                alert(data.error || 'Failed to create quiz');
            }
        } catch (error) {
            alert('Error creating quiz: ' + error.message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="create-quiz-container">
            <h2>📝 Create New Quiz</h2>

            {/* Quiz Details */}
            <div className="quiz-form-section">
                <h3>Quiz Details</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>📝 Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={quizData.title}
                            onChange={handleQuizDataChange}
                            placeholder="e.g., Data Structures Quiz 1"
                        />
                    </div>
                    <div className="form-group">
                        <label>📚 Subject *</label>
                        <select
                            name="subject"
                            value={quizData.subject}
                            onChange={handleQuizDataChange}
                        >
                            {subjects.map(subject => (
                                <option key={subject} value={subject}>
                                    {subject}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>⏱️ Duration (minutes) *</label>
                        <input
                            type="number"
                            name="duration"
                            value={quizData.duration}
                            onChange={handleQuizDataChange}
                            min="5"
                            max="180"
                        />
                    </div>
                </div>
            </div>

            {/* Add Question */}
            <div className="quiz-form-section">
                <h3>Add Question ({questions.length} added)</h3>
                
                <div className="form-group">
                    <label>❓ Question *</label>
                    <textarea
                        name="question"
                        value={currentQuestion.question}
                        onChange={handleQuestionChange}
                        placeholder="Enter your question here..."
                        rows="3"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>📋 Type</label>
                        <select
                            name="type"
                            value={currentQuestion.type}
                            onChange={handleQuestionChange}
                        >
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="true-false">True/False</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>📊 Marks</label>
                        <input
                            type="number"
                            name="marks"
                            value={currentQuestion.marks}
                            onChange={handleQuestionChange}
                            min="1"
                            max="10"
                        />
                    </div>
                </div>

                {currentQuestion.type === 'multiple-choice' ? (
                    <div className="options-container">
                        <label>Options (at least 2 required):</label>
                        {currentQuestion.options.map((option, index) => (
                            <input
                                key={index}
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                className="option-input"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="options-container">
                        <label>Options:</label>
                        <div className="true-false-options">
                            <span>True</span>
                            <span>False</span>
                        </div>
                    </div>
                )}

                <div className="form-group">
                    <label>✅ Correct Answer *</label>
                    {currentQuestion.type === 'multiple-choice' ? (
                        <select
                            name="correctAnswer"
                            value={currentQuestion.correctAnswer}
                            onChange={handleQuestionChange}
                        >
                            <option value="">Select correct answer</option>
                            {currentQuestion.options
                                .filter(opt => opt.trim() !== '')
                                .map((option, index) => (
                                    <option key={index} value={option}>
                                        {option}
                                    </option>
                                ))}
                        </select>
                    ) : (
                        <select
                            name="correctAnswer"
                            value={currentQuestion.correctAnswer}
                            onChange={handleQuestionChange}
                        >
                            <option value="">Select correct answer</option>
                            <option value="True">True</option>
                            <option value="False">False</option>
                        </select>
                    )}
                </div>

                <button className="add-question-btn" onClick={addQuestion}>
                    + Add Question
                </button>
            </div>

            {/* Questions List */}
            {questions.length > 0 && (
                <div className="quiz-form-section">
                    <h3>Questions Added</h3>
                    <div className="questions-list">
                        {questions.map((q, index) => (
                            <div key={q.id} className="question-item">
                                <div className="question-header">
                                    <span className="question-number">Q{index + 1}</span>
                                    <span className="question-marks">{q.marks} marks</span>
                                    <button 
                                        className="remove-question-btn"
                                        onClick={() => removeQuestion(index)}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <p className="question-text">{q.question}</p>
                                <p className="question-answer">✅ Answer: {q.correctAnswer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={creating || questions.length === 0}
            >
                {creating ? 'Creating Quiz...' : '✅ Create Quiz'}
            </button>
        </div>
    );
}

export default CreateQuiz;