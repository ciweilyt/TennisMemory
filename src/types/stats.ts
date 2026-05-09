export interface OverallStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  streakType: 'win' | 'lose' | 'none';
  elo: number;
  eloTrend: number[];
  recentTenWinRate: number;
}

export interface CourtStats {
  courtType: string;
  totalMatches: number;
  winRate: number;
}

export interface MatchTypeStats {
  singlesWinRate: number;
  doublesWinRate: number;
  singlesTotal: number;
  doublesTotal: number;
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'warning' | 'praise' | 'suggestion';
  title: string;
  description: string;
}

export interface EloInfo {
  current: number;
  level: string;
  levelName: string;
  trend: 'up' | 'down' | 'stable';
  changeThisWeek: number;
  nearestPlayer: string;
  nearestPlayerElo: number;
}
