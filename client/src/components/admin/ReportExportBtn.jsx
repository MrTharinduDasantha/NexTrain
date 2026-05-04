import { useState } from "react";
import { HiOutlineArrowDownTray, HiOutlineDocumentText } from "react-icons/hi2";
import { toast } from "react-toastify";
import { reportApi } from "../../api/report.api.js";
import { saveBlob } from "../../utils/downloadPDF.js";

/**
 * Export a revenue (or other) report as a PDF.
 *
 * Props:
 *   from, to:  ISO date strings or Date objects (optional)
 *   filename:  override download name (default: 'NexTrain-Revenue-Report.pdf')
 *   variant:   'primary' (default) | 'ghost'
 *   label:     button label (default: 'Export PDF')
 *   reportType: 'revenue' (default) — extensible to occupancy etc.
 */
export default function ReportExportBtn({
  from,
  to,
  filename = "NexTrain-Revenue-Report.pdf",
  variant = "primary",
  label = "Export PDF",
  reportType = "revenue",
}) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      const params = {};
      if (from) params.from = from instanceof Date ? from.toISOString() : from;
      if (to) params.to = to instanceof Date ? to.toISOString() : to;

      let blob;
      if (reportType === "revenue") {
        blob = await reportApi.revenuePDF(params);
      } else {
        toast.error(`PDF export not implemented for ${reportType}`);
        return;
      }
      saveBlob(blob, filename);
      toast.success("Report downloaded");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={variant === "ghost" ? "btn-ghost" : "btn-primary"}
    >
      {busy ? (
        <>
          <HiOutlineDocumentText className="h-4 w-4 animate-pulse" />
          Preparing…
        </>
      ) : (
        <>
          <HiOutlineArrowDownTray className="h-4 w-4" />
          {label}
        </>
      )}
    </button>
  );
}
