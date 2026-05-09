export function calculateElo(winnerRating: number, loserRating: number, kFactor: number = 32): { winnerNew: number; loserNew: number } {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 - expectedWinner;

  const winnerNew = Math.round(winnerRating + kFactor * (1 - expectedWinner));
  const loserNew = Math.round(loserRating + kFactor * (0 - expectedLoser));

  return { winnerNew, loserNew };
}

export function getEloLevel(elo: number): { level: string; levelName: string } {
  if (elo >= 1800) return { level: '5.0', levelName: '高级选手' };
  if (elo >= 1600) return { level: '4.5', levelName: '中高级选手' };
  if (elo >= 1400) return { level: '4.0', levelName: '中级选手' };
  if (elo >= 1200) return { level: '3.5', levelName: '初中级选手' };
  if (elo >= 1000) return { level: '3.0', levelName: '初级选手' };
  return { level: '2.5', levelName: '入门选手' };
}

export function getEloTrend(trend: number[]): 'up' | 'down' | 'stable' {
  if (trend.length < 2) return 'stable';
  const recent = trend.slice(-3);
  const diff = recent[recent.length - 1] - recent[0];
  if (diff > 10) return 'up';
  if (diff < -10) return 'down';
  return 'stable';
}
