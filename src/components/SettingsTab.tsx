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

  return (
    <div className="tab-content fade-in">
      <div className="tab-header-actions">
        <ExpandCollapseButton 
          isAllExpanded={Object.values(sectionStates).every(Boolean)}
          onClick={toggleAllSections}
        />
      </div>
      
      {/* Session Settings */}
      <SessionSettingsComponent
        settings={sessionSettings}
        onUpdate={onUpdateSessionSettings}
        isExpanded={sectionStates.sessionSettings}
        onToggle={(state) => handleSectionToggle('sessionSettings', state)}
      />

      {/* Players Management */}
      <PlayersManagement
        players={players}
        onAddPlayer={onAddPlayer}
        onUpdatePlayer={onUpdatePlayer}
        onRemovePlayer={onRemovePlayer}
        onShowNotification={onShowNotification}
        isExpanded={sectionStates.players}
        onToggle={(state) => handleSectionToggle('players', state)}
      />

      {/* Sessions Management */}
      <SessionsManagement
        sessions={sessions}
        sessionCosts={sessionCosts}
        players={players}
        onAddSession={onAddSession}
        onRemoveSession={onRemoveSession}
        onUpdateSessionParticipants={onUpdateSessionParticipants}
        onUpdateSessionAdditionalFee={onUpdateSessionAdditionalFee}
        onUpdateSessionWaterFee={onUpdateSessionWaterFee}
        onShowNotification={onShowNotification}
        isExpanded={sectionStates.sessions}
        onToggle={(state) => handleSectionToggle('sessions', state)}
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
