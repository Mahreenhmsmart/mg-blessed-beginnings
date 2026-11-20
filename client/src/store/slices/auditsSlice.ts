import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as auditService from '../../services/auditService';
import type { Audit, AISummaryResult } from '../../types';

interface AuditsState {
  audits: Audit[];
  currentAudit: Audit | null;
  aiInsights: AISummaryResult | null;
  triggerStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  fetchStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  insightsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuditsState = {
  audits: [],
  currentAudit: null,
  aiInsights: null,
  triggerStatus: 'idle',
  fetchStatus: 'idle',
  insightsStatus: 'idle',
  error: null,
};

export const triggerNewAudit = createAsyncThunk('audits/trigger', async (projectId: string) => {
  return auditService.triggerAudit(projectId);
});

export const fetchAuditsByProject = createAsyncThunk('audits/fetchByProject', async (projectId: string) => {
  return auditService.getAuditsByProject(projectId);
});

export const fetchAuditById = createAsyncThunk('audits/fetchById', async (auditId: string) => {
  return auditService.getAuditById(auditId);
});

export const fetchAuditInsights = createAsyncThunk('audits/fetchInsights', async (auditId: string) => {
  return auditService.getAuditInsights(auditId);
});

const auditsSlice = createSlice({
  name: 'audits',
  initialState,
  reducers: {
    clearCurrentAudit(state) {
      state.currentAudit = null;
      state.aiInsights = null;
      state.insightsStatus = 'idle';
    },
    clearAudits(state) {
      state.audits = [];
      state.currentAudit = null;
      state.aiInsights = null;
      state.triggerStatus = 'idle';
      state.fetchStatus = 'idle';
      state.insightsStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Trigger
      .addCase(triggerNewAudit.pending, (state) => {
        state.triggerStatus = 'loading';
        state.error = null;
      })
      .addCase(triggerNewAudit.fulfilled, (state) => {
        state.triggerStatus = 'succeeded';
      })
      .addCase(triggerNewAudit.rejected, (state, action) => {
        state.triggerStatus = 'failed';
        state.error = action.error.message || 'Failed to trigger audit';
      })
      // Fetch by project
      .addCase(fetchAuditsByProject.pending, (state) => {
        state.fetchStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchAuditsByProject.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded';
        state.audits = action.payload;
      })
      .addCase(fetchAuditsByProject.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch audits';
      })
      // Fetch by ID
      .addCase(fetchAuditById.pending, (state) => {
        state.fetchStatus = 'loading';
      })
      .addCase(fetchAuditById.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded';
        state.currentAudit = action.payload;
      })
      .addCase(fetchAuditById.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch audit';
      })
      // AI Insights
      .addCase(fetchAuditInsights.pending, (state) => {
        state.insightsStatus = 'loading';
      })
      .addCase(fetchAuditInsights.fulfilled, (state, action) => {
        state.insightsStatus = 'succeeded';
        state.aiInsights = action.payload;
      })
      .addCase(fetchAuditInsights.rejected, (state, action) => {
        state.insightsStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch AI insights';
      });
  },
});

export const { clearCurrentAudit, clearAudits } = auditsSlice.actions;
export default auditsSlice.reducer;
