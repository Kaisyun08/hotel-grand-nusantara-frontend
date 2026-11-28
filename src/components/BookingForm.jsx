import React, { useState, useEffect } from 'react';
import { formatIDR, today } from '../utils/formatters';
import { RoomServices } from '../services/RoomServices';

export default function BookingForm({
  currentRoom,
  checkIn,
  checkOut,
  guests,
  bed,
  nights,
  total,
  paymentMethod,
  onPaymentMethodChange,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onSubmit,
}) {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isChecking, setIsChecking] = useState(false);

  const roomId = currentRoom?.id_tipe_kamar || currentRoom?.id;

  // EFEK: Cek ketersediaan kamar ke Backend saat tanggal checkIn dan checkOut terisi
  useEffect(() => {
    if (roomId && checkIn && checkOut && nights > 0) {
      setIsChecking(true);
      RoomServices.getAvailableRooms(roomId, checkIn, checkOut)
        .then((data) => {
          setAvailableRooms(data);
        })
        .catch((err) => {
          console.error('Gagal mengecek ketersediaan kamar:', err);
        })
        .finally(() => {
          setIsChecking(false);
        });
    }
  }, [roomId, checkIn, checkOut, nights]);

  return (
    <aside className="lg:col-span-1">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md lg:sticky lg:top-20 space-y-4"
      >
        {/* PRICE HEADER */}
        <div>
          <span className="text-2xl font-bold text-gray-900">
            {formatIDR(currentRoom.price)}
          </span>
          <span className="text-gray-400 text-sm"> / Night</span>
        </div>

        {/* INPUT CHECK-IN */}
        <div>
          <label htmlFor="checkin" className="block text-xs font-semibold text-gray-600 mb-1">
            Check-in
          </label>
          <input
            id="checkin"
            type="date"
            required
            min={today()}
            value={checkIn}
            onChange={(e) => onCheckInChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* INPUT CHECK-OUT */}
        <div>
          <label htmlFor="checkout" className="block text-xs font-semibold text-gray-600 mb-1">
            Check-out
          </label>
          <input
            id="checkout"
            type="date"
            required
            min={checkIn || today()}
            value={checkOut}
            onChange={(e) => onCheckOutChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* JUMLAH TAMU */}
        <div>
          <label htmlFor="guests" className="block text-xs font-semibold text-gray-600 mb-1">
            Total Guest
          </label>
          <select
            id="guests"
            value={guests}
            onChange={(e) => onGuestsChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {Array.from({ length: currentRoom.maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} Guest
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="bed" className="block text-xs font-semibold text-gray-600 mb-1">
            Select Bed
          </label>
          <select
            id="bed"
            value={bed}
            onChange={(e) => onBedChange(e.target.value)}
            className='w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white'
          >
            <option value="king">Single Bed</option>
            <option value="twin">Twin Bed</option>
          </select>
        </div>

        {/* KOTAK METODE PEMBAYARAN */}
        <div>
          <label htmlFor="paymentMethod" className="block text-xs font-semibold text-gray-600 mb-1">
            Payment Method
          </label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => onPaymentMethodChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="transfer">Transfer Bank (VA / Qris)</option>
            <option value="cash">Cash (Cash when Check-in)</option>
          </select>
        </div>

        {/* STATUS KETERSEDIAAN DARI BACKEND */}
        {isChecking && (
          <p className="text-xs text-amber-600 animate-pulse font-medium">
            Checking room availability...
          </p>
        )}

        {/* RINCIAN HARGA */}
        {nights > 0 && (
          <div className="border-t border-gray-100 pt-4 text-sm space-y-2 bg-slate-50 p-3 rounded-xl">
            <div className="flex justify-between text-gray-600 text-xs">
              <span>
                {formatIDR(currentRoom.price)} × {nights} night
              </span>
              <span>{formatIDR(total)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 text-base">
              <span>Total Cost</span>
              <span className="text-amber-600">{formatIDR(total)}</span>
            </div>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl shadow-md transition-colors"
        >
          Book Now
        </button>
      </form>
    </aside>
  );
}