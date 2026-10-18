import { CourtMatch, DispatchState, Session } from '../types';

type StoredCourtMatch = Omit<CourtMatch, 'sides'> & {
  sides: { pair1: [number, number]; pair2: [number, number] };
};
type StoredDispatchState = Omit<DispatchState, 'matches'> & { matches: StoredCourtMatch[] };
export type StoredSession = Omit<Session, 'dispatch'> & { dispatch?: StoredDispatchState };

// Firestore accepts arrays inside maps, but not arrays directly inside arrays.
export const encodeSessionUpdate = (updates: Partial<Session>): Partial<StoredSession> => {
  const { dispatch, ...fields } = updates;
  if (!dispatch) return fields;
  return { ...fields, dispatch: { ...dispatch, matches: dispatch.matches.map(match => ({
    ...match, sides: { pair1: match.sides[0], pair2: match.sides[1] }
  })) } };
};

export const decodeSession = (stored: StoredSession | Session): Session => {
  if (!stored.dispatch) return stored as Session;
  return { ...stored, dispatch: { ...stored.dispatch, matches: stored.dispatch.matches.map(match => ({
    ...match,
    sides: Array.isArray(match.sides) ? match.sides : [match.sides.pair1, match.sides.pair2]
  })) } };
};
