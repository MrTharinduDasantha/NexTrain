import { HiOutlineUsers, HiOutlineArrowRight } from "react-icons/hi2";

import { formatDate } from "../../utils/formatDate.js";

/**
 * Passenger manifest for a given train + journey date.
 *
 * Props:
 *   passengers: [{ name, age, gender, seatNumber, coachNumber, trainClass, booking }]
 *   train:      { number, name } (header context)
 *   journeyDate: Date | string
 *   loading:    boolean
 */
export default function PassengerListTable({
  passengers = [],
  train,
  journeyDate,
  loading,
}) {
  // Group by coach for nicer display
  const byCoach = passengers.reduce((acc, p) => {
    const k = p.coachNumber || "—";
    if (!acc[k]) acc[k] = [];
    acc[k].push(p);
    return acc;
  }, {});

  const coaches = Object.entries(byCoach).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <div className="glass overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/15 grid place-items-center text-emerald-300">
            <HiOutlineUsers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold">
              {train ? `${train.number} · ${train.name}` : "Passenger manifest"}
            </h3>
            <p className="text-xs text-text-muted">
              {journeyDate ? formatDate(journeyDate) : "Pick a date and train"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">
            Total passengers
          </div>
          <div className="font-display font-bold text-2xl">
            {passengers.length}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-text-muted">
          Loading manifest…
        </div>
      ) : passengers.length === 0 ? (
        <div className="p-12 text-center text-sm text-text-muted">
          No passengers found for this train and date.
        </div>
      ) : (
        <div className="divide-y divide-border-subtle">
          {coaches.map(([coachNumber, list]) => (
            <div key={coachNumber}>
              <div className="px-5 py-2 bg-bg-base/40 flex items-center justify-between">
                <div className="text-xs uppercase tracking-wider text-text-muted">
                  Coach{" "}
                  <span className="text-text-primary font-mono">
                    {coachNumber}
                  </span>
                </div>
                <div className="text-xs text-text-muted">
                  {list.length} passenger{list.length === 1 ? "" : "s"}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-text-muted">
                      <th className="px-5 py-2 font-medium w-12">#</th>
                      <th className="px-5 py-2 font-medium">Name</th>
                      <th className="px-5 py-2 font-medium w-16">Age</th>
                      <th className="px-5 py-2 font-medium w-24">Gender</th>
                      <th className="px-5 py-2 font-medium w-24">Seat</th>
                      <th className="px-5 py-2 font-medium w-28">Class</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {list
                      .sort((a, b) =>
                        (a.seatNumber || "").localeCompare(
                          b.seatNumber || "",
                          undefined,
                          {
                            numeric: true,
                          },
                        ),
                      )
                      .map((p, i) => (
                        <tr key={p._id || i} className="hover:bg-bg-base/30">
                          <td className="px-5 py-2 text-text-muted">{i + 1}</td>
                          <td className="px-5 py-2 font-medium">{p.name}</td>
                          <td className="px-5 py-2">{p.age}</td>
                          <td className="px-5 py-2 capitalize text-text-secondary">
                            {p.gender}
                          </td>
                          <td className="px-5 py-2 font-mono font-semibold text-brand-300">
                            {p.seatNumber}
                          </td>
                          <td className="px-5 py-2 text-xs">
                            {p.trainClass?.code ? (
                              <span className="chip chip-brand font-mono">
                                {p.trainClass.code}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
