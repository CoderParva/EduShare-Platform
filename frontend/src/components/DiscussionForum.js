import React, { useState, useEffect } from 'react';
import './Forum.css';
import CreateThread from './CreateThread';

function DiscussionForum({ userId, userName }) {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [selectedThread, setSelectedThread] = useState(null);
    const [filter, setFilter] = useState('all');
    const [replyText, setReplyText] = useState('');

    const subjects = ['all', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];

    useEffect(() => {
        fetchThreads();
    }, [filter]);

    const fetchThreads = async () => {
        try {
            const url = filter === 'all' 
                ? 'http://localhost:5000/api/forum/threads'
                : `http://localhost:5000/api/forum/threads?subject=${filter}`;
            const response = await fetch(url);
            const data = await response.json();
            setThreads(data);
        } catch (error) {
            console.error('Error fetching threads:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchThreadDetails = async (threadId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/forum/threads/${threadId}`);
            const data = await response.json();
            setSelectedThread(data);
        } catch (error) {
            console.error('Error fetching thread details:', error);
        }
    };

    const handleUpvote = async (threadId) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/forum/threads/${threadId}/upvote`,
                { method: 'POST' }
            );
            const data = await response.json();
            if (response.ok) {
                fetchThreads();
            }
        } catch (error) {
            console.error('Error upvoting:', error);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) {
            alert('Please write a reply');
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/forum/threads/${selectedThread.id}/reply`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId,
                        userName,
                        content: replyText
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setReplyText('');
                fetchThreadDetails(selectedThread.id);
            } else {
                alert(data.error || 'Failed to post reply');
            }
        } catch (error) {
            alert('Error posting reply: ' + error.message);
        }
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const posted = new Date(date);
        const diffMs = now - posted;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    };

    if (showCreate) {
        return (
            <div className="forum-container">
                <button 
                    className="back-btn"
                    onClick={() => setShowCreate(false)}
                >
                    ← Back to Forum
                </button>
                <CreateThread 
                    userId={userId}
                    userName={userName}
                    onSuccess={() => {
                        setShowCreate(false);
                        fetchThreads();
                    }}
                />
            </div>
        );
    }

    if (selectedThread) {
        return (
            <div className="forum-container">
                <button 
                    className="back-btn"
                    onClick={() => setSelectedThread(null)}
                >
                    ← Back to Threads
                </button>

                <div className="thread-detail">
                    <div className="thread-detail-header">
                        <div className="thread-subject-badge">{selectedThread.subject}</div>
                        <h2>{selectedThread.title}</h2>
                        <div className="thread-meta">
                            <span>👤 {selectedThread.userName}</span>
                            <span>•</span>
                            <span>🕐 {formatTimeAgo(selectedThread.createdAt)}</span>
                            <span>•</span>
                            <span>👁️ {selectedThread.views} views</span>
                            <span>•</span>
                            <span>👍 {selectedThread.upvotes} upvotes</span>
                        </div>
                    </div>

                    <div className="thread-content">
                        <p>{selectedThread.content}</p>
                    </div>

                    <div className="thread-actions">
                        <button 
                            className="upvote-btn"
                            onClick={() => handleUpvote(selectedThread.id)}
                        >
                            👍 Upvote
                        </button>
                    </div>

                    <div className="replies-section">
                        <h3>💬 Replies ({selectedThread.replies.length})</h3>

                        <div className="reply-form">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write your reply..."
                                rows="4"
                            />
                            <button 
                                className="post-reply-btn"
                                onClick={handleReply}
                            >
                                Post Reply
                            </button>
                        </div>

                        <div className="replies-list">
                            {selectedThread.replies.length === 0 ? (
                                <p className="no-replies">No replies yet. Be the first to reply!</p>
                            ) : (
                                selectedThread.replies.map(reply => (
                                    <div key={reply.id} className="reply-item">
                                        <div className="reply-header">
                                            <strong>👤 {reply.userName}</strong>
                                            <span>🕐 {formatTimeAgo(reply.createdAt)}</span>
                                        </div>
                                        <p className="reply-content">{reply.content}</p>
                                        <div className="reply-actions">
                                            <span>👍 {reply.upvotes}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="forum-container">
            <div className="forum-header">
                <h2>💬 Discussion Forum</h2>
                <button 
                    className="create-btn"
                    onClick={() => setShowCreate(true)}
                >
                    + Create Thread
                </button>
            </div>

            <div className="forum-filters">
                {subjects.map(subject => (
                    <button
                        key={subject}
                        className={`filter-btn ${filter === subject ? 'active' : ''}`}
                        onClick={() => setFilter(subject)}
                    >
                        {subject === 'all' ? 'All Subjects' : subject}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading threads...</p>
                </div>
            ) : (
                <>
                    {threads.length === 0 ? (
                        <div className="no-data">
                            <p>📭 No threads yet. Start a discussion!</p>
                        </div>
                    ) : (
                        <div className="threads-list">
                            {threads.map(thread => (
                                <div 
                                    key={thread.id} 
                                    className="thread-card"
                                    onClick={() => fetchThreadDetails(thread.id)}
                                >
                                    <div className="thread-card-header">
                                        <div className="thread-subject-badge">{thread.subject}</div>
                                        <div className="thread-stats">
                                            <span>👍 {thread.upvotes}</span>
                                            <span>👁️ {thread.views}</span>
                                        </div>
                                    </div>
                                    <h3>{thread.title}</h3>
                                    <p className="thread-preview">{thread.content}</p>
                                    <div className="thread-footer">
                                        <span className="thread-author">👤 {thread.userName}</span>
                                        <span className="thread-time">🕐 {formatTimeAgo(thread.createdAt)}</span>
                                        <span className="thread-replies">💬 {thread.replyCount} replies</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default DiscussionForum;