import { HiCheck } from "react-icons/hi2";

/**
 * Booking-flow step indicator.
 *
 * Props:
 *   steps: [{ key, label }]  — ordered list of steps
 *   current: string          — key of the active step
 *
 * Renders a horizontal trail with completed / active / pending visual states.
 */
export default function StepIndicator({ steps = [], current }) {
  const currentIdx = Math.max(
    0,
    steps.findIndex((s) => s.key === current),
  );

  return (
    <ol className="flex items-center gap-1 sm:gap-2 w-full overflow-x-auto py-2">
      {steps.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isActive = idx === currentIdx;
        return (
          <li
            key={step.key}
            className="flex items-center gap-2 sm:gap-3 shrink-0"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={[
                  "relative h-9 w-9 rounded-full grid place-items-center font-semibold text-sm transition-all",
                  isDone
                    ? "bg-brand-500 text-[#02110b] shadow-[0_0_20px_-4px_rgba(52,211,153,0.7)]"
                    : isActive
                      ? "bg-linear-to-br from-(--color-brand-400) to-accent-500 text-[#02110b] shadow-[0_0_24px_-2px_rgba(34,211,238,0.6)] animate-pulse-soft"
                      : "bg-bg-elevated text-text-muted border border-border-subtle",
                ].join(" ")}
              >
                {isDone ? <HiCheck className="h-5 w-5" /> : idx + 1}
              </div>

              <span
                className={[
                  "text-xs sm:text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "text-text-primary"
                    : isDone
                      ? "text-brand-300"
                      : "text-text-muted",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={[
                  "h-px w-6 sm:w-12 transition-colors",
                  isDone || isActive
                    ? "bg-linear-to-r from-(--color-brand-400) to-accent-400"
                    : "bg-border-subtle",
                ].join(" ")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
