import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../api/auth.api.js";

const TOKEN_KEY = "nextrain_token";

/* ---------- Thunks ---------- */
export const login = createAsyncThunk(
  "auth/login",
  async (creds, { rejectWithValue }) => {
    try {
      const data = await authApi.login(creds);
      if (data?.token) localStorage.setItem(TOKEN_KEY, data.token);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const adminLogin = createAsyncThunk(
  "auth/adminLogin",
  async (creds, { rejectWithValue }) => {
    try {
      const data = await authApi.adminLogin(creds);
      if (data?.token) localStorage.setItem(TOKEN_KEY, data.token);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await authApi.register(formData);
      if (data?.token) localStorage.setItem(TOKEN_KEY, data.token);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await authApi.logout();
  localStorage.removeItem(TOKEN_KEY);
  return null;
});

export const fetchCurrentUser = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authApi.me();
      return data?.user || null;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

/* ---------- Slice ---------- */
const initialState = {
  user: null,
  status: "idle", // 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'
  initialised: false, // becomes true after first fetchCurrentUser settles
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    forceLogout(state) {
      state.user = null;
      state.status = "unauthenticated";
      localStorage.removeItem(TOKEN_KEY);
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchCurrentUser.pending, (s) => {
      if (!s.initialised) s.status = "loading";
    })
      .addCase(fetchCurrentUser.fulfilled, (s, a) => {
        s.user = a.payload;
        s.status = a.payload ? "authenticated" : "unauthenticated";
        s.initialised = true;
      })
      .addCase(fetchCurrentUser.rejected, (s) => {
        s.user = null;
        s.status = "unauthenticated";
        s.initialised = true;
      })

      .addCase(login.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.user = a.payload?.user;
        s.status = "authenticated";
      })
      .addCase(login.rejected, (s, a) => {
        s.status = "error";
        s.error = a.payload || "Login failed";
      })

      .addCase(adminLogin.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(adminLogin.fulfilled, (s, a) => {
        s.user = a.payload?.user;
        s.status = "authenticated";
      })
      .addCase(adminLogin.rejected, (s, a) => {
        s.status = "error";
        s.error = a.payload || "Admin login failed";
      })

      .addCase(register.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(register.fulfilled, (s, a) => {
        s.user = a.payload?.user;
        s.status = "authenticated";
      })
      .addCase(register.rejected, (s, a) => {
        s.status = "error";
        s.error = a.payload || "Registration failed";
      })

      .addCase(logout.fulfilled, (s) => {
        s.user = null;
        s.status = "unauthenticated";
      });
  },
});

export const { clearAuthError, forceLogout } = authSlice.actions;

/* ---------- Selectors ---------- */
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => !!state.auth.user;
export const selectIsAdmin = (state) => state.auth.user?.role === "admin";

export default authSlice.reducer;
