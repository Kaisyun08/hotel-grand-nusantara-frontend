import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../../components/admin/Sidebar";
import ManagementPage from "../../components/admin/ManagementPage";
import CustomAlert from "../../components/common/CustomAlert";
import { AuthServices } from "../../services/AuthServices";
import { RoomServices } from "../../services/RoomServices";
import { BookingServices } from "../../services/BookingServices";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  Users,
  CreditCard,
  ChartNoAxesCombined,
  Bell,
  Search,
  Menu,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  Hotel,
  CalendarCheck,
  DoorOpen,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Kamar", icon: BedDouble },
  { name: "Reservasi", icon: CalendarDays },
  { name: "Tamu", icon: Users },
  { name: "Pembayaran", icon: CreditCard },
  { name: "Laporan", icon: ChartNoAxesCombined },
];

function getStatusBadgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("check_in") || s === "tersedia" || s === "ready" || s === "confirmed")
    return "bg-emerald-100 text-emerald-800";
  if (s.includes("reserved") || s === "terisi" || s === "occupied" || s === "check_out")
    return "bg-blue-100 text-blue-800";
  if (s.includes("pending")) return "bg-amber-100 text-amber-800";
  if (s.includes("cancelled") || s.includes("batal")) return "bg-red-100 text-red-800";
  return "bg-slate-100 text-slate-800";
}

