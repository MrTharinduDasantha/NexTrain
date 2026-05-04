import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { bookingApi } from "../../api/booking.api.js";
import { paymentApi } from "../../api/payment.api.js";

export const initiateBooking = createAsyncThunk(
  "booking/initiate",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await bookingApi.initiate(payload);
      return data?.booking;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const startCheckout = createAsyncThunk(
  "booking/checkout",
  async (bookingId, { rejectWithValue }) => {
    try {
      return await paymentApi.createCheckoutSession(bookingId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const verifyPayment = createAsyncThunk(
  "booking/verify",
  async (sessionId, { rejectWithValue }) => {
    try {
      const data = await paymentApi.verify(sessionId);
      return data?.booking;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const fetchMyBookings = createAsyncThunk(
  "booking/mine",
  async (_, { rejectWithValue }) => {
    try {
      const data = await bookingApi.myBookings();
      return data?.bookings || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

const initialState = {
  current: null, // booking object during the flow
  list: [], // user's booking history
  status: "idle",
  error: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setCurrent(state, action) {
      state.current = action.payload;
    },
    clearCurrent(state) {
      state.current = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(initiateBooking.pending, (s) => {
      s.status = "loading";
      s.error = null;
    })
      .addCase(initiateBooking.fulfilled, (s, a) => {
        s.current = a.payload;
        s.status = "success";
      })
      .addCase(initiateBooking.rejected, (s, a) => {
        s.status = "error";
        s.error = a.payload || "Could not create booking";
      })

      .addCase(verifyPayment.fulfilled, (s, a) => {
        s.current = a.payload;
      })

      .addCase(fetchMyBookings.fulfilled, (s, a) => {
        s.list = a.payload;
      });
  },
});

export const { setCurrent, clearCurrent } = bookingSlice.actions;

export const selectCurrentBooking = (s) => s.booking.current;
export const selectMyBookings = (s) => s.booking.list;
export const selectBookingStatus = (s) => s.booking.status;

export default bookingSlice.reducer;
