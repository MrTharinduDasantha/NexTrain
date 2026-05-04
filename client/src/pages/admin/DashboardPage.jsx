import { useEffect, useState } from "react";
import {
  HiOutlineTicket,
  HiOutlineCurrencyDollar,
  HiOutlineGlobeAlt,
  HiOutlineUsers,
} from "react-icons/hi2";
import StatsCard from "../../components/admin/StatsCard.jsx";
import RevenueChart from "../../components/admin/RevenueChart.jsx";
import BookingsChart from "../../components/admin/BookingsChart.jsx";
import { adminApi } from "../../api/admin.api.js";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminApi
      .dashboard()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const fmtMoney = (n) =>
    new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(n || 0);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Greeting */}
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="section-title">Today at a glance</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Live snapshot of bookings, revenue, and operations.
          </p>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Bookings today"
          value={stats?.bookingsToday ?? 0}
          icon={HiOutlineTicket}
          accent="brand"
          loading={loading}
        />
        <StatsCard
          label="Revenue today"
          value={`LKR ${fmtMoney(stats?.revenueToday)}`}
          icon={HiOutlineCurrencyDollar}
          accent="cyan"
          loading={loading}
        />
        <StatsCard
          label="Active trains"
          value={stats?.totalActiveTrains ?? 0}
          icon={HiOutlineGlobeAlt}
          accent="gold"
          loading={loading}
        />
        <StatsCard
          label="Seats filled today"
          value={stats?.seatsFilledToday ?? 0}
          icon={HiOutlineUsers}
          accent="brand"
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <RevenueChart data={stats?.last7Revenue || []} />
        <BookingsChart data={stats?.last7Bookings || []} />
      </div>
    </div>
  );
}
