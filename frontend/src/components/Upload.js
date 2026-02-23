import React, { useState } from 'react';
import './Upload.css';

const API_URL = 'http://localhost:5000/api';

function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('File size must be less than 100MB');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult(data);
        setFile(null);
        document.getElementById('file-input').value = '';
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error. Please check if the server is running.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Code copied to clipboard!');
  };

  return (
    <div className="upload-container">
      <h2>Upload Your File</h2>
      
      {!uploadResult ? (
        <div className="upload-section">
          <div className="file-input-wrapper">
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          {file && (
            <div className="file-preview">
              <p><strong>Selected:</strong> {file.name}</p>
              <p><strong>Size:</strong> {formatFileSize(file.size)}</p>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button
            className="upload-button"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      ) : (
        <div className="success-section">
          <div className="success-icon">✅</div>
          <h3>Upload Successful!</h3>
          
          <div className="code-display">
            <p>Your sharing code is:</p>
            <div className="code-box">
              <span className="code">{uploadResult.code}</span>
              <button 
                className="copy-button"
                onClick={() => copyToClipboard(uploadResult.code)}
              >
                📋 Copy
              </button>
            </div>
          </div>

          <div className="upload-details">
            <p><strong>File:</strong> {uploadResult.filename}</p>
            <p><strong>Size:</strong> {formatFileSize(uploadResult.size)}</p>
            <p><strong>Expires:</strong> {new Date(uploadResult.expiryTime).toLocaleString()}</p>
          </div>

          <button
            className="upload-another"
            onClick={() => setUploadResult(null)}
          >
            Upload Another File
          </button>
        </div>
      )}
    </div>
  );
}

export default Upload;