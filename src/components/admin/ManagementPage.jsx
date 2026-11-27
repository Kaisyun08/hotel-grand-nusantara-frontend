import React, { useState, useEffect } from "react";
import AdminKamar from "./AdminKamar";
import AdminLaporan from "./AdminLaporan";
import AdminReservasi from "./AdminReservasi";
import AdminTamu from "./AdminTamu";
import AdminPembayaran from "./AdminPembayaran";
import CustomAlert from "../common/CustomAlert";
import { RoomServices } from "../../services/RoomServices";
import { Save } from "lucide-react";

const reservationsDefault = [];

const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number || 0);
};

function getStatusBadgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("check_in") || s === "tersedia" || s === "ready" || s === "verified" || s === "check_out") {
    return "bg-emerald-100 text-emerald-800";
  }
  if (s.includes("reserved") || s === "terisi" || s === "occupied" || s === "confirmed") {
    return "bg-blue-100 text-blue-800";
  }
  if (s.includes("pending") || s === "dibersihkan") {
    return "bg-amber-100 text-amber-800";
  }
  if (s.includes("batal") || s.includes("cancel")) {
    return "bg-red-100 text-red-800";
  }
  return "bg-slate-100 text-slate-800";
}

export default function ManagementPage({ activeMenu, search, rooms: initialRooms, setRooms: parentSetRooms }) {
  const [reservationData, setReservationData] = useState(() => {
    try {
      const saved = localStorage.getItem("gn_reservations");
      return saved ? JSON.parse(saved) : reservationsDefault;
    } catch {
      return reservationsDefault;
    }
  });

  const [localRooms, setLocalRooms] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // State CustomAlert terpusat untuk ManagementPage
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const showAlert = (title, message, type = "success") => {
    setAlertConfig({ isOpen: true, title, message, type });
  };

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const data = await RoomServices.getAllRooms();
      const list = Array.isArray(data) ? data : data?.data || [];
      setRooms(list);
      if (parentSetRooms) parentSetRooms(list);
    } catch (error) {
      console.error("Gagal mengambil data kamar:", error);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (activeMenu === "Kamar") {
      fetchRooms();
    }
  }, [activeMenu]);

  const [hotelSettings, setHotelSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("gn_settings");
      return saved
        ? JSON.parse(saved)
        : { hotelName: "Hotel Grand Nusantara", totalRooms: 250, adminName: "Administrator", email: "admin@grandnusantara.com" };
    } catch {
      return { hotelName: "Hotel Grand Nusantara", totalRooms: 250, adminName: "Administrator", email: "admin@grandnusantara.com" };
    }
  });

  const [reportPeriod, setReportPeriod] = useState("Semua Data");

  const filtered = (items, fields) =>
    (Array.isArray(items) ? items : []).filter((item) =>
      fields.some((field) => String(item[field] ?? "").toLowerCase().includes(search.toLowerCase()))
    );

  const sourceData = typeof reservations !== "undefined" ? reservations : [];
  const filteredReportReservations = sourceData.filter((item) => {
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
    if (reportPeriod === "Bulanan") return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    if (reportPeriod === "Tahunan") return date.getFullYear() === now.getFullYear();

    return true;
  });

  const totalRevenue = filteredReportReservations.reduce((sum, item) => {
    const isVerified =
      String(item.status_verifikasi).toLowerCase() === "verified" ||
      String(item.status_pembayaran).toLowerCase() === "lunas" ||
      String(item.status_verifikasi).toLowerCase() === "success";

    if (isVerified) {
      const amount = Number(item.total_biaya || item.total_harga || item.jumlah_bayar || 0);
      return sum + amount;
    }
    return sum;
  }, 0);

  const confirmedCount = filteredReportReservations.filter((item) => {
    const st = String(item.status_reservasi || item.status).toLowerCase();
    return st === "confirmed" || st === "check_in" || st === "check_out" || st === "dikonfirmasi";
  }).length;

  const cancelledCount = filteredReportReservations.filter((item) => {
    const st = String(item.status_reservasi || item.status).toLowerCase();
    return st === "cancelled" || st === "batal" || st === "canceled";
  }).length;

  const pageTitle = {
    Kamar: "Manajemen Kamar",
    Reservasi: "Manajemen Reservasi",
    Tamu: "Data Tamu Hotel",
    Pembayaran: "Manajemen Pembayaran",
    Laporan: "Laporan Hotel",
    Pengaturan: "Pengaturan Sistem",
  };

  return (
    <div className="space-y-6">
      {/* Komponen Notifikasi CustomAlert */}
      <CustomAlert
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">HOTEL MANAGEMENT</span>
        <h1 className="text-2xl font-bold text-slate-900">{pageTitle[activeMenu]}</h1>
        <p className="text-sm text-slate-500">Kelola informasi dan aktivitas Hotel Grand Nusantara.</p>
      </div>

      {activeMenu === "Kamar" && (
        <AdminKamar
          rooms={rooms}
          setRooms={setRooms}
          filtered={filtered}
          getStatusBadgeClass={getStatusBadgeClass}
          fetchRooms={fetchRooms}
        />
      )}

      {activeMenu === "Reservasi" && (
        <AdminReservasi
          filtered={filtered}
          getStatusBadgeClass={getStatusBadgeClass}
        />
      )}

      {activeMenu === "Tamu" && (
        <AdminTamu
          filtered={filtered}
          getStatusBadgeClass={getStatusBadgeClass}
        />
      )}

      {activeMenu === "Pembayaran" && (
        <AdminPembayaran
          filtered={filtered}
          formatRupiah={formatRupiah}
        />
      )}

      {/* MENU LAPORAN */}
      {activeMenu === "Laporan" && (
        <AdminLaporan
          reportPeriod={reportPeriod}
          setReportPeriod={setReportPeriod}
          totalRevenue={totalRevenue}
          filteredReportReservations={filteredReportReservations}
          confirmedCount={confirmedCount}
          cancelledCount={cancelledCount}
          formatRupiah={formatRupiah}
        />
      )}

      {/* MENU PENGATURAN */}
      {activeMenu === "Pengaturan" && (
        <div className="max-w-2xl space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Pengaturan Hotel</h3>
            <p className="text-xs text-slate-500">Kelola informasi dasar Hotel Grand Nusantara.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Nama Hotel</label>
              <input
                type="text"
                value={hotelSettings.hotelName}
                onChange={(e) => setHotelSettings({ ...hotelSettings, hotelName: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Total Kamar Hotel</label>
              <input
                type="number"
                min="1"
                value={hotelSettings.totalRooms}
                onChange={(e) => setHotelSettings({ ...hotelSettings, totalRooms: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => {
                localStorage.setItem("gn_settings", JSON.stringify(hotelSettings));
                showAlert("Pengaturan Disimpan!", "Perubahan pengaturan hotel berhasil disimpan.", "success");
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              <Save size={15} /> Simpan Pengaturan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}