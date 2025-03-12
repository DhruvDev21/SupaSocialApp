// addressSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AddressState {
  selectedAddress: any | null;  // Store a single address or null if none is selected
}

const initialState: AddressState = {
  selectedAddress: null,
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    addAddress: (state, action: PayloadAction<any>) => {
      state.selectedAddress = action.payload;  // Replace with the selected address
    },
    clearAddress: (state) => {
      state.selectedAddress = null;  // Clear the selected address
    },
  },
});

export const { addAddress, clearAddress } = addressSlice.actions;
export default addressSlice.reducer;
