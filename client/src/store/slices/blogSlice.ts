import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { blogService } from '../../services/blogService';
import type { BlogPost } from '../../services/blogService';

interface BlogState {
  posts: BlogPost[];
  currentPost: BlogPost | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: BlogState = {
  posts: [],
  currentPost: null,
  status: 'idle',
  error: null,
};

export const fetchPosts = createAsyncThunk(
  'blog/fetchPosts',
  async () => {
    return await blogService.getPosts();
  }
);

export const fetchPost = createAsyncThunk(
  'blog/fetchPost',
  async (id: string) => {
    return await blogService.getPost(id);
  }
);

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all posts
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.posts = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch posts';
      })
      // Fetch single post
      .addCase(fetchPost.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentPost = action.payload;
      })
      .addCase(fetchPost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch post';
      });
  },
});

export const { clearCurrentPost, clearError } = blogSlice.actions;
export default blogSlice.reducer;
