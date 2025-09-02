import React, { useState } from 'react';
import { Session, SessionCosts, Player } from '../types';
import { formatCurrency } from '../utils';
import SessionParticipantsModal from './SessionParticipantsModal';

interface SessionsManagementProps {
  sessions: Session[];
  sessionCosts: SessionCosts;
  players: Player[];
  onAddSession: (selectedDate?: string) => void;
  onRemoveSession: (id: number) => void;
  onUpdateSessionParticipants: (sessionId: number, participants: number[]) => void;
  onUpdateSessionAdditionalFee: (sessionId: number, additionalFee: number) => void;
  onUpdateSessionWaterFee: (sessionId: number, waterFee: number) => void;
  onShowNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const SessionsManagement: React.FC<SessionsManagementProps> = ({
  sessions,
  sessionCosts,
  players,
  onAddSession,
  onRemoveSession,
  onUpdateSessionParticipants,
  onUpdateSessionAdditionalFee,
  onUpdateSessionWaterFee,
  onShowNotification
}) => {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const handleAddSession = () => {
    onAddSession(selectedDate);
    setSelectedDate(''); // Reset date picker
    onShowNotification('Day added successfully!', 'success');
  };

  const handleRemoveSession = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      onRemoveSession(id);
      onShowNotification('Day removed successfully!', 'success');
    }
  };

  const handleEditParticipants = (session: Session) => {
    setSelectedSession(session);
    setShowParticipantsModal(true);
  };

  const handleSaveParticipants = (sessionId: number, participants: number[]) => {
    onUpdateSessionParticipants(sessionId, participants);
    onShowNotification('Day participants updated!', 'success');
  };

  const handleAdditionalFeeChange = (sessionId: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    onUpdateSessionAdditionalFee(sessionId, numValue);
  };

  const handleWaterFeeChange = (sessionId: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    onUpdateSessionWaterFee(sessionId, numValue);
  };

  const getParticipantNames = (participantIds: number[]) => {
    return players
      .filter(player => participantIds.includes(player.id))
      .map(player => player.name)
      .join(', ');
  };

  return (
    <>
      <section className="card sessions-section">
        <div className="section-header">
          <h2><i className="fas fa-calendar-alt"></i> Playing Days</h2>
          <div className="add-session-controls">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
            <button className="btn btn-primary" onClick={handleAddSession}>
              <i className="fas fa-plus"></i> Add Day
            </button>
          </div>
        </div>
        <div className="sessions-list">
          {sessions.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-calendar-plus"></i>
              <p>No playing days added yet. Select a date and click "Add Day" to get started.</p>
            </div>
          ) : (
            sessions.map(session => (
              <div key={session.id} className="session-card fade-in">
                <div className="session-header">
                  <div>
                    <div className="session-title">{session.name}</div>
                    <div className="session-date">{session.date}</div>
                    <div className={`session-participants ${session.participants.length > 0 ? 'has-participants' : ''}`}>
                      {session.participants.length > 0 
                        ? `${session.participants.length} players: ${getParticipantNames(session.participants)}`
                        : 'No participants selected'
                      }
                    </div>
                  </div>
                  <div className="session-actions">
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => handleEditParticipants(session)}
                    >
                      <i className="fas fa-users"></i> Participants
                    </button>
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => handleRemoveSession(session.id, session.name)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div className="session-costs">
                  <div className="cost-item">
                    <div className="cost-label">Court Fee</div>
                    <div className="cost-value">{formatCurrency(sessionCosts.courtFee)}</div>
                  </div>
                  <div className="cost-item">
                    <div className="cost-label">Shuttle Fee (Monthly Total)</div>
                    <div className="cost-value">{formatCurrency(sessionCosts.shuttleFee)}</div>
                  </div>
                  <div className="cost-item">
                    <div className="cost-label">Water Fee (This Day)</div>
                    <div className="cost-input">
                      <input
                        type="number"
                        placeholder="0"
                        min="0"
                        value={session.waterFee || ''}
                        onChange={(e) => handleWaterFeeChange(session.id, e.target.value)}
                        className="additional-fee-input"
                      />
                      <span className="currency-suffix">₫</span>
                    </div>
                  </div>
                  <div className="cost-item">
                    <div className="cost-label">Additional Fee (This Day)</div>
                    <div className="cost-input">
                      <input
                        type="number"
                        placeholder="0"
                        min="0"
                        value={session.additionalFee || ''}
                        onChange={(e) => handleAdditionalFeeChange(session.id, e.target.value)}
                        className="additional-fee-input"
                      />
                      <span className="currency-suffix">₫</span>
                    </div>
                  </div>
                  <div className="cost-item total-per-day">
                    <div className="cost-label">
                      Total per Day
                    </div>
                    <div className="cost-value">
                      {formatCurrency(sessionCosts.totalPerSession + (session.additionalFee || 0) + (session.waterFee || 0))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <SessionParticipantsModal
        isOpen={showParticipantsModal}
        session={selectedSession}
        players={players}
        onClose={() => setShowParticipantsModal(false)}
        onSave={handleSaveParticipants}
      />
    </>
  );
};

export default SessionsManagement;
