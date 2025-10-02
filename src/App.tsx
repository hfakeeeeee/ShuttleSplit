import React, { useState, useMemo } from 'react';
import './App.css';
import './components/player-styles.css';
import './components/register-styles.css';
import './components/settings-lock-styles.css';
import { Session } from './types';

// Components
import Header from './components/Header';
import Tabs from './components/Tabs';
import SettingsTab from './components/SettingsTab';
import SummaryTab from './components/SummaryTab';
import RegisterTab from './components/RegisterTab';
import Notification from './components/Notification';
import Footer from './components/Footer';
import { ThemeProvider } from './components/ThemeProvider';

// Hooks
import { usePlayers, useSessions, useSettings, useSessionSettings, useNotification } from './hooks';

// Utils
import { calculateSessionCosts, calculatePlayerCosts } from './utils';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [showAppSettings, setShowAppSettings] = useState(false);
  
  // Custom hooks
  const { players, addPlayer, updatePlayer, removePlayer } = usePlayers();
  const { sessions, addSession, removeSession, updateSessionParticipants, updateSessionAdditionalFee, updateSessionWaterFee } = useSessions();
  const { settings, updateSettings } = useSettings();
  const { sessionSettings, updateSessionSettings } = useSessionSettings();
  const { notification, showNotification } = useNotification();
  
  // No longer need local state for planned sessions - using Firestore

  // Calculations
  const sessionCosts = useMemo(() => calculateSessionCosts(sessionSettings, sessions.length), [sessionSettings, sessions.length]);
  const playerCosts = useMemo(() => calculatePlayerCosts(players, sessions, sessionCosts), [players, sessions, sessionCosts]);
  
  // No longer saving to localStorage - using Firestore instead

  // Event handlers
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleToggleAppSettings = () => {
    setShowAppSettings(!showAppSettings);
  };

  const handleUpdateAppSettings = (newSettings: typeof settings) => {
    updateSettings(newSettings);
    setShowAppSettings(false);
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAppSettings(false);
      }
      
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        showNotification('Data saved!', 'success');
      }

      // Tab switching shortcuts
      if (e.ctrlKey && e.key === '1') {
        e.preventDefault();
        setActiveTab('summary');
      }
      
      if (e.ctrlKey && e.key === '2') {
        e.preventDefault();
        setActiveTab('register');
      }
      
      if (e.ctrlKey && e.key === '3') {
        e.preventDefault();
        setActiveTab('settings');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showNotification]);

  return (
    <ThemeProvider>
      <div className="App">
        <div className="container">
          <Header />

          {/* Tabs Navigation */}
          <Tabs activeTab={activeTab} onTabChange={handleTabChange} hasRegisterTab={true} />

          <main className="main-content">
            {activeTab === 'summary' && (
              <SummaryTab
                playerCosts={playerCosts}
                sessionsCount={sessions.length}
                sessions={sessions}
                players={players}
                settings={settings}
                onUpdatePlayer={updatePlayer}
              />
            )}
            
            {activeTab === 'register' && (
              <RegisterTab
                players={players}
                onShowNotification={showNotification}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                sessionSettings={sessionSettings}
                onUpdateSessionSettings={updateSessionSettings}
                players={players}
                onAddPlayer={addPlayer}
                onUpdatePlayer={updatePlayer}
                onRemovePlayer={removePlayer}
                sessions={sessions}
                sessionCosts={sessionCosts}
                onAddSession={addSession}
                onRemoveSession={removeSession}
                onUpdateSessionParticipants={updateSessionParticipants}
                onUpdateSessionAdditionalFee={updateSessionAdditionalFee}
                onUpdateSessionWaterFee={updateSessionWaterFee}
                appSettings={settings}
                onUpdateAppSettings={handleUpdateAppSettings}
                showAppSettings={showAppSettings}
                onToggleAppSettings={handleToggleAppSettings}
                onShowNotification={showNotification}
              />
            )}
          </main>

          {/* Notification */}
          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
            />
          )}
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default App;
