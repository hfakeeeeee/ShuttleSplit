import { db } from '../firebase';
import { collection, deleteDoc, doc, onSnapshot, query, orderBy, setDoc } from 'firebase/firestore';
import { Player, Session, AppSettings, SessionSettings } from '../types';

const playersCol = collection(db, 'players');
const sessionsCol = collection(db, 'sessions');
const settingsDocRef = doc(db, 'meta', 'settings');
const sessionSettingsDocRef = doc(db, 'meta', 'sessionSettings');

export const subscribePlayers = (cb: (players: Player[]) => void) => {
  const q = query(playersCol, orderBy('id', 'asc'));
  return onSnapshot(q, snapshot => {
    const list: Player[] = snapshot.docs.map(d => d.data() as Player);
    cb(list);
  });
};

export const addPlayerDb = async (player: Player) => {
  await setDoc(doc(playersCol, String(player.id)), player);
};

export const removePlayerDb = async (playerId: number) => {
  await deleteDoc(doc(playersCol, String(playerId)));
};

export const subscribeSessions = (cb: (sessions: Session[]) => void) => {
  const q = query(sessionsCol, orderBy('id', 'asc'));
  return onSnapshot(q, snapshot => {
    const list: Session[] = snapshot.docs.map(d => d.data() as Session);
    cb(list);
  });
};

export const setSessionDb = async (session: Session) => {
  await setDoc(doc(sessionsCol, String(session.id)), session);
};

export const deleteSessionDb = async (sessionId: number) => {
  await deleteDoc(doc(sessionsCol, String(sessionId)));
};

export const subscribeSettings = (cb: (settings: AppSettings) => void, fallback: AppSettings) => {
  return onSnapshot(settingsDocRef, snapshot => {
    if (snapshot.exists()) {
      cb(snapshot.data() as AppSettings);
    } else {
      cb(fallback);
    }
  });
};

export const saveSettingsDb = async (settings: AppSettings) => {
  await setDoc(settingsDocRef, settings);
};

export const subscribeSessionSettings = (cb: (settings: SessionSettings) => void, fallback: SessionSettings) => {
  return onSnapshot(sessionSettingsDocRef, snapshot => {
    if (snapshot.exists()) {
      cb(snapshot.data() as SessionSettings);
    } else {
      cb(fallback);
    }
  });
};

export const saveSessionSettingsDb = async (settings: SessionSettings) => {
  await setDoc(sessionSettingsDocRef, settings);
}; 