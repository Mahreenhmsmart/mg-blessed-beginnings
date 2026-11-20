import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchReferralStatsRequest,
  applyReferralCodeRequest,
} from '../../services/referralService';
import type { ReferralStats } from '../../services/referralService';

interface ReferralState {
  stats: ReferralStats | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  applyStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  applyMessage: string | null;
}

const initialState: ReferralState = {
  stats: null,
  status: 'idle',
  error: null,
  applyStatus: 'idle',
  applyMessage: null,
};

export const fetchReferralStats = createAsyncThunk(
  'referral/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchReferralStatsRequest();
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch referral stats';
      return rejectWithValue(message);
    }
  },
);

export const applyReferralCode = createAsyncThunk(
  'referral/applyCode',
  async (code: string, { rejectWithValue }) => {
    try {
      const { message } = await applyReferralCodeRequest(code);
      return message;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to apply referral code';
      return rejectWithValue(message);
    }
  },
);

const referralSlice = createSlice({
  name: 'referral',
  initialState,
  reducers: {
    clearApplyState(state) {
      state.applyStatus = 'idle';
      state.applyMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchReferralStats
      .addCase(fetchReferralStats.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchReferralStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stats = action.payload;
      })
      .addCase(fetchReferralStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to fetch referral stats';
      })
      // applyReferralCode
      .addCase(applyReferralCode.pending, (state) => {
        state.applyStatus = 'loading';
        state.applyMessage = null;
      })
      .addCase(applyReferralCode.fulfilled, (state, action) => {
        state.applyStatus = 'succeeded';
        state.applyMessage = action.payload;
      })
      .addCase(applyReferralCode.rejected, (state, action) => {
        state.applyStatus = 'failed';
        state.applyMessage = (action.payload as string) || 'Failed to apply referral code';
      });
  },
});

export const { clearApplyState } = referralSlice.actions;
export default referralSlice.reducer;
