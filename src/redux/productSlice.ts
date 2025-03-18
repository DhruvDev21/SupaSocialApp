
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { item } from "@/src/constants/type";

interface ProductState {
  savedProducts: item[];
}

const initialState: ProductState = {
  savedProducts: [],
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    saveProduct: (state, action: PayloadAction<item>) => {
      state.savedProducts = [action.payload, ...state.savedProducts];
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      state.savedProducts = state.savedProducts.filter(product => product.id !== action.payload);
    },
  },
});

export const { saveProduct, removeProduct } = productSlice.actions;
export default productSlice.reducer;
