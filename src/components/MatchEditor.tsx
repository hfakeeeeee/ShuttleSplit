import React, { useEffect, useRef, useState } from 'react';
import { CourtMatch, DispatchState, Player } from '../types';
import { matchPlayers } from '../dispatch';

interface Props {
  match: CourtMatch;
  state: DispatchState;
  players: Player[];
  pending: boolean;
  onSave: (court: number, sides: CourtMatch['sides']) => Promise<boolean>;
  onClose: () => void;
}

const MatchEditor: React.FC<Props> = ({ match, state, players, pending, onSave, onClose }) => {
  const [court, setCourt] = useState(match.court);
  const [ids, setIds] = useState(matchPlayers(match));
  const [error, setError] = useState('');
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    panel.current?.scrollIntoView?.({ block: 'center' });
    panel.current?.querySelector('select')?.focus({ preventScroll: true });
  }, []);
  const original = matchPlayers(match);
  const others = state.matches.filter(item => item.id !== match.id && item.status === 'playing');
  const options = players.filter(player => match.status !== 'playing' || (
    state.waitingSince[String(player.id)] !== undefined && !others.some(item => matchPlayers(item).includes(player.id))));
  original.forEach(id => {
    if (!players.some(player => player.id === id)) options.push({ id, name: match.names[String(id)] || 'Removed player' });
  });
  const save = async () => {
    setError('');
    if (await onSave(court, [[ids[0], ids[1]], [ids[2], ids[3]]])) onClose();
    else setError('Could not save the match. Check the notification and try again.');
  };
  return <section ref={panel} className="dispatch-panel dispatch-draft match-editor" aria-labelledby="edit-match-heading">
    <div className="dispatch-heading"><div><h3 id="edit-match-heading">Edit match</h3><p>Court {match.court} · {match.status} · {new Date(match.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div><button type="button" className="court-action court-action-quiet" disabled={pending} onClick={onClose}>Close</button></div>
    <p>Changing a completed match updates each player’s match count. Billing attendance is kept; added players are included.</p>
    <label className="match-editor-court">Court<select value={court} disabled={pending} onChange={event => setCourt(Number(event.target.value))}>
      {Array.from({ length: match.status === 'playing' ? state.courtCount : Math.max(state.courtCount, match.court) }, (_, index) => index + 1).map(number => <option key={number} value={number} disabled={match.status === 'playing' && others.some(item => item.court === number)}>Court {number}</option>)}
    </select></label>
    <div className="dispatch-draft-pairs">{[0, 1].map(side => <fieldset key={side}><legend>Pair {side + 1}</legend>
      {[side * 2, side * 2 + 1].map(slot => <label key={slot}>Player {slot + 1}<select value={ids[slot]} disabled={pending} onChange={event => {
        const selected = Number(event.target.value);
        setIds(ids.map((id, index) => index === slot ? selected : id === selected ? ids[slot] : id));
      }}>
        {!options.some(player => player.id === ids[slot]) && <option value={ids[slot]} disabled>{match.names[String(ids[slot])] || 'Unavailable player'}</option>}
        {options.map(player => <option key={player.id} value={player.id}>{player.name}</option>)}
      </select></label>)}
    </fieldset>)}</div>
    {error && <p role="alert">{error}</p>}
    <div className="match-editor-actions"><button type="button" className="court-action court-action-primary" disabled={pending || new Set(ids).size !== 4 || ids.some(id => !options.some(player => player.id === id))} onClick={() => void save()}>{pending ? 'Saving…' : 'Save changes'}</button><button type="button" className="court-action court-action-quiet" disabled={pending} onClick={onClose}>Discard changes</button></div>
  </section>;
};

export default MatchEditor;
