import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer } from "redux-persist";

// Define PostType based on your actual post structure
interface PostType {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

interface SavedPostsState {
  savedPosts: PostType[]; // Store full post objects instead of IDs
}

const initialState: SavedPostsState = {
  savedPosts: [],
}; 

const savedPostsSlice = createSlice({
  name: "savedPosts",
  initialState,
  reducers: {
    savePost: (state, action: PayloadAction<PostType>) => {
      const postExists = state.savedPosts.some((post) => post.id === action.payload.id);
      if (!postExists) {
        // Add new post to the beginning of the array
        state.savedPosts = [action.payload, ...state.savedPosts];
      }
    },
    unsavePost: (state, action: PayloadAction<string>) => {
      state.savedPosts = state.savedPosts.filter((post) => post.id !== action.payload);
    },
    toggleLike: (state, action: PayloadAction<PostType>) => {
      const postIndex = state.savedPosts.findIndex((post) => post.id === action.payload.id);
      if (postIndex !== -1) {
        state.savedPosts[postIndex] = action.payload;
      }
    },
    
  },
});

// Persist Configuration
const persistConfig = {
  key: "savedPosts",
  storage: AsyncStorage,
};

export const { savePost, unsavePost,toggleLike } = savedPostsSlice.actions;
export default persistReducer(persistConfig, savedPostsSlice.reducer);
