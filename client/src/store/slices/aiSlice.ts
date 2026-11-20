import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { aiService } from '@/services/aiService';

interface AIState {
  prompt: string;
  response: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AIState = {
  prompt: '',
  response: null,
  status: 'idle',
  error: null,
};

interface SendAIPromptArgs {
  prompt: string;
  system?: string;
}

export const sendAIPrompt = createAsyncThunk(
  'ai/sendPrompt',
  async ({ prompt, system }: SendAIPromptArgs) => {
    const result = await aiService.chat(prompt, system);
    return result.data.response;
  },
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearAIResponse: (state) => {
      state.prompt = '';
      state.response = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendAIPrompt.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(sendAIPrompt.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.response = action.payload;
      })
      .addCase(sendAIPrompt.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to get AI response';
      });
  },
});

export const { clearAIResponse } = aiSlice.actions;
export default aiSlice.reducer;
