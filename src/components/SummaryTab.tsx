import React, { useState } from 'react';
import { PlayerCost, AppSettings, Session, Player } from '../types';
import Summary from './Summary';
import { formatCurrency } from '../utils';
import { useAuth } from './AuthContext';

interface SummaryTabProps {
  playerCosts: PlayerCost[];
  sessionsCount: number;
  sessions: Session[];
  players: Player[];
  settings: AppSettings;
  onUpdatePlayer?: (id: number, updates: Partial<Player>) => void;
}

interface SheetViewProps {
  sessions: Session[];
  players: Player[];
  playerCosts: PlayerCost[];
  settings: AppSettings;
  groupByTeam?: boolean;
  onUpdatePlayer?: (id: number, updates: Partial<Player>) => void;
}

const SheetView: React.FC<SheetViewProps> = ({ sessions, players, playerCosts, settings, groupByTeam = true, onUpdatePlayer }) => {
  // Use shared auth context instead of local state
  const { isLocked } = useAuth();
  const activePlayers = players.filter(player => {
    const playerCost = playerCosts.find(pc => pc.player.id === player.id);
    return playerCost?.sessions.some(session => session.participated) ?? false;
  });
  const groupedPlayers = activePlayers.reduce((groups, player) => {
    const teamName = player.teamName || 'No Team';
    if (!groups[teamName]) {
      groups[teamName] = [];
    }
    groups[teamName].push(player);
    return groups;
  }, {} as Record<string, Player[]>);
  const teamNames = Object.keys(groupedPlayers).sort((a, b) => {
    if (a === 'No Team') return 1;
    if (b === 'No Team') return -1;
    return a.localeCompare(b);
  });
  
  const attemptTogglePaymentStatus = (player: Player) => {
    if (isLocked) {
      // Don't show password modal, just inform the user
      alert("Settings are locked. Please unlock in the Settings tab first.");
    } else {
      updatePlayerPaymentStatus(player);
    }
  };
  
  const updatePlayerPaymentStatus = (player: Player) => {
    if (onUpdatePlayer) {
      onUpdatePlayer(player.id, { hasPaid: !player.hasPaid });
    }
  };

  if (activePlayers.length === 0 || sessions.length === 0) {
    return (
      <section className="card summary-section">
        <h2><i className="fas fa-table"></i> Sheet View</h2>
        <div className="empty-state">
          <i className="fas fa-table"></i>
          <p>Add players and sessions to see the sheet view.</p>
        </div>
      </section>
    );
  }

  // Get player cost data for easy lookup
  const getPlayerSessionCost = (playerId: number, sessionIndex: number) => {
    const playerCost = playerCosts.find(pc => pc.player.id === playerId);
    if (!playerCost) return null;
    
    const sessionCost = playerCost.sessions[sessionIndex];
    return sessionCost;
  };

  const totalRevenue = playerCosts.reduce((sum, pc) => sum + pc.totalCost, 0);
  const sortedActivePlayers = [...activePlayers].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section className="card summary-section">
      <h2><i className="fas fa-table"></i> Sheet View</h2>
      
      <div className="total-summary">
        <div className="total-revenue">
          <span className="total-label"><i className="fas fa-money-bill-wave"></i> Total Amount:</span>
          <span className="total-value">{formatCurrency(totalRevenue)}</span>
        </div>
      </div>

      <div className="sheet-view-container">
        <table className="cost-sheet">
          <thead>
            <tr>
              <th className="player-header">Player</th>
              {sessions.map((session, index) => (
                <th key={session.id} className="session-header">
                  {session.name}
                </th>
              ))}
              <th className="total-header">Total</th>
              <th className="payment-header">Paid</th>
            </tr>
          </thead>
          <tbody>
            {groupByTeam ? (
              teamNames.map(teamName => (
                <React.Fragment key={teamName}>
                  <tr className="team-group-row">
                    <td colSpan={sessions.length + 3} className="team-group-cell">
                      <i className="fas fa-people-group"></i> {teamName}
                    </td>
                  </tr>
                  {groupedPlayers[teamName].map(player => {
                    const playerCost = playerCosts.find(pc => pc.player.id === player.id);
                    return (
                      <tr key={player.id} className={`player-row ${player.hasPaid ? 'paid-row' : ''}`}>
                        <td className="player-cell">
                          <div className="player-info">
                            <span className="player-name">
                              <i className="fas fa-user"></i> {player.name}
                            </span>
                          </div>
                        </td>
                        {sessions.map((session, sessionIndex) => {
                          const sessionCost = getPlayerSessionCost(player.id, sessionIndex);
                          const participated = sessionCost?.participated ?? false;
                          
                          return (
                            <td key={session.id} className={`session-cell ${participated ? 'participated' : 'not-participated'}`}>
                              {participated ? (
                                <span className="cost-amount">
                                  {formatCurrency(sessionCost?.cost || 0)}
                                </span>
                              ) : (
                                <span className="not-joined">-</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="total-cell">
                          <span className="total-amount">
                            {formatCurrency(playerCost?.totalCost || 0)}
                          </span>
                        </td>
                        <td className="payment-cell">
                          <div className="payment-checkbox" onClick={() => attemptTogglePaymentStatus(player)}>
                            {player.hasPaid ? 
                              <i className="fas fa-check-circle payment-paid-icon"></i> : 
                              <i className="far fa-circle payment-unpaid-icon"></i>
                            }
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))
            ) : (
              sortedActivePlayers.map(player => {
                const playerCost = playerCosts.find(pc => pc.player.id === player.id);
                return (
                  <tr key={player.id} className={`player-row ${player.hasPaid ? 'paid-row' : ''}`}>
                    <td className="player-cell">
                      <div className="player-info">
                        <span className="player-name">
                          <i className="fas fa-user"></i> {player.name}
                        </span>
                      </div>
                    </td>
                    {sessions.map((session, sessionIndex) => {
                      const sessionCost = getPlayerSessionCost(player.id, sessionIndex);
                      const participated = sessionCost?.participated ?? false;
                      
                      return (
                        <td key={session.id} className={`session-cell ${participated ? 'participated' : 'not-participated'}`}>
                          {participated ? (
                            <span className="cost-amount">
                              {formatCurrency(sessionCost?.cost || 0)}
                            </span>
                          ) : (
                            <span className="not-joined">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="total-cell">
                      <span className="total-amount">
                        {formatCurrency(playerCost?.totalCost || 0)}
                      </span>
                    </td>
                    <td className="payment-cell">
                      <div className="payment-checkbox" onClick={() => attemptTogglePaymentStatus(player)}>
                        {player.hasPaid ? 
                          <i className="fas fa-check-circle payment-paid-icon"></i> : 
                          <i className="far fa-circle payment-unpaid-icon"></i>
                        }
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>

      {totalRevenue > 0 && (
        <div className="qr-section">
          <h3><i className="fas fa-qrcode"></i> Payment Options</h3>
          <div className="payment-methods">
            {/* Bank Transfer */}
            <div className="payment-method">
              <div className="payment-qr-large">
                <img 
                  src={`${process.env.PUBLIC_URL}/images/Bank.jpg`} 
                  alt="Bank Transfer" 
                  className="payment-qr-image" 
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = `${process.env.PUBLIC_URL}/images/Bank.jpg`;
                  }}
                />
              </div>
            </div>

            {/* MoMo */}
            <div className="payment-method">
              <div className="payment-qr-large">
                {settings.momoQRImage ? (
                  <img 
                    src={settings.momoQRImage} 
                    alt="MoMo Transfer" 
                    className="payment-qr-image"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `${process.env.PUBLIC_URL}/images/Momo.jpg`;
                    }}
                  />
                ) : (
                  <img 
                    src={`${process.env.PUBLIC_URL}/images/Momo.jpg`} 
                    alt="MoMo Transfer" 
                    className="payment-qr-image"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image zoom removed */}
    </section>
  );
};

const SummaryTab: React.FC<SummaryTabProps> = ({
  playerCosts,
  sessionsCount,
  sessions,
  players,
  settings,
  onUpdatePlayer
}) => {
  const [viewMode, setViewMode] = useState<'summary' | 'sheet'>('summary');
  const [groupByTeam, setGroupByTeam] = useState(true);

  return (
    <div className="tab-content fade-in">
      {/* View Mode Toggle */}
      <div className="view-toggle-container">
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'summary' ? 'active' : ''}`}
            onClick={() => setViewMode('summary')}
          >
            <i className="fas fa-chart-line"></i> Summary View
          </button>
          <button
            className={`toggle-btn ${viewMode === 'sheet' ? 'active' : ''}`}
            onClick={() => setViewMode('sheet')}
          >
            <i className="fas fa-table"></i> Sheet View
          </button>
        </div>
      </div>

      <div className="view-options-row">
        <label className="view-switch">
          <input
            type="checkbox"
            checked={groupByTeam}
            onChange={(e) => setGroupByTeam(e.target.checked)}
          />
          <span className="view-switch-track">
            <span className="view-switch-thumb"></span>
          </span>
          <span className="view-switch-label">Display by team</span>
        </label>
      </div>

      {viewMode === 'summary' ? (
        <Summary
          playerCosts={playerCosts}
          sessionsCount={sessionsCount}
          settings={settings}
          groupByTeam={groupByTeam}
          onUpdatePlayer={onUpdatePlayer}
        />
      ) : (
        <SheetView
          sessions={sessions}
          players={players}
          playerCosts={playerCosts}
          settings={settings}
          groupByTeam={groupByTeam}
          onUpdatePlayer={onUpdatePlayer}
        />
      )}
    </div>
  );
};

export default SummaryTab;
