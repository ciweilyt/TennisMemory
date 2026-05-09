export type Gender = 'male' | 'female';
export type PlayStyle = 'baseline' | 'serve_volley' | 'all_court' | 'counter_puncher';
export type PlayerRelationship = 'rival' | 'partner' | 'frequent' | 'casual';

export interface Player {
  id: string;
  name: string;
  gender: Gender;
  ntrpLevel: string;
  playStyle: PlayStyle;
  isLefty: boolean;
  favoriteCourt: string;
  avatar: string;
  elo: number;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  notes: string;
  lastPlayDate: string;
  relationship: PlayerRelationship;
  createdAt: string;
  updatedAt: string;
}

export const PLAY_STYLE_MAP: Record<PlayStyle, string> = {
  baseline: '底线型',
  serve_volley: '发球上网型',
  all_court: '全场型',
  counter_puncher: '防守反击型'
};

export const GENDER_MAP: Record<Gender, string> = {
  male: '男',
  female: '女'
};
