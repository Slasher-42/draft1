import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const statusClass = (status) => {
  if (status === "SCHEDULED") return "badge badge-scheduled";
  if (status === "CANCELLED") return "badge badge-cancelled";
  if (status === "COMPLETED") return "badge badge-completed";
  return "badge";
};

const queueClass = (qs) => {
  if (qs === "WAITING") return "badge badge-waiting";
  if (qs === "SERVED") return "badge badge-served";
  return "badge";
};

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data);
    } catch {
      setError("Failed to load appointments");
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleCancel = async (id) => {
    try {
      await api.delete(`/appointments/${id}`);
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel");
    }
  };

  return (
    <div className="page" data-testid="dashboard-page">
      <div className="page-header">
        <h2>My Appointments</h2>
        <button className="btn btn-primary btn-sm" style={{width:"auto"}}
          onClick={() => navigate("/appointments/new")} data-testid="create-appointment-button">
          + New Appointment
        </button>
      </div>
      {error && <div className="alert alert-error" data-testid="dashboard-error">⚠ {error}</div>}
      <div className="table-wrapper">
        <table data-testid="appointments-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Reason</th>
              <th>Date</th>
              <th>Status</th>
              <th>Queue No.</th>
              <th>Queue Status</th>
              {(user.role === "STAFF" || user.role === "ADMIN") && <th>Patient</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr><td colSpan="8" className="empty-state">No appointments found</td></tr>
            ) : appointments.map((a) => (
              <tr key={a.id} data-testid={`appointment-row-${a.id}`}>
                <td>{a.doctor}</td>
                <td>{a.reason}</td>
                <td>{a.appointmentDate}</td>
                <td><span className={statusClass(a.status)} data-testid={`status-${a.id}`}>{a.status}</span></td>
                <td>#{a.queueNumber}</td>
                <td><span className={queueClass(a.queueStatus)} data-testid={`queue-status-${a.id}`}>{a.queueStatus}</span></td>
                {(user.role === "STAFF" || user.role === "ADMIN") && <td>{a.patientName}</td>}
                <td>
                  {a.status !== "CANCELLED" && a.status !== "COMPLETED" && (
                    <div className="actions">
                      <button className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/appointments/edit/${a.id}`)}
                        data-testid={`edit-button-${a.id}`}>Edit</button>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(a.id)}
                        data-testid={`cancel-button-${a.id}`}>Cancel</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
