import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Card,
  Stack,
  useMediaQuery,
  useTheme,
  MenuItem,
  TextField,
  IconButton,
  Pagination
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "./services/api";
import CircleIcon from '@mui/icons-material/Circle';
import LeaveRequestDialog from "./LeaveRequestDialog";
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOffIcon from "@mui/icons-material/PersonOff";
import Divider from '@mui/material/Divider';
import AttendanceRequestDialog from './AttendanceRequest';
import { ReactComponent as DoctorProfile } from "./doctorimages/user.svg";
import { ReactComponent as EmployeeId } from "./doctorimages/member-card.svg";
import { ReactComponent as EmployeeDate } from "./doctorimages/register.svg";
import { ReactComponent as WorkingTime } from "./doctorimages/working-time.svg";
import { ReactComponent as ClockIn } from "./doctorimages/clock-6.svg";
import { ReactComponent as ClockOut } from "./doctorimages/clock-9.svg";
import { ReactComponent as Leave } from "./doctorimages/leave.svg";
import LeaveStatusPopup from "./LeaveStatus";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import DoctorAttendanceDialog from "./DoctorsAttendanceDialog";
import FactCheckIcon from "@mui/icons-material/FactCheck"; // attendance list / approval
import FreeCancellationIcon from "@mui/icons-material/FreeCancellation"; // cancel / leave

const now = new Date();

export default function Attendance() {
  const [staff, setStaff] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openLeave, setOpenLeave] = useState(false);
  const [openAttendanceRequest, setOpenAttendanceRequest] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [filteredData, setFilteredData] = useState([]);
  const [countleave, setCountLeave] = useState(0);
  const staffName = localStorage.getItem('name');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [self, setSelf] = useState(null);
  const [leaveStatusOpen, setLeaveStatusOpen] = useState(false);
  const [openAttendance, setOpenAttendance] = useState(false);

  const handleLeaveStatusOpen = () => setLeaveStatusOpen(true);
