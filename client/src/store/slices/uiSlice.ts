import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ToastItem {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'info';
}

interface UiState {
  globalLoading: boolean;
  toasts: ToastItem[];
}

const initialState: UiState = {
  globalLoading: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.globalLoading = action.payload;
    },
    addToast(state, action: PayloadAction<Omit<ToastItem, 'id'>>) {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      state.toasts.push({ ...action.payload, id });
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearToasts(state) {
      state.toasts = [];
    },
  },
});

export const { setGlobalLoading, addToast, removeToast, clearToasts } = uiSlice.actions;
export default uiSlice.reducer;
