import React, { useState } from 'react';
import { Player, Session } from '../types';

interface SessionParticipantsModalProps {
  isOpen: boolean;
  session: Session | null;
  players: Player[];
  onClose: () => void;
  onSave: (sessionId: number, participants: number[]) => void;
}

const SessionParticipantsModal: React.FC<SessionParticipantsModalProps> = ({
  isOpen,
  session,
  players,
  onClose,
  onSave
}) => {
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>(
    session?.participants || []
  );

  React.useEffect(() => {
    if (session) {
      setSelectedParticipants(session.participants);
    }
  }, [session]);

  const handleToggleParticipant = (playerId: number) => {
    setSelectedParticipants(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleSelectAll = () => {
    setSelectedParticipants(players.map(p => p.id));
  };

  const handleSelectNone = () => {
    setSelectedParticipants([]);
  };

  const handleSave = () => {
    if (session) {
      onSave(session.id, selectedParticipants);
      onClose();
    }
  };

  const handleClose = () => {
    if (session) {
      setSelectedParticipants(session.participants);
    }
    onClose();
  };

  if (!isOpen || !session) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><i className="fas fa-users"></i> Select Participants for {session.name}</h3>
          <button className="close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="participants-actions">
            <button className="btn btn-secondary btn-sm" onClick={handleSelectAll}>
              <i className="fas fa-check-double"></i> Select All
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleSelectNone}>
              <i className="fas fa-times"></i> Clear All
            </button>
            <div className="participant-count">
              {selectedParticipants.length} of {players.length} players selected
            </div>
          </div>
          
          <div className="participants-list">
            {players.map(player => (
              <div
                key={player.id}
                className={`participant-item ${selectedParticipants.includes(player.id) ? 'selected' : ''}`}
                onClick={() => handleToggleParticipant(player.id)}
              >
                <div className="participant-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedParticipants.includes(player.id)}
                    onChange={() => handleToggleParticipant(player.id)}
                  />
                </div>
                <div className="participant-info">
                  <div className="participant-name">{player.name}</div>
                  <div className={`participant-type ${player.type}`}>
                    {player.type === 'fixed' ? 'Fixed Registration' : 'Transient (+10,000₫)'}
                  </div>
                </div>
                <div className="participant-status">
                  {selectedParticipants.includes(player.id) ? (
                    <i className="fas fa-check-circle" style={{ color: 'var(--accent-color)' }}></i>
                  ) : (
                    <i className="far fa-circle" style={{ color: 'var(--text-light)' }}></i>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleSave}>
            <i className="fas fa-save"></i> Save Participants
          </button>
          <button className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionParticipantsModal;
