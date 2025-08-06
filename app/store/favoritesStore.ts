import { create } from 'zustand';
import { ENDPOINTS, getApiUrl } from '../../config/api'; // Adjust path as needed
import { useUserStore } from './useUserStore';

interface FavoriteStore {
  favorites: string[];
  toggleFavorite: (productId: string) => Promise<void>;
  removeFavorite: (productId: string) => void;
  clearFavorites: () => void;
  loadFavorites: () => Promise<void>;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favorites: [],

  loadFavorites: async () => {
    const { user } = useUserStore.getState();
    if (!user?._id) return;

    try {
      const res = await fetch(getApiUrl(ENDPOINTS.USER_FAVORITES(user._id)));
      const data = await res.json();
      set({ favorites: data.favorites || [] });
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  },

  toggleFavorite: async (productId) => {
    const { favorites } = get();
    const { user } = useUserStore.getState();
    if (!user?._id) return;

    const isFavorite = favorites.includes(productId);
    const updatedFavorites = isFavorite
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];

    // Optimistically update UI
    set({ favorites: updatedFavorites });

    try {
      await fetch(getApiUrl(ENDPOINTS.USER_FAVORITES(user._id)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          action: isFavorite ? 'remove' : 'add',
        }),
      });
    } catch (err) {
      console.error('Failed to sync favorite:', err);
      // Rollback if error
      set({ favorites });
    }
  },

  removeFavorite: (productId) =>
    set((state) => ({
      favorites: state.favorites.filter(id => id !== productId),
    })),

  clearFavorites: () => set({ favorites: [] }),
}));
