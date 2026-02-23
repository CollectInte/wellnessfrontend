import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Paper,
    Typography,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TextField,
    MenuItem,
    CircularProgress,
    Button
} from "@mui/material";

import {
    LocalizationProvider,
    TimePicker
} from "@mui/x-date-pickers";
import EditIcon from '@mui/icons-material/Edit';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import LeaveRequest from "./LeaveRequest";

dayjs.extend(customParseFormat);

const StaffAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [clockIn, setClockIn] = useState(
        attendance?.clock_in
            ? dayjs(attendance.clock_in, ["HH:mm:ss", "HH:mm"], true)
            : null
    );

    const [clockOut, setClockOut] = useState(
        attendance?.clock_out ? dayjs(attendance.clock_out, "HH:mm:ss") : null
    );
    const [theme, setTheme] = useState({});

    const onEditClose = () => {
        setEditOpen(false);
        setSelectedAttendance(null);
        setClockIn(null);
        setClockOut(null);
    }


    const MONTHS = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];


    // Default = current month
    const [filters, setFilters] = useState({
        month: dayjs().month() + 1,
        year: dayjs().year(),
        staffId: "",
    });

    // 🔹 Fetch staff list
    const fetchStaff = async () => {
        try {
            const res = await axios.get(process.env.REACT_APP_EMPLOYEE_FETCH, {
                withCredentials: true,
            });
            setStaffList(res.data.data);
        } catch (err) {
            console.error("Staff list error:", err);
        }
    };

    // 🔹 Fetch attendance
    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await axios.get(process.env.REACT_APP_STAFFATTENDANCE_FETCH, {
                params: {
                    month: filters.month,
                    year: filters.year,
                    staff_id: filters.staffId || undefined,
                },
                withCredentials: true,
            });

            setAttendance(res.data.data);
        } catch (err) {
            console.error("Attendance fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchStaff();
    }, []);

    // Refetch on filter change
    useEffect(() => {
        fetchAttendance();
    }, [filters]);

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

    // Edit Attendance
    const handleUpdate = async () => {
        if (!clockIn || !clockOut) {
            alert("Clock in and clock out are required");
            return;
        }

        setLoading(true);
        try {
            await axios.put(
                `${process.env.REACT_APP_STAFFATTENDANCE_UPDATE}/${selectedAttendance.id}`,
                {
                    clock_in: clockIn.format("HH:mm:ss"),
                    clock_out: clockOut.format("HH:mm:ss"),
                },
                { withCredentials: true }
            );
            fetchAttendance();
            onEditClose();
        } catch (err) {
            console.error("Update error", err);
            alert(err.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };
    //   Edit Attendance

    return (
        <>
            <Paper sx={{ p: 3, mt: 1, backgroundColor: theme.app_bg }}>
                <Typography variant="h6" mb={2} sx={{ color: theme.text_color }}>
                    Monthly Attendance
                </Typography>

                {/* FILTERS */}
                <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                    {/* Month */}
                    <TextField
                        select
                        label="Month"
                        size="small"
                        value={filters.month}
                        onChange={(e) =>
                            setFilters({ ...filters, month: e.target.value })
                        }
                        sx={{
                            minWidth: 150,
                            // Input text
                            "& .MuiSelect-select": {
                                color: theme.text_color,
                            },

                            // Label
                            "& .MuiInputLabel-root": {
                                color: theme.text_color,
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                                color: theme.text_color,
                            },

                            // Outline default
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.text_color,
                            },

                            // Outline hover
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.text_color,
                            },

                            // Outline focused
                            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.text_color,
                            },

                            // Dropdown arrow icon
                            "& .MuiSvgIcon-root": {
                                color: theme.text_color,
                            },
                        }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    backgroundColor: theme.background_color,
                                    color: theme.text_color,
                                },
                            },
                        }}
                    >
                        {MONTHS.map((m, i) => (
                            <MenuItem key={i} value={i + 1}>
                                {m}
                            </MenuItem>
                        ))}

                    </TextField>

                    {/* Year */}
                    <TextField
                        label="Year"
                        size="small"
                        type="number"
                        value={filters.year}
                        onChange={(e) =>
                            setFilters({ ...filters, year: e.target.value })
                        }
                        sx={{
                            width: 120,
                            // 🔹 Input Text Color
                            "& .MuiInputBase-input": {
                                color: theme.text_color,
                            },

                            // 🔹 Label Color
                            "& .MuiInputLabel-root": {
                                color: theme.text_color,
                            },

                            // 🔹 Label When Focused
                            "& .MuiInputLabel-root.Mui-focused": {
                                color: theme.text_color,
                            },

                            // Outline default
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.text_color,
                            },

                            // Outline hover
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.text_color,
                            },

                            // Outline focused
                            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.text_color,
                            },
                        }}
                    />

                    {/* Staff */}
                    <TextField
                        select
                        label="Staff"
                        size="small"
                        value={filters.staffId}
                        onChange={(e) =>
                            setFilters({ ...filters, staffId: e.target.value })
                        }
                        sx={{
                            minWidth: 200,
                            // Input text
                            "& .MuiSelect-select": {
                                color: theme.text_color,
                            },

                            // Label
                            "& .MuiInputLabel-root": {
                                color: theme.text_color,
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                                color: theme.text_color,
                            },

                            // Outline default
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.text_color,
                            },

                            // Outline hover
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.text_color,
                            },

                            // Outline focused
                            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.text_color,
                            },

                            // Dropdown arrow icon
                            "& .MuiSvgIcon-root": {
                                color: theme.text_color,
                            },
                        }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    backgroundColor: theme.background_color,
                                    color: theme.text_color,
                                },
                            },
                        }}
                    >
                        <MenuItem value="">All Staff</MenuItem>
                        {staffList.map((staff) => (
                            <MenuItem key={staff.id} value={staff.id}>
                                {staff.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                {/* TABLE */}
                {loading ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress />
                    </Box>
                ) : attendance.length === 0 ? (
                    <Typography sx={{ color: theme.text_color }}>
                        No attendance records found
                    </Typography>
                ) : (
                    <TableContainer
                        sx={{
                            maxHeight: 620,          // 🔥 Fixed height (adjust as needed)
                            border: `1px solid ${theme.primary_color}`,
                            borderRadius: 1,
                        }}
                    >
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {["Staff Name", "Date", "Check In", "Check Out", "Status", "Actions"].map(
                                        (head) => (
                                            <TableCell
                                                key={head}
                                                align="center"
                                                sx={{
                                                    backgroundColor: theme.sidebar_bg,
                                                    color: theme.text_color,
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
                                {attendance.map((row) => (
                                    <>
                                        {/* <TableRow key={row.id}>
                                            <TableCell>{row.staff_name}</TableCell>
                                            <TableCell>
                                                {dayjs(row.date).format("DD MMM YYYY")}
                                            </TableCell>
                                            <TableCell>{row.clock_in || "-"}</TableCell>
                                            <TableCell>{row.clock_out || "-"}</TableCell>
                                            <TableCell>{row.status}</TableCell>
                                            <TableCell><Button variant="contained" onClick={() => {
                                                setSelectedAttendance(row);
                                                setEditOpen(true);
                                            }} sx={{ backgroundColor: "#3f6f7a", textTransform: "none" }} size="small"><EditIcon fontSize="10px" /> Edit</Button></TableCell>
                                        </TableRow> */}
                                        <TableRow
                                            key={row.id}
                                            sx={{
                                                "& td": {
                                                    borderBottom: `0px dashed ${theme.primary_color}`,
                                                    height: 36,
                                                    textAlign: "center",
                                                },
                                            }}
                                        >
                                            <TableCell sx={{ color: theme.text_color, fontWeight: 500 }}>{row.staff_name}</TableCell>

                                            {/* Column shaded */}
                                            <TableCell sx={{ color: theme.text_color, fontWeight: 500 }}>
                                                {dayjs(row.date).format("DD MMM YYYY")}
                                            </TableCell>

                                            <TableCell sx={{ color: theme.text_color, fontWeight: 500 }}>{row.clock_in || "-"}</TableCell>


                                            {/* Column shaded */}
                                            <TableCell sx={{ color: theme.text_color, fontWeight: 500 }}>
                                                {row.clock_out || "-"}
                                            </TableCell>

                                            <TableCell sx={{ color: theme.text_color, fontWeight: 500 }}>
                                                {row.status}
                                            </TableCell>

                                            <TableCell>
                                                <Button variant="contained" onClick={() => {
                                                    setSelectedAttendance(row);
                                                    setEditOpen(true);
                                                }} sx={{ backgroundColor: theme.primary_color, color: theme.text_color, textTransform: "none" }} size="small"><EditIcon fontSize="10px" /> Edit</Button>
                                            </TableCell>
                                        </TableRow>
                                    </>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
            {/* Modal for edition */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Dialog open={editOpen} onClose={onEditClose} fullWidth maxWidth="sm" sx={{ borderRadius: "20px" }}>
                    <DialogTitle >Update Attendance</DialogTitle>

                    <DialogContent >
                        <Box display="flex" gap={2} mt={2}>
                            <TimePicker
                                label="Clock In"
                                value={clockIn}
                                onChange={(v) => setClockIn(v)}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            
                            />


                            <TimePicker
                                label="Clock Out"
                                value={clockOut}
                                onChange={(v) => setClockOut(v)}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </Box>

                        <Typography mt={2} color="text.secondary">
                            Total hours & status will be calculated automatically
                        </Typography>
                    </DialogContent>

                    <DialogActions sx={{ backgroundColor: theme.app_bg }}>
                        <Button onClick={onEditClose} sx={{ borderColor: theme.primary_color, color: theme.text_color }}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={handleUpdate}
                            disabled={loading}
                            sx={{ backgroundColor: theme.primary_color }}
                        >
                            {loading ? <CircularProgress size={22} /> : "Update"}
                        </Button>
                    </DialogActions>
                </Dialog>
            </LocalizationProvider>
            {/* Modal for edition */}
        </>
    );
};

export default StaffAttendance;
