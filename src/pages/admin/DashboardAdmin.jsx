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
  { name: "Rooms", icon: BedDouble },
  { name: "Reservations", icon: CalendarDays },
  { name: "Guests", icon: Users },
  { name: "Payments", icon: CreditCard },
  { name: "Reports", icon: ChartNoAxesCombined },
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
  const [period, setPeriod] = useState("Last 7 Days");
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
      title: "Logged Out",
      message: "You have been signed out from the Admin dashboard.",
      type: "success",
    });

    setTimeout(() => {
      navigate("/login");
    }, 1200);
  };

  // Fetch Rooms & Reservations concurrently
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

      // Sort Rooms by room number / id_kamar (ASC)
      const sortedRooms = [...roomList].sort(
        (a, b) => Number(a.nomor_kamar || a.id_kamar || a.id) - Number(b.nomor_kamar || b.id_kamar || b.id)
      );

      // Sort Reservations by newest id_reservasi first (DESC)
      const sortedBookings = [...bookingList].sort(
        (a, b) => Number(b.id_reservasi || b.id) - Number(a.id_reservasi || a.id)
      );

      setRooms(sortedRooms);
      setReservations(sortedBookings);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = AuthServices.getCurrentUser();
    setUser(currentUser);
    fetchDashboardData();
  }, []);

  // Re-fetch when returning to Dashboard tab so data stays synced
  useEffect(() => {
    if (activeMenu === "Dashboard") {
      fetchDashboardData();
    }
  }, [activeMenu]);

  // 1. Room & Reservation Statistics
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) =>
    ["ready", "tersedia", "available"].includes(String(r.status || "").toLowerCase())
  ).length;
  const occupiedRooms = rooms.filter((r) =>
    ["occupied", "terisi"].includes(String(r.status || "").toLowerCase())
  ).length;
  const cleaningRooms = rooms.filter((r) =>
    ["cleaning", "dibersihkan"].includes(String(r.status || "").toLowerCase())
  ).length;
  const maintenanceRooms = rooms.filter((r) =>
    ["maintenance"].includes(String(r.status || "").toLowerCase())
  ).length;

  const availablePercent = totalRooms > 0 ? (availableRooms / totalRooms) * 100 : 0;
  const occupiedPercent = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
  const cleaningPercent = totalRooms > 0 ? (cleaningRooms / totalRooms) * 100 : 0;

  const donutGradient =
    totalRooms > 0
      ? `conic-gradient(
          #10b981 0% ${availablePercent}%,
          #2563eb ${availablePercent}% ${availablePercent + occupiedPercent}%,
          #f59e0b ${availablePercent + occupiedPercent}% ${availablePercent + occupiedPercent + cleaningPercent}%,
          #ef4444 ${availablePercent + occupiedPercent + cleaningPercent}% 100%
        )`
      : `conic-gradient(#e2e8f0 0% 100%)`;

  // Filter reservations by selected period dropdown
  const periodFilteredReservations = useMemo(() => {
    const daysLimit = period === "Last 7 Days" ? 7 : period === "Last 30 Days" ? 30 : 90;
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
      title: "Total Rooms",
      value: totalRooms.toString(),
      description: "All hotel rooms",
      icon: BedDouble,
      color: "bg-blue-50 text-blue-600",
      change: `${totalRooms} Units`,
      positive: true,
    },
    {
      title: "Available Rooms",
      value: availableRooms.toString(),
      description: "Ready for check-in",
      icon: DoorOpen,
      color: "bg-emerald-50 text-emerald-600",
      change: totalRooms ? `${Math.round((availableRooms / totalRooms) * 100)}%` : "0%",
      positive: true,
    },
    {
      title: "Occupied Rooms",
      value: occupiedRooms.toString(),
      description: "Currently occupied",
      icon: Hotel,
      color: "bg-amber-50 text-amber-600",
      change: totalRooms ? `${Math.round((occupiedRooms / totalRooms) * 100)}%` : "0%",
      positive: true,
    },
    {
      title: "Total Reservations",
      value: reservations.length.toString(),
      description: "Total incoming orders",
      icon: CalendarCheck,
      color: "bg-purple-50 text-purple-600",
      change: `${periodFilteredReservations.length} recent`,
      positive: true,
    },
  ];

  // 2. Dynamic Weekly Bar Chart Data (Mon - Sun)
  const dynamicChartData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    periodFilteredReservations.forEach((item) => {
      const rawDate = item.tanggal_check_in || item.checkin || item.created_at;
      if (!rawDate) return;
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        const dayName = days[d.getDay()];
        counts[dayName] = (counts[dayName] || 0) + 1;
      }
    });

    const orderedDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const maxCount = Math.max(...orderedDays.map((d) => counts[d]), 1);

    return orderedDays.map((day) => ({
      day,
      count: counts[day],
      heightPercent: counts[day] === 0 ? 8 : Math.min(100, Math.round((counts[day] / maxCount) * 100)),
      isPeak: counts[day] === maxCount && counts[day] > 0,
    }));
  }, [periodFilteredReservations]);

  // 3. Recent Reservations Table Data (Newest first)
  const mappedRecentReservations = useMemo(() => {
    return [...reservations]
      .sort((a, b) => Number(b.id_reservasi || b.id) - Number(a.id_reservasi || a.id))
      .map((item) => {
        const matchedRoom = rooms.find(
          (r) => String(r.id_kamar || r.id) === String(item.id_kamar)
        );
        const guestName = item.nama_lengkap || item.nama_tamu || `Guest #${item.id_tamu || "-"}`;
        const initials = guestName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        return {
          id: item.id_reservasi || item.id,
          guest: guestName,
          initials: initials || "GS",
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
      .slice(0, 5);
  }, [reservations, rooms, search]);

  // 4. Recent Activities Feed (Newest first)
  const dynamicActivities = useMemo(() => {
    const recentBookings = [...reservations]
      .sort((a, b) => Number(b.id_reservasi || b.id) - Number(a.id_reservasi || a.id))
      .slice(0, 4)
      .map((item) => {
        const st = String(item.status_reservasi || item.status || "pending").toLowerCase();
        const guestName = item.nama_lengkap || item.nama_tamu || `Guest #${item.id_tamu}`;
        const resId = item.id_reservasi || item.id;

        if (st === "check_in") {
          return {
            title: `Guest Check-in: ${guestName}`,
            description: `Reservation #${resId} has checked into the room.`,
            time: String(item.tanggal_check_in || "").slice(0, 10),
            icon: LogIn,
            color: "bg-emerald-50 text-emerald-600",
          };
        }
        if (st === "check_out") {
          return {
            title: `Guest Check-out: ${guestName}`,
            description: `Reservation #${resId} has completed their stay.`,
            time: String(item.tanggal_check_out || "").slice(0, 10),
            icon: LogOut,
            color: "bg-blue-50 text-blue-600",
          };
        }
        return {
          title: `New Reservation #${resId} (${guestName})`,
          description: `Current status: ${st} • Room Type: ${item.nama_tipe || "Room"}`,
          time: String(item.tanggal_check_in || "Just now").slice(0, 10),
          icon: CalendarCheck,
          color: "bg-purple-50 text-purple-600",
        };
      });

    return recentBookings;
  }, [reservations]);

  const todayFormatted = new Date().toLocaleDateString("en-US", {
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
            <button
              className="text-slate-600 hover:text-slate-900 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
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
                placeholder="Search anything..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>

            <button
              onClick={() =>
                setAlertConfig({
                  isOpen: true,
                  title: "System Reservation Info",
                  message: `There are currently ${reservations.length} total reservations in the system.`,
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
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-700"
            >
              <LogOut size={16} />
              Logout
            </button>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold uppercase text-white">
                {(user?.nama || user?.name || "AD").slice(0, 2)}
              </div>
              <div className="hidden text-left md:block">
                <strong className="block text-xs font-semibold capitalize text-slate-900">
                  {user?.nama || user?.name || "Hotel Admin"}
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
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    HOTEL OVERVIEW
                  </span>
                  <h1 className="text-2xl font-bold text-slate-900">
                    Welcome back, {user?.nama || user?.name || "Admin"}!
                  </h1>
                  <p className="text-sm text-slate-500">
                    Here is the summary of Hotel Grand Nusantara operations today.
                  </p>
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
                    <div
                      key={item.title}
                      className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
                    >
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
                        <span
                          className={`inline-flex items-center font-bold ${item.positive ? "text-emerald-600" : "text-red-500"
                            }`}
                        >
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
                      <h3 className="text-base font-semibold text-slate-900">Reservation Statistics</h3>
                      <p className="text-xs text-slate-500">
                        Hotel reservation summary by selected time period.
                      </p>
                    </div>
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 focus:outline-none"
                    >
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                      <option>Last 90 Days</option>
                    </select>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">
                      {periodFilteredReservations.length}
                    </h2>
                    <span className="text-xs font-medium text-emerald-600">
                      Total reservations in the {period.toLowerCase()}
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
                            title={`${item.day}: ${item.count} reservations`}
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
                      <h3 className="text-base font-semibold text-slate-900">Room Status</h3>
                      <p className="text-xs text-slate-500">Current hotel room conditions.</p>
                    </div>
                    <MoreHorizontal size={18} className="text-slate-400" />
                  </div>
                  <div className="flex justify-center py-4">
                    <div
                      className="relative flex h-36 w-36 items-center justify-center rounded-full shadow-inner transition-all duration-500"
                      style={{ background: donutGradient }}
                    >
                      <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white text-center shadow-sm">
                        <h2 className="text-2xl font-extrabold text-slate-900">{totalRooms}</h2>
                        <span className="text-[10px] font-semibold uppercase text-slate-400">
                          Total Rooms
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span className="text-slate-600">Available</span>
                      </div>
                      <strong className="text-slate-900">{availableRooms}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                        <span className="text-slate-600">Occupied</span>
                      </div>
                      <strong className="text-slate-900">{occupiedRooms}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <span className="text-slate-600">Cleaning</span>
                      </div>
                      <strong className="text-slate-900">{cleaningRooms}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                        <span className="text-slate-600">Maintenance</span>
                      </div>
                      <strong className="text-slate-900">{maintenanceRooms}</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Room status data updated today.</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Recent Reservations</h3>
                    <p className="text-xs text-slate-500">Latest room bookings from hotel guests.</p>
                  </div>
                  <button
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    onClick={() => setActiveMenu("Reservations")}
                  >
                    View All <ArrowUpRight size={14} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">RESERVATION ID</th>
                        <th className="px-4 py-3">GUEST NAME</th>
                        <th className="px-4 py-3">ROOM TYPE</th>
                        <th className="px-4 py-3">ROOM NO.</th>
                        <th className="px-4 py-3">CHECK-IN</th>
                        <th className="px-4 py-3">CHECK-OUT</th>
                        <th className="px-4 py-3">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isLoading ? (
                        <tr>
                          <td colSpan="7" className="px-4 py-6 text-center text-xs text-slate-400">
                            Loading reservation data...
                          </td>
                        </tr>
                      ) : mappedRecentReservations.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-4 py-6 text-center text-xs text-slate-400">
                            No reservation transactions found.
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
                              <span
                                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                                  item.status
                                )}`}
                              >
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
                    <h3 className="text-base font-semibold text-slate-900">Recent Activities</h3>
                    <p className="text-xs text-slate-500">
                      Operational activities at Hotel Grand Nusantara.
                    </p>
                  </div>
                  <Clock size={18} className="text-slate-400" />
                </div>
                <div className="divide-y divide-slate-100">
                  {dynamicActivities.length === 0 ? (
                    <p className="py-4 text-center text-xs text-slate-400">
                      No recent activities yet.
                    </p>
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
                              <strong className="block text-xs font-semibold text-slate-900">
                                {item.title}
                              </strong>
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
        <div
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}