export default function DashboardAdmin() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [period, setPeriod] = useState("7 Hari Terakhir");
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);

  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const handleLogout = () => {
    AuthServices.logout();
    sessionStorage.removeItem("token");

    setAlertConfig({
      isOpen: true,
      title: "Logout Berhasil!",
      message: "Anda telah keluar dari halaman Admin.",
      type: "success",
    });

    setTimeout(() => {
      navigate("/login");
    }, 1200);
  };

  // Ambil data Kamar & Reservasi secara bersamaan
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [roomRes, bookingRes] = await Promise.allSettled([
        RoomServices.getAllRooms(),
        BookingServices.getAllBookings(),
      ]);

      const roomList =
        roomRes.status === "fulfilled"
          ? Array.isArray(roomRes.value)
            ? roomRes.value
            : roomRes.value?.data || roomRes.value?.rooms || []
          : [];

      const bookingList =
        bookingRes.status === "fulfilled"
          ? Array.isArray(bookingRes.value)
            ? bookingRes.value
            : bookingRes.value?.data || bookingRes.value?.reservations || []
          : [];

      // Urutkan Kamar berdasarkan nomor kamar / id_kamar (ASC)
      const sortedRooms = [...roomList].sort(
        (a, b) => Number(a.nomor_kamar || a.id_kamar || a.id) - Number(b.nomor_kamar || b.id_kamar || b.id)
      );

      // Urutkan Reservasi berdasarkan id_reservasi dari 1 ke seterusnya (ASC)
      const sortedBookings = [...bookingList].sort(
        (a, b) => Number(a.id_reservasi || a.id) - Number(b.id_reservasi || b.id)
      );

      setRooms(sortedRooms);
      setReservations(sortedBookings);
    } catch (err) {
      console.error("Gagal mengambil data dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = AuthServices.getCurrentUser();
    setUser(currentUser);
    fetchDashboardData();
  }, []);

  // Re-fetch saat admin kembali ke tab Dashboard agar data selalu sinkron setelah edit di menu lain
  useEffect(() => {
    if (activeMenu === "Dashboard") {
      fetchDashboardData();
    }
  }, [activeMenu]);

  // 1. Statistik Kamar & Reservasi
  const totalKamar = rooms.length;
  const kamarTersedia = rooms.filter((r) =>
    ["ready", "tersedia"].includes(String(r.status || "").toLowerCase())
  ).length;
  const kamarTerisi = rooms.filter((r) =>
    ["occupied", "terisi"].includes(String(r.status || "").toLowerCase())
  ).length;
  const kamarMaintenance = rooms.filter((r) =>
    ["maintenance", "dibersihkan", "cleaning"].includes(String(r.status || "").toLowerCase())
  ).length;

  const persenTersedia = totalKamar > 0 ? (kamarTersedia / totalKamar) * 100 : 0;
  const persenTerisi = totalKamar > 0 ? (kamarTerisi / totalKamar) * 100 : 0;

  const donutGradient =
    totalKamar > 0
      ? `conic-gradient(
          #10b981 0% ${persenTersedia}%,
          #2563eb ${persenTersedia}% ${persenTersedia + persenTerisi}%,
          #f59e0b ${persenTersedia + persenTerisi}% 100%
        )`
      : `conic-gradient(#e2e8f0 0% 100%)`;

  // Filter reservasi berdasarkan dropdown periode di kartu Statistik Reservasi
  const periodFilteredReservations = useMemo(() => {
    const daysLimit = period === "7 Hari Terakhir" ? 7 : period === "30 Hari Terakhir" ? 30 : 90;
    const now = new Date();

    return reservations.filter((item) => {
      const rawDate = item.tanggal_check_in || item.checkin || item.created_at;
      if (!rawDate) return true;
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return true;
      const diffDays = Math.abs((now - d) / (1000 * 60 * 60 * 24));
      return diffDays <= daysLimit;
    });
  }, [reservations, period]);

  const statistics = [
    {
      title: "Total Kamar",
      value: totalKamar.toString(),
      description: "Seluruh kamar hotel",
      icon: BedDouble,
      color: "bg-blue-50 text-blue-600",
      change: `${totalKamar} Unit`,
      positive: true,
    },
    {
      title: "Kamar Tersedia",
      value: kamarTersedia.toString(),
      description: "Siap untuk ditempati",
      icon: DoorOpen,
      color: "bg-emerald-50 text-emerald-600",
      change: totalKamar ? `${Math.round((kamarTersedia / totalKamar) * 100)}%` : "0%",
      positive: true,
    },
    {
      title: "Kamar Terisi",
      value: kamarTerisi.toString(),
      description: "Sedang ditempati tamu",
      icon: Hotel,
      color: "bg-amber-50 text-amber-600",
      change: totalKamar ? `${Math.round((kamarTerisi / totalKamar) * 100)}%` : "0%",
      positive: true,
    },
    {
      title: "Total Reservasi",
      value: reservations.length.toString(),
      description: "Total Incoming Orders",
      icon: CalendarCheck,
      color: "bg-purple-50 text-purple-600",
      change: `${periodFilteredReservations.length} baru`,
      positive: true,
    },
  ];

  // 2. Data Grafik Batang Dinamis (Senin - Minggu) dari data reservations
  const dynamicChartData = useMemo(() => {
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const counts = { Sen: 0, Sel: 0, Rab: 0, Kam: 0, Jum: 0, Sab: 0, Min: 0 };

    periodFilteredReservations.forEach((item) => {
      const rawDate = item.tanggal_check_in || item.checkin || item.created_at;
      if (!rawDate) return;
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        const dayName = days[d.getDay()];
        counts[dayName] = (counts[dayName] || 0) + 1;
      }
    });

    const orderedDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    const maxCount = Math.max(...orderedDays.map((d) => counts[d]), 1);

    return orderedDays.map((day) => ({
      day,
      count: counts[day],
      // Tinggi persentase batang minimal 8% agar tetap terlihat jika 0
      heightPercent: counts[day] === 0 ? 8 : Math.min(100, Math.round((counts[day] / maxCount) * 100)),
      isPeak: counts[day] === maxCount && counts[day] > 0,
    }));
  }, [periodFilteredReservations]);

  // 3. Mapping Data Tabel "Reservasi Terbaru" (Gabungkan dengan data rooms untuk No. Kamar)
  const mappedRecentReservations = useMemo(() => {
    return [...reservations]
      .sort((a, b) => Number(b.id_reservasi || b.id) - Number(a.id_reservasi || a.id))
      .map((item) => {
        const matchedRoom = rooms.find(
          (r) => String(r.id_kamar || r.id) === String(item.id_kamar)
        );
        const guestName = item.nama_lengkap || item.nama_tamu || `Tamu #${item.id_tamu || "-"}`;
        const initials = guestName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        return {
          id: item.id_reservasi || item.id,
          guest: guestName,
          initials: initials || "TM",
          room: item.nama_tipe || matchedRoom?.nama_tipe || "Standard Room",
          number: item.nomor_kamar || matchedRoom?.nomor_kamar || `#${item.id_kamar || "-"}`,
          checkin: String(item.tanggal_check_in || item.checkin || "-").slice(0, 10),
          checkout: String(item.tanggal_check_out || item.checkout || "-").slice(0, 10),
          status: item.status_reservasi || item.status || "pending",
        };
      })
      .filter((item) =>
        `${item.guest} ${item.id} ${item.room} ${item.number}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .slice(0, 5); // Tampilkan 5 reservasi terbaru di Dashboard
  }, [reservations, rooms, search]);

  // 4. Generate "Aktivitas Terbaru" dari Reservasi & Kamar Maintenance
  const dynamicActivities = useMemo(() => {
    const recentBookings = [...reservations]
      .sort((a, b) => Number(b.id_reservasi || b.id) - Number(a.id_reservasi || a.id))
      .slice(0, 4)
      .map((item) => {
        const st = String(item.status_reservasi || item.status || "pending").toLowerCase();
        const guestName = item.nama_lengkap || item.nama_tamu || `Tamu #${item.id_tamu}`;
        const resId = item.id_reservasi || item.id;

        if (st === "check_in") {
          return {
            title: `Check-in Tamu: ${guestName}`,
            description: `Reservasi #${resId} telah melakukan check-in kamar.`,
            time: String(item.tanggal_check_in || "").slice(0, 10),
            icon: LogIn,
            color: "bg-emerald-50 text-emerald-600",
          };
        }
        if (st === "check_out") {
          return {
            title: `Check-out Tamu: ${guestName}`,
            description: `Reservasi #${resId} telah menyelesaikan masa inap.`,
            time: String(item.tanggal_check_out || "").slice(0, 10),
            icon: LogOut,
            color: "bg-blue-50 text-blue-600",
          };
        }
        return {
          title: `Reservasi Baru #${resId} (${guestName})`,
          description: `Status saat ini: ${st} • Tipe: ${item.nama_tipe || "Kamar"}`,
          time: String(item.tanggal_check_in || "Baru saja").slice(0, 10),
          icon: CalendarCheck,
          color: "bg-purple-50 text-purple-600",
        };
      });

    return recentBookings;
  }, [reservations]);

  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navigation={navigation}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        user={user}
      />

      <CustomAlert
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
      />

      <main className="flex-1 overflow-x-hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button className="text-slate-600 hover:text-slate-900 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div>
              <div className="text-[11px] font-medium text-slate-400">
                Hotel Management / <span className="text-slate-600">{activeMenu}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{activeMenu}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Cari sesuatu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>

            <button
              onClick={() =>
                setAlertConfig({
                  isOpen: true,
                  title: "Info Reservasi Sistem",
                  message: `Terdapat ${reservations.length} total reservasi di sistem.`,
                  type: "success",
                })
              }
              className="relative rounded-xl border border-slate-200/80 bg-slate-50 p-2.5 text-slate-600 hover:bg-slate-100"
            >
              <Bell size={18} />
              {reservations.length > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 hover:text-red-700 transition"
            >
              <LogOut size={16} />
              Keluar (Logout)
            </button>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white uppercase">
                {(user?.nama || user?.name || "AD").slice(0, 2)}
              </div>
              <div className="hidden text-left md:block">
                <strong className="block text-xs font-semibold capitalize text-slate-900">
                  {user?.nama || user?.name || "Admin Hotel"}
                </strong>
                <span className="block text-[10px] capitalize text-slate-400">
                  {user?.role || "Administrator"}
                </span>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>
        </header>

        <section className="space-y-8 p-6 md:p-8">
          {activeMenu === "Dashboard" ? (
            <>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">OVERVIEW HOTEL</span>
                  <h1 className="text-2xl font-bold text-slate-900">
                    Selamat Datang, {user?.nama || user?.name || "Admin"}!
                  </h1>
                  <p className="text-sm text-slate-500">Berikut ringkasan aktivitas Hotel Grand Nusantara hari ini.</p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm">
                  <CalendarDays size={16} className="text-blue-600" />
                  <span>{todayFormatted}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {statistics.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}>
                          <Icon size={20} />
                        </div>
                        <button className="text-slate-400 hover:text-slate-600">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500">{item.title}</p>
                        <h2 className="text-2xl font-bold text-slate-900">{item.value}</h2>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`inline-flex items-center font-bold ${item.positive ? "text-emerald-600" : "text-red-500"}`}>
                          {item.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {item.change}
                        </span>
                        <span className="text-slate-400">{item.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Statistik Reservasi</h3>
                      <p className="text-xs text-slate-500">Ringkasan reservasi hotel berdasarkan periode.</p>
                    </div>
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 focus:outline-none"
                    >
                      <option>7 Hari Terakhir</option>
                      <option>30 Hari Terakhir</option>
                      <option>90 Hari Terakhir</option>
                    </select>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">{periodFilteredReservations.length}</h2>
                    <span className="text-xs font-medium text-emerald-600">
                      Total reservasi dalam {period.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex h-48 items-end gap-4 pt-4">
                    <div className="flex h-full flex-col justify-between border-r border-slate-100 pr-2 text-[10px] text-slate-400">
                      <span>Max</span>
                      <span>75%</span>
                      <span>50%</span>
                      <span>25%</span>
                      <span>0</span>
                    </div>
                    <div className="flex h-full flex-1 items-end justify-between gap-2">
                      {dynamicChartData.map((item) => (
                        <div key={item.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                          <div
                            className={`w-full max-w-[36px] rounded-t-lg transition-all ${item.isPeak ? "bg-blue-600" : "bg-blue-100 hover:bg-blue-200"
                              }`}
                            style={{ height: `${item.heightPercent}%` }}
                            title={`${item.day}: ${item.count} reservasi`}
                          />
                          <span className="text-xs font-medium text-slate-500">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Status Kamar</h3>
                      <p className="text-xs text-slate-500">Kondisi kamar hotel saat ini.</p>
                    </div>
                    <MoreHorizontal size={18} className="text-slate-400" />
                  </div>
                  <div className="flex justify-center py-4">
                    <div className="flex justify-center py-4">
                      <div
                        className="relative flex h-36 w-36 items-center justify-center rounded-full shadow-inner transition-all duration-500"
                        style={{ background: donutGradient }}
                      >
                        <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white text-center shadow-sm">
                          <h2 className="text-2xl font-extrabold text-slate-900">{totalKamar}</h2>
                          <span className="text-[10px] font-semibold uppercase text-slate-400">Total Kamar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span className="text-slate-600">Tersedia</span>
                      </div>
                      <strong className="text-slate-900">{kamarTersedia}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                        <span className="text-slate-600">Terisi</span>
                      </div>
                      <strong className="text-slate-900">{kamarTerisi}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <span className="text-slate-600">Dibersihkan / Maintenance</span>
                      </div>
                      <strong className="text-slate-900">{kamarMaintenance}</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Data status kamar diperbarui hari ini.</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Reservasi Terbaru</h3>
                    <p className="text-xs text-slate-500">Daftar pemesanan kamar terbaru dari tamu hotel.</p>
                  </div>
                  <button
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    onClick={() => setActiveMenu("Reservasi")}
                  >
                    Lihat Semua <ArrowUpRight size={14} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">ID RESERVASI</th>
                        <th className="px-4 py-3">NAMA TAMU</th>
                        <th className="px-4 py-3">TIPE KAMAR</th>
                        <th className="px-4 py-3">NO. KAMAR</th>
                        <th className="px-4 py-3">CHECK_IN</th>
                        <th className="px-4 py-3">CHECK_OUT</th>
                        <th className="px-4 py-3">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isLoading ? (
                        <tr>
                          <td colSpan="7" className="px-4 py-6 text-center text-xs text-slate-400">
                            Memuat data reservasi...
                          </td>
                        </tr>
                      ) : mappedRecentReservations.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-4 py-6 text-center text-xs text-slate-400">
                            Belum ada transaksi reservasi.
                          </td>
                        </tr>
                      ) : (
                        mappedRecentReservations.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-medium text-blue-600">#{item.id}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                                  {item.initials}
                                </div>
                                <strong className="text-slate-900">{item.guest}</strong>
                              </div>
                            </td>
                            <td className="px-4 py-3">{item.room}</td>
                            <td className="px-4 py-3">{item.number}</td>
                            <td className="px-4 py-3">{item.checkin}</td>
                            <td className="px-4 py-3">{item.checkout}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(item.status)}`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Aktivitas Terbaru</h3>
                    <p className="text-xs text-slate-500">Aktivitas operasional Hotel Grand Nusantara.</p>
                  </div>
                  <Clock size={18} className="text-slate-400" />
                </div>
                <div className="divide-y divide-slate-100">
                  {dynamicActivities.length === 0 ? (
                    <p className="py-4 text-center text-xs text-slate-400">Belum ada aktivitas terbaru.</p>
                  ) : (
                    dynamicActivities.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={index} className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.color}`}>
                              <Icon size={18} />
                            </div>
                            <div>
                              <strong className="block text-xs font-semibold text-slate-900">{item.title}</strong>
                              <p className="text-[11px] text-slate-400">{item.description}</p>
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-400">{item.time}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <footer className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-400">
                <span>© 2026 Hotel Grand Nusantara.</span>
                <span>Hotel Management System</span>
              </footer>
            </>
          ) : (
            <ManagementPage activeMenu={activeMenu} search={search} rooms={rooms} setRooms={setRooms} />
          )}
        </section>
      </main>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}