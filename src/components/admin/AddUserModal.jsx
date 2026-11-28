import React, { useState } from "react";
import { X, UserPlus, Eye, EyeOff, ShieldCheck } from "lucide-react";
import CustomAlert from "../common/CustomAlert";

const API_BASE = "http://192.168.1.103:3000/api";

export default function AddUserModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "admin",
  });

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm({
      username: "",
      email: "",
      password: "",
      role: "admin",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 8) {
      setAlertConfig({
        isOpen: true,
        title: "Password Terlalu Pendek!",
        message: "Password minimal harus terdiri dari 8 karakter.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // Payload fleksibel agar cocok dengan struktur kolom tabel users / admin di MySQL
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
      };

      // Gunakan /auth/register agar otomatis tersimpan ke tabel users (dan bisa langsung dipakai login)
      // Fallback ke /admin jika endpoint /auth/register gagal
      let response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok && form.role === "admin") {
        response = await fetch(`${API_BASE}/admin`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Gagal menambahkan akun baru.");
      }

      setAlertConfig({
        isOpen: true,
        title: "Akun Berhasil Ditambahkan!",
        message: `Akun ${form.role} atas nama ${form.username} siap digunakan untuk login.`,
        type: "success",
      });

      resetForm();

      setTimeout(() => {
        if (onSuccess) onSuccess(data);
        if (onClose) onClose();
      }, 1300);
    } catch (error) {
      setAlertConfig({
        isOpen: true,
        title: "Gagal Menambah Akun!",
        message: error.message || "Terjadi kesalahan pada server.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomAlert
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
        <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {/* HEADER MODAL */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Tambah Akun Baru
                </h3>
                <p className="text-xs text-slate-500">
                  Buat akun Administrator atau pengguna sistem hotel.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Role / Hak Akses
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-600 focus:bg-white"
                >
                  <option value="admin">Admin (Administrator Hotel)</option>
                  <option value="tamu">Tamu (User Biasa)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Contoh: Budi Santoso"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Email Login
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@grandnusantara.com"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimal 8 karakter"
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-blue-50/70 p-3 text-[11px] text-blue-700">
              <ShieldCheck size={16} className="shrink-0" />
              <span>
                Akun yang ditambahkan akan langsung tersimpan ke database dan dapat digunakan untuk login.
              </span>
            </div>

            {/* FOOTER TOMBOL */}
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
              >
                <UserPlus size={15} />
                {loading ? "Menyimpan..." : "Simpan Akun"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}