import { create } from 'zustand';
import { loadData, saveData, STORAGE_KEYS } from '@/utils/storage';

interface UserProfile {
  nickname: string;
  bio: string;
  favoriteCourt: string;
  playingYears: string;
}

interface UserStore {
  profile: UserProfile;
  loadProfile: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  nickname: '网球爱好者',
  bio: '记录每一场比赛',
  favoriteCourt: '硬地',
  playingYears: '3'
};

export const useUserStore = create<UserStore>((set) => ({
  profile: DEFAULT_PROFILE,

  loadProfile: () => {
    const profile = loadData<UserProfile>(STORAGE_KEYS.USER_PROFILE, DEFAULT_PROFILE);
    set({ profile });
  },

  updateProfile: (partial) => {
    set((state) => {
      const profile = { ...state.profile, ...partial };
      saveData(STORAGE_KEYS.USER_PROFILE, profile);
      return { profile };
    });
  }
}));
