import React, { useState } from 'react';
import { Player, Team } from '../types';
import CollapsibleSection from './CollapsibleSection';

interface PlayersManagementProps {
  players: Player[];
  teams: Team[];
  onAddPlayer: (name: string, team?: Team | null) => Promise<void>;
  onUpdatePlayer?: (id: number, updates: Partial<Player>) => Promise<void>; // Optional for backward compatibility
  onRemovePlayer: (id: number) => void;
  onShowNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  isExpanded?: boolean;
  onToggle?: (isExpanded: boolean) => void;
  disabled?: boolean;
}

const PlayersManagement: React.FC<PlayersManagementProps> = ({
  players,
  teams,
  onAddPlayer,
  onUpdatePlayer,
  onRemovePlayer,
  onShowNotification,
  isExpanded,
  onToggle,
  disabled = false
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<{id: number, name: string, teamId: string} | null>(null);
  const [localExpanded, setLocalExpanded] = useState(true);
  
  const handleToggle = (newState: boolean) => {
    setLocalExpanded(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  const handleAddPlayer = () => {
    if (!disabled) {
      setShowAddForm(true);
    }
  };

  const handleSavePlayer = async () => {
    if (!playerName.trim()) {
      onShowNotification('Please enter a player name', 'error');
      return;
    }

    try {
      const selectedTeam = teams.find(team => team.id === selectedTeamId) || null;
      await onAddPlayer(playerName.trim(), selectedTeam);
      setPlayerName('');
      setSelectedTeamId('');
      setShowAddForm(false);
      onShowNotification('Player added successfully!', 'success');
    } catch (error) {
      onShowNotification((error as Error).message, 'error');
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setPlayerName('');
    setSelectedTeamId('');
  };

  const handleRemovePlayer = (id: number, name: string) => {
    if (disabled) return;
    
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      onRemovePlayer(id);
      onShowNotification('Player removed successfully!', 'success');
    }
  };

  const handleEditPlayer = (player: Player) => {
    if (!disabled) {
      setEditingPlayer({ id: player.id, name: player.name, teamId: player.teamId || '' });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPlayer || !editingPlayer.name.trim()) {
      onShowNotification('Please enter a player name', 'error');
      return;
    }

    try {
      if (onUpdatePlayer) {
        const team = teams.find(item => item.id === editingPlayer.teamId);
        await onUpdatePlayer(editingPlayer.id, {
          name: editingPlayer.name.trim(),
          teamId: team?.id,
          teamName: team?.name
        });
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
      className={`players-section ${disabled ? 'disabled-section' : ''}`}
      defaultExpanded={true}
      isExpanded={isExpanded !== undefined ? isExpanded : localExpanded}
      onToggle={handleToggle}
    >
      <div>
        <button 
          className="btn btn-primary" 
          onClick={handleAddPlayer} 
          style={{ marginBottom: '1rem' }}
          disabled={disabled}
        >
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
              <div className="form-group">
                <label htmlFor="playerTeam">Team</label>
                <select
                  id="playerTeam"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                >
                  <option value="">No team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
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
                    <select
                      value={editingPlayer.teamId}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, teamId: e.target.value })}
                    >
                      <option value="">No team</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
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
                      {player.teamName && (
                        <div className="player-team-badge">
                          <span className="player-team-label">Team</span>
                          <span className="player-team-name">
                            <i className="fas fa-people-group"></i> {player.teamName}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="player-actions">
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => handleEditPlayer(player)}
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
