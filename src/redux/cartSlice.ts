import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  size?: string;
  selectedSize?:string;
  selectedColor?:string;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, size } = action.payload;
      const existingItem = state.items.find(item => item.id === id && item.size === size); 
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    
    removeFromCart: (state, action: PayloadAction<{ id: number; size?: string }>) => {
      state.items = state.items.filter(item => item.id !== action.payload.id || item.size !== action.payload.size);
    },

    updateQuantity: (state, action: PayloadAction<{ id: number; size?: string; quantityChange: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id && item.size === action.payload.size);
      
      if (item) {
        item.quantity += action.payload.quantityChange;
        if (item.quantity < 1) {
          state.items = state.items.filter(item => item.id !== action.payload.id || item.size !== action.payload.size);
        }
      }
    },

    clearCart: (state) => {
      state.items = []; // Clear all items in the cart
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