const handleLeaveStatusClose = () => setLeaveStatusOpen(false);
  const rowsPerPage = 5;

  const normalizeDateParts = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d)) return null;
    return {
      day: d.getDate().toString(),
      month: d.toLocaleString("en-US", { month: "short" }).toLowerCase(),
      monthFull: d.toLocaleString("en-US", { month: "long" }).toLowerCase(),
      year: d.getFullYear().toString(),
    };
  };

  useEffect(() => {
    if (attendanceData.length > 0) {
      handleSearch(); // auto-filter current month
    }
  }, [attendanceData]);

  const showValue = (val) => {
    if (val === null || val === undefined) return "-";
    if (val === 0 || val === "0.00") return "-";
    if (String(val).trim() === "") return "-";
    return val;
  };

  const filteredAttendance = filteredData;
  const totalPages = Math.ceil(filteredAttendance.length / rowsPerPage);
  const paginatedData = filteredAttendance.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  useEffect(() => {
    fetchData();
    fetchLeaveCount();
  }, []);

  const handlePageChange = (event, value) => setPage(value);
  const handleLeaveToggle = () => setOpenLeave((prev) => !prev);
  const handleAttendanceRequest = () => setOpenAttendanceRequest((prev) => !prev);
  const today = new Date().toISOString().slice(0, 10);

  const fetchData = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      const [selfRes, staffRes, attendanceRes] = await Promise.all([
        api.get("/api/staff/self"), // <-- NEW: logged-in staff data
        api.get("/api/attendance/date", {
          params: { date: today },
        }),
        api.get("/api/attendance/all"),
      ]);

      console.log("self data:", selfRes);
      console.log("attendance data is", staffRes, attendanceRes);

      // staff/self data
      setSelf(selfRes.data?.data || null);   // create state: const [self, setSelf] = useState(null);

      // attendance/date result
      setStaff(staffRes.data?.data || []);

      // attendance/all results
      setAttendanceData(attendanceRes.data?.data || []);
      setFilteredData(attendanceRes.data?.data || []);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };



  const fetchLeaveCount = async () => {
    try {
      const res = await api.get("/api/attendance/all");
      const attendance = res.data.data || [];
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const leaveCount = attendance.filter(item => {
        if (!item.date) return false;
        const attendanceDate = new Date(item.date);
        return (
          item.status === "absent" &&
          attendanceDate.getMonth() === currentMonth &&
          attendanceDate.getFullYear() === currentYear
        );
      }).length;

      setCountLeave(leaveCount);

    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  const years = [...new Set(
    attendanceData
      .map(a => new Date(a.date))
      .filter(d => !isNaN(d))
      .map(d => d.getFullYear())
  )];


  const handleSearch = () => {
    if (selectedMonth === null || selectedYear === null) return;

    const filtered = attendanceData.filter(item => {
      const d = new Date(item.date);
      return (
        d.getMonth() === Number(selectedMonth) &&
        d.getFullYear() === Number(selectedYear)
      );
    });

    setFilteredData(filtered);
    setPage(1);
  };


  const handleClear = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
    setFilteredData(attendanceData);
    setPage(1);
  };

  // ✅ Updated function: send attendance request to admin
  const sendAttendanceRequest = async (row) => {
    try {
      const res = await api.post("/api/notifications/staff-request", {
        title: `Attendance Update Request - ${row.date}`,
        message: `Requesting update for my attendance on ${new Date(row.date).toLocaleDateString('en-IN')}.`,
      });
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("Failed to send request");
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!staff) return <Typography>No Staff Data</Typography>;

  return (
    <Box sx={{ width: "97%", maxWidth: "100%", p: { xs: 1, sm: 3, md: 3 }, backgroundColor: "#f5f8fb" }}>

      {/* Top Cards */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3} sx={{ display: { xs: "none", md: "block", sm: "block" } }}>
          <Paper sx={{ ...cardStyle, backgroundColor: "#CCE0E1", width: 200, height: 55, borderTopLeftRadius: 20, borderBottomRightRadius: 20, bordeTopRightRadius: 0, borderBottomLeftRadius: 0 }}>
            <IconButton
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",       // makes it a circle
                bgcolor: "#0F3B3C",        // background color
                color: "white",          // icon color
                "&:hover": {
                  bgcolor: "#b7d3d4",
                  color: "#0F3B3C"
                },
              }}
            >
              <DoctorProfile width={20} height={20} />
            </IconButton>
                
            
            <Typography fontSize={{ xs: 14, md: 15, lg: 15}} fontWeight={700}>{self.name}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3} sx={{ display: { xs: "none", md: "block", sm: "block" } }}>
          <Paper sx={{ ...cardStyle, backgroundColor: "#CCE0E1", width: 200, height: 55, borderTopLeftRadius: 20, borderBottomRightRadius: 20, bordeTopRightRadius: 0, borderBottomLeftRadius: 0 }}>
            <IconButton
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",       // makes it a circle
                bgcolor: "#0F3B3C",        // background color
                color: "white",          // icon color
                "&:hover": {
                  bgcolor: "#b7d3d4",
                  color: "#0F3B3C"
                },
              }}
            >
              <EmployeeId width={30} height={30} />
            </IconButton>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
             <Typography fontSize={{ xs: 14, md: 15, lg: 15}} fontWeight={700}>EmployeeId</Typography>
             <Typography fontSize={{ xs: 14, md: 15, lg: 15}} fontWeight={700}>{self.id}</Typography>
            </Box>

          </Paper>
        </Grid>
        <Grid item xs={12} md={3} sx={{ display: { xs: "none", md: "block", sm: "block" } }}>
          <Paper sx={{ ...cardStyle, backgroundColor: "#CCE0E1", width: 200, height: 55, borderTopLeftRadius: 20, borderBottomRightRadius: 20, bordeTopRightRadius: 0, borderBottomLeftRadius: 0 }}>
            <IconButton
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",       // makes it a circle
                bgcolor: "#0F3B3C",        // background color
                color: "white",          // icon color
                "&:hover": {
                  bgcolor: "#b7d3d4",
                  color: "#0F3B3C"
                },
              }}
            >
              <EmployeeDate width={30} height={30} />
            </IconButton>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
             <Typography fontSize={{ xs: 14, md: 15, lg: 15}} fontWeight={700}>DOJ</Typography>
             <Typography fontSize={{ xs: 14, md: 15, lg: 15}} fontWeight={700}>{new Date(self.date_of_joining).toLocaleDateString("en-GB")}</Typography>

            </Box>
          </Paper>
        </Grid>

        {/* Leave Button */}
        <Grid item xs={12} md={3}>
          <Box display="flex" flexDirection="column" justifyContent="flex-end" gap={2} sx={{ mt: { xs: 2, md: -3 }, ml: { xs: 0, md: 2 } }}>
           <Button
  variant="contained"
  startIcon={<EventAvailableIcon />}
  sx={{
    height: 45,
    textTransform: "none",
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: "#437986",
    mt:2
  }}
  onClick={handleAttendanceRequest}
