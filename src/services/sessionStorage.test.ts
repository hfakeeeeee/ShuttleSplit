/** @jest-environment node */
import { afterAll, describe, expect, it } from '@jest/globals';
import { initializeApp, deleteApp } from 'firebase/app';
import { doc, getFirestore, terminate, writeBatch } from 'firebase/firestore';
import { applyDispatchAction, gamesPlayed, waitingPlayers } from '../dispatch';
import { Player, Session } from '../types';
import { decodeSession, encodeSessionUpdate, StoredSession } from './sessionStorage';

const app = initializeApp({ projectId: 'shuttlesplit-validation-test' }, 'session-storage-test');
const db = getFirestore(app);
const reference = doc(db, 'sessions', '1791251815674');
afterAll(async () => { await terminate(db); await deleteApp(app); });
const players: Player[] = [1, 2, 3, 4].map(id => ({ id, name: `Player ${id}` }));
const session: Session = { id: 1791251815674, name: 'Today', participants: [1, 2, 3, 4],
  dispatch: { courtCount: 1, waitingSince: { '1': 1, '2': 2, '3': 3, '4': 4 }, matches: [] } };
const start = () => applyDispatchAction(session, players, { type: 'start', court: 1, id: 'match-1', sides: [[1, 2], [3, 4]] }, 100);

describe('Firestore match storage', () => {
  it('validates edit, delete, and reset payloads with the SDK', () => {
    const started = { ...session, ...start() };
    const match = started.dispatch!.matches[0];
    const actions = [
      { type: 'edit' as const, matchId: match.id, court: 1, sides: [[1, 3], [2, 4]] as typeof match.sides, expected: match },
      { type: 'delete' as const, matchId: match.id },
      { type: 'reset' as const }
    ];
    actions.forEach(action => {
      const updates = applyDispatchAction(started, players, action, 200);
      const encoded = encodeSessionUpdate(updates);
      expect(() => writeBatch(db).update(reference, encoded)).not.toThrow();
      expect(decodeSession({ ...started, ...encoded } as StoredSession)).toEqual({ ...started, ...updates });
    });
  });
  it('reproduces the nested-array error and validates the encoded Start match payload with the Firebase SDK', () => {
    const updates = start();
    // update() validates locally. No commit or request to a real database is made.
    expect(() => writeBatch(db).update(reference, updates)).toThrow(/Nested arrays are not supported/);
    const encoded = encodeSessionUpdate(updates);
    expect(encoded.dispatch!.matches[0].sides).toEqual({ pair1: [1, 2], pair2: [3, 4] });
    expect(() => writeBatch(db).update(reference, encoded)).not.toThrow();
    expect(decodeSession({ ...session, ...encoded } as StoredSession)).toEqual({ ...session, ...updates });
  });

  it('keeps pairing, attendance, counts, and queue correct after reading and finishing a stored match', () => {
    const stored = { ...session, ...encodeSessionUpdate(start()) } as StoredSession;
    const loaded = decodeSession(stored);
    expect(waitingPlayers(players, loaded.dispatch!)).toHaveLength(0);
    expect(loaded.participants).toEqual(session.participants);
    const finished = applyDispatchAction(loaded, players, { type: 'finish', matchId: 'match-1' }, 200);
    const encoded = encodeSessionUpdate(finished);
    expect(() => writeBatch(db).update(reference, encoded)).not.toThrow();
    const reloaded = decodeSession({ ...stored, ...encoded } as StoredSession);
    expect(gamesPlayed(1, reloaded.dispatch!)).toBe(1);
    expect(waitingPlayers(players, reloaded.dispatch!)).toHaveLength(4);
  });

  it('validates cancellation and preserves sessions with no match-control data', () => {
    const loaded = decodeSession({ ...session, ...encodeSessionUpdate(start()) } as StoredSession);
    const cancelled = applyDispatchAction(loaded, players, { type: 'cancel', matchId: 'match-1' }, 200);
    const encoded = encodeSessionUpdate(cancelled);
    expect(() => writeBatch(db).update(reference, encoded)).not.toThrow();
    expect(gamesPlayed(1, decodeSession({ ...session, ...encoded } as StoredSession).dispatch!)).toBe(0);
    const legacy: Session = { id: 1, name: 'Old session', participants: [1] };
    expect(decodeSession(legacy)).toEqual(legacy);
    expect(encodeSessionUpdate({ participants: [1, 2] })).toEqual({ participants: [1, 2] });
  });
});
