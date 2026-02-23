import React, { useState, useEffect } from "react";
import StaffAppointments from "./StaffAppointments";
import {
    Box,
    Button,
    TextField,
    Typography,
    IconButton,
    CircularProgress,
    TableContainer,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Select,
    MenuItem,
    Paper
} from "@mui/material";
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteIcon from "@mui/icons-material/Delete";
import { LocalizationProvider, DatePicker, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import dayjs from "dayjs";
import axios from "axios";

const Appointments = () => {
    const [slots, setSlots] = useState([
        { slot_date: null, slot_time_from: null, slot_time_to: null }
    ]);
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(dayjs());
    const [fetchslots, setFetchSlots] = useState([]);
    const [clientList, setClientList] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [view, setView] = useState("Staffappointments");
    const [openAddSlotModal, setOpenAddSlotModal] = useState(false);
    const [filters, setFilters] = useState({
        date: null,
        branch: "",
        clientId: "",
    });


        const handleReset = () => {
    setFilters({
      date: null,
      branch: "",
      clientId: "",
    });
  };

    // const handleChange = (index, field, value) => {
    //     const updated = [...slots];
    //     updated[index][field] = value;
    //     setSlots(updated);
    // };

    // const addSlot = () => {
    //     setSlots([
    //         ...slots,
    //         { slot_date: null, slot_time_from: null, slot_time_to: null }
    //     ]);
    // };

    // const removeSlot = (index) => {
    //     setSlots(slots.filter((_, i) => i !== index));
    // };

    useEffect(() => {
        axios
            .get(process.env.REACT_APP_CLIENT_FETCH, {
                withCredentials: true,
            })
            .then((res) => setClientList(res.data.data || []))
            .catch((err) =>
                console.error("Client list fetch error", err)
            );
    }, []);

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const payload = {
                slots: slots.map(s => ({
                    slot_date: dayjs(s.slot_date).format("YYYY-MM-DD"),
                    slot_time_from: dayjs(s.slot_time_from).format("HH:mm:ss"),
                    slot_time_to: dayjs(s.slot_time_to).format("HH:mm:ss")
                }))
            };

            await axios.post(
                process.env.REACT_APP_ADMINTIMESLOT_CREATE,
                payload,
                {
                    withCredentials: true // 🔥 REQUIRED
                }
            );

            alert("Slots created successfully");
            setSlots([{ slot_date: null, slot_time_from: null, slot_time_to: null }]);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to create slots");
        } finally {
            setLoading(false);
        }
    };

    // Fetching existing slots for a date

    const fetchClientAppointments = async () => {
        try {
            setLoading(true);

            const params = {};

            if (filters.date) {
                params.date = dayjs(filters.date).format("YYYY-MM-DD");
            }

            if (filters.branch) {
                params.branch = filters.branch;
            }

            if (filters.clientId) {
                params.clientId = filters.clientId;
            }
            const res = await axios.get(
                `${process.env.REACT_APP_URL}/appointment/admin/client/appointments`,
                {
                    params,
                    withCredentials: true // 🔥 REQUIRED for cookie auth
                }
            );

            setFetchSlots(res.data.appointments || []);
        } catch (err) {
            console.error(err);
            setFetchSlots([]);
        } finally {
            setLoading(false);
        }
    };


    // 🔥 Load today's slots on first render
    useEffect(() => {
        fetchClientAppointments();
    }, [filters]);




    // Fetching existing slots for a date

    // Deleting a slot
    const handleDelete = async (slotId) => {
        if (!slotId) return;

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this time slot?"
        );

        if (!confirmDelete) return;

        try {
            setLoading(true);

            const res = await fetch(`${process.env.REACT_APP_ADMINTIMESLOT_DELETE}/${slotId}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (!res.ok) {
                throw new Error("Failed to delete slot");
            }

            // Remove deleted slot from UI
            setFetchSlots((prev) =>
                prev.filter((slot) => slot.id !== slotId)
            );

        } catch (error) {
            console.error(error);
            alert("Unable to delete time slot. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Deleting a slot

    // Updating Appointment Status
    const handleStatusUpdate = async (appointmentId, newStatus) => {
        try {
            setLoading(true);

            const res = await fetch(`${process.env.REACT_APP_ADMINAPPOINTMENT_UPDATE}/${appointmentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                throw new Error("Failed to update status");
            }

            // Update UI without refetch
            setAppointments((prev) =>
                prev.map((appt) =>
                    appt.id === appointmentId
                        ? { ...appt, status: newStatus }
                        : appt
                )
            );
        } catch (error) {
            console.error(error);
            alert("Failed to update appointment status");
        } finally {
            setLoading(false);
        }
    };
    // Updating Appointment Status

    // Fetching Appointments for a date
    const fetchAppointments = async () => {
        try {
            setLoading(true);

            const res = await axios.get(
                `${process.env.REACT_APP_URL}/appointment/admin/appointments`,
                {
                    withCredentials: true // 🔥 cookie auth
                }
            );

            setAppointments(res.data.appointments || []);
        } catch (err) {
            console.error(err);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 Load today's appointments on page load
    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleAppointmentDateChange = (newDate) => {
        setSelectedDate(newDate);
        fetchAppointments(newDate);
    };
    //   Fetching Appointments for a date

    const getButtonStyle = (isActive, activeColor) => ({
        backgroundColor: isActive ? activeColor : "#e0e0e0",
        color: isActive ? "#fff" : "#000",
        textTransform: "none",
        boxShadow: isActive ? 6 : 1,
        "&:hover": {
            backgroundColor: isActive ? activeColor : "#d5d5d5",
        }
    });

    const STATUS_OPTIONS = [
        "assigned",
        "delayed",
        "completed",
        "cancelled",
    ];


    return (
        <>
            <div className="container-fluid" style={{ marginTop: "10px" }}>
                <div className="row">
                    <div className="col-12 d-flex justify-content-end">
                        <Button variant="contained" onClick={() => setView("Staffappointments")} sx={getButtonStyle(view === "Staffappointments", "#3f6f7a")}>
                            <CalendarMonthIcon />  Staff Appointments
                        </Button>
                        <Button variant="contained" onClick={() => setView("clientappointments")} sx={{ ml: 1, ...getButtonStyle(view === "clientappointments", "#3f6f7a") }}>
                            <PermContactCalendarIcon />  Client Appointments
                        </Button>
                        {/* <Button variant="contained" onClick={() => setView("appointments")} sx={{ ml: 1, ...getButtonStyle(view === "appointments", "#3f6f7a") }}>
                            <CalendarMonthIcon />  Appointments
                        </Button> */}
                        {/* <Button variant="contained" onClick={() => setOpenAddSlotModal(true)} sx={{
                            ml: 1,
                            backgroundColor: "#673AB7",
                            textTransform: "none"
                        }}>
                            <EditCalendarIcon />  Add Slots
                        </Button> */}
                    </div>
                    {view === "Staffappointments" && (
                        <div className="col-12">
                            <StaffAppointments />
                        </div>
                    )}
                    {view === "clientappointments" && (
                        <div className="col-12">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" mb={2}>
                                        Client Appointments
                                    </Typography>

                                    {/* 🔹 FILTERS */}
                                    <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                                        <DatePicker
                                            label="Date"
                                            value={filters.date}
                                            onChange={(v) =>
                                                setFilters({ ...filters, date: v })
                                            }
                                            slotProps={{
                                                textField: {
                                                    size: "small",   // ✅ THIS is required
                                                },
                                            }}
                                        />

                                        <TextField
                                            label="Branch"
                                            size="small"
                                            variant="outlined"
                                            value={filters.branch}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    branch: e.target.value,
                                                    clientId: "", // reset staff on branch change
                                                })
                                            }
                                            sx={{ minWidth: 200 }}
                                        />

                                        <TextField
                                            select
                                            label="Clients"
                                            size="small"
                                            value={filters.clientId}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    clientId: e.target.value,
                                                })
                                            }
                                            sx={{ minWidth: 220 }}
                                        >
                                            <MenuItem value="">All Clients</MenuItem>
                                            {clientList.map((client) => (
                                                <MenuItem key={client.id} value={client.id}>
                                                    {client.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>

                                        <Button variant="outlined" size="small" sx={{ backgroundColor: "#3f6f7a", color: "white", textTransform: "none" }} onClick={handleReset}>
                                            <RestoreIcon /> Reset
                                        </Button>
                                    </Box>

                                    {loading ? (
                                        <Box display="flex" justifyContent="center" mt={4}>
                                            <CircularProgress />
                                        </Box>
                                    ) : fetchslots.length === 0 ? (
                                        <Typography color="text.secondary">
                                            No appointments found for selected date
                                        </Typography>
                                    ) : (
                                        <TableContainer
                                            sx={{
                                                maxHeight: 620,          // 🔥 Fixed height (adjust as needed)
                                                border: "1px solid #e0e0e0",
                                                borderRadius: 1,
                                            }}
                                        >
                                            <Table stickyHeader size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        {["App Id", "Client", "Doctor", "Date", "Time", "Branch", "Status", "Purpose"].map(
                                                            (head) => (
                                                                <TableCell
                                                                    key={head}
                                                                    align="center"
                                                                    sx={{
                                                                        backgroundColor: "#0F7C82",
                                                                        color: "#fff",
                                                                        fontWeight: 600,
                                                                        height: 36,
                                                                    }}
                                                                >
                                                                    {head}
                                                                </TableCell>
                                                            )
                                                        )}
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                    {fetchslots.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={6} align="center">
                                                                No records found
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        fetchslots.map((row) => (
                                                            <TableRow
                                                                key={row.id}
                                                                sx={{
                                                                    "& td": {
                                                                        borderBottom: "1px dashed #7FB7BC",
                                                                        height: 36,
                                                                        textAlign: "center",
                                                                    },
                                                                }}
                                                            >
                                                                <TableCell>{row.id}</TableCell>

                                                                {/* Column shaded */}
                                                                <TableCell sx={{ backgroundColor: "#D6E9E8" }}>
                                                                    {row.client_name}
                                                                </TableCell>

                                                                <TableCell>{row.doctor_name}</TableCell>


                                                                {/* Column shaded */}
                                                                <TableCell sx={{ backgroundColor: "#D6E9E8" }}>
                                                                    {row.appointment_date}
                                                                </TableCell>

                                                                <TableCell>
                                                                    {row.from_time} - {row.to_time}
                                                                </TableCell>

                                                                <TableCell sx={{ backgroundColor: "#D6E9E8" }}>
                                                                    {row.selected_branch}
                                                                </TableCell>

                                                                <TableCell>
                                                                    <Chip
                                                                        label={row.status}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor:
                                                                                row.status === "completed"
                                                                                    ? "#6BC3C8"      // green/teal
                                                                                    : row.status === "assigned"
                                                                                        ? "#F2AD58"      // orange
                                                                                        : "#F6B1AC",     // red (cancelled)

                                                                            color:
                                                                                row.status === "completed"
                                                                                    ? "#004D50"
                                                                                    : row.status === "assigned"
                                                                                        ? "#000"
                                                                                        : "#8B0000",

                                                                            fontWeight: 500,
                                                                            minWidth: 90,
                                                                            textTransform: "capitalize",
                                                                        }}
                                                                    />
                                                                </TableCell>

                                                                <TableCell>
                                                                    {row.purpose}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                </Paper>
                            </LocalizationProvider>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};

export default Appointments;
