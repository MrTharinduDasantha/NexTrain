import { createSlice } from "@reduxjs/toolkit";

/**
 * Each passenger is keyed to a specific seatNumber so the order
 * matches the user's seat selection. Reset whenever seats change.
 */
const initialState = {
  /** Array of { seatNumber, name, age, gender } */
  passengers: [],
};

const passengerSlice = createSlice({
  name: "passengers",
  initialState,
  reducers: {
    /**
     * Initialise passenger rows from the currently selected seats.
     * payload: array of { seatNumber }
     */
    initFromSeats(state, action) {
      const seats = action.payload || [];
      // Preserve existing entries when seats overlap
      state.passengers = seats.map((s) => {
        const existing = state.passengers.find(
          (p) => p.seatNumber === s.seatNumber,
        );
        return (
          existing || {
            seatNumber: s.seatNumber,
            name: "",
            age: "",
            gender: "",
          }
        );
      });
    },

    updatePassenger(state, action) {
      const { seatNumber, field, value } = action.payload;
      const p = state.passengers.find((x) => x.seatNumber === seatNumber);
      if (p) p[field] = value;
    },

    setAllPassengers(state, action) {
      state.passengers = action.payload;
    },

    clearPassengers(state) {
      state.passengers = [];
    },
  },
});

export const {
  initFromSeats,
  updatePassenger,
  setAllPassengers,
  clearPassengers,
} = passengerSlice.actions;

export const selectPassengers = (s) => s.passengers.passengers;

/** True only when every passenger row is filled out */
export const selectPassengersValid = (s) =>
  s.passengers.passengers.length > 0 &&
  s.passengers.passengers.every(
    (p) =>
      typeof p.name === "string" &&
      p.name.trim().length >= 2 &&
      Number(p.age) > 0 &&
      Number(p.age) < 120 &&
      ["male", "female", "other"].includes(p.gender),
  );

export default passengerSlice.reducer;
