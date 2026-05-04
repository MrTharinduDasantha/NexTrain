import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineTicket,
  HiOutlineUserCircle,
  HiOutlineRectangleStack,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { logout, selectUser } from "../../app/features/authSlice";
import logo from "../../assets/logo.png";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/search", label: "Search", icon: HiOutlineMagnifyingGlass },
  { to: "/classes", label: "Classes", icon: HiOutlineRectangleStack },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    setDrawerOpen(false);
    await dispatch(logout());
    toast.success("Signed out");
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    [
      "relative inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
      isActive
        ? "text-[color:var(--color-text-primary)]"
        : "text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]",
    ].join(" ");

  return (
    <header
      className={[
        "sticky top-0 z-40 transition-all",
        scrolled
          ? "bg-bg-base/85 backdrop-blur-xl border-b border-border-subtle"
          : "bg-transparent border-b border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 group">
            <div className="relative h-12 w-12 overflow-hidden rounded-lg group-hover:scale-105 transition-transform">
              <img
                src={logo}
                alt="NexTrain Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-lg tracking-tight">
                Nex<span className="gradient-text">Train</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-text-muted -mt-0.5">
                Sri Lanka Rail
              </div>
            </div>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                {({ isActive }) => (
                  <>
                    {l.icon && <l.icon className="h-4 w-4" />}
                    {l.label}
                    {isActive && (
                      <span className="absolute left-3 right-3 -bottom-px h-0.5 bg-linear-to-r from-(--color-brand-400) to-accent-400 rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
            {user && (
              <NavLink to="/my-bookings" className={linkClass}>
                <HiOutlineTicket className="h-4 w-4" />
                My Bookings
              </NavLink>
            )}
          </nav>

          {/* Auth area */}
          <div className="hidden md:flex items-center gap-2">
            {!user ? (
              <>
                <Link to="/login" className="btn-ghost">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary">
                  Get started
                </Link>
              </>
            ) : (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-full border border-border-subtle hover:border-(--color-brand-400) transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <Avatar user={user} />
                  <span className="text-sm font-medium pr-1 hidden lg:block">
                    {user.name?.split(" ")[0] || "Account"}
                  </span>
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 glass shadow-2xl py-1.5 animate-slide-up"
                    role="menu"
                  >
                    <div className="px-3 py-2 border-b border-border-subtle">
                      <div className="text-sm font-semibold truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-text-muted truncate">
                        {user.email}
                      </div>
                    </div>
                    <MenuItem
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      icon={HiOutlineUserCircle}
                    >
                      Profile
                    </MenuItem>
                    <MenuItem
                      to="/my-bookings"
                      onClick={() => setMenuOpen(false)}
                      icon={HiOutlineTicket}
                    >
                      My bookings
                    </MenuItem>
                    {user.role === "admin" && (
                      <MenuItem
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        icon={HiOutlineRectangleStack}
                      >
                        Admin panel
                      </MenuItem>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10 transition-colors"
                    >
                      <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 rounded-md text-text-secondary hover:bg-bg-elevated"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <HiOutlineBars3 className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-72 max-w-[85%] glass border-l border-border-subtle p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <span className="font-display font-semibold">Menu</span>
              <button
                className="p-1.5 rounded-md hover:bg-bg-overlay"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
              >
                <HiOutlineXMark className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-bg-overlay"
                >
                  {l.icon && <l.icon className="h-4 w-4" />}
                  {l.label}
                </NavLink>
              ))}
              {user && (
                <NavLink
                  to="/my-bookings"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-bg-overlay"
                >
                  <HiOutlineTicket className="h-4 w-4" />
                  My Bookings
                </NavLink>
              )}
            </nav>

            <div className="mt-6 pt-6 border-t border-border-subtle">
              {!user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setDrawerOpen(false)}
                    className="btn-ghost w-full cursor-pointer"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setDrawerOpen(false)}
                    className="btn-primary w-full cursor-pointer"
                  >
                    Get started
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar user={user} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-text-muted truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDrawerOpen(false)}
                    className="btn-ghost w-full mb-2"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn-danger w-full justify-center"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}

function MenuItem({ to, onClick, icon: Icon, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-overlay transition-colors"
      role="menuitem"
    >
      {Icon && <Icon className="h-4 w-4 text-text-muted" />}
      {children}
    </Link>
  );
}

function Avatar({ user }) {
  if (user?.profilePhoto?.url) {
    return (
      <img
        src={user.profilePhoto.url}
        alt={user.name || "User"}
        className="h-7 w-7 rounded-full object-cover ring-2 ring-bg-elevated"
      />
    );
  }
  const initials = (user?.name || "?")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className="h-7 w-7 rounded-full bg-linear-to-br from-brand-500 to-accent-500 grid place-items-center text-[#02110b] text-xs font-bold">
      {initials}
    </span>
  );
}
