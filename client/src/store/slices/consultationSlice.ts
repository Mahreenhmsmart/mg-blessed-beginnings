import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { consultationService } from '../../services/consultationService';
import type { Consultation, ConsultationFormData } from '../../types';

interface ConsultationState {
  booking: Consultation | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ConsultationState = {
  booking: null,
  status: 'idle',
  error: null,
};

export const createBooking = createAsyncThunk(
  'consultation/create',
  async (data: ConsultationFormData) => {
    return await consultationService.create(data);
  }
);

const consultationSlice = createSlice({
  name: 'consultation',
  initialState,
  reducers: {
    resetBooking: (state) => {
      state.booking = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.booking = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to create booking';
      });
  },
});

export const { resetBooking } = consultationSlice.actions;
export default consultationSlice.reducer;
