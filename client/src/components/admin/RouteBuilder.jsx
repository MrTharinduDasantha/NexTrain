import { useState, useEffect } from "react";
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
  HiOutlineMapPin,
} from "react-icons/hi2";
import { toast } from "react-toastify";

/**
 * Build a route as an ordered list of stops.
 *
 * Props:
 *   train: Train object
 *   stations: array of all Station objects
 *   initialStops: optional [{ station: id, sequence, arrival, departure, distanceKm }]
 *   onSave: async (stops) => void
 *   submitting: boolean
 */
export default function RouteBuilder({
  train,
  stations = [],
  initialStops = [],
  onSave,
  submitting,
}) {
  const [stops, setStops] = useState([]);
  const [picker, setPicker] = useState("");

  useEffect(() => {
    // Hydrate stops from server payload (station may be populated or just an id)
    setStops(
      initialStops.map((s) => ({
        stationId: s.station?._id || s.station,
        arrival: s.arrival || "",
        departure: s.departure || "",
        distanceKm: s.distanceKm ?? 0,
      })),
    );
  }, [initialStops]);

  const stationsById = Object.fromEntries(stations.map((s) => [s._id, s]));
  const usedIds = new Set(stops.map((s) => s.stationId));
  const available = stations.filter((s) => !usedIds.has(s._id));

  const addStop = () => {
    if (!picker) return;
    const station = stationsById[picker];
    if (!station) return;

    setStops((prev) => [
      ...prev,
      {
        stationId: station._id,
        arrival: "",
        departure: "",
        distanceKm:
          prev.length === 0
            ? 0
            : Number(prev[prev.length - 1].distanceKm || 0) + 10, // Default to 10km more than the last stop
      },
    ]);
    setPicker("");
  };

  const move = (idx, dir) => {
    setStops((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  };

  const remove = (idx) => {
    setStops((prev) => prev.filter((_, i) => i !== idx));
  };

  const update = (idx, field, value) => {
    setStops((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    );
  };

  const save = async () => {
    if (stops.length < 2) return toast.error("A route needs at least 2 stops");
    // Validate distances are non-decreasing — fares depend on it
    for (let i = 1; i < stops.length; i++) {
      if (
        Number(stops[i].distanceKm || 0) < Number(stops[i - 1].distanceKm || 0)
      ) {
        return toast.error(
          `Distance must increase along the route (stop #${i + 1} is less than the previous)`,
        );
      }
    }
    const payload = stops.map((s, i) => ({
      station: s.stationId,
      sequence: i + 1,
      arrival: s.arrival || undefined,
      departure: s.departure || undefined,
      distanceKm: Number(s.distanceKm || 0),
    }));
    await onSave(payload);
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-display font-semibold text-lg">Route stops</h3>
          <p className="text-xs text-text-muted">
            {train ? `${train.number} · ${train.name}` : "Pick a train first"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={picker}
            onChange={(e) => setPicker(e.target.value)}
            className="field-input min-w-50"
          >
            <option value="">Add a station…</option>
            {available.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
          <button type="button" onClick={addStop} className="btn-ghost">
            <HiOutlinePlus className="h-4 w-4" /> Add
          </button>
        </div>
      </header>

      {stops.length === 0 ? (
        <div className="glass p-8 text-center text-sm text-text-muted">
          No stops added yet. Pick a station above to begin building the route.
        </div>
      ) : (
        <ol className="space-y-2">
          {stops.map((s, idx) => {
            const station = stationsById[s.stationId];
            return (
              <li
                key={`${s.stationId}-${idx}`}
                className="glass p-4 grid grid-cols-1 md:grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 items-center"
              >
                {/* Sequence dot */}
                <div className="flex items-center gap-2">
                  <span className="grid place-items-center h-8 w-8 rounded-full bg-linear-to-br from-brand-500 to-accent-500 text-[#02110b] font-bold text-sm">
                    {idx + 1}
                  </span>
                </div>

                {/* Station */}
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <HiOutlineMapPin className="h-4 w-4 text-(--color-brand-400)" />
                    {station?.name || "—"}
                    <span className="chip chip-brand font-mono">
                      {station?.code}
                    </span>
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {station?.city}
                  </div>
                </div>

                {/* Times */}
                <div className="grid grid-cols-2 gap-2 md:gap-3 md:w-55">
                  <div>
                    <label className="field-label mb-1!">Arrival</label>
                    <input
                      type="time"
                      value={s.arrival}
                      onChange={(e) => update(idx, "arrival", e.target.value)}
                      className="field-input py-1.5! px-0.5! font-mono"
                    />
                  </div>
                  <div>
                    <label className="field-label mb-1!">Departure</label>
                    <input
                      type="time"
                      value={s.departure}
                      onChange={(e) => update(idx, "departure", e.target.value)}
                      className="field-input py-1.5! px-0.5! font-mono"
                    />
                  </div>
                </div>

                {/* Distance */}
                <div className="md:w-27.5">
                  <label className="field-label mb-1!">Dist. (km)</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={s.distanceKm}
                    onChange={(e) => update(idx, "distanceKm", e.target.value)}
                    className="field-input py-1.5! font-mono"
                  />
                </div>

                {/* Reorder */}
                <div className="flex items-center gap-1">
                  <IconBtn
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    title="Move up"
                  >
                    <HiOutlineArrowUp className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn
                    onClick={() => move(idx, 1)}
                    disabled={idx === stops.length - 1}
                    title="Move down"
                  >
                    <HiOutlineArrowDown className="h-4 w-4" />
                  </IconBtn>
                </div>

                {/* Remove */}
                <button
                  onClick={() => remove(idx)}
                  className="p-2 rounded-md text-rose-300 hover:bg-rose-500/10"
                  title="Remove stop"
                >
                  <HiOutlineTrash className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <div className="flex items-center justify-end pt-2">
        <button
          onClick={save}
          disabled={submitting || stops.length < 2}
          className="btn-primary"
        >
          {submitting ? "Saving…" : "Save route"}
        </button>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, disabled, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-overlay disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
