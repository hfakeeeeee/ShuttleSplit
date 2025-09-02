import React, { useState, useEffect } from 'react';
import { PlayerCost, AppSettings, Session, Player } from '../types';
import Summary from './Summary';
import { formatCurrency } from '../utils';

interface SummaryTabProps {
  playerCosts: PlayerCost[];
  sessionsCount: number;
  sessions: Session[];
  players: Player[];
  settings: AppSettings;
}

interface SheetViewProps {
  sessions: Session[];
  players: Player[];
  playerCosts: PlayerCost[];
  settings: AppSettings;
}

const SheetView: React.FC<SheetViewProps> = ({ sessions, players, playerCosts, settings }) => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  const handleImageClick = (imageSrc: string) => {
    setZoomedImage(imageSrc);
  };

  const handleCloseZoom = () => {
    setZoomedImage(null);
  };

  // Handle ESC key to close zoom
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && zoomedImage) {
        handleCloseZoom();
      }
    };

    if (zoomedImage) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [zoomedImage]);

  if (players.length === 0 || sessions.length === 0) {
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

  return (
    <section className="card summary-section">
      <h2><i className="fas fa-table"></i> Sheet View</h2>
      
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
            </tr>
          </thead>
          <tbody>
              {players.map(player => {
                const playerCost = playerCosts.find(pc => pc.player.id === player.id);
                return (
                  <tr key={player.id} className="player-row">
                    <td className="player-cell">
                      <div className="player-info">
                        <span className="player-name">
                          <i className="fas fa-user"></i> {player.name}
                        </span>
                        {player.type === 'transient' && (
                          <span className="transient-badge">+10K</span>
                        )}
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
                  </tr>
                );
              })}
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
                  src="/images/Bank.jpg" 
                  alt="Bank Transfer" 
                  className="payment-qr-image" 
                  onClick={() => handleImageClick("/images/Bank.jpg")}
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
                    onClick={() => handleImageClick(settings.momoQRImage!)}
                  />
                ) : (
                  <img 
                    src="/images/Momo.jpg" 
                    alt="MoMo Transfer" 
                    className="payment-qr-image" 
                    onClick={() => handleImageClick("/images/Momo.jpg")}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div className="image-zoom-modal" onClick={handleCloseZoom}>
          <div className="image-zoom-container">
            <img 
              src={zoomedImage} 
              alt="Zoomed QR Code" 
              className="zoomed-image"
              onClick={(e) => e.stopPropagation()} 
            />
            <button className="close-zoom-btn" onClick={handleCloseZoom}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

const SummaryTab: React.FC<SummaryTabProps> = ({
  playerCosts,
  sessionsCount,
  sessions,
  players,
  settings
}) => {
  const [viewMode, setViewMode] = useState<'summary' | 'sheet'>('summary');

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

      {viewMode === 'summary' ? (
        <Summary
          playerCosts={playerCosts}
          sessionsCount={sessionsCount}
          settings={settings}
        />
      ) : (
        <SheetView
          sessions={sessions}
          players={players}
          playerCosts={playerCosts}
          settings={settings}
        />
      )}
    </div>
  );
};

export default SummaryTab;
