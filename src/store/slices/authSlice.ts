import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { User, LoginRequest, RegisterRequest } from '@/types/auth';
import Cookies from 'js-cookie';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: LoginRequest, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Login failed');
            }

            return data.user;
        } catch (error) {
            return rejectWithValue('Network error');
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData: RegisterRequest, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Registration failed');
            }

            return data.user;
        } catch (error) {
            return rejectWithValue('Network error');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            Cookies.remove('token');
            return null;
        } catch (error) {
            return rejectWithValue('Logout failed');
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/auth/me');
            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to fetch user');
            }

            return data.user;
        } catch (error) {
            return rejectWithValue('Network error');
        }
    }
);

export const acceptPrivacy = createAsyncThunk(
    'auth/acceptPrivacy',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/auth/privacy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accepted: true }),
            });
            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to accept privacy');
            }

            return data.user;
        } catch (error) {
            return rejectWithValue('Network error');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Register
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Logout
        builder
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = null;
            });

        // Fetch current user
        builder
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
            });

        // Accept privacy
        builder
            .addCase(acceptPrivacy.fulfilled, (state, action) => {
                state.user = action.payload;
            });
    },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
