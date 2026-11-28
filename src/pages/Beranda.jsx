import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import Loading from "../components/common/Loading";

function Beranda() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Otomatis mengambil nama user dari sessionStorage saat login
  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
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

  // Fungsi helper untuk pindah halaman ke /room-detail sambil membawa key tipe kamar
  const handleBookNow = (roomTypeKey) => {
    const idMap = {
      suiteRoom: "1",
      superiorRoom: "2",
      deluxeRoom: "3",
      executive: "4",
      presidentialRoom: "5",
    };
    const targetId = idMap[roomTypeKey] || "2";
    navigate(`/room-detail?id=${targetId}&type=${roomTypeKey}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      {/* Navbar */}
      <Navbar />

      {/* HERO SECTION BANNER */}
      <section
        id="beranda"
        className="relative flex min-h-[550px] flex-col justify-center bg-cover bg-center px-8 py-20 text-white bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945')]"
      >
        <div className="absolute inset-0 bg-slate-950/60" />

        <div className="relative z-10 mx-auto max-w-4xl text-center space-y-6">
          <span className="inline-block rounded-full bg-blue-500/30 px-4 py-1.5 text-xs font-semibold text-blue-200 border border-blue-400/30">
            Luxury Wrapped in Comfort
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl leading-tight">
            Welcome To <br /> Hotel Grand Nusantara
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-200 md:text-lg">
            Enjoy an unforgettable stay with breathtaking views, world-class amenities, and the finest service in the Nusantara tradition.
          </p>
          <div className="pt-4">
            <button
              onClick={() => handleBookNow("superiorRoom")}
              className="inline-block rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 active:scale-95"
            >
              Explore The Room
            </button>
          </div>
        </div>
      </section>

      {/* SECTION PILIHAN KAMAR */}
      <section id="kamar" className="mx-auto max-w-6xl px-8 py-16 scroll-mt-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Favorite Room Option</h2>
          <p className="mt-2 text-sm text-gray-500">Designed for your comfort while resting</p>
        </div>

        {/* Grid Kartu Kamar */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">

          {/* CARD 1: DELUXE ROOM */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
            <div>
              <img
                src="https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80"
                alt="Deluxe Room"
                className="h-48 w-full object-cover"
              />
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold text-gray-800">Deluxe Room</h3>
                <p className="text-xs text-gray-500 line-clamp-2">
                  Offers more spacious accommodations with an extra touch of luxury and a direct view of the pool from the room.
                </p>
              </div>
            </div>
            <div className="px-6 pb-6 pt-2 flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-blue-600">Rp 1.800.000</span>
                <span className="text-xs text-gray-400"> /night</span>
              </div>
              <button
                onClick={() => handleBookNow("deluxeRoom")}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                Book Now
              </button>
            </div>
          </div>

          {/* CARD 2: EXECUTIVE CLUB */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
            <div>
              <img
                src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80"
                alt="Executive Suite"
                className="h-48 w-full object-cover"
              />
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold text-gray-800">Executive Club</h3>
                <p className="text-xs text-gray-500 line-clamp-2">
                  Designed specifically for executives and high-end travelers, complete with access to an exclusive lounge.
                </p>
              </div>
            </div>
            <div className="px-6 pb-6 pt-2 flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-blue-600">Rp 2.700.000</span>
                <span className="text-xs text-gray-400"> /night</span>
              </div>
              <button
                onClick={() => handleBookNow("executive")}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                Book Now
              </button>
            </div>
          </div>

          {/* CARD 3: PRESIDENTIAL SUITE */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
            <div>
              <img
                src="https://images.unsplash.com/photo-1631049035182-249067d7618e?w=1200&q=80"
                alt="Presidential Suite"
                className="h-48 w-full object-cover"
              />
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold text-gray-800">Presidential Suite</h3>
                <p className="text-xs text-gray-500 line-clamp-2">
                  The pinnacle of luxury and privacy, featuring a dining room, a workspace, and personal services.
                </p>
              </div>
            </div>
            <div className="px-6 pb-6 pt-2 flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-blue-600">Rp 5.500.000</span>
                <span className="text-xs text-gray-400"> /night</span>
              </div>
              <button
                onClick={() => handleBookNow("presidentialRoom")}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                Book Now
              </button>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Beranda;
