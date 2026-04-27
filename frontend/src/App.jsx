import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AppointmentForm from "./pages/AppointmentForm";
import Queue from "./pages/Queue";
import Navbar from "./components/Navbar";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/appointments/new" element={<PrivateRoute><AppointmentForm /></PrivateRoute>} />
        <Route path="/appointments/edit/:id" element={<PrivateRoute><AppointmentForm /></PrivateRoute>} />
        <Route path="/queue" element={<PrivateRoute><Queue /></PrivateRoute>} />
      </Routes>
    </>
  );
}

export default App;
