// app/store/useUserStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface User {
  _id: string;
  firstName: string;
  barcode?: string;
  number?: string;
  photo?: string;
  isGuest?: boolean;
}

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  loadUserFromStorage: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoggedIn: false,
  setUser: (user) => {
    set({ user, isLoggedIn: true });
    AsyncStorage.setItem('loggedInUser', JSON.stringify(user));
  },
  logout: async () => {
    await AsyncStorage.removeItem('loggedInUser');
    set({ user: null, isLoggedIn: false });
  },
  loadUserFromStorage: async () => {
    const json = await AsyncStorage.getItem('loggedInUser');
    if (json) {
      const user = JSON.parse(json);
      const isGuest = user.isGuest === true || !user.firstName;
      set({ user: { ...user, isGuest }, isLoggedIn: true });
    }
  },
}));
