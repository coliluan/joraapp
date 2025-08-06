import { create } from 'zustand';
import { ENDPOINTS, getApiUrl } from '../../config/api'; // Rruga kontrollo që është korrekte për ty
import { useUserStore } from './useUserStore';

interface FavoriteStore {
  favorites: string[];
  loading: boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  removeFavorite: (productId: string) => void;
  clearFavorites: () => void;
  loadFavorites: () => Promise<void>;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favorites: [],
  loading: false,

  loadFavorites: async () => {
    const { user } = useUserStore.getState();
    if (!user?._id) return;

    try {
      const url = getApiUrl(ENDPOINTS.USER_FAVORITES(user._id));
      console.log('Fetching favorites from:', url);

      const res = await fetch(url);
      if (!res.ok) {
        console.error('Error fetching favorites:', res.status, res.statusText);
        return;
      }

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

    set({ favorites: updatedFavorites, loading: true });

    try {
      const url = getApiUrl(ENDPOINTS.USER_FAVORITES(user._id));
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action: isFavorite ? 'remove' : 'add' }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update favorites: ${res.statusText}`);
      }
    } catch (err) {
      console.error('Failed to sync favorite:', err);
      set({ favorites }); // rollback
    } finally {
      set({ loading: false });
    }
  },

  removeFavorite: (productId) =>
    set((state) => ({
      favorites: state.favorites.filter(id => id !== productId),
    })),

  clearFavorites: () => set({ favorites: [] }),
}));
