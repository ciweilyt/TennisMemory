import { create } from 'zustand';
import { TennisMatch } from '@/types/match';
import { loadData, saveData, STORAGE_KEYS, autoBackup } from '@/utils/storage';

interface MatchStore {
  matches: TennisMatch[];
  loadMatches: () => void;
  addMatch: (match: TennisMatch) => void;
  deleteMatch: (id: string) => void;
  getMatchesByOpponentId: (opponentId: string) => TennisMatch[];
  getRecentMatches: (count: number) => TennisMatch[];
}

export const useMatchStore = create<MatchStore>((set, get) => ({
  matches: [],

  loadMatches: () => {
    const matches = loadData<TennisMatch[]>(STORAGE_KEYS.MATCHES, []);
    set({ matches });
    autoBackup();
  },

  addMatch: (match) => {
    set((state) => {
      const matches = [match, ...state.matches];
      saveData(STORAGE_KEYS.MATCHES, matches);
      return { matches };
    });
    autoBackup();
  },

  deleteMatch: (id) => {
    set((state) => {
      const matches = state.matches.filter((m) => m.id !== id);
      saveData(STORAGE_KEYS.MATCHES, matches);
      return { matches };
    });
  },

  getMatchesByOpponentId: (opponentId) => {
    return get().matches.filter((m) => m.opponentId === opponentId);
  },

  getRecentMatches: (count) => {
    return [...get().matches]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, count);
  }
}));
