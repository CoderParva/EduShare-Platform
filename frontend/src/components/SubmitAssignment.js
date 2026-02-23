import React, { useState } from 'react';
import './Assignment.css';

function SubmitAssignment({ assignmentId, studentId, studentName, onSuccess }) {
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
                setError('File size must be less than 50MB');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError('');
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            setError('Please select a file');
            return;
        }

        setSubmitting(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('studentId', studentId);
        formData.append('studentName', studentName);

        try {
            const response = await fetch(
                `http://localhost:5000/api/assignments/${assignmentId}/submit`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            const data = await response.json();

            if (response.ok) {
                setResult(data);
                if (onSuccess) {
                    setTimeout(() => onSuccess(), 2000);
                }
            } else {
                setError(data.error || 'Submission failed');
            }
        } catch (err) {
            setError('Network error. Please check if the server is running.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <div className="submit-assignment">
            {!result ? (
                <>
                    <div className="file-upload-area">
                        <input
                            type="file"
                            id="assignment-file"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.zip,.txt"
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="assignment-file" className="file-upload-label">
                            <div className="upload-icon">📤</div>
                            <p>Click to select file</p>
                            <span className="file-hint">PDF, DOC, DOCX, ZIP (Max 50MB)</span>
                        </label>
                    </div>

                    {file && (
                        <div className="file-preview">
                            <div className="file-icon">📄</div>
                            <div className="file-details">
                                <p className="file-name">{file.name}</p>
                                <p className="file-size">{formatFileSize(file.size)}</p>
                            </div>
                            <button 
                                className="remove-file-btn"
                                onClick={() => setFile(null)}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}

                    <button
                        className="submit-btn"
                        onClick={handleSubmit}
                        disabled={!file || submitting}
                    >
                        {submitting ? 'Submitting...' : '✅ Submit Assignment'}
                    </button>
                </>
            ) : (
                <div className="submit-success">
                    <div className="success-icon">
                        {result.status === 'late' ? '⚠️' : '✅'}
                    </div>
                    <h3>
                        {result.status === 'late' 
                            ? 'Submitted Late!' 
                            : 'Submitted Successfully!'}
                    </h3>
                    <p className={`status-${result.status}`}>
                        {result.message}
                    </p>
                    <div className="submission-details">
                        <p><strong>Submission ID:</strong> {result.submissionId}</p>
                        <p><strong>Status:</strong> {result.status}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SubmitAssignment;