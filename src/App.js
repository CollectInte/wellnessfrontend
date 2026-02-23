import './App.css';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import OtpVerification from './components/Otpverification';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from "./StaffComponents/DashboardLayout";
import DashboardHome from "./StaffComponents/DashboardHome";
import Appointments from "./StaffComponents/Appointment";
import Attendance from "./StaffComponents/Attendance";
import TaskReview from "./StaffComponents/TaskReview";
// import Login from "./StaffComponents/StaffDashboardLogin";
import ServiceRequest from "./StaffComponents/ServiceRequest";
import Calculator from './StaffComponents/Calculator';
import ProtectedRoute from './StaffComponents/ProtectedRoute';
import Document from './StaffComponents/Documents';
import Profile from './StaffComponents/Profile';
// import Sidebar from "./ClientComponents/Sidebar";
// import Dashboard from "./Pages/Dashboard";
// import Documents from "./Pages/Documents";
// import ClientServiceRequestPage from './Pages/ClientServiceRequest';
// import Reviews from "./Pages/Reviews";
// import Bills from "./Pages/Bills";
// import Payments from "./Pages/Payments";
// import AppointmentsPage from "./Pages/Appointments/Appointment";
import { SocketProvider } from "./context/SocketContext";
import NotificationListener from "./NotificationListener";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Landingpage from './Marketing/Landingpage';
import ContactForm from './Marketing/Contactform';
import BookDemo from './Marketing/BookDemo';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AppRoutes from './Routes/AppRoutes'; // or Routes/AppRoutes
import ReceptionistAppRoutes from './Routes/ReceptionistAppRoutes';
import Sidebar from "./ClientComponents/Components/DashboardLayout";
import Dashboard from "./ClientComponents/Dashboard/Dashboard";
import Documents from "./ClientComponents/Documents";
import Reviews from "./ClientComponents/Reviews";
import Bills from "./ClientComponents/Bills";
import AppointmentsPage from "./ClientComponents/Appointments/Appointment";
import ClientSessionsPage from './ClientComponents/Clientsessions';
function App() {
  const userId =
    localStorage.getItem("adminId") ||
    localStorage.getItem("userId") ||
    localStorage.getItem("id");

  return (
    <BrowserRouter>
      {/* LISTEN FOR SOCKET EVENTS */}
      <NotificationListener />

      {/* REQUIRED FOR TOASTS */}
      <ToastContainer position="top-right" autoClose={5000} />
      <SocketProvider userId={userId}>
        <Routes>
          <Route path="/landing" element={<Landingpage />} />
          <Route path='/contact' element={<ContactForm />} />
          <Route path='/demo' element={<BookDemo />} />
          <Route path='/' element={<Login />} />
          <Route path='/otp-verify' element={<OtpVerification />} />
          <Route path='/AdminDashboard' element={<AdminDashboard />} />
          <Route path="/staff/*" element={<AppRoutes />} />
          <Route path="/receptionist/*" element={<ReceptionistAppRoutes />} />

          <Route path="/client" element={<Sidebar />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="documents" element={<Documents />} />
            <Route path="appointment" element={<AppointmentsPage />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="bills" element={<Bills />} />
            <Route path="sessions" element={<ClientSessionsPage />} />
          </Route>
        </Routes>

      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;