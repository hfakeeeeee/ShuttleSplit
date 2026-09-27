import { db } from '../firebase';
import { collection, deleteDoc, doc, getDocs, onSnapshot, query, orderBy, setDoc, writeBatch, DocumentReference } from 'firebase/firestore';
import { Player, Session, AppSettings, SessionSettings, SystemLog, Team, BillingMonth } from '../types';
import { getMonthId } from '../utils';

const playersCol = collection(db, 'players');
const teamsCol = collection(db, 'teams');
const sessionsCol = collection(db, 'sessions');
const settingsDocRef = doc(db, 'meta', 'settings');
const sessionSettingsDocRef = doc(db, 'meta', 'sessionSettings');
const systemLogsCol = collection(db, 'systemLogs');
const billingMonthsCol = collection(db, 'billingMonths');
const plannedSessionsCol = collection(db, 'plannedSessions');

const stripUndefined = <T extends Record<string, unknown>>(data: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
};

export const subscribePlayers = (cb: (players: Player[]) => void) => {
  const q = query(playersCol, orderBy('id', 'asc'));
  return onSnapshot(q, snapshot => {
    const list: Player[] = snapshot.docs.map(d => {
      const data = d.data();
      // Handle legacy player data that might not have hasPaid property
      return {
        id: data.id,
        name: data.name,
        teamId: data.teamId,
        teamName: data.teamName,
        hasPaid: data.hasPaid || false
      } as Player;
    });
    cb(list);
  });
};

export const addPlayerDb = async (player: Player) => {
  await setDoc(doc(playersCol, String(player.id)), stripUndefined(player as unknown as Record<string, unknown>));
};

export const removePlayerDb = async (playerId: number) => {
  await deleteDoc(doc(playersCol, String(playerId)));
};

export const subscribeTeams = (cb: (teams: Team[]) => void) => {
  const q = query(teamsCol, orderBy('name', 'asc'));
  return onSnapshot(q, snapshot => {
    const list: Team[] = snapshot.docs.map(d => d.data() as Team);
    cb(list);
  });
};

export const saveTeamDb = async (team: Team) => {
  await setDoc(doc(teamsCol, team.id), team);
};

export const deleteTeamDb = async (teamId: string) => {
  await deleteDoc(doc(teamsCol, teamId));
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

export const subscribeBillingMonths = (cb: (months: BillingMonth[]) => void) => {
  const q = query(billingMonthsCol, orderBy('id', 'asc'));
  return onSnapshot(q, snapshot => {
    cb(snapshot.docs.map(d => d.data() as BillingMonth));
  });
};

export const saveBillingMonthDb = async (month: BillingMonth) => {
  await setDoc(doc(billingMonthsCol, month.id), month);
};

export const deleteBillingMonthDataDb = async (monthId: string) => {
  const [sessionsSnapshot, plannedSessionsSnapshot] = await Promise.all([
    getDocs(sessionsCol),
    getDocs(plannedSessionsCol)
  ]);

  const targets: DocumentReference[] = [doc(billingMonthsCol, monthId)];

  sessionsSnapshot.docs.forEach(sessionDoc => {
    const data = sessionDoc.data() as Session;
    if ((data.monthId || getMonthId(data.date)) === monthId) targets.push(sessionDoc.ref);
  });

  plannedSessionsSnapshot.docs.forEach(sessionDoc => {
    const data = sessionDoc.data() as Session;
    if (getMonthId(data.date) === monthId) targets.push(sessionDoc.ref);
  });

  // Keep batches below Firestore's 500-operation limit.
  for (let index = 0; index < targets.length; index += 450) {
    const batch = writeBatch(db);
    targets.slice(index, index + 450).forEach(target => batch.delete(target));
    await batch.commit();
  }
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

// System diagnostics functions
export const subscribeSystemLogs = (cb: (logs: SystemLog[]) => void) => {
  const q = query(systemLogsCol, orderBy('updatedAt', 'desc'));
  return onSnapshot(q, snapshot => {
    const list: SystemLog[] = snapshot.docs.map(d => d.data() as SystemLog);
    cb(list);
  });
};

export const saveSystemLogDb = async (log: SystemLog) => {
  await setDoc(doc(systemLogsCol, log.id), log);
};

export const deleteSystemLogDb = async (logId: string) => {
  await deleteDoc(doc(systemLogsCol, logId));
}; 
