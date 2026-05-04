/**
 * Sleek concentric-ring loader matching the brand gradient.
 */
export default function Loader({
  size = "md",
  label,
  fullScreen = false,
  className = "",
}) {
  const sizes = {
    sm: { wrap: "h-6 w-6", border: "border-2" },
    md: { wrap: "h-10 w-10", border: "border-[3px]" },
    lg: { wrap: "h-16 w-16", border: "border-4" },
  };
  const s = sizes[size] || sizes.md;

  const spinner = (
    <div className={`inline-flex flex-col items-center gap-3 ${className}`}>
      <div className={`relative ${s.wrap}`}>
        <div
          className={`absolute inset-0 rounded-full ${s.border} border-bg-elevated`}
        />
        <div
          className={`absolute inset-0 rounded-full ${s.border} border-transparent border-t-(--color-brand-400) border-r-accent-400 animate-spin`}
        />
        <div
          className={`absolute inset-1 rounded-full ${s.border} border-transparent border-b-(--color-gold-400) animate-spin`}
          style={{ animationDirection: "reverse", animationDuration: "1.6s" }}
        />
      </div>
      {label && <span className="text-sm text-text-secondary">{label}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-bg-base/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }
  return spinner;
}
