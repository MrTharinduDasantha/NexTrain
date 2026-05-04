import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { trainApi } from "../../api/train.api.js";

export const searchTrains = createAsyncThunk(
  "trains/search",
  async (criteria, { rejectWithValue }) => {
    try {
      const data = await trainApi.search(criteria);
      return { criteria, results: data?.trains || [] };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

const initialState = {
  search: {
    from: null, // station id
    to: null,
    date: null, // ISO string
  },
  results: [],
  status: "idle", // 'idle' | 'loading' | 'success' | 'error'
  error: null,
  filters: {
    classCode: null, // 'FCO' | 'FAC' | ...
    sortBy: "departure", // 'departure' | 'arrival' | 'duration' | 'fare'
    sortDir: "asc",
    onlyAvailable: false,
  },
  // Selection for the booking flow:
  selectedTrain: null, // chosen train object from results
  selectedClass: null, // chosen class object from train.classes
};

const trainSlice = createSlice({
  name: "trains",
  initialState,
  reducers: {
    setSearchCriteria(state, action) {
      state.search = { ...state.search, ...action.payload };
    },
    setFilter(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    selectTrainAndClass(state, action) {
      state.selectedTrain = action.payload.train;
      state.selectedClass = action.payload.cls;
    },
    clearTrainSelection(state) {
      state.selectedTrain = null;
      state.selectedClass = null;
    },
    clearResults(state) {
      state.results = [];
      state.status = "idle";
    },
  },
  extraReducers: (b) => {
    b.addCase(searchTrains.pending, (s) => {
      s.status = "loading";
      s.error = null;
    })
      .addCase(searchTrains.fulfilled, (s, a) => {
        s.search = { ...s.search, ...a.payload.criteria };
        s.results = a.payload.results;
        s.status = "success";
      })
      .addCase(searchTrains.rejected, (s, a) => {
        s.status = "error";
        s.error = a.payload || "Search failed";
        s.results = [];
      });
  },
});

export const {
  setSearchCriteria,
  setFilter,
  selectTrainAndClass,
  clearTrainSelection,
  clearResults,
} = trainSlice.actions;

/* ---------- Selectors ---------- */
export const selectSearchCriteria = (s) => s.trains.search;
export const selectFilters = (s) => s.trains.filters;
export const selectAllTrains = (s) => s.trains.results;
export const selectSelectedTrain = (s) => s.trains.selectedTrain;
export const selectSelectedClass = (s) => s.trains.selectedClass;
export const selectTrainStatus = (s) => s.trains.status;

// Memoized Filtered + sorted results
export const selectFilteredTrains = createSelector(
  [selectAllTrains, selectFilters],
  (results, filters) => {
    // Only runs if 'results' or 'filters' actually change
    let out = [...results];

    if (filters.classCode) {
      out = out.filter((t) =>
        t.classes?.some((c) => c.code === filters.classCode),
      );
    }

    if (filters.onlyAvailable) {
      out = out.filter((t) =>
        t.classes?.some(
          (c) => !c.isReserved || (c.available != null && c.available > 0),
        ),
      );
    }

    const dir = filters.sortDir === "asc" ? 1 : -1;
    out.sort((a, b) => {
      switch (filters.sortBy) {
        case "arrival":
          return (a.arrival || "").localeCompare(b.arrival || "") * dir;
        case "duration":
          return ((a.durationMinutes ?? 0) - (b.durationMinutes ?? 0)) * dir;
        case "fare": {
          const fa = Math.min(
            ...(a.classes || []).map((c) => c.fare ?? Infinity),
          );
          const fb = Math.min(
            ...(b.classes || []).map((c) => c.fare ?? Infinity),
          );
          return (fa - fb) * dir;
        }
        case "departure":
        default:
          return (a.departure || "").localeCompare(b.departure || "") * dir;
      }
    });

    return out;
  },
);

export default trainSlice.reducer;
