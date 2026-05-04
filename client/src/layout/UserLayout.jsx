import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import Navbar from "../components/common/Navbar.jsx";
import Footer from "../components/common/Footer.jsx";

/**
 * Public/user-side shell. Scrolls to top on route changes so each
 * page presents itself fresh after navigation.
 */
export default function UserLayout() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
