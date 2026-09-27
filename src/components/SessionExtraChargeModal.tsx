import React, { useEffect, useMemo, useState } from 'react';
import { Player, Session, SessionExtraCharge } from '../types';
import { formatCurrency } from '../utils';

interface SessionExtraChargeModalProps {
  session: Session | null;
  players: Player[];
  charge: SessionExtraCharge | null;
  onClose: () => void;
  onSave: (charge: SessionExtraCharge) => void;
}

const SessionExtraChargeModal: React.FC<SessionExtraChargeModalProps> = ({ session, players, charge, onClose, onSave }) => {
  const [name, setName] = useState('Extra court time');
  const [amount, setAmount] = useState('');
  const [participants, setParticipants] = useState<number[]>([]);

  const availablePlayers = useMemo(
    () => players.filter(player => session?.participants.includes(player.id)),
    [players, session]
  );

  useEffect(() => {
    setName(charge?.name || 'Extra court time');
    setAmount(charge?.amount ? String(charge.amount) : '');
    setParticipants(charge?.participants || []);
  }, [charge, session]);

  useEffect(() => {
    if (!session) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [session, onClose]);

  if (!session) return null;

  const numericAmount = Number(amount) || 0;
  const handleSave = () => {
    if (!name.trim() || numericAmount <= 0 || participants.length === 0) return;
    onSave({
      id: charge?.id || `charge_${Date.now()}`,
      name: name.trim(),
      amount: numericAmount,
      participants
    });
  };

  return (
    <div className="modal-overlay extra-charge-overlay" onClick={onClose}>
      <div className="modal-content extra-charge-dialog" role="dialog" aria-modal="true" aria-labelledby="extra-charge-title" onClick={(e) => e.stopPropagation()}>
        <div className="extra-charge-header">
          <div className="extra-charge-heading">
            <span className="extra-charge-icon" aria-hidden="true"><i className="fas fa-receipt"></i></span>
            <div>
              <h3 id="extra-charge-title">{charge ? 'Edit group charge' : 'Add group charge'}</h3>
              <p>{session.name} · Split one amount between selected players</p>
            </div>
          </div>
          <button className="extra-charge-close" onClick={onClose} aria-label="Close group charge dialog">
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <div className="extra-charge-body">
          <div className="extra-charge-fields">
            <div className="extra-charge-field extra-charge-field-name">
              <label htmlFor="extraChargeName">Description</label>
              <input id="extraChargeName" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </div>
            <div className="extra-charge-field extra-charge-field-amount">
              <label htmlFor="extraChargeAmount">Total amount</label>
              <div className="extra-charge-money-input">
                <input id="extraChargeAmount" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
                <span>₫</span>
              </div>
            </div>
          </div>

          <div className="extra-charge-summary" aria-live="polite">
            <div className="extra-charge-summary-value">
              <strong>{participants.length}</strong>
              <span>{participants.length === 1 ? 'player selected' : 'players selected'}</span>
            </div>
            <div className="extra-charge-summary-split">
              <span>Each pays</span>
              <strong>{participants.length > 0 && numericAmount > 0 ? formatCurrency(numericAmount / participants.length) : '—'}</strong>
            </div>
          </div>

          <div className="extra-charge-people-header">
            <div>
              <h4>Choose players</h4>
              <p>Only participants from this playing day are shown.</p>
            </div>
            <div className="extra-charge-selection-actions">
              <button onClick={() => setParticipants(availablePlayers.map(p => p.id))}>Select all</button>
              <button onClick={() => setParticipants([])} disabled={participants.length === 0}>Clear</button>
            </div>
          </div>

          <div className="extra-charge-player-list">
            {availablePlayers.map(player => (
              <button
                type="button"
                key={player.id}
                className={`extra-charge-player ${participants.includes(player.id) ? 'is-selected' : ''}`}
                onClick={() => setParticipants(prev => prev.includes(player.id) ? prev.filter(id => id !== player.id) : [...prev, player.id])}
                aria-pressed={participants.includes(player.id)}
                title={player.name}
              >
                <span className="extra-charge-avatar" aria-hidden="true">{player.name.trim().charAt(0).toUpperCase()}</span>
                <span className="extra-charge-player-name">{player.name}</span>
                <span className="extra-charge-check" aria-hidden="true">
                  <i className={participants.includes(player.id) ? 'fas fa-check' : 'fas fa-plus'}></i>
                </span>
              </button>
            ))}
          </div>
          {availablePlayers.length === 0 && (
            <div className="extra-charge-empty"><i className="fas fa-user-slash"></i><span>Select the day participants first.</span></div>
          )}
        </div>
        <div className="extra-charge-footer">
          <button className="extra-charge-cancel" onClick={onClose}>Cancel</button>
          <button className="extra-charge-save" onClick={handleSave} disabled={!name.trim() || numericAmount <= 0 || participants.length === 0}>
            <i className="fas fa-check" aria-hidden="true"></i> {charge ? 'Update charge' : 'Add charge'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExtraChargeModal;
