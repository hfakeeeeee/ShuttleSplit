import React, { useState } from 'react';
import { Player, Session, SessionSettings, AppSettings } from '../types';

// Components
import SessionSettingsComponent from './SessionSettings';
import PlayersManagement from './PlayersManagement';
import SessionsManagement from './SessionsManagement';
import SettingsModal from './SettingsModal';
import ExpandCollapseButton from './ExpandCollapseButton';

interface SettingsTabProps {
  // Session Settings
  sessionSettings: SessionSettings;
  onUpdateSessionSettings: (settings: Partial<SessionSettings>) => void;
  
  // Players
  players: Player[];
  onAddPlayer: (name: string) => void;
  onUpdatePlayer?: (id: number, updates: Partial<Player>) => void;
  onRemovePlayer: (id: number) => void;
  
  // Sessions
  sessions: Session[];
  sessionCosts: any;
  onAddSession: (selectedDate?: string) => void;
  onRemoveSession: (id: number) => void;
  onUpdateSessionParticipants: (sessionId: number, participants: number[]) => void;
  onUpdateSessionAdditionalFee: (sessionId: number, additionalFee: number) => void;
  onUpdateSessionWaterFee: (sessionId: number, waterFee: number) => void;
  
  // App Settings
  appSettings: AppSettings;
  onUpdateAppSettings: (settings: AppSettings) => void;
  showAppSettings: boolean;
  onToggleAppSettings: () => void;
  
  // Notifications
  onShowNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  sessionSettings,
  onUpdateSessionSettings,
  players,
  onAddPlayer,
  onUpdatePlayer,
  onRemovePlayer,
  sessions,
  sessionCosts,
  onAddSession,
  onRemoveSession,
  onUpdateSessionParticipants,
  onUpdateSessionAdditionalFee,
  onUpdateSessionWaterFee,
  appSettings,
  onUpdateAppSettings,
  showAppSettings,
  onToggleAppSettings,
  onShowNotification
}) => {
  const [sectionStates, setSectionStates] = useState({
    sessionSettings: true,
    players: true,
    sessions: true
  });
  
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [isPasswordError, setIsPasswordError] = useState(false);
  
  // Get admin password from environment variables
  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';

  const toggleAllSections = () => {
    const areAllExpanded = Object.values(sectionStates).every(Boolean);
    const newState = !areAllExpanded;
    setSectionStates({
      sessionSettings: newState,
      players: newState,
      sessions: newState
    });
  };
  
  const handleSectionToggle = (section: 'sessionSettings' | 'players' | 'sessions', state: boolean) => {
    setSectionStates(prev => ({
      ...prev,
      [section]: state
    }));
  };
  
  const handleUnlock = () => {
    if (password === ADMIN_PASSWORD) {
      setIsLocked(false);
      setIsPasswordError(false);
      onShowNotification('Settings unlocked successfully', 'success');
    } else {
      setIsPasswordError(true);
      onShowNotification('Incorrect password', 'error');
    }
  };
  
  const handleLock = () => {
    setIsLocked(true);
    setPassword('');
    setIsPasswordError(false);
    onShowNotification('Settings locked', 'info');
  };

  return (
    <div className="tab-content fade-in">
      <div className="tab-header-actions">
        {/* Lock/Unlock Controls */}
        <div className={`settings-lock-controls ${isLocked ? 'locked' : ''}`}>
          {isLocked ? (
            <>
              <div className="password-input-container">
                <i className="fas fa-key password-icon"></i>
                <input 
                  type="password" 
                  className={`modern-input password-input ${isPasswordError ? 'input-error' : ''}`}
                  placeholder="Enter password to unlock"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (isPasswordError) setIsPasswordError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUnlock();
                  }}
                />
              </div>
              <button 
                className="modern-button modern-button-primary"
                onClick={handleUnlock}
              >
                <i className="fas fa-unlock"></i> Unlock
              </button>
            </>
          ) : (
            <button 
              className="modern-button modern-button-secondary"
              onClick={handleLock}
            >
              <i className="fas fa-lock"></i> Lock Settings
            </button>
          )}
        </div>
        <ExpandCollapseButton 
          isAllExpanded={Object.values(sectionStates).every(Boolean)}
          onClick={toggleAllSections}
        />
      </div>
      
      {/* Settings notification when locked */}
      {isLocked && (
        <div className="settings-locked-notification">
          <i className="fas fa-lock"></i>
          <p>Settings are locked. Enter the password to make changes.</p>
        </div>
      )}
      
      {/* Session Settings */}
      <SessionSettingsComponent
        settings={sessionSettings}
        onUpdate={(settings) => {
          if (!isLocked) onUpdateSessionSettings(settings);
        }}
        isExpanded={sectionStates.sessionSettings}
        onToggle={(state) => handleSectionToggle('sessionSettings', state)}
        disabled={isLocked}
      />

      {/* Players Management */}
      <PlayersManagement
        players={players}
        onAddPlayer={(name) => {
          if (!isLocked) onAddPlayer(name);
        }}
        onUpdatePlayer={onUpdatePlayer ? (id, updates) => {
          if (!isLocked && onUpdatePlayer) onUpdatePlayer(id, updates);
        } : undefined}
        onRemovePlayer={(id) => {
          if (!isLocked) onRemovePlayer(id);
        }}
        onShowNotification={onShowNotification}
        isExpanded={sectionStates.players}
        onToggle={(state) => handleSectionToggle('players', state)}
        disabled={isLocked}
      />

      {/* Sessions Management */}
      <SessionsManagement
        sessions={sessions}
        sessionCosts={sessionCosts}
        players={players}
        onAddSession={(selectedDate) => {
          if (!isLocked) onAddSession(selectedDate);
        }}
        onRemoveSession={(id) => {
          if (!isLocked) onRemoveSession(id);
        }}
        onUpdateSessionParticipants={(sessionId, participants) => {
          if (!isLocked) onUpdateSessionParticipants(sessionId, participants);
        }}
        onUpdateSessionAdditionalFee={(sessionId, fee) => {
          if (!isLocked) onUpdateSessionAdditionalFee(sessionId, fee);
        }}
        onUpdateSessionWaterFee={(sessionId, fee) => {
          if (!isLocked) onUpdateSessionWaterFee(sessionId, fee);
        }}
        onShowNotification={onShowNotification}
        isExpanded={sectionStates.sessions}
        onToggle={(state) => handleSectionToggle('sessions', state)}
        disabled={isLocked}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showAppSettings}
        settings={appSettings}
        onClose={onToggleAppSettings}
        onSave={onUpdateAppSettings}
        onShowNotification={onShowNotification}
      />
    </div>
  );
};

export default SettingsTab;
