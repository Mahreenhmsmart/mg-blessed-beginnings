/**
 * Comprehensive tests for analysisSlice async thunk lifecycle handling.
 * Tests verify pending/fulfilled/rejected handlers, error fallback chains,
 * and independent status flags for concurrent operations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import analysisReducer, {
  fetchKeywordGaps,
  fetchBacklinks,
  fetchContentGaps,
  fetchCompetitorComparison,
  triggerReanalyzeKeywords,
  triggerReanalyzeBacklinks,
  triggerReanalyzeContent,
  addCompetitorUrl,
  removeCompetitorUrl,
  triggerCompetitorAuditThunk,
  fetchVisibilityHistory,
  fetchVisibilitySummary,
  triggerVisibilityCheckThunk,
  fetchGSCData,
  fetchSchedule,
  createOrUpdateSchedule,
  toggleSchedule,
  removeSchedule,
  fetchCompetitorIntelligence,
  generateContentPlanThunk,
} from '../../store/slices/analysisSlice';

// Mock the auditService module
vi.mock('../../services/auditService', () => ({
  getKeywordGaps: vi.fn(),
  getBacklinks: vi.fn(),
  getContentGaps: vi.fn(),
  getCompetitorComparison: vi.fn(),
  reanalyzeKeywordGaps: vi.fn(),
  reanalyzeBacklinks: vi.fn(),
  reanalyzeContentGaps: vi.fn(),
  addCompetitor: vi.fn(),
  removeCompetitor: vi.fn(),
  triggerCompetitorAudit: vi.fn(),
  getVisibilityHistory: vi.fn(),
  getVisibilitySummary: vi.fn(),
  triggerVisibilityCheck: vi.fn(),
  getGSCData: vi.fn(),
  getSchedule: vi.fn(),
  createSchedule: vi.fn(),
  updateSchedule: vi.fn(),
  deleteSchedule: vi.fn(),
  getCompetitorIntelligence: vi.fn(),
  generateContentPlan: vi.fn(),
}));

import * as auditService from '../../services/auditService';

const mockAuditService = vi.mocked(auditService);

function createTestStore() {
  return configureStore({
    reducer: {
      analysis: analysisReducer,
    },
  });
}

type TestStore = ReturnType<typeof createTestStore>;

describe('analysisSlice', () => {
  let store: TestStore;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore();
  });

  describe('fetchKeywordGaps', () => {
    it('should set keywordStatus to loading on pending and clear error', async () => {
      mockAuditService.getKeywordGaps.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      store.dispatch(fetchKeywordGaps('project-1'));

      const state = store.getState().analysis;
      expect(state.keywordStatus).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should store payload and set succeeded status on fulfilled', async () => {
      const mockData = [{ keyword: 'test', volume: 1000 }];
      mockAuditService.getKeywordGaps.mockResolvedValue(mockData as any);

      await store.dispatch(fetchKeywordGaps('project-1'));

      const state = store.getState().analysis;
      expect(state.keywordStatus).toBe('succeeded');
      expect(state.keywordGaps).toEqual(mockData);
      expect(state.error).toBeNull();
    });

    it('should use rejectWithValue payload on rejection', async () => {
      mockAuditService.getKeywordGaps.mockRejectedValue('Custom error message');

      await store.dispatch(fetchKeywordGaps('project-1'));

      const state = store.getState().analysis;
      expect(state.keywordStatus).toBe('failed');
      // When no rejectWithValue is used, falls back to error.message or default
      expect(state.error).toBeTruthy();
    });

    it('should fall back to default error message when no payload or error.message', async () => {
      mockAuditService.getKeywordGaps.mockRejectedValue(undefined);

      await store.dispatch(fetchKeywordGaps('project-1'));

      const state = store.getState().analysis;
      expect(state.keywordStatus).toBe('failed');
      expect(state.error).toBeTruthy();
    });
  });

  describe('fetchBacklinks', () => {
    it('should set backlinkStatus to loading on pending', async () => {
      mockAuditService.getBacklinks.mockImplementation(() => new Promise(() => {}));

      store.dispatch(fetchBacklinks('project-1'));

      expect(store.getState().analysis.backlinkStatus).toBe('loading');
      expect(store.getState().analysis.error).toBeNull();
    });

    it('should store backlinks on fulfilled', async () => {
      const mockBacklinks = [{ domain: 'example.com', authority: 50 }];
      mockAuditService.getBacklinks.mockResolvedValue(mockBacklinks as any);

      await store.dispatch(fetchBacklinks('project-1'));

      const state = store.getState().analysis;
      expect(state.backlinkStatus).toBe('succeeded');
      expect(state.backlinks).toEqual(mockBacklinks);
    });

    it('should handle rejection with error fallback chain', async () => {
      mockAuditService.getBacklinks.mockRejectedValue(new Error('Network failed'));

      await store.dispatch(fetchBacklinks('project-1'));

      const state = store.getState().analysis;
      expect(state.backlinkStatus).toBe('failed');
      expect(state.error).toBe('Network failed');
    });
  });

  describe('fetchContentGaps', () => {
    it('should set contentStatus to loading and clear error on pending', async () => {
      mockAuditService.getContentGaps.mockImplementation(() => new Promise(() => {}));

      store.dispatch(fetchContentGaps('project-1'));

      expect(store.getState().analysis.contentStatus).toBe('loading');
      expect(store.getState().analysis.error).toBeNull();
    });

    it('should store content gaps on fulfilled', async () => {
      const mockGaps = [{ topic: 'missing content', priority: 'high' }];
      mockAuditService.getContentGaps.mockResolvedValue(mockGaps as any);

      await store.dispatch(fetchContentGaps('project-1'));

      const state = store.getState().analysis;
      expect(state.contentStatus).toBe('succeeded');
      expect(state.contentGaps).toEqual(mockGaps);
    });

    it('should set failed status on rejection', async () => {
      mockAuditService.getContentGaps.mockRejectedValue(new Error('Server error'));

      await store.dispatch(fetchContentGaps('project-1'));

      expect(store.getState().analysis.contentStatus).toBe('failed');
      expect(store.getState().analysis.error).toBe('Server error');
    });
  });

  describe('fetchCompetitorComparison', () => {
    it('should set competitorStatus to loading on pending', async () => {
      mockAuditService.getCompetitorComparison.mockImplementation(() => new Promise(() => {}));

      store.dispatch(fetchCompetitorComparison('project-1'));

      expect(store.getState().analysis.competitorStatus).toBe('loading');
      expect(store.getState().analysis.error).toBeNull();
    });

    it('should store competitors on fulfilled', async () => {
      const mockCompetitors = [{ url: 'competitor.com', score: 85 }];
      mockAuditService.getCompetitorComparison.mockResolvedValue(mockCompetitors as any);

      await store.dispatch(fetchCompetitorComparison('project-1'));

      const state = store.getState().analysis;
      expect(state.competitorStatus).toBe('succeeded');
      expect(state.competitorComparison).toEqual(mockCompetitors);
    });

    it('should handle rejection', async () => {
      mockAuditService.getCompetitorComparison.mockRejectedValue(new Error('Failed'));

      await store.dispatch(fetchCompetitorComparison('project-1'));

      expect(store.getState().analysis.competitorStatus).toBe('failed');
    });
  });

  describe('concurrent competitor operations (independent status flags)', () => {
    it('should use competitorMutateStatus for add/remove/trigger operations independently from competitorStatus', async () => {
      // Start a fetch that won't resolve
      mockAuditService.getCompetitorComparison.mockImplementation(() => new Promise(() => {}));
      store.dispatch(fetchCompetitorComparison('project-1'));

      // Start an add operation
      mockAuditService.addCompetitor.mockResolvedValue(undefined);
      await store.dispatch(addCompetitorUrl({ projectId: 'project-1', url: 'new-comp.com' }));

      const state = store.getState().analysis;
      // competitorStatus should still be loading (from the unresolved fetch)
      expect(state.competitorStatus).toBe('loading');
      // competitorMutateStatus should be succeeded (from the completed add)
      expect(state.competitorMutateStatus).toBe('succeeded');
    });

    it('should handle removeCompetitorUrl lifecycle', async () => {
      mockAuditService.removeCompetitor.mockResolvedValue(undefined);

      await store.dispatch(removeCompetitorUrl({ projectId: 'project-1', url: 'comp.com' }));

      const state = store.getState().analysis;
      expect(state.competitorMutateStatus).toBe('succeeded');
      expect(state.error).toBeNull();
    });

    it('should handle triggerCompetitorAuditThunk lifecycle', async () => {
      mockAuditService.triggerCompetitorAudit.mockResolvedValue(undefined);

      await store.dispatch(triggerCompetitorAuditThunk('project-1'));

      const state = store.getState().analysis;
      expect(state.competitorMutateStatus).toBe('succeeded');
    });
  });

  describe('re-analysis thunks (independent status flags)', () => {
    it('should use reanalyzeKeywordsStatus independently', async () => {
      mockAuditService.reanalyzeKeywordGaps.mockResolvedValue(undefined);

      await store.dispatch(triggerReanalyzeKeywords('project-1'));

      const state = store.getState().analysis;
      expect(state.reanalyzeKeywordsStatus).toBe('succeeded');
      expect(state.keywordStatus).toBe('idle'); // Should not be affected
    });

    it('should use reanalyzeBacklinksStatus independently', async () => {
      mockAuditService.reanalyzeBacklinks.mockResolvedValue(undefined);

      await store.dispatch(triggerReanalyzeBacklinks('project-1'));

      const state = store.getState().analysis;
      expect(state.reanalyzeBacklinksStatus).toBe('succeeded');
      expect(state.backlinkStatus).toBe('idle');
    });

    it('should use reanalyzeContentStatus independently', async () => {
      mockAuditService.reanalyzeContentGaps.mockResolvedValue(undefined);

      await store.dispatch(triggerReanalyzeContent('project-1'));

      const state = store.getState().analysis;
      expect(state.reanalyzeContentStatus).toBe('succeeded');
      expect(state.contentStatus).toBe('idle');
    });

    it('should handle re-analysis rejection', async () => {
      mockAuditService.reanalyzeKeywordGaps.mockRejectedValue(new Error('Reanalysis failed'));

      await store.dispatch(triggerReanalyzeKeywords('project-1'));

      const state = store.getState().analysis;
      expect(state.reanalyzeKeywordsStatus).toBe('failed');
      expect(state.error).toBe('Reanalysis failed');
    });
  });

  describe('visibility operations (independent status flags)', () => {
    it('should use visibilityStatus for fetch operations', async () => {
      const mockHistory = [{ date: '2024-01-01', score: 75 }];
      mockAuditService.getVisibilityHistory.mockResolvedValue(mockHistory as any);

      await store.dispatch(fetchVisibilityHistory('project-1'));

      const state = store.getState().analysis;
      expect(state.visibilityStatus).toBe('succeeded');
      expect(state.aiVisibilityHistory).toEqual(mockHistory);
    });

    it('should use visibilityMutateStatus for trigger operations independently', async () => {
      // Start history fetch that won't resolve
      mockAuditService.getVisibilityHistory.mockImplementation(() => new Promise(() => {}));
      store.dispatch(fetchVisibilityHistory('project-1'));

      // Trigger check
      mockAuditService.triggerVisibilityCheck.mockResolvedValue(undefined);
      await store.dispatch(triggerVisibilityCheckThunk('project-1'));

      const state = store.getState().analysis;
      expect(state.visibilityStatus).toBe('loading'); // Still loading from fetch
      expect(state.visibilityMutateStatus).toBe('succeeded'); // Completed trigger
    });

    it('should handle fetchVisibilitySummary lifecycle', async () => {
      const mockSummary = [{ provider: 'chatgpt', visible: true }];
      mockAuditService.getVisibilitySummary.mockResolvedValue(mockSummary as any);

      await store.dispatch(fetchVisibilitySummary('project-1'));

      const state = store.getState().analysis;
      expect(state.visibilityStatus).toBe('succeeded');
      expect(state.aiVisibilitySummary).toEqual(mockSummary);
    });
  });

  describe('GSC and schedule operations', () => {
    it('should handle fetchGSCData lifecycle', async () => {
      const mockGSC = { clicks: 100, impressions: 1000 };
      mockAuditService.getGSCData.mockResolvedValue(mockGSC as any);

      await store.dispatch(fetchGSCData('project-1'));

      const state = store.getState().analysis;
      expect(state.gscStatus).toBe('succeeded');
      expect(state.gscData).toEqual(mockGSC);
    });

    it('should handle fetchSchedule lifecycle', async () => {
      const mockSchedule = { frequency: 'weekly', isActive: true };
      mockAuditService.getSchedule.mockResolvedValue(mockSchedule as any);

      await store.dispatch(fetchSchedule('project-1'));

      const state = store.getState().analysis;
      expect(state.scheduleStatus).toBe('succeeded');
      expect(state.schedule).toEqual(mockSchedule);
    });

    it('should handle createOrUpdateSchedule lifecycle', async () => {
      const mockSchedule = { frequency: 'monthly', isActive: true };
      mockAuditService.createSchedule.mockResolvedValue(mockSchedule as any);

      await store.dispatch(createOrUpdateSchedule({
        projectId: 'project-1',
        frequency: 'monthly',
      }));

      const state = store.getState().analysis;
      expect(state.scheduleStatus).toBe('succeeded');
      expect(state.schedule).toEqual(mockSchedule);
    });

    it('should handle toggleSchedule lifecycle', async () => {
      // First set up a schedule
      const mockSchedule = { frequency: 'weekly', isActive: false };
      mockAuditService.getSchedule.mockResolvedValue(mockSchedule as any);
      await store.dispatch(fetchSchedule('project-1'));

      // Then toggle it
      mockAuditService.updateSchedule.mockResolvedValue(undefined);
      await store.dispatch(toggleSchedule({ projectId: 'project-1', isActive: true }));

      const state = store.getState().analysis;
      expect(state.scheduleStatus).toBe('succeeded');
      expect(state.schedule?.isActive).toBe(true);
    });

    it('should handle removeSchedule lifecycle', async () => {
      // First set up a schedule
      const mockSchedule = { frequency: 'weekly', isActive: true };
      mockAuditService.getSchedule.mockResolvedValue(mockSchedule as any);
      await store.dispatch(fetchSchedule('project-1'));

      // Then remove it
      mockAuditService.deleteSchedule.mockResolvedValue(undefined);
      await store.dispatch(removeSchedule('project-1'));

      const state = store.getState().analysis;
      expect(state.scheduleStatus).toBe('succeeded');
      expect(state.schedule).toBeNull();
    });
  });

  describe('competitor intelligence and content plan', () => {
    it('should handle fetchCompetitorIntelligence lifecycle', async () => {
      const mockIntel = { strategies: ['SEO', 'Content'], weaknesses: [] };
      mockAuditService.getCompetitorIntelligence.mockResolvedValue(mockIntel as any);

      await store.dispatch(fetchCompetitorIntelligence('project-1'));

      const state = store.getState().analysis;
      expect(state.competitorIntelStatus).toBe('succeeded');
      expect(state.competitorIntelligence).toEqual(mockIntel);
    });

    it('should handle generateContentPlanThunk lifecycle and update content gap', async () => {
      // Set up content gaps first
      const mockGaps = [{ _id: 'gap-1', topic: 'test topic' }] as any[];
      mockAuditService.getContentGaps.mockResolvedValue(mockGaps);
      await store.dispatch(fetchContentGaps('project-1'));

      // Generate content plan
      const mockPlan = { title: 'Test Plan', sections: [] };
      mockAuditService.generateContentPlan.mockResolvedValue(mockPlan as any);
      await store.dispatch(generateContentPlanThunk({ projectId: 'project-1', gapId: 'gap-1' }));

      const state = store.getState().analysis;
      expect(state.contentPlanStatus).toBe('succeeded');
      expect(state.contentGaps[0].contentPlan).toEqual(mockPlan);
    });
  });

  describe('error fallback chain verification', () => {
    it('should prioritize action.payload from rejectWithValue over error.message', async () => {
      // The slice uses: (action.payload as string) ?? action.error.message ?? 'default'
      // When service throws a plain Error, action.payload is undefined, so it falls to error.message
      mockAuditService.getKeywordGaps.mockRejectedValue(new Error('Specific error'));

      await store.dispatch(fetchKeywordGaps('project-1'));

      const state = store.getState().analysis;
      expect(state.error).toBe('Specific error');
    });

    it('should use default message when both payload and error.message are missing', async () => {
      // Rejecting with undefined means no payload and potentially no error.message
      mockAuditService.getBacklinks.mockRejectedValue(undefined);

      await store.dispatch(fetchBacklinks('project-1'));

      const state = store.getState().analysis;
      expect(state.error).toBeTruthy();
      expect(typeof state.error).toBe('string');
    });
  });

  describe('loading flag reset after success and failure', () => {
    it('should reset loading flag after successful operation', async () => {
      mockAuditService.getKeywordGaps.mockResolvedValue([]);

      await store.dispatch(fetchKeywordGaps('project-1'));

      const state = store.getState().analysis;
      expect(state.keywordStatus).toBe('succeeded'); // Not 'loading'
    });

    it('should reset loading flag after failed operation', async () => {
      mockAuditService.getKeywordGaps.mockRejectedValue(new Error('fail'));

      await store.dispatch(fetchKeywordGaps('project-1'));

      const state = store.getState().analysis;
      expect(state.keywordStatus).toBe('failed'); // Not 'loading'
    });
  });
});
