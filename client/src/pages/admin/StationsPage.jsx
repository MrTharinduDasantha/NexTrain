import { useEffect, useState, useMemo } from "react";
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineMapPin,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import Modal from "../../components/common/Modal.jsx";
import StationForm from "../../components/admin/StationForm.jsx";
import Loader from "../../components/common/Loader.jsx";
import { stationApi } from "../../api/station.api.js";

const PAGE_SIZE = 6;

export default function StationsPage() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // Station object or 'new'
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await stationApi.list();
      setStations(data?.stations || []);
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
    if (!q) return stations;
    return stations.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q),
    );
  }, [query, stations]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleSave = async (values) => {
    setSubmitting(true);
    try {
      if (editing && editing._id) {
        await stationApi.update(editing._id, values);
        toast.success("Station updated");
      } else {
        await stationApi.create(values);
        toast.success("Station created");
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
      await stationApi.remove(deleteTarget._id);
      toast.success("Station deleted");
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
          <h1 className="section-title">Stations</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage all railway stations served by NexTrain.
          </p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary">
          <HiOutlinePlus className="h-4 w-4" />
          Add station
        </button>
      </header>

      {/* Search */}
      <div className="glass p-3 flex items-center gap-2">
        <HiOutlineMagnifyingGlass className="h-5 w-5 text-text-muted ml-1" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, code, or city…"
          className="flex-1 bg-transparent outline-none text-sm"
        />
        <span className="chip">{filtered.length}</span>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        {loading ? (
          <div className="p-12 grid place-items-center">
            <Loader size="md" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-text-muted">
            No stations match.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-text-muted bg-bg-base/40">
                  <th className="px-5 py-3 font-medium">Code</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">City</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {paginated.map((s) => (
                  <tr key={s._id} className="hover:bg-bg-base/30">
                    <td className="px-5 py-3">
                      <span className="chip chip-brand font-mono">
                        {s.code}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium">
                      <span className="inline-flex items-center gap-2">
                        <HiOutlineMapPin className="h-4 w-4 text-(--color-brand-400)" />
                        {s.name}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-text-secondary">{s.city}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setEditing(s)}
                          className="p-2 rounded-md text-text-secondary hover:text-(--color-brand-400) hover:bg-bg-overlay"
                          title="Edit"
                        >
                          <HiOutlinePencilSquare className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
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

      {/* Edit / Create modal */}
      <Modal
        open={!!editing}
        onClose={() => !submitting && setEditing(null)}
        title={editing && editing._id ? "Edit station" : "Add station"}
        size="md"
      >
        {editing && (
          <StationForm
            initial={editing._id ? editing : null}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
            submitting={submitting}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => !submitting && setDeleteTarget(null)}
        title="Delete station"
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
          Are you sure you want to delete{" "}
          <span className="font-semibold">{deleteTarget?.name}</span> (
          {deleteTarget?.code})? This may break routes that include this
          station.
        </p>
      </Modal>
    </div>
  );
}
