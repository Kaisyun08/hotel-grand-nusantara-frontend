import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import CustomAlert from "../common/CustomAlert";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  // Ambil data user dari sessionStorage saat komponen dimuat
  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
    setMobileMenuOpen(false);

    // Tampilkan notifikasi CustomAlert
    setAlertConfig({
      isOpen: true,
      title: "Logout Berhasil!",
      message: "Anda telah berhasil keluar dari akun Anda.",
      type: "success",
    });

    // Beri jeda 1.2 detik agar alert terbaca sebelum pindah ke halaman login
    setTimeout(() => {
      navigate("/login");
    }, 1200);
  };

  return (
    <>
      {/* Modal CustomAlert diletakkan di luar <nav> agar tidak terpotong backdrop-blur */}
      <CustomAlert
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
      />

      <nav className="sticky top-0 z-50 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-4 md:px-8">
          {/* BRAND LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-md">
              H
            </div>
            <span className="text-lg font-extrabold tracking-wide text-gray-900 md:text-xl">
              Grand Nusantara
            </span>
          </Link>

          {/* NAVIGATION LINKS (DESKTOP) */}
          <div className="hidden gap-8 text-sm font-semibold text-gray-600 md:flex">
            <a href="#" className="text-blue-600 transition hover:text-blue-700">
<<<<<<< HEAD
              Beranda
            </a>
            <a href="#kamar" className="transition hover:text-blue-600">
              Kamar
            </a>
            <Link to="/room-detail" className="transition hover:text-blue-600">
              Detail Kamar
            </Link>
            <Link to="/room-list" className="transition hover:text-blue-600">
              List Kamar
=======
              Home
            </a>
            <a href="#kamar" className="transition hover:text-blue-600">
              Room
            </a>
            <Link to="/room-detail" className="transition hover:text-blue-600">
              Room Detail
            </Link>
            <Link to="/room-list" className="transition hover:text-blue-600">
              Room List
>>>>>>> origin/master
            </Link>
          </div>

          {/* PROFILE / ACTIONS (DESKTOP) */}
          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <>
                <Link
                  to="/my-bookings"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600"
                >
<<<<<<< HEAD
                  Pesanan Saya
                </Link>
                <span className="text-sm font-medium text-gray-600">
                  Halo, <strong className="capitalize text-gray-900">{user.nama || user.name || "Tamu"}</strong>
=======
                  
                </Link>
                <span className="text-sm font-medium text-gray-600">
                  Hello, <strong className="capitalize text-gray-900">{user.nama || user.name || "Tamu"}</strong>
>>>>>>> origin/master
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                >
<<<<<<< HEAD
                  Keluar
=======
                  Sign Out
>>>>>>> origin/master
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-gray-700 hover:text-blue-600"
                >
<<<<<<< HEAD
                  Masuk
=======
                  Sign In
>>>>>>> origin/master
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-700"
                >
<<<<<<< HEAD
                  Daftar
=======
                  Register
>>>>>>> origin/master
                </Link>
              </div>
            )}
          </div>

          {/* HAMBURGER BUTTON (MOBILE ONLY) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {mobileMenuOpen && (
          <div className="space-y-4 border-b border-gray-100 bg-white px-6 py-4 shadow-lg md:hidden">
            <div className="flex flex-col space-y-3 text-sm font-semibold text-gray-600">
              <a
                href="#"
                onClick={() => setMobileMenuOpen(false)}
                className="text-blue-600 transition hover:text-blue-700"
              >
<<<<<<< HEAD
                Beranda
=======
                Home
>>>>>>> origin/master
              </a>
              <a
                href="#kamar"
                onClick={() => setMobileMenuOpen(false)}
                className="transition hover:text-blue-600"
              >
<<<<<<< HEAD
                Kamar
=======
                Room
>>>>>>> origin/master
              </a>
              <Link
                to="/room-detail"
                onClick={() => setMobileMenuOpen(false)}
                className="transition hover:text-blue-600"
              >
<<<<<<< HEAD
                Detail Kamar
=======
                Room Detail
>>>>>>> origin/master
              </Link>
              <a
                href="#fasilitas"
                onClick={() => setMobileMenuOpen(false)}
                className="transition hover:text-blue-600"
              >
<<<<<<< HEAD
                Fasilitas
=======
                Facility
>>>>>>> origin/master
              </a>
              <a
                href="#kontak"
                onClick={() => setMobileMenuOpen(false)}
                className="transition hover:text-blue-600"
              >
<<<<<<< HEAD
                Kontak
=======
                Contact
>>>>>>> origin/master
              </a>
            </div>

            <hr className="border-gray-100" />

            {/* PROFILE / ACTIONS (MOBILE) */}
            <div className="pt-2">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User size={18} className="text-blue-600" />
                    <span>
<<<<<<< HEAD
                      Halo, <strong className="capitalize text-gray-900">{user.nama || user.name || "Tamu"}</strong>
=======
                      Hello, <strong className="capitalize text-gray-900">{user.nama || user.name || "Tamu"}</strong>
>>>>>>> origin/master
                    </span>
                  </div>
                  <Link
                    to="/my-bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-gray-600 hover:text-blue-600"
                  >
<<<<<<< HEAD
                    Pesanan Saya
=======
                    My Reservation
>>>>>>> origin/master
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2.5 text-xs font-semibold text-red-600"
                  >
                    <LogOut size={16} />
<<<<<<< HEAD
                    Keluar
=======
                    Sign Out
>>>>>>> origin/master
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-lg border border-gray-200 py-2.5 text-center text-xs font-semibold text-gray-700"
                  >
<<<<<<< HEAD
                    Masuk
=======
                    Sign In
>>>>>>> origin/master
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-lg bg-blue-600 py-2.5 text-center text-xs font-semibold text-white shadow-md"
                  >
<<<<<<< HEAD
                    Daftar
=======
                    Register
>>>>>>> origin/master
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}