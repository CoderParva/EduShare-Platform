import React, { useState } from 'react';
import './Forum.css';

function CreateThread({ userId, userName, onSuccess }) {
    const [formData, setFormData] = useState({
        subject: 'Computer Science',
        title: '',
        content: ''
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            alert('Please fill in all fields');
            return;
        }

        setCreating(true);

        try {
            const response = await fetch('http://localhost:5000/api/forum/threads/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    userName,
                    ...formData
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Thread created successfully!');
                if (onSuccess) onSuccess();
            } else {
                alert(data.error || 'Failed to create thread');
            }
        } catch (error) {
            alert('Error creating thread: ' + error.message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="create-thread-container">
            <h2>📝 Create New Thread</h2>
            <p className="create-thread-subtitle">Start a discussion and get help from the community</p>

            <form onSubmit={handleSubmit} className="thread-form">
                <div className="form-group">
                    <label>📚 Subject *</label>
                    <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                    >
                        {subjects.map(subject => (
                            <option key={subject} value={subject}>
                                {subject}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>📌 Title *</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., How to implement binary search tree?"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>📄 Content *</label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Describe your question or topic in detail..."
                        rows="10"
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={creating}
                >
                    {creating ? 'Creating...' : '✅ Create Thread'}
                </button>
            </form>
        </div>
    );
}

export default CreateThread;