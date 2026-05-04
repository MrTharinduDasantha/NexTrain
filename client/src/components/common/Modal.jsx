import { useEffect } from "react";
import { createPortal } from "react-dom";
import { HiOutlineXMark } from "react-icons/hi2";

/**
 * Reusable modal dialog.
 *  - Closes on ESC and on backdrop click (unless `dismissable={false}`)
 *  - Locks body scroll while open
 *  - Sized via `size`: 'sm' | 'md' | 'lg' | 'xl'
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  dismissable = true,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && dismissable && onClose) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, dismissable, onClose]);

  if (!open) return null;

  const widths = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 animate-slide-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        className="absolute inset-0 bg-black/70"
        onClick={dismissable ? onClose : undefined}
      />
      <div
        className={`relative w-full ${widths[size]} glass shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || dismissable) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
            <h3
              id="modal-title"
              className="text-lg font-semibold tracking-tight"
            >
              {title}
            </h3>
            {dismissable && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-overlay transition-colors"
              >
                <HiOutlineXMark className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-border-subtle bg-bg-base/40 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
