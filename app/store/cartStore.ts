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
      const filtered = state.cart.filter(item => item.productId !== productId);
      return {
        cart: [...filtered, { productId, quantity }],
      };
    }),

  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.productId !== productId),
    })),

  clearCart: () => set({ cart: [] }),
}));
