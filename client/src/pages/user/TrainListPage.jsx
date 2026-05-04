import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { HiOutlineArrowPath, HiOutlineCalendarDays } from "react-icons/hi2";
import TrainCard from "../../components/user/TrainCard.jsx";
import FilterSortBar from "../../components/user/FilterSortBar.jsx";
import Loader from "../../components/common/Loader.jsx";
import {
  selectFilteredTrains,
  selectTrainStatus,
  selectSearchCriteria,
} from "../../app/features/trainSlice.js";
import { formatDate } from "../../utils/formatDate.js";

export default function TrainListPage() {
  const navigate = useNavigate();
  const trains = useSelector(selectFilteredTrains);
  const status = useSelector(selectTrainStatus);
  const criteria = useSelector(selectSearchCriteria);

  useEffect(() => {
    // If user landed here without performing a search, redirect to search form
    if (status === "idle" && (!criteria.from || !criteria.to)) {
      navigate("/search", { replace: true });
    }
  }, [status, criteria, navigate]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="section-title">Trains for you</h1>
            <p className="mt-1 text-sm text-text-secondary flex items-center gap-3 flex-wrap">
              {criteria.date && (
                <span className="inline-flex items-center gap-1.5">
                  <HiOutlineCalendarDays className="h-4 w-4 text-(--color-brand-400)" />
                  {formatDate(criteria.date)}
                </span>
              )}
            </p>
          </div>
          <button onClick={() => navigate("/search")} className="btn-ghost">
            <HiOutlineArrowPath className="h-4 w-4" />
            Modify search
          </button>
        </div>
      </header>

      {/* Filter bar */}
      <div className="mb-6">
        <FilterSortBar resultCount={trains.length} />
      </div>

      {/* Body */}
      {status === "loading" ? (
        <div className="glass p-12 grid place-items-center">
          <Loader size="lg" label="Searching trains…" />
        </div>
      ) : trains.length === 0 ? (
        <div className="glass p-12 text-center">
          <div className="text-5xl mb-3">🛤️</div>
          <h2 className="font-display font-semibold text-xl">
            No trains match your search
          </h2>
          <p className="mt-2 text-text-secondary max-w-md mx-auto">
            Try a different date or check whether the route operates on the day
            you've picked.
          </p>
          <button
            onClick={() => navigate("/search")}
            className="btn-primary mt-5"
          >
            Search again
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {trains.map((t) => (
            <TrainCard key={t.train._id} train={t} />
          ))}
        </div>
      )}
    </div>
  );
}
