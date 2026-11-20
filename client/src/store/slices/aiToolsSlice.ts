import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { aiToolApiService } from '@/services/aiToolService';
import type { AITool } from '@/types';

interface AIToolsState {
  items: AITool[];
  categories: string[];
  currentTool: AITool | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  categoriesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  categoriesError: string | null;
}

const initialState: AIToolsState = {
  items: [],
  categories: [],
  currentTool: null,
  status: 'idle',
  categoriesStatus: 'idle',
  detailStatus: 'idle',
  error: null,
  categoriesError: null,
};

export const fetchAITools = createAsyncThunk(
  'aiTools/fetchAll',
  async (category?: string) => {
    return await aiToolApiService.getAll(category);
  }
);

export const fetchAIToolCategories = createAsyncThunk(
  'aiTools/fetchCategories',
  async () => {
    return await aiToolApiService.getCategories();
  }
);

export const fetchAIToolBySlug = createAsyncThunk(
  'aiTools/fetchBySlug',
  async (slug: string, { getState }) => {
    // Skip API call if we already have this tool cached and it succeeded
    const state = getState() as { aiTools: AIToolsState };
    const { currentTool, detailStatus } = state.aiTools;
    if (currentTool?.slug === slug && detailStatus === 'succeeded') {
      return currentTool;
    }
    return await aiToolApiService.getBySlug(slug);
  }
);

const aiToolsSlice = createSlice({
  name: 'aiTools',
  initialState,
  reducers: {
    clearCurrentTool: (state) => {
      state.currentTool = null;
      state.detailStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAITools.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAITools.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAITools.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch AI tools';
      })
      .addCase(fetchAIToolCategories.pending, (state) => {
        state.categoriesStatus = 'loading';
        state.categoriesError = null;
      })
      .addCase(fetchAIToolCategories.fulfilled, (state, action) => {
        state.categories = Array.isArray(action.payload) ? action.payload : [];
        state.categoriesStatus = 'succeeded';
      })
      .addCase(fetchAIToolCategories.rejected, (state, action) => {
        state.categoriesStatus = 'failed';
        state.categoriesError = (action.payload as string) ?? action.error.message ?? 'Failed to fetch categories';
      })
      .addCase(fetchAIToolBySlug.pending, (state) => {
        state.detailStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchAIToolBySlug.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.currentTool = action.payload;
      })
      .addCase(fetchAIToolBySlug.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch tool';
      });
  },
});

export const { clearCurrentTool } = aiToolsSlice.actions;
export default aiToolsSlice.reducer;
