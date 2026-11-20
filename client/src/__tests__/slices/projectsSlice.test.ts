/**
 * Comprehensive tests for projectsSlice async thunk lifecycle handling.
 * Tests verify error clearing on pending, fetchProjectById rejection handling,
 * and CRUD operations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import projectsReducer, {
  fetchProjects,
  createNewProject,
  fetchProjectById,
  updateExistingProject,
  deleteExistingProject,
} from '../../store/slices/projectsSlice';

// Mock the projectService module
vi.mock('../../services/projectService', () => ({
  getProjects: vi.fn(),
  createProject: vi.fn(),
  getProjectById: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
}));

import * as projectService from '../../services/projectService';

const mockService = vi.mocked(projectService);

function createTestStore() {
  return configureStore({
    reducer: {
      projects: projectsReducer,
    },
  });
}

type TestStore = ReturnType<typeof createTestStore>;

describe('projectsSlice', () => {
  let store: TestStore;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore();
  });

  describe('fetchProjects', () => {
    it('should set status to loading on pending and clear error', async () => {
      mockService.getProjects.mockImplementation(() => new Promise(() => {}));

      store.dispatch(fetchProjects());

      const state = store.getState().projects;
      expect(state.status).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should store projects and auto-select first on fulfilled', async () => {
      const mockProjects = [
        { _id: 'p1', name: 'Project 1', url: 'https://p1.com' },
        { _id: 'p2', name: 'Project 2', url: 'https://p2.com' },
      ];
      mockService.getProjects.mockResolvedValue(mockProjects as any);

      await store.dispatch(fetchProjects());

      const state = store.getState().projects;
      expect(state.status).toBe('succeeded');
      expect(state.items).toEqual(mockProjects);
      expect(state.currentProjectId).toBe('p1'); // Auto-selected first
    });

    it('should not override existing currentProjectId on fulfilled', async () => {
      // Set a current project first
      const initialProjects = [{ _id: 'existing', name: 'Existing', url: 'https://ex.com' }] as any[];
      mockService.getProjects.mockResolvedValue(initialProjects);
      await store.dispatch(fetchProjects());

      // Fetch again with more projects
      const moreProjects = [
        { _id: 'existing', name: 'Existing', url: 'https://ex.com' },
        { _id: 'new', name: 'New', url: 'https://new.com' },
      ] as any[];
      mockService.getProjects.mockResolvedValue(moreProjects);
      await store.dispatch(fetchProjects());

      expect(store.getState().projects.currentProjectId).toBe('existing');
    });

    it('should handle rejection with error fallback chain', async () => {
      mockService.getProjects.mockRejectedValue(new Error('Unauthorized'));

      await store.dispatch(fetchProjects());

      const state = store.getState().projects;
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Unauthorized');
    });

    it('should clear previous error on new pending action', async () => {
      // First, cause an error
      mockService.getProjects.mockRejectedValueOnce(new Error('First error'));
      await store.dispatch(fetchProjects());

      expect(store.getState().projects.error).toBe('First error');

      // Now start a new fetch (don't resolve it yet)
      mockService.getProjects.mockImplementationOnce(() => new Promise(() => {}));
      store.dispatch(fetchProjects());

      // Error should be cleared
      expect(store.getState().projects.error).toBeNull();
    });
  });

  describe('createNewProject', () => {
    it('should set status to loading on pending and clear error', async () => {
      mockService.createProject.mockImplementation(() => new Promise(() => {}));

      store.dispatch(createNewProject({ url: 'https://new.com', name: 'New Project' }));

      const state = store.getState().projects;
      expect(state.status).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should add project and set as current on fulfilled', async () => {
      const mockProject = { _id: 'new-id', name: 'New Project', url: 'https://new.com' };
      mockService.createProject.mockResolvedValue(mockProject as any);

      await store.dispatch(createNewProject({ url: 'https://new.com', name: 'New Project' }));

      const state = store.getState().projects;
      expect(state.status).toBe('succeeded');
      expect(state.items).toContainEqual(mockProject);
      expect(state.currentProjectId).toBe('new-id');
    });

    it('should handle rejection', async () => {
      mockService.createProject.mockRejectedValue(new Error('Duplicate URL'));

      await store.dispatch(createNewProject({ url: 'https://dup.com', name: 'Dup' }));

      const state = store.getState().projects;
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Duplicate URL');
    });
  });

  describe('fetchProjectById', () => {
    it('should set status to loading on pending and clear error', async () => {
      mockService.getProjectById.mockImplementation(() => new Promise(() => {}));

      store.dispatch(fetchProjectById('p1'));

      const state = store.getState().projects;
      expect(state.status).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should update existing project in items on fulfilled', async () => {
      // Set up initial projects
      const initialProjects = [{ _id: 'p1', name: 'Old Name', url: 'https://old.com' }] as any[];
      mockService.getProjects.mockResolvedValue(initialProjects);
      await store.dispatch(fetchProjects());

      // Fetch updated version
      const updatedProject = { _id: 'p1', name: 'Updated Name', url: 'https://updated.com' };
      mockService.getProjectById.mockResolvedValue(updatedProject as any);
      await store.dispatch(fetchProjectById('p1'));

      const state = store.getState().projects;
      expect(state.items[0].name).toBe('Updated Name');
    });

    it('should add project to items if not found on fulfilled', async () => {
      const newProject = { _id: 'p-new', name: 'Brand New', url: 'https://brand.com' };
      mockService.getProjectById.mockResolvedValue(newProject as any);

      await store.dispatch(fetchProjectById('p-new'));

      const state = store.getState().projects;
      expect(state.items).toContainEqual(newProject);
    });

    it('should store errors on rejection', async () => {
      mockService.getProjectById.mockRejectedValue(new Error('Project not found'));

      await store.dispatch(fetchProjectById('nonexistent'));

      const state = store.getState().projects;
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Project not found');
    });

    it('should clear error on pending even after previous failure', async () => {
      // Cause a failure
      mockService.getProjectById.mockRejectedValueOnce(new Error('Not found'));
      await store.dispatch(fetchProjectById('bad-id'));

      expect(store.getState().projects.error).toBe('Not found');

      // Start new fetch
      mockService.getProjectById.mockImplementationOnce(() => new Promise(() => {}));
      store.dispatch(fetchProjectById('another-id'));

      expect(store.getState().projects.error).toBeNull();
    });
  });

  describe('updateExistingProject', () => {
    it('should set status to loading on pending and clear error', async () => {
      mockService.updateProject.mockImplementation(() => new Promise(() => {}));

      store.dispatch(updateExistingProject({ id: 'p1', data: { name: 'Updated' } }));

      const state = store.getState().projects;
      expect(state.status).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should update project in items on fulfilled', async () => {
      // Set up initial project
      const initialProjects = [{ _id: 'p1', name: 'Original', url: 'https://orig.com' }] as any[];
      mockService.getProjects.mockResolvedValue(initialProjects);
      await store.dispatch(fetchProjects());

      // Update it
      const updatedProject = { _id: 'p1', name: 'Updated', url: 'https://orig.com' };
      mockService.updateProject.mockResolvedValue(updatedProject as any);
      await store.dispatch(updateExistingProject({ id: 'p1', data: { name: 'Updated' } }));

      expect(store.getState().projects.items[0].name).toBe('Updated');
    });

    it('should handle rejection', async () => {
      mockService.updateProject.mockRejectedValue(new Error('Update failed'));

      await store.dispatch(updateExistingProject({ id: 'p1', data: { name: 'Bad' } }));

      const state = store.getState().projects;
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Update failed');
    });
  });

  describe('deleteExistingProject', () => {
    it('should set status to loading on pending and clear error', async () => {
      mockService.deleteProject.mockImplementation(() => new Promise(() => {}));

      store.dispatch(deleteExistingProject('p1'));

      const state = store.getState().projects;
      expect(state.status).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should remove project and reassign current on fulfilled', async () => {
      // Set up two projects
      const projects = [
        { _id: 'p1', name: 'Project 1', url: 'https://p1.com' },
        { _id: 'p2', name: 'Project 2', url: 'https://p2.com' },
      ] as any[];
      mockService.getProjects.mockResolvedValue(projects);
      await store.dispatch(fetchProjects());

      expect(store.getState().projects.currentProjectId).toBe('p1');

      // Delete current project
      mockService.deleteProject.mockResolvedValue(undefined);
      await store.dispatch(deleteExistingProject('p1'));

      const state = store.getState().projects;
      expect(state.items.length).toBe(1);
      expect(state.currentProjectId).toBe('p2'); // Reassigned to remaining
    });

    it('should set currentProjectId to null when last project deleted', async () => {
      const projects = [{ _id: 'p1', name: 'Only Project', url: 'https://only.com' }] as any[];
      mockService.getProjects.mockResolvedValue(projects);
      await store.dispatch(fetchProjects());

      mockService.deleteProject.mockResolvedValue(undefined);
      await store.dispatch(deleteExistingProject('p1'));

      const state = store.getState().projects;
      expect(state.items.length).toBe(0);
      expect(state.currentProjectId).toBeNull();
    });

    it('should handle rejection', async () => {
      mockService.deleteProject.mockRejectedValue(new Error('Cannot delete'));

      await store.dispatch(deleteExistingProject('p1'));

      const state = store.getState().projects;
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Cannot delete');
    });
  });

  describe('error fallback chain verification', () => {
    it('should use error.message when action.payload is undefined', async () => {
      mockService.getProjects.mockRejectedValue(new Error('Specific error message'));

      await store.dispatch(fetchProjects());

      expect(store.getState().projects.error).toBe('Specific error message');
    });
  });
});
