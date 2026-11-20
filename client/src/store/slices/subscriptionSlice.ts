import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSubscriptionStatus, cancelSubscription as cancelSubApi } from '../../services/subscriptionService';
import type { SubscriptionStatus } from '../../services/subscriptionService';

interface SubscriptionState {
  subscription: SubscriptionStatus | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  subscription: null,
  loading: false,
  error: null,
};

export const fetchSubscriptionStatus = createAsyncThunk(
  'subscription/fetchStatus',
  async () => {
    return await getSubscriptionStatus();
  },
);

export const cancelSubscriptionThunk = createAsyncThunk(
  'subscription/cancel',
  async () => {
    await cancelSubApi();
  },
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload;
      })
      .addCase(fetchSubscriptionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch subscription status';
      })
      .addCase(cancelSubscriptionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSubscriptionThunk.fulfilled, (state) => {
        state.loading = false;
        if (state.subscription) {
          state.subscription.cancelAtPeriodEnd = true;
        }
      })
      .addCase(cancelSubscriptionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to cancel subscription';
      });
  },
});

export default subscriptionSlice.reducer;
