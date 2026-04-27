import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav data-testid="navbar">
      <Link to="/dashboard">🏥 QueueCare</Link>
      {user && (
        <div>
          <span data-testid="navbar-username">Hello, {user.name}</span>
          {(user.role === "STAFF" || user.role === "ADMIN") && (
            <Link to="/queue" className="nav-link" data-testid="queue-link">Queue</Link>
          )}
          <Link to="/appointments/new" className="nav-link" data-testid="new-appointment-link">
            + New Appointment
          </Link>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout} data-testid="logout-button">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