>
  Attendance Update Request
</Button>

 <Button
  variant="contained"
  startIcon={<TimeToLeaveIcon />}
  sx={{
    height: 45,
    width: { md: 220, xs: 290 },
    textTransform: "none",
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: "#437986",
    display:{md:"none",xs:"flex"}
  }}
  onClick={() => setOpenAttendance(true)}
>
  Doctors Attendance
</Button>


            <AttendanceRequestDialog open={openAttendanceRequest} onClose={handleAttendanceRequest} />

          
          </Box>
        </Grid>
      </Grid>

      {/* Time Cards */}
      <Grid
        container
        spacing={{ xs: 2, sm: 2, md: 2 }}
        mt={3}
        sx={{
          display: { xs: "none", sm: "flex", md: "flex" }, // 👈 flex at md
          flexWrap: "nowrap",                              // 👈 stay in single row
        }}
      >

        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={timeCard}>

            <IconButton
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",       // makes it a circle
                border: "1px solid white",
                color: "white",
                padding: 1,
                m: 1,        // icon color
                "&:hover": {
                  bgcolor: "#b7d3d4",
                  color: "#0F3B3C"
                },
              }}
            >
              <WorkingTime width={30} height={30} />
            </IconButton>


            <Typography variant="h5" fontWeight="500" fontSize={15} color="#white">08:00</Typography>
            <Typography variant="body2" color="#white">Working Hours</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={timeCard}>


            <IconButton
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",       // makes it a circle
                border: "1px solid white",
                color: "white",
                padding: 1,
                m: 1,       // icon color
                "&:hover": {
                  bgcolor: "#b7d3d4",
                  color: "#0F3B3C"
                },
              }}
            >
              <ClockOut width={30} height={30} />
            </IconButton>

            <Typography variant="h5" fontWeight="500" fontSize={15} color="#white">09:00AM</Typography>
            <Typography variant="body2" color="#white">Daily Clock - IN</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={timeCard}>
            <IconButton
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",       // makes it a circle
                border: "1px solid white",
                color: "white",
                padding: 1,
                m: 1,       // icon color
                "&:hover": {
                  bgcolor: "#b7d3d4",
                  color: "#0F3B3C"
                },
              }}
            >
              <ClockIn width={30} height={30} />

            </IconButton>

            <Typography variant="h5" fontWeight="500" fontSize={15} color="#white">06:00PM</Typography>
            <Typography variant="body2" color="#white">Daily Clock - Out</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2} >
          <Paper sx={timeCard}>
            <IconButton
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",       // makes it a circle
                border: "1px solid white",
                color: "white",
                m: 1,        // icon color
                "&:hover": {
                  bgcolor: "#b7d3d4",
                  color: "#0F3B3C"
                },
              }}
            >
              <Leave width={30} height={30} />

            </IconButton>
            <Typography variant="h5" fontWeight="500" fontSize={15} color="#white">{countleave || '00'}</Typography>
            <Typography variant="body2" color="#white">Used Leaves</Typography>
          </Paper>
        </Grid>
       <Grid
  item
  xs={12}
  md={2}   // 👈 occupies 2 columns on desktop
  sx={{
    display: "flex",
    flexDirection: "column",
    gap: 4,              // space between buttons
    alignItems: "center" // optional: center buttons
  }}
