/**
 * Comprehensive tests for websiteIntelSlice async thunk lifecycle handling.
 * Tests verify audit polling, report downloads, delete operations,
 * fix code generation, and Blob/binary response handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import websiteIntelReducer, {
  initiateAudit,
  pollAuditStatus,
  fetchAuditResult,
  fetchAuditHistory,
  fetchComparison,
  removeAudit,
  fetchFixCode,
  downloadReport,
  fetchDataProviders,
} from '../../store/slices/websiteIntelSlice';

// Mock the websiteIntelService module
vi.mock('@/services/websiteIntelService', () => ({
  startWebsiteAudit: vi.fn(),
  getAuditStatus: vi.fn(),
  getAuditResult: vi.fn(),
  getAuditHistory: vi.fn(),
  compareAudits: vi.fn(),
  deleteAudit: vi.fn(),
  generateFix: vi.fn(),
  exportReport: vi.fn(),
  checkDataProvider: vi.fn(),
}));

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
} from '@/services/websiteIntelService';

const mockService = {
  startWebsiteAudit: vi.mocked(startWebsiteAudit),
  getAuditStatus: vi.mocked(getAuditStatus),
  getAuditResult: vi.mocked(getAuditResult),
  getAuditHistory: vi.mocked(getAuditHistory),
  compareAudits: vi.mocked(compareAudits),
  deleteAudit: vi.mocked(deleteAudit),
  generateFix: vi.mocked(generateFix),
  exportReport: vi.mocked(exportReport),
  checkDataProvider: vi.mocked(checkDataProvider),
};

function createTestStore() {
  return configureStore({
    reducer: {
      websiteIntel: websiteIntelReducer,
    },
  });
}

type TestStore = ReturnType<typeof createTestStore>;

describe('websiteIntelSlice', () => {
  let store: TestStore;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore();
  });

  describe('initiateAudit', () => {
    it('should set auditStatus to validating on pending and clear error', async () => {
      mockService.startWebsiteAudit.mockImplementation(() => new Promise(() => {}));

      store.dispatch(initiateAudit({
        url: 'https://example.com',
        targetCountry: 'US',
        targetLanguage: 'en',
        businessType: 'ecommerce',
      }));

      const state = store.getState().websiteIntel;
      expect(state.auditStatus).toBe('validating');
      expect(state.error).toBeNull();
    });

    it('should store auditId and set scanning status on fulfilled', async () => {
      mockService.startWebsiteAudit.mockResolvedValue({ auditId: 'audit-123' } as any);

      await store.dispatch(initiateAudit({
        url: 'https://example.com',
        targetCountry: 'US',
        targetLanguage: 'en',
        businessType: 'ecommerce',
      }));

      const state = store.getState().websiteIntel;
      expect(state.currentAuditId).toBe('audit-123');
      expect(state.auditStatus).toBe('scanning');
      expect(state.scanProgress).toBe(0);
    });

    it('should set error status and message on rejection', async () => {
      mockService.startWebsiteAudit.mockRejectedValue(new Error('Invalid URL'));

      await store.dispatch(initiateAudit({
        url: 'invalid',
        targetCountry: 'US',
        targetLanguage: 'en',
        businessType: 'ecommerce',
      }));

      const state = store.getState().websiteIntel;
      expect(state.auditStatus).toBe('error');
      expect(state.error).toBeTruthy();
    });
  });

  describe('pollAuditStatus', () => {
    it('should reset progress state on rejection', async () => {
      // Set up some progress first
      mockService.getAuditStatus.mockResolvedValueOnce({
        status: 'running',
        progress: 50,
        message: 'Scanning...',
      } as any);
      await store.dispatch(pollAuditStatus('audit-123'));

      // Now fail
      mockService.getAuditStatus.mockRejectedValueOnce(new Error('Poll failed'));
      await store.dispatch(pollAuditStatus('audit-123'));

      const state = store.getState().websiteIntel;
      expect(state.auditStatus).toBe('error');
      expect(state.scanProgress).toBe(0);
      expect(state.scanMessage).toBe('');
      expect(state.error).toBeTruthy();
    });

    it('should update progress on fulfilled with running status', async () => {
      mockService.getAuditStatus.mockResolvedValue({
        status: 'running',
        progress: 75,
        message: 'Analyzing content...',
      } as any);

      await store.dispatch(pollAuditStatus('audit-123'));

      const state = store.getState().websiteIntel;
      expect(state.scanProgress).toBe(75);
      expect(state.scanMessage).toBe('Analyzing content...');
      expect(state.auditStatus).not.toBe('complete'); // Still running
    });

    it('should set complete status when poll returns complete', async () => {
      mockService.getAuditStatus.mockResolvedValue({
        status: 'complete',
        progress: 100,
        message: 'Done',
      } as any);

      await store.dispatch(pollAuditStatus('audit-123'));

      const state = store.getState().websiteIntel;
      expect(state.auditStatus).toBe('complete');
      expect(state.scanProgress).toBe(100);
    });

    it('should clear error on pending', async () => {
      mockService.getAuditStatus.mockImplementation(() => new Promise(() => {}));

      store.dispatch(pollAuditStatus('audit-123'));

      expect(store.getState().websiteIntel.error).toBeNull();
    });
  });

  describe('fetchAuditResult', () => {
    it('should store result and set complete status on fulfilled', async () => {
      const mockResult = {
        overallScore: 85,
        findings: [],
        categories: [],
      };
      mockService.getAuditResult.mockResolvedValue(mockResult as any);

      await store.dispatch(fetchAuditResult('audit-123'));

      const state = store.getState().websiteIntel;
      expect(state.auditResult).toEqual(mockResult);
      expect(state.auditStatus).toBe('complete');
    });

    it('should handle rejection', async () => {
      mockService.getAuditResult.mockRejectedValue(new Error('Not found'));

      await store.dispatch(fetchAuditResult('audit-123'));

      const state = store.getState().websiteIntel;
      expect(state.auditStatus).toBe('error');
      expect(state.error).toBe('Not found');
    });
  });

  describe('fetchAuditHistory', () => {
    it('should set historyLoading on pending and clear error', async () => {
      mockService.getAuditHistory.mockImplementation(() => new Promise(() => {}));

      store.dispatch(fetchAuditHistory('https://example.com'));

      const state = store.getState().websiteIntel;
      expect(state.historyLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should store history and reset loading on fulfilled', async () => {
      const mockHistory = [
        { auditId: 'a1', date: '2024-01-01', score: 80 },
        { auditId: 'a2', date: '2024-01-02', score: 85 },
      ];
      mockService.getAuditHistory.mockResolvedValue(mockHistory as any);

      await store.dispatch(fetchAuditHistory('https://example.com'));

      const state = store.getState().websiteIntel;
      expect(state.history).toEqual(mockHistory);
      expect(state.historyLoading).toBe(false);
    });

    it('should reset loading on rejection', async () => {
      mockService.getAuditHistory.mockRejectedValue(new Error('Failed'));

      await store.dispatch(fetchAuditHistory('https://example.com'));

      const state = store.getState().websiteIntel;
      expect(state.historyLoading).toBe(false);
      expect(state.error).toBe('Failed');
    });
  });

  describe('fetchComparison', () => {
    it('should set comparisonLoading on pending', async () => {
      mockService.compareAudits.mockImplementation(() => new Promise(() => {}));

      store.dispatch(fetchComparison({ beforeId: 'a1', afterId: 'a2' }));

      expect(store.getState().websiteIntel.comparisonLoading).toBe(true);
      expect(store.getState().websiteIntel.error).toBeNull();
    });

    it('should store comparison on fulfilled', async () => {
      const mockComparison = { improvements: [], regressions: [] };
      mockService.compareAudits.mockResolvedValue(mockComparison as any);

      await store.dispatch(fetchComparison({ beforeId: 'a1', afterId: 'a2' }));

      const state = store.getState().websiteIntel;
      expect(state.comparison).toEqual(mockComparison);
      expect(state.comparisonLoading).toBe(false);
    });

    it('should handle rejection', async () => {
      mockService.compareAudits.mockRejectedValue(new Error('Compare failed'));

      await store.dispatch(fetchComparison({ beforeId: 'a1', afterId: 'a2' }));

      const state = store.getState().websiteIntel;
      expect(state.comparisonLoading).toBe(false);
      expect(state.error).toBe('Compare failed');
    });
  });

  describe('removeAudit (delete operations with dedicated isDeleting flag)', () => {
    it('should set isDeleting on pending and clear error', async () => {
      mockService.deleteAudit.mockImplementation(() => new Promise(() => {}));

      store.dispatch(removeAudit('audit-123'));

      const state = store.getState().websiteIntel;
      expect(state.isDeleting).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should remove from history and reset isDeleting on fulfilled', async () => {
      // Set up history with the audit to delete
      const mockHistory = [
        { auditId: 'audit-123', date: '2024-01-01' },
        { auditId: 'audit-456', date: '2024-01-02' },
      ] as any[];
      mockService.getAuditHistory.mockResolvedValue(mockHistory);
      await store.dispatch(fetchAuditHistory('https://example.com'));

      // Delete one
      mockService.deleteAudit.mockResolvedValue(undefined);
      await store.dispatch(removeAudit('audit-123'));

      const state = store.getState().websiteIntel;
      expect(state.isDeleting).toBe(false);
      expect(state.history.length).toBe(1);
      expect(state.history[0].auditId).toBe('audit-456');
    });

    it('should clear current audit if deleted audit matches', async () => {
      // Set current audit
      mockService.startWebsiteAudit.mockResolvedValue({ auditId: 'audit-123' } as any);
      await store.dispatch(initiateAudit({
        url: 'https://example.com',
        targetCountry: 'US',
        targetLanguage: 'en',
        businessType: 'ecommerce',
      }));

      // Delete it
      mockService.deleteAudit.mockResolvedValue(undefined);
      await store.dispatch(removeAudit('audit-123'));

      const state = store.getState().websiteIntel;
      expect(state.currentAuditId).toBeNull();
      expect(state.auditResult).toBeNull();
      expect(state.auditStatus).toBe('idle');
    });

    it('should reset isDeleting on rejection', async () => {
      mockService.deleteAudit.mockRejectedValue(new Error('Delete failed'));

      await store.dispatch(removeAudit('audit-123'));

      const state = store.getState().websiteIntel;
      expect(state.isDeleting).toBe(false);
      expect(state.error).toBe('Delete failed');
    });
  });

  describe('fetchFixCode (uses fixCodeLoading flag)', () => {
    it('should set fixCodeLoading on pending and clear error', async () => {
      mockService.generateFix.mockImplementation(() => new Promise(() => {}));

      store.dispatch(fetchFixCode({ auditId: 'audit-123', findingId: 'finding-1' }));

      const state = store.getState().websiteIntel;
      expect(state.fixCodeLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should update finding with fix code on fulfilled', async () => {
      // Set up audit result with a finding
      const mockResult = {
        findings: [{ id: 'finding-1', problem: 'test' }],
      } as any;
      mockService.getAuditResult.mockResolvedValue(mockResult);
      await store.dispatch(fetchAuditResult('audit-123'));

      // Generate fix
      mockService.generateFix.mockResolvedValue({ fixCode: '<div>fixed</div>' } as any);
      await store.dispatch(fetchFixCode({ auditId: 'audit-123', findingId: 'finding-1' }));

      const state = store.getState().websiteIntel;
      expect(state.fixCodeLoading).toBe(false);
      expect(state.auditResult?.findings[0].fixCode).toBe('<div>fixed</div>');
    });

    it('should reset fixCodeLoading on rejection', async () => {
      mockService.generateFix.mockRejectedValue(new Error('Generation failed'));

      await store.dispatch(fetchFixCode({ auditId: 'audit-123', findingId: 'finding-1' }));

      const state = store.getState().websiteIntel;
      expect(state.fixCodeLoading).toBe(false);
      expect(state.error).toBe('Generation failed');
    });
  });

  describe('downloadReport (Blob/binary response handling)', () => {
    it('should set isDownloading on pending and clear error', async () => {
      mockService.exportReport.mockImplementation(() => new Promise(() => {}));

      store.dispatch(downloadReport({ auditId: 'audit-123', format: 'pdf' }));

      const state = store.getState().websiteIntel;
      expect(state.isDownloading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should reset isDownloading on fulfilled', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/pdf' });
      mockService.exportReport.mockResolvedValue(mockBlob);

      await store.dispatch(downloadReport({ auditId: 'audit-123', format: 'pdf' }));

      const state = store.getState().websiteIntel;
      expect(state.isDownloading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should reset isDownloading on rejection', async () => {
      mockService.exportReport.mockRejectedValue(new Error('Download failed'));

      await store.dispatch(downloadReport({ auditId: 'audit-123', format: 'csv' }));

      const state = store.getState().websiteIntel;
      expect(state.isDownloading).toBe(false);
      expect(state.error).toBe('Download failed');
    });
  });

  describe('fetchDataProviders', () => {
    it('should set providersLoading on pending', async () => {
      mockService.checkDataProvider.mockImplementation(() => new Promise(() => {}));

      store.dispatch(fetchDataProviders());

      expect(store.getState().websiteIntel.providersLoading).toBe(true);
      expect(store.getState().websiteIntel.error).toBeNull();
    });

    it('should store providers on fulfilled', async () => {
      const mockProviders = {
        keywordProvider: true,
        backlinkProvider: false,
        searchConsole: true,
        performanceApi: false,
      };
      mockService.checkDataProvider.mockResolvedValue(mockProviders as any);

      await store.dispatch(fetchDataProviders());

      const state = store.getState().websiteIntel;
      expect(state.providers).toEqual(mockProviders);
      expect(state.providersLoading).toBe(false);
    });

    it('should handle rejection', async () => {
      mockService.checkDataProvider.mockRejectedValue(new Error('Provider check failed'));

      await store.dispatch(fetchDataProviders());

      const state = store.getState().websiteIntel;
      expect(state.providersLoading).toBe(false);
      expect(state.error).toBe('Provider check failed');
    });
  });

  describe('error fallback chain verification', () => {
    it('should use error.message when action.payload is undefined', async () => {
      mockService.getAuditHistory.mockRejectedValue(new Error('Specific network error'));

      await store.dispatch(fetchAuditHistory('https://example.com'));

      const state = store.getState().websiteIntel;
      expect(state.error).toBe('Specific network error');
    });
  });
});
