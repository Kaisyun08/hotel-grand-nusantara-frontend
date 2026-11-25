import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/common/Footer';
import Loading from '../components/common/Loading';
import { hotelRooms } from '../data/hotelRooms';
import { formatIDR } from '../utils/formatters';
import { Menu, X, User, LogOut } from 'lucide-react';
import CustomAlert from '../components/common/CustomAlert';

export default function RoomList() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success',
    });

    useEffect(() => {
        const savedUser = sessionStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                setUser(null);
            }
        }

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('user');
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

    const roomsArray = Object.entries(hotelRooms).map(([key, data]) => ({
        key,
        ...data,
    }));

    const filteredRooms = roomsArray.filter((room) =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectRoom = (roomKey) => {
        const idMap = {
            suiteRoom: "1",
            superiorRoom: "2",
            deluxeRoom: "3",
            executive: "4",
            presidentialRoom: "5",
        }
        const targetId = idMap[roomKey] || '2';
        navigate(`/room-detail?id=${targetId}&type=${roomKey}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loading message="Menyiapkan pilihan kamar untuk Anda..." />
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
            {/* NAVBAR KHUSUS ROOM LIST */}
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

            {/* HEADER SECTION */}
            <div className="bg-slate-900 py-16 px-4 text-white text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Grand Nusantara Hotel
                </span>
                <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                    Semua Pilihan Kamar & Suite
                </h1>
                <p className="mt-2 text-sm text-slate-300 max-w-xl mx-auto">
                    Temukan akomodasi terbaik yang dirancang untuk kenyamanan dan pengalaman istirahat istimewa Anda.
                </p>

                {/* SEARCH BAR */}
                <div className="mt-6 max-w-md mx-auto">
                    <input
                        type="text"
                        placeholder="Cari tipe kamar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-md"
                    />
                </div>
            </div>

            {/* ROOM LIST GRID */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
                {filteredRooms.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        Kamar yang Anda cari tidak ditemukan.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredRooms.map((room) => (
                            <div
                                key={room.key}
                                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="relative h-56 w-full bg-gray-200 overflow-hidden">
                                        <img
                                            src={room.images[0]}
                                            alt={room.name}
                                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                        />
                                        <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-amber-400 text-xs font-bold px-2.5 py-1 rounded-lg">
                                            ★ {room.rating.toFixed(1)}
                                        </span>
                                    </div>

                                    <div className="p-6">
                                        <h2 className="text-xl font-serif font-bold text-gray-900">
                                            {room.name}
                                        </h2>
                                    </div>
                                </div>

                                <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-gray-50">
                                    <div>
                                        <span className="text-xs text-gray-400 block">Mulai dari</span>
                                        <span className="text-lg font-bold text-amber-600">
                                            {formatIDR(room.price)}
                                        </span>
                                        <span className="text-xs text-gray-400"> /malam</span>
                                    </div>
                                    <button
                                        onClick={() => handleSelectRoom(room.key)}
                                        className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-amber-600 shadow-md"
                                    >
                                        Lihat Detail
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}