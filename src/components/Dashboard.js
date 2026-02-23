import { useEffect, useState } from "react";
import axios from "axios";
import StaffServiceAnalytics from "./StaffServiceAnalytics";
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Paper,
    Divider,
    Button,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import ReceiptIcon from "@mui/icons-material/Receipt";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const StatCard = ({ title, value, icon }) => (
    <Card
        sx={{
            width: "100%",
            height: "100%",
        }}
    >
        <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
                {icon}
                <Box>
                    <Typography variant="body2" color="text.secondary">
                        {title}
                    </Typography>
                    <Typography variant="h5" fontWeight={600}>
                        {value}
                    </Typography>
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const DEFAULT_THEME = {
  app_bg: "#ffffff",
  sidebar_bg: "#107881",
  topbar_bg: "#107881",
  text_color: "#ffffff",
  primary_color: "#107881",
};

const API_BASE = process.env.REACT_APP_URL || "";

export default function Dashboard() {
    const [staffCount, setStaffCount] = useState(0);
    const [clientCount, setClientCount] = useState(0);
    const [appointments, setAppointments] = useState(0);
    const [billsCount, setBillsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [staffs, setStaffs] = useState([]);
    const [clients, setClients] = useState([]);
    const [bills, setBills] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [appointmentsdata, setAppointmentsdata] = useState([]);
    const [doctorpresentcount, setDoctorpresentcount] = useState(0);
    const [doctorabsentcount, setDoctorabsentcount] = useState(0);
    const currentYear = new Date().getFullYear();
    const [theme, setTheme] = useState(DEFAULT_THEME);

    const [selectedMonth, setSelectedMonth] = useState(
        `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
    );

    const [weeklyStats, setWeeklyStats] = useState([]);

    const navigate = useNavigate();
    const today = dayjs().format("YYYY-MM-DD");

    const months = [
        { label: "January", value: "01" },
        { label: "February", value: "02" },
        { label: "March", value: "03" },
        { label: "April", value: "04" },
        { label: "May", value: "05" },
        { label: "June", value: "06" },
        { label: "July", value: "07" },
        { label: "August", value: "08" },
        { label: "September", value: "09" },
        { label: "October", value: "10" },
        { label: "November", value: "11" },
        { label: "December", value: "12" },
    ];

    useEffect(() => {
        fetchWeeklyAppointments();
    }, [selectedMonth]);

    const fetchWeeklyAppointments = async () => {
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_URL}/review/admin/reviews`,
                {
                    withCredentials: true,
                }
            );
            console.log("Weekly Stats:", res.data);
            setWeeklyStats(res.data.reviews || []);
        } catch (err) {
            console.error(err);
            setWeeklyStats([]);
        }
    };


    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const [
                staffRes,
                clientRes,
                appointmentRes,
                // billsRes,
                attendanceRes,
                doctorAttendanceRes,
            ] = await Promise.all([
                fetch(process.env.REACT_APP_EMPLOYEE_FETCH, { credentials: "include" }),
                fetch(process.env.REACT_APP_CLIENT_FETCH, { credentials: "include" }),
                fetch(`${process.env.REACT_APP_URL}/api/sessions?date=${today}`, {
                    credentials: "include",
                }),
                // fetch(process.env.REACT_APP_BILL_FETCH, { credentials: "include" }),
                fetch(`${process.env.REACT_APP_URL}/api/attendance/date?date=${today}`,
                    { credentials: "include" }
                ),
                fetch(`${process.env.REACT_APP_URL}/api/attendance/doctors?date=${today}`,
                    { credentials: "include" }
                )
            ]);

            const staffData = await staffRes.json();
            const clientData = await clientRes.json();
            const appointmentData = await appointmentRes.json();
            // const billsData = await billsRes.json();
            const attendanceData = await attendanceRes.json();
            const doctorAttendanceData = await doctorAttendanceRes.json();

            console.log(staffData, clientData, appointmentData, attendanceData);

            setStaffCount(staffData.data?.length || 0);
            setClientCount(clientData.data?.length || 0);
            setAppointments(appointmentData?.count ?? 0);
            // setBillsCount(billsData.length || 0);
            setStaffs(staffData.data || []);
            setClients(clientData.data || []);
            // setBills(billsData || []);
            setAttendance(attendanceData.data || []);
            setAppointmentsdata(appointmentData.sessions || []);
            setDoctorpresentcount(doctorAttendanceData.presentCount || 0);
            setDoctorabsentcount(doctorAttendanceData.leaveCount || 0);
        } catch (error) {
            console.error("Dashboard load error:", error);
        } finally {
            setLoading(false);
        }
    };

    const visibleAppointments = appointmentsdata.slice(0, 6);
    const visibleAttendance = attendance.slice(0, 6);

        const fetchTheme = async () => {
          setLoading(true);
          try {
            const res = await fetch(`${API_BASE}/api/theme`, {
              method: "GET",
              credentials: "include",
            });
            const json = await res.json();
      
            if (!res.ok || !json.success) {
              alert("Failed to load theme", "error");
              setTheme(DEFAULT_THEME);
            } else {
              setTheme({ ...DEFAULT_THEME, ...(json.data || {}) });
            }
          } catch (err) {
            console.error(err);
            alert("Network error while loading theme", "error");
            setTheme(DEFAULT_THEME);
          } finally {
            setLoading(false);
          }
        };
      
        useEffect(() => {
          fetchTheme();
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

    if (loading) {
        return (
            <Box height="70vh" display="flex" alignItems="center" justifyContent="center">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div className="dashboard" style={{ fontFamily: "sans-serif" }}>
            {/* Top Cards */}
            <div className="top-cards">
                <div className="card">
                    <div className="card-title">Total Clients</div>
                    <div className="card-value">{clientCount}</div>
                </div>
                <div className="card">
                    <div className="card-title">Total Staff</div>
                    <div className="card-value">{staffCount}</div>
                </div>
                <div className="card">
                    <div className="card-title">Today Sessions</div>
                    <div className="card-value">{appointments}</div>
                </div>
            </div>


            <div className="main-grid">
                {/* Check-in Table */}
                <div className="panel">
                                    <h4 style={{ color: theme.text_color }}>Attendance Overview</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Trainer Name</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                            </tr>
                        </thead >
                        <tbody>
                            {visibleAttendance.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "16px" }}>
                                        No one has checked in today
                                    </td>
                                </tr>
                            ) : (
                                visibleAttendance.map((data, i) => (
                                    <tr key={i}>
                                        <td>{data.name}</td>
                                        <td>{data.clock_in}</td>
                                        <td>{data.clock_out}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table >
                    {attendance.length > 6 && (
                        <div style={{ textAlign: "right", marginTop: "10px" }}>
                            <button
                                onClick={() =>
                                    navigate("/AdminDashboard", {
                                        state: { content: "Attendance" }
                                    })
                                }
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: theme.text_color,
                                    cursor: "pointer",
                                    fontWeight: 500,
                                }}
                            >
                                View All
                            </button>
                        </div>
                    )}
                </div >


                {/* Patient Overview */}
                {/* < div className="panel chart" >
                    <h4>Patient Overview</h4>
                    <div className="bars">
                        {[20, 76, 143, 41, 89].map((v, i) => (
                            <div key={i} className="bar-wrapper">
                                <div className="bar" style={{ height: `${v}px` }} />
                                <span>{v}</span>
                            </div>
                        ))}
                    </div>
                </div > */}
                <div>
                    

                    {weeklyStats.length === 0 ? (
                        <p style={{ textAlign: "center", opacity: 0.6 }}>
                            No Data Available
                        </p>
                    ) : (
                        <div className="panel">
                            <h4 style={{ color: theme.text_color }}>Reviews Overview</h4>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ color: theme.text_color }}>Trainer ID</TableCell>
                                        <TableCell style={{ color: theme.text_color }}>Trainer Name</TableCell>
                                        <TableCell style={{ color: theme.text_color }}>Overall Rating</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {weeklyStats.map((item) => (
                                        <TableRow key={item.staff_id}>
                                            <TableCell style={{ color: theme.text_color }}>{item.staff_id}</TableCell>
                                            <TableCell style={{ color: theme.text_color }}>{item.staff_name}</TableCell>
                                            <TableCell style={{ color: theme.text_color }}>{item.avg_rating}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {weeklyStats.length > 3 && (
                                <div style={{ textAlign: "right", marginTop: "10px" }}>
                                    <button
                                        onClick={() =>
                                            navigate("/AdminDashboard", {
                                                state: { content: "Reviews" }
                                            })
                                        }
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: theme.text_color,
                                            cursor: "pointer",
                                            fontWeight: 500,
                                        }}
                                    >
                                        View All
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>



                {/* Doctor Schedule */}
                < div className="panel schedule" >
                    <h4>Trainers Schedule</h4>
                    <p>Available: <strong>{doctorpresentcount}</strong></p>
                    <p>On Leave: <strong>{doctorabsentcount}</strong></p>
                    <h2>{appointments}</h2>
                    <span>Total Sessions</span>
                </div >
            </div >


            {/* Upcoming Appointments */}
            < div className="panel full" >
                <h4>Upcoming Sessions | Today</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Client Id</th>
                            <th>Client Name</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Trainer Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleAppointments.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: "center", padding: "16px" }}>
                                    No sessions available
                                </td>
                            </tr>
                        ) : (
                            visibleAppointments.map((data, i) => (
                                <tr key={i}>
                                    <td>{data.client_id}</td>
                                    <td>{data.client_name}</td>
                                    <td>{data.session_date}</td>
                                    <td>{data.start_time} - {data.end_time}</td>
                                    <td>{data.status}</td>
                                    <td>{data.trainer_name}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {appointmentsdata.length > 6 && (
                    <div style={{ textAlign: "right", marginTop: "10px" }}>
                        <button
                            onClick={() =>
                                navigate("/AdminDashboard", {
                                    state: { content: "Sessions" }
                                })
                            }
                            style={{
                                background: "none",
                                border: "none",
                                color: theme.text_color,
                                cursor: "pointer",
                                fontWeight: 500,
                            }}
                        >
                            View All
                        </button>
                    </div>
                )}
            </div >


            <style>{`
.dashboard { padding: 20px; background:${theme.app_bg}; font-family: Inter; }
.top-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
.card { background:${theme.sidebar_bg}; color:${theme.text_color}; padding:20px; border-radius:10px; }
.card-title { font-size:14px; }
.card-value { font-size:26px; font-weight:600; }
.main-grid { display:grid; grid-template-columns:1fr 2fr 1fr; gap:20px; margin-top:20px; }
.panel { background:${theme.app_bg}; border-radius:12px; padding:16px; color:${theme.text_color}; }
table { width:100%; border-collapse:collapse; }
th, td { padding:8px; font-size:13px; text-align:left; }
thead { background:${theme.sidebar_bg}; }
tbody tr { border-bottom:1px dashed #ccc; }
.chart { display:flex; align-items:flex-end; height:180px; color:${theme.text_color}; }
.bars { display:flex; align-items:flex-end; gap:16px; height:180px; color:${theme.text_color}; }
.bar-wrapper { text-align:center; }
.bar { width:30px; background:${theme.app_bg}; border-radius:6px; }
.schedule { background:${theme.sidebar_bg}; color:${theme.text_color}; text-align:center; }
.schedule h2 { margin:10px 0; }
.full { margin-top:20px; }
`}</style>
        </div >
    );
}
