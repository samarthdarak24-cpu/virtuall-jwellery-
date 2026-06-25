import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    category: string;
}

interface CartStore {
    items: CartItem[];
    
    // Actions
    addItem: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    
    // Computed values
    getTotal: () => number;
    getItemCount: () => number;
    getItem: (productId: string) => CartItem | undefined;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                const existingItem = get().items.find(i => i.productId === item.productId);
                
                if (existingItem) {
                    // Update quantity if item already exists
                    set({
                        items: get().items.map(i =>
                            i.productId === item.productId
                                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                                : i
                        )
                    });
                } else {
                    // Add new item
                    set({
                        items: [
                            ...get().items,
                            {
                                id: `cart-${Date.now()}-${Math.random()}`,
                                ...item,
                                quantity: item.quantity || 1
                            }
                        ]
                    });
                }
            },

            removeItem: (productId) => {
                set({
                    items: get().items.filter(i => i.productId !== productId)
                });
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                
                set({
                    items: get().items.map(i =>
                        i.productId === productId
                            ? { ...i, quantity }
                            : i
                    )
                });
            },

            clearCart: () => {
                set({ items: [] });
            },

            getTotal: () => {
                return get().items.reduce(
                    (total, item) => total + (item.price * item.quantity),
                    0
                );
            },

            getItemCount: () => {
                return get().items.reduce(
                    (count, item) => count + item.quantity,
                    0
                );
            },

            getItem: (productId) => {
                return get().items.find(i => i.productId === productId);
            }
        }),
        {
            name: 'jewelfit-cart-storage', // localStorage key
        }
    )
);
