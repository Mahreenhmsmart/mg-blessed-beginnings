import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { loginRequest, registerRequest } from '../../services/authService';
import type { User, LoginCredentials, RegisterCredentials, UserRole } from '../../types';

interface JwtPayload {
  id?: string;
  name?: string;
  email: string;
  role: UserRole;
  exp: number;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(payload: JwtPayload): boolean {
  return Date.now() >= payload.exp * 1000;
}

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Attempt to restore session from localStorage on module load
function getInitialState(): AuthState {
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    const payload = decodeJwtPayload(storedToken);
    if (payload && !isTokenExpired(payload)) {
      return {
        user: { id: payload.id, name: payload.name, email: payload.email, role: payload.role },
        token: storedToken,
        status: 'succeeded',
        error: null,
      };
    }
    // Token expired or invalid — clear it
    localStorage.removeItem('token');
  }
  return { user: null, token: null, status: 'idle', error: null };
}

const initialState: AuthState = getInitialState();

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const result = await loginRequest(credentials);
      localStorage.setItem('token', result.token);
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      return rejectWithValue(message);
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const result = await registerRequest(credentials);
      localStorage.setItem('token', result.token);
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      return rejectWithValue(message);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('token');
    },
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = 'succeeded';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Login failed';
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Registration failed';
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
