import { CourtMatch, DispatchState, Player, Session } from './types';

export const emptyDispatch = (): DispatchState => ({ courtCount: 1, waitingSince: {}, matches: [] });
export const matchPlayers = (match: CourtMatch): number[] => [...match.sides[0], ...match.sides[1]];
export const gamesPlayed = (id: number, state: DispatchState): number =>
  state.matches.filter(match => match.status === 'completed' && matchPlayers(match).includes(id)).length;

export const waitingPlayers = (players: Player[], state: DispatchState): Player[] => {
  const busy = state.matches.filter(match => match.status === 'playing').flatMap(matchPlayers);
  return players.filter(player => state.waitingSince[String(player.id)] !== undefined && !busy.includes(player.id))
    .sort((a, b) => gamesPlayed(a.id, state) - gamesPlayed(b.id, state)
      || state.waitingSince[String(a.id)] - state.waitingSince[String(b.id)] || a.id - b.id);
};

export const suggestSides = (players: Player[], state: DispatchState): CourtMatch['sides'] | null => {
  const selected = waitingPlayers(players, state).slice(0, 4);
  if (selected.length < 4) return null;
  const [a, b, c, d] = selected.map(player => player.id);
  const options: CourtMatch['sides'][] = [[[a, b], [c, d]], [[a, c], [b, d]], [[a, d], [b, c]]];
  // Level 1 is strongest, level 8 weakest. Equal pair totals balance either direction.
  const level = (id: number) => players.find(player => player.id === id)?.skillLevel ?? 3;
  const score = (sides: CourtMatch['sides']) => {
    const difference = Math.abs(level(sides[0][0]) + level(sides[0][1]) - level(sides[1][0]) - level(sides[1][1]));
    const repeats = sides.reduce((total, side) => total + state.matches.filter(match => match.status !== 'cancelled'
      && match.sides.some(previous => previous.includes(side[0]) && previous.includes(side[1]))).length, 0);
    return difference * 10 + repeats;
  };
  return options.sort((left, right) => score(left) - score(right))[0];
};

export type DispatchAction =
  | { type: 'attendance'; playerId: number; present: boolean }
  | { type: 'courts'; count: number }
  | { type: 'start'; court: number; sides: CourtMatch['sides']; id: string }
  | { type: 'delete'; matchId: string }
  | { type: 'reset' }
  | { type: 'edit'; matchId: string; court: number; sides: CourtMatch['sides']; expected: CourtMatch }
  | { type: 'finish' | 'cancel'; matchId: string };

const reconcileQueue = (previous: DispatchState, state: DispatchState, affected: number[], now: number) => {
  const lastFinish = (data: DispatchState, id: number) => data.matches.reduce((latest, match) =>
    match.status === 'completed' && matchPlayers(match).includes(id) ? Math.max(latest, match.finishedAt || 0) : latest, 0);
  affected.forEach(id => {
    const since = previous.waitingSince[String(id)];
    if (since === undefined) return; // Historical edits must not check absent players back in.
    const before = lastFinish(previous, id);
    const after = lastFinish(state, id);
    if (before && since === before) state.waitingSince[String(id)] = after || now;
    else if (after > since) state.waitingSince[String(id)] = after;
  });
};

