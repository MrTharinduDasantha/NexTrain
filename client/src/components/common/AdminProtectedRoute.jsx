import { Navigate, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { selectAuth, selectIsAdmin } from "../../app/features/authSlice.js";
import Loader from "./Loader.jsx";

/**
 * Admin gate. Used as a layout wrapper around /admin/* routes.
 *
 * Behaviour:
 *  - During the initial session probe → full-screen loader.
 *  - Unauthenticated → /admin/login.
 *  - Authenticated but not admin → /  (with an inline state flag so we can toast)
 */
export default function AdminProtectedRoute({ children }) {
  const { initialised, status } = useSelector(selectAuth);
  const isAdmin = useSelector(selectIsAdmin);
  const location = useLocation();

  if (!initialised || status === "loading") {
    return <Loader fullScreen size="lg" label="Verifying admin session…" />;
  }

  if (!isAdmin) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location, reason: "admin_required" }}
      />
    );
  }

  return children;
}
