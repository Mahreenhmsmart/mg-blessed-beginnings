/**
 * Security Audit Slice
 * Redux state management for security scanning functionality.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as securityAuditService from '../../services/securityAuditService';
import type {
  SecurityScanDetails,
  SecurityScanHistoryItem,
  SecurityScanStatus,
  AuthorizationResponse,
} from '../../types';

interface SecurityAuditState {
  // Current scan state
  currentScanId: string | null;
  currentScanStatus: SecurityScanStatus | null;
  currentScanProgress: number;
  currentScanMessage: string;

  // Scan details (after completion)
  scanDetails: SecurityScanDetails | null;

  // History
  history: SecurityScanHistoryItem[];
  historyStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // Report
  reportContent: string | null;

  // UI state
  authorizationInfo: AuthorizationResponse | null;
  isAuthorizing: boolean;
  isStarting: boolean;
  isDeleting: boolean;
  error: string | null;
}

const initialState: SecurityAuditState = {
  currentScanId: null,
  currentScanStatus: null,
  currentScanProgress: 0,
  currentScanMessage: '',
  scanDetails: null,
  history: [],
  historyStatus: 'idle',
  reportContent: null,
  authorizationInfo: null,
  isAuthorizing: false,
  isStarting: false,
  isDeleting: false,
  error: null,
};

// ─── Async Thunks ──────────────────────────────────────────────────────────────

export const authorizeTarget = createAsyncThunk(
  'securityAudit/authorizeTarget',
  async (target: string, { rejectWithValue }) => {
    try {
      return await securityAuditService.authorizeTarget(target);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Authorization failed');
    }
  }
);

export const startScan = createAsyncThunk(
  'securityAudit/startScan',
  async ({ target, authorizationConfirmed }: { target: string; authorizationConfirmed: boolean }, { rejectWithValue }) => {
    try {
      return await securityAuditService.startSecurityScan(target, authorizationConfirmed);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to start scan');
    }
  }
);

export const fetchScanStatus = createAsyncThunk(
  'securityAudit/fetchScanStatus',
  async (scanId: string, { rejectWithValue }) => {
    try {
      return await securityAuditService.getScanStatus(scanId);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch status');
    }
  }
);

export const fetchScanDetails = createAsyncThunk(
  'securityAudit/fetchScanDetails',
  async (scanId: string, { rejectWithValue }) => {
    try {
      return await securityAuditService.getScanDetails(scanId);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch scan details');
    }
  }
);

export const fetchScanHistory = createAsyncThunk(
  'securityAudit/fetchScanHistory',
  async (_, { rejectWithValue }) => {
    try {
      return await securityAuditService.getScanHistory();
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch history');
    }
  }
);

export const fetchScanReport = createAsyncThunk(
  'securityAudit/fetchScanReport',
  async (scanId: string, { rejectWithValue }) => {
    try {
      return await securityAuditService.getScanReport(scanId);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch report');
    }
  }
);

export const deleteScanFromHistory = createAsyncThunk(
  'securityAudit/deleteScan',
  async (scanId: string, { rejectWithValue }) => {
    try {
      await securityAuditService.deleteScan(scanId);
      return scanId;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete scan');
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────────────────────────

const securityAuditSlice = createSlice({
  name: 'securityAudit',
  initialState,
  reducers: {
    clearCurrentScan: (state) => {
      state.currentScanId = null;
      state.currentScanStatus = null;
      state.currentScanProgress = 0;
      state.currentScanMessage = '';
      state.scanDetails = null;
      state.reportContent = null;
      state.error = null;
    },
    clearAuthorization: (state) => {
      state.authorizationInfo = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setReportContent: (state, action) => {
      state.reportContent = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Authorize target
    builder
      .addCase(authorizeTarget.pending, (state) => {
        state.isAuthorizing = true;
        state.error = null;
      })
      .addCase(authorizeTarget.fulfilled, (state, action) => {
        state.isAuthorizing = false;
        state.authorizationInfo = action.payload;
      })
      .addCase(authorizeTarget.rejected, (state, action) => {
        state.isAuthorizing = false;
        state.error = (action.payload as string) ?? action.error.message ?? 'Authorization failed';
      });

    // Start scan
    builder
      .addCase(startScan.pending, (state) => {
        state.isStarting = true;
        state.error = null;
      })
      .addCase(startScan.fulfilled, (state, action) => {
        state.isStarting = false;
        state.currentScanId = action.payload.scanId;
        state.currentScanStatus = 'pending';
        state.currentScanProgress = 0;
        state.currentScanMessage = 'Initializing scan...';
        state.scanDetails = null;
        state.reportContent = null;
      })
      .addCase(startScan.rejected, (state, action) => {
        state.isStarting = false;
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to start scan';
      });

    // Fetch scan status
    builder
      .addCase(fetchScanStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchScanStatus.fulfilled, (state, action) => {
        state.currentScanStatus = action.payload.status;
        state.currentScanProgress = action.payload.progress;
        state.currentScanMessage = action.payload.statusMessage;

        // If completed or failed, we might want to fetch details
        if (action.payload.status === 'completed' || action.payload.status === 'failed') {
          // Status update complete - details should be fetched separately
        }
      })
      .addCase(fetchScanStatus.rejected, (state, action) => {
        // Don't set error for polling failures - just log
        console.error('Status poll failed:', action.payload);
      });

    // Fetch scan details
    builder
      .addCase(fetchScanDetails.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchScanDetails.fulfilled, (state, action) => {
        state.scanDetails = action.payload;
        state.currentScanStatus = action.payload.status;
        state.currentScanProgress = 100;
      })
      .addCase(fetchScanDetails.rejected, (state, action) => {
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch scan details';
      });

    // Fetch scan history
    builder
      .addCase(fetchScanHistory.pending, (state) => {
        state.historyStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchScanHistory.fulfilled, (state, action) => {
        state.historyStatus = 'succeeded';
        state.history = action.payload;
      })
      .addCase(fetchScanHistory.rejected, (state, action) => {
        state.historyStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch history';
      });

    // Fetch scan report
    builder
      .addCase(fetchScanReport.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchScanReport.fulfilled, (state, action) => {
        state.reportContent = action.payload;
      })
      .addCase(fetchScanReport.rejected, (state, action) => {
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch report';
      });

    // Delete scan
    builder
      .addCase(deleteScanFromHistory.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteScanFromHistory.fulfilled, (state, action) => {
        state.history = state.history.filter((item) => item.scanId !== action.payload);
        state.isDeleting = false;
      })
      .addCase(deleteScanFromHistory.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to delete scan';
      });
  },
});

export const { clearCurrentScan, clearAuthorization, clearError, setReportContent } = securityAuditSlice.actions;

export default securityAuditSlice.reducer;
