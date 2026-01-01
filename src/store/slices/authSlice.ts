"use client";

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserResponse } from '@/types/user';

interface AuthState {
  user: UserResponse | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  loginForm: {
    identifier: string;
    password: string;
  };
  signupForm: {
    name: string;
    email: string;
    mobile: string;
    username: string;
    password: string;
  };
  loginErrors: {
    identifier?: string;
    password?: string;
    general?: string;
  };
  signupErrors: {
    name?: string;
    email?: string;
    mobile?: string;
    username?: string;
    password?: string;
    general?: string;
  };
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
  loginForm: {
    identifier: '',
    password: '',
  },
  signupForm: {
    name: '',
    email: '',
    mobile: '',
    username: '',
    password: '',
  },
  loginErrors: {},
  signupErrors: {},
};

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async () => {
    const response = await fetch('/api/auth/me');
    const data = await response.json();
    return data.user;
  }
);

// Login Thunk
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      return data.user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Signup Thunk
export const signup = createAsyncThunk(
  'auth/signup',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Signup failed');
      return data.user; // Assuming register returns user
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Logout Thunk
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Logout failed');
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<UserResponse>) => {
      state.user = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
      state.loginErrors = {};
      state.signupErrors = {};
    },
    updateLoginForm: (state, action: PayloadAction<Partial<AuthState['loginForm']>>) => {
      state.loginForm = { ...state.loginForm, ...action.payload };
      // Clear errors for updated fields
      Object.keys(action.payload).forEach((key) => {
        if (state.loginErrors[key as keyof AuthState['loginErrors']]) {
            state.loginErrors[key as keyof AuthState['loginErrors']] = undefined;
        }
      });
      state.loginErrors.general = undefined;
    },
    updateSignupForm: (state, action: PayloadAction<Partial<AuthState['signupForm']>>) => {
      state.signupForm = { ...state.signupForm, ...action.payload };
       // Clear errors for updated fields
      Object.keys(action.payload).forEach((key) => {
        if (state.signupErrors[key as keyof AuthState['signupErrors']]) {
            state.signupErrors[key as keyof AuthState['signupErrors']] = undefined;
        }
      });
      state.signupErrors.general = undefined;
    },
    resetForms: (state) => {
      state.loginForm = initialState.loginForm;
      state.signupForm = initialState.signupForm;
      state.loginErrors = {};
      state.signupErrors = {};
      state.error = null;
      state.status = 'idle';
    },
    setLoginErrors: (state, action: PayloadAction<AuthState['loginErrors']>) => {
      state.loginErrors = action.payload;
    },
    setSignupErrors: (state, action: PayloadAction<AuthState['signupErrors']>) => {
      state.signupErrors = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch user';
      })
      // Login
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Signup
      .addCase(signup.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
        state.error = null;
      });
  },
});

export const { setCredentials, clearError, updateLoginForm, updateSignupForm, resetForms, setLoginErrors, setSignupErrors } = authSlice.actions;

export default authSlice.reducer;
