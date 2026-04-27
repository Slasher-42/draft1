import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    try {
      const res = await api.post("/auth/login", form);
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-wrapper" data-testid="login-page">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="subtitle">Sign in to your QueueCare account</p>
        {error && (
          <div className="alert alert-error" data-testid="login-error">
            ⚠ {error}
          </div>
        )}
        <form onSubmit={handleSubmit} data-testid="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email}
              onChange={handleChange} data-testid="email-input" placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password}
              onChange={handleChange} data-testid="password-input" placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary" data-testid="login-button">
            Sign In
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register" data-testid="register-link">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
