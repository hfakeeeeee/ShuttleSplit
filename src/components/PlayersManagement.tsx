import React, { useState } from 'react';
import { Player } from '../types';

interface PlayersManagementProps {
  players: Player[];
  onAddPlayer: (name: string, type: 'fixed' | 'transient') => void;
  onRemovePlayer: (id: number) => void;
  onShowNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const PlayersManagement: React.FC<PlayersManagementProps> = ({
  players,
  onAddPlayer,
  onRemovePlayer,
  onShowNotification
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerType, setPlayerType] = useState<'fixed' | 'transient'>('fixed');

  const handleAddPlayer = () => {
    setShowAddForm(true);
  };

  const handleSavePlayer = () => {
    if (!playerName.trim()) {
      onShowNotification('Please enter a player name', 'error');
      return;
    }

    try {
      onAddPlayer(playerName.trim(), playerType);
      setPlayerName('');
      setPlayerType('fixed');
      setShowAddForm(false);
      onShowNotification('Player added successfully!', 'success');
    } catch (error) {
      onShowNotification((error as Error).message, 'error');
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setPlayerName('');
    setPlayerType('fixed');
  };

  const handleRemovePlayer = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      onRemovePlayer(id);
      onShowNotification('Player removed successfully!', 'success');
    }
  };

  return (
    <section className="card players-section">
      <div className="section-header">
        <h2><i className="fas fa-users"></i> Players Management</h2>
        <button className="btn btn-primary" onClick={handleAddPlayer}>
          <i className="fas fa-user-plus"></i> Add Player
        </button>
      </div>
      
      {showAddForm && (
        <div className="add-player-form fade-in">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="playerName">Player Name</label>
              <input
                type="text"
                id="playerName"
                placeholder="Enter player name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="playerType">Player Type</label>
              <select
                id="playerType"
                value={playerType}
                onChange={(e) => setPlayerType(e.target.value as 'fixed' | 'transient')}
              >
                <option value="fixed">Fixed Registration</option>
                <option value="transient">Transient (+10,000₫)</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="btn btn-success" onClick={handleSavePlayer}>
                <i className="fas fa-check"></i> Save
              </button>
              <button className="btn btn-secondary" onClick={handleCancelAdd}>
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="players-list">
        {players.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-user-plus"></i>
            <p>No players added yet. Click "Add Player" to get started.</p>
          </div>
        ) : (
          players.map(player => (
            <div key={player.id} className="player-card slide-in">
              <div className="player-info">
                <div className="player-name">{player.name}</div>
                <div className={`player-type ${player.type}`}>
                  {player.type === 'fixed' ? 'Fixed Registration' : 'Transient (+10,000₫)'}
                </div>
              </div>
              <div className="player-actions">
                <button 
                  className="btn btn-danger btn-sm" 
                  onClick={() => handleRemovePlayer(player.id, player.name)}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default PlayersManagement;
