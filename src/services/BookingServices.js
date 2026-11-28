const BASE_URL = 'http://192.168.1.103:3000/api';

export const BookingServices = {
  // 1. DIBUTUHKAN USER: Membuat Reservasi Baru (POST)
  createBooking: async (bookingData) => {
    try {
      const response = await fetch(`${BASE_URL}/reservasi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        throw new Error(errorResult.message || 'Gagal membuat reservasi');
      }

      const result = await response.json();
      return result.data ? result.data : result;
    } catch (error) {
      console.error('Error createBooking:', error);
      throw error;
    }
  },

  // 2. DIBUTUHKAN USER: Mengambil Riwayat Booking berdasarkan ID User (GET)
  getBookingsByUserId: async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/reservasi/user/${userId}`);
      if (!response.ok) {
        throw new Error('Gagal mengambil riwayat reservasi');
      }
      const result = await response.json();
      return Array.isArray(result) ? result : (result.data || []);
    } catch (error) {
      console.error(`Error getBookingsByUserId (${userId}):`, error);
      throw error;
    }
  },

  // 3. DIBUTUHKAN ADMIN: Mengambil Semua Reservasi Tamu (GET)
  getAllBookings: async () => {
    try {
      const response = await fetch(`${BASE_URL}/reservasi`);
      if (!response.ok) {
        throw new Error('Gagal mengambil semua data reservasi');
      }
      const result = await response.json();
      return Array.isArray(result) ? result : (result.data || []);
    } catch (error) {
      console.error('Error getAllBookings:', error);
      throw error;
    }
  },

  // 4. DIBUTUHKAN ADMIN: Update Status Reservasi (Check-In / Check-Out / Cancel) (PUT/PATCH)
  updateBookingStatus: async (bookingId, status) => {
    try {
      const response = await fetch(`${BASE_URL}/reservasi/${bookingId}`, {
        method: 'PUT', // Jika backend menggunakan PATCH, ganti menjadi 'PATCH'
        headers: {
          'Content-Type': 'application/json',
        },
        // Kirim kunci status_reservasi agar terbaca oleh req.body di Express
        body: JSON.stringify({
          status_reservasi: status,
          status: status // Dipasang sebagai fallback jika backend memakai req.body.status
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal memperbarui status reservasi');
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updateBookingStatus (${bookingId}):`, error);
      throw error;
    }
  },

  // 1. Ambil semua data pembayaran
  getAllPembayaran: async () => {
    try {
      const response = await fetch(`${BASE_URL}/pembayaran`);
      if (!response.ok) throw new Error('Gagal mengambil data pembayaran');
      return await response.json();
    } catch (error) {
      console.error('Error getAllPembayaran:', error);
      throw error;
    }
  },

  // 2. Update status verifikasi pembayaran ke backend MySQL
  updatePaymentStatus: async (id_pembayaran, status_verifikasi, id_reservasi) => {
    try {
      const response = await fetch(`${BASE_URL}/pembayaran/${id_pembayaran}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status_verifikasi: status_verifikasi,
          status: status_verifikasi, // Fallback aman untuk req.body backend
          id_reservasi: id_reservasi
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Gagal memperbarui status pembayaran');
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updatePaymentStatus (${id_pembayaran}):`, error);
      throw error;
    }
  },
};