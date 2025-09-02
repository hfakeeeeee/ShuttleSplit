import { Player, Session, SessionCosts, PlayerCost, SessionSettings, SessionBreakdown } from './types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const calculateSessionCosts = (settings: SessionSettings, totalSessions: number): SessionCosts => {
  // Shuttlecock cost is divided across all sessions for the whole month
  const totalShuttleFee = settings.shuttlecockPrice * settings.shuttlecockCount;
  const shuttleFeePerSession = totalSessions > 0 ? totalShuttleFee / totalSessions : 0;
  // Base cost without additional fee and water fee (both are per session now)
  const baseCostPerSession = settings.courtFee + shuttleFeePerSession;

  return {
    courtFee: settings.courtFee,
    shuttleFee: shuttleFeePerSession,
    waterFee: 0, // This will be added per session
    additionalFee: 0, // This will be added per session
    totalPerSession: baseCostPerSession // Base cost without additional fee and water fee
  };
};

export const calculatePlayerCosts = (
  players: Player[],
  sessions: Session[],
  sessionCosts: SessionCosts
): PlayerCost[] => {
  if (players.length === 0 || sessions.length === 0) {
    return [];
  }

  const playerCosts = players.map(player => {
    let totalCost = 0;
    const sessionBreakdowns: SessionBreakdown[] = [];

    sessions.forEach(session => {
      // Ensure participants array exists, default to empty array for backward compatibility
      const participants = session.participants || [];
      const isParticipating = participants.includes(player.id);
      
      if (isParticipating) {
        // Calculate cost only for participants in this session
        const participatingPlayers = players.filter(p => participants.includes(p.id));
        const participatingCount = participatingPlayers.length;
        
        if (participatingCount > 0) {
          // Add session-specific additional fee and water fee to base cost
          const sessionAdditionalFee = session.additionalFee || 0;
          const sessionWaterFee = session.waterFee || 0;
          const totalSessionCost = sessionCosts.totalPerSession + sessionAdditionalFee + sessionWaterFee;
          const baseAmountPerPlayer = totalSessionCost / participatingCount;
          
          // Transient players pay 10,000 VND more per session
          const transientSurcharge = 10000;
          const transientParticipants = participatingPlayers.filter(p => p.type === 'transient');
          const fixedParticipants = participatingPlayers.filter(p => p.type === 'fixed');
          
          let costPerSession = baseAmountPerPlayer;
          
          if (player.type === 'transient') {
            costPerSession = baseAmountPerPlayer + transientSurcharge;
          } else if (transientParticipants.length > 0 && fixedParticipants.length > 0) {
            // If there are transient players, fixed players pay slightly less
            costPerSession = baseAmountPerPlayer - (transientParticipants.length * transientSurcharge) / fixedParticipants.length;
          }
          
          const roundedCost = Math.round(costPerSession);
          totalCost += roundedCost;
          
          sessionBreakdowns.push({
            sessionName: session.name,
            cost: roundedCost,
            participated: true
          });
        } else {
          sessionBreakdowns.push({
            sessionName: session.name,
            cost: 0,
            participated: false
          });
        }
      } else {
        sessionBreakdowns.push({
          sessionName: session.name,
          cost: 0,
          participated: false
        });
      }
    });

    return {
      player,
      costPerSession: sessions.length > 0 ? Math.round(totalCost / sessions.filter(s => (s.participants || []).includes(player.id)).length) || 0 : 0,
      totalCost: Math.round(totalCost),
      sessions: sessionBreakdowns
    };
  });

  return playerCosts;
};

export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

export const generateId = (): number => {
  return Date.now() + Math.random();
};

export const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};
