import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../StaffComponents/DashboardLayout";
import DashboardHome from "../StaffComponents/DashboardHome";
import Appointments from "../StaffComponents/Appointment";
import Attendance from "../StaffComponents/Attendance";
import TaskReview from "../StaffComponents/TaskReview";
import StaffSessionsPage from "../StaffComponents/Sessions";
import Login from "../StaffComponents/StaffDashboardLogin";
import ServiceRequest from "../StaffComponents/ServiceRequest";
import Calculator from '../StaffComponents/Calculator';
import ProtectedRoute from '../StaffComponents/ProtectedRoute';
import Document from '../StaffComponents/Documents';
import Profile from '../StaffComponents/Profile';
export default function AppRoutes() {
  return (
    <Routes>

      <Route
        path="/dashboard"
        element={
          // <ProtectedRoute>
          // </ProtectedRoute>
            <DashboardLayout />
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="sessions" element={<StaffSessionsPage />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="task-review" element={<TaskReview />} />
        <Route path="service-request" element={<ServiceRequest />} />
        <Route path="documents" element={<Document />} />
        <Route path="profile" element={<Profile />} />
        {/* <Route path="calculator" element={<Calculator />} /> */}
      </Route>

      {/* <Route path="/" element={<Navigate to="/dashboard" />} /> */}
      <Route path="*" element={<h2>404 | Page Not Found</h2>} />
    </Routes>
  );
}
