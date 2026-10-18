import React, { useState } from 'react';
import { DispatchState, Player } from '../types';
import { gamesPlayed } from '../dispatch';
import './player-check-in.css';

interface Props {
  players: Player[];
  state: DispatchState;
  busy: number[];
  isLocked: boolean;
  pending: boolean;
  onToggle: (id: number, present: boolean) => Promise<boolean>;
}

type Status = 'all' | 'absent' | 'waiting' | 'playing';
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLocaleLowerCase().trim();
const PAGE_SIZE = 12;

const PlayerCheckIn: React.FC<Props> = ({ players, state, busy, isLocked, pending, onToggle }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Status>('all');
  const [team, setTeam] = useState('');
  const [page, setPage] = useState(0);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);
  const status = (id: number): Exclude<Status, 'all'> => busy.includes(id) ? 'playing'
    : state.waitingSince[String(id)] !== undefined ? 'waiting' : 'absent';
  const counts = players.reduce((result, player) => { result[status(player.id)]++; return result; }, { absent: 0, waiting: 0, playing: 0 });
  const teams = Array.from(new Map(players.filter(player => player.teamId).map(player => [player.teamId!, player.teamName || 'Unnamed team'])).entries()).sort((a, b) => a[1].localeCompare(b[1]));
  const query = normalize(search);
  const filtered = players.filter(player => (filter === 'all' || status(player.id) === filter)
    && (!team || (team === 'none' ? !player.teamId : player.teamId === team))
    && normalize(`${player.name} ${player.teamName || ''}`).includes(query))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi') || a.id - b.id);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages - 1);
  const visible = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const tabs: { id: Status; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: players.length },
    { id: 'absent', label: 'Not here', count: counts.absent },
    { id: 'waiting', label: 'Waiting', count: counts.waiting },
    { id: 'playing', label: 'Playing', count: counts.playing }
  ];
  const resetFilters = () => { setSearch(''); setFilter('all'); setTeam(''); setPage(0); };
  const toggle = async (player: Player) => {
    if (pending || savingId !== null || isLocked || busy.includes(player.id)) return;
    const present = status(player.id) === 'absent';
    setSavingId(player.id);
    setFeedback(null);
    try {
      const success = await onToggle(player.id, present);
      setFeedback({ success, text: success ? `${player.name} ${present ? 'checked in' : 'left the queue'}.` : `Could not update ${player.name}. Please try again.` });
    } catch {
      setFeedback({ success: false, text: `Could not update ${player.name}. Please try again.` });
    } finally { setSavingId(null); }
  };

  return <section className="dispatch-panel checkin" aria-labelledby="checkin-heading" data-state={savingId !== null ? 'loading' : feedback ? feedback.success ? 'success' : 'error' : 'default'}>
    <div className="checkin-heading"><div><h3 id="checkin-heading">Player check-in</h3><p>Find a player. Tap to check in.</p></div><span className="checkin-total"><strong>{counts.waiting + counts.playing}</strong> / {players.length} here</span></div>
    <div className="checkin-tools">
      <label className="checkin-search">Find player
        <span><i className="fas fa-search" aria-hidden="true"/><input type="search" value={search} placeholder="Name or team…" autoComplete="off" onChange={event => { setSearch(event.target.value); setPage(0); }}/></span>
      </label>
      <label className="checkin-team">Team<select value={team} onChange={event => { setTeam(event.target.value); setPage(0); }}><option value="">All teams</option>{teams.map(([id, name]) => <option key={id} value={id}>{name}</option>)}<option value="none">No team</option></select></label>
    </div>
    <div className="checkin-filters" role="group" aria-label="Filter players by status">{tabs.map(tab => <button key={tab.id} type="button" aria-pressed={filter === tab.id} onClick={() => { setFilter(tab.id); setPage(0); }}>{tab.label}<span>{tab.count}</span></button>)}</div>
    <div className="checkin-results" role="status">{filtered.length === players.length ? `${players.length} players · A–Z` : `${filtered.length} of ${players.length} players · A–Z`}</div>
    <div className="checkin-grid" aria-busy={savingId !== null}>{visible.map(player => {
      const playerStatus = status(player.id);
      const court = state.matches.find(match => match.status === 'playing' && match.sides.some(side => side.includes(player.id)))?.court;
      const initials = player.name.trim().split(/\s+/).slice(-2).map(part => part[0]).join('').toUpperCase();
      return <article className="checkin-player" data-status={playerStatus} key={player.id}>
        <div className="checkin-identity"><span className="checkin-avatar" aria-hidden="true">{initials}</span><div><h4>{player.name}</h4><span className="checkin-team-name">{player.teamName || 'No team'}</span></div><span className="checkin-game-count">{gamesPlayed(player.id, state)} games</span></div>
        <div className="checkin-player-bottom"><span className="checkin-status"><span aria-hidden="true"/>{playerStatus === 'playing' ? `Court ${court ?? '—'}` : playerStatus === 'waiting' ? 'Waiting' : 'Not here'}</span>
          {!isLocked && <small className="checkin-level">Level {player.skillLevel ?? 3}</small>}
          <button type="button" className="checkin-toggle" disabled={isLocked || pending || savingId !== null || playerStatus === 'playing'} aria-label={`${playerStatus === 'playing' ? 'Playing' : playerStatus === 'absent' ? 'Check in' : 'Check out'} ${player.name}`} onClick={() => void toggle(player)}>
            <i className={`fas ${savingId === player.id ? 'fa-hourglass-half' : playerStatus === 'absent' ? 'fa-plus' : playerStatus === 'waiting' ? 'fa-check' : 'fa-table-tennis'}`} aria-hidden="true"/>{savingId === player.id ? 'Saving…' : playerStatus === 'absent' ? 'Check in' : playerStatus === 'waiting' ? 'Check out' : 'On court'}
          </button>
        </div>
      </article>;
    })}</div>
    {!visible.length && <div className="checkin-empty"><i className={`fas ${players.length ? 'fa-search' : 'fa-users'}`} aria-hidden="true"/><h4>{players.length ? 'No players found' : 'No players yet'}</h4><p>{players.length ? 'Try another name or change the filters.' : 'Add players in Settings to start checking in.'}</p>{players.length > 0 && <button type="button" onClick={resetFilters}>Clear filters</button>}</div>}
    {pages > 1 && <nav className="checkin-pagination" aria-label="Player pages"><span>Page {currentPage + 1} of {pages}</span><div><button type="button" aria-label="Previous player page" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}><i className="fas fa-chevron-left" aria-hidden="true"/> Previous</button><button type="button" aria-label="Next player page" disabled={currentPage === pages - 1} onClick={() => setPage(currentPage + 1)}>Next <i className="fas fa-chevron-right" aria-hidden="true"/></button></div></nav>}
    <div className="checkin-feedback" role={feedback?.success === false ? 'alert' : 'status'}>{feedback && <><i className={`fas ${feedback.success ? 'fa-check-circle' : 'fa-exclamation-circle'}`} aria-hidden="true"/> {feedback.text}</>}</div>
    <details className="checkin-help"><summary>About attendance & billing</summary><p>Check-in adds a player to this session’s billing attendance. Checking out only removes them from the queue; their attendance is kept. Edit billing attendance in Settings if needed.</p></details>
  </section>;
};

export default PlayerCheckIn;
