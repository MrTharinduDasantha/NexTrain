import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./features/authSlice.js";
import trainReducer from "./features/trainSlice.js";
import seatReducer from "./features/seatSlice.js";
import bookingReducer from "./features/bookingSlice.js";
import passengerReducer from "./features/passengerSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    trains: trainReducer,
    seats: seatReducer,
    booking: bookingReducer,
    passengers: passengerReducer,
  },
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        // Allow Date objects in our search/booking flows
        ignoredActionPaths: ["payload.date", "meta.arg.date"],
        ignoredPaths: ["trains.search.date", "booking.current.journeyDate"],
      },
    }),
});
