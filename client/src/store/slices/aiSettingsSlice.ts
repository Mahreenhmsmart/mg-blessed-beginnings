import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { aiService } from '../../services/aiService';
import type { ProviderStatus, SaveProviderData } from '../../services/aiService';

interface AISettingsState {
  providers: ProviderStatus[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  saveStatus: 'idle' | 'saving' | 'saved' | 'failed';
  testStatus: Record<string, 'idle' | 'testing' | 'success' | 'failed'>;
  error: string | null;
}

const initialState: AISettingsState = {
  providers: [],
  status: 'idle',
  saveStatus: 'idle',
  testStatus: {},
  error: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchProviderStatuses = createAsyncThunk(
  'aiSettings/fetchProviderStatuses',
  async () => {
    return await aiService.getProviderStatuses();
  },
);

export const saveProviderConfig = createAsyncThunk(
  'aiSettings/saveProviderConfig',
  async ({ data, id }: { data: SaveProviderData; id?: string }) => {
    return await aiService.saveProvider(data, id);
  },
);

export const deleteProviderConfig = createAsyncThunk(
  'aiSettings/deleteProviderConfig',
  async (id: string) => {
    await aiService.deleteProvider(id);
    return id;
  },
);

export const testProviderConnection = createAsyncThunk(
  'aiSettings/testProviderConnection',
  async (id: string) => {
    const result = await aiService.testConnection(id);
    return { id, ...result };
  },
);

export const setPrimaryProvider = createAsyncThunk(
  'aiSettings/setPrimaryProvider',
  async (id: string) => {
    await aiService.setPrimary(id);
    return id;
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const aiSettingsSlice = createSlice({
  name: 'aiSettings',
  initialState,
  reducers: {
    clearSaveStatus(state) {
      state.saveStatus = 'idle';
    },
    clearError(state) {
      state.error = null;
    },
    resetTestStatus(state, action: { payload: string }) {
      state.testStatus[action.payload] = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch provider statuses
      .addCase(fetchProviderStatuses.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProviderStatuses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.providers = action.payload;
      })
      .addCase(fetchProviderStatuses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch provider statuses';
      })
      // Save provider config
      .addCase(saveProviderConfig.pending, (state) => {
        state.saveStatus = 'saving';
        state.error = null;
      })
      .addCase(saveProviderConfig.fulfilled, (state, action) => {
        state.saveStatus = 'saved';
        const saved = action.payload;
        const idx = state.providers.findIndex((p) => p._id === saved._id);
        if (idx >= 0) {
          state.providers[idx] = saved;
        } else {
          state.providers.push(saved);
        }
        // If the saved provider is primary, unset others
        if (saved.isPrimary) {
          state.providers.forEach((p) => {
            if (p._id !== saved._id) p.isPrimary = false;
          });
        }
      })
      .addCase(saveProviderConfig.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to save provider';
      })
      // Delete provider config
      .addCase(deleteProviderConfig.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteProviderConfig.fulfilled, (state, action) => {
        state.providers = state.providers.filter((p) => p._id !== action.payload);
        state.status = 'succeeded';
      })
      .addCase(deleteProviderConfig.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to delete provider';
      })
      // Test provider connection
      .addCase(testProviderConnection.pending, (state, action) => {
        state.testStatus[action.meta.arg] = 'testing';
        state.error = null;
      })
      .addCase(testProviderConnection.fulfilled, (state, action) => {
        const { id, lastTestResult, lastTestedAt, lastTestError } = action.payload;
        state.testStatus[id] = lastTestResult === 'success' ? 'success' : 'failed';
        const idx = state.providers.findIndex((p) => p._id === id);
        if (idx >= 0) {
          state.providers[idx].lastTestResult = lastTestResult;
          state.providers[idx].lastTestedAt = lastTestedAt;
          state.providers[idx].lastTestError = lastTestError;
        }
      })
      .addCase(testProviderConnection.rejected, (state, action) => {
        state.testStatus[action.meta.arg] = 'failed';
      })
      // Set primary provider
      .addCase(setPrimaryProvider.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(setPrimaryProvider.fulfilled, (state, action) => {
        state.providers.forEach((p) => {
          p.isPrimary = p._id === action.payload;
        });
        state.status = 'succeeded';
      })
      .addCase(setPrimaryProvider.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to set primary provider';
      });
  },
});

export const { clearSaveStatus, clearError, resetTestStatus } = aiSettingsSlice.actions;
export default aiSettingsSlice.reducer;
