import React, { useState, useEffect } from "react";
import { BookingServices } from "../../services/BookingServices";
import { RoomServices } from "../../services/RoomServices";
import CustomAlert from "../common/CustomAlert";

export default function AdminPembayaran({ filtered, formatRupiah }) {
  const [paymentData, setPaymentData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const showAlert = (title, message, type = "success") => {
    setAlertConfig({ isOpen: true, title, message, type });
  };

  const formatIDR =
    formatRupiah ||
    ((val) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(val || 0));

  // Helper mapping nama tipe kamar jika backend hanya mengirim id_tipe_kamar
  const getRoomTypeName = (id) => {
    const types = {
      1: "Suite Room",
      2: "Superior Room",
      3: "Deluxe Room",
      4: "Executive Club",
      5: "Presidential Suite",
    };
    return types[id] || "Standard Room";
  };

  // Helper menghitung durasi menginap (jumlah malam + rentang tanggal)
  const getStayDuration = (checkInRaw, checkOutRaw) => {
    if (!checkInRaw || !checkOutRaw) {
      return { nightsText: "-", dateRange: "-" };
    }

    const checkInStr = String(checkInRaw).slice(0, 10);
    const checkOutStr = String(checkOutRaw).slice(0, 10);

    const start = new Date(checkInStr);
    const end = new Date(checkOutStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { nightsText: "-", dateRange: `${checkInStr} → ${checkOutStr}` };
    }

    const diffTime = end.getTime() - start.getTime();
    const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

    return {
      nightsText: `${nights} ${nights === 1 ? "Night" : "Nights"}`,
      dateRange: `${checkInStr} → ${checkOutStr}`,
    };
  };

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const [bookingRes, paymentRes, roomRes] = await Promise.allSettled([
        BookingServices.getAllBookings(),
        BookingServices.getAllPembayaran
          ? BookingServices.getAllPembayaran()
          : Promise.resolve([]),
        RoomServices.getAllRooms(),
      ]);

      const bookingList =
        bookingRes.status === "fulfilled"
          ? Array.isArray(bookingRes.value)
            ? bookingRes.value
            : bookingRes.value?.data || []
          : [];

      const rawPaymentList =
        paymentRes.status === "fulfilled"
          ? Array.isArray(paymentRes.value)
            ? paymentRes.value
            : paymentRes.value?.data || []
          : [];

      const roomList =
        roomRes.status === "fulfilled"
          ? Array.isArray(roomRes.value)
            ? roomRes.value
            : roomRes.value?.data || []
          : [];

      // Gabungkan data reservasi, pembayaran, dan kamar agar field lengkap
      const baseList = bookingList.length > 0 ? bookingList : rawPaymentList;

      const mergedList = baseList.map((item) => {
        const resId = item.id_reservasi || item.id;
        const matchedPayment = rawPaymentList.find(
          (p) => String(p.id_reservasi) === String(resId)
        );
        const matchedRoom = roomList.find(
          (r) => String(r.id_kamar || r.id) === String(item.id_kamar)
        );

        const resolvedRoomType =
          item.nama_tipe ||
          item.tipe_kamar ||
          matchedRoom?.nama_tipe ||
          getRoomTypeName(item.id_tipe_kamar || matchedRoom?.id_tipe_kamar);

        const resolvedRoomNumber =
          item.nomor_kamar || matchedRoom?.nomor_kamar || "";

        return {
          ...matchedPayment,
          ...item,
          id_pembayaran: item.id_pembayaran || matchedPayment?.id_pembayaran,
          metode:
            item.metode ||
            item.method ||
            matchedPayment?.metode ||
            matchedPayment?.method ||
            "transfer",
          status_verifikasi:
            item.status_verifikasi ||
            item.paymentStatus ||
            matchedPayment?.status_verifikasi ||
            matchedPayment?.status ||
            "pending",
          resolvedRoomType,
          resolvedRoomNumber,
        };
      });

      const sortedList = [...mergedList].sort(
        (a, b) =>
          Number(a.id_pembayaran || a.id_reservasi || a.id) -
          Number(b.id_pembayaran || b.id_reservasi || b.id)
      );

      setPaymentData(sortedList);
    } catch (error) {
      console.error("Failed to fetch payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (item, newStatus) => {
    const targetId = item.id_pembayaran || item.id_reservasi || item.id;
    const resId = item.id_reservasi || item.id;

    if (!targetId) {
      showAlert(
        "Invalid Data!",
        "Payment ID is invalid or not found.",
        "error"
      );
      return;
    }

    try {
      // Optimistic UI update
      setPaymentData((prevData) =>
        prevData.map((p) => {
          const currentId = p.id_pembayaran || p.id_reservasi || p.id;
          if (currentId === targetId) {
            return {
              ...p,
              status_verifikasi: newStatus,
              paymentStatus: newStatus,
            };
          }
          return p;
        })
      );

      if (BookingServices.updatePaymentStatus) {
        await BookingServices.updatePaymentStatus(targetId, newStatus, resId);
        showAlert(
          "Payment Status Updated!",
          `Payment status #${targetId} has been updated to '${newStatus}'.`,
          "success"
        );
      }
    } catch (error) {
      console.error("Failed to update payment status:", error);
      showAlert(
        "Update Failed!",
        error.message || "Failed to update payment status in the database.",
        "error"
      );
      fetchPaymentData();
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-500">
        Loading payment data...
      </div>
    );
  }

  const dataList = filtered(paymentData, [
    "id",
    "id_reservasi",
    "id_pembayaran",
    "guest",
    "nama_lengkap",
    "nama_tamu",
    "resolvedRoomType",
    "resolvedRoomNumber",
    "method",
    "metode",
    "paymentStatus",
    "status_verifikasi",
  ]);

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <CustomAlert
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      <div>
        <h3 className="text-base font-semibold text-slate-900">
          Payment History
        </h3>
        <p className="text-xs text-slate-500">
          Monitor transactions, room details, stay duration, and update guest payment statuses.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">PAYMENT ID</th>
              <th className="px-4 py-3">GUEST NAME</th>
              <th className="px-4 py-3">ROOM TYPE</th>
              <th className="px-4 py-3">STAY DURATION</th>
              <th className="px-4 py-3">AMOUNT</th>
              <th className="px-4 py-3">METHOD</th>
              <th className="px-4 py-3">PAYMENT STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dataList.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-6 text-center text-xs text-slate-400"
                >
                  No payment transactions found.
                </td>
              </tr>
            ) : (
              dataList.map((item) => {
                const payId = item.id_pembayaran || item.id_reservasi || item.id;
                const displayPayId = item.id_pembayaran
                  ? `PAY-${item.id_pembayaran}`
                  : `PAY-${String(payId).replace("#GN-", "")}`;
                const guestName =
                  item.nama_lengkap ||
                  item.nama_tamu ||
                  item.guest ||
                  `Guest #${item.id_tamu || ""}`;
                const amount =
                  item.total_biaya ||
                  item.jumlah_bayar ||
                  item.total_bayar ||
                  item.amount ||
                  0;
                const method = item.metode || item.method || "transfer";
                const payStatus =
                  item.status_verifikasi || item.paymentStatus || "pending";
                const isCancelled =
                  String(
                    item.status_reservasi || item.status || ""
                  ).toLowerCase() === "cancelled";

                const stay = getStayDuration(
                  item.tanggal_check_in || item.checkin,
                  item.tanggal_check_out || item.checkout
                );

                return (
                  <tr key={payId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {displayPayId}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {guestName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">
                        {item.resolvedRoomType}
                      </div>
                      {item.resolvedRoomNumber && (
                        <span className="text-xs text-slate-400">
                          Room #{item.resolvedRoomNumber}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">
                        {stay.nightsText}
                      </div>
                      <span className="text-xs text-slate-400">
                        {stay.dateRange}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-blue-600">
                      {formatIDR(amount)}
                    </td>
                    <td className="px-4 py-3 capitalize">{method}</td>
                    <td className="px-4 py-3">
                      <select
                        value={payStatus}
                        disabled={isCancelled}
                        onChange={(e) =>
                          updatePaymentStatus(item, e.target.value)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option value="pending">pending</option>
                        <option value="verified">verified</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}