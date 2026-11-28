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

  // 1. Fetch data reservasi dari MySQL via Backend
  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await BookingServices.getAllBookings();

      // Memastikan data berupa Array dan mengurutkan ID dari 1 ke seterusnya (ASC)
      const list = Array.isArray(res) ? res : (res?.data || res?.reservations || []);
      const sortedList = [...list].sort(
        (a, b) => Number(a.id_reservasi || a.id) - Number(b.id_reservasi || b.id)
      );

      setReservationData(sortedList);
    } catch (error) {
      console.error("Gagal mengambil data reservasi:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Update status reservasi ke Database Backend
  const updateReservation = async (id_reservasi, field, value) => {
    if (!id_reservasi) {
      showAlert("Data Tidak Valid!", "ID Reservasi tidak ditemukan.", "error");
      return;
    }

    try {
      // Update UI secara lokal terlebih dahulu agar UX terasa responsif
      setReservationData((prevData) =>
        prevData.map((item) =>
          (item.id_reservasi || item.id) === id_reservasi
            ? { ...item, [field]: value }
            : item
        )
      );

      // Kirim request update ke Database Backend via BookingServices
      await BookingServices.updateBookingStatus(id_reservasi, value);

      showAlert(
        "Status Diperbarui!",
        `Status reservasi #${id_reservasi} berhasil diubah menjadi '${value}'.`,
        "success"
      );
    } catch (error) {
      console.error("Gagal memperbarui status ke database:", error);
      showAlert(
        "Gagal Memperbarui!",
        error.message || "Gagal menyimpan perubahan status reservasi ke database.",
        "error"
      );
      // Rollback ke data asli dari backend jika API gagal
      fetchReservations();
    }
  };

<<<<<<< HEAD
  if (loading) return <div className="p-6 text-center text-slate-500">Memuat data reservasi...</div>;
=======
  if (loading) return <div className="p-6 text-center text-slate-500">Loading reservation data...</div>;
>>>>>>> origin/master

  const dataList = filtered(reservationData, ["id_reservasi", "nama_lengkap", "nama_tipe", "status_reservasi"]);

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      {/* Komponen Notifikasi CustomAlert */}
      <CustomAlert
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      <div>
        <h3 className="text-base font-semibold text-slate-900">Daftar Reservasi</h3>
<<<<<<< HEAD
        <p className="text-xs text-slate-500">Periksa reservasi yang masuk dari halaman pemesanan tamu.</p>
=======
        <p className="text-xs text-slate-500">Check incoming reservations from the guest booking page.</p>
>>>>>>> origin/master
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">ID RESERVASI</th>
              <th className="px-4 py-3">NAMA TAMU</th>
              <th className="px-4 py-3">KAMAR</th>
              <th className="px-4 py-3">CHECK_IN</th>
              <th className="px-4 py-3">CHECK_OUT</th>
              <th className="px-4 py-3">STATUS RESERVASI</th>
              <th className="px-4 py-3">PEMBAYARAN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dataList.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-xs text-slate-400">
<<<<<<< HEAD
                  Belum ada data reservasi di database.
=======
                  There are no reservation records in the database.
>>>>>>> origin/master
                </td>
              </tr>
            ) : (
              dataList.map((item) => {
                const resId = item.id_reservasi || item.id;
                const currentStatus = item.status_reservasi || item.status || 'pending';
                const guestName = item.nama_lengkap || item.id_tamu || item.guest || 'Tamu';
                const roomType = item.nama_tipe || item.tipe_kamar || `Tipe #${item.id_kamar}`;
                const checkIn = item.tanggal_check_in || item.checkin || '-';
                const checkOut = item.tanggal_check_out || item.checkout || '-';

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