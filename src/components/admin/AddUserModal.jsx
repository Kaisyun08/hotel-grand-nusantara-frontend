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
        title: "Password Too Short!",
        message: "Password must be at least 8 characters long.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // Flexible payload matching MySQL users / admin table columns
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
      };

      // Use /auth/register so the account is saved to the users table for login
      // Fallback to /admin if /auth/register fails
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
        throw new Error(data?.message || data?.error || "Failed to add new account.");
      }

      setAlertConfig({
        isOpen: true,
        title: "Account Added Successfully!",
        message: `The ${form.role} account for ${form.username} is ready to use for login.`,
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
        title: "Failed to Add Account!",
        message: error.message || "A server error occurred.",
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
          {/* MODAL HEADER */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Add New Account
                </h3>
                <p className="text-xs text-slate-500">
                  Create an Administrator or hotel system user account.
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
                Role / Access Level
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-600 focus:bg-white"
                >
                  <option value="admin">Admin (Hotel Administrator)</option>
                  <option value="tamu">Guest (Regular User)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Example: Budi Santoso"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Login Email
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
                  placeholder="Minimum 8 characters"
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
                The added account will be saved directly to the database and can be used immediately for login.
              </span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
              >
                <UserPlus size={15} />
                {loading ? "Saving..." : "Save Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}