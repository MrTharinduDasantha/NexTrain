import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router";
import { useDispatch } from "react-redux";
import UserLayout from "./layout/UserLayout.jsx";
import AdminLayout from "./layout/AdminLayout.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import AdminProtectedRoute from "./components/common/AdminProtectedRoute.jsx";
import Loader from "./components/common/Loader.jsx";
import { fetchCurrentUser, forceLogout } from "./app/features/authSlice.js";

/* -------- Lazy-loaded pages --------
   Each page is code-split into its own chunk so the initial bundle stays slim and pages load on demand as the user navigates.
*/

// User pages
const HomePage = lazy(() => import("./pages/user/HomePage.jsx"));
const LoginPage = lazy(() => import("./pages/user/LoginPage.jsx"));
const RegisterPage = lazy(() => import("./pages/user/RegisterPage.jsx"));
const ProfilePage = lazy(() => import("./pages/user/ProfilePage.jsx"));
const TrainSearchPage = lazy(() => import("./pages/user/TrainSearchPage.jsx"));
const TrainListPage = lazy(() => import("./pages/user/TrainListPage.jsx"));
const SeatSelectionPage = lazy(
  () => import("./pages/user/SeatSelectionPage.jsx"),
);
const PassengerDetailsPage = lazy(
  () => import("./pages/user/PassengerDetailsPage.jsx"),
);
const FareReviewPage = lazy(() => import("./pages/user/FareReviewPage.jsx"));
const PaymentSuccessPage = lazy(
  () => import("./pages/user/PaymentSuccessPage.jsx"),
);
const PaymentFailurePage = lazy(
  () => import("./pages/user/PaymentFailurePage.jsx"),
);
const MyBookingsPage = lazy(() => import("./pages/user/MyBookingsPage.jsx"));
const TicketDetailsPage = lazy(
  () => import("./pages/user/TicketDetailsPage.jsx"),
);
const TrainClassesPage = lazy(
  () => import("./pages/user/TrainClassesPage.jsx"),
);
const NotFoundPage = lazy(() => import("./pages/user/NotFoundPage.jsx"));

// Admin pages
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage.jsx"));
const DashboardPage = lazy(() => import("./pages/admin/DashboardPage.jsx"));
const StationsPage = lazy(() => import("./pages/admin/StationsPage.jsx"));
const TrainsPage = lazy(() => import("./pages/admin/TrainsPage.jsx"));
const RoutesPage = lazy(() => import("./pages/admin/RoutesPage.jsx"));
const SchedulesPage = lazy(() => import("./pages/admin/SchedulesPage.jsx"));
const ClassFaresPage = lazy(() => import("./pages/admin/ClassFaresPage.jsx"));
const CoachLayoutPage = lazy(() => import("./pages/admin/CoachLayoutPage.jsx"));
const BookingsPage = lazy(() => import("./pages/admin/BookingsPage.jsx"));
const PassengerListPage = lazy(
  () => import("./pages/admin/PassengerListPage.jsx"),
);
const ReportsPage = lazy(() => import("./pages/admin/ReportsPage.jsx"));

export default function App() {
  const dispatch = useDispatch();

  // Restore session on first paint
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // Listen for the global "session expired" signal from axios
  useEffect(() => {
    const handler = () => dispatch(forceLogout());
    window.addEventListener("nextrain:unauthorized", handler);
    return () => window.removeEventListener("nextrain:unauthorized", handler);
  }, [dispatch]);

  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        {/* ------- USER ROUTES ------- */}
        <Route element={<UserLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/classes" element={<TrainClassesPage />} />
          <Route path="/search" element={<TrainSearchPage />} />
          <Route path="/trains" element={<TrainListPage />} />

          {/* Auth-required routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/booking/seats" element={<SeatSelectionPage />} />
            <Route
              path="/booking/passengers"
              element={<PassengerDetailsPage />}
            />
            <Route path="/booking/review" element={<FareReviewPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/failure" element={<PaymentFailurePage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/tickets/:pnr" element={<TicketDetailsPage />} />
          </Route>
        </Route>

        {/* ------- ADMIN ROUTES ------- */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="stations" element={<StationsPage />} />
          <Route path="trains" element={<TrainsPage />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="schedules" element={<SchedulesPage />} />
          <Route path="fares" element={<ClassFaresPage />} />
          <Route path="coaches" element={<CoachLayoutPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="passengers" element={<PassengerListPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        {/* ------- 404 (Rendered inside the user layout) ------- */}
        <Route element={<UserLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="lg" />
    </div>
  );
}
