import React, { useState, useEffect } from 'react';
import './Assignment.css';
import SubmitAssignment from './SubmitAssignment';
import GradeSubmission from './GradeSubmission';

function AssignmentList({ userRole, userId, userName }) {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showSubmit, setShowSubmit] = useState(false);
    const [showGrade, setShowGrade] = useState(false);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/assignments/list');
            const data = await response.json();
            setAssignments(data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDeadlineStatus = (deadline) => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return { text: 'Overdue', class: 'overdue' };
        if (diffDays === 0) return { text: 'Due Today', class: 'due-today' };
        if (diffDays === 1) return { text: 'Due Tomorrow', class: 'due-soon' };
        return { text: `${diffDays} days left`, class: 'upcoming' };
    };

    const handleViewAssignment = async (assignment) => {
        setSelectedAssignment(assignment);
        if (userRole === 'teacher') {
            setShowGrade(true);
        } else {
            setShowSubmit(true);
        }
    };

    return (
        <div className="assignment-list-container">
            <div className="assignment-header">
                <h2>📚 Assignments</h2>
            </div>

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading assignments...</p>
                </div>
            ) : (
                <>
                    {assignments.length === 0 ? (
                        <div className="no-data">
                            <p>📭 No assignments yet</p>
                        </div>
                    ) : (
                        <div className="assignment-grid">
                            {assignments.map(assignment => {
                                const deadlineStatus = getDeadlineStatus(assignment.deadline);
                                return (
                                    <div key={assignment.id} className="assignment-card">
                                        <div className="assignment-subject">{assignment.subject}</div>
                                        <h3>{assignment.title}</h3>
                                        <div className="assignment-info">
                                            <div className="info-item">
                                                <span>👨‍🏫 Teacher:</span>
                                                <span>{assignment.teacherName}</span>
                                            </div>
                                            <div className="info-item">
                                                <span>📅 Deadline:</span>
                                                <span>{new Date(assignment.deadline).toLocaleDateString()}</span>
                                            </div>
                                            <div className="info-item">
                                                <span>📊 Max Marks:</span>
                                                <span>{assignment.maxMarks}</span>
                                            </div>
                                            <div className="info-item">
                                                <span>📝 Submissions:</span>
                                                <span>{assignment.submissionCount}</span>
                                            </div>
                                        </div>
                                        <div className={`deadline-badge ${deadlineStatus.class}`}>
                                            {deadlineStatus.text}
                                        </div>
                                        <button 
                                            className="view-btn"
                                            onClick={() => handleViewAssignment(assignment)}
                                        >
                                            {userRole === 'teacher' ? 'View Submissions' : 'Submit Assignment'} →
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Submit Assignment Modal */}
            {showSubmit && selectedAssignment && (
                <div className="modal-overlay" onClick={() => setShowSubmit(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowSubmit(false)}>✕</button>
                        <h2>{selectedAssignment.title}</h2>
                        <p className="assignment-description">{selectedAssignment.description}</p>
                        <SubmitAssignment 
                            assignmentId={selectedAssignment.id}
                            studentId={userId}
                            studentName={userName}
                            onSuccess={() => {
                                setShowSubmit(false);
                                fetchAssignments();
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Grade Submissions Modal */}
            {showGrade && selectedAssignment && (
                <div className="modal-overlay" onClick={() => setShowGrade(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowGrade(false)}>✕</button>
                        <GradeSubmission 
                            assignmentId={selectedAssignment.id}
                            assignmentTitle={selectedAssignment.title}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default AssignmentList;