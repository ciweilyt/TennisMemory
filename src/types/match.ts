export type MatchType = 'singles' | 'doubles';
export type CourtType = 'hard' | 'clay' | 'grass';
export type MatchResult = 'win' | 'lose';
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'hot';

export interface SetScore {
  mine: number;
  opponent: number;
  tiebreak?: number;
}

export interface TennisMatch {
  id: string;
  date: string;
  time: string;
  court: string;
  courtType: CourtType;
  matchType: MatchType;
  opponentId: string;
  opponent: string;
  partnerId?: string;
  partner?: string;
  scores: SetScore[];
  result: MatchResult;
  duration: number;
  weather: WeatherType;
  eloChange: number;
  notes: string;
  aiSummary: string;
  createdAt: string;
}

export interface ParsedMatchInput {
  date?: string;
  opponent?: string;
  partner?: string;
  court?: string;
  courtType?: CourtType;
  matchType?: MatchType;
  scores?: SetScore[];
  result?: MatchResult;
  duration?: number;
  weather?: WeatherType;
  notes?: string;
  mood?: string;
  techIssue?: string;
}
