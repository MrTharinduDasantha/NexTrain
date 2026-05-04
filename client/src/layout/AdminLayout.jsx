import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation, Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  HiOutlineSquares2X2,
  HiOutlineMapPin,
  HiOutlineCalendarDays,
  HiOutlineRectangleStack,
  HiOutlineCog6Tooth,
  HiOutlineTicket,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";
import { IoTrainOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { logout, selectUser } from "../app/features/authSlice";
import logo from "../assets/logo.png";

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
      { to: "/admin/trains", label: "Trains", icon: IoTrainOutline },
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

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-close mobile sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success("Signed out");
    navigate("/admin/login");
  };

  const pageTitle = (() => {
    const flat = SECTIONS.flatMap((s) => s.items);
    return (
      flat.find((i) => location.pathname.startsWith(i.to))?.label || "Admin"
    );
  })();

  return (
    <div className="min-h-screen flex bg-bg-base">
      {/* ----- Sidebar (mobile drawer + desktop fixed) ----- */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ----- Main column ----- */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 sm:px-6 bg-bg-base/85 border-b border-border-subtle">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-bg-elevated"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <HiOutlineBars3 className="h-6 w-6" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.25em] text-text-muted">
              NexTrain · Admin
            </div>
            <div className="font-display font-semibold tracking-tight truncate">
              {pageTitle}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex text-xs text-text-secondary hover:text-(--color-brand-400)"
            >
              ↗ View site
            </Link>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-full border border-border-subtle">
              <span className="h-7 w-7 rounded-full bg-linear-to-br from-brand-500 to-accent-500 grid place-items-center text-[#02110b] text-xs font-bold">
                {(user?.name || "A").slice(0, 1).toUpperCase()}
              </span>
              <span className="text-sm font-medium pr-1 hidden sm:block">
                {user?.name?.split(" ")[0] || "Admin"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-md text-text-secondary hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
              aria-label="Sign out"
              title="Sign out"
            >
              <HiOutlineArrowLeftOnRectangle className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Desktop fixed */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-border-subtle bg-bg-surface/80">
        <SidebarBody />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
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
            <SidebarBody />
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarBody() {
  return (
    <>
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border-subtle">
        <Link to="/admin/dashboard" className="flex items-center gap-1.5 group">
          <div className="relative h-12 w-12 overflow-hidden rounded-lg group-hover:scale-105 transition-transform">
            <img
              src={logo}
              alt="NexTrain Logo"
              className="h-full w-full object-contain"
            />
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

      {/* Sections */}
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

      {/* Footer hint */}
      <div className="px-4 py-4 border-t border-border-subtle">
        <div className="glass p-3 text-xs text-text-secondary">
          <div className="font-semibold text-text-primary mb-1">Tip</div>
          Run the class seeder once after deploy from the Classes & Fares page.
        </div>
      </div>
    </>
  );
}
