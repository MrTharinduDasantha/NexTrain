import { useEffect, useState } from "react";
import {
  HiOutlineUsers,
  HiOutlineCalendarDays,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import PassengerListTable from "../../components/admin/PassengerListTable.jsx";
import { trainApi } from "../../api/train.api.js";
import { adminApi } from "../../api/admin.api.js";

export default function PassengerListPage() {
  const [trains, setTrains] = useState([]);
  const [trainId, setTrainId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    trainApi.list().then((d) => setTrains(d?.trains || []));
  }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!trainId) return toast.warn("Pick a train");
    if (!date) return toast.warn("Pick a journey date");
    setLoading(true);
    setSearched(true);
    try {
      const data = await adminApi.passengers({
        trainId,
        date: new Date(date).toISOString(),
      });
      setPassengers(data?.passengers || []);
    } finally {
      setLoading(false);
    }
  };

  const selectedTrain = trains.find((t) => t._id === trainId);

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-brand-500/15 grid place-items-center text-brand-300">
          <HiOutlineUsers className="h-5 w-5" />
        </div>
        <div>
          <h1 className="section-title">Passenger list</h1>
          <p className="mt-1 text-sm text-text-secondary">
            View the manifest for a given train on a specific journey date.
          </p>
        </div>
      </header>

      <form
        onSubmit={handleSearch}
        className="glass p-4 sm:p-5 grid sm:grid-cols-[2fr_1fr_auto] gap-3"
      >
        <div>
          <label className="field-label">Train</label>
          <select
            value={trainId}
            onChange={(e) => setTrainId(e.target.value)}
            className="field-input"
          >
            <option value="">Select a train…</option>
            {trains.map((t) => (
              <option key={t._id} value={t._id}>
                {t.number} · {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">
            <HiOutlineCalendarDays className="inline h-4 w-4 mr-1 -mt-0.5" />
            Journey date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="field-input"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            <HiOutlineMagnifyingGlass className="h-4 w-4" />
            {loading ? "Loading…" : "Show manifest"}
          </button>
        </div>
      </form>

      {searched && (
        <PassengerListTable
          passengers={passengers}
          train={selectedTrain}
          journeyDate={date}
          loading={loading}
        />
      )}
    </div>
  );
}
