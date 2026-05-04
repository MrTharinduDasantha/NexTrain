import {
  HiOutlineCurrencyDollar,
  HiOutlineReceiptPercent,
  HiOutlineTicket,
} from "react-icons/hi2";

/**
 * Fare breakdown card.
 *
 * Props:
 *  fare: { baseFare, reservationCharge, gst, total }
 *  seatCount: number (optional — for "× N seats" hint)
 *  trainName, className: string (optional contextual labels)
 */
export default function FareSummary({ fare, seatCount, trainName, className }) {
  if (!fare) return null;
  const lines = [
    {
      label: "Base fare",
      value: fare.baseFare,
      icon: HiOutlineCurrencyDollar,
      hint: seatCount
        ? `× ${seatCount} seat${seatCount === 1 ? "" : "s"}`
        : null,
    },
    {
      label: "Reservation charge",
      value: fare.reservationCharge,
      icon: HiOutlineTicket,
    },
    { label: "GST", value: fare.gst, icon: HiOutlineReceiptPercent },
  ];

  return (
    <div className="glass p-5 sm:p-6 sticky top-20 animate-slide-up">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display font-semibold text-lg">Fare summary</h3>
        <span className="chip chip-brand">LKR</span>
      </div>
      {(trainName || className) && (
        <div className="text-xs text-text-muted mb-4">
          {trainName} {className && <>· {className}</>}
        </div>
      )}

      <ul className="divide-y divide-border-subtle">
        {lines.map((l) => (
          <li key={l.label} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2.5 text-sm text-text-secondary">
              <l.icon className="h-4 w-4 text-(--color-brand-400)" />
              <span>{l.label}</span>
              {l.hint && <span className="text-text-muted">{l.hint}</span>}
            </div>
            <div className="font-mono text-sm">
              {Number(l.value || 0).toFixed(2)}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-4 border-t border-border-subtle">
        <div className="flex items-baseline justify-between">
          <span className="text-sm uppercase tracking-wider text-text-muted">
            Total
          </span>
          <div className="text-right">
            <div className="font-display font-bold text-3xl gradient-text leading-none">
              {Number(fare.total || 0).toFixed(2)}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-text-muted mt-1">
              LKR · all taxes incl.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
