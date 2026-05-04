import { useDispatch, useSelector } from "react-redux";
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
} from "react-icons/hi2";
import { selectFilters, setFilter } from "../../app/features/trainSlice.js";

const SORTS = [
  { key: "departure", label: "Departure" },
  { key: "arrival", label: "Arrival" },
  { key: "duration", label: "Duration" },
  { key: "fare", label: "Fare" },
];

const CLASSES = [
  { code: "FCO", label: "1st Obs." },
  { code: "FAC", label: "1st AC" },
  { code: "SCR", label: "2nd Res." },
  { code: "SCU", label: "2nd Un." },
  { code: "TCR", label: "3rd Res." },
  { code: "TCU", label: "3rd Un." },
];

export default function FilterSortBar({ resultCount = 0 }) {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);

  const setSort = (key) => {
    if (filters.sortBy === key) {
      dispatch(
        setFilter({ sortDir: filters.sortDir === "asc" ? "desc" : "asc" }),
      );
    } else {
      dispatch(setFilter({ sortBy: key, sortDir: "asc" }));
    }
  };

  return (
    <div className="glass p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <HiOutlineAdjustmentsHorizontal className="h-5 w-5 text-(--color-brand-400)" />
          <span className="font-medium">Filter & sort</span>
          <span className="chip ml-2">
            {resultCount} result{resultCount === 1 ? "" : "s"}
          </span>
        </div>

        <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={filters.onlyAvailable}
            onChange={(e) =>
              dispatch(setFilter({ onlyAvailable: e.target.checked }))
            }
          />
          <span className="relative h-5 w-9 rounded-full bg-bg-elevated border border-border-subtle peer-checked:bg-brand-500/40 peer-checked:border-(--color-brand-400) transition-colors">
            <span className="absolute top-px left-px h-4 w-4 rounded-full bg-text-secondary peer-checked:translate-x-4 peer-checked:bg-brand-300 transition-all" />
          </span>
          <span>Only available</span>
        </label>
      </div>

      {/* Sort buttons */}
      <div className="flex flex-wrap gap-2">
        {SORTS.map((s) => {
          const active = filters.sortBy === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={[
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                active
                  ? "bg-brand-500/20 text-brand-300 border border-(--color-brand-400)"
                  : "bg-bg-elevated text-text-secondary border border-border-subtle hover:text-text-primary",
              ].join(" ")}
            >
              {s.label}
              {active &&
                (filters.sortDir === "asc" ? (
                  <HiOutlineArrowUp className="h-3 w-3" />
                ) : (
                  <HiOutlineArrowDown className="h-3 w-3" />
                ))}
            </button>
          );
        })}
      </div>

      {/* Class filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => dispatch(setFilter({ classCode: null }))}
          className={[
            "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
            !filters.classCode
              ? "bg-brand-500/20 text-brand-300 border border-(--color-brand-400)"
              : "bg-bg-elevated text-text-secondary border border-border-subtle hover:text-text-primary",
          ].join(" ")}
        >
          All classes
        </button>
        {CLASSES.map((c) => (
          <button
            key={c.code}
            onClick={() =>
              dispatch(
                setFilter({
                  classCode: filters.classCode === c.code ? null : c.code,
                }),
              )
            }
            className={[
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              filters.classCode === c.code
                ? "bg-brand-500/20 text-brand-300 border border-(--color-brand-400)"
                : "bg-bg-elevated text-text-secondary border border-border-subtle hover:text-text-primary",
            ].join(" ")}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
