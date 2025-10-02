import React, { useState } from 'react';
import { Session, SessionCosts, Player } from '../types';
import { formatCurrency } from '../utils';
import SessionParticipantsModal from './SessionParticipantsModal';
import CollapsibleSection from './CollapsibleSection';

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
  isExpanded?: boolean;
  onToggle?: (isExpanded: boolean) => void;
  disabled?: boolean;
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
  onShowNotification,
  isExpanded,
  onToggle,
  disabled = false
}) => {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [participantDetailsSession, setParticipantDetailsSession] = useState<Session | null>(null);
  const [showParticipantDetails, setShowParticipantDetails] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [localExpanded, setLocalExpanded] = useState(true);
  
  const handleToggle = (newState: boolean) => {
    setLocalExpanded(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

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
    const filteredPlayers = players.filter(player => participantIds.includes(player.id));
    
    // For any number of participants, we'll just show the count
    // This avoids text overflow completely
    if (filteredPlayers.length > 0) {
      return `${filteredPlayers.length} players`;
    }
    
    return 'No participants';
  };
  
  const getFullParticipantList = (participantIds: number[]) => {
    return players
      .filter(player => participantIds.includes(player.id))
      .map(player => player.name)
      .join(', ');
  };

  return (
    <>
      <CollapsibleSection
        title="Playing Days"
        icon="fas fa-calendar-alt"
        className={`sessions-section ${disabled ? 'disabled-section' : ''}`}
        defaultExpanded={true}
        isExpanded={isExpanded !== undefined ? isExpanded : localExpanded}
        onToggle={handleToggle}
      >
        <div>
          <div className="add-session-controls" style={{ marginBottom: '1rem' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
              disabled={disabled}
            />
            <button 
              className="btn btn-primary" 
              onClick={handleAddSession} 
              disabled={disabled}
            >
              <i className="fas fa-plus"></i> Add Day
            </button>
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
                      <div 
                        className={`session-participants ${session.participants.length > 0 ? 'has-participants' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (session.participants.length > 0) {
                            setParticipantDetailsSession(session);
                            setShowParticipantDetails(true);
                          }
                        }}
                        style={{ cursor: session.participants.length > 0 ? 'pointer' : 'default' }}
                      >
                        {session.participants.length > 0 
                          ? getParticipantNames(session.participants)
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
        </div>
      </CollapsibleSection>

      <SessionParticipantsModal
        isOpen={showParticipantsModal}
        session={selectedSession}
        players={players}
        onClose={() => setShowParticipantsModal(false)}
        onSave={handleSaveParticipants}
      />

      {/* Participant Details Modal */}
      {showParticipantDetails && participantDetailsSession && (
        <div className="modal-overlay" onClick={() => setShowParticipantDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-users"></i> Participants for {participantDetailsSession.name}</h3>
              <button className="close-btn" onClick={() => setShowParticipantDetails(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="participant-details">
                <div className="participant-count">
                  {participantDetailsSession.participants.length} players
                </div>
                <div className="participant-list-full">
                  {players
                    .filter(player => participantDetailsSession.participants.includes(player.id))
                    .map((player, index) => (
                      <div key={player.id} className="participant-detail-item">
                        <span className="participant-number">{index + 1}.</span>
                        <span className="participant-name">{player.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowParticipantDetails(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionsManagement;
