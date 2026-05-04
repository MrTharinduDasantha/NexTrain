import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  HiOutlineTicket,
  HiOutlineMagnifyingGlass,
  HiOutlineMapPin,
} from "react-icons/hi2";
import BookingCard from "../../components/user/BookingCard.jsx";
import Loader from "../../components/common/Loader.jsx";
import {
  fetchMyBookings,
  selectMyBookings,
} from "../../app/features/bookingSlice.js";

export default function MyBookingsPage() {
  const dispatch = useDispatch();
  const bookings = useSelector(selectMyBookings);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    dispatch(fetchMyBookings()).finally(() => setLoading(false));
  }, [dispatch]);

  const { upcoming, past } = useMemo(() => {
    const now = Date.now() - 24 * 60 * 60 * 1000;
    const u = [];
    const p = [];
    for (const b of bookings) {
      const isPast =
        new Date(b.journeyDate).getTime() < now ||
        b.status === "cancelled" ||
        b.status === "failed";
      (isPast ? p : u).push(b);
    }
    return { upcoming: u, past: p };
  }, [bookings]);

  const filtered = (tab === "upcoming" ? upcoming : past).filter((b) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      b.pnr?.toLowerCase().includes(q) ||
      b.train?.name?.toLowerCase().includes(q) ||
      b.train?.number?.toLowerCase().includes(q) ||
      b.fromStation?.name?.toLowerCase().includes(q) ||
      b.toStation?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-6">
        <h1 className="section-title">My bookings</h1>
        <p className="mt-2 text-text-secondary">
          All your trips, past and upcoming, in one place.
        </p>
      </header>

      {/* Controls */}
      <div className="glass p-3 sm:p-4 mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-1 p-1 rounded-full bg-bg-base border border-border-subtle self-start">
          <Tab active={tab === "upcoming"} onClick={() => setTab("upcoming")}>
            Upcoming
            <span className="chip ml-2 px-2! py-0!">{upcoming.length}</span>
          </Tab>
          <Tab active={tab === "past"} onClick={() => setTab("past")}>
            Past
            <span className="chip ml-2 px-2! py-0!">{past.length}</span>
          </Tab>
        </div>

        <div className="relative sm:w-72">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search PNR, train, station…"
            className="field-input pl-9!"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="glass p-12 grid place-items-center">
          <Loader size="md" label="Fetching your bookings…" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState tab={tab} query={query} hasAny={bookings.length > 0} />
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <BookingCard key={b._id} booking={b} />
          ))}
        </div>
      )}
    </div>
  );
}

function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center",
        active
          ? "bg-linear-to-br from-brand-500 to-accent-500 text-[#02110b]"
          : "text-text-secondary hover:text-text-primary",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function EmptyState({ tab, query, hasAny }) {
  if (query) {
    return (
      <div className="glass p-10 text-center">
        <div className="text-4xl mb-2">🔍</div>
        <h3 className="font-display font-semibold text-lg">
          No matches for "{query}"
        </h3>
        <p className="text-sm text-text-secondary mt-1">
          Try a different keyword or clear the search.
        </p>
      </div>
    );
  }

  return (
    <div className="glass p-10 text-center">
      <HiOutlineTicket className="h-10 w-10 mx-auto text-(--color-brand-400) mb-3" />
      <h3 className="font-display font-semibold text-lg">
        {hasAny
          ? tab === "upcoming"
            ? "No upcoming trips"
            : "No past trips here yet"
          : "You haven't booked any trips yet"}
      </h3>
      <p className="text-sm text-text-secondary mt-1 max-w-md mx-auto">
        {hasAny
          ? "Switch tabs to see other bookings."
          : "Start exploring routes and book your first journey today."}
      </p>
      {!hasAny && (
        <Link to="/search" className="btn-primary mt-5 inline-flex">
          <HiOutlineMapPin className="h-4 w-4" />
          Search trains
        </Link>
      )}
    </div>
  );
}
