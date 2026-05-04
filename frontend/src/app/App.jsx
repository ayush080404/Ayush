import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "../modules/auth/Login";
import Dashboard from "../modules/dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";

export default function App() {
  const { user, loading } = useSelector((state) => state.auth);

  // ✅ While auth state initializes
  if (loading) {
    return <div style={{ padding: 40 }}>Initializing app...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ LOGIN IS THE ONLY PUBLIC ROUTE */}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />

        {/* ✅ DEFAULT LANDING PAGE */}
        <Route
          path="/"
          element={<Navigate to="/login" />}
        />

        {/* ✅ PROTECTED DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ FALLBACK: ANY UNKNOWN ROUTE → LOGIN */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
