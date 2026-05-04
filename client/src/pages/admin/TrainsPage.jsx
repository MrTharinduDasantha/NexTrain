import { useEffect, useState, useMemo } from "react";
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import Modal from "../../components/common/Modal.jsx";
import TrainForm from "../../components/admin/TrainForm.jsx";
import Loader from "../../components/common/Loader.jsx";
import { trainApi } from "../../api/train.api.js";

const PAGE_SIZE = 6;

export default function TrainsPage() {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await trainApi.list();
      setTrains(data?.trains || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  // Reset to page 1 whenever the search query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return trains;
    return trains.filter(
      (t) =>
        t.name.toLowerCase().includes(q) || t.number.toLowerCase().includes(q),
    );
  }, [query, trains]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleSave = async (values) => {
    setSubmitting(true);
    try {
      if (editing && editing._id) {
        await trainApi.update(editing._id, values);
        toast.success("Train updated");
      } else {
        await trainApi.create(values);
        toast.success("Train created");
      }
      setEditing(null);
      reload();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await trainApi.remove(deleteTarget._id);
      toast.success("Train deleted");
      setDeleteTarget(null);
      reload();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="section-title">Trains</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Define which trains are running on the NexTrain network.
          </p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary">
          <HiOutlinePlus className="h-4 w-4" />
          Add train
        </button>
      </header>

      <div className="glass p-3 flex items-center gap-2">
        <HiOutlineMagnifyingGlass className="h-5 w-5 text-text-muted ml-1" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by number or name…"
          className="flex-1 bg-transparent outline-none text-sm"
        />
        <span className="chip">{filtered.length}</span>
      </div>

      <div className="glass overflow-hidden">
        {loading ? (
          <div className="p-12 grid place-items-center">
            <Loader size="md" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-text-muted">
            No trains match.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-text-muted bg-bg-base/40">
                  <th className="px-5 py-3 font-medium w-32">Number</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Days of operation</th>
                  <th className="px-5 py-3 font-medium w-28">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {paginated.map((t) => (
                  <tr key={t._id} className="hover:bg-bg-base/30">
                    <td className="px-5 py-3">
                      <span className="chip chip-brand font-mono">
                        {t.number}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium">{t.name}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(t.daysOfOperation || []).map((d) => (
                          <span
                            key={d}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-overlay text-text-secondary"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {t.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setEditing(t)}
                          className="p-2 rounded-md text-text-secondary hover:text-(--color-brand-400) hover:bg-bg-overlay"
                          title="Edit"
                        >
                          <HiOutlinePencilSquare className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
                          className="p-2 rounded-md text-text-secondary hover:text-rose-300 hover:bg-rose-500/10"
                          title="Delete"
                        >
                          <HiOutlineTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination — only shown when there is more than one page */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border-subtle">
                <p className="text-xs text-text-muted">
                  Page{" "}
                  <span className="text-text-secondary font-medium">
                    {page}
                  </span>{" "}
                  of{" "}
                  <span className="text-text-secondary font-medium">
                    {totalPages}
                  </span>
                </p>

                <div className="inline-flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-ghost p-2 disabled:opacity-30"
                    title="Previous page"
                  >
                    <HiOutlineChevronLeft className="h-4 w-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={
                          n === page
                            ? "chip chip-brand min-w-8 justify-center"
                            : "btn-ghost min-w-8 justify-center text-xs"
                        }
                      >
                        {n}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-ghost p-2 disabled:opacity-30"
                    title="Next page"
                  >
                    <HiOutlineChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        open={!!editing}
        onClose={() => !submitting && setEditing(null)}
        title={editing && editing._id ? "Edit train" : "Add train"}
        size="md"
      >
        {editing && (
          <TrainForm
            initial={editing._id ? editing : null}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
            submitting={submitting}
          />
        )}
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => !submitting && setDeleteTarget(null)}
        title="Delete train"
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
          Delete <span className="font-semibold">{deleteTarget?.number}</span> ·{" "}
          <span className="font-semibold">{deleteTarget?.name}</span>? This will
          not delete existing bookings, but the train will disappear from search
          results.
        </p>
      </Modal>
    </div>
  );
}
