import { useState, useEffect } from "react";
import { HiOutlineCheck, HiOutlinePencilSquare } from "react-icons/hi2";
import { toast } from "react-toastify";
import { fareApi } from "../../api/fare.api.js";

/**
 * Edit fares for a single train, one row per class.
 *
 * Props:
 *   train:    { _id, number, name }
 *   classes:  [{ _id, code, name, isReserved }]
 *   onSaved:  () => void   (called after a successful upsert)
 */
export default function FareEditor({ train, classes = [], onSaved }) {
  const [rows, setRows] = useState([]);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (!train) return;
    let cancelled = false;
    fareApi.list({ train: train._id }).then((data) => {
      if (cancelled) return;
      const map = new Map(
        (data?.fares || []).map((f) => [
          String(f.trainClass?._id || f.trainClass),
          f,
        ]),
      );
      setRows(
        classes.map((c) => {
          const existing = map.get(String(c._id));
          return {
            classId: c._id,
            code: c.code,
            name: c.name,
            isReserved: c.isReserved,
            fareId: existing?._id || null,
            baseFare: existing?.baseFare ?? "",
            perKmRate: existing?.perKmRate ?? "",
            dirty: false,
          };
        }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [train, classes]);

  const update = (classId, field, value) => {
    setRows((prev) =>
      prev.map((r) =>
        r.classId === classId ? { ...r, [field]: value, dirty: true } : r,
      ),
    );
  };

  const saveRow = async (row) => {
    if (!train) return;
    if (row.baseFare === "" || Number.isNaN(Number(row.baseFare))) {
      return toast.error("Base fare is required");
    }
    setSavingId(row.classId);
    try {
      await fareApi.upsert({
        train: train._id,
        trainClass: row.classId,
        baseFare: Number(row.baseFare),
        perKmRate: Number(row.perKmRate || 0),
      });
      setRows((prev) =>
        prev.map((r) =>
          r.classId === row.classId ? { ...r, dirty: false } : r,
        ),
      );
      toast.success(`${row.code} fare saved`);
      onSaved && onSaved();
    } finally {
      setSavingId(null);
    }
  };

  if (!train) {
    return (
      <div className="glass p-8 text-center text-sm text-text-muted">
        Pick a train to manage fares per class.
      </div>
    );
  }

  return (
    <div className="glass overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-2">
        <HiOutlinePencilSquare className="h-5 w-5 text-(--color-brand-400)" />
        <div>
          <h3 className="font-display font-semibold">
            {train.number} · {train.name}
          </h3>
          <p className="text-xs text-text-muted">
            Base fare applies per seat. Per-km rate is added based on segment
            distance.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-text-muted bg-bg-base/40">
              <th className="px-5 py-3 font-medium">Class</th>
              <th className="px-5 py-3 font-medium w-44">Base fare (LKR)</th>
              <th className="px-5 py-3 font-medium w-44">Per-km rate (LKR)</th>
              <th className="px-5 py-3 font-medium w-32 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {rows.map((row) => (
              <tr key={row.classId} className="hover:bg-bg-base/30">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="chip chip-brand font-mono">
                      {row.code}
                    </span>
                    <span className="font-medium">{row.name}</span>
                    {!row.isReserved && (
                      <span className="chip">Unreserved</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={row.baseFare}
                    onChange={(e) =>
                      update(row.classId, "baseFare", e.target.value)
                    }
                    placeholder="—"
                    className="field-input py-1.5! font-mono"
                  />
                </td>
                <td className="px-5 py-3">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={row.perKmRate}
                    onChange={(e) =>
                      update(row.classId, "perKmRate", e.target.value)
                    }
                    placeholder="0"
                    className="field-input py-1.5! font-mono"
                  />
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => saveRow(row)}
                    disabled={!row.dirty || savingId === row.classId}
                    className="btn-primary py-1.5! px-3! text-xs"
                  >
                    <HiOutlineCheck className="h-4 w-4" />
                    {savingId === row.classId
                      ? "Saving…"
                      : row.fareId
                        ? "Update"
                        : "Save"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
