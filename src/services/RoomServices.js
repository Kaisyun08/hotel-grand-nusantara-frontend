const API_URL = "http://192.168.1.103:3000/api/kamar";

export const RoomServices = {
  // 1. Ambil semua unit kamar (Untuk Admin Dashboard)
  getAllRooms: async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Gagal mengambil data kamar");
      return await response.json();
    } catch (error) {
      console.error("Error getAllRooms:", error);
      throw error;
    }
  },

  // 2. Cek ketersediaan kamar kosong (Untuk User di RoomDetail/BookingForm)
  getAvailableRooms: async (roomTypeId, checkIn, checkOut) => {
    try {
      const response = await fetch(
        `${API_URL}?id_tipe_kamar=${roomTypeId}&checkIn=${checkIn}&checkOut=${checkOut}`
      );
      if (!response.ok) {
        throw new Error("Gagal mengecek ketersediaan kamar");
      }
      const result = await response.json();
      const list = Array.isArray(result) ? result : result.data || [];

      // Filter hanya kamar dengan status available & tipe yang sesuai
      return list.filter(
        (k) =>
          String(k.id_tipe_kamar) === String(roomTypeId) &&
          ["available", "occupied", "maintenance", "cleaning"].includes(
            String(k.status).toLowerCase()
          )
      );
    } catch (error) {
      console.error("Error getAvailableRooms:", error);
      throw error;
    }
  },

  // 3. Tambah unit kamar baru (Untuk Admin)
  createRoom: async (roomData) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomData),
      });
      if (!response.ok) throw new Error("Gagal menambah kamar");
      return await response.json();
    } catch (error) {
      console.error("Error createRoom:", error);
      throw error;
    }
  },

  // 4. Update status kamar (Untuk Admin)
  updateRoom: async (id_kamar, roomData) => {
    try {
      const response = await fetch(`${API_URL}/${id_kamar}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_hotel: roomData.id_hotel || 1,
          id_tipe_kamar: Number(roomData.id_tipe_kamar || roomData.typeId || 1),
          nomor_kamar: roomData.nomor_kamar || roomData.number,
          status: roomData.status || "available",
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Gagal memperbarui kamar di server");
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
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Gagal menghapus kamar");
      return await response.json();
    } catch (error) {
      console.error("Error deleteRoom:", error);
      throw error;
    }
  },
};