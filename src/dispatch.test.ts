import { describe, expect, it } from '@jest/globals';
import { applyDispatchAction, emptyDispatch, gamesPlayed, suggestSides, waitingPlayers } from './dispatch';
import { CourtMatch, DispatchState, Player, Session } from './types';

const players: Player[] = [1, 2, 3, 4, 5, 6].map(id => ({ id, name: `P${id}`, skillLevel: id < 3 ? 1 : 8 }));
const checkedIn = (): DispatchState => ({ ...emptyDispatch(), waitingSince: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6 } });
const match: CourtMatch = { id: 'm1', court: 1, sides: [[1, 3], [2, 4]], names: {}, startedAt: 10, status: 'playing' };
const session = (dispatch: DispatchState): Session => ({ id: 1, name: 'Today', participants: [1, 2, 3, 4, 5, 6], dispatch });

describe('host match control', () => {
  it('deletes a completed match, reduces all four counts, and restores queue timing from remaining history', () => {
    const older = { ...match, id: 'older', status: 'completed' as const, finishedAt: 50 };
    const latest = { ...match, status: 'completed' as const, finishedAt: 100 };
    const state = { ...checkedIn(), waitingSince: { '1': 100, '2': 100, '3': 100, '4': 100, '5': 5, '6': 6 }, matches: [older, latest] };
    const result = applyDispatchAction(session(state), players, { type: 'delete', matchId: match.id }, 200);
    [1, 2, 3, 4].forEach(id => expect(gamesPlayed(id, result.dispatch!)).toBe(1));
    expect(result.dispatch!.waitingSince['1']).toBe(50);
    expect(result.participants).toBeUndefined();
    expect(state.matches).toHaveLength(2);
  });

  it('deletes a live match and frees its players while keeping other courts occupied', () => {
    const other = { ...match, id: 'other', court: 2, sides: [[5, 6], [7, 8]] as CourtMatch['sides'] };
    const state = { ...checkedIn(), courtCount: 2, matches: [match, other] };
    const result = applyDispatchAction(session(state), players, { type: 'delete', matchId: match.id }, 200).dispatch!;
    expect(result.matches).toEqual([other]);
    expect(waitingPlayers(players, result).map(player => player.id)).toEqual([1, 2, 3, 4]);
    expect(gamesPlayed(1, result)).toBe(0);
  });

  it('transfers a completed match count to replacement players without checking absent people in', () => {
    const completed = { ...match, status: 'completed' as const, finishedAt: 100 };
    const state = { ...checkedIn(), matches: [completed] };
    delete state.waitingSince['5'];
    const result = applyDispatchAction(session(state), players, { type: 'edit', matchId: match.id, court: 2, sides: [[5, 3], [2, 4]], expected: completed }, 200);
    expect(gamesPlayed(1, result.dispatch!)).toBe(0);
    expect(gamesPlayed(5, result.dispatch!)).toBe(1);
    expect(result.dispatch!.waitingSince['5']).toBeUndefined();
    expect(result.dispatch!.matches[0].finishedAt).toBe(100);
    expect(result.dispatch!.matches[0].names['5']).toBe('P5');
  });

  it('validates edits against duplicate players, stale matches, occupied courts, and players on other courts', () => {
    const state = { ...checkedIn(), courtCount: 2, matches: [match] };
    expect(() => applyDispatchAction(session(state), players, { type: 'edit', matchId: match.id, court: 1, sides: [[1, 1], [3, 4]], expected: match }, 200)).toThrow();
    expect(() => applyDispatchAction(session(state), players, { type: 'edit', matchId: match.id, court: 1, sides: match.sides, expected: { ...match, status: 'completed' } }, 200)).toThrow(/changed/);
    const other = { ...match, id: 'other', court: 2, sides: [[5, 6], [7, 8]] as CourtMatch['sides'] };
    const twoCourts = { ...state, matches: [match, other] };
    expect(() => applyDispatchAction(session(twoCourts), players, { type: 'edit', matchId: match.id, court: 2, sides: match.sides, expected: match }, 200)).toThrow(/court/);
    expect(() => applyDispatchAction(session(twoCourts), players, { type: 'edit', matchId: match.id, court: 1, sides: [[5, 3], [2, 4]], expected: match }, 200)).toThrow(/another court/);
  });

  it('resets the whole session match history and counters while keeping check-in, courts, and billing data', () => {
    const original = { ...session({ ...checkedIn(), courtCount: 3, matches: [match, { ...match, id: 'done', status: 'completed' as const, finishedAt: 100 }] }), waterFee: 5000 };
    const result = applyDispatchAction(original, players, { type: 'reset' }, 200);
    const reset = { ...original, ...result };
    expect(reset.dispatch!.matches).toEqual([]);
    expect(reset.dispatch!.courtCount).toBe(3);
    expect(Object.keys(reset.dispatch!.waitingSince)).toHaveLength(6);
    expect(reset.dispatch!.waitingSince['1']).toBe(200);
    players.forEach(player => expect(gamesPlayed(player.id, reset.dispatch!)).toBe(0));
    expect(waitingPlayers(players, reset.dispatch!)).toHaveLength(6);
    expect(reset.participants).toEqual(original.participants);
    expect(reset.waterFee).toBe(5000);
    expect(original.dispatch!.matches).toHaveLength(2);
  });

  it('selects the longest waiting four and balances the two pairs', () => {
    const sides = suggestSides(players, checkedIn())!;
    expect([...sides[0], ...sides[1]].sort()).toEqual([1, 2, 3, 4]);
    const levels = sides.map(side => side.reduce((sum, id) => sum + players.find(player => player.id === id)!.skillLevel!, 0));
    expect(levels).toEqual([9, 9]);
  });

  it('prefers fresh partners when level balance is equal', () => {
    const state = checkedIn();
    const equalPlayers = players.map(player => ({ ...player, skillLevel: 3 }));
    const first = suggestSides(equalPlayers, state)!;
    state.matches = [{ ...match, sides: first, status: 'completed' }];
    // Equalize game counts to isolate the pairing choice.
    const next = suggestSides(equalPlayers.slice(0, 4), state)!;
    expect(next).not.toEqual(first);
  });

  it('counts only completed matches and moves finished players behind those with fewer games', () => {
    const state = { ...checkedIn(), matches: [match] };
    expect(waitingPlayers(players, state).map(player => player.id)).toEqual([5, 6]);
    const finished = applyDispatchAction(session(state), players, { type: 'finish', matchId: match.id }, 100).dispatch!;
    expect(gamesPlayed(1, finished)).toBe(1);
    expect(finished.waitingSince['1']).toBe(100);
    expect(waitingPlayers(players, finished).map(player => player.id)).toEqual([5, 6, 1, 2, 3, 4]);
    expect(() => applyDispatchAction(session(finished), players, { type: 'finish', matchId: match.id }, 101)).toThrow();
  });

  it('rejects occupied courts, busy players, duplicate players, and stale drafts', () => {
    const state = { ...checkedIn(), courtCount: 2, matches: [match] };
    expect(() => applyDispatchAction(session(state), players, { type: 'start', court: 1, id: 'm2', sides: [[1, 2], [5, 6]] }, 20)).toThrow();
    expect(() => applyDispatchAction(session(checkedIn()), players, { type: 'start', court: 1, id: 'm2', sides: [[1, 1], [2, 3]] }, 20)).toThrow();
    const left = applyDispatchAction(session(checkedIn()), players, { type: 'attendance', playerId: 1, present: false }, 20);
    expect(() => applyDispatchAction({ ...session(checkedIn()), ...left }, players, { type: 'start', court: 1, id: 'm2', sides: [[1, 2], [3, 4]] }, 21)).toThrow();
  });

  it('preserves billing attendance on checkout and does not count cancelled games', () => {
    const state = { ...checkedIn(), matches: [match] };
    expect(() => applyDispatchAction(session(state), players, { type: 'attendance', playerId: 1, present: false }, 20)).toThrow();
    const cancelled = applyDispatchAction(session(state), players, { type: 'cancel', matchId: match.id }, 20).dispatch!;
    expect(gamesPlayed(1, cancelled)).toBe(0);
    expect(cancelled.waitingSince['1']).toBe(1);
    const left = applyDispatchAction(session(cancelled), players, { type: 'attendance', playerId: 1, present: false }, 21);
    expect(left.dispatch!.waitingSince['1']).toBeUndefined();
    expect(left.participants).toContain(1);
  });

  it('prevents hiding a live court and returns no suggestion with fewer than four available', () => {
    const state = { ...checkedIn(), courtCount: 2, matches: [{ ...match, court: 2 }] };
    expect(() => applyDispatchAction(session(state), players, { type: 'courts', count: 1 }, 20)).toThrow();
    expect(suggestSides(players, state)).toBeNull();
  });
});
