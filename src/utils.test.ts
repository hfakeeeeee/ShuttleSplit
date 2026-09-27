import { describe, expect, it } from '@jest/globals';
import { calculatePlayerCosts, calculateSessionCosts, getMonthId } from './utils';
import { Player, Session } from './types';

describe('monthly billing', () => {
  it('derives a stable month id from ISO and localized dates', () => {
    expect(getMonthId('2026-09-15')).toBe('2026-09');
    expect(getMonthId('9/15/2026')).toBe('2026-09');
  });

  it('splits a group charge only between the selected players', () => {
    const players: Player[] = Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      name: `Player ${index + 1}`
    }));
    const session: Session = {
      id: 1,
      name: 'Sep 15',
      date: '2026-09-15',
      monthId: '2026-09',
      participants: players.map(player => player.id),
      extraCharges: [{
        id: 'extra-hour',
        name: 'Extra court hour',
        amount: 200,
        participants: [1, 2, 3, 4]
      }]
    };

    const costs = calculatePlayerCosts(
      players,
      [session],
      calculateSessionCosts({ courtFee: 1000, shuttlecockPrice: 0, shuttlecockCount: 0 }, 1)
    );

    expect(costs.find(item => item.player.id === 1)?.totalCost).toBe(150);
    expect(costs.find(item => item.player.id === 4)?.totalCost).toBe(150);
    expect(costs.find(item => item.player.id === 5)?.totalCost).toBe(100);
    expect(costs.reduce((sum, item) => sum + item.totalCost, 0)).toBe(1200);
  });
});
