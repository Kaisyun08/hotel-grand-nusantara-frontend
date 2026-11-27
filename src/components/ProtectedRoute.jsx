import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole = "admin" }) {
  const location = useLocation();

  // 1. Ambil data user dari sessionStorage (agar terisolasi per tab)
  const savedUser = sessionStorage.getItem("user");
  let user = null;

  if (savedUser) {
    try {
      user = JSON.parse(savedUser);
    } catch (e) {
      user = null;
    }
  }

  // 2. Jika USER belum login -> Redirect ke halaman login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Pengecekan role admin
  const isUserAdmin =
    user.role === "admin" ||
    user.role === "super_admin" ||
    user.isAdmin === true ||
    user.role === allowedRole;

  // Jika bukan admin -> Redirect ke Home
  if (!isUserAdmin) {
    return <Navigate to="/" replace />;
  }

  // 4. Jika user adalah admin -> Izinkan akses
  return children;
}