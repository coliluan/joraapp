import { create } from 'zustand';

interface FavoriteStore {
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  clearFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteStore>((set) => ({
  favorites: [],

  toggleFavorite: (productId) =>
    set((state) => {
      if (state.favorites.includes(productId)) {
        return {
          favorites: state.favorites.filter(id => id !== productId),
        };
      } else {
        return {
          favorites: [...state.favorites, productId],
        };
      }
    }),

  removeFavorite: (productId) =>
    set((state) => ({
      favorites: state.favorites.filter(id => id !== productId),
    })),

  clearFavorites: () => set({ favorites: [] }),
}));
