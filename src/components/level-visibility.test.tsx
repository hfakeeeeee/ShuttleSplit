import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import PlayersManagement from './PlayersManagement';
import DispatchTab from './DispatchTab';
import { Player, Session } from '../types';

let mockIsLocked = true;
jest.mock('./AuthContext', () => ({ useAuth: () => ({ isLocked: mockIsLocked }) }));
jest.mock('../services/firestore', () => ({ updateDispatchDb: async () => undefined }));

const players: Player[] = [1, 2, 3, 4].map(id => ({ id, name: `Player ${id}`, skillLevel: id }));
const sessions: Session[] = [{ id: 1, name: 'Today', participants: [1, 2, 3, 4], dispatch: {
  courtCount: 1, waitingSince: { '1': 1, '2': 2, '3': 3, '4': 4 }, matches: []
} }];
const noop = () => undefined;

describe('level visibility behind the Settings lock', () => {
  let container: HTMLDivElement;
  let root: Root;
  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    mockIsLocked = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('hides levels and an open player editor immediately when Settings is locked again', () => {
    const render = () => act(() => root.render(<PlayersManagement players={players} teams={[]}
      onAddPlayer={async () => undefined} onUpdatePlayer={async () => undefined}
      onRemovePlayer={noop} onShowNotification={noop} disabled={mockIsLocked} />));
    render();
    expect(container.textContent).not.toMatch(/Level|Skill level/);
    mockIsLocked = false;
    render();
    expect(container.textContent).toContain('Level 1');
    act(() => container.querySelector<HTMLButtonElement>('.player-actions button')!.click());
    expect(container.textContent).toContain('Level 8');
    mockIsLocked = true;
    render();
    expect(container.textContent).not.toMatch(/Level|Skill level/);
    expect(container.querySelector('.player-edit-form')).toBeNull();
    expect(container.textContent).toContain('Player 1');
  });

  it('hides queue levels, roster levels, and an open pairing preview when relocked', () => {
    const render = () => act(() => root.render(<DispatchTab players={players} sessions={sessions} onShowNotification={noop} />));
    render();
    expect(container.textContent).not.toContain('Level');
    expect(container.textContent).toContain('Player 1');
    mockIsLocked = false;
    render();
    expect(container.textContent).toContain('Level 1');
    const suggest = Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Suggest match')!;
    act(() => suggest.click());
    expect(container.textContent).toContain('Level total');
    mockIsLocked = true;
    render();
    expect(container.textContent).not.toContain('Level');
    expect(container.querySelector('.dispatch-draft')).toBeNull();
    expect(container.textContent).toContain('Player 1');
    expect(container.textContent).toContain('0 games');
  });
});
