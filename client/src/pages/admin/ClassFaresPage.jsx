import { useEffect, useState } from "react";
import {
  HiOutlineSparkles,
  HiOutlineArrowPath,
  HiOutlineCheck,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import FareEditor from "../../components/admin/FareEditor.jsx";
import Loader from "../../components/common/Loader.jsx";
import { classApi } from "../../api/class.api.js";
import { trainApi } from "../../api/train.api.js";

export default function ClassFaresPage() {
  const [classes, setClasses] = useState([]);
  const [trains, setTrains] = useState([]);
  const [selectedTrainId, setSelectedTrainId] = useState("");
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const [c, t] = await Promise.all([classApi.list(), trainApi.list()]);
      setClasses(c?.classes || []);
      setTrains(t?.trains || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await classApi.seed();
      toast.success("Default classes seeded");
      reload();
    } catch {
    } finally {
      setSeeding(false);
    }
  };

  const selectedTrain = trains.find((t) => t._id === selectedTrainId);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="section-title">Classes & Fares</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Maintain the catalog of train classes and set per-train base fares +
            per-km rates.
          </p>
        </div>
        <button onClick={handleSeed} disabled={seeding} className="btn-ghost">
          <HiOutlineArrowPath
            className={seeding ? "h-4 w-4 animate-spin" : "h-4 w-4"}
          />
          {seeding
            ? "Seeding…"
            : classes.length === 0
              ? "Seed default classes"
              : "Re-seed defaults"}
        </button>
      </header>

      {loading ? (
        <div className="glass p-12 grid place-items-center">
          <Loader size="md" />
        </div>
      ) : (
        <>
          {/* Classes catalog */}
          <section>
            <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
              <HiOutlineSparkles className="h-5 w-5 text-(--color-brand-400)" />
              Class catalog
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {classes.length === 0 ? (
                <div className="glass p-8 col-span-full text-center text-sm text-text-muted">
                  No classes seeded yet. Click "Seed default classes" to load
                  the six standard NexTrain classes.
                </div>
              ) : (
                classes.map((c) => (
                  <div key={c._id} className="glass p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="chip chip-brand font-mono">
                        {c.code}
                      </span>
                      {c.isReserved ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
                          <HiOutlineCheck className="h-3.5 w-3.5" />
                          Reserved
                        </span>
                      ) : (
                        <span className="chip">Unreserved</span>
                      )}
                    </div>
                    <div className="font-medium">{c.name}</div>
                    {c.description && (
                      <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                        {c.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Fare editor */}
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-lg">
              Fares per train
            </h2>
            <div className="glass p-4">
              <label className="field-label">Train</label>
              <select
                value={selectedTrainId}
                onChange={(e) => setSelectedTrainId(e.target.value)}
                className="field-input"
              >
                <option value="">Select a train to manage fares…</option>
                {trains.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.number} · {t.name}
                  </option>
                ))}
              </select>
            </div>

            <FareEditor train={selectedTrain} classes={classes} />
          </section>
        </>
      )}
    </div>
  );
}
