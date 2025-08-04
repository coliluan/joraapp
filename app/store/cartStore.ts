// store/cartStore.ts
import { create } from 'zustand';

interface CartItem {
  productId: string;
  quantity: number;
}

interface CartStore {
  cart: CartItem[];
  addToCart: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  cart: [],

  addToCart: (productId, quantity) =>
    set((state) => {
      const existing = state.cart.find((item) => item.productId === productId);
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      } else {
        return {
          cart: [...state.cart, { productId, quantity }],
        };
      }
    }),

  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.productId !== productId),
    })),

  clearCart: () => set({ cart: [] }),
}));
