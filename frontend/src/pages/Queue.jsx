import { useEffect, useState } from "react";
import api from "../api/axios";

const queueClass = (qs) => qs === "SERVED" ? "badge badge-served" : "badge badge-waiting";

function Queue() {
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState("");

  const fetchQueue = async () => {
    try {
      const res = await api.get("/appointments/queue/today");
      setQueue(res.data);
    } catch { setError("Failed to load queue"); }
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleServe = async (id) => {
    try {
      await api.patch(`/appointments/${id}/serve`);
      fetchQueue();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark as served");
    }
  };

  return (
    <div className="page" data-testid="queue-page">
      <div className="page-header">
        <h2>Today's Queue</h2>
      </div>
      {error && <div className="alert alert-error" data-testid="queue-error">⚠ {error}</div>}
      <div className="table-wrapper">
        <table data-testid="queue-table">
          <thead>
            <tr>
              <th>Queue No.</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {queue.length === 0 ? (
              <tr><td colSpan="6" className="empty-state">No patients in queue today</td></tr>
            ) : queue.map((a) => (
              <tr key={a.id} data-testid={`queue-row-${a.id}`}>
                <td><strong>#{a.queueNumber}</strong></td>
                <td>{a.patientName}</td>
                <td>{a.doctor}</td>
                <td>{a.reason}</td>
                <td><span className={queueClass(a.queueStatus)} data-testid={`serve-status-${a.id}`}>{a.queueStatus}</span></td>
                <td>
                  {a.queueStatus !== "SERVED" && (
                    <button className="btn btn-success btn-sm"
                      onClick={() => handleServe(a.id)} data-testid={`serve-button-${a.id}`}>
                      ✓ Mark as Served
                    </button>
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

export default Queue;
