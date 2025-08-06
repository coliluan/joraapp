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
      if (quantity <= 0) {
        // Fshi produktin nëse sasia është 0 ose më pak
        return {
          cart: state.cart.map((item) =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          ),
        };
      }

      const existingItem = state.cart.find((item) => item.productId === productId);
      if (existingItem) {
        // Ndrysho sasinë nëse ekziston
        return {
          cart: state.cart.map((item) =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          ),
        };
      } else {
        // Shto si produkt i ri
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
