import React, { useState, useEffect } from "react";
import EditRoom from "./EditRoom";
import CustomAlert from "../common/CustomAlert";
import { Plus, Save, Pencil, Trash2 } from "lucide-react";
import { RoomServices } from "../../services/RoomServices";
import { BookingServices } from "../../services/BookingServices";

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

  // Sinkronisasi status kamar dengan tabel reservasi aktif (jika DB baru di-truncate)
  useEffect(() => {
    const syncRoomStatuses = async () => {
      if (!rooms.length || !setRooms) return;
      try {
        const bookings = await BookingServices.getAllBookings();
        const bookingList = Array.isArray(bookings) ? bookings : bookings?.data || [];

        const activeRoomIds = new Set(
          bookingList
            .filter((b) =>
              ["pending", "confirmed", "check_in"].includes(
                String(b.status_reservasi || b.status || "").toLowerCase()
              )
            )
            .map((b) => String(b.id_kamar))
        );

        let hasMismatch = false;
        const synced = rooms.map((room) => {
          const roomId = String(room.id_kamar || room.id);
          const rawStatus = String(room.status || "available").toLowerCase();

          if (["maintenance", "cleaning", "dibersihkan"].includes(rawStatus)) {
            return room;
          }

          const shouldBeOccupied = activeRoomIds.has(roomId);
          const isCurrentlyOccupied = ["occupied", "terisi"].includes(rawStatus);

          if (!shouldBeOccupied && isCurrentlyOccupied) {
            hasMismatch = true;
            // Otomatis kembalikan status kamar sisa truncate ke 'available' di DB
            RoomServices.updateRoom?.(roomId, { ...room, status: "available" }).catch(() => {});
            return { ...room, status: "available" };
          }

          if (shouldBeOccupied && !isCurrentlyOccupied) {
            hasMismatch = true;
            return { ...room, status: "occupied" };
          }

          return room;
        });

        if (hasMismatch) {
          setRooms(synced);
        }
      } catch (err) {
        console.error("Failed to sync room statuses with bookings:", err);
      }
    };

    syncRoomStatuses();
  }, [rooms.length]);

  // Room Type Mapping Helper (disamakan dengan RoomDetail.jsx)
  const getTipeKamarName = (id) => {
    const types = {
      1: "Standard Room",
      2: "Superior Room",
      3: "Deluxe Room",
      4: "Executive Club",
      5: "Suite Room",
      6: "Presidential Suite",
    };
    return types[id] || "Standard Room";
  };

  // Add Room Handler
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
        "Room Added!",
        `Room #${roomForm.number} has been added to the database.`,
        "success"
      );
      setShowRoomForm(false);
      setRoomForm({ number: "", typeId: "1", status: "available" });
      if (fetchRooms) fetchRooms();
    } catch (error) {
      console.error("Failed to add room:", error);
      showAlert(
        "Failed to Add Room!",
        error.message || "An error occurred while adding the room to the database.",
        "error"
      );
    }
  };

  // Open Edit Form Handler
  const handleEditClick = (room) => {
    setSelectedRoom(room);
    setShowEditRoom(true);
  };

  // Save Edit Handler (PUT)
  const handleSaveRoom = async (updatedData) => {
    const roomId = updatedData.id_kamar || updatedData.id;

    if (!roomId) {
      showAlert("Invalid Data!", "Room ID is invalid or not found.", "error");
      return;
    }

    try {
      if (RoomServices.updateRoom) {
        await RoomServices.updateRoom(roomId, updatedData);
      }

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
        "Room Updated!",
        `Room #${updatedData.nomor_kamar || updatedData.number} has been updated successfully.`,
        "success"
      );
      setShowEditRoom(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error("Failed to update room:", error);
      showAlert(
        "Update Failed!",
        error.message || "Failed to save room updates to the database.",
        "error"
      );
      if (fetchRooms) fetchRooms();
    }
  };

  // Delete Room Handler
  const handleDeleteRoom = async (room) => {
    const roomId = room.id_kamar || room.id;
    const roomNum = room.nomor_kamar || room.number;

    if (!window.confirm(`Are you sure you want to delete Room #${roomNum}?`)) return;

    try {
      if (RoomServices.deleteRoom) {
        await RoomServices.deleteRoom(roomId);
      }
      showAlert("Room Deleted!", `Room #${roomNum} has been removed from the system.`, "success");
      if (fetchRooms) fetchRooms();
    } catch (error) {
      console.error("Failed to delete room:", error);
      showAlert(
        "Delete Failed!",
        error.message || "Failed to delete the room from the database.",
        "error"
      );
    }
  };

  const enrichedRooms = rooms.map((room) => ({
    ...room,
    nama_tipe: room.nama_tipe || getTipeKamarName(room.id_tipe_kamar),
  }));

  const dataList =
    typeof filtered === "function"
      ? filtered(enrichedRooms, ["nomor_kamar", "status", "nama_tipe"])
      : enrichedRooms;

  return (
    <>
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
          {/* HEADER & ADD BUTTON */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Room List</h3>
              <p className="text-xs text-slate-500">Manage hotel room information and availability status.</p>
            </div>
            <button
              onClick={() => {
                setSelectedRoom(null);
                setRoomForm({ number: "", typeId: "1", status: "available" });
                setShowRoomForm(!showRoomForm);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={15} /> Add Room
            </button>
          </div>

          {/* ADD ROOM FORM */}
          {showRoomForm && (
            <form
              onSubmit={submitRoom}
              className="grid grid-cols-1 gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-5 sm:grid-cols-3"
            >
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Room Number</label>
                <input
                  required
                  value={roomForm.number}
                  onChange={(e) => setRoomForm({ ...roomForm, number: e.target.value })}
                  placeholder="Example: 104"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Room Type</label>
                <select
                  value={roomForm.typeId}
                  onChange={(e) => setRoomForm({ ...roomForm, typeId: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                >
                  <option value="1">Standard Room</option>
                  <option value="2">Superior Room</option>
                  <option value="3">Deluxe Room</option>
                  <option value="4">Executive Club</option>
                  <option value="5">Suite Room</option>
                  <option value="6">Presidential Suite</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <Save size={14} className="mr-1 inline" /> Save to DB
                </button>
                <button
                  type="button"
                  onClick={() => setShowRoomForm(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* ROOM STATISTICS SUMMARY (4 Cards: Available, Occupied, Cleaning, Maintenance) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Available Rooms",
                value: rooms.filter((r) =>
                  ["available", "ready", "tersedia"].includes(String(r.status).toLowerCase())
                ).length,
                color: "text-emerald-600",
              },
              {
                label: "Occupied Rooms",
                value: rooms.filter((r) =>
                  ["occupied", "terisi"].includes(String(r.status).toLowerCase())
                ).length,
                color: "text-blue-600",
              },
              {
                label: "Cleaning",
                value: rooms.filter((r) =>
                  ["cleaning", "dibersihkan"].includes(String(r.status).toLowerCase())
                ).length,
                color: "text-amber-600",
              },
              {
                label: "Maintenance",
                value: rooms.filter(
                  (r) => String(r.status).toLowerCase() === "maintenance"
                ).length,
                color: "text-red-600",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">{item.label}</p>
                <h2 className={`mt-1 text-2xl font-bold ${item.color}`}>{item.value}</h2>
              </div>
            ))}
          </div>

          {/* ROOMS TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">ROOM NO.</th>
                  <th className="px-4 py-3">ROOM TYPE</th>
                  <th className="px-4 py-3">STATUS</th>
                  <th className="px-4 py-3">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-xs text-slate-400">
                      No room records found in the database.
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
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              typeof getStatusBadgeClass === "function"
                                ? getStatusBadgeClass(statusKamar)
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {statusKamar}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditClick(room)}
                              className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(room)}
                              className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                            >
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