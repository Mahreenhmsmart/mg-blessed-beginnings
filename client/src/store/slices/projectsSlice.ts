import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as projectService from '../../services/projectService';
import type { Project } from '../../types';

interface ProjectsState {
  items: Project[];
  currentProjectId: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProjectsState = {
  items: [],
  currentProjectId: null,
  status: 'idle',
  error: null,
};

export const fetchProjects = createAsyncThunk('projects/fetchAll', async () => {
  return projectService.getProjects();
});

export const createNewProject = createAsyncThunk(
  'projects/create',
  async (data: { url: string; name: string; competitors?: string[] }) => {
    return projectService.createProject(data);
  },
);

export const fetchProjectById = createAsyncThunk('projects/fetchById', async (id: string) => {
  return projectService.getProjectById(id);
});

export const updateExistingProject = createAsyncThunk(
  'projects/update',
  async ({ id, data }: { id: string; data: { name?: string; url?: string; competitors?: string[] } }) => {
    return projectService.updateProject(id, data);
  },
);

export const deleteExistingProject = createAsyncThunk('projects/delete', async (id: string) => {
  await projectService.deleteProject(id);
  return id;
});

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setCurrentProject(state, action) {
      state.currentProjectId = action.payload;
    },
    clearProjects(state) {
      state.items = [];
      state.currentProjectId = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        if (!state.currentProjectId && action.payload.length > 0) {
          state.currentProjectId = action.payload[0]._id;
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch projects';
      })
      .addCase(createNewProject.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createNewProject.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.push(action.payload);
        state.currentProjectId = action.payload._id;
      })
      .addCase(createNewProject.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to create project';
      })
      .addCase(fetchProjectById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx >= 0) {
          state.items[idx] = action.payload;
        } else {
          state.items.push(action.payload);
        }
        state.status = 'succeeded';
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch project';
      })
      .addCase(updateExistingProject.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateExistingProject.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx >= 0) {
          state.items[idx] = action.payload;
        }
      })
      .addCase(updateExistingProject.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to update project';
      })
      .addCase(deleteExistingProject.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteExistingProject.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter((p) => p._id !== action.payload);
        if (state.currentProjectId === action.payload) {
          state.currentProjectId = state.items.length > 0 ? state.items[0]._id : null;
        }
      })
      .addCase(deleteExistingProject.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to delete project';
      });
  },
});

export const { setCurrentProject, clearProjects } = projectsSlice.actions;
export default projectsSlice.reducer;
