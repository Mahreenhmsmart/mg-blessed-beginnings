/**
 * Comprehensive tests for securityAuditSlice async thunk lifecycle handling.
 * Tests verify delete operations with isDeleting flag, scan status polling,
 * detail fetching, and report retrieval with pending handlers that clear errors.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import securityAuditReducer, {
  authorizeTarget,
  startScan,
  fetchScanStatus,
  fetchScanDetails,
  fetchScanHistory,
  fetchScanReport,
  deleteScanFromHistory,
} from '../../store/slices/securityAuditSlice';

// Mock the securityAuditService module
vi.mock('../../services/securityAuditService', () => ({
  authorizeTarget: vi.fn(),
  startSecurityScan: vi.fn(),
  getScanStatus: vi.fn(),
  getScanDetails: vi.fn(),
  getScanHistory: vi.fn(),
  getScanReport: vi.fn(),
  deleteScan: vi.fn(),
}));

import * as securityAuditService from '../../services/securityAuditService';

const mockService = vi.mocked(securityAuditService);

function createTestStore() {
  return configureStore({
    reducer: {
      securityAudit: securityAuditReducer,
    },
  });
}

type TestStore = ReturnType<typeof createTestStore>;

describe('securityAuditSlice', () => {
  let store: TestStore;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore();
  });

  describe('authorizeTarget', () => {
    it('should set isAuthorizing on pending and clear error', async () => {
      mockService.authorizeTarget.mockImplementation(() => new Promise(() => {}));

      store.dispatch(authorizeTarget('https://example.com'));

      const state = store.getState().securityAudit;
      expect(state.isAuthorizing).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should store authorization info on fulfilled', async () => {
      const mockAuth = { authorized: true, target: 'https://example.com' };
      mockService.authorizeTarget.mockResolvedValue(mockAuth as any);

      await store.dispatch(authorizeTarget('https://example.com'));

      const state = store.getState().securityAudit;
      expect(state.isAuthorizing).toBe(false);
      expect(state.authorizationInfo).toEqual(mockAuth);
    });

    it('should handle rejection', async () => {
      mockService.authorizeTarget.mockRejectedValue(new Error('Authorization denied'));

      await store.dispatch(authorizeTarget('https://evil.com'));

      const state = store.getState().securityAudit;
      expect(state.isAuthorizing).toBe(false);
      expect(state.error).toBeTruthy();
    });
  });

  describe('startScan', () => {
    it('should set isStarting on pending and clear error', async () => {
      mockService.startSecurityScan.mockImplementation(() => new Promise(() => {}));

      store.dispatch(startScan({ target: 'https://example.com', authorizationConfirmed: true }));

      const state = store.getState().securityAudit;
      expect(state.isStarting).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should initialize scan state on fulfilled', async () => {
      mockService.startSecurityScan.mockResolvedValue({ scanId: 'scan-123' } as any);

      await store.dispatch(startScan({ target: 'https://example.com', authorizationConfirmed: true }));

      const state = store.getState().securityAudit;
      expect(state.isStarting).toBe(false);
      expect(state.currentScanId).toBe('scan-123');
      expect(state.currentScanStatus).toBe('pending');
      expect(state.currentScanProgress).toBe(0);
      expect(state.currentScanMessage).toBe('Initializing scan...');
      expect(state.scanDetails).toBeNull();
      expect(state.reportContent).toBeNull();
    });

    it('should handle rejection', async () => {
      mockService.startSecurityScan.mockRejectedValue(new Error('Scan failed to start'));

      await store.dispatch(startScan({ target: 'https://example.com', authorizationConfirmed: true }));

      const state = store.getState().securityAudit;
      expect(state.isStarting).toBe(false);
      expect(state.error).toBeTruthy();
    });
  });

  describe('fetchScanStatus (polling with pending handler that clears errors)', () => {
    it('should clear error on pending', async () => {
      mockService.getScanStatus.mockImplementation(() => new Promise(() => {}));

      store.dispatch(fetchScanStatus('scan-123'));

      expect(store.getState().securityAudit.error).toBeNull();
    });

    it('should update status fields on fulfilled', async () => {
      mockService.getScanStatus.mockResolvedValue({
        status: 'running',
        progress: 45,
        statusMessage: 'Scanning endpoints...',
      } as any);

      await store.dispatch(fetchScanStatus('scan-123'));

      const state = store.getState().securityAudit;
      expect(state.currentScanStatus).toBe('running');
      expect(state.currentScanProgress).toBe(45);
      expect(state.currentScanMessage).toBe('Scanning endpoints...');
    });

    it('should not set error state on rejection (polling failure is logged only)', async () => {
      mockService.getScanStatus.mockRejectedValue(new Error('Poll timeout'));

      await store.dispatch(fetchScanStatus('scan-123'));

      // The slice intentionally doesn't set error for polling failures
      // It just logs to console.error
      const state = store.getState().securityAudit;
      expect(state.error).toBeNull(); // No error set for polling failures
    });
  });

  describe('fetchScanDetails (pending handler clears errors)', () => {
    it('should clear error on pending', async () => {
      mockService.getScanDetails.mockImplementation(() => new Promise(() => {}));

      store.dispatch(fetchScanDetails('scan-123'));

      expect(store.getState().securityAudit.error).toBeNull();
    });

    it('should store details and update status on fulfilled', async () => {
      const mockDetails = {
        scanId: 'scan-123',
        status: 'completed',
        findings: [],
        score: 85,
      };
      mockService.getScanDetails.mockResolvedValue(mockDetails as any);

      await store.dispatch(fetchScanDetails('scan-123'));

      const state = store.getState().securityAudit;
      expect(state.scanDetails).toEqual(mockDetails);
      expect(state.currentScanStatus).toBe('completed');
      expect(state.currentScanProgress).toBe(100);
    });

    it('should handle rejection', async () => {
      mockService.getScanDetails.mockRejectedValue(new Error('Details unavailable'));

      await store.dispatch(fetchScanDetails('scan-123'));

      const state = store.getState().securityAudit;
      expect(state.error).toBe('Details unavailable');
    });
  });

  describe('fetchScanHistory', () => {
    it('should set historyStatus to loading on pending and clear error', async () => {
      mockService.getScanHistory.mockImplementation(() => new Promise(() => {}));

      store.dispatch(fetchScanHistory());

      const state = store.getState().securityAudit;
      expect(state.historyStatus).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should store history on fulfilled', async () => {
      const mockHistory = [
        { scanId: 's1', date: '2024-01-01', score: 80 },
        { scanId: 's2', date: '2024-01-02', score: 85 },
      ];
      mockService.getScanHistory.mockResolvedValue(mockHistory as any);

      await store.dispatch(fetchScanHistory());

      const state = store.getState().securityAudit;
      expect(state.historyStatus).toBe('succeeded');
      expect(state.history).toEqual(mockHistory);
    });

    it('should handle rejection', async () => {
      mockService.getScanHistory.mockRejectedValue(new Error('History fetch failed'));

      await store.dispatch(fetchScanHistory());

      const state = store.getState().securityAudit;
      expect(state.historyStatus).toBe('failed');
      expect(state.error).toBe('History fetch failed');
    });
  });

  describe('fetchScanReport (pending handler clears errors)', () => {
    it('should clear error on pending', async () => {
      mockService.getScanReport.mockImplementation(() => new Promise(() => {}));

      store.dispatch(fetchScanReport('scan-123'));

      expect(store.getState().securityAudit.error).toBeNull();
    });

    it('should store report content on fulfilled', async () => {
      const mockReport = '# Security Report\n\n## Summary\nAll clear.';
      mockService.getScanReport.mockResolvedValue(mockReport);

      await store.dispatch(fetchScanReport('scan-123'));

      const state = store.getState().securityAudit;
      expect(state.reportContent).toBe(mockReport);
    });

    it('should handle rejection', async () => {
      mockService.getScanReport.mockRejectedValue(new Error('Report generation failed'));

      await store.dispatch(fetchScanReport('scan-123'));

      const state = store.getState().securityAudit;
      expect(state.error).toBe('Report generation failed');
    });
  });

  describe('deleteScanFromHistory (dedicated isDeleting flag)', () => {
    it('should set isDeleting on pending and clear error', async () => {
      mockService.deleteScan.mockImplementation(() => new Promise(() => {}));

      store.dispatch(deleteScanFromHistory('scan-123'));

      const state = store.getState().securityAudit;
      expect(state.isDeleting).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should remove scan from history on fulfilled and reset isDeleting', async () => {
      // Set up history
      const mockHistory = [
        { scanId: 'scan-123', date: '2024-01-01' },
        { scanId: 'scan-456', date: '2024-01-02' },
      ] as any[];
      mockService.getScanHistory.mockResolvedValue(mockHistory);
      await store.dispatch(fetchScanHistory());

      // Delete one
      mockService.deleteScan.mockResolvedValue(undefined);
      await store.dispatch(deleteScanFromHistory('scan-123'));

      const state = store.getState().securityAudit;
      expect(state.isDeleting).toBe(false);
      expect(state.history.length).toBe(1);
      expect(state.history[0].scanId).toBe('scan-456');
    });

    it('should reset isDeleting on rejection', async () => {
      mockService.deleteScan.mockRejectedValue(new Error('Delete failed'));

      await store.dispatch(deleteScanFromHistory('scan-123'));

      const state = store.getState().securityAudit;
      expect(state.isDeleting).toBe(false);
      expect(state.error).toBeTruthy();
    });

    it('should allow concurrent delete and other operations without interference', async () => {
      // Start a history fetch that won't resolve
      mockService.getScanHistory.mockImplementation(() => new Promise(() => {}));
      store.dispatch(fetchScanHistory());

      // Complete a delete
      mockService.deleteScan.mockResolvedValue(undefined);
      await store.dispatch(deleteScanFromHistory('some-scan'));

      const state = store.getState().securityAudit;
      expect(state.historyStatus).toBe('loading'); // Still loading from fetch
      expect(state.isDeleting).toBe(false); // Delete completed
    });
  });

  describe('error fallback chain verification', () => {
    it('should use action.payload from rejectWithValue when available', async () => {
      // The thunks use rejectWithValue, so the error message comes through payload
      mockService.authorizeTarget.mockRejectedValue(new Error('Auth rejected'));

      await store.dispatch(authorizeTarget('https://test.com'));

      const state = store.getState().securityAudit;
      expect(state.error).toBeTruthy();
    });

    it('should fall back to error.message when payload is undefined', async () => {
      mockService.getScanDetails.mockRejectedValue(new Error('Specific detail error'));

      await store.dispatch(fetchScanDetails('scan-123'));

      expect(store.getState().securityAudit.error).toBe('Specific detail error');
    });
  });

  describe('loading flag reset after success and failure', () => {
    it('should reset isStarting after successful scan start', async () => {
      mockService.startSecurityScan.mockResolvedValue({ scanId: 's1' } as any);

      await store.dispatch(startScan({ target: 'https://test.com', authorizationConfirmed: true }));

      expect(store.getState().securityAudit.isStarting).toBe(false);
    });

    it('should reset isStarting after failed scan start', async () => {
      mockService.startSecurityScan.mockRejectedValue(new Error('fail'));

      await store.dispatch(startScan({ target: 'https://test.com', authorizationConfirmed: true }));

      expect(store.getState().securityAudit.isStarting).toBe(false);
    });

    it('should reset isAuthorizing after success', async () => {
      mockService.authorizeTarget.mockResolvedValue({ authorized: true } as any);

      await store.dispatch(authorizeTarget('https://test.com'));

      expect(store.getState().securityAudit.isAuthorizing).toBe(false);
    });

    it('should reset isAuthorizing after failure', async () => {
      mockService.authorizeTarget.mockRejectedValue(new Error('fail'));

      await store.dispatch(authorizeTarget('https://test.com'));

      expect(store.getState().securityAudit.isAuthorizing).toBe(false);
    });
  });
});
