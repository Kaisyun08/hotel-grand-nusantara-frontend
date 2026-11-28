import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Footer from '../components/common/Footer';
import Loading from '../components/common/Loading';
import CustomAlert from '../components/common/CustomAlert';
import BookingForm from '../components/BookingForm';
import { TipeKamarService } from '../services/TipeKamarServices';
import { hotelRooms } from '../data/hotelRooms';
import { formatIDR, nightsBetween } from '../utils/formatters';
import { BookingServices } from '../services/BookingServices';

// Helper Pemeta Nama/ID Backend MySQL ke Key hotelRooms.js
const getLocalRoomData = (backendData, fallbackKey = 'standardRoom') => {
  const raw = Array.isArray(backendData)
    ? backendData[0]
    : backendData?.data || backendData;

  if (!raw) {
    return hotelRooms[fallbackKey] || hotelRooms.standardRoom;
  }

  const idMap = {
    1: 'standardRoom',
    2: 'superiorRoom',
    3: 'deluxeRoom',
    4: 'executiveRoom',
    5: 'suiteRoom',
    6: 'presidentialRoom',
  };

  const rawName = String(raw.nama_tipe || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  let targetKey = idMap[raw.id_tipe_kamar];

  if (!targetKey) {
    if (rawName.includes('standard')) targetKey = 'standardRoom';
    else if (rawName.includes('superior')) targetKey = 'superiorRoom';
    else if (rawName.includes('deluxe')) targetKey = 'deluxeRoom';
    else if (rawName.includes('executive')) targetKey = 'executiveRoom';
    else if (rawName.includes('presidential')) targetKey = 'presidentialRoom';
    else if (rawName.includes('suite')) targetKey = 'suiteRoom';
    else targetKey = fallbackKey;
  }

  const baseLocalData =
    hotelRooms[targetKey] || hotelRooms[fallbackKey] || hotelRooms.standardRoom;

  return {
    ...baseLocalData,
    id_tipe_kamar: raw.id_tipe_kamar,
    name: baseLocalData.name || raw.nama_tipe,
    price: Number(raw.harga || baseLocalData.price),
    maxGuests: Number(raw.kapasitas || baseLocalData.maxGuests),
  };
};

export default function RoomDetail() {
  const [searchParams, setSearchParams] = useSearchParams();
  const roomTypeIdFromUrl = searchParams.get('id') || '1';
  const typeFromUrl = searchParams.get('type');
  const selectedType =
    typeFromUrl && hotelRooms[typeFromUrl] ? typeFromUrl : 'standardRoom';

  const [currentRoom, setCurrentRoom] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('transfer');

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);

    TipeKamarService.getTipeKamarById(roomTypeIdFromUrl)
      .then((backendData) => {
        const mergedData = getLocalRoomData(backendData, selectedType);
        setCurrentRoom(mergedData);
      })
      .catch((err) => {
        console.error('Backend offline/404, menggunakan full data lokal:', err);
        const fallbackLocal = hotelRooms[selectedType] || hotelRooms.standardRoom;
        setCurrentRoom(fallbackLocal);
      })
      .finally(() => setIsLoading(false));
  }, [roomTypeIdFromUrl, selectedType]);

  const roomData =
    currentRoom ||
    hotelRooms[selectedType] ||
    hotelRooms.standardRoom || {
      price: 500000,
      name: 'Standard Room',
      maxGuests: 2,
      images: [],
    };

  const rawNights = nightsBetween(checkIn, checkOut);
  const nights = Number.isNaN(rawNights) || rawNights < 0 ? 0 : rawNights;
  const total = nights * (roomData.price || 0);

  const handleTypeChange = (typeKey) => {
    const idMap = {
      standardRoom: '1',
      superiorRoom: '2',
      deluxeRoom: '3',
      executiveRoom: '4',
      executive: '4',
      suiteRoom: '5',
      suite: '5',
      presidentialRoom: '6',
    };
    const targetId = idMap[typeKey] || '1';

    setSearchParams({ id: targetId, type: typeKey });
    setActiveImage(0);

    const targetMaxGuests = hotelRooms[typeKey]?.maxGuests || 2;
    if (Number(guests) > targetMaxGuests) {
      setGuests(String(targetMaxGuests));
    }
  };

  const handleCheckIn = (value) => {
    setCheckIn(value);
    if (checkOut && value && checkOut <= value) setCheckOut('');
  };
  const handleCheckOut = (value) => {
    setCheckOut(value);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (nights < 1) {
      setAlertConfig({
        isOpen: true,
        title: 'Tanggal Tidak Valid',
        message: 'Tanggal check-out harus setelah tanggal check-in.',
        type: 'error',
      });
      return;
    }

    const currentUser = JSON.parse(sessionStorage.getItem('user') || 'null');
    const idTamu = currentUser?.id_tamu || currentUser?.id_user || currentUser?.id;

    if (!currentUser || !idTamu) {
      navigate('/login', {
        state: {
          from: `/room-detail?id=${roomData?.id_tipe_kamar || roomTypeIdFromUrl}&type=${selectedType}`,
          booking: {
            type: selectedType,
            typeId: roomData?.id_tipe_kamar || roomTypeIdFromUrl,
            checkIn,
            checkOut,
            guests,
            paymentMethod,
          },
        },
      });
      return;
    }

    const targetTipeId = Number(roomData?.id_tipe_kamar || roomTypeIdFromUrl);

    const bookingPayload = {
      id_tamu: Number(idTamu),
      id_tipe_kamar: targetTipeId,
      id_kamar: Number(roomData?.id_kamar || targetTipeId),
      tanggal_check_in: checkIn,
      tanggal_check_out: checkOut,
      status_reservasi: 'pending',
      total_biaya: total,
      metode: paymentMethod,
      metode_pembayaran: paymentMethod,
      status_verifikasi: 'pending',
    };

    try {
      setIsLoading(true);
      await BookingServices.createBooking(bookingPayload);
      setAlertConfig({
        isOpen: true,
        title: 'Reservasi Berhasil!',
        message: `Tipe: ${roomData.name}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nNight: ${nights}\nGuest: ${guests}\nMetode Bayar: ${paymentMethod === 'cash' ? 'Bayar di Tempat (Cash)' : 'Transfer Bank'}\nTotal: ${formatIDR(total)}`,
        type: 'success',
      });
    } catch (error) {
      console.error('Gagal memproses pemesanan:', error);
      setAlertConfig({
        isOpen: true,
        title: 'Reservasi Gagal',
        message: error.message || 'Terjadi kesalahan saat menyimpan pemesanan ke server.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loading message="Menyiapkan pilihan kamar untuk Anda..." />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 antialiased font-sans flex flex-col justify-between">
      <CustomAlert
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => {
          const isSuccess = alertConfig.type === 'success';
          setAlertConfig({ ...alertConfig, isOpen: false });
          if (isSuccess) navigate('/my-bookings');
        }}
      />

      <main className="flex-1">
        {/* Room type tabs */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 flex space-x-8 overflow-x-auto">
            <Link
              to="/"
              className="py-4 px-1 text-sm font-semibold text-gray-500 hover:text-blue-600 whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 border-b-2 border-transparent hover:border-blue-600"
            >
              ← Home
            </Link>
            <div className="h-4 w-[1px] bg-gray-300 flex-shrink-0" />
            {Object.entries(hotelRooms).map(([key, room]) => (
              <button
                key={key}
                role="tab"
                aria-selected={selectedType === key}
                onClick={() => handleTypeChange(key)}
                className={`py-4 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-all duration-200 ${selectedType === key
                    ? 'border-amber-600 text-amber-700 font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {room.tabLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div>
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-2 tracking-wide uppercase">
                    5-Star Luxury Experience
                  </span>
                  <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
                    {roomData.name}
                  </h1>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                  <span className="text-amber-500 text-xl font-bold">
                    ★ {roomData.rating?.toFixed(1) || '5.0'}
                  </span>
                  <span className="text-gray-400 text-xs">
                    ({roomData.reviewsCount || 0} Review)
                  </span>
                </div>
              </div>

              {/* Gallery */}
              <div className="space-y-3">
                <div className="relative h-[260px] sm:h-[440px] w-full rounded-2xl overflow-hidden shadow-md bg-gray-200">
                  <img
                    className="w-full h-full object-cover transition-all duration-500 ease-in-out"
                    src={roomData.images?.[activeImage] || roomData.images?.[0]}
                    alt={`${roomData.name}, foto ${activeImage + 1}`}
                  />
                </div>

                <div className="flex gap-3 overflow-x-auto pb-1">
                  {roomData.images?.map((imgUrl, index) => (
                    <button
                      key={imgUrl}
                      onClick={() => setActiveImage(index)}
                      className={`relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === index
                          ? 'border-amber-600 scale-95 shadow-sm'
                          : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${roomData.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick specs */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  {[
                    ['CAPACITY', `${roomData.maxGuests} Guest`],
                    ['WIDTH', roomData.features?.size || '36 m²'],
                    ['TYPE BED', roomData.features?.bed || 'King Bed'],
                    ['VIEW', roomData.features?.view || 'City View'],
                  ].map(([label, value]) => (
                    <div key={label} className="md:border-r md:border-gray-100 md:last:border-0">
                      <dt className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                        {label}
                      </dt>
                      <dd className="font-medium text-gray-800 text-sm sm:text-base">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Description and amenities */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-serif font-bold mb-2">Description</h2>
                <p className="text-gray-600 mb-5 leading-relaxed">
                  {roomData.description}
                </p>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Facility</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                  {roomData.amenities?.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-amber-600" aria-hidden="true">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right column: booking form component */}
            <BookingForm
              currentRoom={roomData}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              nights={nights}
              total={total}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onCheckInChange={handleCheckIn}
              onCheckOutChange={handleCheckOut}
              onGuestsChange={setGuests}
              onSubmit={handleBookingSubmit}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}