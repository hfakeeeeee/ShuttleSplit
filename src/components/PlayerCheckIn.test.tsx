import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import PlayerCheckIn from './PlayerCheckIn';
import { DispatchState, Player } from '../types';

const players: Player[] = [
  { id: 1, name: 'Đặng Minh', teamId: 'a', teamName: 'Sáng', skillLevel: 1 },
  { id: 2, name: 'Ngọc Anh', teamId: 'b', teamName: 'Tối', skillLevel: 8 },
  { id: 3, name: 'Bảo', skillLevel: 3 },
  { id: 4, name: 'Long', skillLevel: 4 }
];
const state: DispatchState = { courtCount: 1, waitingSince: { '1': 1, '2': 2 }, matches: [] };

describe('player check-in', () => {
  let container: HTMLDivElement;
  let root: Root;
  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => { act(() => root.unmount()); container.remove(); });
  const clickFilter = (label: string) => {
    const button = Array.from(container.querySelectorAll<HTMLButtonElement>('.checkin-filters button')).find(item => item.textContent!.startsWith(label))!;
    act(() => button.click());
  };
  const setValue = (selector: string, value: string, tag: typeof HTMLInputElement | typeof HTMLSelectElement) => {
    const element = container.querySelector(selector)!;
    act(() => {
      Object.getOwnPropertyDescriptor(tag.prototype, 'value')!.set!.call(element, value);
      element.dispatchEvent(new Event(tag === HTMLInputElement ? 'input' : 'change', { bubbles: true }));
    });
  };

  it('combines accent-insensitive search, status, and team filters and recovers from empty results', () => {
    act(() => root.render(<PlayerCheckIn players={players} state={state} busy={[2]} isLocked={false} pending={false} onToggle={async () => true} />));
    setValue('input[type="search"]', 'DANG', HTMLInputElement);
    expect(container.querySelectorAll('.checkin-player')).toHaveLength(1);
    expect(container.querySelector('.checkin-player')!.textContent).toContain('Đặng Minh');
    clickFilter('Not here');
    expect(container.textContent).toContain('No players found');
    act(() => Array.from(container.querySelectorAll('button')).find(item => item.textContent === 'Clear filters')!.click());
    expect(container.querySelectorAll('.checkin-player')).toHaveLength(4);
    clickFilter('Playing');
    expect(container.querySelectorAll('.checkin-player')).toHaveLength(1);
    expect(container.querySelector('.checkin-player')!.textContent).toContain('Ngọc Anh');
    clickFilter('All');
    setValue('.checkin-team select', 'none', HTMLSelectElement);
    expect(container.querySelectorAll('.checkin-player')).toHaveLength(2);
  });

  it('paginates large rosters and resets the page when a filter changes', () => {
    const many = Array.from({ length: 25 }, (_, index) => ({ id: index + 10, name: `Player ${String(index).padStart(2, '0')}` }));
    act(() => root.render(<PlayerCheckIn players={many} state={state} busy={[]} isLocked={true} pending={false} onToggle={async () => true} />));
    expect(container.querySelectorAll('.checkin-player')).toHaveLength(12);
    act(() => container.querySelector<HTMLButtonElement>('[aria-label="Next player page"]')!.click());
    expect(container.querySelector('.checkin-pagination')!.textContent).toContain('Page 2 of 3');
    clickFilter('Waiting');
    expect(container.querySelector('.checkin-pagination')).toBeNull();
    clickFilter('All');
    expect(container.querySelector('.checkin-pagination')!.textContent).toContain('Page 1 of 3');
  });

  it('sends the attendance action, shows errors, and blocks changes for playing or locked players', async () => {
    const toggle = jest.fn(async (_id: number, _present: boolean) => false);
    const render = (locked: boolean) => act(() => root.render(<PlayerCheckIn players={players} state={state} busy={[2]} isLocked={locked} pending={false} onToggle={toggle} />));
    render(false);
    expect(container.querySelector<HTMLButtonElement>('[aria-label="Playing Ngọc Anh"]')!.disabled).toBe(true);
    await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Check in Bảo"]')!.click());
    expect(toggle).toHaveBeenCalledWith(3, true);
    expect(container.querySelector('[role="alert"]')!.textContent).toContain('Could not update Bảo');
    render(true);
    expect(container.textContent).not.toContain('Level');
    expect(Array.from(container.querySelectorAll<HTMLButtonElement>('.checkin-toggle')).every(button => button.disabled)).toBe(true);
  });
});
