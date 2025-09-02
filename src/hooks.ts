import { useState, useEffect } from 'react';
import { Player, Session, AppSettings, SessionSettings } from './types';
import { saveToLocalStorage, loadFromLocalStorage } from './utils';

export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => 
    loadFromLocalStorage(key, defaultValue)
  );

  useEffect(() => {
    saveToLocalStorage(key, value);
  }, [key, value]);

  return [value, setValue] as const;
};

export const usePlayers = () => {
  const [players, setPlayers] = useLocalStorage<Player[]>('shuttleSplit_players', []);

  const addPlayer = (name: string, type: 'fixed' | 'transient') => {
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('Player with this name already exists');
    }

    const newPlayer: Player = {
      id: Date.now(),
      name,
      type
    };

    setPlayers([...players, newPlayer]);
  };

  const removePlayer = (id: number) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  return {
    players,
    addPlayer,
    removePlayer
  };
};

export const useSessions = () => {
  const [sessions, setSessions] = useLocalStorage<Session[]>('shuttleSplit_sessions', []);

  // Migrate existing sessions to ensure they have participants array and updated names
  useEffect(() => {
    const migratedSessions = sessions.map(session => {
      let updatedSession = {
        ...session,
        participants: session.participants || []
      };
      
      // Migrate session names from "Day X" format to date format
      if (session.name && session.name.startsWith('Day ') && session.date) {
        const dateObj = new Date(session.date);
        const formattedName = dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        updatedSession.name = formattedName;
      }
      
      return updatedSession;
    });
    
    // Only update if migration was needed
    if (sessions.some(s => !s.participants || (s.name && s.name.startsWith('Day ')))) {
      setSessions(migratedSessions);
    }
  }, []); // Run only once on mount

  const addSession = (selectedDate?: string) => {
    const sessionDate = selectedDate || new Date().toLocaleDateString();
    
    // Format the date for display (e.g., "Sep 1" or "Sep 15")
    const dateObj = new Date(sessionDate);
    const formattedName = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    const newSession: Session = {
      id: Date.now(),
      name: formattedName,
      date: sessionDate,
      participants: [] // Initially no participants
    };

    setSessions([...sessions, newSession]);
  };

  const removeSession = (id: number) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const updateSessionParticipants = (sessionId: number, participants: number[]) => {
    setSessions(sessions.map(session => 
      session.id === sessionId 
        ? { ...session, participants }
        : session
    ));
  };

  const updateSessionAdditionalFee = (sessionId: number, additionalFee: number) => {
    setSessions(sessions.map(session => 
      session.id === sessionId 
        ? { ...session, additionalFee }
        : session
    ));
  };

  const updateSessionWaterFee = (sessionId: number, waterFee: number) => {
    setSessions(sessions.map(session => 
      session.id === sessionId 
        ? { ...session, waterFee }
        : session
    ));
  };

  return {
    sessions,
    addSession,
    removeSession,
    updateSessionParticipants,
    updateSessionAdditionalFee,
    updateSessionWaterFee
  };
};

export const useSettings = () => {
  const [settings, setSettings] = useLocalStorage<AppSettings>('shuttleSplit_settings', {
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    momoNumber: '',
    momoQRImage: ''
  });

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  return {
    settings,
    updateSettings
  };
};

export const useSessionSettings = () => {
  const [sessionSettings, setSessionSettings] = useLocalStorage<SessionSettings>('shuttleSplit_sessionSettings', {
    courtFee: 0,
    shuttlecockPrice: 0,
    shuttlecockCount: 0
  });

  const updateSessionSettings = (newSettings: Partial<SessionSettings>) => {
    setSessionSettings({ ...sessionSettings, ...newSettings });
  };

  return {
    sessionSettings,
    updateSessionSettings
  };
};

export const useNotification = () => {
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return {
    notification,
    showNotification
  };
};