// Applied to the latest Firestore document inside a transaction.
export const applyDispatchAction = (session: Session, players: Player[], action: DispatchAction, now: number): Partial<Session> => {
  const previous = session.dispatch || emptyDispatch();
  const state: DispatchState = { ...previous, waitingSince: { ...previous.waitingSince }, matches: [...previous.matches] };
  const busyMatches = state.matches.filter(match => match.status === 'playing');
  if (action.type === 'reset') {
    state.matches = [];
    Object.keys(state.waitingSince).forEach(id => { state.waitingSince[id] = now; });
    return { dispatch: state };
  }
  if (action.type === 'delete' || action.type === 'edit') {
    const match = state.matches.find(item => item.id === action.matchId);
    if (!match) throw new Error('This match no longer exists.');
    if (action.type === 'delete') {
      state.matches = state.matches.filter(item => item.id !== match.id);
      reconcileQueue(previous, state, matchPlayers(match), now);
      return { dispatch: state };
    }
    const expected = action.expected;
    if (match.status !== expected.status || match.court !== expected.court || match.finishedAt !== expected.finishedAt
      || matchPlayers(match).join(',') !== matchPlayers(expected).join(',')) throw new Error('This match changed. Close the editor and open it again.');
    const ids = [...action.sides[0], ...action.sides[1]];
    const originalIds = matchPlayers(match);
    if (ids.length !== 4 || new Set(ids).size !== 4 || !ids.every(id => players.some(player => player.id === id) || originalIds.includes(id))) throw new Error('Select four different players.');
    if (!Number.isInteger(action.court) || action.court < 1 || action.court > 12) throw new Error('Choose a court between 1 and 12.');
    if (match.status === 'playing') {
      if (action.court > state.courtCount || busyMatches.some(other => other.id !== match.id && other.court === action.court)) throw new Error('This court is not available.');
      if (ids.some(id => state.waitingSince[String(id)] === undefined || busyMatches.some(other => other.id !== match.id && matchPlayers(other).includes(id)))) throw new Error('Choose checked-in players who are not on another court.');
    }
    const edited: CourtMatch = { ...match, court: action.court, sides: action.sides,
      names: Object.fromEntries(ids.map(id => [String(id), players.find(player => player.id === id)?.name || match.names[String(id)] || 'Removed player'])) };
    state.matches = state.matches.map(item => item.id === match.id ? edited : item);
    reconcileQueue(previous, state, Array.from(new Set([...originalIds, ...ids])), now);
    return { dispatch: state, participants: Array.from(new Set([...(session.participants || []), ...ids])) };
  }
  if (action.type === 'attendance') {
    if (!players.some(player => player.id === action.playerId)) throw new Error('Player no longer exists.');
    if (busyMatches.some(match => matchPlayers(match).includes(action.playerId))) throw new Error('Finish the player’s match before changing attendance.');
    if (action.present) {
      if (state.waitingSince[String(action.playerId)] === undefined) state.waitingSince[String(action.playerId)] = now;
    } else delete state.waitingSince[String(action.playerId)];
    // Attendance is retained for billing even when someone leaves the waiting queue.
    return { dispatch: state, participants: action.present
      ? Array.from(new Set([...(session.participants || []), action.playerId])) : (session.participants || []) };
  }
  if (action.type === 'courts') {
    if (!Number.isInteger(action.count) || action.count < 1 || action.count > 12) throw new Error('Choose between 1 and 12 courts.');
    if (busyMatches.some(match => match.court > action.count)) throw new Error('Finish matches on these courts before reducing the court count.');
    state.courtCount = action.count;
  } else if (action.type === 'start') {
    const ids = [...action.sides[0], ...action.sides[1]];
    const available = waitingPlayers(players, state).map(player => player.id);
    if (ids.length !== 4 || new Set(ids).size !== 4 || !ids.every(id => available.includes(id))) throw new Error('Select four different players who are waiting.');
    if (!Number.isInteger(action.court) || action.court < 1 || action.court > state.courtCount || busyMatches.some(match => match.court === action.court)) throw new Error('This court is no longer available.');
    state.matches.push({ id: action.id, court: action.court, sides: action.sides,
      names: Object.fromEntries(ids.map(id => [String(id), players.find(player => player.id === id)!.name])), startedAt: now, status: 'playing' });
  } else {
    const match = state.matches.find(item => item.id === action.matchId);
    if (!match || match.status !== 'playing') throw new Error('This match has already ended.');
    state.matches = state.matches.map(item => item.id === match.id
      ? { ...item, status: action.type === 'finish' ? 'completed' : 'cancelled', finishedAt: now } : item);
    if (action.type === 'finish') matchPlayers(match).forEach(id => { state.waitingSince[String(id)] = now; });
  }
  return { dispatch: state };
};
