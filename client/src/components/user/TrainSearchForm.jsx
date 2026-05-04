import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import DatePicker from "react-datepicker";
import {
  HiOutlineMapPin,
  HiOutlineCalendarDays,
  HiOutlineMagnifyingGlass,
  HiArrowsRightLeft,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { stationApi } from "../../api/station.api.js";
import {
  searchTrains,
  setSearchCriteria,
} from "../../app/features/trainSlice.js";

/**
 * Hero search form — used on HomePage and TrainSearchPage.
 * Loads stations once, provides a typeable autocomplete for "from" / "to".
 */
export default function TrainSearchForm({ compact = false, onSubmitted }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    stationApi.list().then((data) => {
      if (!cancelled) setStations(data?.stations || []);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!from || !to)
      return toast.error("Please choose origin and destination");
    if (from._id === to._id)
      return toast.error("Origin and destination must differ");
    if (!date) return toast.error("Please pick a journey date");

    setLoading(true);
    try {
      dispatch(
        setSearchCriteria({
          from: from._id,
          to: to._id,
          date: format(date, "yyyy-MM-dd"),
        }),
      );
      await dispatch(
        searchTrains({
          from: from._id,
          to: to._id,
          date: format(date, "yyyy-MM-dd"),
        }),
      ).unwrap();
      navigate("/trains");
      if (onSubmitted) onSubmitted();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={[
        "glass p-4 sm:p-5 grid gap-3 items-end",
        compact
          ? "md:grid-cols-[1fr_auto_1fr_1fr_auto]"
          : "md:grid-cols-[1fr_auto_1fr_1fr_auto]",
      ].join(" ")}
    >
      <StationField
        label="From"
        value={from}
        onChange={setFrom}
        stations={stations}
        excludeId={to?._id}
        placeholder="Origin station"
      />

      <button
        type="button"
        onClick={swap}
        title="Swap origin and destination"
        className="hidden md:grid place-items-center h-11 w-11 mt-6 rounded-full border border-border-strong hover:border-(--color-brand-400) hover:text-(--color-brand-400) transition-colors"
      >
        <HiArrowsRightLeft className="h-4 w-4" />
      </button>

      <StationField
        label="To"
        value={to}
        onChange={setTo}
        stations={stations}
        excludeId={from?._id}
        placeholder="Destination station"
      />

      <div>
        <label className="field-label">
          <HiOutlineCalendarDays className="inline h-4 w-4 mr-1 -mt-0.5" />
          Journey date
        </label>
        <DatePicker
          selected={date}
          onChange={setDate}
          minDate={new Date()}
          dateFormat="EEE, d MMM yyyy"
          className="field-input"
          wrapperClassName="w-full"
          placeholderText="Pick a date"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary h-11 px-5 md:px-6 whitespace-nowrap"
      >
        <HiOutlineMagnifyingGlass className="h-4 w-4" />
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}

/* ---------- Custom autocomplete ---------- */
function StationField({
  label,
  value,
  onChange,
  stations,
  excludeId,
  placeholder,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (value) setQuery(`${value.name} (${value.code})`);
  }, [value]);

  useEffect(() => {
    const click = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = stations.filter((s) => s._id !== excludeId);
    if (!q) return filtered.slice(0, 8);
    return filtered
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.city?.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [stations, query, excludeId]);

  return (
    <div ref={wrapRef} className="relative">
      <label className="field-label">
        <HiOutlineMapPin className="inline h-4 w-4 mr-1 -mt-0.5" />
        {label}
      </label>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange(null);
        }}
        onFocus={() => setOpen(true)}
        className="field-input"
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <ul className="absolute z-30 left-0 right-0 mt-1 max-h-72 overflow-auto glass shadow-xl py-1 animate-slide-up">
          {matches.map((s) => (
            <li key={s._id}>
              <button
                type="button"
                onClick={() => {
                  onChange(s);
                  setQuery(`${s.name} (${s.code})`);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-bg-overlay transition-colors flex items-center justify-between gap-3"
              >
                <span>
                  <span className="font-medium">{s.name}</span>
                  <span className="text-text-muted ml-2">{s.city}</span>
                </span>
                <span className="chip chip-brand">{s.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && matches.length === 0 && stations.length > 0 && (
        <div className="absolute z-30 left-0 right-0 mt-1 glass px-3 py-2 text-sm text-text-muted">
          No stations match "{query}"
        </div>
      )}
    </div>
  );
}
