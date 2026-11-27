import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Loading from "./components/common/Loading";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy loading halaman agar aplikasi lebih cepat dimuat di awal
const Beranda = lazy(() => import('./pages/Beranda'));
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/admin/DashboardAdmin'));
const RoomDetail = lazy(() => import('./pages/RoomDetail'));
const RoomList = lazy(() => import('./pages/RoomList'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
  
function App() {
  return (
    <main className="min-h-screen w-full">
        <Suspense fallback={<Loading message="Memuat halaman..." />}>
          <Routes>
            <Route path="/" element={<Beranda />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/room-detail" element={<RoomDetail />} />
            <Route path="/room-list" element={<RoomList />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            {/* Dashboard Admin */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRole="admin">
                  <Dashboard />
                </ProtectedRoute>
              }
              />
          </Routes>
        </Suspense>
    </main>
  );
}

export default App;