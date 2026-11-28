import React, { useState } from "react";
import {
  BedDouble,
  Clock,
  ArrowLeft,
  Save,
} from "lucide-react";

const getLocalDateTimeValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
};

export default function EditRoom({ room, onSave, onCancel }) {
  // Room Type Mapping Helper
  const getTipeKamarName = (id) => {
    const types = {
      1: "Suite Room",
      2: "Superior Room",
      3: "Deluxe Room",
      4: "Executive Club",
      5: "Presidential Suite",
    };
    return types[id] || "Superior Room";
  };

  // Support MySQL fields (nomor_kamar, status, id_tipe_kamar)
  const [form, setForm] = useState({
    id: room?.id_kamar || room?.id || "",
    number: room?.nomor_kamar || room?.number || "101",
    typeId: String(room?.id_tipe_kamar || "1"),
    type: room?.type || getTipeKamarName(room?.id_tipe_kamar),
    status: room?.status || "available",
    duration: String(room?.duration || "60"),
    note: room?.note || "",
    startedAt: room?.startedAt || getLocalDateTimeValue(),
    estimatedCompletionAt: room?.estimatedCompletionAt || null,
    estimatedCompletion: room?.estimatedCompletion || null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "typeId") {
        updated.type = getTipeKamarName(value);
      }
      return updated;
    });
  };

  const getEstimatedCompletionDate = () => {
    const start = new Date(form.startedAt);
    const duration = Number(form.duration);
    if (Number.isNaN(start.getTime()) || !duration) return null;
    return new Date(start.getTime() + duration * 60000);
  };

  const estimatedCompletion = () => {
    const finish = getEstimatedCompletionDate();
    if (!finish) return "-";
    return finish.toLocaleString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finish = getEstimatedCompletionDate();

    // Send full payload compatible with both MySQL and Frontend UI
    if (onSave) {
      onSave({
        ...form,
        id_kamar: form.id,
        nomor_kamar: form.number,
        id_tipe_kamar: Number(form.typeId),
        duration: Number(form.duration),
        estimatedCompletionAt:
          form.status === "available" || !finish ? null : finish.getTime(),
        estimatedCompletion:
          form.status === "available" || !finish
            ? null
            : finish.toLocaleString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
      });
    }
  };

  const statusOptions = [
    { value: "available", label: "Available" },
    { value: "occupied", label: "Occupied" },
    { value: "cleaning", label: "Cleaning" },
    { value: "maintenance", label: "Maintenance" },
  ];

  const durationOptions = [
    { value: "30", label: "30 Minutes" },
    { value: "60", label: "1 Hour" },
    { value: "90", label: "1 Hour 30 Minutes" },
    { value: "120", label: "2 Hours" },
    { value: "180", label: "3 Hours" },
    { value: "240", label: "4 Hours" },
    { value: "480", label: "8 Hours" },
    { value: "720", label: "12 Hours" },
    { value: "1440", label: "24 Hours" },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            ROOM MANAGEMENT
          </span>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Edit Room Condition
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage cleaning status, maintenance, and estimated room availability.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* FORM */}
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Room Information
            </h2>
            <p className="text-xs text-slate-500">
              Details of the room to be updated.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Room Number
              </label>
              <input
                name="number"
                value={form.number}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Room Type
              </label>
              <select
                name="typeId"
                value={form.typeId}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="1">Suite Room</option>
                <option value="2">Superior Room</option>
                <option value="3">Deluxe Room</option>
                <option value="4">Executive Club</option>
                <option value="5">Presidential Suite</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Room Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {form.status !== "available" && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    name="startedAt"
                    value={form.startedAt}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Estimated Duration
                  </label>
                  <select
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    {durationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <div className="flex items-center gap-2 text-blue-700">
                  <Clock size={17} />
                  <span className="text-sm font-semibold">
                    Estimated Completion
                  </span>
                </div>

                <p className="mt-2 text-sm font-bold text-blue-900">
                  {estimatedCompletion()}
                </p>
              </div>
            </>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Notes / Remarks
            </label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={4}
              placeholder="Example: Bathroom cleaning, bedsheet replacement, AC repair..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>

        {/* PREVIEW STATUS */}
        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BedDouble size={22} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Room {form.number}
              </h3>
              <p className="text-xs text-slate-500">{form.type}</p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">
              Current Status
            </p>

            <p className="mt-2 text-sm font-bold capitalize text-slate-900">
              {form.status}
            </p>
          </div>

          <div className="mt-4 space-y-3 text-xs text-slate-500">
            <p>
              <strong className="text-slate-700">Estimate:</strong>{" "}
              {form.status === "available"
                ? "Room is ready for guests"
                : `${form.duration} minutes`}
            </p>

            <p>
              <strong className="text-slate-700">Completion:</strong>{" "}
              {form.status === "available"
                ? "No schedule"
                : estimatedCompletion()}
            </p>

            <p>
              <strong className="text-slate-700">Notes:</strong>{" "}
              {form.note || "No notes yet"}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}