// Local design preview; not imported by the application.
import React from 'react';
import PlayerCheckIn from './PlayerCheckIn';
import { DispatchState, Player } from '../types';

const players: Player[] = [{ id: 1, name: 'Player preview', teamName: 'Team preview', skillLevel: 2 }];
const state: DispatchState = { courtCount: 1, waitingSince: {}, matches: [] };
const states = ['default', 'hover', 'focus', 'active', 'disabled', 'loading', 'error', 'success'];

export default function PlayerCheckInPreview() {
  return <main className="dispatch-tab">{states.map(item => <div className={`checkin is-${item}`} key={item}>
    <h2>{item}</h2>
    <PlayerCheckIn players={players} state={state} busy={[]} isLocked={item === 'disabled'} pending={item === 'loading'}
      onToggle={item === 'loading' ? () => new Promise<boolean>(() => undefined) : async () => item !== 'error'} />
    {item === 'error' && <p role="alert">Could not update Player preview. Please try again.</p>}
    {item === 'success' && <p role="status">Player preview checked in.</p>}
  </div>)}</main>;
}
