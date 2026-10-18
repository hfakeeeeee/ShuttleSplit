import React, { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, jest } from '@jest/globals';
import DispatchTab from './DispatchTab';
import { applyDispatchAction, DispatchAction, gamesPlayed } from '../dispatch';
import { CourtMatch, Player, Session } from '../types';

jest.mock('./AuthContext', () => ({ useAuth: () => ({ isLocked: false }) }));
let mockUpdate: (id: number, players: Player[], action: DispatchAction) => Promise<void>;
jest.mock('../services/firestore', () => ({ updateDispatchDb: (id: number, players: Player[], action: DispatchAction) => mockUpdate(id, players, action) }));

it('lets the host edit, delete, and reset matches and updates counts in the rendered session', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
  const players: Player[] = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: `Player ${i + 1}` }));
  const completed: CourtMatch = { id: 'done', court: 1, sides: [[1, 2], [3, 4]], names: Object.fromEntries(players.map(p => [p.id, p.name])), startedAt: 1, finishedAt: 10, status: 'completed' };
  let current: Session = { id: 1, name: 'Today', participants: players.map(p => p.id), dispatch: { courtCount: 1, waitingSince: Object.fromEntries(players.map(p => [p.id, 10])), matches: [completed, { ...completed, id: 'live', sides: [[5, 6], [7, 8]], status: 'playing' }] } };
  function Fixture() {
    const [sessions, setSessions] = useState([current]);
    mockUpdate = async (_id, roster, action) => {
      current = { ...current, ...applyDispatchAction(current, roster, action, 20) };
      setSessions([current]);
    };
    return <DispatchTab players={players} sessions={sessions} onShowNotification={() => undefined} />;
  }
  const button = (selector: string, text: string) => Array.from(container.querySelectorAll<HTMLButtonElement>(selector)).find(item => item.textContent === text)!;
  try {
    act(() => root.render(<Fixture />));
    act(() => button('.dispatch-history button', 'Edit').click());
    const select = container.querySelector<HTMLSelectElement>('.match-editor .dispatch-draft-pairs select')!;
    act(() => { Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(select, '5'); select.dispatchEvent(new Event('change', { bubbles: true })); });
    await act(async () => button('.match-editor button', 'Save changes').click());
    expect(container.querySelector('.match-editor')).toBeNull();
    expect(gamesPlayed(1, current.dispatch!)).toBe(0);
    expect(gamesPlayed(5, current.dispatch!)).toBe(1);
    expect(container.querySelector('.dispatch-history')!.textContent).toContain('Player 5 + Player 2');
    await act(async () => button('.dispatch-history button', 'Delete').click());
    expect(current.dispatch!.matches.map(match => match.id)).toEqual(['live']);
    expect(gamesPlayed(5, current.dispatch!)).toBe(0);
    confirm.mockReturnValue(false);
    act(() => button('button', 'Reset session matches').click());
    expect(current.dispatch!.matches).toHaveLength(1);
    confirm.mockReturnValue(true);
    await act(async () => button('button', 'Reset session matches').click());
    expect(current.dispatch!.matches).toHaveLength(0);
    expect(current.participants).toHaveLength(8);
    expect(container.querySelectorAll('.dispatch-court.playing')).toHaveLength(0);
    expect(container.querySelector('.dispatch-metrics')!.textContent).toContain('0Matches finished');
  } finally {
    act(() => root.unmount());
    container.remove();
    confirm.mockRestore();
  }
});
