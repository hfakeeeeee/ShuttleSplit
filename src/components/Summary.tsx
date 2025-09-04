import React, { useState, useEffect } from 'react';
import { PlayerCost, AppSettings } from '../types';
import { formatCurrency } from '../utils';

interface SummaryProps {
  playerCosts: PlayerCost[];
  sessionsCount: number;
  settings: AppSettings;
}

const Summary: React.FC<SummaryProps> = ({
  playerCosts,
  sessionsCount,
  settings
}) => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const totalRevenue = playerCosts.reduce((sum, pc) => sum + pc.totalCost, 0);

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
      <div className="summary-content">
        <div className="summary-grid">
          {playerCosts.map(playerCost => (
            <div key={playerCost.player.id} className="summary-card fade-in">
              <div className="summary-header">
                <span className="player-summary-name">
                  <i className="fas fa-user"></i> {playerCost.player.name}
                  {playerCost.player.type === 'transient' && (
                    <span style={{ color: 'var(--warning-color)', fontSize: '0.8em' }}>
                      {' '}(+10K)
                    </span>
                  )}
                </span>
                <span className="player-total">
                  {formatCurrency(playerCost.totalCost)}
                </span>
              </div>
              <div className="session-breakdown">
                {playerCost.sessions.map((session, index) => (
                  <div key={index} className={`session-item ${!session.participated ? 'not-participated' : ''}`}>
                    <span className="session-name">
                      {session.sessionName}
                      {!session.participated && <i className="fas fa-times-circle" style={{ marginLeft: '0.5rem', color: 'var(--text-light)' }}></i>}
                    </span>
                    <span className="session-amount">
                      {session.participated ? formatCurrency(session.cost) : 'Not joined'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
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
                  onClick={() => handleImageClick(`${process.env.PUBLIC_URL}/images/Bank.jpg`)}
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
                    onClick={() => handleImageClick(settings.momoQRImage!)}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `${process.env.PUBLIC_URL}/images/Momo.jpg`;
                    }}
                  />
                ) : (
                  <img 
                    src={`${process.env.PUBLIC_URL}/images/Momo.jpg`} 
                    alt="MoMo Transfer" 
                    className="payment-qr-image" 
                    onClick={() => handleImageClick(`${process.env.PUBLIC_URL}/images/Momo.jpg`)}
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

export default Summary;
