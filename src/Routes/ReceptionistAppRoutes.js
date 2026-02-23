import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../ReceptionistComponents/DashboardLayout";
import DashboardHome from "../ReceptionistComponents/DashboardHome";
import Appointments from "../ReceptionistComponents/Appointments/Appointment";
import Attendance from "../ReceptionistComponents/Attendance";
import TaskReview from "../ReceptionistComponents/TaskReview";
import Login from "../ReceptionistComponents/StaffDashboardLogin";
import ServiceRequest from "../ReceptionistComponents/ServiceRequest";
import ProtectedRoute from '../ReceptionistComponents/ProtectedRoute';
import Document from '../ReceptionistComponents/Documents';
import Profile from '../ReceptionistComponents/Profile';
import Appointmentdoctorschedule from '../ReceptionistComponents/Appointmentdoctorschedule';
import Bills from "../ReceptionistComponents/Bills";
import Clients from '../ReceptionistComponents/Clients/Clients';
import Slots from '../ReceptionistComponents/TimeSlots/TimeSlots';
export default function ReceptionistAppRoutes() {
  return (
    <>
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
        <Route path="attendance" element={<Attendance />} />
        <Route path="task-review" element={<TaskReview />} />
        <Route path="service-request" element={<ServiceRequest />} />
        <Route path="documents" element={<Document />} />
        <Route path="schedule" element={<Appointmentdoctorschedule />} />
         <Route path="bills" element={<Bills />} />1
         <Route path="clients" element={<Clients />} />
        <Route path="add-slots" element={<Slots />} />


        <Route path="profile" element={<Profile />} />
        {/* <Route path="calculator" element={<Calculator />} /> */}
      </Route>

      <Route path="*" element={<h2>404 | Page Not Found</h2>} />
      </Routes>
  </>);
}
