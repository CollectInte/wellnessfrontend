import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  IconButton,
} from '@mui/material';
import api from "./services/api";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from "react-router-dom";
import GroupsIcon from "@mui/icons-material/Groups";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import UpcomingAppointments from './UpcomingAppointments';
import AvailableDoctorsCard from './AvailableDoctorsCard';
import { ReactComponent as ReceptionistIcon } from './receptionistimages/receptionisticon.svg';
import DoctorsScheduleCard from "./DoctorscheduleCard";

export default function Dashboard() {
  const navigate = useNavigate();
  const staffName = localStorage.getItem('name');

  // State Management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attendance, setAttendance] = useState({
    clockIn: null,
    clockOut: null,
  });
  const [pastAttendance, setPastAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [data, setData] = useState({
    role: "",
    branch: "",
    totalAppointments: 0,
  });

  // Effects
  useEffect(() => {
    fetchTodayAttendance();
    fetchLast10DaysAttendance();
    fetchPatients();
    fetchDoctors();
    loadCount();
  }, []);

  const currentMonth = new Date().toLocaleString("en-US", {
  month: "long",
});

  // API Calls
  const getDoctorsCount = async () => {
    try {
      const res = await api.get("api/staff/doctors/count");
      return res.data.totalDoctors || 0;
    } catch (error) {
      console.error("Doctor count fetch error:", error);
      return 0;
    }
  };

  const loadCount = async () => {
    const count = await fetchAppointmentsCount();
    setData(count);
  };

  const fetchDoctors = async () => {
    const count = await getDoctorsCount();
    setTotalDoctors(count);
  };

  const getCurrentMonthClients = async () => {
    try {
      const res = await api.get("api/client/count/current-month");
      if (res.data.success) {
        return res.data.currentMonthPatients;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching client count:", error);
      return 0;
    }
  };

  const fetchPatients = async () => {
    const count = await getCurrentMonthClients();
    setTotalPatients(count);
  };

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const today = new Date().toISOString().split("T")[0];

      const res = await api.get("/api/attendance/date", {
        params: { date: today },
      });

      if (res.data.success && res.data.data.length > 0) {
        const record = res.data.data[0];
        setAttendance({
          clockIn: record.clock_in || null,
          clockOut: record.clock_out || null,
        });
      } else {
        setAttendance({
          clockIn: null,
          clockOut: null,
        });
      }
    } catch (err) {
      console.error("Fetch attendance error:", err);
      setError("Unable to fetch today's attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.post("api/attendance/clock-in");

      if (res.data.success) {
        await fetchTodayAttendance();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to clock in");
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.post("/api/attendance/clock-out");

      if (res.data.success) {
        await fetchTodayAttendance();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to clock out");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time || typeof time !== "string") return "-";

    const [hours, minutes] = time.split(":");
    if (!hours || !minutes) return "-";

    const date = new Date();
    date.setHours(hours, minutes);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fetchLast10DaysAttendance = async () => {
    try {
      setAttendanceLoading(true);

      const res = await api.get("api/attendance/all");

      if (res.data.success) {
        const last10 = res.data.data.slice(0, 3);

        const formatted = last10.map((row) => {
          const isLeave = row.status === "leave" || row.status === "absent";

          return {
            date: formatDate(row.date),
            status: row.status,
            clockIn: row.clock_in,
            clockOut: row.clock_out,
            totalHours: isLeave ? "-" : `${row.total_hours} hrs`,
            timeRange:
              isLeave || !row.clock_in || !row.clock_out
                ? "-"
                : `${formatTime(row.clock_in)} - ${formatTime(row.clock_out)}`,
          };
        });

        setPastAttendance(formatted);
      } else {
        setPastAttendance([]);
      }
    } catch (error) {
      console.error("Attendance fetch error:", error);
      setPastAttendance([]);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const fetchAppointmentsCount = async () => {
    try {
      const res = await api.get("/appointment/appointments/count");

      if (res.data?.success) {
        return {
          role: res.data.role,
          branch: res.data.branch,
          totalAppointments: res.data.totalAppointments,
        };
      }

      return {
        role: null,
        branch: null,
        totalAppointments: 0,
      };
    } catch (error) {
      console.error("Failed to fetch appointments count:", error);
      return {
        role: null,
        branch: null,
        totalAppointments: 0,
      };
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        boxSizing: "border-box",
        p: { xs: 0, md: 1 },
      }}
    >
      {/* Top Row - Welcome, Shift, Clock Cards */}
      <Grid container spacing={2} > 
        {/* Welcome Card */}
        <Grid item xs={12} md={7} sx={{width:{md:"500px",xs:"100%"}}}>
          <Card
            sx={{
              width: "100%",
              background: "linear-gradient(120deg, #107881 0%, #FFFFFF 120%)",
              borderRadius: 3,
              color: "white",
              position: "relative",
              overflow: "hidden",
              minHeight: { xs: 150, md: 170 },
              display: "flex",
              alignItems: "center"
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3 }, width: "100%" }}>
              <Typography sx={{ fontSize: { xs: "1.5rem", md: "2rem" }, fontWeight: 700 }}>
                Hello {staffName}
              </Typography>
              <Typography sx={{ opacity: 0.95 }}>
                {getGreeting()}
              </Typography>
              <Typography sx={{ opacity: 0.95 }}>Have a good day</Typography>
            </CardContent>
            <IconButton>
              <ReceptionistIcon width={130} height={130} />
            </IconButton>
          </Card>
        </Grid>

        {/* Shift Card */}
        <Grid item xs={12} md={3} sx={{width:{md:"260px",xs:"100%"}}}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
              height: { xs: 150, md: 170 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CardContent sx={{ p: 2, textAlign: "center", width: "100%" }}>
              {/* TITLE */}
              <Typography
                sx={{
                  fontSize: { xs: "0.75rem", md: "0.8rem" },
                  fontWeight: 600,
                  color: "#1a9b8e",
                  mb: 1,
                }}
              >
                Your Shift Starts at 09:00 AM
              </Typography>

              {/* CLOCK ICON */}
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: "#e6f5f3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 1.5,
                }}
              >
                <AccessTimeIcon sx={{ color: "#1a9b8e", fontSize: 26 }} />
              </Box>

              {/* CLOCK IN */}
              {!attendance.clockIn && !attendance.clockOut && (
                <Button
                  onClick={handleClockIn}
                  disabled={loading}
                  sx={{
                    bgcolor: "#1a9b8e",
                    color: "#fff",
                    borderRadius: 5,
                    px: 3,
                    py: 0.7,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#14877c" },
                  }}
                >
                  {loading ? "Processing..." : "Clock - in"}
                </Button>
              )}

              {/* CLOCK OUT */}
              {attendance.clockIn && !attendance.clockOut && (
                <Button
                  onClick={handleClockOut}
                  disabled={loading}
                  sx={{
                    bgcolor: "#ff7043",
                    color: "#fff",
                    borderRadius: 5,
                    px: 3,
                    py: 0.7,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#e64a19" },
                  }}
                >
                  {loading ? "Processing..." : "Clock - out"}
                </Button>
              )}

              {/* COMPLETED */}
              {attendance.clockIn && attendance.clockOut && (
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "success.main",
                    fontWeight: 600,
                  }}
                >
                  ✓ Attendance Completed
                </Typography>
              )}

              {/* LAST CLOCK OUT */}
              {attendance.clockOut && (
                <Typography
                  sx={{
                    mt: 1,
                    fontSize: "0.65rem",
                    color: "text.secondary",
                  }}
                >
                  Last Clock-out : {formatTime(attendance.clockOut)}
                </Typography>
              )}

              {error && (
                <Typography
                  sx={{
                    mt: 1,
                    fontSize: "0.7rem",
                    color: "error.main",
                  }}
                >
                  {error}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Doctor Schedule Card */}
        <Grid item xs={12} md={2} sx={{width:{md:"260px",xs:"100%"}}}>
          <DoctorsScheduleCard />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* Left Column */}
        <Grid item xs={12} md={7.5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Stats Cards Row */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              {/* Total Patients Card */}
              <Card
                sx={{
                  flex: 1,
                  bgcolor: "#1f7f85",
                  borderRadius: 3,
                  color: "white",
                  p: 1,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  minHeight: 60,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                
                  <Box
                    sx={{
                      width: 45,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "rgba(255,255,255,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <GroupsIcon width={15} height={15} />
                  </Box>
                
                  <Box
  sx={{ cursor: "pointer" }}
>
  <Typography sx={{ fontSize: "0.75rem", opacity: 0.9 }}>
    Total Patients
  </Typography>
  <Typography sx={{ fontSize: "1.4rem", fontWeight: 700 }}>
    {totalPatients}
  </Typography>
</Box>

                </Box>
            
       <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={currentMonth}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.25)",
                  color: "white",
                  fontSize: "0.65rem",
                  height: 22,
                }}
              />
              <IconButton sx={{ color: "white", p: 0.5 }}   onClick={() => navigate("/receptionist/dashboard/clients")}
> 
                ↗
              </IconButton>
            </Box>
              </Card>

              {/* Present Doctors Card */}
              <Card
                sx={{
                  flex: 1,
                  bgcolor: "#1f7f85",
                  borderRadius: 3,
                  color: "white",
                  p: 1,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  minHeight: 60,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 45,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "rgba(255,255,255,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PeopleAltIcon width={15} height={15} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", opacity: 0.9 }}>
                      Present Doctors
                    </Typography>
                    <Typography sx={{ fontSize: "1.4rem", fontWeight: 700 }}>
                      {totalDoctors}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton sx={{ color: "white", p: 0.5 }}  onClick={() => navigate("/receptionist/dashboard/schedule")}>
                    ↗
                  </IconButton>
                </Box>
              </Card>

              {/* Total Appointments Card */}
              <Card
                sx={{
                  flex: 1,
                  bgcolor: "#1f7f85",
                  borderRadius: 3,
                  color: "white",
                  p: 1,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  minHeight: 60,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 45,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "rgba(255,255,255,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <EventAvailableIcon width={15} height={15} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", opacity: 0.9 }}>
                      Total Appointment
                    </Typography>
                    <Typography sx={{ fontSize: "1.4rem", fontWeight: 700 }}>
                      {data.totalAppointments}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton sx={{ color: "white", p: 0.5 }} onClick={() => navigate("/receptionist/dashboard/appointments")}> 
                    ↗
                  </IconButton>
                </Box>
              </Card>
            </Box>

            {/* Upcoming Appointments Component */}
            <Box sx={{ width: "100%" }}>
              <UpcomingAppointments />
            </Box>
          </Box>
        </Grid>

        {/* Right Column - Available Doctors */}
        <Grid item xs={12} md={4.5}>
          <AvailableDoctorsCard />
        </Grid>
      </Grid>
    </Box>
  );
}