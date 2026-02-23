import React, { useState, useEffect } from 'react';
import {
    Box, Modal, Typography, Button, TextField, Select, MenuItem,
    FormControl, InputLabel, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Chip, Stack, Alert,
    CircularProgress, TimePicker, Divider, Grid, FormControlLabel,
    Checkbox
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { enIN } from 'date-fns/locale';



const SessionManager = () => {
    const [sessions, setSessions] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('');
    const [employees, setEmployees] = useState([]);
    const [theme, setTheme] = useState({});

    // Modals
    const [generateModal, setGenerateModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState('');

    // Filters
    const [filters, setFilters] = useState({
        plan_id: '',
        trainer_id: '',
        client_id: '',
        date: '',
        from_date: '',
        to_date: '',
        status: ''
    });

    // Generate form
    const [generateForm, setGenerateForm] = useState({
        plan_id: '',
        start_time: '09:00',
        duration_minutes: 60,
        replace_existing: false
    });

    // Edit form
    const [editForm, setEditForm] = useState({});

    const Employeedetails = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_EMPLOYEE_FETCH, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch employee details");
            }

            const data = await response.json();
            // console.log("Employee details:", data);
            setEmployees(data.data);
            return data; // return if needed
        } catch (error) {
            console.error("Error fetching employees:", error.message);
        }
    };

    useEffect(() => {
        fetchUserData();
        Employeedetails();
    }, []);

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

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const [userRes, plansRes] = await Promise.all([
                fetch(`${process.env.REACT_APP_URL}/api/sessions`, {
                    credentials: 'include'  // ✅ ADDED
                }),
                fetch(`${process.env.REACT_APP_URL}/api/plans`, {
                    credentials: 'include'  // ✅ ADDED
                })
            ]);

            const userData = await userRes.json();
            const plansData = await plansRes.json();

            setRole(userData.role);
            setSessions(userData.sessions || []);
            setPlans(plansData.plans || []);
        } catch (err) {
            alert('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            const res = await fetch(`${process.env.REACT_APP_URL}/api/sessions?${params}`, {
                credentials: 'include'  // ✅ ADDED
            });
            const data = await res.json();
            setSessions(data.sessions || []);
            setRole(data.role);
        } catch (err) {
            alert('Failed to fetch sessions');
        } finally {
            setLoading(false);
        }
    };


    const handleGenerateSessions = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_URL}/api/sessions/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(generateForm)
            });

            const data = await res.json();
            if (data.success) {
                alert(`Generated ${data.created_count} sessions`);
                setGenerateModal(false);
                fetchSessions();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Failed to generate sessions');
        }
    };

    const handleUpdateSession = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_URL}/api/sessions/update/${selectedSession.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(editForm)
            });

            const data = await res.json();
            if (data.success) {
                alert('Session updated');
                setEditModal(false);
                fetchSessions();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Failed to update session');
        }
    };

    const handleDeleteSession = async (sessionId) => {
        if (!window.confirm('Cancel this session?')) return;

        try {
            const res = await fetch(`${process.env.REACT_APP_URL}/api/sessions/delete/${sessionId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await res.json();
            if (data.success) {
                alert('Session cancelled');
                fetchSessions();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Failed to cancel session');
        }
    };

    const getStatusChip = (status) => {
        const colors = {
            scheduled: 'primary',
            completed: 'success',
            cancelled: 'error',
            missed: 'warning'
        };
        return <Chip label={status} color={colors[status] || 'default'} size="small" />;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        maxWidth: '90vw',
        bgcolor: theme.app_bg,
        boxShadow: 24,
        p: 4,
        borderRadius: 2
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enIN}>
            <Box p={3} maxWidth={1400}>
                {/* <Typography variant="h4" sx={{ textAlign: "center" }} gutterBottom>
                    Session Manager
                </Typography> */}

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} mb={3} alignItems="end" justifyContent="flex-end" sx={{ width: "100%" }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setGenerateModal(true)}
                        sx={{ backgroundColor: theme.primary_color, color: theme.text_color, textTransform: "none" }}
                    >
                        Generate Sessions
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={fetchSessions}
                        sx={{ textTransform: "none", color: theme.text_color, borderColor: theme.primary_color }}
                    >
                        <RefreshIcon sx={{ mr: 1 }} /> Refresh
                    </Button>
                </Stack>

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 3, backgroundColor: theme.app_bg }}>
                    <Grid container spacing={2}>
                        <Grid item size={{ xs: 12, sm: 6, md: 2 }}>
                            <TextField
                                select  // ✅ Makes it a dropdown
                                fullWidth
                                size="small"
                                label="Plan"
                                value={filters.plan_id}
                                onChange={(e) => setFilters({ ...filters, plan_id: e.target.value })}
                                sx={{
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
                                <MenuItem value="">All Plans</MenuItem>
                                {plans.map(plan => (
                                    <MenuItem key={plan.plan_id} value={plan.plan_id}>
                                        {plan.client_name} - {plan.plan_type}
                                    </MenuItem>
                                ))}
                            </TextField>

                        </Grid>

                        <Grid item size={{ xs: 12, sm: 6, md: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Trainer ID"
                                value={filters.trainer_id}
                                onChange={(e) => setFilters({ ...filters, trainer_id: e.target.value })}
                                sx={{
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
                        </Grid>
                        <Grid item size={{ xs: 12, sm: 6, md: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Client ID"
                                value={filters.client_id}
                                onChange={(e) => setFilters({ ...filters, client_id: e.target.value })}
                                sx={{
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
                        </Grid>

                        <Grid item size={{ xs: 12, sm: 6, md: 2 }}>
                            <FormControl fullWidth size="small" sx={{

                                // 🔹 Underline default
                                "& .MuiInput-underline:before": {
                                    borderBottomColor: theme.text_color,
                                },

                                // 🔹 Underline hover
                                "& .MuiInput-underline:hover:before": {
                                    borderBottomColor: theme.text_color,
                                },

                                // 🔹 Underline focused
                                "& .MuiInput-underline:after": {
                                    borderBottomColor: theme.text_color,
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: theme.text_color,
                                },
                            }}>
                                <InputLabel sx={{
                                    color: theme.text_color,
                                    "&.Mui-focused": {
                                        color: theme.text_color,
                                    },
                                }}>Status</InputLabel>
                                <Select
                                    value={filters.status}
                                    label="Status"
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    sx={{
                                        // 🔹 Selected text color
                                        "& .MuiSelect-select": {
                                            color: theme.text_color,
                                        },

                                        // 🔹 Dropdown arrow color
                                        "& .MuiSvgIcon-root": {
                                            color: theme.text_color,
                                        },
                                    }}
                                >
                                    <MenuItem value="">All Status</MenuItem>
                                    <MenuItem value="scheduled">Scheduled</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item size={{ xs: 12, sm: 6, md: 2 }}>
                            <Stack direction="row" spacing={1} height="100%" alignItems="flex-end">
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={fetchSessions}
                                    size="medium"
                                    sx={{ textTransform: "none", backgroundColor: theme.primary_color, color: theme.text_color }}
                                >
                                    <SearchIcon /> Search
                                </Button>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => {
                                        setFilters({
                                            plan_id: '', trainer_id: '', client_id: '',
                                            date: '', from_date: '', to_date: '', status: ''
                                        });
                                        fetchSessions(); // Clear filters & refresh
                                    }}
                                    size="medium"
                                    sx={{ textTransform: "none", color: theme.text_color, borderColor: theme.primary_color }}
                                >
                                    <RestoreIcon /> Clear
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Sessions Table */}
                <TableContainer
                    component={Paper}
                    sx={{
                        maxHeight: "70vh",     // adjust as needed (ex: 450, "60vh", "calc(100vh - 240px)")
                        overflowY: "auto",
                    }}
                >
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ backgroundColor: theme.sidebar_bg, color: theme.text_color, fontWeight: "bold" }}>Date & Time</TableCell>
                                <TableCell sx={{ backgroundColor: theme.sidebar_bg, color: theme.text_color, fontWeight: "bold" }}>Client</TableCell>
                                <TableCell sx={{ backgroundColor: theme.sidebar_bg, color: theme.text_color, fontWeight: "bold" }}>Trainer</TableCell>
                                <TableCell sx={{ backgroundColor: theme.sidebar_bg, color: theme.text_color, fontWeight: "bold" }}>Plan</TableCell>
                                <TableCell sx={{ backgroundColor: theme.sidebar_bg, color: theme.text_color, fontWeight: "bold" }}>Status</TableCell>
                                <TableCell sx={{ backgroundColor: theme.sidebar_bg, color: theme.text_color, fontWeight: "bold" }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody sx={{ backgroundColor: theme.app_bg }}>
                            {sessions.map((session) => (
                                <TableRow key={session.id} hover>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: theme.text_color }}>
                                                {session.session_date} {session.start_time} - {session.end_time}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ color: theme.text_color }}>{session.client_name}</TableCell>
                                    <TableCell sx={{ color: theme.text_color }}>{session.trainer_name}</TableCell>
                                    <TableCell sx={{ color: theme.text_color }}>{session.plan_id}</TableCell>
                                    <TableCell sx={{ color: theme.text_color }}>{getStatusChip(session.status)}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="primary"
                                            onClick={() => {
                                                setSelectedSession(session);
                                                setEditForm({
                                                    session_date: session.session_date,
                                                    start_time: session.start_time,
                                                    end_time: session.end_time,
                                                    status: session.status,
                                                    trainer_id: session.trainer_id,
                                                });
                                                setEditModal(true);
                                            }}
                                        >
                                            <EditIcon sx={{ color: theme.primary_color }} />
                                        </IconButton>

                                        <IconButton color="error" onClick={() => handleDeleteSession(session.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {sessions.length === 0 && (
                        <Box p={3} textAlign="center">
                            <Typography sx={{ color: theme.text_color }}>No sessions found</Typography>
                        </Box>
                    )}
                </TableContainer>

            </Box>

            {/* Generate Sessions Modal */}
            <Modal open={generateModal} onClose={() => setGenerateModal(false)}>
                <Box sx={modalStyle}>
                    <Typography sx={{ textAlign: "center", mb: 2, color: theme.text_color }} variant="h6" gutterBottom>
                        <u>Generate Sessions for Plan</u>
                    </Typography>
                    <Stack spacing={2}>
                        <FormControl sx={{
                            m: 1,
                            minWidth: 120,

                            // 🔹 Underline default
                            "& .MuiInput-underline:before": {
                                borderBottomColor: theme.text_color,
                            },

                            // 🔹 Underline hover
                            "& .MuiInput-underline:hover:before": {
                                borderBottomColor: theme.text_color,
                            },

                            // 🔹 Underline focused
                            "& .MuiInput-underline:after": {
                                borderBottomColor: theme.text_color,
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.text_color,
                            },
                            m: 1, minWidth: 120
                        }} fullWidth>
                            <InputLabel sx={{
                                color: theme.text_color,
                                "&.Mui-focused": {
                                    color: theme.text_color,
                                },
                            }}>Plan</InputLabel>
                            <Select
                                value={generateForm.plan_id}
                                label="Plan"
                                onChange={(e) => setGenerateForm({
                                    ...generateForm,
                                    plan_id: e.target.value
                                })}
                                sx={{
                                    // 🔹 Selected text color
                                    "& .MuiSelect-select": {
                                        color: theme.text_color,
                                    },

                                    // 🔹 Dropdown arrow color
                                    "& .MuiSvgIcon-root": {
                                        color: theme.text_color,
                                    },
                                }}
                            >
                                {plans.map(plan => (
                                    <MenuItem key={plan.plan_id} value={plan.plan_id}>
                                        {plan.client_name} - {plan.plan_type}
                                        ({plan.start_date} to {plan.end_date})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Start Time"
                            type="time"
                            value={generateForm.start_time}
                            onChange={(e) => setGenerateForm({
                                ...generateForm,
                                start_time: e.target.value
                            })}
                            sx={{
                                // Input text color
                                "& .MuiInputBase-input": {
                                    color: theme.text_color,
                                },

                                // Label default
                                "& .MuiInputLabel-root": {
                                    color: theme.text_color,
                                },

                                // Label when focused
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
                                flex: 1
                            }}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth
                            label="Duration (minutes)"
                            type="number"
                            value={generateForm.duration_minutes}
                            onChange={(e) => setGenerateForm({
                                ...generateForm,
                                duration_minutes: Number(e.target.value)
                            })}
                            sx={{
                                // Input text color
                                "& .MuiInputBase-input": {
                                    color: theme.text_color,
                                },

                                // Label default
                                "& .MuiInputLabel-root": {
                                    color: theme.text_color,
                                },

                                // Label when focused
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
                                flex: 1
                            }}
                        />
                        <FormControlLabel
                            sx={{
                                // Label text color
                                "& .MuiFormControlLabel-label": {
                                    color: theme.text_color,
                                },
                            }}
                            control={
                                <Checkbox
                                    checked={generateForm.replace_existing}
                                    onChange={(e) =>
                                        setGenerateForm({
                                            ...generateForm,
                                            replace_existing: e.target.checked,
                                        })
                                    }
                                    sx={{
                                        color: theme.text_color, // unchecked color

                                        "&.Mui-checked": {
                                            color: theme.primary_color || theme.text_color, // checked color
                                        },

                                        "&:hover": {
                                            backgroundColor: theme.primary_color
                                                ? theme.primary_color + "22"
                                                : "rgba(255,255,255,0.08)",
                                        },
                                    }}
                                />
                            }
                            label="Replace existing sessions"
                        />

                        <Box display="flex" gap={2} justifyContent="flex-end">
                            <Button onClick={() => setGenerateModal(false)} sx={{ color: "red", textTransform: "none" }}>Cancel</Button>
                            <Button
                                variant="contained"
                                onClick={handleGenerateSessions}
                                disabled={!generateForm.plan_id}
                                sx={{ backgroundColor: theme.primary_color, color: theme.text_color, textTransform: "none" }}
                            >
                                <ScheduleIcon sx={{ mr: 1 }} /> Generate Sessions
                            </Button>
                        </Box>
                    </Stack>
                </Box>
            </Modal>

            {/* Edit Session Modal */}
            <Modal open={editModal} onClose={() => setEditModal(false)}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" sx={{ color: theme.text_color, textAlign: 'center', mb: 2 }} gutterBottom>
                        Edit Session
                    </Typography>
                    {selectedSession && (
                        <Stack spacing={2}>
                            <TextField
                                fullWidth
                                label="Date"
                                type="date"
                                value={editForm.session_date?.split('T')[0] || ''}
                                onChange={(e) => setEditForm({
                                    ...editForm,
                                    session_date: e.target.value
                                })}
                                sx={{
                                    minWidth: 160,

                                    // 🔹 Label
                                    "& .MuiInputLabel-root": {
                                        color: theme.text_color,
                                    },
                                    "& .MuiInputLabel-root.Mui-focused": {
                                        color: theme.text_color,
                                    },

                                    // 🔹 Input text
                                    "& .MuiOutlinedInput-input": {
                                        color: theme.text_color,
                                    },

                                    // 🔹 Chrome fix (important for date input)
                                    "& input": {
                                        WebkitTextFillColor: theme.text_color,
                                    },

                                    // 🔹 Default border
                                    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                                        borderColor: theme.text_color,
                                    },

                                    // 🔹 Hover border
                                    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor: theme.text_color,
                                    },

                                    // 🔹 Focus border
                                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: theme.text_color,
                                        borderWidth: 2,
                                    },

                                    // 🔹 Calendar icon color (important)
                                    "& input[type='date']::-webkit-calendar-picker-indicator": {
                                        filter: theme.app_bg === "#000000" || theme.app_bg === "black"
                                            ? "invert(1)"
                                            : "invert(0)",
                                        cursor: "pointer",
                                    },

                                    // 🔹 Smooth transition
                                    "& .MuiOutlinedInput-root": {
                                        transition: "all 0.3s ease",
                                    },
                                }}
                                InputLabelProps={{ shrink: true }}
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Start Time"
                                        type="time"
                                        value={editForm.start_time || ''}
                                        onChange={(e) => setEditForm({
                                            ...editForm,
                                            start_time: e.target.value
                                        })}
                                        sx={{
                                            // Input text color
                                            "& .MuiInputBase-input": {
                                                color: theme.text_color,
                                            },

                                            // Label default
                                            "& .MuiInputLabel-root": {
                                                color: theme.text_color,
                                            },

                                            // Label when focused
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
                                            flex: 1
                                        }}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="End Time"
                                        type="time"
                                        value={editForm.end_time || ''}
                                        onChange={(e) => setEditForm({
                                            ...editForm,
                                            end_time: e.target.value
                                        })}
                                        sx={{
                                            // Input text color
                                            "& .MuiInputBase-input": {
                                                color: theme.text_color,
                                            },

                                            // Label default
                                            "& .MuiInputLabel-root": {
                                                color: theme.text_color,
                                            },

                                            // Label when focused
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
                                            flex: 1
                                        }}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            </Grid>
                            <FormControl sx={{
                                m: 1,
                                minWidth: 120,

                                // 🔹 Underline default
                                "& .MuiInput-underline:before": {
                                    borderBottomColor: theme.text_color,
                                },

                                // 🔹 Underline hover
                                "& .MuiInput-underline:hover:before": {
                                    borderBottomColor: theme.text_color,
                                },

                                // 🔹 Underline focused
                                "& .MuiInput-underline:after": {
                                    borderBottomColor: theme.text_color,
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: theme.text_color,
                                },
                                m: 1, minWidth: 120
                            }} fullWidth>
                                <InputLabel sx={{
                                    color: theme.text_color,
                                    "&.Mui-focused": {
                                        color: theme.text_color,
                                    },
                                }}>Trainer</InputLabel>
                                <Select
                                    value={editForm.trainer_id || ''}
                                    label="Trainer"
                                    onChange={(e) => setEditForm({
                                        ...editForm,
                                        trainer_id: e.target.value
                                    })}
                                    sx={{
                                        // 🔹 Selected text color
                                        "& .MuiSelect-select": {
                                            color: theme.text_color,
                                        },

                                        // 🔹 Dropdown arrow color
                                        "& .MuiSvgIcon-root": {
                                            color: theme.text_color,
                                        },
                                    }}
                                >
                                    {employees
                                        .map(trainer => (
                                            <MenuItem key={trainer.id} value={trainer.id}>
                                                {trainer.name}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                            <FormControl sx={{
                                m: 1,
                                minWidth: 120,

                                // 🔹 Underline default
                                "& .MuiInput-underline:before": {
                                    borderBottomColor: theme.text_color,
                                },

                                // 🔹 Underline hover
                                "& .MuiInput-underline:hover:before": {
                                    borderBottomColor: theme.text_color,
                                },

                                // 🔹 Underline focused
                                "& .MuiInput-underline:after": {
                                    borderBottomColor: theme.text_color,
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: theme.text_color,
                                },
                                m: 1, minWidth: 120
                            }} fullWidth>
                                <InputLabel sx={{
                                    color: theme.text_color,
                                    "&.Mui-focused": {
                                        color: theme.text_color,
                                    },
                                }}>Status</InputLabel>
                                <Select
                                    value={editForm.status || ''}
                                    label="Status"
                                    onChange={(e) => setEditForm({
                                        ...editForm,
                                        status: e.target.value
                                    })}
                                    sx={{
                                        // 🔹 Selected text color
                                        "& .MuiSelect-select": {
                                            color: theme.text_color,
                                        },

                                        // 🔹 Dropdown arrow color
                                        "& .MuiSvgIcon-root": {
                                            color: theme.text_color,
                                        },
                                    }}
                                >
                                    <MenuItem value="scheduled">Scheduled</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                    <MenuItem value="missed">Missed</MenuItem>
                                </Select>
                            </FormControl>
                            <Box display="flex" gap={2} justifyContent="flex-end">
                                <Button onClick={() => setEditModal(false)} sx={{ color: 'red' }}>Cancel</Button>
                                <Button
                                    variant="contained"
                                    onClick={handleUpdateSession}
                                    sx={{ backgroundColor: theme.primary_color, color: theme.text_color }}
                                >
                                    Update Session
                                </Button>
                            </Box>
                        </Stack>
                    )}
                </Box>
            </Modal>
        </LocalizationProvider>
    );
};



export default SessionManager;
