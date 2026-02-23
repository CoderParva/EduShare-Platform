import React, { useState } from 'react';
import './Download.css';

const API_URL = 'http://localhost:5000/api';

function Download() {
  const [code, setCode] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-F0-9]/g, '');
    if (value.length <= 6) {
      setCode(value);
      setError('');
      setFileInfo(null);
    }
  };

  const handleCheckFile = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-character code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/fileinfo/${code}`);
      const data = await response.json();

      if (response.ok) {
        setFileInfo(data);
      } else {
        setError(data.error || 'File not found');
        setFileInfo(null);
      }
    } catch (err) {
      setError('Network error. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      window.location.href = `${API_URL}/download/${code}`;
      setTimeout(() => setDownloading(false), 2000);
    } catch (err) {
      setError('Download failed');
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="download-container">
      <h2>Download File</h2>
      
      <div className="download-section">
        <p className="instruction">Enter the 6-character code to download your file</p>
        
        <div className="code-input-wrapper">
          <input
            type="text"
            className="code-input"
            placeholder="ABCD12"
            value={code}
            onChange={handleCodeChange}
            maxLength={6}
            disabled={loading}
          />
          <button
            className="check-button"
            onClick={handleCheckFile}
            disabled={code.length !== 6 || loading}
          >
            {loading ? 'Checking...' : 'Check'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {fileInfo && (
          <div className="file-info-section">
            <div className="file-info-card">
              <h3>📄 File Information</h3>
              <div className="info-row">
                <span className="info-label">Filename:</span>
                <span className="info-value">{fileInfo.filename}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Size:</span>
                <span className="info-value">{formatFileSize(fileInfo.size)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Uploaded:</span>
                <span className="info-value">
                  {new Date(fileInfo.uploadTime).toLocaleString()}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Expires:</span>
                <span className="info-value">
                  {new Date(fileInfo.expiryTime).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              className="download-button"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? 'Downloading...' : '⬇️ Download File'}
            </button>

            <button
              className="try-another"
              onClick={() => {
                setCode('');
                setFileInfo(null);
                setError('');
              }}
            >
              Try Another Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Download;