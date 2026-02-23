import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import Modal from '@mui/material/Modal';
import axios from "axios";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    MenuItem,
    Stack,
    Typography,
} from "@mui/material";
import RestoreIcon from '@mui/icons-material/Restore';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 1000,
    maxHeight: '90vh',
    overflowY: 'auto',
    bgcolor: 'background.paper',
    border: '0px solid ',
    boxShadow: 24,
    borderRadius: 2,
    p: 4,
};

const LeaveRequest = () => {
    const [open, setOpen] = React.useState(false);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [theme, setTheme] = useState({});
    const [loading, setLoading] = useState(false);


    const [filters, setFilters] = useState({
        staff_name: "",
        status: "",
        leave_type: "",
        start_date: "",
        end_date: "",
    });
    const [updatingId, setUpdatingId] = useState(null);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleReset = () => {
        setFilters({
            staff_name: "",
            status: "",
            leave_type: "",
            start_date: "",
            end_date: "",
        });
    };

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

    // Initial load
    useEffect(() => {
        fetchStaff();
    }, []);


    const fetchLeaves = async () => {
        try {
            const res = await axios.get(process.env.REACT_APP_STAFFLEAVEREQUEST_FETCH, {
                withCredentials: true,
            });

            setData(res.data.data);
            setFilteredData(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    useEffect(() => {
        let temp = [...data];

        if (filters.staff_name) {
            temp = temp.filter((item) =>
                item.staff_name
                    ?.toLowerCase()
                    .includes(filters.staff_name.toLowerCase())
            );
        }

        if (filters.status) {
            temp = temp.filter((item) => item.status === filters.status);
        }

        if (filters.leave_type) {
            temp = temp.filter((item) => item.leave_type === filters.leave_type);
        }

        // if (filters.start_date) {
        //     temp = temp.filter((item) =>
        //         dayjs(item.start_date).isAfter(filters.start_date.subtract(1, "day"))
        //     );
        // }

        // if (filters.end_date) {
        //     temp = temp.filter((item) =>
        //         dayjs(item.end_date).isBefore(filters.end_date.add(1, "day"))
        //     );
        // }
        if (filters.start_date) {
            temp = temp.filter(
                (item) =>
                    (item.start_date || "").slice(0, 10) >= filters.start_date
            );
        }

        if (filters.end_date) {
            temp = temp.filter(
                (item) =>
                    (item.end_date || "").slice(0, 10) <= filters.end_date
            );
        }

        setFilteredData(temp);
    }, [filters, data]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            setUpdatingId(id);

            // 🔥 Call ADMIN leave update API
            const res = await axios.put(
                `${process.env.REACT_APP_STAFFLEAVEREQUEST_UPDATE}/${id}`,
                {
                    status: newStatus, // must be "Approved" or "Rejected"
                },
                {
                    withCredentials: true,
                }
            );

            if (!res.data.success) {
                throw new Error(res.data.message || "Update failed");
            }

            // ✅ Optimistic UI update
            setFilteredData((prev) =>
                prev.map((row) =>
                    row.id === id ? { ...row, status: newStatus } : row
                )
            );

            setData((prev) =>
                prev.map((row) =>
                    row.id === id ? { ...row, status: newStatus } : row
                )
            );
        } catch (error) {
            console.error("Status update failed", error);

            alert(
                error?.response?.data?.message ||
                "Failed to update leave status"
            );
        } finally {
            setUpdatingId(null);
        }
    };


    return (
        <>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 pt-3 text-end">
                        <Box >

                            {/* Filters */}
                            <Paper sx={{ p: 2, mb: 3, backgroundColor: theme.app_bg }}>
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                    {/* Staff */}
                                    <TextField
                                        select
                                        label="Staff"
                                        size="small"
                                        value={filters.staff_name}
                                        onChange={(e) =>
                                            setFilters({ ...filters, staff_name: e.target.value })
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
                                            <MenuItem key={staff.id} value={staff.name}>
                                                {staff.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <TextField
                                        select
                                        label="Status"
                                        size="small"
                                        value={filters.status}
                                        onChange={(e) =>
                                            setFilters({ ...filters, status: e.target.value })
                                        }
                                        sx={{
                                            minWidth: 180,
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
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="Pending">Pending</MenuItem>
                                        <MenuItem value="Approved">Approved</MenuItem>
                                        <MenuItem value="Rejected">Rejected</MenuItem>
                                    </TextField>

                                    <TextField
                                        select
                                        label="Leave Type"
                                        size="small"
                                        value={filters.leave_type}
                                        onChange={(e) =>
                                            setFilters({ ...filters, leave_type: e.target.value })
                                        }
                                        sx={{
                                            minWidth: 180,
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
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="Casual">Casual</MenuItem>
                                        <MenuItem value="Sick">Sick</MenuItem>
                                        <MenuItem value="Paid">Paid</MenuItem>
                                    </TextField>

                                    <TextField
                                        type="date"
                                        label="From Date"
                                        value={filters.start_date}
                                        onChange={(e) => setFilters((p) => ({ ...p, start_date: e.target.value }))}
                                        InputLabelProps={{ shrink: true }}
                                        size="small"
                                        fullWidth
                                        sx={{
                                            "& .MuiInputLabel-root": { color: theme.text_color },
                                            "& .MuiInputLabel-root.Mui-focused": { color: theme.primary_color },
                                            "& .MuiOutlinedInput-input": { color: theme.text_color },
                                            "& input": { WebkitTextFillColor: theme.text_color },
                                            "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                                                borderColor: theme.text_color,
                                                borderWidth: 1.5,
                                            },
                                            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                                                borderColor: theme.primary_color,
                                                borderWidth: 2,
                                            },
                                            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                borderColor: theme.primary_color,
                                                borderWidth: 2,
                                            },
                                            "& input[type='date']::-webkit-calendar-picker-indicator": {
                                                filter:
                                                    (theme.app_bg || "").toLowerCase() === "#000000" ||
                                                        (theme.app_bg || "").toLowerCase() === "black"
                                                        ? "invert(1)"
                                                        : "invert(0)",
                                                cursor: "pointer",
                                            },
                                            "& .MuiOutlinedInput-root": { backgroundColor: theme.app_bg },
                                        }}
                                    />

                                    <TextField
                                        type="date"
                                        label="To Date"
                                        value={filters.end_date}
                                        onChange={(e) => setFilters((p) => ({ ...p, end_date: e.target.value }))}
                                        InputLabelProps={{ shrink: true }}
                                        size="small"
                                        fullWidth
                                        sx={{
                                            "& .MuiInputLabel-root": { color: theme.text_color },
                                            "& .MuiInputLabel-root.Mui-focused": { color: theme.primary_color },
                                            "& .MuiOutlinedInput-input": { color: theme.text_color },
                                            "& input": { WebkitTextFillColor: theme.text_color },
                                            "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                                                borderColor: theme.text_color,
                                                borderWidth: 1.5,
                                            },
                                            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                                                borderColor: theme.primary_color,
                                                borderWidth: 2,
                                            },
                                            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                borderColor: theme.primary_color,
                                                borderWidth: 2,
                                            },
                                            "& input[type='date']::-webkit-calendar-picker-indicator": {
                                                filter:
                                                    (theme.app_bg || "").toLowerCase() === "#000000" ||
                                                        (theme.app_bg || "").toLowerCase() === "black"
                                                        ? "invert(1)"
                                                        : "invert(0)",
                                                cursor: "pointer",
                                            },
                                            "& .MuiOutlinedInput-root": { backgroundColor: theme.app_bg },
                                        }}
                                    />

                                    {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="From Date"
                                            value={filters.start_date}
                                            onChange={(newValue) =>
                                                setFilters({ ...filters, start_date: newValue })
                                            }
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    variant: "outlined", // ✅ explicitly outlined
                                                    sx: {
                                                        minWidth: 160,

                                                        // 🔹 Label
                                                        "& .MuiInputLabel-root": {
                                                            color: theme.text_color,
                                                        },
                                                        "& .MuiInputLabel-root.Mui-focused": {
                                                            color: theme.primary_color,
                                                        },

                                                        // 🔹 Input text
                                                        "& .MuiOutlinedInput-input": {
                                                            color: theme.text_color,
                                                        },

                                                        // 🔹 Border default
                                                        "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                                                            borderColor: theme.text_color,
                                                        },

                                                        // 🔹 Hover border
                                                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                                                            borderColor: theme.primary_color,
                                                        },

                                                        // 🔹 Focus border
                                                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                            borderColor: theme.primary_color,
                                                            borderWidth: 2,
                                                        },

                                                        // 🔹 Calendar icon (DatePicker uses MUI icon)
                                                        "& .MuiSvgIcon-root": {
                                                            color: theme.text_color,
                                                        },

                                                        // 🔹 Background
                                                        "& .MuiOutlinedInput-root": {
                                                            backgroundColor: theme.app_bg,
                                                            transition: "all 0.2s ease",
                                                        },
                                                    },
                                                },
                                            }}
                                        />

                                        <DatePicker
                                            label="To Date"
                                            value={filters.end_date}
                                            onChange={(newValue) =>
                                                setFilters({ ...filters, end_date: newValue })
                                            }
                                            slotProps={{
                                                textField: {
                                                    fullWidth: false,
                                                    size: "small",
                                                    sx: {
                                                        // ✅ Selected date / typed value
                                                        "& .MuiOutlinedInput-input": {
                                                            color: theme.text_color,
                                                            WebkitTextFillColor: theme.text_color, // important in some cases
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

                                                        // Calendar icon
                                                        "& .MuiIconButton-root": {
                                                            color: theme.text_color,
                                                        },
                                                        "& .MuiSvgIcon-root": {
                                                            color: theme.text_color,
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </LocalizationProvider> */}
                                </Stack>
                                <Stack mt={2} direction="row" spacing={2} justifyContent="flex-end">
                                    <Button variant="outlined" size="small" sx={{ backgroundColor: theme.primary_color, color: theme.text_color, textTransform: "none" }} onClick={handleReset}>
                                        <RestoreIcon /> Reset
                                    </Button>
                                </Stack>
                            </Paper>

                            {/* Table */}
                            <TableContainer
                                sx={{
                                    maxHeight: 620,          // 🔥 Fixed height (adjust as needed)
                                    border: `1px solid ${theme.text_color}`,
                                    borderRadius: 1,
                                }}
                            >
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            {["Staff", "Leave Type", "From", "To", "Status", "Reason"].map(
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
                                        {filteredData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center" sx={{ color: theme.text_color }}>
                                                    No records found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredData.map((row) => (
                                                <>

                                                    <TableRow
                                                        key={row.id}
                                                        sx={{
                                                            "& td": {
                                                                borderBottom: `1px dashed ${theme.text_color}`,
                                                                height: 36,
                                                                textAlign: "center",
                                                            },
                                                        }}
                                                    >
                                                        <TableCell sx={{ color: theme.text_color }}>{row.staff_name}</TableCell>

                                                        {/* Column shaded */}
                                                        <TableCell sx={{ color: theme.text_color }}>
                                                            {row.leave_type}
                                                        </TableCell>

                                                        <TableCell sx={{ color: theme.text_color }}>{dayjs(row.start_date).format("DD MMM YYYY")}</TableCell>


                                                        {/* Column shaded */}
                                                        <TableCell sx={{ color: theme.text_color }}>
                                                            {dayjs(row.end_date).format("DD MMM YYYY")}
                                                        </TableCell>

                                                        <TableCell>
                                                            <TextField
                                                                select
                                                                size="small"
                                                                value={row.status}
                                                                disabled={updatingId === row.id}
                                                                onChange={(e) => handleStatusChange(row.id, e.target.value)}
                                                                sx={{
                                                                    minWidth: 120,
                                                                    "& .MuiSelect-select": {
                                                                        color:
                                                                            row.status === "Approved"
                                                                                ? "green"
                                                                                : row.status === "Rejected"
                                                                                    ? "red"
                                                                                    : "orange",
                                                                        fontWeight: 100,
                                                                    },
                                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                                        borderColor: theme.text_color,
                                                                    },

                                                                    // 🔥 Outline hover
                                                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                                                        borderColor: theme.text_color,
                                                                    },

                                                                    // 🔥 Outline focused
                                                                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                                        borderColor: theme.text_color,
                                                                    },

                                                                    // Optional: dropdown arrow color
                                                                    "& .MuiSvgIcon-root": {
                                                                        color: theme.text_color,
                                                                    },
                                                                }}
                                                            >
                                                                <MenuItem value="Pending">Pending</MenuItem>
                                                                <MenuItem value="Approved">Approved</MenuItem>
                                                                <MenuItem value="Rejected">Rejected</MenuItem>
                                                            </TextField>
                                                        </TableCell>
                                                        <TableCell sx={{ color: theme.text_color }}>
                                                            {row.reason}
                                                        </TableCell>
                                                    </TableRow>
                                                </>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </div>
                </div>
            </div>
        </>
    )
}
export default LeaveRequest;