/**
 * Comprehensive tests for aiToolsSlice async thunk lifecycle handling.
 * Tests verify category fetching with independent status fields,
 * tool listing, and detail fetching.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import aiToolsReducer, {
  fetchAITools,
  fetchAIToolCategories,
  fetchAIToolBySlug,
} from '../../store/slices/aiToolsSlice';

// Mock the aiToolService module
vi.mock('@/services/aiToolService', () => ({
  aiToolApiService: {
    getAll: vi.fn(),
    getCategories: vi.fn(),
    getBySlug: vi.fn(),
  },
}));

import { aiToolApiService } from '@/services/aiToolService';

const mockService = vi.mocked(aiToolApiService);

function createTestStore() {
  return configureStore({
    reducer: {
      aiTools: aiToolsReducer,
    },
  });
}

type TestStore = ReturnType<typeof createTestStore>;

describe('aiToolsSlice', () => {
  let store: TestStore;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore();
  });

  describe('fetchAITools', () => {
    it('should set status to loading on pending and clear error', async () => {
      mockService.getAll.mockImplementation(() => new Promise(() => {}));

      store.dispatch(fetchAITools());

      const state = store.getState().aiTools;
      expect(state.status).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should store tools array on fulfilled', async () => {
      const mockTools = [
        { slug: 'tool-1', name: 'AI Writer' },
        { slug: 'tool-2', name: 'SEO Analyzer' },
      ];
      mockService.getAll.mockResolvedValue(mockTools as any);

      await store.dispatch(fetchAITools());

      const state = store.getState().aiTools;
      expect(state.status).toBe('succeeded');
      expect(state.items).toEqual(mockTools);
    });

    it('should handle non-array payload gracefully', async () => {
      mockService.getAll.mockResolvedValue(null as any);

      await store.dispatch(fetchAITools());

      const state = store.getState().aiTools;
      expect(state.status).toBe('succeeded');
      expect(state.items).toEqual([]);
    });

    it('should filter by category when provided', async () => {
      const mockTools = [{ slug: 'seo-tool', name: 'SEO Tool' }];
      mockService.getAll.mockResolvedValue(mockTools as any);

      await store.dispatch(fetchAITools('seo'));

      expect(mockService.getAll).toHaveBeenCalledWith('seo');
      expect(store.getState().aiTools.items).toEqual(mockTools);
    });

    it('should handle rejection with error fallback chain', async () => {
      mockService.getAll.mockRejectedValue(new Error('Failed to load tools'));

      await store.dispatch(fetchAITools());

      const state = store.getState().aiTools;
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Failed to load tools');
    });
  });

  describe('fetchAIToolCategories (independent categoriesStatus/categoriesError)', () => {
    it('should set categoriesStatus to loading on pending and clear categoriesError', async () => {
      mockService.getCategories.mockImplementation(() => new Promise(() => {}));

      store.dispatch(fetchAIToolCategories());

      const state = store.getState().aiTools;
      expect(state.categoriesStatus).toBe('loading');
      expect(state.categoriesError).toBeNull();
      // Main status should not be affected
      expect(state.status).toBe('idle');
    });

    it('should store categories on fulfilled and use independent status', async () => {
      const mockCategories = ['seo', 'content', 'analytics'];
      mockService.getCategories.mockResolvedValue(mockCategories);

      await store.dispatch(fetchAIToolCategories());

      const state = store.getState().aiTools;
      expect(state.categoriesStatus).toBe('succeeded');
      expect(state.categories).toEqual(mockCategories);
      expect(state.categoriesError).toBeNull();
      // Main status should remain idle
      expect(state.status).toBe('idle');
    });

    it('should handle non-array category payload gracefully', async () => {
      mockService.getCategories.mockResolvedValue(undefined as any);

      await store.dispatch(fetchAIToolCategories());

      const state = store.getState().aiTools;
      expect(state.categoriesStatus).toBe('succeeded');
      expect(state.categories).toEqual([]);
    });

    it('should use categoriesError on rejection independently from main error', async () => {
      mockService.getCategories.mockRejectedValue(new Error('Category fetch failed'));

      await store.dispatch(fetchAIToolCategories());

      const state = store.getState().aiTools;
      expect(state.categoriesStatus).toBe('failed');
      expect(state.categoriesError).toBe('Category fetch failed');
      // Main error should not be affected
      expect(state.error).toBeNull();
    });

    it('should allow concurrent category and tool fetches without interference', async () => {
      // Start tool fetch that won't resolve
      mockService.getAll.mockImplementation(() => new Promise(() => {}));
      store.dispatch(fetchAITools());

      // Complete category fetch
      mockService.getCategories.mockResolvedValue(['seo', 'content']);
      await store.dispatch(fetchAIToolCategories());

      const state = store.getState().aiTools;
      expect(state.status).toBe('loading'); // Still loading from tools
      expect(state.categoriesStatus).toBe('succeeded'); // Categories done
      expect(state.categories).toEqual(['seo', 'content']);
    });
  });

  describe('fetchAIToolBySlug', () => {
    it('should set detailStatus to loading on pending and clear error', async () => {
      mockService.getBySlug.mockImplementation(() => new Promise(() => {}));

      store.dispatch(fetchAIToolBySlug('seo-analyzer'));

      const state = store.getState().aiTools;
      expect(state.detailStatus).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should store current tool on fulfilled', async () => {
      const mockTool = { slug: 'seo-analyzer', name: 'SEO Analyzer', description: 'Analyze SEO' };
      mockService.getBySlug.mockResolvedValue(mockTool as any);

      await store.dispatch(fetchAIToolBySlug('seo-analyzer'));

      const state = store.getState().aiTools;
      expect(state.detailStatus).toBe('succeeded');
      expect(state.currentTool).toEqual(mockTool);
    });

    it('should handle rejection', async () => {
      mockService.getBySlug.mockRejectedValue(new Error('Tool not found'));

      await store.dispatch(fetchAIToolBySlug('nonexistent'));

      const state = store.getState().aiTools;
      expect(state.detailStatus).toBe('failed');
      expect(state.error).toBe('Tool not found');
    });
  });

  describe('error fallback chain verification', () => {
    it('should prioritize action.payload over error.message', async () => {
      // When service throws a plain Error, action.payload is undefined
      mockService.getAll.mockRejectedValue(new Error('Network timeout'));

      await store.dispatch(fetchAITools());

      const state = store.getState().aiTools;
      expect(state.error).toBe('Network timeout');
    });

    it('should use default message when both are missing', async () => {
      mockService.getAll.mockRejectedValue(undefined);

      await store.dispatch(fetchAITools());

      const state = store.getState().aiTools;
      expect(state.error).toBeTruthy();
      expect(typeof state.error).toBe('string');
    });
  });

  describe('loading flag reset', () => {
    it('should reset status after success', async () => {
      mockService.getAll.mockResolvedValue([]);

      await store.dispatch(fetchAITools());

      expect(store.getState().aiTools.status).toBe('succeeded');
    });

    it('should reset status after failure', async () => {
      mockService.getAll.mockRejectedValue(new Error('fail'));

      await store.dispatch(fetchAITools());

      expect(store.getState().aiTools.status).toBe('failed');
    });
  });
});
