import { create } from 'zustand';
import { TennisMatch } from '@/types/match';
import { mockMatches } from '@/data/matches';

interface MatchStore {
  matches: TennisMatch[];
  addMatch: (match: TennisMatch) => void;
  deleteMatch: (id: string) => void;
  getMatchesByOpponent: (opponent: string) => TennisMatch[];
  getRecentMatches: (count: number) => TennisMatch[];
}

export const useMatchStore = create<MatchStore>((set, get) => ({
  matches: mockMatches,

  addMatch: (match) => {
    set((state) => ({
      matches: [match, ...state.matches]
    }));
  },

  deleteMatch: (id) => {
    set((state) => ({
      matches: state.matches.filter((m) => m.id !== id)
    }));
  },

  getMatchesByOpponent: (opponent) => {
    return get().matches.filter((m) => m.opponent === opponent);
  },

  getRecentMatches: (count) => {
    return [...get().matches]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, count);
  }
}));
