import { useState, useEffect } from 'react';
import { Player, Session, AppSettings, SessionSettings } from './types';
import { formatCurrency } from './utils';
import { subscribePlayers, addPlayerDb, removePlayerDb, subscribeSessions, setSessionDb, deleteSessionDb, subscribeSettings, saveSettingsDb, subscribeSessionSettings, saveSessionSettingsDb } from './services/firestore';

export const usePlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const unsub = subscribePlayers(setPlayers);
    return () => unsub();
  }, []);

  const addPlayer = async (name: string, type: 'fixed' | 'transient') => {
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('Player with this name already exists');
    }
    const newPlayer: Player = { id: Date.now(), name, type };
    setPlayers(prev => [...prev, newPlayer]);
    await addPlayerDb(newPlayer);
  };

  const removePlayer = async (id: number) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
    await removePlayerDb(id);
  };

  return { players, addPlayer, removePlayer };
};

export const useSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const unsub = subscribeSessions(setSessions);
    return () => unsub();
  }, []);

  const addSession = async (selectedDate?: string) => {
    const sessionDate = selectedDate || new Date().toLocaleDateString();
    const dateObj = new Date(sessionDate);
    const formattedName = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const newSession: Session = { id: Date.now(), name: formattedName, date: sessionDate, participants: [] };
    setSessions(prev => [...prev, newSession]);
    await setSessionDb(newSession);
  };

  const removeSession = async (id: number) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    await deleteSessionDb(id);
  };

  const updateSessionParticipants = async (sessionId: number, participants: number[]) => {
    const updated = sessions.map(s => s.id === sessionId ? { ...s, participants } : s);
    setSessions(updated);
    const session = updated.find(s => s.id === sessionId)!;
    await setSessionDb(session);
  };

  const updateSessionAdditionalFee = async (sessionId: number, additionalFee: number) => {
    const updated = sessions.map(s => s.id === sessionId ? { ...s, additionalFee } : s);
    setSessions(updated);
    const session = updated.find(s => s.id === sessionId)!;
    await setSessionDb(session);
  };

  const updateSessionWaterFee = async (sessionId: number, waterFee: number) => {
    const updated = sessions.map(s => s.id === sessionId ? { ...s, waterFee } : s);
    setSessions(updated);
    const session = updated.find(s => s.id === sessionId)!;
    await setSessionDb(session);
  };

  return { sessions, addSession, removeSession, updateSessionParticipants, updateSessionAdditionalFee, updateSessionWaterFee };
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>({ bankName: '', accountNumber: '', accountHolder: '', momoNumber: '', momoQRImage: '' });

  useEffect(() => {
    const unsub = subscribeSettings(setSettings, settings);
    return () => unsub();
  }, []);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const merged = { ...settings, ...newSettings } as AppSettings;
    setSettings(merged);
    await saveSettingsDb(merged);
  };

  return { settings, updateSettings };
};

export const useSessionSettings = () => {
  const [sessionSettings, setSessionSettings] = useState<SessionSettings>({ courtFee: 0, shuttlecockPrice: 0, shuttlecockCount: 0 });

  useEffect(() => {
    const unsub = subscribeSessionSettings(setSessionSettings, sessionSettings);
    return () => unsub();
  }, []);

  const updateSessionSettings = async (newSettings: Partial<SessionSettings>) => {
    const merged = { ...sessionSettings, ...newSettings } as SessionSettings;
    setSessionSettings(merged);
    await saveSessionSettingsDb(merged);
  };

  return { sessionSettings, updateSessionSettings };
};

export const useNotification = () => {
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info'; } | null>(null);
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  return { notification, showNotification };
};
