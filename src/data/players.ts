import { Player } from '@/types/player';

export const mockPlayers: Player[] = [
  {
    id: 'p1',
    name: 'Kevin',
    avatar: 'https://picsum.photos/id/64/200/200',
    elo: 1580,
    totalMatches: 28,
    wins: 15,
    losses: 13,
    winRate: 53.6,
    isLefty: true,
    favoriteCourt: '硬地',
    lastPlayDate: '2026-05-08',
    relationship: 'rival'
  },
  {
    id: 'p2',
    name: '老王',
    avatar: 'https://picsum.photos/id/91/200/200',
    elo: 1450,
    totalMatches: 22,
    wins: 10,
    losses: 12,
    winRate: 45.5,
    isLefty: false,
    favoriteCourt: '硬地',
    lastPlayDate: '2026-05-06',
    relationship: 'partner'
  },
  {
    id: 'p3',
    name: 'Mike',
    avatar: 'https://picsum.photos/id/177/200/200',
    elo: 1520,
    totalMatches: 18,
    wins: 9,
    losses: 9,
    winRate: 50.0,
    isLefty: false,
    favoriteCourt: '草地',
    lastPlayDate: '2026-04-28',
    relationship: 'rival'
  },
  {
    id: 'p4',
    name: '张伟',
    avatar: 'https://picsum.photos/id/338/200/200',
    elo: 1490,
    totalMatches: 15,
    wins: 8,
    losses: 7,
    winRate: 53.3,
    isLefty: false,
    favoriteCourt: '红土',
    lastPlayDate: '2026-05-04',
    relationship: 'frequent'
  },
  {
    id: 'p5',
    name: '小李',
    avatar: 'https://picsum.photos/id/1027/200/200',
    elo: 1380,
    totalMatches: 10,
    wins: 4,
    losses: 6,
    winRate: 40.0,
    isLefty: true,
    favoriteCourt: '硬地',
    lastPlayDate: '2026-04-30',
    relationship: 'casual'
  },
  {
    id: 'p6',
    name: '陈教练',
    avatar: 'https://picsum.photos/id/1/200/200',
    elo: 1750,
    totalMatches: 8,
    wins: 7,
    losses: 1,
    winRate: 87.5,
    isLefty: false,
    favoriteCourt: '硬地',
    lastPlayDate: '2026-04-25',
    relationship: 'casual'
  }
];
