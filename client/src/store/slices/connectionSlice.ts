import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { checkServerHealth, onConnectionStateChange } from '../../services/apiClient';

interface ConnectionState {
  /** true when the backend is reachable */
  isConnected: boolean;
  /** true while a health-check reconnection attempt is in progress */
  isReconnecting: boolean;
  /** The endpoint that last failed (for debugging) */
  lastFailedEndpoint: string | null;
  /** Timestamp of the last state change */
  lastCheckedAt: number | null;
}

const initialState: ConnectionState = {
  isConnected: true,
  isReconnecting: false,
  lastFailedEndpoint: null,
  lastCheckedAt: null,
};

// Thunk: manually verify server connectivity via /api/health
export const verifyConnection = createAsyncThunk(
  'connection/verify',
  async () => {
    const healthy = await checkServerHealth();
    return healthy;
  },
);

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    setConnected(state, action: { payload: { connected: boolean; endpoint?: string } }) {
      state.isConnected = action.payload.connected;
      state.lastCheckedAt = Date.now();
      if (!action.payload.connected && action.payload.endpoint) {
        state.lastFailedEndpoint = action.payload.endpoint;
      }
      if (action.payload.connected) {
        state.isReconnecting = false;
        state.lastFailedEndpoint = null;
      }
    },
    setReconnecting(state, action: { payload: boolean }) {
      state.isReconnecting = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyConnection.pending, (state) => {
        state.isReconnecting = true;
      })
      .addCase(verifyConnection.fulfilled, (state, action) => {
        state.isConnected = action.payload;
        state.isReconnecting = false;
        state.lastCheckedAt = Date.now();
        if (action.payload) {
          state.lastFailedEndpoint = null;
        }
      })
      .addCase(verifyConnection.rejected, (state) => {
        state.isConnected = false;
        state.isReconnecting = false;
        state.lastCheckedAt = Date.now();
      });
  },
});

export const { setConnected, setReconnecting } = connectionSlice.actions;

// Side-effect bridge: subscribe to apiClient connection events and dispatch to store.
// Call this once at app startup (in ConnectionBanner or App.tsx).
let unsubscribe: (() => void) | null = null;

export function initConnectionListener(dispatch: (action: unknown) => void): void {
  if (unsubscribe) return; // already initialised
  unsubscribe = onConnectionStateChange((connected, endpoint) => {
    dispatch(setConnected({ connected, endpoint }));
  });
}

export default connectionSlice.reducer;
