import React from 'react';
import { Player, Session, SessionSettings, AppSettings } from '../types';

// Components
import SessionSettingsComponent from './SessionSettings';
import PlayersManagement from './PlayersManagement';
import SessionsManagement from './SessionsManagement';
import SettingsModal from './SettingsModal';

interface SettingsTabProps {
  // Session Settings
  sessionSettings: SessionSettings;
  onUpdateSessionSettings: (settings: Partial<SessionSettings>) => void;
  
  // Players
  players: Player[];
  onAddPlayer: (name: string, type: 'fixed' | 'transient') => void;
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
  return (
    <div className="tab-content fade-in">
      {/* Session Settings */}
      <SessionSettingsComponent
        settings={sessionSettings}
        onUpdate={onUpdateSessionSettings}
      />

      {/* Players Management */}
      <PlayersManagement
        players={players}
        onAddPlayer={onAddPlayer}
        onRemovePlayer={onRemovePlayer}
        onShowNotification={onShowNotification}
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
