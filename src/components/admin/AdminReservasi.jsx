import React, { useState, useEffect } from 'react';
import { BookingServices } from '../../services/BookingServices';
import CustomAlert from '../common/CustomAlert';

export default function AdminReservasi({ filtered, getStatusBadgeClass }) {
  const [reservationData, setReservationData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  const showAlert = (title, message, type = 'success') => {
    setAlertConfig({ isOpen: true, title, message, type });
  };

  // 1. Fetch reservation data from MySQL via Backend
  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await BookingServices.getAllBookings();

      // Ensure data is an Array and sort IDs ascending (1 to latest)
      const list = Array.isArray(res) ? res : (res?.data || res?.reservations || []);
      const sortedList = [...list].sort(
        (a, b) => Number(a.id_reservasi || a.id) - Number(b.id_reservasi || b.id)
      );

      setReservationData(sortedList);
    } catch (error) {
      console.error("Failed to fetch reservation data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Update reservation status in Backend Database
  const updateReservation = async (id_reservasi, field, value) => {
    if (!id_reservasi) {
      showAlert("Invalid Data!", "Reservation ID not found.", "error");
      return;
    }

    try {
      // Optimistically update UI locally for responsive UX
      setReservationData((prevData) =>
        prevData.map((item) =>
          (item.id_reservasi || item.id) === id_reservasi
            ? { ...item, [field]: value }
            : item
        )
      );

      // Send update request to Backend Database via BookingServices
      await BookingServices.updateBookingStatus(id_reservasi, value);

      showAlert(
        "Status Updated!",
        `Reservation #${id_reservasi} status has been changed to '${value}'.`,
        "success"
      );
    } catch (error) {
      console.error("Failed to update status in database:", error);
      showAlert(
        "Update Failed!",
        error.message || "Failed to save reservation status changes to the database.",
        "error"
      );
      // Rollback to original data from backend if API fails
      fetchReservations();
    }
  };

  if (loading) return <div className="p-6 text-center text-slate-500">Loading reservation data...</div>;

  const dataList = filtered(reservationData, ["id_reservasi", "nama_lengkap", "nama_tamu", "nama_tipe", "status_reservasi"]);

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <CustomAlert
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      <div>
        <h3 className="text-base font-semibold text-slate-900">Reservation List</h3>
        <p className="text-xs text-slate-500">Check and manage incoming reservations from the guest booking page.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">RESERVATION ID</th>
              <th className="px-4 py-3">GUEST NAME</th>
              <th className="px-4 py-3">ROOM</th>
              <th className="px-4 py-3">CHECK-IN</th>
              <th className="px-4 py-3">CHECK-OUT</th>
              <th className="px-4 py-3">RESERVATION STATUS</th>
              <th className="px-4 py-3">PAYMENT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dataList.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-xs text-slate-400">
                  There are no reservation records in the database.
                </td>
              </tr>
            ) : (
              dataList.map((item) => {
                const resId = item.id_reservasi || item.id;
                const currentStatus = item.status_reservasi || item.status || 'pending';
                const guestName = item.nama_lengkap || item.nama_tamu || item.guest || `Guest #${item.id_tamu || resId}`;
                const roomType = item.nama_tipe || item.tipe_kamar || `Type #${item.id_kamar}`;
                const checkIn = String(item.tanggal_check_in || item.checkin || '-').slice(0, 10);
                const checkOut = String(item.tanggal_check_out || item.checkout || '-').slice(0, 10);

                return (
                  <tr key={resId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-blue-600">#{resId}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{guestName}</td>
                    <td className="px-4 py-3">{roomType}</td>
                    <td className="px-4 py-3">{checkIn}</td>
                    <td className="px-4 py-3">{checkOut}</td>
                    <td className="px-4 py-3">
                      <select
                        value={currentStatus}
                        onChange={(e) => updateReservation(resId, "status_reservasi", e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="check_in">check_in</option>
                        <option value="check_out">check_out</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(item.status_verifikasi || item.status_pembayaran || 'pending')}`}>
                        {item.status_verifikasi || item.status_pembayaran || 'pending'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}