>
  <Button
    variant="contained"
    startIcon={<FreeCancellationIcon />}
    sx={{
      height: 45,
      width: { md: 220, xs: 200 },
      textTransform: "none",
      borderTopLeftRadius: 20,
      borderBottomRightRadius: 20,
      backgroundColor: "#437986",
    }}
    onClick={handleLeaveToggle}
  >
    Leave Request
  </Button>

  <LeaveRequestDialog
    open={openLeave}
    onClose={handleLeaveToggle}
  />

 <Button
  variant="contained"
  startIcon={<FactCheckIcon />}
  sx={{
    height: 45,
    width: { md: 220, xs: 200 },
    textTransform: "none",
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: "#437986",
  }}
  onClick={() => setOpenAttendance(true)}
>
  Doctors Attendance
</Button>

<DoctorAttendanceDialog
  open={openAttendance}
  onClose={() => setOpenAttendance(false)}
/>
</Grid>

       
      </Grid>

      {/* Search Filter */}
     {/* Search Filter + Leave Status */}
<Box mb={2}>
  <Box
    display="flex"
    flexDirection={isMobile ? "column" : "row"}
    justifyContent="space-between"
    alignItems={isMobile ? "stretch" : "center"}
    gap={isMobile ? 2 : 0}
    mt={4}
  >
    {/* Leave Status Button */}
    <Box flexShrink={0}>
      <Button
  variant="contained"
  startIcon={<AssignmentTurnedInIcon />}
  sx={{
    height: 45,
    textTransform: "none",
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: "#437986",
    width: isMobile ? "100%" : "auto",
    mb: isMobile ? 1 : 0,
  }}
  onClick={handleLeaveStatusOpen}
>
  Leave Status
