import { TennisMatch } from '@/types/match';
import { OverallStats, CourtStats, MatchTypeStats } from '@/types/stats';

export function calculateOverallStats(matches: TennisMatch[]): OverallStats {
  if (matches.length === 0) {
    return {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      currentStreak: 0,
      streakType: 'none',
      elo: 1500,
      eloTrend: [],
      recentTenWinRate: 0
    };
  }

  const wins = matches.filter(m => m.result === 'win').length;
  const losses = matches.filter(m => m.result === 'lose').length;
  const winRate = Math.round((wins / matches.length) * 1000) / 10;

  let currentStreak = 0;
  let streakType: 'win' | 'lose' | 'none' = 'none';
  const sorted = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (sorted.length > 0) {
    streakType = sorted[0].result === 'win' ? 'win' : 'lose';
    for (const m of sorted) {
      if (m.result === (streakType === 'win' ? 'win' : 'lose')) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  const recentTen = sorted.slice(0, 10);
  const recentWins = recentTen.filter(m => m.result === 'win').length;
  const recentTenWinRate = recentTen.length > 0 ? Math.round((recentWins / recentTen.length) * 1000) / 10 : 0;

  const eloTrend = sorted.slice(0, 7).reverse().map((_, i) => {
    const base = 1500;
    return base + sorted.slice(0, i + 1).reduce((acc, m) => acc + m.eloChange, 0);
  });

  return {
    totalMatches: matches.length,
    wins,
    losses,
    winRate,
    currentStreak,
    streakType,
    elo: eloTrend.length > 0 ? eloTrend[eloTrend.length - 1] : 1500,
    eloTrend,
    recentTenWinRate
  };
}

export function calculateCourtStats(matches: TennisMatch[]): CourtStats[] {
  const courtMap = new Map<string, { total: number; wins: number }>();
  const courtNames: Record<string, string> = { hard: '硬地', clay: '红土', grass: '草地' };

  for (const m of matches) {
    const name = courtNames[m.courtType] || m.courtType;
    const stat = courtMap.get(name) || { total: 0, wins: 0 };
    stat.total++;
    if (m.result === 'win') stat.wins++;
    courtMap.set(name, stat);
  }

  return Array.from(courtMap.entries()).map(([courtType, stat]) => ({
    courtType,
    totalMatches: stat.total,
    winRate: Math.round((stat.wins / stat.total) * 1000) / 10
  }));
}

export function calculateMatchTypeStats(matches: TennisMatch[]): MatchTypeStats {
  const singles = matches.filter(m => m.matchType === 'singles');
  const doubles = matches.filter(m => m.matchType === 'doubles');

  const singlesWins = singles.filter(m => m.result === 'win').length;
  const doublesWins = doubles.filter(m => m.result === 'win').length;

  return {
    singlesWinRate: singles.length > 0 ? Math.round((singlesWins / singles.length) * 1000) / 10 : 0,
    doublesWinRate: doubles.length > 0 ? Math.round((doublesWins / doubles.length) * 1000) / 10 : 0,
    singlesTotal: singles.length,
    doublesTotal: doubles.length
  };
}

export function formatScore(scores: TennisMatch['scores']): string {
  return scores.map(s => `${s.mine}:${s.opponent}`).join(' ');
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h${m > 0 ? m + 'min' : ''}`;
  return `${m}min`;
}
