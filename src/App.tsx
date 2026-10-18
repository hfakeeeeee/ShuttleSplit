import React, { useState, useMemo, lazy, Suspense } from 'react';
import './App.css';
import './components/player-styles.css';
import './components/register-styles.css';
import './components/settings-lock-styles.css';

// Components
import Header from './components/Header';
import Tabs from './components/Tabs';
import SettingsTab from './components/SettingsTab';
import SummaryTab from './components/SummaryTab';
import DispatchTab from './components/DispatchTab';
import Notification from './components/Notification';
import Footer from './components/Footer';
import MonthSelector from './components/MonthSelector';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './components/AuthContext';

// Hooks
import { usePlayers, useSessions, useSettings, useSessionSettings, useNotification, useTeams, useBillingMonths } from './hooks';

// Utils
import { calculateSessionCosts, calculatePlayerCosts, getMonthId } from './utils';
import { BillingMonth, Player, SessionSettings } from './types';

// Lazy load system diagnostics
const SystemDiagnostics = lazy(() => import('./components/CodeVaultTab'));

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [activeMonthId, setActiveMonthId] = useState(() => getMonthId());
  
  // Custom hooks
  const { players, addPlayer, updatePlayer, removePlayer } = usePlayers();
  const { teams, addTeam, updateTeam, removeTeam } = useTeams(players, updatePlayer);
  const { sessions, addSession, removeSession, updateSessionParticipants, updateSessionAdditionalFee, updateSessionWaterFee, updateSessionExtraCharges } = useSessions();
  const { settings, updateSettings } = useSettings();
  const { sessionSettings: legacySessionSettings } = useSessionSettings();
  const { months, saveMonth, deleteMonth } = useBillingMonths();
  const { notification, showNotification } = useNotification();
  
  // No longer need local state for planned sessions - using Firestore

  const activeMonth = months.find(month => month.id === activeMonthId);
  const activeSessionSettings = activeMonth?.settings || legacySessionSettings;
  const monthSessions = useMemo(
    () => sessions.filter(session => (session.monthId || getMonthId(session.date)) === activeMonthId),
    [sessions, activeMonthId]
  );
  const legacyMonthId = useMemo(() => {
    const ids = sessions.map(session => session.monthId || getMonthId(session.date)).sort();
    return ids[ids.length - 1] || getMonthId();
  }, [sessions]);
  const monthlyPlayers = useMemo(() => players.map(player => ({
    ...player,
    hasPaid: activeMonth
      ? Boolean(activeMonth.payments[String(player.id)])
      : activeMonthId === legacyMonthId ? Boolean(player.hasPaid) : false
  })), [players, activeMonth, activeMonthId, legacyMonthId]);
  const availableMonthIds = useMemo(() => Array.from(new Set([
    getMonthId(),
    activeMonthId,
    ...months.map(month => month.id),
    ...sessions.map(session => session.monthId || getMonthId(session.date))
  ])).sort((a, b) => b.localeCompare(a)), [activeMonthId, months, sessions]);

  const sessionCosts = useMemo(() => calculateSessionCosts(activeSessionSettings, monthSessions.length), [activeSessionSettings, monthSessions.length]);
  const playerCosts = useMemo(() => calculatePlayerCosts(monthlyPlayers, monthSessions, sessionCosts), [monthlyPlayers, monthSessions, sessionCosts]);

  const legacyPayments = () => Object.fromEntries(players.filter(player => player.hasPaid).map(player => [String(player.id), true]));
  const buildMonth = (id: string, settingsForMonth: SessionSettings, payments: Record<string, boolean> = {}): BillingMonth => ({
    id,
    settings: settingsForMonth,
    payments,
    createdAt: Date.now()
  });

  const handleCreateMonth = async (monthId: string) => {
    const startingPayments = monthId === legacyMonthId && !months.some(month => month.id === monthId)
      ? legacyPayments()
      : {};
    await saveMonth(buildMonth(monthId, { ...activeSessionSettings }, startingPayments));
    setActiveMonthId(monthId);
    showNotification('New month created with the previous fee settings', 'success');
  };

  const handleDeleteMonth = async (monthId: string) => {
    await deleteMonth(monthId);
    const fallbackMonthId = availableMonthIds.find(id => id !== monthId) || getMonthId();
    setActiveMonthId(fallbackMonthId);
    showNotification('Month and all related data deleted', 'success');
  };

  const handleUpdateMonthSettings = async (updates: Partial<SessionSettings>) => {
    const baseMonth = activeMonth || buildMonth(
      activeMonthId,
      activeSessionSettings,
      activeMonthId === legacyMonthId ? legacyPayments() : {}
    );
    await saveMonth({ ...baseMonth, settings: { ...baseMonth.settings, ...updates } });
  };

  const handleUpdateMonthlyPlayer = async (id: number, updates: Partial<Player>) => {
    if (updates.hasPaid === undefined) return;
    const baseMonth = activeMonth || buildMonth(
      activeMonthId,
      activeSessionSettings,
      activeMonthId === legacyMonthId ? legacyPayments() : {}
    );
    await saveMonth({
      ...baseMonth,
      payments: { ...baseMonth.payments, [String(id)]: updates.hasPaid }
    });
  };
  
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
        setActiveTab('dispatch');
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
      <AuthProvider>
        <div className="App">
          <div className="container">
            <Header />

          {/* Tabs Navigation */}
          <Tabs activeTab={activeTab} onTabChange={handleTabChange} />

          <MonthSelector
            activeMonthId={activeMonthId}
            monthIds={availableMonthIds}
            initializedMonthIds={months.map(month => month.id)}
            onSelect={setActiveMonthId}
            onCreate={handleCreateMonth}
            onDelete={handleDeleteMonth}
            canDelete={Boolean(activeMonth) || monthSessions.length > 0}
          />

          <main className="main-content">
            {activeTab === 'summary' && (
              <SummaryTab
                playerCosts={playerCosts}
                sessionsCount={monthSessions.length}
                sessions={monthSessions}
                players={monthlyPlayers}
                settings={settings}
                onUpdatePlayer={handleUpdateMonthlyPlayer}
              />
            )}
            
            {activeTab === 'dispatch' && (
              <DispatchTab
                players={players}
                sessions={monthSessions}
                onShowNotification={showNotification}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                sessionSettings={activeSessionSettings}
                onUpdateSessionSettings={handleUpdateMonthSettings}
                players={players}
                teams={teams}
                onAddPlayer={addPlayer}
                onUpdatePlayer={updatePlayer}
                onRemovePlayer={removePlayer}
                onAddTeam={addTeam}
                onUpdateTeam={updateTeam}
                onRemoveTeam={removeTeam}
                sessions={monthSessions}
                sessionCosts={sessionCosts}
                onAddSession={(selectedDate) => addSession(selectedDate, activeMonthId)}
                onRemoveSession={removeSession}
                onUpdateSessionParticipants={updateSessionParticipants}
                onUpdateSessionAdditionalFee={updateSessionAdditionalFee}
                onUpdateSessionWaterFee={updateSessionWaterFee}
                onUpdateSessionExtraCharges={updateSessionExtraCharges}
                activeMonthId={activeMonthId}
                appSettings={settings}
                onUpdateAppSettings={handleUpdateAppSettings}
                showAppSettings={showAppSettings}
                onToggleAppSettings={handleToggleAppSettings}
                onShowNotification={showNotification}
              />
            )}

            {activeTab === 'diag' && (
              <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>}>
                <SystemDiagnostics
                  onShowNotification={showNotification}
                />
              </Suspense>
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
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
