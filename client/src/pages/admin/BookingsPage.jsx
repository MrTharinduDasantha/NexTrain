import { useEffect, useState } from "react";
import BookingTable from "../../components/admin/BookingTable.jsx";
import { trainApi } from "../../api/train.api.js";
import { bookingApi } from "../../api/booking.api.js";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async (params = {}) => {
    setLoading(true);
    try {
      const data = await bookingApi.adminList(params);
      setBookings(data?.bookings || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    trainApi
      .list()
      .then((d) => setTrains(d?.trains || []))
      .catch(() => {});
    load();
  }, []);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="section-title">All bookings</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Search, filter and inspect every booking in the system.
        </p>
      </header>

      <BookingTable
        bookings={bookings}
        trains={trains}
        loading={loading}
        onSearch={load}
      />
    </div>
  );
}
