import React, { useState, useEffect } from 'react';
import { BookingServices } from '../../services/BookingServices';
import CustomAlert from '../common/CustomAlert';

export default function AdminPembayaran({ filtered, formatRupiah }) {
  const [paymentData, setPaymentData] = useState([]);
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

  const formatIDR = formatRupiah || ((val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0)
  );

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const data = await BookingServices.getAllBookings();
      const list = Array.isArray(data) ? data : (data?.data || []);

      const sortedList = [...list].sort(
        (a, b) => Number(a.id_pembayaran || a.id_reservasi || a.id) - Number(b.id_pembayaran || b.id_reservasi || b.id)
      );
      setPaymentData(sortedList);
    } catch (error) {
      console.error("Gagal mengambil data pembayaran:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (item, newStatus) => {
    const targetId = item.id_pembayaran || item.id_reservasi || item.id;

    if (!targetId) {
      showAlert("Data Tidak Valid!", "ID Pembayaran tidak valid atau tidak ditemukan.", "error");
      return;
    }

    try {
      // 1. Update UI secara lokal (Optimistic UI)
      setPaymentData((prevData) =>
        prevData.map((p) => {
          const currentId = p.id_pembayaran || p.id_reservasi || p.id;
          if (currentId === targetId) {
            return {
              ...p,
              status_verifikasi: newStatus,
              paymentStatus: newStatus,
            };
          }
          return p;
        })
      );

      // 2. Kirim update ke Database Backend via BookingServices
      if (BookingServices.updatePaymentStatus) {
        await BookingServices.updatePaymentStatus(targetId, newStatus);
        showAlert(
          "Status Pembayaran Diperbarui!",
          `Status pembayaran #${targetId} berhasil diubah menjadi '${newStatus}'.`,
          "success"
        );
      }
    } catch (error) {
      console.error("Gagal memperbarui status pembayaran:", error);
      showAlert(
        "Gagal Memperbarui!",
        error.message || "Gagal memperbarui status pembayaran ke database.",
        "error"
      );
      fetchPaymentData(); // Rollback jika API gagal
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-slate-500">Memuat data pembayaran...</div>;
  }

  const dataList = filtered(paymentData, ["id", "id_reservasi", "id_pembayaran", "guest", "nama_lengkap", "method", "metode", "paymentStatus", "status_verifikasi"]);

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
        <h3 className="text-base font-semibold text-slate-900">Riwayat Pembayaran</h3>
        <p className="text-xs text-slate-500">Pantau transaksi dan ubah status pembayaran tamu.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">ID PEMBAYARAN</th>
              <th className="px-4 py-3">NAMA TAMU</th>
              <th className="px-4 py-3">JUMLAH</th>
              <th className="px-4 py-3">METODE</th>
              <th className="px-4 py-3">STATUS PEMBAYARAN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dataList.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-xs text-slate-400">
                  Belum ada transaksi pembayaran.
                </td>
              </tr>
            ) : (
              dataList.map((item) => {
                const payId = item.id_pembayaran || item.id_reservasi || item.id;
                const displayPayId = item.id_pembayaran ? `PAY-${item.id_pembayaran}` : `PAY-${String(payId).replace("#GN-", "")}`;
                const guestName = item.nama_lengkap || item.guest || `Tamu #${item.id_tamu || ''}`;
                const amount = item.total_biaya || item.jumlah_bayar || item.total_bayar || item.amount || 0;
                const method = item.metode || item.method || 'transfer';
                const payStatus = item.status_verifikasi || item.paymentStatus || 'pending';
                const isCancelled = item.status_reservasi === 'cancelled' || item.status === 'cancelled';

                return (
                  <tr key={payId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{displayPayId}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{guestName}</td>
                    <td className="px-4 py-3 font-semibold text-blue-600">{formatIDR(amount)}</td>
                    <td className="px-4 py-3 capitalize">{method}</td>
                    <td className="px-4 py-3">
                      <select
                        value={payStatus}
                        disabled={isCancelled}
                        onChange={(e) => updatePaymentStatus(item, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option value="pending">pending</option>
                        <option value="verified">verified</option>
                      </select>
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