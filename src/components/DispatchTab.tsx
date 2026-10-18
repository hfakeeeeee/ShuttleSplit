import React, { useEffect, useState } from 'react';
import { CourtMatch, Player, Session } from '../types';
import { DispatchAction, emptyDispatch, gamesPlayed, matchPlayers, suggestSides, waitingPlayers } from '../dispatch';
import { updateDispatchDb } from '../services/firestore';
import { useAuth } from './AuthContext';
import PlayerCheckIn from './PlayerCheckIn';
import MatchEditor from './MatchEditor';
import './dispatch-styles.css';

interface Props {
  players: Player[];
  sessions: Session[];
  onShowNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const DispatchTab: React.FC<Props> = ({ players, sessions, onShowNotification }) => {
  const { isLocked } = useAuth();
  const [sessionId, setSessionId] = useState('');
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState<{ court: number; ids: number[] } | null>(null);
  const [clock, setClock] = useState(Date.now());
  const [editingMatch, setEditingMatch] = useState<CourtMatch | null>(null);
  const session = sessions.find(item => String(item.id) === sessionId);
  const state = session?.dispatch || emptyDispatch();
  const waiting = waitingPlayers(players, state);
  const activeMatches = state.matches.filter(match => match.status === 'playing');
  const busy = activeMatches.reduce<number[]>((ids, match) => [...ids, ...matchPlayers(match)], []);
  const disabled = pending || isLocked;

  useEffect(() => {
    if (!sessions.some(item => String(item.id) === sessionId)) {
      const today = new Date().toLocaleDateString('en-CA');
      const initial = sessions.find(item => item.date === today) || sessions[sessions.length - 1];
      setSessionId(initial ? String(initial.id) : '');
      setDraft(null);
      setEditingMatch(null);
    }
  }, [sessions, sessionId]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const act = async (action: DispatchAction) => {
    if (!session || disabled) return false;
    setPending(true);
    try {
      await updateDispatchDb(session.id, players, action);
      if (action.type === 'start' || action.type === 'reset') setDraft(null);
      if (action.type === 'reset') setEditingMatch(null);
      return true;
    } catch (error) {
      onShowNotification((error as Error).message || 'Unable to save. Please try again.', 'error');
      return false;
    } finally { setPending(false); }
  };

  const name = (id: number, match?: CourtMatch) => match?.names[String(id)] || players.find(player => player.id === id)?.name || 'Removed player';
  const minutes = (since: number) => Math.max(0, Math.floor((clock - since) / 60000));
  const suggest = (court: number) => {
    setEditingMatch(null);
    const sides = suggestSides(players, state);
    if (sides) setDraft({ court, ids: [...sides[0], ...sides[1]] });
  };
  const editMatch = (match: CourtMatch) => { setDraft(null); setEditingMatch(match); };
  const deleteMatch = (match: CourtMatch) => {
    if (window.confirm(`Delete this ${match.status} match on Court ${match.court}? It will be removed from history and completed-match counts will be recalculated. Billing attendance is kept.`)) {
      void act({ type: 'delete', matchId: match.id }).then(success => { if (success && editingMatch?.id === match.id) setEditingMatch(null); });
    }
  };

  return <div className="dispatch-tab tab-content fade-in">
    <div className="dispatch-heading">
      <div><h2>Match control</h2><p>Check in players, balance pairs, and keep everyone playing.</p></div>
      <label>Session<select value={sessionId} disabled={pending} onChange={event => { setSessionId(event.target.value); setDraft(null); setEditingMatch(null); }}>
        <option value="" disabled>Select a session</option>
        {sessions.map(item => <option key={item.id} value={item.id}>{item.name}{item.date ? ` · ${item.date}` : ''}</option>)}
      </select></label>
    </div>
    {isLocked && <p className="dispatch-notice" role="status">Host controls are locked. Unlock in Settings & Configuration to make changes.</p>}
    {!session ? <div className="dispatch-panel empty-state"><h3>No session selected</h3><p>Create a playing session in Settings for this month, then check in your players here.</p></div> : <>
      <div className="dispatch-metrics">
        <div><strong>{Object.keys(state.waitingSince).filter(id => players.some(player => String(player.id) === id)).length}</strong><span>Checked in</span></div>
        <div><strong>{waiting.length}</strong><span>Waiting</span></div>
        <div><strong>{activeMatches.length}</strong><span>Courts playing</span></div>
        <div><strong>{state.matches.filter(match => match.status === 'completed').length}</strong><span>Matches finished</span></div>
      </div>
      <section className="dispatch-panel court-board" aria-labelledby="courts-heading">
        <div className="court-toolbar">
          <div><h3 id="courts-heading">Courts</h3><p>{activeMatches.length} playing <span aria-hidden="true">·</span> {state.courtCount - activeMatches.length} available</p></div>
          <div className="court-count"><span id="court-count-label">Courts</span><div role="group" aria-labelledby="court-count-label">
            <button type="button" aria-label="Remove a court" disabled={disabled || state.courtCount <= 1 || activeMatches.some(match => match.court === state.courtCount)} onClick={() => { setDraft(null); void act({ type: 'courts', count: state.courtCount - 1 }); }}><span aria-hidden="true">−</span></button>
            <output aria-label="Number of courts">{String(state.courtCount).padStart(2, '0')}</output>
            <button type="button" aria-label="Add a court" disabled={disabled || state.courtCount >= 12} onClick={() => { setDraft(null); void act({ type: 'courts', count: state.courtCount + 1 }); }}><span aria-hidden="true">+</span></button>
          </div></div>
        </div>
        <div className="dispatch-courts">{Array.from({ length: state.courtCount }, (_, index) => {
          const court = index + 1;
          const match = activeMatches.find(item => item.court === court);
          return <article className={`dispatch-court ${match ? 'playing' : ''}`} key={court}>
            <div className="court-identity"><span className="court-number" aria-hidden="true">{String(court).padStart(2, '0')}</span><div><h4>Court {court}</h4><span className="court-status"><span aria-hidden="true"/>{match ? 'Playing' : 'Available'}</span></div></div>
            {match ? <>
              <div className="court-live"><div className="dispatch-pairs">{match.sides.map((side, sideIndex) => <React.Fragment key={sideIndex}>{sideIndex === 1 && <span className="dispatch-vs">vs</span>}<div><span className="court-pair-label">Pair {sideIndex + 1}</span>{side.map(id => <strong key={id}>{name(id, match)}</strong>)}</div></React.Fragment>)}</div><span className="court-duration"><i className="far fa-clock" aria-hidden="true"/> {minutes(match.startedAt)} min on court</span></div>
              <div className="court-actions"><button type="button" className="court-action court-action-primary" disabled={disabled} onClick={() => void act({ type: 'finish', matchId: match.id })}><i className="fas fa-check" aria-hidden="true"/>Finish match</button>
                {!isLocked && <div className="match-row-actions"><button type="button" disabled={pending} onClick={() => editMatch(match)}>Edit</button><button type="button" className="match-delete" disabled={pending} onClick={() => deleteMatch(match)}>Delete</button></div>}
                <button type="button" className="court-action court-action-quiet" disabled={disabled} onClick={() => { if (window.confirm('Cancel this match? It will not count toward played matches.')) void act({ type: 'cancel', matchId: match.id }); }}>Cancel match</button></div>
            </> : <>
              <div className="court-ready"><svg className="court-outline" viewBox="0 0 72 44" fill="none" aria-hidden="true"><rect x="1" y="1" width="70" height="42" rx="2"/><path d="M36 1v42M1 8h70M1 36h70M22 1v42M50 1v42M1 22h21m28 0h21"/></svg><div><strong>{waiting.length < 4 ? 'Waiting for players' : 'Ready for the next match'}</strong><p>{waiting.length < 4 ? `${waiting.length} of 4 players ready · Check in ${4 - waiting.length} more` : `${waiting.length} players waiting · Doubles`}</p></div></div>
              <div className="court-actions"><button type="button" className="court-action court-action-primary" disabled={disabled || waiting.length < 4} onClick={() => suggest(court)}>Suggest match<i className="fas fa-arrow-right" aria-hidden="true"/></button></div>
            </>}
          </article>;
        })}</div>
      </section>
      {!isLocked && editingMatch && <MatchEditor key={editingMatch.id} match={editingMatch} state={state} players={players} pending={pending}
        onClose={() => setEditingMatch(null)} onSave={(court, sides) => act({ type: 'edit', matchId: editingMatch.id, court, sides, expected: editingMatch })} />}
      {!isLocked && draft && <section className="dispatch-panel dispatch-draft" aria-label="Review next match">
        <div className="dispatch-heading"><h3>Next match · Court {draft.court}</h3><button className="btn btn-secondary" disabled={pending} onClick={() => setDraft(null)}>Close</button></div>
        <p>Fewest completed matches first, then longest wait. Adjust either pair before starting.</p>
        <div className="dispatch-draft-pairs">{[0, 1].map(side => <fieldset key={side}><legend>Pair {side + 1} · Level total {draft.ids.slice(side * 2, side * 2 + 2).reduce((sum, id) => sum + (players.find(player => player.id === id)?.skillLevel ?? 3), 0)}</legend>
          {[side * 2, side * 2 + 1].map(slot => <label key={slot}>Player {slot + 1}<select disabled={disabled} value={draft.ids[slot]} onChange={event => { const selected = Number(event.target.value); setDraft({ ...draft, ids: draft.ids.map((id, index) => index === slot ? selected : id === selected ? draft.ids[slot] : id) }); }}>
            {!waiting.some(player => player.id === draft.ids[slot]) && <option value={draft.ids[slot]} disabled>{name(draft.ids[slot])} · Unavailable</option>}
            {waiting.map(player => <option key={player.id} value={player.id}>{player.name} · Level {player.skillLevel ?? 3} · {gamesPlayed(player.id, state)} games</option>)}
          </select></label>)}
        </fieldset>)}</div>
        <button className="btn btn-primary" disabled={disabled || new Set(draft.ids).size !== 4 || !draft.ids.every(id => waiting.some(player => player.id === id)) || activeMatches.some(match => match.court === draft.court) || draft.court > state.courtCount} onClick={() => void act({ type: 'start', court: draft.court, sides: [[draft.ids[0], draft.ids[1]], [draft.ids[2], draft.ids[3]]], id: `match_${Date.now()}_${Math.random().toString(36).slice(2)}` })}>{pending ? 'Saving…' : 'Start match'}</button>
      </section>}
      <div className="dispatch-columns">
        <PlayerCheckIn key={session.id} players={players} state={state} busy={busy} isLocked={isLocked} pending={pending}
          onToggle={(playerId, present) => act({ type: 'attendance', playerId, present })} />
        <section className="dispatch-panel"><h3>Waiting queue</h3><p>Ordered by matches played, then check-in / last finish time.</p>
          {!waiting.length && <p className="dispatch-empty">No players waiting. Check in players below.</p>}
          <ol className="dispatch-queue">{waiting.map(player => <li key={player.id}><div><strong>{player.name}</strong><small>{!isLocked && <>Level {player.skillLevel ?? 3}{player.skillLevel === undefined ? ' (default)' : ''} · </>}Waiting {minutes(state.waitingSince[String(player.id)])} min</small></div><span>{gamesPlayed(player.id, state)} games</span></li>)}</ol>
        </section>
      </div>
      <section className="dispatch-panel"><div className="dispatch-heading"><div><h3>Match history</h3><p>Completed matches count toward each player’s total for this session.</p></div>
        {!isLocked && <button type="button" className="court-action match-reset" disabled={pending || !state.matches.length} onClick={() => {
          if (window.confirm(`Reset all ${state.matches.length} matches for ${session.name}${session.date ? ` (${session.date})` : ''}? This deletes playing, completed, and cancelled matches, clears all match counts, and frees every court. Check-in and billing data are kept. This cannot be undone.`)) void act({ type: 'reset' });
        }}>Reset session matches</button>}
      </div>
        {!state.matches.some(match => match.status !== 'playing') && <p className="dispatch-empty">No finished matches yet.</p>}
        <div className="dispatch-history">{state.matches.filter(match => match.status !== 'playing').slice().reverse().map(match => <div key={match.id}><div className="dispatch-heading"><strong>Court {match.court} · {match.status === 'completed' ? 'Completed' : 'Cancelled'}</strong>{!isLocked && <div className="match-row-actions"><button type="button" disabled={pending} onClick={() => editMatch(match)}>Edit</button><button type="button" className="match-delete" disabled={pending} onClick={() => deleteMatch(match)}>Delete</button></div>}</div><span>{match.sides.map(side => side.map(id => name(id, match)).join(' + ')).join(' vs ')}</span><small>{new Date(match.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {Math.max(0, Math.floor(((match.finishedAt || match.startedAt) - match.startedAt) / 60000))} min</small></div>)}</div>
      </section>
    </>}
  </div>;
};

export default DispatchTab;
