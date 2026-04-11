import React, { useState } from 'react';
import { Team } from '../types';
import CollapsibleSection from './CollapsibleSection';

interface TeamsManagementProps {
  teams: Team[];
  onAddTeam: (name: string) => Promise<void>;
  onUpdateTeam: (id: string, updates: Partial<Team>) => Promise<void>;
  onRemoveTeam: (id: string) => Promise<void>;
  onShowNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  isExpanded?: boolean;
  onToggle?: (isExpanded: boolean) => void;
  disabled?: boolean;
}

const TeamsManagement: React.FC<TeamsManagementProps> = ({
  teams,
  onAddTeam,
  onUpdateTeam,
  onRemoveTeam,
  onShowNotification,
  isExpanded,
  onToggle,
  disabled = false
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [editingTeam, setEditingTeam] = useState<{ id: string; name: string } | null>(null);
  const [localExpanded, setLocalExpanded] = useState(true);

  const handleToggle = (newState: boolean) => {
    setLocalExpanded(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  const handleSaveTeam = async () => {
    if (!teamName.trim()) {
      onShowNotification('Please enter a team name', 'error');
      return;
    }

    try {
      await onAddTeam(teamName.trim());
      setTeamName('');
      setShowAddForm(false);
      onShowNotification('Team added successfully!', 'success');
    } catch (error) {
      onShowNotification((error as Error).message, 'error');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTeam || !editingTeam.name.trim()) {
      onShowNotification('Please enter a team name', 'error');
      return;
    }

    try {
      await onUpdateTeam(editingTeam.id, { name: editingTeam.name.trim() });
      setEditingTeam(null);
      onShowNotification('Team updated successfully!', 'success');
    } catch (error) {
      onShowNotification((error as Error).message, 'error');
    }
  };

  const handleRemoveTeam = async (team: Team) => {
    if (disabled) return;

    if (window.confirm(`Are you sure you want to remove team ${team.name}? Players in this team will become unassigned.`)) {
      try {
        await onRemoveTeam(team.id);
        onShowNotification('Team removed successfully!', 'success');
      } catch (error) {
        onShowNotification((error as Error).message, 'error');
      }
    }
  };

  return (
    <CollapsibleSection
      title="Teams Management"
      icon="fas fa-flag"
      className={`players-section ${disabled ? 'disabled-section' : ''}`}
      defaultExpanded={true}
      isExpanded={isExpanded !== undefined ? isExpanded : localExpanded}
      onToggle={handleToggle}
    >
      <div>
        <button
          className="btn btn-primary"
          onClick={() => !disabled && setShowAddForm(true)}
          style={{ marginBottom: '1rem' }}
          disabled={disabled}
        >
          <i className="fas fa-plus"></i> Add Team
        </button>

        {showAddForm && (
          <div className="add-player-form fade-in">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="teamName">Team Name</label>
                <input
                  type="text"
                  id="teamName"
                  placeholder="Enter team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-actions">
                <button className="btn btn-success" onClick={handleSaveTeam}>
                  <i className="fas fa-check"></i> Save
                </button>
                <button className="btn btn-secondary" onClick={() => {
                  setShowAddForm(false);
                  setTeamName('');
                }}>
                  <i className="fas fa-times"></i> Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="players-grid">
          {teams.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-people-group"></i>
              <p>No teams created yet. Click "Add Team" to get started.</p>
            </div>
          ) : (
            teams.map(team => (
              <div key={team.id} className="player-card slide-in">
                {editingTeam && editingTeam.id === team.id ? (
                  <div className="player-edit-form">
                    <input
                      type="text"
                      value={editingTeam.name}
                      onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button className="btn btn-success btn-sm" onClick={handleSaveEdit}>
                        <i className="fas fa-check"></i>
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingTeam(null)}>
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="player-info">
                      <div className="player-name">
                        <i className="fas fa-flag"></i> {team.name}
                      </div>
                    </div>
                    <div className="player-actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => !disabled && setEditingTeam({ id: team.id, name: team.name })}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveTeam(team)}
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

export default TeamsManagement;
