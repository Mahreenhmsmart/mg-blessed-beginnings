import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as auditService from '../../services/auditService';
import type { KeywordGap, BacklinkOpportunity, ContentGap, CompetitorComparison, CompetitorIntelligence, ContentPlan, AIVisibilityRecord, GSCData, AuditSchedule } from '../../types';

interface AnalysisState {
  keywordGaps: KeywordGap[];
  backlinks: BacklinkOpportunity[];
  contentGaps: ContentGap[];
  competitorComparison: CompetitorComparison[];
  competitorIntelligence: CompetitorIntelligence | null;
  aiVisibilityHistory: AIVisibilityRecord[];
  aiVisibilitySummary: AIVisibilityRecord[];
  gscData: GSCData | null;
  schedule: AuditSchedule | null;
  keywordStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  backlinkStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  contentStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  competitorStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  competitorIntelStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  competitorMutateStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  visibilityStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  visibilityMutateStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  gscStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  scheduleStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  reanalyzeKeywordsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  reanalyzeBacklinksStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  reanalyzeContentStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  contentPlanStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AnalysisState = {
  keywordGaps: [],
  backlinks: [],
  contentGaps: [],
  competitorComparison: [],
  competitorIntelligence: null,
  aiVisibilityHistory: [],
  aiVisibilitySummary: [],
  gscData: null,
  schedule: null,
  keywordStatus: 'idle',
  backlinkStatus: 'idle',
  contentStatus: 'idle',
  competitorStatus: 'idle',
  competitorIntelStatus: 'idle',
  competitorMutateStatus: 'idle',
  visibilityStatus: 'idle',
  visibilityMutateStatus: 'idle',
  gscStatus: 'idle',
  scheduleStatus: 'idle',
  reanalyzeKeywordsStatus: 'idle',
  reanalyzeBacklinksStatus: 'idle',
  reanalyzeContentStatus: 'idle',
  contentPlanStatus: 'idle',
  error: null,
};

export const fetchKeywordGaps = createAsyncThunk('analysis/fetchKeywords', async (projectId: string) => {
  return auditService.getKeywordGaps(projectId);
});

export const fetchBacklinks = createAsyncThunk('analysis/fetchBacklinks', async (projectId: string) => {
  return auditService.getBacklinks(projectId);
});

export const fetchContentGaps = createAsyncThunk('analysis/fetchContentGaps', async (projectId: string) => {
  return auditService.getContentGaps(projectId);
});

export const fetchCompetitorComparison = createAsyncThunk(
  'analysis/fetchCompetitors',
  async (projectId: string) => {
    return auditService.getCompetitorComparison(projectId);
  },
);

export const triggerReanalyzeKeywords = createAsyncThunk(
  'analysis/reanalyzeKeywords',
  async (projectId: string) => {
    await auditService.reanalyzeKeywordGaps(projectId);
    return true;
  },
);

export const triggerReanalyzeBacklinks = createAsyncThunk(
  'analysis/reanalyzeBacklinks',
  async (projectId: string) => {
    await auditService.reanalyzeBacklinks(projectId);
    return true;
  },
);

export const triggerReanalyzeContent = createAsyncThunk(
  'analysis/reanalyzeContent',
  async (projectId: string) => {
    await auditService.reanalyzeContentGaps(projectId);
    return true;
  },
);

export const addCompetitorUrl = createAsyncThunk(
  'analysis/addCompetitor',
  async ({ projectId, url }: { projectId: string; url: string }) => {
    await auditService.addCompetitor(projectId, url);
    return url;
  },
);

export const removeCompetitorUrl = createAsyncThunk(
  'analysis/removeCompetitor',
  async ({ projectId, url }: { projectId: string; url: string }) => {
    await auditService.removeCompetitor(projectId, url);
    return url;
  },
);

export const triggerCompetitorAuditThunk = createAsyncThunk(
  'analysis/triggerCompetitorAudit',
  async (projectId: string) => {
    await auditService.triggerCompetitorAudit(projectId);
    return true;
  },
);

export const fetchVisibilityHistory = createAsyncThunk(
  'analysis/fetchVisibilityHistory',
  async (projectId: string) => {
    return auditService.getVisibilityHistory(projectId);
  },
);

export const fetchVisibilitySummary = createAsyncThunk(
  'analysis/fetchVisibilitySummary',
  async (projectId: string) => {
    return auditService.getVisibilitySummary(projectId);
  },
);

export const triggerVisibilityCheckThunk = createAsyncThunk(
  'analysis/triggerVisibilityCheck',
  async (projectId: string) => {
    await auditService.triggerVisibilityCheck(projectId);
    return true;
  },
);

export const fetchGSCData = createAsyncThunk(
  'analysis/fetchGSCData',
  async (projectId: string) => {
    return auditService.getGSCData(projectId);
  },
);

export const fetchSchedule = createAsyncThunk(
  'analysis/fetchSchedule',
  async (projectId: string) => {
    return auditService.getSchedule(projectId);
  },
);

export const createOrUpdateSchedule = createAsyncThunk(
  'analysis/createSchedule',
  async ({ projectId, frequency, dayOfWeek, dayOfMonth }: {
    projectId: string;
    frequency: 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
  }) => {
    return auditService.createSchedule(projectId, frequency, dayOfWeek, dayOfMonth);
  },
);

export const toggleSchedule = createAsyncThunk(
  'analysis/toggleSchedule',
  async ({ projectId, isActive }: { projectId: string; isActive: boolean }) => {
    await auditService.updateSchedule(projectId, { isActive });
    return { isActive };
  },
);

export const removeSchedule = createAsyncThunk(
  'analysis/deleteSchedule',
  async (projectId: string) => {
    await auditService.deleteSchedule(projectId);
    return true;
  },
);

export const fetchCompetitorIntelligence = createAsyncThunk(
  'analysis/fetchCompetitorIntelligence',
  async (projectId: string) => {
    return auditService.getCompetitorIntelligence(projectId);
  },
);

export const generateContentPlanThunk = createAsyncThunk(
  'analysis/generateContentPlan',
  async ({ projectId, gapId }: { projectId: string; gapId: string }) => {
    return auditService.generateContentPlan(projectId, gapId);
  },
);

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    clearAnalysis(state) {
      state.keywordGaps = [];
      state.backlinks = [];
      state.contentGaps = [];
      state.competitorComparison = [];
      state.competitorIntelligence = null;
      state.aiVisibilityHistory = [];
      state.aiVisibilitySummary = [];
      state.gscData = null;
      state.schedule = null;
      state.keywordStatus = 'idle';
      state.backlinkStatus = 'idle';
      state.contentStatus = 'idle';
      state.competitorStatus = 'idle';
      state.competitorIntelStatus = 'idle';
      state.competitorMutateStatus = 'idle';
      state.visibilityStatus = 'idle';
      state.visibilityMutateStatus = 'idle';
      state.gscStatus = 'idle';
      state.scheduleStatus = 'idle';
      state.reanalyzeKeywordsStatus = 'idle';
      state.reanalyzeBacklinksStatus = 'idle';
      state.reanalyzeContentStatus = 'idle';
      state.contentPlanStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Keywords
      .addCase(fetchKeywordGaps.pending, (state) => {
        state.keywordStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchKeywordGaps.fulfilled, (state, action) => {
        state.keywordStatus = 'succeeded';
        state.keywordGaps = action.payload;
      })
      .addCase(fetchKeywordGaps.rejected, (state, action) => {
        state.keywordStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch keyword gaps';
      })
      // Backlinks
      .addCase(fetchBacklinks.pending, (state) => {
        state.backlinkStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchBacklinks.fulfilled, (state, action) => {
        state.backlinkStatus = 'succeeded';
        state.backlinks = action.payload;
      })
      .addCase(fetchBacklinks.rejected, (state, action) => {
        state.backlinkStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch backlinks';
      })
      // Content
      .addCase(fetchContentGaps.pending, (state) => {
        state.contentStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchContentGaps.fulfilled, (state, action) => {
        state.contentStatus = 'succeeded';
        state.contentGaps = action.payload;
      })
      .addCase(fetchContentGaps.rejected, (state, action) => {
        state.contentStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch content gaps';
      })
      // Competitors
      .addCase(fetchCompetitorComparison.pending, (state) => {
        state.competitorStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchCompetitorComparison.fulfilled, (state, action) => {
        state.competitorStatus = 'succeeded';
        state.competitorComparison = action.payload;
      })
      .addCase(fetchCompetitorComparison.rejected, (state, action) => {
        state.competitorStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch competitor data';
      })
      // Add competitor
      .addCase(addCompetitorUrl.pending, (state) => {
        state.competitorMutateStatus = 'loading';
        state.error = null;
      })
      .addCase(addCompetitorUrl.fulfilled, (state) => {
        state.competitorMutateStatus = 'succeeded';
      })
      .addCase(addCompetitorUrl.rejected, (state, action) => {
        state.competitorMutateStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to add competitor';
      })
      // Remove competitor
      .addCase(removeCompetitorUrl.pending, (state) => {
        state.competitorMutateStatus = 'loading';
        state.error = null;
      })
      .addCase(removeCompetitorUrl.fulfilled, (state) => {
        state.competitorMutateStatus = 'succeeded';
      })
      .addCase(removeCompetitorUrl.rejected, (state, action) => {
        state.competitorMutateStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to remove competitor';
      })
      // Trigger competitor audit
      .addCase(triggerCompetitorAuditThunk.pending, (state) => {
        state.competitorMutateStatus = 'loading';
        state.error = null;
      })
      .addCase(triggerCompetitorAuditThunk.fulfilled, (state) => {
        state.competitorMutateStatus = 'succeeded';
      })
      .addCase(triggerCompetitorAuditThunk.rejected, (state, action) => {
        state.competitorMutateStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to trigger competitor audit';
      })
      // Re-analyze keywords
      .addCase(triggerReanalyzeKeywords.pending, (state) => {
        state.reanalyzeKeywordsStatus = 'loading';
        state.error = null;
      })
      .addCase(triggerReanalyzeKeywords.fulfilled, (state) => {
        state.reanalyzeKeywordsStatus = 'succeeded';
      })
      .addCase(triggerReanalyzeKeywords.rejected, (state, action) => {
        state.reanalyzeKeywordsStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to re-analyze keywords';
      })
      // Re-analyze backlinks
      .addCase(triggerReanalyzeBacklinks.pending, (state) => {
        state.reanalyzeBacklinksStatus = 'loading';
        state.error = null;
      })
      .addCase(triggerReanalyzeBacklinks.fulfilled, (state) => {
        state.reanalyzeBacklinksStatus = 'succeeded';
      })
      .addCase(triggerReanalyzeBacklinks.rejected, (state, action) => {
        state.reanalyzeBacklinksStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to re-analyze backlinks';
      })
      // Re-analyze content
      .addCase(triggerReanalyzeContent.pending, (state) => {
        state.reanalyzeContentStatus = 'loading';
        state.error = null;
      })
      .addCase(triggerReanalyzeContent.fulfilled, (state) => {
        state.reanalyzeContentStatus = 'succeeded';
      })
      .addCase(triggerReanalyzeContent.rejected, (state, action) => {
        state.reanalyzeContentStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to re-analyze content';
      })
      // AI Visibility
      .addCase(fetchVisibilityHistory.pending, (state) => {
        state.visibilityStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchVisibilityHistory.fulfilled, (state, action) => {
        state.visibilityStatus = 'succeeded';
        state.aiVisibilityHistory = action.payload;
      })
      .addCase(fetchVisibilityHistory.rejected, (state, action) => {
        state.visibilityStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch visibility history';
      })
      .addCase(fetchVisibilitySummary.pending, (state) => {
        state.visibilityStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchVisibilitySummary.fulfilled, (state, action) => {
        state.aiVisibilitySummary = action.payload;
        state.visibilityStatus = 'succeeded';
      })
      .addCase(fetchVisibilitySummary.rejected, (state, action) => {
        state.visibilityStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch visibility summary';
      })
      .addCase(triggerVisibilityCheckThunk.pending, (state) => {
        state.visibilityMutateStatus = 'loading';
        state.error = null;
      })
      .addCase(triggerVisibilityCheckThunk.fulfilled, (state) => {
        state.visibilityMutateStatus = 'succeeded';
      })
      .addCase(triggerVisibilityCheckThunk.rejected, (state, action) => {
        state.visibilityMutateStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to trigger visibility check';
      })
      // GSC
      .addCase(fetchGSCData.pending, (state) => {
        state.gscStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchGSCData.fulfilled, (state, action) => {
        state.gscStatus = 'succeeded';
        state.gscData = action.payload;
      })
      .addCase(fetchGSCData.rejected, (state, action) => {
        state.gscStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch GSC data';
      })
      // Schedule
      .addCase(fetchSchedule.pending, (state) => {
        state.scheduleStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchSchedule.fulfilled, (state, action) => {
        state.scheduleStatus = 'succeeded';
        state.schedule = action.payload;
      })
      .addCase(fetchSchedule.rejected, (state, action) => {
        state.scheduleStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch schedule';
      })
      .addCase(createOrUpdateSchedule.pending, (state) => {
        state.scheduleStatus = 'loading';
        state.error = null;
      })
      .addCase(createOrUpdateSchedule.fulfilled, (state, action) => {
        state.schedule = action.payload;
        state.scheduleStatus = 'succeeded';
      })
      .addCase(createOrUpdateSchedule.rejected, (state, action) => {
        state.scheduleStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to create/update schedule';
      })
      .addCase(toggleSchedule.pending, (state) => {
        state.scheduleStatus = 'loading';
        state.error = null;
      })
      .addCase(toggleSchedule.fulfilled, (state, action) => {
        if (state.schedule) {
          state.schedule.isActive = action.payload.isActive;
        }
        state.scheduleStatus = 'succeeded';
      })
      .addCase(toggleSchedule.rejected, (state, action) => {
        state.scheduleStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to toggle schedule';
      })
      .addCase(removeSchedule.pending, (state) => {
        state.scheduleStatus = 'loading';
        state.error = null;
      })
      .addCase(removeSchedule.fulfilled, (state) => {
        state.schedule = null;
        state.scheduleStatus = 'succeeded';
      })
      .addCase(removeSchedule.rejected, (state, action) => {
        state.scheduleStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to remove schedule';
      })
      // Competitor Intelligence
      .addCase(fetchCompetitorIntelligence.pending, (state) => {
        state.competitorIntelStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchCompetitorIntelligence.fulfilled, (state, action) => {
        state.competitorIntelStatus = 'succeeded';
        state.competitorIntelligence = action.payload;
      })
      .addCase(fetchCompetitorIntelligence.rejected, (state, action) => {
        state.competitorIntelStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch competitor intelligence';
      })
      // Content Plan Generation
      .addCase(generateContentPlanThunk.pending, (state) => {
        state.contentPlanStatus = 'loading';
        state.error = null;
      })
      .addCase(generateContentPlanThunk.fulfilled, (state, action) => {
        state.contentPlanStatus = 'succeeded';
        // Update the content gap with the generated plan
        const gap = state.contentGaps.find((g) => g._id === action.meta.arg.gapId);
        if (gap) {
          gap.contentPlan = action.payload;
        }
      })
      .addCase(generateContentPlanThunk.rejected, (state, action) => {
        state.contentPlanStatus = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to generate content plan';
      });
  },
});

export const { clearAnalysis } = analysisSlice.actions;
export default analysisSlice.reducer;
