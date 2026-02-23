import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Avatar,
  IconButton,
} from '@mui/material';
import api from "./services/api"; // adjust path if needed
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { ReactComponent as Stethoscope } from './doctorimages/stethoscope.svg';
import MonthlyAppointmentGraph from './MonthlyAppoinmentsGraph';
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  // const [isClockedIn, setIsClockedIn] = useState(false);
  const [monthlyVisitors, setMonthlyVisitors] = useState([]);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attendance, setAttendance] = useState({
    clockIn: null,
    clockOut: null,
  });
  const isClockedIn = !!attendance.clockIn && !attendance.clockOut;
  const isClockedOut = !!attendance.clockOut;
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [pastAttendance, setPastAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [theme, setTheme] = useState({});
  
    const fetchTheme = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_URL}/api/theme`, {
          method: "GET",
          credentials: "include",
        });
        const json = await res.json();
  
        if (!res.ok || !json.success) {
          alert("Failed to load theme", "error");
          setTheme({});
        } else {
          setTheme({ ...(json.data || {}) });
          console.log("Theme loaded:", json.data);
        }
      } catch (err) {
        console.error(err);
        alert("Network error while loading theme", "error");
        setTheme({});
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchTheme();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



  const staffName = localStorage.getItem('name');
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    fetchTodayAttendance();
    fetchTodayAppointments();
    fetchLast10DaysAttendance();
    fetchRecentPatients();
    fetchMonthlyVisitors();

  }, []);

  const fetchMonthlyVisitors = async () => {
    try {
      const res = await api.get("/appointment/appointments/monthly-visitors");

      if (res.data.success) {
        setMonthlyVisitors(res.data.data);
      }
    } catch (error) {
      console.error("Monthly visitors fetch error:", error);
    }
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
  const fetchRecentPatients = async () => {
    try {
      setRecentLoading(true);

      const today = new Date().toISOString().split("T")[0];

      const res = await api.get("/api/sessions",{
        params: { date: today },
      });

      if (res.data.success && res.data.sessions?.length) {
        const completed = res.data.sessions
          .filter((apt) => apt.status === "scheduled")
          .slice(0, 3) // last 10 (already sorted from backend)
          .map((apt, index) => ({
            sNo: index + 1,
            name: apt.client_name,
            appointed: apt.session_date || "-",
            date: apt.start_time,        // 09:00 AM
            time: apt.status, // 25/12/2025
          }));

        setRecentPatients(completed);
      } else {
        setRecentPatients([]);
      }
    } catch (error) {
      console.error("Recent patients fetch error:", error);
      setRecentPatients([]);
    } finally {
      setRecentLoading(false);
    }
  };

  const buildGraphPoints = () => {
    if (monthlyVisitors.length === 0) return "";

    const maxCount = Math.max(...monthlyVisitors.map(v => v.count), 1);

    return monthlyVisitors
      .map((item, index) => {
        const x = 10 + index * (80 / Math.max(monthlyVisitors.length - 1, 1));
        const y = 90 - (item.count / maxCount) * 70;
        return `${x},${y}`;
      })
      .join(" ");
  };


  const fetchTodayAppointments = async () => {
    try {
      setAppointmentsLoading(true);

      const today = new Date().toISOString().split("T")[0];

      const res = await api.get("api/sessions", {
        params: { date: today },
      });

      if (res.data.success) {
        const formattedAppointments = res.data.sessions.map((apt) => ({
          id: apt.id,
          name: apt.client_name,
          issue: apt.session_date || "General Consultation",
          type: apt.status || "Pending",
          tags: [
            `${formatTime(apt.start_time)} - ${formatTime(apt.end_time)}`,
          ],
        }));

        setAppointments(formattedAppointments);
        console.log("Today's appointments:", formattedAppointments);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Fetch appointments error:", error);
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  };


  const handleClockIn = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.post("api/attendance/clock-in");

      if (res.data.success) {
        await fetchTodayAttendance(); // 🔥 single source of truth
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
        await fetchTodayAttendance(); // 🔥 always sync from DB
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

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    return date.toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return "-";

    const [h1, m1] = clockIn.split(":").map(Number);
    const [h2, m2] = clockOut.split(":").map(Number);

    const start = h1 * 60 + m1;
    const end = h2 * 60 + m2;

    const diff = end - start;
    if (diff <= 0) return "-";

    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;

    return `${hrs}h ${mins}m`;
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
              isLeave || !row.clock_in
                ? "-"
                : `${formatTime(row.clock_in)} - ${formatTime(row.clock_out)}`,
          };
        });

        setPastAttendance(formatted);
              console.log("Last 10 days attendance response:", formatted);

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


  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        boxSizing: "border-box",
        p: { xs: 2, md: 1 },   // ✅ IMPORTANT
      }}
    >


      {/* Header Section */}
      <Grid
        container
        spacing={{ xs: 2, md: 1 }}
        sx={{ mb: { xs: 2, md: 2 } }}
      >

        {/* Welcome Card */}
        <Grid item xs={12} md={8} sx={{ width: { md: "68%", xs: "100%" } }} >
          <Card
            sx={{
              width: "100%",
              background: `linear-gradient(120deg, ${theme.sidebar_bg} 0%, ${theme.app_bg} 120%)`,
              borderRadius: 3,
              color: theme.text_color,
              position: "relative",
              overflow: "hidden",
              minHeight: { xs: 150, md: 185 },
              display: "flex",
              alignItems: "center",
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3 }, width: "100%" }}>
              <Typography sx={{ fontSize: { xs: "1.5rem", md: "2rem" }, fontWeight: 700 }}>
                Hello  {staffName}
              </Typography>
              <Typography sx={{ opacity: 0.95 }}>
                {getGreeting()}
              </Typography>

              <Typography sx={{ opacity: 0.95 }}>Have a good day</Typography>
            </CardContent>
            <IconButton>
              <Stethoscope width={100} height={100} />

            </IconButton>
          </Card>
        </Grid>

        {/* Clock Card */}
        <Grid item xs={12} md={4} sx={{ width: { md: "30%", xs: "100%", p: 2 } }}>
          <Card
            sx={{
              width: "100%",
              backgroundColor: theme.sidebar_bg,
              borderRadius: 4,
              color: theme.text_color,
              minHeight: 185,
            }}
          >
            <CardContent sx={{ p: 3 }}>

              {/* Title */}
              <Typography
                sx={{
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  pb: 1,
                  mb: 2,
                  borderBottom: `2px solid ${theme.text_color}`,
                }}
              >
                Clock In / Out
              </Typography>

              {/* ===== ROW 1 ===== */}
              <Grid container sx={{ mb: 2, display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <Grid item xs={6} textAlign="center">
                  <Typography sx={{ opacity: 0.85, fontSize: "0.9rem" }}>
                    Clock In
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
                    {attendance.clockIn ? formatTime(attendance.clockIn) : "-"}
                  </Typography>
                </Grid>

                <Grid item xs={6} textAlign="center">
                  <Typography sx={{ opacity: 0.85, fontSize: "0.9rem" }}>
                    Clock Out
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
                    {attendance.clockOut ? formatTime(attendance.clockOut) : "-"}
                  </Typography>
                </Grid>
              </Grid>

            </CardContent>
          </Card>
        </Grid>



      </Grid>



      {/* Main Content Grid */}
      <Grid container spacing={{ xs: 2, md: 2 }} >
        {/* Left Column */}
        <Grid item size={{ xs: 12, sm: 6, md: 4 }} >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>

            <Box sx={{ display: 'flex', flexDirection: { md: 'row', xs: "column" }, gap: { xs: 2, md: 2 } }}>
              {/* Shift Card */}
              <Card sx={{ borderRadius: 2, boxShadow: 2, height: { md: 220, xs: 170 }, bgcolor: theme.app_bg }}>
                <CardContent sx={{ p: { xs: 2, md: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <AccessTimeIcon sx={{ color: theme.sidebar_bg, fontSize: { xs: 24, md: 28 } }} />
                    <Typography sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' }, fontWeight: 600, color: theme.text_color }}>
                      Your Shift Starts at 09:00 AM
                    </Typography>
                  </Box>
                  {/* CLOCK IN */}
                  {!attendance.clockIn && !attendance.clockOut && (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleClockIn}
                      disabled={loading}
                      sx={{
                        bgcolor: theme.primary_color,
                        color:theme.text_color,
                        py: { xs: 1.2, md: 1.5 },
                        fontWeight: 600,
                        textTransform: "none",
                      }}
                    >
                      {loading ? "Processing..." : "Clock - in"}
                    </Button>
                  )}

                  {/* CLOCKED IN → CLOCK OUT */}
                  {attendance.clockIn && !attendance.clockOut && (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleClockOut}
                      disabled={loading}
                      sx={{
                        bgcolor: theme.primary_color,
                        color: theme.text_color,
                        py: { xs: 1.2, md: 1.5 },
                        fontWeight: 600,
                        textTransform: "none",
                        "&:hover": { bgcolor: theme.sidebar_bg },
                      }}
                    >
                      {loading ? "Processing..." : "Clock - out"}
                    </Button>
                  )}
                  {error && (
                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: "0.75rem",
                        color: "error.main",
                        textAlign: "center",
                      }}
                    >
                      {error}
                    </Typography>
                  )}


                  {/* CLOCKED OUT → INFO ONLY */}
                  {attendance.clockIn && attendance.clockOut && (
                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: "0.8rem",
                        color: theme.text_color,
                        textAlign: "center",
                      }}
                    >
                      ✅ You completed today’s attendance
                    </Typography>
                  )}
                  {attendance.clockOut && (
                    <Typography
                      sx={{
                        fontSize: { xs: "0.7rem", md: "0.75rem" },
                        color: theme.text_color,
                        textAlign: "center",
                        mt: 1.5,
                      }}
                    >
                      Last Clock-out : {formatTime(attendance.clockOut)}
                    </Typography>
                  )}

                </CardContent>
              </Card>

              {/* Daily Visitors Chart */}
              {/* <Grid item xs={12} md={6}>
                <MonthlyAppointmentGraph />
              </Grid> */}


              {/* Recent Patients */}

            </Box>
            
          </Box>

        </Grid>
        <Grid item size={{ xs: 12, sm: 6, md: 8 }}>
                <Box>
              <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: theme.app_bg }}>
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Typography sx={{ fontSize: { xs: '0.9rem', md: '1rem' }, fontWeight: 600, color: theme.sidebar_bg, mb: 2 }}>
                    Recent Sessions
                  </Typography>
                  <TableContainer sx={{ maxHeight: { xs: 240, md: 300 } }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ bgcolor: theme.app_bg, fontWeight: 600, color: theme.sidebar_bg, fontSize: { xs: 10, md: 12 }, p: 1 }}>#</TableCell>
                          <TableCell sx={{ bgcolor: theme.app_bg, fontWeight: 600, color: theme.sidebar_bg, fontSize: { xs: 10, md: 12 }, p: 1 }}>Client Name</TableCell>
                          <TableCell sx={{ bgcolor: theme.app_bg, fontWeight: 600, color: theme.sidebar_bg, fontSize: { xs: 10, md: 12 }, p: 1 }}>Date</TableCell>
                          <TableCell sx={{ bgcolor: theme.app_bg, fontWeight: 600, color: theme.sidebar_bg, fontSize: { xs: 10, md: 12 }, p: 1 }}>Time</TableCell>
                          <TableCell sx={{ bgcolor: theme.app_bg, fontWeight: 600, color: theme.sidebar_bg, fontSize: { xs: 10, md: 12 }, p: 1 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentPatients.map((patient, idx) => (
                          <TableRow key={idx}>
                            <TableCell sx={{ fontSize: { xs: 10, md: 12 }, p: 1, color: theme.text_color }}>{patient.sNo}</TableCell>
                            <TableCell sx={{ fontSize: { xs: 10, md: 12 }, p: 1, color: theme.text_color }}>{patient.name}</TableCell>
                            <TableCell sx={{ fontSize: { xs: 10, md: 12 }, p: 1, color: theme.text_color }}>{patient.appointed}</TableCell>
                            <TableCell sx={{ fontSize: { xs: 10, md: 12 }, p: 1, color: theme.text_color }}>{patient.date}</TableCell>
                            <TableCell sx={{ fontSize: { xs: 10, md: 12 }, p: 1, color: theme.text_color }}>{patient.time}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <Box sx={{ textAlign: "center", mt: 2 }}>
                        <Typography
                          onClick={() => navigate("/doctor/dashboard/appointments")}
                          sx={{
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: theme.sidebar_bg,
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          Read more →
                        </Typography>
                      </Box>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
        </Grid>

        {/* Middle Column - Appointments */}
        <Grid item size={{ xs: 12, sm: 6, md: 4 }} >
          <Card sx={{ bgcolor: theme.sidebar_bg, borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: { xs: 5, md: 2 } }}>
              <Typography sx={{ fontSize: { xs: '0.9rem', md: '1rem' }, fontWeight: 600, color: theme.text_color, mb: 2 }}>
                Today Sessions
              </Typography>
              <Box sx={{ maxHeight: { xs: 500, md: 650 }, overflowY: 'auto' }}>
                {appointmentsLoading ? (
                  <Typography sx={{ textAlign: "center", fontSize: "0.85rem",color: theme.text_color }}>
                    Loading sessions...
                  </Typography>
                ) : appointments.length === 0 ? (
                  <Typography sx={{ textAlign: "center", fontSize: "0.85rem", color: theme.text_color }}>
                    No appointments for today
                  </Typography>
                ) : (
                  appointments.map((apt, idx) => (
                    <Card key={apt.id || idx} sx={{ mb: 1.5, borderRadius: 1.5 }}>
                      <CardContent sx={{ p: 1 }}>
                        <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
                          <Avatar sx={{ bgcolor: theme.sidebar_bg, color: theme.text_color }}>
                            {apt.name.charAt(0)}
                          </Avatar>

                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 600, color: theme.sidebar_bg }}>
                              {apt.name}
                            </Typography>

                            <Typography sx={{ fontSize: "0.75rem", color: theme.sidebar_bg, mb: 1 }}>
                              {apt.issue}
                            </Typography>

                            <Chip
                              label={apt.type}
                              size="small"
                              sx={{
                                bgcolor: "#ffecd1",
                                color: "#d97706",
                                height: 22,
                                fontSize: 11,
                              }}
                            />
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                          {apt.tags.map((tag, i) => (
                            <Chip
                              key={i}
                              label={tag}
                              size="small"
                              sx={{
                                bgcolor: theme.sidebar_bg,
                                color: theme.text_color,
                                border: `1px solid ${theme.text_color}`,
                                height: 22,
                                fontSize: 11,
                              }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}

              </Box>
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography
                  onClick={() => navigate("/doctor/dashboard/appointments")}
                  sx={{
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: theme.text_color,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Read more →
                </Typography>
              </Box>

            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Attendance */}
        <Grid item size={{ xs: 12, sm: 6, md: 3 }} >
          <Card sx={{ bgcolor: theme.sidebar_bg, borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: { xs: 2, md: 2 } }}>
              <Typography sx={{ fontSize: { xs: '0.9rem', md: '1rem' }, fontWeight: 600, color: theme.text_color, mb: 2 }}>
                Past Attendance
              </Typography>
              <Box sx={{ maxHeight: { xs: 500, md: 650 }, overflowY: 'auto' }}>
                {attendanceLoading ? (
                  <Typography sx={{ textAlign: "center", fontSize: "0.85rem", color: theme.text_color }}>
                    Loading attendance...
                  </Typography>
                ) : pastAttendance.length === 0 ? (
                  <Typography sx={{ textAlign: "center", fontSize: "0.85rem", color: theme.text_color }}>
                    No attendance records found
                  </Typography>
                ) : (
                  <Grid item xs={12}>
                    {pastAttendance.map((item, index) => (
                      <Card
                        key={index}
                        sx={{
                          mb: 1.5,
                          borderRadius: 2,
                          boxShadow: `0px 2px 8px ${theme.text_color}`,
                          bgcolor: theme.app_bg,
                          width: { xs: 180, md: 180 },
                          p: { xs: 1, md: 1 }
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          {/* Top row */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 0.8,
                            }}
                          >
                            <Typography sx={{ fontSize: "0.75rem", color: theme.text_color }}>
                              {item.date}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color:
                                  item.status === "leave" || item.status === "absent"
                                    ? theme.text_color
                                    : theme.text_color,
                              }}
                            >
                              {item.status === "present" ? "In & Out" : item.status}
                            </Typography>
                          </Box>

                          {/* Total Hours */}
                          <Typography
                            sx={{
                              fontSize: "1.4rem",
                              fontWeight: 700,
                              color: theme.sidebar_bg,
                              lineHeight: 1.2,
                              mb: 0.5,
                            }}
                          >
                            {item.totalHours}
                          </Typography>

                          {/* Time Range */}
                          <Typography
                            sx={{
                              fontSize: "0.85rem",
                              color: theme.text_color,
                            }}
                          >
                            {item.clockIn && item.clockOut
                              ? `${formatTime(item.clockIn)} - ${formatTime(item.clockOut)}`
                              : "-"}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                    <Box sx={{ textAlign: "center", mt: 2 }}>
                      <Typography
                        onClick={() => navigate("/doctor/dashboard/attendance")}
                        sx={{
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: theme.text_color,
                          "&:hover": {
                            textDecoration: "underline",
                          },
                        }}
                      >
                        Read more →
                      </Typography>
                    </Box>
                  </Grid>

                )}

              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box >
  );
}