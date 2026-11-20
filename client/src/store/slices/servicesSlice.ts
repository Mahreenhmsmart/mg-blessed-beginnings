import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serviceApiService } from '../../services/serviceService';
import type { Service } from '../../types';

interface ServicesState {
  items: Service[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ServicesState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchServices = createAsyncThunk(
  'services/fetchAll',
  async () => {
    return await serviceApiService.getAll();
  }
);

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch services';
      });
  },
});

export default servicesSlice.reducer;
