import {
  HiOutlineCalendarDays,
  HiOutlineMapPin,
  HiOutlineArrowRight,
  HiOutlineUser,
} from "react-icons/hi2";
import { formatDate } from "../../utils/formatDate.js";

/**
 * Full e-ticket view used on TicketDetailsPage and as the preview after payment.
 *
 * Props:
 *  booking — populated booking with train, stations, class, seats, passengers, fare
 *  actions — optional ReactNode rendered in the header (e.g. download button)
 */
export default function ETicketView({ booking, actions }) {
  if (!booking) return null;

  return (
    <div className="relative">
      {/* Premium ticket card with two halves */}
      <div className="glass overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 bg-linear-to-r from-brand-500 via-accent-400 to-(--color-gold-400)" />

        <div className="grid lg:grid-cols-[1fr_auto_280px]">
          {/* Main panel */}
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-text-muted">
                  NexTrain · E-Ticket
                </div>
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <span className="chip chip-brand font-mono">
                    {booking.train?.number}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-display font-bold">
                    {booking.train?.name}
                  </h2>
                </div>
                <div className="mt-1 text-sm text-text-secondary">
                  {booking.trainClass?.name}
                </div>
              </div>
              {actions}
            </div>

            {/* Journey */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center mb-6">
              <Endpoint label="From" station={booking.fromStation} />
              <div className="grid place-items-center">
                <div className="text-2xl rotate-90 sm:rotate-0">
                  <HiOutlineArrowRight className="text-(--color-brand-400)" />
                </div>
              </div>
              <Endpoint label="To" station={booking.toStation} align="right" />
            </div>

            <div className="flex items-center gap-2 text-sm text-text-secondary mb-6">
              <HiOutlineCalendarDays className="h-4 w-4 text-(--color-brand-400)" />
              <span className="font-medium text-text-primary">
                {formatDate(booking.journeyDate)}
              </span>
            </div>

            {/* Passengers */}
            <div>
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                <HiOutlineUser className="h-4 w-4 text-(--color-brand-400)" />
                Passengers ({booking.passengers?.length || 0})
              </h3>

              <div className="overflow-x-auto -mx-2 px-2">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-text-muted">
                      <th className="py-2 pr-4 font-medium">#</th>
                      <th className="py-2 pr-4 font-medium">Name</th>
                      <th className="py-2 pr-4 font-medium">Age</th>
                      <th className="py-2 pr-4 font-medium">Gender</th>
                      <th className="py-2 pr-4 font-medium">Coach</th>
                      <th className="py-2 pr-4 font-medium">Seat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {(booking.passengers || []).map((p, i) => {
                      const seat = (booking.seats || []).find(
                        (s) => s.seatNumber === p.seatNumber,
                      );
                      return (
                        <tr key={`${p.seatNumber}-${i}`}>
                          <td className="py-2 pr-4 text-text-muted">{i + 1}</td>
                          <td className="py-2 pr-4 font-medium">{p.name}</td>
                          <td className="py-2 pr-4">{p.age}</td>
                          <td className="py-2 pr-4 capitalize text-text-secondary">
                            {p.gender}
                          </td>
                          <td className="py-2 pr-4 font-mono">
                            {seat?.coachNumber}
                          </td>
                          <td className="py-2 pr-4 font-mono font-semibold text-brand-300">
                            {p.seatNumber}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fare line */}
            <div className="mt-6 pt-4 border-t border-border-subtle grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <FareLine label="Base" value={booking.fare?.baseFare} />
              <FareLine
                label="Reservation"
                value={booking.fare?.reservationCharge}
              />
              <FareLine label="GST" value={booking.fare?.gst} />
              <FareLine label="Total" value={booking.fare?.total} highlight />
            </div>
          </div>

          {/* Perforation */}
          <div
            className="hidden lg:block w-px relative"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, rgba(255,255,255,0.18) 0 6px, transparent 6px 12px)",
            }}
          >
            <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-bg-base border border-border-subtle" />
            <div className="absolute -left-3 -bottom-3 h-6 w-6 rounded-full bg-bg-base border border-border-subtle" />
          </div>

          {/* Stub — PNR + status */}
          <div className="p-6 sm:p-8 bg-linear-to-br from-bg-overlay to-bg-elevated flex flex-col justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-text-muted">
                PNR
              </div>
              <div className="mt-1 font-mono font-bold text-2xl gradient-text break-all">
                {booking.pnr}
              </div>

              <div className="mt-6">
                <div className="text-[10px] uppercase tracking-wider text-text-muted">
                  Status
                </div>
                <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Confirmed
                </div>
              </div>
            </div>

            {/* Faux barcode */}
            <div
              className="mt-6 h-16 rounded-md"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, #f1f5f9 0 2px, transparent 2px 4px, #f1f5f9 4px 5px, transparent 5px 9px, #f1f5f9 9px 11px, transparent 11px 14px)",
                backgroundColor: "rgba(241,245,249,0.05)",
              }}
              aria-hidden
            />
            <div className="text-center text-[10px] tracking-[0.4em] mt-2 text-text-muted font-mono">
              {booking.pnr}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-text-muted text-center mt-4">
        Carry a valid photo ID alongside this e-ticket. Have a safe journey
        aboard NexTrain.
      </p>
    </div>
  );
}

function Endpoint({ label, station, align }) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <div className="text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </div>
      <div className="font-display text-xl font-bold mt-0.5">
        {station?.code}
      </div>
      <div className="text-sm text-text-secondary flex items-center gap-1 mt-1 ${align === 'right' ? 'justify-end' : ''}">
        <HiOutlineMapPin className="h-3.5 w-3.5" />
        <span className="truncate">{station?.name}</span>
      </div>
    </div>
  );
}

function FareLine({ label, value, highlight }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </div>
      <div
        className={[
          "font-mono mt-1",
          highlight
            ? "text-lg font-bold gradient-text"
            : "text-sm text-text-primary",
        ].join(" ")}
      >
        {Number(value || 0).toFixed(2)}
      </div>
    </div>
  );
}
