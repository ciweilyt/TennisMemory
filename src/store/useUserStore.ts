import { create } from 'zustand';

interface UserProfile {
  nickname: string;
  bio: string;
  favoriteCourt: string;
  playingYears: string;
}

interface UserStore {
  profile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  profile: {
    nickname: '网球爱好者',
    bio: '记录每一场比赛',
    favoriteCourt: '硬地',
    playingYears: '3'
  },

  updateProfile: (partial) => {
    set((state) => ({
      profile: { ...state.profile, ...partial }
    }));
  }
}));
