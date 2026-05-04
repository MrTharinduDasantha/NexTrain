import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { seatApi } from "../../api/seat.api.js";

const MAX_SEATS = 6;

export const holdSeats = createAsyncThunk(
  "seats/hold",
  async (payload, { rejectWithValue }) => {
    try {
      return await seatApi.hold(payload);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const releaseSeats = createAsyncThunk(
  "seats/release",
  async (payload, { rejectWithValue }) => {
    try {
      return await seatApi.release(payload);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

const initialState = {
  /**
   * Each entry: { _id, seatNumber, coachNumber, row, column }
   */
  selected: [],
  hold: {
    expiresAt: null, // ISO string when current hold expires
    active: false,
  },
  status: "idle",
  error: null,
};

const seatSlice = createSlice({
  name: "seats",
  initialState,
  reducers: {
    toggleSeat(state, action) {
      const seat = action.payload; // { _id, seatNumber, coachNumber, row, column }
      const idx = state.selected.findIndex((s) => s._id === seat._id);
      if (idx >= 0) {
        state.selected.splice(idx, 1);
      } else if (state.selected.length < MAX_SEATS) {
        state.selected.push(seat);
      }
    },
    clearSelection(state) {
      state.selected = [];
      state.hold = { expiresAt: null, active: false };
    },
    setHold(state, action) {
      state.hold = { expiresAt: action.payload.expiresAt, active: true };
    },
    clearHold(state) {
      state.hold = { expiresAt: null, active: false };
    },
  },
  extraReducers: (b) => {
    b.addCase(holdSeats.pending, (s) => {
      s.status = "loading";
      s.error = null;
    })
      .addCase(holdSeats.fulfilled, (s, a) => {
        s.status = "success";
        s.hold = { expiresAt: a.payload?.expiresAt, active: true };
      })
      .addCase(holdSeats.rejected, (s, a) => {
        s.status = "error";
        s.error = a.payload || "Failed to hold seats";
      })
      .addCase(releaseSeats.fulfilled, (s) => {
        s.selected = [];
        s.hold = { expiresAt: null, active: false };
        s.status = "idle";
      });
  },
});

export const { toggleSeat, clearSelection, setHold, clearHold } =
  seatSlice.actions;

export const selectSelectedSeats = (s) => s.seats.selected;
export const selectHold = (s) => s.seats.hold;
export const selectIsSeatLimitReached = (s) =>
  s.seats.selected.length >= MAX_SEATS;
export const SEAT_LIMIT = MAX_SEATS;

export default seatSlice.reducer;
