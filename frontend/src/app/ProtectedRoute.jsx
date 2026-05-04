import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div style={{ padding: 40 }}>Checking authentication…</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
}
``