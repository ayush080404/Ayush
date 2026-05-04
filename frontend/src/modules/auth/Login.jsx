import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "./auth.slice";
import "../../styles/login.css";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "EMPLOYEE", // ✅ default
  });

  // ✅ Navigate only after successful login
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="logo">✨</span>
          <h1>Employee Tracking System</h1>
          <p>Log in to access your workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>Email Address</label>
          <input
            name="email"
            type="email"
            placeholder="employee@company.com"
            required
            onChange={handleChange}
          />

          <label>Password</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            required
            onChange={handleChange}
          />

          <label>Account Role</label>
          <select
            name="role"
            className="role-select"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>

          {error && <p className="error-text">{error}</p>}
        </form>

        <p className="signup-text">
          Don’t have an account?{" "}
          <Link to="/signup" className="signup-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}