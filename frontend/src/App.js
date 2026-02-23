import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Upload from './components/Upload';
import Download from './components/Download';
import AssignmentList from './components/AssignmentList';
import CreateAssignment from './components/CreateAssignment';
import QuizModule from './components/QuizModule';
import DiscussionForum from './components/DiscussionForum';
import PlagiarismChecker from './components/PlagiarismChecker';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [activeModule, setActiveModule] = useState('file-sharing');
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      // Verify token with server
      fetch('http://localhost:5000/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
          setAuthToken(token);
          setIsAuthenticated(true);
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      })
      .catch(err => {
        console.error('Verification error:', err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    setAuthToken(token);
    setIsAuthenticated(true);
  };

  const handleRegisterSuccess = (userData, token) => {
    setUser(userData);
    setAuthToken(token);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (err) {
      console.error('Logout error:', err);
    }

    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Reset state
    setUser(null);
    setAuthToken(null);
    setIsAuthenticated(false);
    setActiveModule('file-sharing');
  };

  // Loading screen
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading EduShare...</p>
      </div>
    );
  }

  // Show login/register if not authenticated
  if (!isAuthenticated) {
    return showRegister ? (
      <Register
        onRegisterSuccess={handleRegisterSuccess}
        onSwitchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  // Main app (after authentication)
  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>🎓 EduShare Platform</h1>
          <div className="user-info">
            <span className="user-badge">
              {user.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'} {user.name}
            </span>
            <span className="user-email">{user.email}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="module-nav">
        <button 
          className={`nav-btn ${activeModule === 'file-sharing' ? 'active' : ''}`}
          onClick={() => setActiveModule('file-sharing')}
        >
          📁 File Sharing
        </button>
        <button 
          className={`nav-btn ${activeModule === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveModule('assignments')}
        >
          📝 Assignments
        </button>
        <button 
          className={`nav-btn ${activeModule === 'quizzes' ? 'active' : ''}`}
          onClick={() => setActiveModule('quizzes')}
        >
          📊 Quizzes
        </button>
        <button 
          className={`nav-btn ${activeModule === 'forum' ? 'active' : ''}`}
          onClick={() => setActiveModule('forum')}
        >
          💬 Discussion Forum
        </button>
        <button 
          className={`nav-btn ${activeModule === 'plagiarism' ? 'active' : ''}`}
          onClick={() => setActiveModule('plagiarism')}
        >
          🔍 Plagiarism Checker
        </button>
      </nav>

      <main className="content">
        {activeModule === 'file-sharing' && (
          <div className="module-content">
            <div className="tab-container">
              <Upload />
              <Download />
            </div>
          </div>
        )}

        {activeModule === 'assignments' && (
          <div className="module-content">
            {user.role === 'teacher' ? (
              <CreateAssignment teacherId={user.id} teacherName={user.name} />
            ) : (
              <AssignmentList 
                userRole={user.role} 
                userId={user.id} 
                userName={user.name}
              />
            )}
          </div>
        )}

        {activeModule === 'quizzes' && (
          <div className="module-content">
            <QuizModule 
              userRole={user.role} 
              userId={user.id} 
              userName={user.name}
            />
          </div>
        )}

        {activeModule === 'forum' && (
          <div className="module-content">
            <DiscussionForum 
              userId={user.id} 
              userName={user.name}
            />
          </div>
        )}

        {activeModule === 'plagiarism' && (
          <div className="module-content">
            <PlagiarismChecker />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>EduShare Platform © 2024 | Share. Learn. Collaborate. Excel.</p>
      </footer>
    </div>
  );
}

export default App;