import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { contactApiService } from '@/services/contactService';
import type { ContactMessage, ContactFormData } from '@/types';

interface ContactState {
  message: ContactMessage | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ContactState = {
  message: null,
  status: 'idle',
  error: null,
};

export const submitContactForm = createAsyncThunk(
  'contact/submit',
  async (data: ContactFormData) => {
    return await contactApiService.create(data);
  }
);

const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    resetContact: (state) => {
      state.message = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitContactForm.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(submitContactForm.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.message = action.payload;
      })
      .addCase(submitContactForm.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Sorry, your message could not be sent. Please try again or WhatsApp us directly.';
      });
  },
});

export const { resetContact } = contactSlice.actions;
export default contactSlice.reducer;
