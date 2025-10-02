import React, { useState } from 'react';
import { Player } from '../types';
import CollapsibleSection from './CollapsibleSection';

interface PlayersManagementProps {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onUpdatePlayer?: (id: number, updates: Partial<Player>) => void; // Optional for backward compatibility
  onRemovePlayer: (id: number) => void;
  onShowNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  isExpanded?: boolean;
}

const PlayersManagement: React.FC<PlayersManagementProps> = ({
  players,
  onAddPlayer,
  onUpdatePlayer,
  onRemovePlayer,
  onShowNotification,
  isExpanded
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<{id: number, name: string} | null>(null);

  const handleAddPlayer = () => {
    setShowAddForm(true);
  };

  const handleSavePlayer = () => {
    if (!playerName.trim()) {
      onShowNotification('Please enter a player name', 'error');
      return;
    }

    try {
      onAddPlayer(playerName.trim());
      setPlayerName('');
      setShowAddForm(false);
      onShowNotification('Player added successfully!', 'success');
    } catch (error) {
      onShowNotification((error as Error).message, 'error');
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setPlayerName('');
  };

  const handleRemovePlayer = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      onRemovePlayer(id);
      onShowNotification('Player removed successfully!', 'success');
    }
  };

  const handleEditPlayer = (id: number, name: string) => {
    setEditingPlayer({ id, name });
  };

  const handleSaveEdit = () => {
    if (!editingPlayer || !editingPlayer.name.trim()) {
      onShowNotification('Please enter a player name', 'error');
      return;
    }

    try {
      if (onUpdatePlayer) {
        onUpdatePlayer(editingPlayer.id, { name: editingPlayer.name.trim() });
        onShowNotification('Player updated successfully!', 'success');
      }
      setEditingPlayer(null);
    } catch (error) {
      onShowNotification((error as Error).message, 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingPlayer(null);
  };

  return (
    <CollapsibleSection
      title="Players Management"
      icon="fas fa-users"
      className="players-section"
      defaultExpanded={true}
      isExpanded={isExpanded}
    >
      <div>
        <button className="btn btn-primary" onClick={handleAddPlayer} style={{ marginBottom: '1rem' }}>
          <i className="fas fa-user-plus"></i> Add Player
        </button>
        
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

        <div className="players-grid">
          {players.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-user-plus"></i>
              <p>No players added yet. Click "Add Player" to get started.</p>
            </div>
          ) : (
            players.map(player => (
              <div key={player.id} className="player-card slide-in">
                {editingPlayer && editingPlayer.id === player.id ? (
                  <div className="player-edit-form">
                    <input
                      type="text"
                      value={editingPlayer.name}
                      onChange={(e) => setEditingPlayer({...editingPlayer, name: e.target.value})}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button className="btn btn-success btn-sm" onClick={handleSaveEdit}>
                        <i className="fas fa-check"></i>
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="player-info">
                      <div className="player-name">{player.name}</div>
                    </div>
                    <div className="player-actions">
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => handleEditPlayer(player.id, player.name)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => handleRemovePlayer(player.id, player.name)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </CollapsibleSection>
  );
};

export default PlayersManagement;
