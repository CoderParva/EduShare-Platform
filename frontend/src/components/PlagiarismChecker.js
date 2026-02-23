import React, { useState } from 'react';
import './Plagiarism.css';

function PlagiarismChecker() {
    const [file, setFile] = useState(null);
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Check file type
            const validTypes = ['.txt', '.doc', '.docx'];
            const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.'));
            
            if (!validTypes.includes(fileExt.toLowerCase())) {
                setError('Please upload a text document (.txt, .doc, .docx)');
                setFile(null);
                return;
            }

            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                setError('File size must be less than 10MB');
                setFile(null);
                return;
            }

            setFile(selectedFile);
            setError('');
            setResult(null);
        }
    };

    const handleCheck = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setChecking(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5000/api/plagiarism/check', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data);
            } else {
                setError(data.error || 'Plagiarism check failed');
            }
        } catch (err) {
            setError('Network error. Please check if the server is running.');
        } finally {
            setChecking(false);
        }
    };

    const getStatusColor = (score) => {
        if (score > 50) return '#dc3545'; // Red - High plagiarism
        if (score > 30) return '#ffc107'; // Yellow - Medium plagiarism
        return '#28a745'; // Green - Original
    };

    const getStatusIcon = (score) => {
        if (score > 50) return '⚠️';
        if (score > 30) return '⚡';
        return '✅';
    };

    return (
        <div className="plagiarism-container">
            <div className="plagiarism-header">
                <h2>🔍 Plagiarism Checker</h2>
                <p className="plagiarism-subtitle">
                    Check your document for originality and potential plagiarism
                </p>
            </div>

            {!result ? (
                <div className="plagiarism-upload">
                    <div className="upload-area">
                        <input
                            type="file"
                            id="plagiarism-file"
                            onChange={handleFileChange}
                            accept=".txt,.doc,.docx"
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="plagiarism-file" className="upload-label">
                            <div className="upload-icon">📄</div>
                            <h3>Upload Document</h3>
                            <p>Drag and drop or click to select</p>
                            <span className="file-types">Supported: TXT, DOC, DOCX (Max 10MB)</span>
                        </label>
                    </div>

                    {file && (
                        <div className="selected-file">
                            <div className="file-info-display">
                                <div className="file-icon-large">📄</div>
                                <div>
                                    <p className="file-name-display">{file.name}</p>
                                    <p className="file-size-display">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </div>
                            <button 
                                className="remove-file"
                                onClick={() => {
                                    setFile(null);
                                    setError('');
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}

                    <button
                        className="check-btn"
                        onClick={handleCheck}
                        disabled={!file || checking}
                    >
                        {checking ? (
                            <>
                                <div className="btn-spinner"></div>
                                Checking... This may take a moment
                            </>
                        ) : (
                            '🔍 Check for Plagiarism'
                        )}
                    </button>

                    <div className="plagiarism-info">
                        <h4>How it works:</h4>
                        <ul>
                            <li>✓ Analyzes your document for text similarity</li>
                            <li>✓ Compares against reference documents</li>
                            <li>✓ Provides detailed similarity report</li>
                            <li>✓ Instant results in seconds</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="plagiarism-result">
                    <div className="result-header">
                        <h3>Plagiarism Check Results</h3>
                        <p className="checked-file">📄 {result.fileName}</p>
                    </div>

                    <div 
                        className="score-card"
                        style={{ 
                            background: `linear-gradient(135deg, ${getStatusColor(result.overallScore)} 0%, ${getStatusColor(result.overallScore)}dd 100%)`
                        }}
                    >
                        <div className="score-icon">
                            {getStatusIcon(result.overallScore)}
                        </div>
                        <div className="score-info">
                            <h2>{result.overallScore}%</h2>
                            <p>Similarity Score</p>
                        </div>
                        <div className="status-badge" style={{ background: 'rgba(255,255,255,0.3)' }}>
                            {result.status}
                        </div>
                    </div>

                    <div className="interpretation">
                        <h4>What does this mean?</h4>
                        {result.overallScore > 50 ? (
                            <div className="interpretation-high">
                                <p>⚠️ <strong>High Similarity Detected</strong></p>
                                <p>Your document shows significant similarity with reference sources. Consider revising and citing sources properly.</p>
                            </div>
                        ) : result.overallScore > 30 ? (
                            <div className="interpretation-medium">
                                <p>⚡ <strong>Moderate Similarity</strong></p>
                                <p>Some sections show similarity. Review matched content and ensure proper citations.</p>
                            </div>
                        ) : (
                            <div className="interpretation-low">
                                <p>✅ <strong>Original Content</strong></p>
                                <p>Your document appears to be mostly original with minimal similarity to reference sources.</p>
                            </div>
                        )}
                    </div>

                    {result.details && result.details.length > 0 && (
                        <div className="details-section">
                            <h4>Detailed Match Results:</h4>
                            <div className="details-list">
                                {result.details.map((detail, index) => (
                                    <div key={index} className="detail-item">
                                        <div className="detail-header">
                                            <span className="detail-source">📚 {detail.source}</span>
                                            <span className={`detail-score ${detail.matched ? 'matched' : ''}`}>
                                                {detail.similarity}%
                                            </span>
                                        </div>
                                        <div className="detail-bar">
                                            <div 
                                                className="detail-bar-fill"
                                                style={{ 
                                                    width: `${detail.similarity}%`,
                                                    background: getStatusColor(detail.similarity)
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="result-actions">
                        <button 
                            className="check-another-btn"
                            onClick={() => {
                                setResult(null);
                                setFile(null);
                                setError('');
                            }}
                        >
                            Check Another Document
                        </button>
                    </div>

                    <div className="timestamp">
                        <p>Checked on: {new Date(result.checkedAt).toLocaleString()}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PlagiarismChecker;