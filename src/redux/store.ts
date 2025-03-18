import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import addressReducer from "./addressSlice";
import savedPostsReducer from "./savedPostsSlice";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import productReducer from "./productSlice";

// Persist Configuration
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["savedPosts","product"], // Persist only savedPosts
};

// Combine Reducers
const rootReducer = combineReducers({
  cart: cartReducer,
  address: addressReducer,
  savedPosts: persistReducer({ key: "savedPosts", storage: AsyncStorage }, savedPostsReducer),
  product: persistReducer({ key: "product", storage: AsyncStorage }, productReducer),
});

// Create Store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
