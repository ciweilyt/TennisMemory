import { create } from 'zustand';
import { Player, PlayerRelationship } from '@/types/player';
import { loadData, saveData, STORAGE_KEYS } from '@/utils/storage';
import { generateAvatarURI } from '@/utils/avatarGenerator';

interface PlayerStore {
  players: Player[];
  loadPlayers: () => void;
  addPlayer: (player: Omit<Player, 'id' | 'avatar' | 'elo' | 'totalMatches' | 'wins' | 'losses' | 'winRate' | 'createdAt' | 'updatedAt'>) => Player;
  updatePlayer: (id: string, partial: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  getPlayerById: (id: string) => Player | undefined;
  getPlayerByName: (name: string) => Player | undefined;
  findOrCreatePlayer: (name: string) => Player;
  updatePlayerAfterMatch: (playerId: string, result: 'win' | 'lose', eloChange: number) => void;
  recalculateRelationships: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  players: [],

  loadPlayers: () => {
    const players = loadData<Player[]>(STORAGE_KEYS.PLAYERS, []);
    set({ players });
  },

  addPlayer: (playerData) => {
    const id = `p${Date.now()}`;
    const avatar = generateAvatarURI(
      playerData.name,
      playerData.gender,
      playerData.playStyle,
      playerData.ntrpLevel,
      playerData.isLefty
    );
    const now = new Date().toISOString();
    const newPlayer: Player = {
      ...playerData,
      id,
      avatar,
      elo: 1500,
      totalMatches: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      createdAt: now,
      updatedAt: now
    };
    set((state) => {
      const players = [...state.players, newPlayer];
      saveData(STORAGE_KEYS.PLAYERS, players);
      return { players };
    });
    return newPlayer;
  },

  updatePlayer: (id, partial) => {
    set((state) => {
      const players = state.players.map((p) =>
        p.id === id ? { ...p, ...partial, updatedAt: new Date().toISOString() } : p
      );
      saveData(STORAGE_KEYS.PLAYERS, players);
      return { players };
    });
  },

  deletePlayer: (id) => {
    set((state) => {
      const players = state.players.filter((p) => p.id !== id);
      saveData(STORAGE_KEYS.PLAYERS, players);
      return { players };
    });
  },

  getPlayerById: (id) => {
    return get().players.find((p) => p.id === id);
  },

  getPlayerByName: (name) => {
    return get().players.find((p) => p.name === name);
  },

  findOrCreatePlayer: (name) => {
    const existing = get().players.find((p) => p.name === name);
    if (existing) return existing;
    return get().addPlayer({
      name,
      gender: 'male',
      ntrpLevel: '3.0',
      playStyle: 'baseline',
      isLefty: false,
      favoriteCourt: '硬地',
      notes: '',
      lastPlayDate: '',
      relationship: 'casual'
    });
  },

  updatePlayerAfterMatch: (playerId, result, eloChange) => {
    set((state) => {
      const players = state.players.map((p) => {
        if (p.id !== playerId) return p;
        const wins = p.wins + (result === 'win' ? 1 : 0);
        const losses = p.losses + (result === 'lose' ? 1 : 0);
        const totalMatches = wins + losses;
        const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 1000) / 10 : 0;
        return {
          ...p,
          elo: p.elo + eloChange,
          totalMatches,
          wins,
          losses,
          winRate,
          lastPlayDate: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString()
        };
      });
      saveData(STORAGE_KEYS.PLAYERS, players);
      return { players };
    });
  },

  recalculateRelationships: () => {
    set((state) => {
      const sorted = [...state.players].sort((a, b) => b.totalMatches - a.totalMatches);
      const players = sorted.map((p, idx) => {
        let relationship: PlayerRelationship = 'casual';
        if (p.totalMatches >= 5) {
          if (p.winRate >= 40 && p.winRate <= 60) relationship = 'rival';
          else if (p.winRate > 60) relationship = 'frequent';
          else relationship = 'partner';
        } else if (p.totalMatches >= 2) {
          relationship = 'frequent';
        }
        return { ...p, relationship };
      });
      saveData(STORAGE_KEYS.PLAYERS, players);
      return { players };
    });
  }
}));