</Button>
    </Box>

    {/* Filters */}
    <Box
      display="flex"
      gap={2}
      flexWrap="wrap"
      mt={isMobile ? 2 : 0}
      justifyContent={isMobile ? "flex-start" : "flex-end"}
    >
      <TextField
        select
        size="small"
        label="Month"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        sx={{ width: { md: 160, xs: "100%" } }}
      >
        {months.map((m) => (
          <MenuItem key={m.value} value={m.value}>
            {m.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        label="Year"
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        sx={{ width: { md: 120, xs: "100%" } }}
      >
        {years.map((y) => (
          <MenuItem key={y} value={y}>
            {y}
          </MenuItem>
        ))}
      </TextField>

      <Button
        sx={{
          backgroundColor: "#107881",
          color: "white",
          borderRadius: "10px",
          fontSize: { xs: 12, md: 15 },
          width: isMobile ? "100%" : "auto",
          textTransform: "none"
        }}
        onClick={handleSearch}
      >
        Search
      </Button>

      <Button
        sx={{
          color: "#107881",
          border: "1px solid #107881",
          borderRadius: "10px",
          fontSize: { xs: 12, md: 15 },
          width: isMobile ? "100%" : "auto",
          textTransform: "none"
        }}
        onClick={handleClear}
      >
        Clear
      </Button>
    </Box>
  </Box>

  {/* Leave Status Popup */}
  <LeaveStatusPopup open={leaveStatusOpen} onClose={handleLeaveStatusClose} />
</Box>


      {/* Attendance Table */}
      {!isMobile ? (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { color: 'white', backgroundColor: "#107881", border: "2px solid #107881", fontWeight: 400, fontSize: 18, mb: 5, textAlign: "center" } }}>
                <TableCell sx={{ border: "2px solid #072629ff" }}>Date</TableCell>
                <TableCell sx={{ border: "2px solid #072629ff" }}>Check In</TableCell>
                <TableCell sx={{ border: "2px solid #072629ff" }}>Check Out</TableCell>
                <TableCell sx={{ border: "2px solid #072629ff" }}>Working Hours</TableCell>
                <TableCell sx={{ border: "2px solid #072629ff" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow key={row.id} >
                  <TableCell sx={{ textAlign: "center" }}>{new Date(row.date).toLocaleDateString("en-IN")}</TableCell>
                  <TableCell sx={{ textAlign: "center", backgroundColor: '#CCE0E1' }}>{row.clock_in || "—"}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{row.clock_out || "—"}</TableCell>
                  <TableCell sx={{ textAlign: "center", backgroundColor: '#CCE0E1' }}>
                    {row.total_hours || "—"}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Chip
                      size="small"
                      label={row.status}
                      sx={{
                        px: 1,
                        fontWeight: 600,
                        textTransform: "capitalize",

                        // dynamic colors
                        backgroundColor:
                          row.status === "present"
                            ? "#80BECD"      // bg blue
                            : row.status === "absent"
                              ? "#FDE0DF"      // bg light red
                              : "#FFE8CC",     // bg light orange

                        color:
                          row.status === "present"
                            ? "#0F3B3C"      // text dark teal/blue
                            : row.status === "absent"
                              ? "#B71C1C"      // text dark red
                              : "#E65100",     // text dark orange

                        border: "1px solid",
                        borderColor:
                          row.status === "present"
                            ? "#0F3B3C"      // border blue
                            : row.status === "absent"
                              ? "#F44336"      // border red
                              : "#FF9800",     // border orange

                        borderRadius: 10,
                        fontSize: 12
                      }}
                    />

                  </TableCell>

                  {/* <TableCell align="center">
                    {row.clock_in && !row.clock_out ? (
                      <Button size="small" variant="outlined" color="primary" onClick={() => sendAttendanceRequest(row)}>
                        Request Update
                      </Button>
                    ) : (
                      <Typography fontSize={12} color="text.secondary">—</Typography>
                    )}
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ mt: 2 }}>
          {paginatedData.map((row, index) => (
            <Card
              key={index}
              elevation={3}
              sx={{
                mb: 2,
                borderRadius: 3,
                p: 2,
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
              }}
            >
              {/* Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={700}>
                  {new Date(row.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </Typography>

                <Chip
                  size="small"
                  label={row.status?.toLowerCase()}
                  sx={{
                    fontWeight: 600,
                    bgcolor:
                      row.status === "present"
                        ? "#3B82F6"        // blue
                        : row.status === "absent"
                          ? "#EF4444"        // red
                          : "#FACC15",       // yellow
                    color: "white",
                  }}
                />
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              {/* Check in / out */}
              <Stack spacing={1.2}>
                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LoginIcon fontSize="small" />
                    <Typography variant="body2" sx={{ color: "#0F3B3C" }}>Check In</Typography>
                  </Stack>
                  <Typography fontWeight={600}>{showValue(row.clock_in)}</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LogoutIcon fontSize="small" />
                    <Typography variant="body2" sx={{ color: "#0F3B3C" }}>Check Out</Typography>
                  </Stack>
                  <Typography fontWeight={600}>{showValue(row.clock_out)}</Typography>
                </Stack>
              </Stack>

              {/* Total hours pill */}
              <Box
                sx={{
                  mt: 2,
                  p: 1.2,
                  borderRadius: 2,
                  bgcolor: "#EEF2FF",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <ScheduleIcon fontSize="small" />
                  <Typography variant="body2" sx={{ color: "#0F3B3C" }}>Total Working Hours</Typography>
                </Stack>

                <Typography fontWeight={700} sx={{ color: "#0F3B3C" }}>
                  {showValue(row.total_hours)}
                </Typography>
              </Box>
            </Card>
          ))}
        </Box>
        /* ⬆⬆ MOBILE CARD VIEW ONLY ⬆⬆ */
      )
      }

      <Box display="flex" justifyContent="center" mt={3} mb={2}>
        <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" size={isMobile ? "small" : "medium"} showFirstButton showLastButton />
      </Box>
    </Box>
  );
}

/* ---------------- styles ---------------- */
const cardStyle = { p: 2, display: "flex", alignItems: "center", gap: 2 };
const cardStyleBlue = { ...cardStyle, background: "#e6f7ff" };
const cardStyleDark = { ...cardStyle, background: "#eaf1ff" };
const timeCard = { backgroundColor: "#437986 !important", color: "white", p: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 100, width: 160, borderRadius: 2, transition: "transform 0.2s, box-shadow 0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: 3 } };