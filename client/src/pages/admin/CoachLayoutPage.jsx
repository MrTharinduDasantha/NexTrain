import { useEffect, useState } from "react";
import {
  HiOutlineTrash,
  HiOutlineCog6Tooth,
  HiOutlineNoSymbol,
  HiOutlineCheck,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import CoachLayoutEditor from "../../components/admin/CoachLayoutEditor.jsx";
import Loader from "../../components/common/Loader.jsx";
import Modal from "../../components/common/Modal.jsx";
import { trainApi } from "../../api/train.api.js";
import { classApi } from "../../api/class.api.js";
import { seatApi } from "../../api/seat.api.js";

export default function CoachLayoutPage() {
  const [trains, setTrains] = useState([]);
  const [classes, setClasses] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [filter, setFilter] = useState({ train: "", trainClass: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const reload = async () => {
    setLoading(true);
    try {
      const [t, c, co] = await Promise.all([
        trainApi.list(),
        classApi.list(),
        seatApi.listCoaches(filter),
      ]);
      setTrains(t?.trains || []);
      setClasses(c?.classes || []);
      setCoaches(co?.coaches || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const reloadCoaches = async () => {
    const params = {};
    if (filter.train) params.train = filter.train;
    if (filter.trainClass) params.trainClass = filter.trainClass;
    const co = await seatApi.listCoaches(params);
    setCoaches(co?.coaches || []);
  };

  const handleCreate = async (values) => {
    setSubmitting(true);
    try {
      await seatApi.createCoach(values);
      toast.success(`Coach ${values.coachNumber} created`);
      reloadCoaches();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await seatApi.removeCoach(deleteTarget._id);
      toast.success("Coach deleted");
      setDeleteTarget(null);
      reloadCoaches();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="section-title">Coach Layout</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Define coach grids per train + class. Seats are auto-generated from
          the layout.
        </p>
      </header>

      {loading ? (
        <div className="glass p-12 grid place-items-center">
          <Loader size="md" />
        </div>
      ) : (
        <>
          <CoachLayoutEditor
            trains={trains}
            classes={classes}
            onSubmit={handleCreate}
            submitting={submitting}
          />

          {/* Existing coaches */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <HiOutlineCog6Tooth className="h-5 w-5 text-(--color-brand-400)" />
                Existing coaches
              </h2>
              <div className="flex items-center gap-2">
                <select
                  value={filter.train}
                  onChange={(e) =>
                    setFilter((f) => ({ ...f, train: e.target.value }))
                  }
                  className="field-input w-48 py-1.5! text-xs!"
                >
                  <option value="">All trains</option>
                  {trains.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.number} · {t.name}
                    </option>
                  ))}
                </select>
                <select
                  value={filter.trainClass}
                  onChange={(e) =>
                    setFilter((f) => ({ ...f, trainClass: e.target.value }))
                  }
                  className="field-input py-1.5! text-xs!"
                >
                  <option value="">All classes</option>
                  {/* Only show reserved classes since coaches can only be created for those */}
                  {classes
                    .filter((c) => c.isReserved !== false)
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.code}
                      </option>
                    ))}
                </select>
                <button
                  onClick={reloadCoaches}
                  className="btn-ghost py-1.5! text-xs!"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="glass overflow-hidden">
              {coaches.length === 0 ? (
                <div className="p-12 text-center text-sm text-text-muted">
                  No coaches yet — create one above.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-[10px] uppercase tracking-wider text-text-muted bg-bg-base/40">
                        <th className="px-5 py-3 font-medium">Coach</th>
                        <th className="px-5 py-3 font-medium">Class</th>
                        <th className="px-5 py-3 font-medium">Layout</th>
                        <th className="px-5 py-3 font-medium">Seats</th>
                        <th className="px-5 py-3 font-medium text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {coaches.map((c) => (
                        <tr key={c._id} className="hover:bg-bg-base/30">
                          <td className="px-5 py-3 font-mono font-semibold text-brand-300">
                            {c.coachNumber}
                          </td>
                          <td className="px-5 py-3">
                            <span className="chip chip-brand font-mono">
                              {c.trainClass?.code}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs text-text-secondary">
                            {c.rows} × {c.columns} ·{" "}
                            {c.seatNumberingPattern === "SEQ"
                              ? "Sequential"
                              : "Row+Letter"}
                            {c.aisleAfterColumn
                              ? ` · aisle after col ${c.aisleAfterColumn}`
                              : ""}
                          </td>
                          <td className="px-5 py-3 font-mono">
                            {c.rows * c.columns}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button
                              onClick={() => setDeleteTarget(c)}
                              className="p-2 rounded-md text-text-secondary hover:text-rose-300 hover:bg-rose-500/10"
                              title="Delete coach"
                            >
                              <HiOutlineTrash className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p className="text-xs text-text-muted flex items-center gap-2 mt-2">
              <HiOutlineNoSymbol className="h-4 w-4" />
              Seat-level blocking (e.g. for maintenance) can be done from the
              seat map when viewing a specific schedule.
            </p>
          </section>
        </>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => !submitting && setDeleteTarget(null)}
        title="Delete coach"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={submitting}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="btn-danger"
            >
              {submitting ? "Deleting…" : "Delete"}
            </button>
          </>
        }
      >
        <p className="text-sm">
          Delete coach{" "}
          <span className="font-mono font-semibold">
            {deleteTarget?.coachNumber}
          </span>
          ? All seats in this coach will also be deleted. Existing bookings will
          retain their seat snapshots.
        </p>
      </Modal>
    </div>
  );
}
