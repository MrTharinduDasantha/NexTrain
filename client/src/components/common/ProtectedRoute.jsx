import { Navigate, Outlet, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { selectAuth } from "../../app/features/authSlice.js";
import Loader from "./Loader.jsx";

/**
 * Gates user-side routes behind authentication.
 *  - While the initial /auth/me probe is in flight, show a full-screen loader
 *    instead of redirecting (so a refreshed page doesn't bounce to /login).
 *  - When unauthenticated, redirect to /login and remember the intended path.
 */
export default function ProtectedRoute() {
  const { user, initialised, status } = useSelector(selectAuth);
  const location = useLocation();

  if (!initialised || status === "loading") {
    return <Loader fullScreen size="lg" label="Restoring session…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
