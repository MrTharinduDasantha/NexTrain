import { useState, useRef, useEffect } from "react";
import { HiOutlineArrowDownTray, HiOutlineChevronDown } from "react-icons/hi2";
import { toast } from "react-toastify";
import { ticketApi } from "../../api/ticket.api.js";
import { generateETicketPDF, saveBlob } from "../../utils/downloadPDF.js";

/**
 * Download e-ticket button.
 *
 * Two flavours:
 *  - Client-side (jsPDF) — instant, no server roundtrip
 *  - Server-side (pdfkit) — pixel-identical to the email attachment
 *
 * Defaults to client-side; users can pick from a small menu.
 *
 * Props:
 *  booking — full booking object (required for client PDF; server uses pnr only)
 *  pnr     — PNR string (required for server-side download)
 *  variant — 'primary' (default) | 'ghost'
 */
export default function TicketDownloadBtn({
  booking,
  pnr,
  variant = "primary",
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const click = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

  const handleClient = () => {
    setOpen(false);
    if (!booking) {
      toast.error("Ticket data not loaded yet");
      return;
    }
    try {
      generateETicketPDF(booking);
    } catch (e) {
      console.error(e);
      toast.error("Could not generate PDF");
    }
  };

  const handleServer = async () => {
    setOpen(false);
    const code = pnr || booking?.pnr;
    if (!code) {
      toast.error("PNR not available");
      return;
    }
    setBusy(true);
    try {
      const blob = await ticketApi.downloadServerPDF(code);
      saveBlob(blob, `NexTrain-${code}.pdf`);
    } catch {
      /* axios interceptor toasts */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative inline-block">
      <div className="inline-flex">
        <button
          type="button"
          onClick={handleClient}
          disabled={busy}
          className={[
            variant === "ghost" ? "btn-ghost" : "btn-primary",
            "rounded-r-none",
          ].join(" ")}
        >
          <HiOutlineArrowDownTray className="h-4 w-4" />
          {busy ? "Preparing…" : "Download"}
        </button>
        <button
          type="button"
          aria-label="Download options"
          onClick={() => setOpen((v) => !v)}
          className={[
            variant === "ghost" ? "btn-ghost" : "btn-primary",
            "rounded-l-none border-l border-black/20 px-2",
          ].join(" ")}
        >
          <HiOutlineChevronDown className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-60 glass shadow-2xl py-1.5 z-30 animate-slide-up">
          <Item
            title="Quick PDF"
            subtitle="Generated in your browser · instant"
            onClick={handleClient}
          />
          <Item
            title="Official PDF"
            subtitle="Server-rendered · same as email attachment"
            onClick={handleServer}
          />
        </div>
      )}
    </div>
  );
}

function Item({ title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 hover:bg-bg-overlay transition-colors"
      role="menuitem"
    >
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs text-text-muted">{subtitle}</div>
    </button>
  );
}
