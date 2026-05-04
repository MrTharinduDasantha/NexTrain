import { Link, NavLink } from "react-router";
import {
  HiOutlineSquares2X2,
  HiOutlineMapPin,
  HiOutlineGlobeAlt,
  HiOutlineCalendarDays,
  HiOutlineRectangleStack,
  HiOutlineCog6Tooth,
  HiOutlineTicket,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineWrenchScrewdriver,
  HiOutlineXMark,
} from "react-icons/hi2";

/**
 * Reusable admin sidebar.
 * Used inside AdminLayout (which has an embedded version) but also
 * available standalone for any admin page that wants to render its
 * own sidebar contextually.
 *
 * Props:
 *   open: boolean (drawer mode)
 *   onClose: () => void
 *   variant: 'desktop' | 'drawer'
 */
const SECTIONS = [
  {
    title: "Overview",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: HiOutlineSquares2X2 },
    ],
  },
  {
    title: "Network",
    items: [
      { to: "/admin/stations", label: "Stations", icon: HiOutlineMapPin },
      { to: "/admin/trains", label: "Trains", icon: HiOutlineGlobeAlt },
      { to: "/admin/routes", label: "Routes", icon: HiOutlineRectangleStack },
      {
        to: "/admin/schedules",
        label: "Schedules",
        icon: HiOutlineCalendarDays,
      },
    ],
  },
  {
    title: "Inventory",
    items: [
      {
        to: "/admin/fares",
        label: "Classes & Fares",
        icon: HiOutlineCog6Tooth,
      },
      {
        to: "/admin/coaches",
        label: "Coach Layout",
        icon: HiOutlineWrenchScrewdriver,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      { to: "/admin/bookings", label: "Bookings", icon: HiOutlineTicket },
      {
        to: "/admin/passengers",
        label: "Passenger List",
        icon: HiOutlineUsers,
      },
      { to: "/admin/reports", label: "Reports", icon: HiOutlineChartBar },
    ],
  },
];

export default function AdminSidebar({
  open = true,
  onClose,
  variant = "desktop",
}) {
  if (variant === "drawer" && !open) return null;

  if (variant === "drawer") {
    return (
      <div className="lg:hidden fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        <aside className="absolute inset-y-0 left-0 w-64 bg-bg-surface border-r border-border-subtle flex flex-col animate-slide-up">
          <div className="flex items-center justify-end px-4 py-2">
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="p-1.5 rounded-md hover:bg-bg-overlay"
            >
              <HiOutlineXMark className="h-5 w-5" />
            </button>
          </div>
          <SidebarContent />
        </aside>
      </div>
    );
  }

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-border-subtle bg-bg-surface/80 backdrop-blur-xl">
      <SidebarContent />
    </aside>
  );
}

function SidebarContent() {
  return (
    <>
      <div className="px-5 py-5 border-b border-border-subtle">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-linear-to-br from-brand-500 to-accent-500 grid place-items-center text-[#02110b] font-black">
            NX
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold tracking-tight">
              Nex<span className="gradient-text">Train</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-text-muted -mt-0.5">
              Admin Panel
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              {section.title}
            </div>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        "group flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-brand-500/15 text-brand-300 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.25)]"
                          : "text-text-secondary hover:text-text-primary hover:bg-bg-overlay",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={[
                            "h-4.5 w-4.5",
                            isActive ? "text-(--color-brand-400)" : "",
                          ].join(" ")}
                        />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-border-subtle">
        <div className="glass p-3 text-xs text-text-secondary">
          <div className="font-semibold text-text-primary mb-1">Tip</div>
          Run the class seeder once after deploy from the Classes & Fares page.
        </div>
      </div>
    </>
  );
}
