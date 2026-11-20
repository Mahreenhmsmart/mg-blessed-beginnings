/**
 * Comprehensive tests for aiSettingsSlice async thunk lifecycle handling.
 * Tests verify deleteProviderConfig pending handler, setPrimaryProvider pending handler,
 * and connection test error clearing.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import aiSettingsReducer, {
  fetchProviderStatuses,
  saveProviderConfig,
  deleteProviderConfig,
  testProviderConnection,
  setPrimaryProvider,
} from '../../store/slices/aiSettingsSlice';

// Mock the aiService module
vi.mock('../../services/aiService', () => ({
  aiService: {
    getProviderStatuses: vi.fn(),
    saveProvider: vi.fn(),
    deleteProvider: vi.fn(),
    testConnection: vi.fn(),
    setPrimary: vi.fn(),
  },
}));

import { aiService } from '../../services/aiService';

const mockService = vi.mocked(aiService);

function createTestStore() {
  return configureStore({
    reducer: {
      aiSettings: aiSettingsReducer,
    },
  });
}

type TestStore = ReturnType<typeof createTestStore>;

describe('aiSettingsSlice', () => {
  let store: TestStore;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore();
  });

  describe('fetchProviderStatuses', () => {
    it('should set status to loading on pending and clear error', async () => {
      mockService.getProviderStatuses.mockImplementation(() => new Promise(() => {}));

      store.dispatch(fetchProviderStatuses());

      const state = store.getState().aiSettings;
      expect(state.status).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should store providers on fulfilled', async () => {
      const mockProviders = [
        { _id: 'p1', provider: 'openai', isPrimary: true },
        { _id: 'p2', provider: 'anthropic', isPrimary: false },
      ];
      mockService.getProviderStatuses.mockResolvedValue(mockProviders as any);

      await store.dispatch(fetchProviderStatuses());

      const state = store.getState().aiSettings;
      expect(state.status).toBe('succeeded');
      expect(state.providers).toEqual(mockProviders);
    });

    it('should handle rejection with error fallback chain', async () => {
      mockService.getProviderStatuses.mockRejectedValue(new Error('Failed to fetch'));

      await store.dispatch(fetchProviderStatuses());

      const state = store.getState().aiSettings;
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Failed to fetch');
    });
  });

  describe('saveProviderConfig', () => {
    it('should set saveStatus to saving on pending and clear error', async () => {
      mockService.saveProvider.mockImplementation(() => new Promise(() => {}));

      store.dispatch(saveProviderConfig({ data: { name: 'New Provider', apiKey: 'key' } as any }));

      const state = store.getState().aiSettings;
      expect(state.saveStatus).toBe('saving');
      expect(state.error).toBeNull();
    });

    it('should add new provider on fulfilled', async () => {
      const mockSaved = { _id: 'new-id', provider: 'openai', isPrimary: false };
      mockService.saveProvider.mockResolvedValue(mockSaved as any);

      await store.dispatch(saveProviderConfig({ data: { provider: 'openai', modelName: 'gpt-4', apiKey: 'key' } as any }));

      const state = store.getState().aiSettings;
      expect(state.saveStatus).toBe('saved');
      expect(state.providers).toContainEqual(mockSaved);
    });

    it('should update existing provider on fulfilled', async () => {
      // Set up existing provider
      const existing = [{ _id: 'p1', provider: 'openai', isPrimary: false }] as any[];
      mockService.getProviderStatuses.mockResolvedValue(existing);
      await store.dispatch(fetchProviderStatuses());

      // Update it
      const updated = { _id: 'p1', provider: 'openai', isPrimary: false };
      mockService.saveProvider.mockResolvedValue(updated as any);
      await store.dispatch(saveProviderConfig({ data: { provider: 'openai' } as any, id: 'p1' }));

      const state = store.getState().aiSettings;
      expect(state.providers[0].provider).toBe('openai');
    });

    it('should unset other primary flags when saving a primary provider', async () => {
      // Set up providers with one primary
      const existing = [
        { _id: 'p1', provider: 'openai', isPrimary: true },
        { _id: 'p2', provider: 'anthropic', isPrimary: false },
      ] as any[];
      mockService.getProviderStatuses.mockResolvedValue(existing);
      await store.dispatch(fetchProviderStatuses());

      // Save p2 as primary
      const updatedP2 = { _id: 'p2', provider: 'anthropic', isPrimary: true };
      mockService.saveProvider.mockResolvedValue(updatedP2 as any);
      await store.dispatch(saveProviderConfig({ data: { isPrimary: true } as any, id: 'p2' }));

      const state = store.getState().aiSettings;
      expect(state.providers.find(p => p._id === 'p1')?.isPrimary).toBe(false);
      expect(state.providers.find(p => p._id === 'p2')?.isPrimary).toBe(true);
    });

    it('should handle rejection', async () => {
      mockService.saveProvider.mockRejectedValue(new Error('Save failed'));

      await store.dispatch(saveProviderConfig({ data: { name: 'Bad' } as any }));

      const state = store.getState().aiSettings;
      expect(state.saveStatus).toBe('failed');
      expect(state.error).toBe('Save failed');
    });
  });

  describe('deleteProviderConfig (has pending handler)', () => {
    it('should set status to loading on pending and clear error', async () => {
      mockService.deleteProvider.mockImplementation(() => new Promise(() => {}));

      store.dispatch(deleteProviderConfig('p1'));

      const state = store.getState().aiSettings;
      expect(state.status).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should remove provider from list on fulfilled', async () => {
      // Set up providers
      const providers = [
        { _id: 'p1', name: 'Provider 1', isPrimary: false },
        { _id: 'p2', name: 'Provider 2', isPrimary: true },
      ] as any[];
      mockService.getProviderStatuses.mockResolvedValue(providers);
      await store.dispatch(fetchProviderStatuses());

      // Delete p1
      mockService.deleteProvider.mockResolvedValue(undefined);
      await store.dispatch(deleteProviderConfig('p1'));

      const state = store.getState().aiSettings;
      expect(state.status).toBe('succeeded');
      expect(state.providers.length).toBe(1);
      expect(state.providers[0]._id).toBe('p2');
    });

    it('should handle rejection', async () => {
      mockService.deleteProvider.mockRejectedValue(new Error('Cannot delete primary'));

      await store.dispatch(deleteProviderConfig('p1'));

      const state = store.getState().aiSettings;
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Cannot delete primary');
    });
  });

  describe('testProviderConnection (clears errors on pending)', () => {
    it('should set testStatus to testing on pending and clear error', async () => {
      mockService.testConnection.mockImplementation(() => new Promise(() => {}));

      store.dispatch(testProviderConnection('p1'));

      const state = store.getState().aiSettings;
      expect(state.testStatus['p1']).toBe('testing');
      expect(state.error).toBeNull();
    });

    it('should update testStatus and provider on successful test', async () => {
      // Set up provider
      const providers = [{ _id: 'p1', name: 'Provider 1', isPrimary: false }] as any[];
      mockService.getProviderStatuses.mockResolvedValue(providers);
      await store.dispatch(fetchProviderStatuses());

      // Test connection
      mockService.testConnection.mockResolvedValue({
        lastTestResult: 'success',
        lastTestedAt: '2024-01-01T00:00:00Z',
        lastTestError: null,
      } as any);
      await store.dispatch(testProviderConnection('p1'));

      const state = store.getState().aiSettings;
      expect(state.testStatus['p1']).toBe('success');
      expect(state.providers[0].lastTestResult).toBe('success');
      expect(state.providers[0].lastTestedAt).toBe('2024-01-01T00:00:00Z');
    });

    it('should set testStatus to failed on unsuccessful test result', async () => {
      const providers = [{ _id: 'p1', name: 'Provider 1', isPrimary: false }] as any[];
      mockService.getProviderStatuses.mockResolvedValue(providers);
      await store.dispatch(fetchProviderStatuses());

      mockService.testConnection.mockResolvedValue({
        lastTestResult: 'failure',
        lastTestedAt: '2024-01-01T00:00:00Z',
        lastTestError: 'Invalid API key',
      } as any);
      await store.dispatch(testProviderConnection('p1'));

      const state = store.getState().aiSettings;
      expect(state.testStatus['p1']).toBe('failed');
      expect(state.providers[0].lastTestError).toBe('Invalid API key');
    });

    it('should set testStatus to failed on rejection', async () => {
      mockService.testConnection.mockRejectedValue(new Error('Connection timeout'));

      await store.dispatch(testProviderConnection('p1'));

      const state = store.getState().aiSettings;
      expect(state.testStatus['p1']).toBe('failed');
    });

    it('should allow testing multiple providers concurrently', async () => {
      // Start test for p1 that won't resolve
      mockService.testConnection.mockImplementationOnce(() => new Promise(() => {}));
      store.dispatch(testProviderConnection('p1'));

      // Complete test for p2
      mockService.testConnection.mockResolvedValueOnce({
        lastTestResult: 'success',
        lastTestedAt: '2024-01-01T00:00:00Z',
        lastTestError: null,
      } as any);
      await store.dispatch(testProviderConnection('p2'));

      const state = store.getState().aiSettings;
      expect(state.testStatus['p1']).toBe('testing'); // Still testing
      expect(state.testStatus['p2']).toBe('success'); // Completed
    });
  });

  describe('setPrimaryProvider (has pending handler)', () => {
    it('should set status to loading on pending and clear error', async () => {
      mockService.setPrimary.mockImplementation(() => new Promise(() => {}));

      store.dispatch(setPrimaryProvider('p1'));

      const state = store.getState().aiSettings;
      expect(state.status).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should update primary flags on fulfilled', async () => {
      // Set up providers
      const providers = [
        { _id: 'p1', name: 'Provider 1', isPrimary: true },
        { _id: 'p2', name: 'Provider 2', isPrimary: false },
      ] as any[];
      mockService.getProviderStatuses.mockResolvedValue(providers);
      await store.dispatch(fetchProviderStatuses());

      // Set p2 as primary
      mockService.setPrimary.mockResolvedValue(undefined);
      await store.dispatch(setPrimaryProvider('p2'));

      const state = store.getState().aiSettings;
      expect(state.status).toBe('succeeded');
      expect(state.providers.find(p => p._id === 'p1')?.isPrimary).toBe(false);
      expect(state.providers.find(p => p._id === 'p2')?.isPrimary).toBe(true);
    });

    it('should handle rejection', async () => {
      mockService.setPrimary.mockRejectedValue(new Error('Provider not found'));

      await store.dispatch(setPrimaryProvider('nonexistent'));

      const state = store.getState().aiSettings;
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Provider not found');
    });
  });

  describe('error fallback chain verification', () => {
    it('should use error.message when action.payload is undefined', async () => {
      mockService.getProviderStatuses.mockRejectedValue(new Error('Network error'));

      await store.dispatch(fetchProviderStatuses());

      expect(store.getState().aiSettings.error).toBe('Network error');
    });

    it('should use default message when both are missing', async () => {
      mockService.getProviderStatuses.mockRejectedValue(undefined);

      await store.dispatch(fetchProviderStatuses());

      const state = store.getState().aiSettings;
      expect(state.error).toBeTruthy();
      expect(typeof state.error).toBe('string');
    });
  });

  describe('loading flag reset after success and failure', () => {
    it('should reset status after successful fetch', async () => {
      mockService.getProviderStatuses.mockResolvedValue([]);

      await store.dispatch(fetchProviderStatuses());

      expect(store.getState().aiSettings.status).toBe('succeeded');
    });

    it('should reset status after failed fetch', async () => {
      mockService.getProviderStatuses.mockRejectedValue(new Error('fail'));

      await store.dispatch(fetchProviderStatuses());

      expect(store.getState().aiSettings.status).toBe('failed');
    });

    it('should reset saveStatus after successful save', async () => {
      mockService.saveProvider.mockResolvedValue({ _id: 'p1', name: 'Test', isPrimary: false } as any);

      await store.dispatch(saveProviderConfig({ data: { name: 'Test' } as any }));

      expect(store.getState().aiSettings.saveStatus).toBe('saved');
    });

    it('should reset saveStatus after failed save', async () => {
      mockService.saveProvider.mockRejectedValue(new Error('fail'));

      await store.dispatch(saveProviderConfig({ data: { name: 'Test' } as any }));

      expect(store.getState().aiSettings.saveStatus).toBe('failed');
    });
  });
});
