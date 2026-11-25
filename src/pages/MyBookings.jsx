import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/common/Footer';
import Loading from '../components/common/Loading';
import CustomAlert from '../components/common/CustomAlert';
import { formatIDR } from '../utils/formatters';
import { Calendar, Clock, CheckCircle, XCircle, X, Menu } from 'lucide-react';
import { AuthServices } from '../services/AuthServices';
import { BookingServices } from '../services/BookingServices';

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        setIsLoading(true);
        const currentUser = AuthServices.getCurrentUser();
        setUser(currentUser);

        if (!currentUser) {
          navigate('/login');
          return;
        }

        const userId = currentUser?.id_tamu || currentUser?.id_user || currentUser?.id;
        const data = await BookingServices.getBookingsByUserId(userId);
        const bookingList = Array.isArray(data) ? data : (data?.data || []);
        setBookings(bookingList);
      } catch (error) {
        console.error("Gagal mengambil riwayat pesanan:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyBookings();
  }, [navigate]);

  const handleLogout = () => {
    AuthServices.logout();
    sessionStorage.removeItem('token');
    setUser(null);
    setMobileMenuOpen(false);

    setAlertConfig({
      isOpen: true,
      title: 'Logout Berhasil!',
      message: 'Berhasil keluar dari akun Anda.',
      type: 'success',
    });

    setTimeout(() => {
      navigate('/login');
    }, 1200);
  };

  // Diperbarui agar mendukung huruf kecil dari MySQL ('pending', 'confirmed', dll)
  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();

    if (s === 'confirmed' || s === 'check_in' || s === 'check_out') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
          <CheckCircle size={14} /> {s === 'confirmed' ? 'Dikonfirmasi' : s.replace('_', ' ')}
        </span>
      );
    }

    if (s === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
          <Clock size={14} /> Menunggu Verifikasi
        </span>
      );
    }

    if (s === 'cancelled' || s === 'dibatalkan') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 border border-red-200">
          <XCircle size={14} /> Dibatalkan
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
        {status || 'Pending'}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 antialiased font-sans flex flex-col justify-between">
      <CustomAlert
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
      />
      {/* NAVBAR KHUSUS My Booking */}
      <nav className="sticky top-0 z-50 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-4 md:px-8 max-w-7xl mx-auto">
          {/* BRAND LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-md">
              H
            </div>
            <span className="text-lg font-extrabold tracking-wide text-gray-900 md:text-xl">
              Grand Nusantara
            </span>
          </Link>

          {/* MENU DESKTOP */}
          <div className="hidden gap-8 text-sm font-semibold text-gray-600 md:flex">
            <Link to="/" className="transition hover:text-blue-600">
              Beranda
            </Link>
            <Link to="/room-list" className="text-blue-600 font-bold transition hover:text-blue-700">
              Kamar
            </Link>
            <Link to="/room-detail" className="transition hover:text-blue-600">
              Detail Kamar
            </Link>
          </div>

          {/* PROFIL / LOGIN */}
          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <>
                <Link to="/my-bookings" className="text-sm font-semibold text-gray-600 hover:text-blue-600">
                  Pesanan Saya
                </Link>
                <span className="text-sm font-medium text-gray-600">
                  Halo, <strong className="capitalize text-gray-900">{user.nama || user.name || 'Tamu'}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  Keluar
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="rounded-lg px-4 py-2 text-xs font-semibold text-gray-700 hover:text-blue-600">
                  Masuk
                </Link>
                <Link to="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-700">
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* HAMBURGER MOBILE */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* DROPDOWN MOBILE */}
        {mobileMenuOpen && (
          <div className="border-b border-gray-100 bg-white px-6 py-4 space-y-4 md:hidden shadow-lg">
            <div className="flex flex-col space-y-3 text-sm font-semibold text-gray-600">
              <Link to="/" className="transition hover:text-blue-600">Beranda</Link>
              <Link to="/room-list" className="text-blue-600">Kamar</Link>
              <Link to="/room-detail" className="transition hover:text-blue-600">Detail Kamar</Link>
            </div>
            <hr className="border-gray-100" />
            <div className="pt-2">
              {user ? (
                <div className="space-y-3">
                  <Link to="/my-bookings" className="block text-sm font-semibold text-gray-600">Pesanan Saya</Link>
                  <button onClick={handleLogout} className="w-full rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600">Keluar</button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" className="text-center rounded-lg border py-2 text-xs font-semibold">Masuk</Link>
                  <Link to="/register" className="text-center rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white">Daftar</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Pesanan Saya</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola dan lihat riwayat reservasi kamar hotel Anda di sini.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-800">Belum Ada Reservasi</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Anda belum memiliki riwayat pemesanan kamar saat ini.
            </p>
            <Link
              to="/room-list"
              className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-xs font-semibold text-white shadow-md hover:bg-blue-700 transition"
            >
              Cari & Pesan Kamar
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((item) => {
              // Pemetaan data MySQL ke variabel komponen
              const resId = item.id_reservasi || item.id;
              const roomTitle = item.nama_tipe || item.roomName || item.tipe_kamar || `Kamar Tipe #${item.id_kamar}`;
              const checkInDate = item.tanggal_check_in || item.checkIn || '-';
              const checkOutDate = item.tanggal_check_out || item.checkOut || '-';
              const totalPrice = item.total_biaya || item.totalPrice || 0;
              const statusRes = item.status_reservasi || item.status || 'pending';

              return (
                <div
                  key={resId}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-gray-400">
                        ID: #{resId}
                      </span>
                      {getStatusBadge(statusRes)}
                    </div>
                    <h2 className="text-xl font-serif font-bold text-gray-900">
                      {roomTitle}
                    </h2>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-1">
                      <div>
                        <span className="font-medium text-gray-400">Check-in:</span> {checkInDate}
                      </div>
                      <div>
                        <span className="font-medium text-gray-400">Check-out:</span> {checkOutDate}
                      </div>
                      {item.metode && (
                        <div>
                          <span className="font-medium text-gray-400">Metode Bayar:</span> <span className="capitalize">{item.metode}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                    <span className="text-xs text-gray-400">Total Biaya</span>
                    <span className="text-2xl font-extrabold text-blue-600">
                      {formatIDR(totalPrice)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}