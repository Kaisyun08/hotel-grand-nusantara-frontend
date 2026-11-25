// Sesuaikan URL ini dengan port/rute backend Express milik temanmu
const API_URL = 'http://10.7.7.155:3000/api/kamar';

export const RoomServices = {
  // 1. Ambil semua unit kamar (Untuk Admin Dashboard)
  getAllRooms: async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Gagal mengambil data kamar');
      return await response.json();
    } catch (error) {
      console.error('Error getAllRooms:', error);
      throw error;
    }
  },

  // 2. Cek ketersediaan kamar kosong (Untuk User di RoomDetail/BookingForm)
  getAvailableRooms: async (typeId, checkIn, checkOut) => {
    try {
      const response = await fetch(
        `${API_URL}/available?tipe_id=${typeId}&checkIn=${checkIn}&checkOut=${checkOut}`
      );
      if (!response.ok) throw new Error('Gagal mengecek ketersediaan kamar');
      return await response.json();
    } catch (error) {
      console.error('Error getAvailableRooms:', error);
      throw error;
    }
  },

  // 3. Tambah unit kamar baru (Untuk Admin)
  createRoom: async (roomData) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });
      if (!response.ok) throw new Error('Gagal menambah kamar');
      return await response.json();
    } catch (error) {
      console.error('Error createRoom:', error);
      throw error;
    }
  },

  // 4. Update status kamar (Untuk Admin)
  updateRoom: async (id_kamar, roomData) => {
    try {
      const response = await fetch(`${API_URL}/${id_kamar}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Sertakan id_hotel (bisa default 1 jika hotel tunggal)
          id_hotel: roomData.id_hotel || 1,

          // Kirim id_tipe_kamar dan nomor_kamar dengan fallback nama properti yang aman
          id_tipe_kamar: Number(roomData.id_tipe_kamar || roomData.typeId || 1),
          nomor_kamar: roomData.nomor_kamar || roomData.number,

          // Status kamar
          status: roomData.status || 'tersedia',
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Gagal memperbarui kamar di server');
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updateRoom (${id_kamar}):`, error);
      throw error;
    }
  },

  // 5. Hapus unit kamar (Untuk Admin)
  deleteRoom: async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Gagal menghapus kamar');
      return await response.json();
    } catch (error) {
      console.error('Error deleteRoom:', error);
      throw error;
    }
  },
};