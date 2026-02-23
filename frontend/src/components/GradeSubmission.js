import React, { useState, useEffect } from 'react';
import './Assignment.css';

function GradeSubmission({ assignmentId, assignmentTitle }) {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [marks, setMarks] = useState('');
    const [feedback, setFeedback] = useState('');
    const [grading, setGrading] = useState(false);

    useEffect(() => {
        fetchSubmissions();
    }, [assignmentId]);

    const fetchSubmissions = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/assignments/${assignmentId}/submissions`
            );
            const data = await response.json();
            setSubmissions(data);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGrade = async (submissionId) => {
        setGrading(true);

        try {
            const response = await fetch(
                `http://localhost:5000/api/submissions/${submissionId}/grade`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ marks, feedback })
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert('Graded successfully!');
                setSelectedSubmission(null);
                setMarks('');
                setFeedback('');
                fetchSubmissions();
            } else {
                alert(data.error || 'Grading failed');
            }
        } catch (error) {
            alert('Error grading submission: ' + error.message);
        } finally {
            setGrading(false);
        }
    };

    const formatFileSize = (bytes) => {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <div className="grade-submission-container">
            <h2>📝 Submissions for: {assignmentTitle}</h2>

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading submissions...</p>
                </div>
            ) : (
                <>
                    {submissions.length === 0 ? (
                        <div className="no-data">
                            <p>📭 No submissions yet</p>
                        </div>
                    ) : (
                        <div className="submissions-list">
                            {submissions.map(submission => (
                                <div key={submission.id} className="submission-card">
                                    <div className="submission-header">
                                        <div>
                                            <h4>👨‍🎓 {submission.studentName}</h4>
                                            <p className="submission-date">
                                                📅 {new Date(submission.submittedAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className={`status-badge status-${submission.status}`}>
                                            {submission.status}
                                        </span>
                                    </div>

                                    <div className="submission-details">
                                        <p><strong>📄 File:</strong> {submission.fileName}</p>
                                        <p><strong>💾 Size:</strong> {formatFileSize(submission.fileSize)}</p>
                                        
                                        {submission.marks !== null && (
                                            <>
                                                <p><strong>📊 Marks:</strong> {submission.marks}</p>
                                                <p><strong>💬 Feedback:</strong> {submission.feedback || 'No feedback'}</p>
                                            </>
                                        )}
                                    </div>

                                    {submission.status !== 'graded' && (
                                        <button
                                            className="grade-btn"
                                            onClick={() => setSelectedSubmission(submission)}
                                        >
                                            Grade Submission
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Grading Modal */}
            {selectedSubmission && (
                <div className="modal-overlay" onClick={() => setSelectedSubmission(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="modal-close" 
                            onClick={() => setSelectedSubmission(null)}
                        >
                            ✕
                        </button>
                        
                        <h3>Grade Submission</h3>
                        <p><strong>Student:</strong> {selectedSubmission.studentName}</p>
                        <p><strong>File:</strong> {selectedSubmission.fileName}</p>

                        <div className="grading-form">
                            <div className="form-group">
                                <label>📊 Marks</label>
                                <input
                                    type="number"
                                    value={marks}
                                    onChange={(e) => setMarks(e.target.value)}
                                    placeholder="Enter marks"
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>💬 Feedback</label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Write feedback for the student..."
                                    rows="4"
                                />
                            </div>

                            <button
                                className="submit-btn"
                                onClick={() => handleGrade(selectedSubmission.id)}
                                disabled={!marks || grading}
                            >
                                {grading ? 'Grading...' : '✅ Submit Grade'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GradeSubmission;