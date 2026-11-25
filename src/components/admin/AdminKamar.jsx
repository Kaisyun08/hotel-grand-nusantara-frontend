import React, { useState } from "react";
import EditRoom from "./EditRoom";
import CustomAlert from "../common/CustomAlert";
import { Plus, Save, Pencil, Trash2 } from "lucide-react";
import { RoomServices } from "../../services/RoomServices";

export default function AdminKamar({
  rooms = [],
  setRooms,
  filtered,
  getStatusBadgeClass,
  fetchRooms,
}) {
  const [showEditRoom, setShowEditRoom] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [roomForm, setRoomForm] = useState({
    number: "",
    typeId: "1",
    status: "available",
  });

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const showAlert = (title, message, type = "success") => {
    setAlertConfig({ isOpen: true, title, message, type });
  };

  // Helper Pemetaan Nama Tipe Kamar jika backend hanya mengirim ID
  const getTipeKamarName = (id) => {
    const types = {
      1: "Suite Room",
      2: "Superior Room",
      3: "Deluxe Room",
      4: "Executive Club",
      5: "Presidential suite",
    };
    return types[id] || "Superior Room";
  };

  // Handler Tambah Kamar
  const submitRoom = async (e) => {
    e.preventDefault();
    try {
      if (RoomServices.createRoom) {
        await RoomServices.createRoom({
          id_hotel: 1,
          nomor_kamar: roomForm.number,
          id_tipe_kamar: Number(roomForm.typeId),
          status: roomForm.status,
        });
      }
      showAlert(
        "Kamar Ditambahkan!",
        `Kamar #${roomForm.number} berhasil ditambahkan ke database.`,
        "success"
      );
      setShowRoomForm(false);
      setRoomForm({ number: "", typeId: "1", status: "available" });
      if (fetchRooms) fetchRooms();
    } catch (error) {
      console.error("Gagal menambah kamar:", error);
      showAlert(
        "Gagal Menambah Kamar!",
        error.message || "Terjadi kesalahan saat menambahkan kamar ke database.",
        "error"
      );
    }
  };

  // Handler Buka Form Edit
  const handleEditClick = (room) => {
    setSelectedRoom(room);
    setShowEditRoom(true);
  };

  // Handler Simpan Edit (PUT)
  const handleSaveRoom = async (updatedData) => {
    const roomId = updatedData.id_kamar || updatedData.id;

    if (!roomId) {
      showAlert("Data Tidak Valid!", "ID Kamar tidak valid atau tidak ditemukan.", "error");
      return;
    }

    try {
      if (RoomServices.updateRoom) {
        await RoomServices.updateRoom(roomId, updatedData);
      }

      // Optimistic UI Update
      if (setRooms) {
        setRooms((prev) =>
          prev.map((r) => {
            const currentId = r.id_kamar || r.id;
            if (currentId === roomId) {
              return {
                ...r,
                ...updatedData,
                nomor_kamar: updatedData.nomor_kamar || updatedData.number,
                status: updatedData.status,
              };
            }
            return r;
          })
        );
      }

      showAlert(
        "Data Kamar Diperbarui!",
        `Data Kamar #${updatedData.nomor_kamar || updatedData.number} berhasil diperbarui.`,
        "success"
      );
      setShowEditRoom(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error("Gagal mengupdate kamar:", error);
      showAlert(
        "Gagal Memperbarui!",
        error.message || "Gagal memperbarui data kamar ke database.",
        "error"
      );
      if (fetchRooms) fetchRooms();
    }
  };

  // Handler Hapus Kamar
  const handleDeleteRoom = async (room) => {
    const roomId = room.id_kamar || room.id;
    const roomNum = room.nomor_kamar || room.number;

    if (!window.confirm(`Yakin ingin menghapus Kamar #${roomNum}?`)) return;

    try {
      if (RoomServices.deleteRoom) {
        await RoomServices.deleteRoom(roomId);
      }
      showAlert("Kamar Dihapus!", `Kamar #${roomNum} berhasil dihapus dari sistem.`, "success");
      if (fetchRooms) fetchRooms();
    } catch (error) {
      console.error("Gagal menghapus kamar:", error);
      showAlert(
        "Gagal Menghapus!",
        error.message || "Gagal menghapus kamar dari database.",
        "error"
      );
    }
  };

  // Gabungkan nama_tipe hasil mapping ke setiap objek kamar agar bisa dicari lewat search bar
  const enrichedRooms = rooms.map((room) => ({
    ...room,
    nama_tipe: room.nama_tipe || getTipeKamarName(room.id_tipe_kamar)
  }))
  // Menyiapkan data list hasil pencarian
  const dataList =
    typeof filtered === "function"
      ? filtered(enrichedRooms, ["nomor_kamar", "status", "nama_tipe"])
      : enrichedRooms;

  return (
    <>
      {/* Komponen Notifikasi CustomAlert (diletakkan di luar kondisi EditRoom agar selalu aktif) */}
      <CustomAlert
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {showEditRoom && selectedRoom ? (
        <EditRoom
          room={selectedRoom}
          onSave={handleSaveRoom}
          onCancel={() => {
            setShowEditRoom(false);
            setSelectedRoom(null);
          }}
        />
      ) : (
        <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          {/* HEADER & TOMBOL TAMBAH */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Daftar Kamar</h3>
              <p className="text-xs text-slate-500">Kelola informasi dan status kamar hotel.</p>
            </div>
            <button
              onClick={() => {
                setSelectedRoom(null);
                setRoomForm({ number: "", typeId: "1", status: "available" });
                setShowRoomForm(!showRoomForm);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={15} /> Tambah Kamar
            </button>
          </div>

          {/* FORM TAMBAH KAMAR */}
          {showRoomForm && (
            <form onSubmit={submitRoom} className="grid grid-cols-1 gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-5 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Nomor Kamar</label>
                <input
                  required
                  value={roomForm.number}
                  onChange={(e) => setRoomForm({ ...roomForm, number: e.target.value })}
                  placeholder="Contoh: 104"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Tipe Kamar</label>
                <select
                  value={roomForm.typeId}
                  onChange={(e) => setRoomForm({ ...roomForm, typeId: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                >
                  <option value="1">Superior Room</option>
                  <option value="2">Deluxe Room</option>
                  <option value="3">Executive Room</option>
                  <option value="4">Suite Room</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                  <Save size={14} className="mr-1 inline" /> Simpan Ke DB
                </button>
                <button type="button" onClick={() => setShowRoomForm(false)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
                  Batal
                </button>
              </div>
            </form>
          )}

          {/* RINGKASAN STATISTIK KAMAR */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                label: "available room",
                value: rooms.filter((r) => String(r.status).toLowerCase() === "available" || String(r.status).toLowerCase() === "ready").length,
                color: "text-emerald-600",
              },
              {
                label: "Kamar Terisi",
                value: rooms.filter((r) => String(r.status).toLowerCase() === "terisi" || String(r.status).toLowerCase() === "occupied").length,
                color: "text-blue-600",
              },
              {
                label: "Maintenance",
                value: rooms.filter((r) => String(r.status).toLowerCase() === "maintenance" || String(r.status).toLowerCase() === "dibersihkan").length,
                color: "text-amber-600",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">{item.label}</p>
                <h2 className={`mt-1 text-2xl font-bold ${item.color}`}>{item.value}</h2>
              </div>
            ))}
          </div>

          {/* TABEL KAMAR */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">NO. KAMAR</th>
                  <th className="px-4 py-3">TIPE KAMAR</th>
                  <th className="px-4 py-3">STATUS</th>
                  <th className="px-4 py-3">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-xs text-slate-400">
                      Belum ada data kamar di database.
                    </td>
                  </tr>
                ) : (
                  dataList.map((room) => {
                    const roomId = room.id_kamar || room.id;
                    const noKamar = room.nomor_kamar || room.number;
                    const tipeKamar = room.nama_tipe || getTipeKamarName(room.id_tipe_kamar);
                    const statusKamar = room.status || "available";

                    return (
                      <tr key={roomId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{noKamar}</td>
                        <td className="px-4 py-3">{tipeKamar}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${typeof getStatusBadgeClass === "function" ? getStatusBadgeClass(statusKamar) : "bg-slate-100 text-slate-600"}`}>
                            {statusKamar}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => handleEditClick(room)} className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => handleDeleteRoom(room)} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}