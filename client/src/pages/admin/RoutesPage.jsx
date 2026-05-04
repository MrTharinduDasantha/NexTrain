import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import RouteBuilder from "../../components/admin/RouteBuilder.jsx";
import Loader from "../../components/common/Loader.jsx";
import { trainApi } from "../../api/train.api.js";
import { stationApi } from "../../api/station.api.js";

export default function RoutesPage() {
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedTrainId, setSelectedTrainId] = useState("");
  const [routeStops, setRouteStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([trainApi.list(), stationApi.list()])
      .then(([t, s]) => {
        if (cancelled) return;
        setTrains(t?.trains || []);
        setStations(s?.stations || []);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Load route when train changes
  useEffect(() => {
    if (!selectedTrainId) {
      setRouteStops([]);
      return;
    }
    let cancelled = false;
    trainApi.get(selectedTrainId).then((data) => {
      if (cancelled) return;
      setRouteStops(data?.route?.stops || []);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedTrainId]);

  const selectedTrain = trains.find((t) => t._id === selectedTrainId);

  const handleSave = async (stops) => {
    setSubmitting(true);
    try {
      await trainApi.saveRoute({ train: selectedTrainId, stops });
      toast.success("Route saved");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="section-title">Routes</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Build the ordered list of stations served by each train, with arrival,
          departure and distance.
        </p>
      </header>

      {loading ? (
        <div className="glass p-12 grid place-items-center">
          <Loader size="md" />
        </div>
      ) : (
        <>
          <div className="glass p-4 sm:p-5">
            <label className="field-label">Train</label>
            <select
              value={selectedTrainId}
              onChange={(e) => setSelectedTrainId(e.target.value)}
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

          {selectedTrain ? (
            <RouteBuilder
              train={selectedTrain}
              stations={stations}
              initialStops={routeStops}
              onSave={handleSave}
              submitting={submitting}
            />
          ) : (
            <div className="glass p-10 text-center text-sm text-text-muted">
              Pick a train above to build or edit its route.
            </div>
          )}
        </>
      )}
    </div>
  );
}
