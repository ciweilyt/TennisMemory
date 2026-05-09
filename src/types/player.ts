export interface Player {
  id: string;
  name: string;
  avatar: string;
  elo: number;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  isLefty: boolean;
  favoriteCourt: string;
  lastPlayDate: string;
  relationship: PlayerRelationship;
}

export type PlayerRelationship = 'rival' | 'partner' | 'frequent' | 'casual';

export interface PlayerStats {
  vsRecord: {
    wins: number;
    losses: number;
  };
  recentResults: boolean[];
  avgScoreDiff: number;
}
