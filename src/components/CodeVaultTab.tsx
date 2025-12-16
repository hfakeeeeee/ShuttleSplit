import React, { useState, useEffect } from 'react';
import { SystemLog } from '../types';
import { subscribeSystemLogs, saveSystemLogDb, deleteSystemLogDb } from '../services/firestore';
import { useAuth } from './AuthContext';
import './system-diagnostics-styles.css';

interface SystemDiagnosticsProps {
  onShowNotification: (message: string, type: 'success' | 'error') => void;
}

const SystemDiagnostics: React.FC<SystemDiagnosticsProps> = ({ onShowNotification }) => {
  const { user, loading, login, logout } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    code: '',
    language: 'javascript'
  });

  // Environment check
  const ENABLED = process.env.REACT_APP_ENABLE_SYSTEM_DIAG === 'true';
  
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeSystemLogs((data) => {
        setLogs(data);
      });
      return () => unsubscribe();
    }
  }, [user]);
  
  // Early return after hooks
  if (!ENABLED) {
    return null;
  }
  
  if (loading) {
    return (
      <div className="system-diagnostics-container">
        <div className="password-screen">
          <div className="password-card">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    
    try {
      await login(emailInput, passwordInput);
      onShowNotification('Login successful', 'success');
      setEmailInput('');
      setPasswordInput('');
    } catch (error: any) {
      onShowNotification(error.message || 'Login failed', 'error');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedLog(null);
    setIsEditing(true);
    setEditForm({
      title: '',
      code: '',
      language: 'javascript'
    });
  };

  const handleEdit = (log: SystemLog) => {
    setSelectedLog(log);
    setIsEditing(true);
    setEditForm({
      title: log.title,
      code: log.code,
      language: log.language || 'javascript'
    });
  };

  const handleSave = async () => {
    if (!editForm.title.trim() || !editForm.code.trim()) {
      onShowNotification('Title and data are required', 'error');
      return;
    }

    const now = Date.now();
    const log: SystemLog = {
      id: selectedLog?.id || `log_${now}`,
      title: editForm.title,
      code: editForm.code,
      language: editForm.language,
      createdAt: selectedLog?.createdAt || now,
      updatedAt: now
    };

    try {
      await saveSystemLogDb(log);
      onShowNotification(
        selectedLog ? 'Entry updated' : 'Entry saved',
        'success'
      );
      setIsEditing(false);
      setSelectedLog(null);
    } catch (error: any) {
      console.error('Save error:', error);
      onShowNotification(`Operation failed: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  const handleDelete = async (logId: string) => {
    if (window.confirm('Delete this entry?')) {
      try {
        await deleteSystemLogDb(logId);
        onShowNotification('Entry deleted', 'success');
        if (selectedLog?.id === logId) {
          setSelectedLog(null);
        }
      } catch (error) {
        onShowNotification('Operation failed', 'error');
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedLog(null);
  };

  const handleViewLog = (log: SystemLog) => {
    setSelectedLog(log);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    onShowNotification('Logged out', 'success');
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    onShowNotification('Code copied to clipboard!', 'success');
  };

  if (!user) {
    return (
      <div className="system-diagnostics-container">
        <div className="password-screen">
          <div className="password-card">
            <div className="lock-icon-wrapper">
              <i className="fas fa-user-lock"></i>
              <div className="lock-glow"></div>
            </div>
            <h2>🔐 System Diagnostics</h2>
            <p className="subtitle">Admin Login Required</p>
            <p className="description">Sign in to access diagnostics</p>
            <form onSubmit={handleLoginSubmit}>
              <div className="input-wrapper">
                <i className="fas fa-envelope input-icon"></i>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Email address"
                  className="password-input"
                  required
                  autoFocus
                />
              </div>
              <div className="input-wrapper">
                <i className="fas fa-key input-icon"></i>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Password"
                  className="password-input"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-unlock" disabled={loggingIn}>
                <i className="fas fa-sign-in-alt"></i>
                <span>{loggingIn ? 'Logging in...' : 'Sign In'}</span>
              </button>
            </form>
            <div className="security-badge">
              <i className="fas fa-shield-alt"></i>
              <span>Secured by Firebase Authentication</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="system-diagnostics-container">
      <div className="vault-header">
        <div className="vault-title-section">
          <div className="vault-icon">
            <i className="fas fa-database"></i>
          </div>
          <div>
            <h2>System Diagnostics</h2>
            <p className="vault-subtitle">Logged in as {user.email}</p>
          </div>
        </div>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button className="btn btn-primary btn-create" onClick={handleCreateNew}>
            <i className="fas fa-plus-circle"></i>
            <span>New Entry</span>
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="vault-content">
        <div className="snippets-sidebar">
          <h3>Saved Entries ({logs.length})</h3>
          <div className="snippets-list">
            {logs.length === 0 ? (
              <div className="empty-state">
                <p>No entries available</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`snippet-item ${selectedLog?.id === log.id && !isEditing ? 'active' : ''}`}
                  onClick={() => handleViewLog(log)}
                >
                  <div className="snippet-item-header">
                    <h4>{log.title}</h4>
                    <span className="snippet-language">{log.language || 'text'}</span>
                  </div>
                  <div className="snippet-item-date">
                    {new Date(log.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="snippets-main">
          {isEditing ? (
            <div className="snippet-editor">
              <h3>{selectedLog ? 'Edit Entry' : 'New Entry'}</h3>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Entry title"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Language</label>
                <select
                  value={editForm.language}
                  onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                  className="form-input"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="vue">Vue</option>
                  <option value="react">React</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="csharp">C#</option>
                  <option value="sql">SQL</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Data *</label>
                <textarea
                  value={editForm.code}
                  onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                  placeholder="Enter data..."
                  className="code-textarea"
                  rows={20}
                />
              </div>
              <div className="editor-actions">
                <button className="btn btn-primary" onClick={handleSave}>
                  <i className="fas fa-save"></i> Save
                </button>
                <button className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          ) : selectedLog ? (
            <div className="snippet-viewer">
              <div className="viewer-header">
                <div>
                  <h3>{selectedLog.title}</h3>
                  <span className="snippet-meta">
                    Type: {selectedLog.language || 'text'} | 
                    Updated: {new Date(selectedLog.updatedAt).toLocaleString()}
                  </span>
                </div>
                <div className="viewer-actions">
                  <button className="btn btn-small" onClick={() => copyToClipboard(selectedLog.code)}>
                    <i className="fas fa-copy"></i> Copy
                  </button>
                  <button className="btn btn-small" onClick={() => handleEdit(selectedLog)}>
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(selectedLog.id)}>
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
              <div className="code-display">
                <pre><code>{selectedLog.code}</code></pre>
              </div>
            </div>
          ) : (
            <div className="empty-viewer">
              <i className="fas fa-database" style={{ fontSize: '64px', opacity: 0.3 }}></i>
              <p>Select an entry to view or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemDiagnostics;
