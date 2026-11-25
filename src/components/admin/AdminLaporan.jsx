import React, { useState, useEffect, useMemo } from "react";
import { Printer, TrendingUp, Calendar, CheckCircle2, XCircle } from "lucide-react";

const API_BASE = "http://10.7.7.155:3000/api";

export default function AdminLaporan({
  reportPeriod: periodProp,
  setReportPeriod: setPeriodProp,
  totalRevenue: revenueProp,
  filteredReportReservations: filteredProp,
  confirmedCount: confirmedProp,
  cancelledCount: cancelledProp,
  formatRupiah,
}) {
  const [internalPeriod, setInternalPeriod] = useState("Semua Data");
  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const reportPeriod = periodProp !== undefined ? periodProp : internalPeriod;
  const setReportPeriod = setPeriodProp || setInternalPeriod;

  const renderRupiah =
    typeof formatRupiah === "function"
      ? formatRupiah
      : (val) => `Rp ${Number(val || 0).toLocaleString("id-ID")}`;

  // Ambil data langsung dari endpoint backend aaPanel
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const [resReservasi, resPembayaran, resKamar] = await Promise.allSettled([
          fetch(`${API_BASE}/reservasi`, { headers }).then((r) => r.json()),
          fetch(`${API_BASE}/pembayaran`, { headers }).then((r) => r.json()),
          fetch(`${API_BASE}/kamar`, { headers }).then((r) => r.json()),
        ]);

        const extractList = (res) => {
          if (res.status !== "fulfilled") return [];
          const val = res.value;
          if (Array.isArray(val)) return val;
          if (Array.isArray(val?.data)) return val.data;
          return [];
        };

        // Urutkan data reservasi dari ID #1 ke seterusnya (ASC)
        const sortedReservations = [...extractList(resReservasi)].sort(
          (a, b) => Number(a.id_reservasi || a.id) - Number(b.id_reservasi || b.id)
        );

        setReservations(sortedReservations);
        setPayments(extractList(resPembayaran));
        setRooms(extractList(resKamar));
      } catch (err) {
        console.error("Gagal mengambil data laporan:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // Gabungkan data reservasi dengan info kamar & status pembayaran jika belum di-JOIN dari backend
  const enrichedReservations = useMemo(() => {
    const source =
      Array.isArray(filteredProp) && filteredProp.length > 0
        ? filteredProp
        : reservations;

    return source.map((item) => {
      const matchedRoom = rooms.find(
        (r) => String(r.id_kamar || r.id) === String(item.id_kamar)
      );
      const matchedPayment = payments.find(
        (p) => String(p.id_reservasi) === String(item.id_reservasi || item.id)
      );

      return {
        ...item,
        nomor_kamar: item.nomor_kamar || matchedRoom?.nomor_kamar || "",
        nama_tipe: item.nama_tipe || matchedRoom?.nama_tipe || "",
        status_verifikasi:
          item.status_verifikasi ||
          item.status_pembayaran ||
          matchedPayment?.status_verifikasi ||
          matchedPayment?.status ||
          "pending",
      };
    });
  }, [filteredProp, reservations, rooms, payments]);

  // Filter berdasarkan periode waktu
  const computedFilteredReservations = useMemo(() => {
    if (Array.isArray(filteredProp) && filteredProp.length > 0) {
      return enrichedReservations;
    }

    return enrichedReservations.filter((item) => {
      if (reportPeriod === "Semua Data") return true;

      const rawDate = item.tanggal_check_in || item.checkin || item.created_at;
      if (!rawDate) return false;

      const date = new Date(rawDate);
      if (isNaN(date.getTime())) return false;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const itemDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const diffDays = Math.floor((today - itemDay) / (1000 * 60 * 60 * 24));

      if (reportPeriod === "Harian") return diffDays === 0;
      if (reportPeriod === "Mingguan") return diffDays >= 0 && diffDays < 7;
      if (reportPeriod === "Bulanan")
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      if (reportPeriod === "Tahunan")
        return date.getFullYear() === now.getFullYear();

      return true;
    });
  }, [enrichedReservations, filteredProp, reportPeriod]);

  // Hitung statistik otomatis (gunakan prop jika > 0, jika tidak gunakan hasil hitungan API)
  const { totalRevenue, confirmedCount, cancelledCount } = useMemo(() => {
    const calcRevenue = computedFilteredReservations.reduce((sum, item) => {
      const verif = String(item.status_verifikasi || "").toLowerCase();
      if (verif === "verified" || verif === "lunas" || verif === "terverifikasi") {
        return sum + Number(item.total_biaya || item.total_harga || 0);
      }
      return sum;
    }, 0);

    const calcConfirmed = computedFilteredReservations.filter((item) => {
      const st = String(item.status_reservasi || item.status || "").toLowerCase();
      return ["confirmed", "dikonfirmasi", "check_in", "checked_in", "check_out", "checked_out", "selesai"].includes(st);
    }).length;

    const calcCancelled = computedFilteredReservations.filter((item) => {
      const st = String(item.status_reservasi || item.status || "").toLowerCase();
      return ["cancelled", "canceled", "dibatalkan", "batal"].includes(st);
    }).length;

    return {
      totalRevenue: revenueProp > 0 ? revenueProp : calcRevenue,
      confirmedCount: confirmedProp > 0 ? confirmedProp : calcConfirmed,
      cancelledCount: cancelledProp > 0 ? cancelledProp : calcCancelled,
    };
  }, [computedFilteredReservations, revenueProp, confirmedProp, cancelledProp]);

  return (
    <div className="space-y-6">
      {/* HEADER & FILTER PERIODE */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Ringkasan Laporan Hotel</h3>
          <p className="text-xs text-slate-500">Rekap aktivitas reservasi dan pendapatan hotel dari database.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="Semua Data">Semua Data</option>
            <option value="Harian">Harian (1 Hari Terakhir)</option>
            <option value="Mingguan">Mingguan (7 Hari Terakhir)</option>
            <option value="Bulanan">Bulanan (30 Hari Terakhir)</option>
            <option value="Tahunan">Tahunan (1 Tahun Terakhir)</option>
          </select>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Printer size={15} /> Cetak / PDF
          </button>
        </div>
      </div>

      {/* CARD STATISTIK LAPORAN */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Total Pendapatan</p>
            <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <h2 className="mt-2 text-xl font-bold text-emerald-600">
            {renderRupiah(totalRevenue)}
          </h2>
          <span className="text-[11px] text-slate-400">Pembayaran status verified</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Total Reservasi</p>
            <div className="rounded-lg bg-slate-50 p-1.5 text-slate-600">
              <Calendar size={16} />
            </div>
          </div>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {computedFilteredReservations.length}
          </h2>
          <span className="text-[11px] text-slate-400">Dalam periode: {reportPeriod}</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Reservasi Dikonfirmasi</p>
            <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <h2 className="mt-2 text-2xl font-bold text-blue-600">
            {confirmedCount}
          </h2>
          <span className="text-[11px] text-slate-400">Termasuk check_in & check_out</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Reservasi Cancelled</p>
            <div className="rounded-lg bg-red-50 p-1.5 text-red-600">
              <XCircle size={16} />
            </div>
          </div>
          <h2 className="mt-2 text-2xl font-bold text-red-600">
            {cancelledCount}
          </h2>
          <span className="text-[11px] text-slate-400">Dalam periode: {reportPeriod}</span>
        </div>
      </div>

      {/* TABEL REKAP TRANSAKSI LAPORAN */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-sm font-semibold text-slate-900">Rincian Transaksi Masuk</h4>
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">ID RESERVASI</th>
              <th className="px-4 py-3">NAMA TAMU</th>
              <th className="px-4 py-3">KAMAR</th>
              <th className="px-4 py-3">TOTAL BIAYA</th>
              <th className="px-4 py-3">STATUS VERIFIKASI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && computedFilteredReservations.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-xs text-slate-400">
                  Memuat data laporan dari server...
                </td>
              </tr>
            ) : computedFilteredReservations.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-xs text-slate-400">
                  Tidak ada data reservasi pada periode ini.
                </td>
              </tr>
            ) : (
              computedFilteredReservations.map((item) => {
                const resId = item.id_reservasi || item.id;
                const guest = item.nama_lengkap || item.nama_tamu || `Tamu #${item.id_tamu || ""}`;
                const roomInfo = item.nomor_kamar
                  ? `${item.nama_tipe || "Kamar"} (${item.nomor_kamar})`
                  : item.id_kamar
                    ? `Kamar #${item.id_kamar}`
                    : "-";
                const statusVerif = item.status_verifikasi || item.status_pembayaran || "pending";

                return (
                  <tr key={resId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-blue-600">#{resId}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{guest}</td>
                    <td className="px-4 py-3">{roomInfo}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {renderRupiah(item.total_biaya || item.total_harga || 0)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${["verified", "lunas", "terverifikasi"].includes(
                          String(statusVerif).toLowerCase()
                        )
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                          }`}
                      >
                        {statusVerif}
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