import { OverallStats, CourtStats, MatchTypeStats, AIInsight, EloInfo } from '@/types/stats';

export const mockOverallStats: OverallStats = {
  totalMatches: 42,
  wins: 26,
  losses: 16,
  winRate: 61.9,
  currentStreak: 3,
  streakType: 'win',
  elo: 1520,
  eloTrend: [1480, 1495, 1502, 1490, 1510, 1505, 1520],
  recentTenWinRate: 70.0
};

export const mockCourtStats: CourtStats[] = [
  { courtType: '硬地', totalMatches: 28, winRate: 67.9 },
  { courtType: '红土', totalMatches: 8, winRate: 37.5 },
  { courtType: '草地', totalMatches: 6, winRate: 50.0 }
];

export const mockMatchTypeStats: MatchTypeStats = {
  singlesWinRate: 58.3,
  doublesWinRate: 75.0,
  singlesTotal: 24,
  doublesTotal: 18
};

export const mockAIInsights: AIInsight[] = [
  {
    id: 'ai1',
    type: 'warning',
    title: '抢七胜率下降',
    description: '近5场抢七仅赢2场，关键分心理素质需要加强。建议在训练中模拟抢七场景。'
  },
  {
    id: 'ai2',
    type: 'trend',
    title: '第二盘容易崩',
    description: '第二盘胜率仅40%，体能和注意力在第二盘明显下降，建议加强体能训练。'
  },
  {
    id: 'ai3',
    type: 'warning',
    title: '左手选手对战表现差',
    description: '对左手选手胜率仅33%，旋转适应能力不足，建议多找左手选手练习。'
  },
  {
    id: 'ai4',
    type: 'praise',
    title: '发球进步明显',
    description: '近5场一发成功率从58%提升至68%，Ace球数量也有增加，继续保持！'
  },
  {
    id: 'ai5',
    type: 'suggestion',
    title: '红土场需专项训练',
    description: '红土胜率仅37.5%，滑步和旋转球技术需要加强，建议每周增加1次红土训练。'
  }
];

export const mockEloInfo: EloInfo = {
  current: 1520,
  level: '4.0',
  levelName: '中级选手',
  trend: 'up',
  changeThisWeek: 15,
  nearestPlayer: 'Mike',
  nearestPlayerElo: 1520
};
