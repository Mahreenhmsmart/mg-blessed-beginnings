import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  startWebsiteAudit,
  getAuditStatus,
  getAuditResult,
  getAuditHistory,
  compareAudits,
  deleteAudit,
  generateFix,
  exportReport,
  checkDataProvider,
  type AuditRequest,
  type AuditResult,
  type AuditHistoryItem,
  type AuditComparison,
} from '@/services/websiteIntelService';

// ─── Types ────────────────────────────────────────────────────────────────

interface DataProviders {
  keywordProvider: boolean;
  backlinkProvider: boolean;
  searchConsole: boolean;
  performanceApi: boolean;
}

interface WebsiteIntelState {
  // Current audit
  currentAuditId: string | null;
  auditStatus: 'idle' | 'validating' | 'scanning' | 'complete' | 'error';
  scanProgress: number;
  scanMessage: string;
  
  // Audit result
  auditResult: AuditResult | null;
  
  // History
  history: AuditHistoryItem[];
  historyLoading: boolean;
  
  // Comparison
  comparison: AuditComparison | null;
  comparisonLoading: boolean;
  
  // Data providers
  providers: DataProviders;
  providersLoading: boolean;
  
  // Fix code generation
  fixCodeLoading: boolean;
  
  // Report download
  isDownloading: boolean;
  
  // Audit deletion
  isDeleting: boolean;
  
  // UI state
  activeTab: string;
  filterSeverity: string;
  filterCategory: string;
  expandedFinding: string | null;
  
  // Errors
  error: string | null;
}

