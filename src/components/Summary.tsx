import React from "react";
import { PlayerCost, AppSettings, Player } from "../types";
import { formatCurrency } from "../utils";

interface SummaryProps {
  playerCosts: PlayerCost[];
  sessionsCount: number;
  settings: AppSettings;
  groupByTeam?: boolean;
  onUpdatePlayer?: (id: number, updates: Partial<Player>) => void;
}

const Summary: React.FC<SummaryProps> = ({
  playerCosts,
  sessionsCount,
  settings,
  groupByTeam = true,
  onUpdatePlayer
}) => {
  // Payment status is now managed in the sheet view
  const totalRevenue = playerCosts.reduce((sum, pc) => sum + pc.totalCost, 0);
  const groupedPlayerCosts = playerCosts
    .filter(playerCost => playerCost.sessions.some(session => session.participated))
    .reduce((groups, playerCost) => {
      const teamName = playerCost.player.teamName || 'No Team';
      if (!groups[teamName]) {
        groups[teamName] = [];
      }
      groups[teamName].push(playerCost);
      return groups;
    }, {} as Record<string, PlayerCost[]>);
  const teamNames = Object.keys(groupedPlayerCosts).sort((a, b) => {
    if (a === 'No Team') return 1;
    if (b === 'No Team') return -1;
    return a.localeCompare(b);
  });

  if (playerCosts.length === 0) {
    return (
      <section className="card summary-section">
        <h2><i className="fas fa-chart-line"></i> Summary</h2>
        <div className="empty-state">
          <i className="fas fa-chart-line"></i>
          <p>Add players and sessions to see the cost breakdown.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card summary-section">
      <h2><i className="fas fa-chart-line"></i> Summary</h2>
      <div className="total-summary">
        <div className="total-revenue">
          <span className="total-label"><i className="fas fa-money-bill-wave"></i> Total Amount:</span>
          <span className="total-value">{formatCurrency(totalRevenue)}</span>
        </div>
      </div>
      <div className="summary-content">
        {groupByTeam ? (
          teamNames.map(teamName => (
            <div key={teamName} className="team-summary-group">
              <div className="team-summary-heading">
                <i className="fas fa-people-group"></i> {teamName}
              </div>
              <div className="summary-grid">
                {groupedPlayerCosts[teamName].map(playerCost => (
                  <div key={playerCost.player.id} className={`summary-card fade-in ${playerCost.player.hasPaid ? "paid-card" : ""}`}>
                    <div className="summary-header">
                      <div className="player-info">
                        <span className="player-summary-name">
                          <i className="fas fa-user"></i> {playerCost.player.name}
                        </span>
                        <span className="player-total">
                          {formatCurrency(playerCost.totalCost)}
                          {playerCost.player.hasPaid && <span className="payment-status-badge"></span>}
                        </span>
                      </div>
                    </div>
                    <div className="session-breakdown">
                      {playerCost.sessions.map((session, index) => (
                        <div key={index} className={`session-item ${!session.participated ? "not-participated" : ""}`}>
                          <span className="session-name">
                            {session.sessionName}
                            {!session.participated && <i className="fas fa-times-circle" style={{ marginLeft: "0.5rem", color: "var(--text-light)" }}></i>}
                          </span>
                          <span className="session-amount">
                            {session.participated ? formatCurrency(session.cost) : "Not joined"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="summary-grid">
            {playerCosts
              .filter(playerCost => playerCost.sessions.some(session => session.participated))
              .map(playerCost => (
                <div key={playerCost.player.id} className={`summary-card fade-in ${playerCost.player.hasPaid ? "paid-card" : ""}`}>
                  <div className="summary-header">
                    <div className="player-info">
                      <span className="player-summary-name">
                        <i className="fas fa-user"></i> {playerCost.player.name}
                      </span>
                      <span className="player-total">
                        {formatCurrency(playerCost.totalCost)}
                        {playerCost.player.hasPaid && <span className="payment-status-badge"></span>}
                      </span>
                    </div>
                  </div>
                  <div className="session-breakdown">
                    {playerCost.sessions.map((session, index) => (
                      <div key={index} className={`session-item ${!session.participated ? "not-participated" : ""}`}>
                        <span className="session-name">
                          {session.sessionName}
                          {!session.participated && <i className="fas fa-times-circle" style={{ marginLeft: "0.5rem", color: "var(--text-light)" }}></i>}
                        </span>
                        <span className="session-amount">
                          {session.participated ? formatCurrency(session.cost) : "Not joined"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
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

export default Summary;
