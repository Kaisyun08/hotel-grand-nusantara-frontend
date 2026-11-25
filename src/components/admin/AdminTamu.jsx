import React, { useState, useEffect } from 'react';
import { BookingServices } from '../../services/BookingServices';

export default function AdminTamu({ filtered, getStatusBadgeClass }) {
  const [guestData, setGuestData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper untuk membuat inisial nama jika tidak ada avatar
  const getInitials = (name) => {
    if (!name) return 'T';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  useEffect(() => {
    fetchGuestData();
  }, []);

  const fetchGuestData = async () => {
    try {
      setLoading(true);
      // Mengambil data reservasi/tamu dari backend
      const data = await BookingServices.getAllBookings();
      const list = Array.isArray(data) ? data : (data?.data || []);

      // Urutkan dari ID terkecil (1) ke terbesar (ASC)
      const sortedList = [...list].sort(
        (a, b) => Number(a.id_tamu || a.id_reservasi || a.id) - Number(b.id_tamu || b.id_reservasi || b.id)
      );

      setGuestData(sortedList);
    } catch (error) {
      console.error("Gagal mengambil data tamu:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-slate-500">Memuat data tamu...</div>;
  }

  // Menambahkan fallback pencarian nomor kamar pada filter
  const dataList = filtered(guestData, [
    "guest", "nama_lengkap  ", "id_reservasi", "id", "room", "nama_tipe", "nomor_kamar", "no_kamar"
  ]);

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Data Tamu Hotel</h3>
        <p className="text-xs text-slate-500">Informasi tamu berdasarkan data reservasi.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">NAMA TAMU</th>
              <th className="px-4 py-3">ID RESERVASI</th>
              <th className="px-4 py-3">TIPE KAMAR</th>
              <th className="px-4 py-3">NO. KAMAR</th>
              <th className="px-4 py-3">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dataList.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-xs text-slate-400">
                  Belum ada data tamu.
                </td>
              </tr>
            ) : (
              dataList.map((item) => {
                const guestName = item.nama_lengkap || item.guest || `Tamu #${item.id_tamu || item.id}`;
                const resId = item.id_reservasi || item.id;
                const roomType = item.nama_tipe || item.room || (item.id_kamar ? `Tipe #${item.id_kamar}` : '-');

                // Menarik nomor kamar dari berbagai alias MySQL backend
                const roomNumber = item.nomor_kamar || item.no_kamar || item.room_number || item.number || (item.id_kamar ? `Kamar ${item.id_kamar}` : '-');
                const status = item.status_reservasi || item.status || 'pending';

                return (
                  <tr key={resId} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                          {item.initials || getInitials(guestName)}
                        </div>
                        <strong className="text-slate-900">{guestName}</strong>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-blue-600">#{resId}</td>
                    <td className="px-4 py-3">{roomType}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{roomNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(status)}`}>
                        {status}
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