const initialState: WebsiteIntelState = {
  currentAuditId: null,
  auditStatus: 'idle',
  scanProgress: 0,
  scanMessage: '',
  auditResult: null,
  history: [],
  historyLoading: false,
  comparison: null,
  comparisonLoading: false,
  providers: {
    keywordProvider: false,
    backlinkProvider: false,
    searchConsole: false,
    performanceApi: false,
  },
  providersLoading: false,
  fixCodeLoading: false,
  isDownloading: false,
  isDeleting: false,
  activeTab: 'overview',
  filterSeverity: 'all',
  filterCategory: 'all',
  expandedFinding: null,
  error: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────

export const initiateAudit = createAsyncThunk(
  'websiteIntel/initiateAudit',
  async (params: AuditRequest, { rejectWithValue }) => {
    try {
      const result = await startWebsiteAudit(params);
      return result.auditId;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(error.response?.data?.error || 'Failed to start audit');
    }
  }
);

export const pollAuditStatus = createAsyncThunk(
  'websiteIntel/pollStatus',
  async (auditId: string, { rejectWithValue }) => {
    try {
      const status = await getAuditStatus(auditId);
      return status;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(error.response?.data?.error || 'Failed to get audit status');
    }
  }
);

export const fetchAuditResult = createAsyncThunk(
  'websiteIntel/fetchResult',
  async (auditId: string, { rejectWithValue }) => {
    try {
      const result = await getAuditResult(auditId);
      return result;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch audit result');
    }
  }
);

export const fetchAuditHistory = createAsyncThunk(
  'websiteIntel/fetchHistory',
  async (url: string, { rejectWithValue }) => {
    try {
      const history = await getAuditHistory(url);
      return history;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch audit history');
    }
  }
);

export const fetchComparison = createAsyncThunk(
  'websiteIntel/fetchComparison',
  async ({ beforeId, afterId }: { beforeId: string; afterId: string }, { rejectWithValue }) => {
    try {
      const comparison = await compareAudits(beforeId, afterId);
      return comparison;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(error.response?.data?.error || 'Failed to compare audits');
    }
  }
);

export const removeAudit = createAsyncThunk(
  'websiteIntel/deleteAudit',
  async (auditId: string, { rejectWithValue }) => {
    try {
      await deleteAudit(auditId);
      return auditId;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(error.response?.data?.error || 'Failed to delete audit');
    }
  }
);

export const fetchFixCode = createAsyncThunk(
  'websiteIntel/fetchFix',
  async ({ auditId, findingId }: { auditId: string; findingId: string }, { rejectWithValue }) => {
    try {
      const result = await generateFix(auditId, findingId);
      return { findingId, fixCode: result.fixCode };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(error.response?.data?.error || 'Failed to generate fix');
    }
  }
);

export const downloadReport = createAsyncThunk(
  'websiteIntel/downloadReport',
  async ({ auditId, format }: { auditId: string; format: 'pdf' | 'markdown' | 'csv' }, { rejectWithValue }) => {
    try {
      const blob = await exportReport(auditId, format);
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-report-${auditId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      return format;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(error.response?.data?.error || 'Failed to export report');
    }
  }
);

export const fetchDataProviders = createAsyncThunk(
  'websiteIntel/fetchProviders',
  async (_, { rejectWithValue }) => {
    try {
      const providers = await checkDataProvider();
      return providers;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(error.response?.data?.error || 'Failed to check data providers');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────

const websiteIntelSlice = createSlice({
  name: 'websiteIntel',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setFilterSeverity: (state, action: PayloadAction<string>) => {
      state.filterSeverity = action.payload;
    },
    setFilterCategory: (state, action: PayloadAction<string>) => {
      state.filterCategory = action.payload;
    },
    setExpandedFinding: (state, action: PayloadAction<string | null>) => {
      state.expandedFinding = action.payload;
    },
    updateScanProgress: (state, action: PayloadAction<{ progress: number; message: string }>) => {
      state.scanProgress = action.payload.progress;
      state.scanMessage = action.payload.message;
    },
    resetAudit: (state) => {
      state.currentAuditId = null;
      state.auditStatus = 'idle';
      state.scanProgress = 0;
      state.scanMessage = '';
      state.auditResult = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Initiate audit
    builder
      .addCase(initiateAudit.pending, (state) => {
        state.auditStatus = 'validating';
        state.error = null;
      })
      .addCase(initiateAudit.fulfilled, (state, action) => {
        state.currentAuditId = action.payload;
        state.auditStatus = 'scanning';
        state.scanProgress = 0;
      })
      .addCase(initiateAudit.rejected, (state, action) => {
        state.auditStatus = 'error';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to start audit';
      });

    // Poll status
    builder
      .addCase(pollAuditStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(pollAuditStatus.fulfilled, (state, action) => {
        state.scanProgress = action.payload.progress;
        state.scanMessage = action.payload.message;
        if (action.payload.status === 'complete') {
          state.auditStatus = 'complete';
        } else if (action.payload.status === 'error') {
          state.auditStatus = 'error';
        }
      })
      .addCase(pollAuditStatus.rejected, (state, action) => {
        state.auditStatus = 'error';
        state.scanProgress = 0;
        state.scanMessage = '';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to poll audit status';
      });

    // Fetch result
    builder
      .addCase(fetchAuditResult.pending, (state) => {
        state.auditStatus = 'scanning';
        state.error = null;
      })
      .addCase(fetchAuditResult.fulfilled, (state, action) => {
        state.auditResult = action.payload;
        state.auditStatus = 'complete';
      })
      .addCase(fetchAuditResult.rejected, (state, action) => {
        state.auditStatus = 'error';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch audit result';
      });

    // Fetch history
    builder
      .addCase(fetchAuditHistory.pending, (state) => {
        state.historyLoading = true;
        state.error = null;
      })
      .addCase(fetchAuditHistory.fulfilled, (state, action) => {
        state.history = action.payload;
        state.historyLoading = false;
      })
      .addCase(fetchAuditHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch audit history';
      });

    // Fetch comparison
    builder
      .addCase(fetchComparison.pending, (state) => {
        state.comparisonLoading = true;
        state.error = null;
      })
      .addCase(fetchComparison.fulfilled, (state, action) => {
        state.comparison = action.payload;
        state.comparisonLoading = false;
      })
      .addCase(fetchComparison.rejected, (state, action) => {
        state.comparisonLoading = false;
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to compare audits';
      });

    // Delete audit
    builder
      .addCase(removeAudit.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(removeAudit.fulfilled, (state, action) => {
        state.history = state.history.filter(h => h.auditId !== action.payload);
        if (state.currentAuditId === action.payload) {
          state.currentAuditId = null;
          state.auditResult = null;
          state.auditStatus = 'idle';
        }
        state.isDeleting = false;
      })
      .addCase(removeAudit.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to delete audit';
      });

    // Fetch fix code
    builder
      .addCase(fetchFixCode.pending, (state) => {
        state.fixCodeLoading = true;
        state.error = null;
      })
      .addCase(fetchFixCode.fulfilled, (state, action) => {
        state.fixCodeLoading = false;
        if (state.auditResult) {
          const finding = state.auditResult.findings.find(f => f.id === action.payload.findingId);
          if (finding) {
            finding.fixCode = action.payload.fixCode;
          }
        }
      })
      .addCase(fetchFixCode.rejected, (state, action) => {
        state.fixCodeLoading = false;
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to generate fix';
      });

    // Download report
    builder
      .addCase(downloadReport.pending, (state) => {
        state.isDownloading = true;
        state.error = null;
      })
      .addCase(downloadReport.fulfilled, (state) => {
        state.isDownloading = false;
        // Download handled in thunk via blob URL
      })
      .addCase(downloadReport.rejected, (state, action) => {
        state.isDownloading = false;
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to download report';
      });

    // Fetch providers
    builder
      .addCase(fetchDataProviders.pending, (state) => {
        state.providersLoading = true;
        state.error = null;
      })
      .addCase(fetchDataProviders.fulfilled, (state, action) => {
        state.providers = action.payload;
        state.providersLoading = false;
      })
      .addCase(fetchDataProviders.rejected, (state, action) => {
        state.providersLoading = false;
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to check data providers';
      });
  },
});

export const {
  setActiveTab,
  setFilterSeverity,
  setFilterCategory,
  setExpandedFinding,
  updateScanProgress,
  resetAudit,
  clearError,
} = websiteIntelSlice.actions;

export default websiteIntelSlice.reducer;
