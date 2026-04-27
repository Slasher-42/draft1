import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function AppointmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ doctor: "", reason: "", appointmentDate: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      api.get(`/appointments/${id}`)
        .then((res) => setForm({ doctor: res.data.doctor, reason: res.data.reason, appointmentDate: res.data.appointmentDate }))
        .catch(() => setError("Failed to load appointment"));
    }
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.doctor || !form.reason || !form.appointmentDate) {
      setError("All fields are required");
      return;
    }
    try {
      if (id) { await api.put(`/appointments/${id}`, form); }
      else { await api.post("/appointments", form); }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save appointment");
    }
  };

  return (
    <div className="page" data-testid="appointment-form-page">
      <div className="form-card">
        <h2>{id ? "Edit Appointment" : "New Appointment"}</h2>
        {error && <div className="alert alert-error" data-testid="form-error">⚠ {error}</div>}
        <form onSubmit={handleSubmit} data-testid="appointment-form">
          <div className="form-group">
            <label htmlFor="doctor">Doctor</label>
            <input id="doctor" name="doctor" type="text" value={form.doctor}
              onChange={handleChange} data-testid="doctor-input" placeholder="Dr. Smith" />
          </div>
          <div className="form-group">
            <label htmlFor="reason">Reason</label>
            <input id="reason" name="reason" type="text" value={form.reason}
              onChange={handleChange} data-testid="reason-input" placeholder="e.g. Annual checkup" />
          </div>
          <div className="form-group">
            <label htmlFor="appointmentDate">Date</label>
            <input id="appointmentDate" name="appointmentDate" type="date" value={form.appointmentDate}
              onChange={handleChange} data-testid="date-input" />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" style={{flex:1}} data-testid="submit-button">
              {id ? "Update Appointment" : "Book Appointment"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/dashboard")}
              data-testid="cancel-button">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AppointmentForm;
