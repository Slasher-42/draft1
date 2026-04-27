import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "PATIENT" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password || !form.role) {
      setError("All fields are required");
      return;
    }
    try {
      const res = await api.post("/auth/register", form);
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-wrapper" data-testid="register-page">
      <div className="auth-card">
        <h2>Create account</h2>
        <p className="subtitle">Join QueueCare to manage your appointments</p>
        {error && (
          <div className="alert alert-error" data-testid="register-error">
            ⚠ {error}
          </div>
        )}
        <form onSubmit={handleSubmit} data-testid="register-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" type="text" value={form.name}
              onChange={handleChange} data-testid="name-input" placeholder="John Doe" />
          </div>
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
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={form.role}
              onChange={handleChange} data-testid="role-select">
              <option value="PATIENT">Patient</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" data-testid="register-button">
            Create Account
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login" data-testid="login-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
