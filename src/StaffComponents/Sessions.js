import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    MenuItem,
    Chip,
    Tabs,
    Tab,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Pagination,
    Divider,
    useMediaQuery,
    Snackbar,
    Alert,
    Select,
    FormControl,
} from "@mui/material";

// If you already have axios instance `api`, use it.
// Otherwise use fetch like you did in modulesfetch.
import api from "./services/api";

function toDateOnly(value) {
    // value like "2026-02-05"
    return value || "";
}

function formatTimeHHMM(timeStr) {
    if (!timeStr) return "";
    // "09:00:00" -> "09:00"
    return timeStr.slice(0, 5);
}

function statusChip(status) {
    const s = (status || "").toLowerCase();
    const map = {
        scheduled: { label: "Scheduled", color: "info" },
        completed: { label: "Completed", color: "success" },
        cancelled: { label: "Cancelled", color: "error" },
        missed: { label: "Missed", color: "warning" },
    };
    const cfg = map[s] || { label: status || "Unknown", color: "default" };
    return <Chip size="small" label={cfg.label} color={cfg.color} variant="filled" />;
}

function compareISODate(a, b) {
    // expects YYYY-MM-DD
    if (!a || !b) return 0;
    return a.localeCompare(b);
}

export default function StaffSessionsPage() {
    const isMobile = useMediaQuery("(max-width:900px)");

    const [loading, setLoading] = useState(true);
    const [apiData, setApiData] = useState(null);
    const [error, setError] = useState("");

    // UI state
    const [tab, setTab] = useState("upcoming"); // upcoming | completed | all
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("all");
    const [fromDate, setFromDate] = useState(""); // YYYY-MM-DD
    const [toDate, setToDate] = useState(""); // YYYY-MM-DD
    const [page, setPage] = useState(1);
    const [sessionList, setSessionList] = useState([]);
    const [toast, setToast] = useState({ open: false, type: "success", msg: "" });

    const openToast = (type, msg) => setToast({ open: true, type, msg });


    const pageSize = 10;
    const [themedata, setTheme] = useState({});

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


    // ✅ Fetch sessions
    const fetchSessions = async () => {
        try {
            setLoading(true);
            setError("");

            // Replace endpoint if yours differs:
            // e.g. "/api/staff/sessions" or "/sessions/staff"
            const res = await api.get("/api/sessions", { withCredentials: true });
            // If you use fetch:
            // const response = await fetch(`${process.env.REACT_APP_URL}/api/staff/sessions`, { credentials: "include" });
            // const json = await response.json();

            const json = res.data;
            setApiData(json);
        } catch (e) {
            console.error(e);
            setError("Failed to load sessions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setSessionList(apiData?.sessions || []);
    }, [apiData]);

    const sessions = sessionList;

    // ✅ Stats
    const stats = useMemo(() => {
        const total = sessions.length;
        const scheduled = sessions.filter((s) => (s.status || "").toLowerCase() === "scheduled").length;
        const completed = sessions.filter((s) => (s.status || "").toLowerCase() === "completed").length;
        return { total, scheduled, completed };
    }, [sessions]);

    // ✅ Filtered data
    const filtered = useMemo(() => {
        const today = new Date();
        const todayISO = today.toISOString().slice(0, 10); // UTC date; ok for simple compare

        return sessions
            .filter((s) => {
                // Tabs
                const sDate = s.session_date;
                const sStatus = (s.status || "").toLowerCase();

                if (tab === "completed") {
                    if (sStatus !== "completed") return false;
                }
                if (tab === "upcoming") {
                    // upcoming = date >= today and not completed
                    // (if you want ONLY scheduled: add sStatus === "scheduled")
                    if (compareISODate(sDate, todayISO) < 0) return false;
                    if (sStatus === "completed") return false;
                }

                // Status filter
                if (status !== "all" && sStatus !== status) return false;

                // Date range
                if (fromDate && compareISODate(sDate, fromDate) < 0) return false;
                if (toDate && compareISODate(sDate, toDate) > 0) return false;

                // Search (client_name / trainer_name)
                if (q.trim()) {
                    const needle = q.trim().toLowerCase();
                    const hay = `${s.client_name || ""} ${s.trainer_name || ""}`.toLowerCase();
                    if (!hay.includes(needle)) return false;
                }

                return true;
            })
            // Sort by date then start_time
            .sort((a, b) => {
                const d = (a.session_date || "").localeCompare(b.session_date || "");
                if (d !== 0) return d;
                return (a.start_time || "").localeCompare(b.start_time || "");
            });
    }, [sessions, tab, status, fromDate, toDate, q]);

    // ✅ Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    useEffect(() => {
        // reset page when filters change
        setPage(1);
    }, [tab, status, fromDate, toDate, q]);

    const updateSessionStatus = async (sessionId, newStatus) => {
        // optimistic update
        const prev = sessionList;
        setSessionList((list) =>
            list.map((s) => (s.id === sessionId ? { ...s, status: newStatus } : s))
        );

        try {
            await api.put(`/api/sessions/update/${sessionId}`, { status: newStatus }, { withCredentials: true });
            openToast("success", "Session status updated");
            fetchSessions();
        } catch (err) {
            console.error(err);
            // rollback on fail
            setSessionList(prev);
            openToast("error", err?.response?.data?.message || "Failed to update session");
        }
    };


    return (
        <Box sx={{
            p: {
                xs: 2, md: 3
            },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)", md: "1fr" },
        }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: themedata.text_color }}>
                    Sessions
                </Typography>

                <Typography variant="body2" sx={{ opacity: 0.85, color: themedata.text_color }}>
                    {apiData?.role ? `Role: ${apiData.role}` : ""} {apiData?.count ? `• Total: ${apiData.count}` : ""}
                </Typography>
            </Box>

            {/* Summary cards */}
            <Box
                sx={{
                    display: { md: "flex" },
                    justifyContent: { md: "space-between" },
                    gap: 2,
                    mb: 2,
                    width: "100%",       // ✅ important
                    maxWidth: "100%",
                }}
            >
                <Card sx={{ backgroundColor: themedata.app_bg, mb: { xs: 2, md: 0 } }}>
                    <CardContent>
                        <Typography variant="body2" sx={{ opacity: 0.8, color: themedata.text_color }}>
                            Total Sessions
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: themedata.text_color }}>
                            {stats.total}
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ backgroundColor: themedata.app_bg, mb: { xs: 2, md: 0 } }}>
                    <CardContent>
                        <Typography variant="body2" sx={{ opacity: 0.8, color: themedata.text_color }}>
                            Scheduled
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: themedata.text_color }}>
                            {stats.scheduled}
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ backgroundColor: themedata.app_bg, mb: { xs: 2, md: 0 } }}>
                    <CardContent>
                        <Typography variant="body2" sx={{ opacity: 0.8, color: themedata.text_color }}>
                            Completed
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: themedata.text_color }}>
                            {stats.completed}
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

            {/* Tabs */}
            <Card sx={{ mb: 2, backgroundColor: themedata.app_bg }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant={isMobile ? "scrollable" : "standard"}
                    scrollButtons="auto"

                >
                    <Tab value="upcoming" label="Upcoming" sx={{ color: themedata.sidebar_bg }} />
                    <Tab value="completed" label="Completed" sx={{ color: themedata.sidebar_bg }} />
                    <Tab value="all" label="All" sx={{ color: themedata.sidebar_bg }} />
                </Tabs>

                <Divider />

                {/* Filters */}
                <Box sx={{ p: 2 }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                        <TextField
                            label="Search (Client / Trainer)"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            size="small"
                            fullWidth
                            sx={{
                                // 🔹 Label
                                "& .MuiInputLabel-root": {
                                    color: themedata.text_color,
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                    color: themedata.text_color,
                                },

                                // 🔹 Input text
                                "& .MuiOutlinedInput-input": {
                                    color: themedata.text_color,
                                },

                                // 🔹 Placeholder
                                "& .MuiOutlinedInput-input::placeholder": {
                                    color: themedata.text_color,
                                    opacity: 0.6,
                                },

                                // 🔹 Chrome autofill fix
                                "& input": {
                                    WebkitTextFillColor: themedata.text_color,
                                },

                                // 🔹 Default border
                                "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                                    borderColor: themedata.text_color,
                                },

                                // 🔹 Hover border
                                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: themedata.text_color,
                                },

                                // 🔹 Focus border
                                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: themedata.text_color,
                                    borderWidth: 2,
                                },

                                // 🔹 Smooth transition
                                "& .MuiOutlinedInput-root": {
                                    transition: "all 0.3s ease",
                                },
                            }}
                        />


                        <TextField
                            select
                            label="Status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            size="small"
                            sx={{
                                minWidth: 160,

                                // 🔹 Label
                                "& .MuiInputLabel-root": {
                                    color: themedata.text_color,
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                    color: themedata.text_color,
                                },

                                // 🔹 Selected value text
                                "& .MuiOutlinedInput-input": {
                                    color: themedata.text_color,
                                },

                                // 🔹 Border default
                                "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                                    borderColor: themedata.text_color,
                                },

                                // 🔹 Hover border
                                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: themedata.text_color,
                                },

                                // 🔹 Focus border
                                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: themedata.text_color,
                                    borderWidth: 2,
                                },

                                // 🔹 Dropdown arrow icon
                                "& .MuiSvgIcon-root": {
                                    color: themedata.text_color,
                                },

                                // 🔹 Smooth transition
                                "& .MuiOutlinedInput-root": {
                                    transition: "all 0.3s ease",
                                },
                            }}
                            SelectProps={{
                                MenuProps: {
                                    PaperProps: {
                                        sx: {
                                            bgcolor: themedata.app_bg,
                                            color: themedata.text_color,

                                            "& .MuiMenuItem-root:hover": {
                                                backgroundColor: themedata.app_bg,
                                            },

                                            "& .MuiMenuItem-root.Mui-selected": {
                                                backgroundColor: themedata.sidebar_bg,
                                            },

                                            "& .MuiMenuItem-root.Mui-selected:hover": {
                                                backgroundColor: themedata.app_bg,
                                            },
                                        },
                                    },
                                },
                            }}
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="scheduled">Scheduled</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                            <MenuItem value="missed">Missed</MenuItem>
                        </TextField>


                        <TextField
                            type="date"
                            label="From"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                minWidth: 160,

                                // 🔹 Label
                                "& .MuiInputLabel-root": {
                                    color: themedata.text_color,
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                    color: themedata.text_color,
                                },

                                // 🔹 Input text
                                "& .MuiOutlinedInput-input": {
                                    color: themedata.text_color,
                                },

                                // 🔹 Chrome fix (important for date input)
                                "& input": {
                                    WebkitTextFillColor: themedata.text_color,
                                },

                                // 🔹 Default border
                                "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                                    borderColor: themedata.text_color,
                                },

                                // 🔹 Hover border
                                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: themedata.text_color,
                                },

                                // 🔹 Focus border
                                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: themedata.text_color,
                                    borderWidth: 2,
                                },

                                // 🔹 Calendar icon color (important)
                                "& input[type='date']::-webkit-calendar-picker-indicator": {
                                    filter: themedata.app_bg === "#000000" || themedata.app_bg === "black"
                                        ? "invert(1)"
                                        : "invert(0)",
                                    cursor: "pointer",
                                },

                                // 🔹 Smooth transition
                                "& .MuiOutlinedInput-root": {
                                    transition: "all 0.3s ease",
                                },
                            }}
                        />


                        <TextField
                            type="date"
                            label="To"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                minWidth: 160,

                                // 🔹 Label
                                "& .MuiInputLabel-root": {
                                    color: themedata.text_color,
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                    color: themedata.text_color,
                                },

                                // 🔹 Input text
                                "& .MuiOutlinedInput-input": {
                                    color: themedata.text_color,
                                },

                                // 🔹 Chrome fix (important for date input)
                                "& input": {
                                    WebkitTextFillColor: themedata.text_color,
                                },

                                // 🔹 Default border
                                "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                                    borderColor: themedata.text_color,
                                },

                                // 🔹 Hover border
                                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: themedata.text_color,
                                },

                                // 🔹 Focus border
                                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: themedata.text_color,
                                    borderWidth: 2,
                                },

                                // 🔹 Calendar icon color (important)
                                "& input[type='date']::-webkit-calendar-picker-indicator": {
                                    filter: themedata.app_bg === "#000000" || themedata.app_bg === "black"
                                        ? "invert(1)"
                                        : "invert(0)",
                                    cursor: "pointer",
                                },

                                // 🔹 Smooth transition
                                "& .MuiOutlinedInput-root": {
                                    transition: "all 0.3s ease",
                                },
                            }}
                        />
                    </Stack>

                    <Box sx={{ mt: 1.5 }}>
                        <Typography variant="body2" sx={{ opacity: 0.8, color: themedata.text_color }}>
                            Showing <b>{filtered.length}</b> sessions
                        </Typography>
                    </Box>
                </Box>
            </Card>

            {/* Content */}
            {loading ? (
                <Card>
                    <CardContent>
                        <Typography sx={{ color: themedata.text_color }}>Loading sessions...</Typography>
                    </CardContent>
                </Card>
            ) : error ? (
                <Card>
                    <CardContent>
                        <Typography color="error">{error}</Typography>
                    </CardContent>
                </Card>
            ) : filtered.length === 0 ? (
                <Card sx={{backgroundColor:themedata.app_bg}}>
                    <CardContent>
                        <Typography sx={{ color: themedata.text_color }}>No sessions found for selected filters.</Typography>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Desktop table */}
                    {!isMobile ? (
                        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden" }}>
                            <Table>
                                <TableHead sx={{ backgroundColor: themedata.sidebar_bg }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, color: themedata.text_color }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: themedata.text_color }}>Time</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: themedata.text_color }}>Client</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: themedata.text_color }}>Trainer</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: themedata.text_color }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody sx={{ backgroundColor: themedata.app_bg }}>
                                    {paged.map((s) => (
                                        <TableRow key={s.id} hover >
                                            <TableCell sx={{ color: themedata.text_color }}>{toDateOnly(s.session_date)}</TableCell>
                                            <TableCell sx={{ color: themedata.text_color }}>
                                                {formatTimeHHMM(s.start_time)} - {formatTimeHHMM(s.end_time)}
                                            </TableCell>
                                            <TableCell sx={{ color: themedata.text_color }}>{s.client_name}</TableCell>
                                            <TableCell sx={{ color: themedata.text_color }}>{s.trainer_name}</TableCell>
                                            <TableCell>
                                                <FormControl size="small" variant="outlined" sx={{
                                                minWidth: 150,

                                                // 🔹 Default outline
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: themedata.text_color,
                                                    borderWidth: 1.5,
                                                },

                                                // 🔹 Hover outline
                                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: themedata.primary_color,
                                                    borderWidth: 2,
                                                },

                                                // 🔹 Focus outline
                                                "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: themedata.primary_color,
                                                    borderWidth: 2,
                                                },

                                                // 🔹 Smooth transition
                                                "& .MuiOutlinedInput-root": {
                                                    transition: "all 0.2s ease",
                                                    backgroundColor: themedata.app_bg,
                                                    color: themedata.text_color,
                                                },

                                                // 🔹 Selected value text
                                                "& .MuiSelect-select": {
                                                    color: themedata.text_color,
                                                },

                                                // 🔹 Dropdown arrow icon
                                                "& .MuiSvgIcon-root": {
                                                    color: themedata.text_color,
                                                },
                                            }}>
                                                <Select
                                                    value={(s.status || "").toLowerCase()}
                                                    onChange={(e) => updateSessionStatus(s.id, e.target.value)}
                                                    displayEmpty
                                                    MenuProps={{
                                                        PaperProps: {
                                                            sx: {
                                                                bgcolor: themedata.app_bg,
                                                                color: themedata.text_color,

                                                                // Hover item
                                                                "& .MuiMenuItem-root:hover": {
                                                                    backgroundColor: themedata.primary_color + "20",
                                                                },

                                                                // Selected item
                                                                "& .MuiMenuItem-root.Mui-selected": {
                                                                    backgroundColor: themedata.primary_color + "30",
                                                                },

                                                                "& .MuiMenuItem-root.Mui-selected:hover": {
                                                                    backgroundColor: themedata.primary_color + "40",
                                                                },
                                                            },
                                                        },
                                                    }}
                                                // sx={{
                                                //     color: themedata.text_color,
                                                //     background: themedata.app_bg,
                                                //     borderRadius: 1,
                                                // }}
                                                >
                                                    <MenuItem value="scheduled">Scheduled</MenuItem>
                                                    <MenuItem value="completed">Completed</MenuItem>
                                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                                    <MenuItem value="missed">Missed</MenuItem>
                                                </Select>
                                            </FormControl>
                                            </TableCell>

                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        // Mobile cards
                        <Stack spacing={1.5}>
                            {paged.map((s) => (
                                <Card key={s.id} sx={{ borderRadius: 2, backgroundColor: themedata.sidebar_bg, color: themedata.text_color }}>
                                    <CardContent>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                                            <Box>
                                                <Typography sx={{ fontWeight: 700 }}>
                                                    {toDateOnly(s.session_date)}
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                                    {formatTimeHHMM(s.start_time)} - {formatTimeHHMM(s.end_time)}
                                                </Typography>
                                            </Box>
                                            {/* {statusChip(s.status)} */}
                                            <FormControl size="small" variant="outlined" sx={{
                                                minWidth: 150,

                                                // 🔹 Default outline
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: themedata.text_color,
                                                    borderWidth: 1.5,
                                                },

                                                // 🔹 Hover outline
                                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: themedata.primary_color,
                                                    borderWidth: 2,
                                                },

                                                // 🔹 Focus outline
                                                "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: themedata.primary_color,
                                                    borderWidth: 2,
                                                },

                                                // 🔹 Smooth transition
                                                "& .MuiOutlinedInput-root": {
                                                    transition: "all 0.2s ease",
                                                    backgroundColor: themedata.app_bg,
                                                    color: themedata.text_color,
                                                },

                                                // 🔹 Selected value text
                                                "& .MuiSelect-select": {
                                                    color: themedata.text_color,
                                                },

                                                // 🔹 Dropdown arrow icon
                                                "& .MuiSvgIcon-root": {
                                                    color: themedata.text_color,
                                                },
                                            }}>
                                                <Select
                                                    value={(s.status || "").toLowerCase()}
                                                    onChange={(e) => updateSessionStatus(s.id, e.target.value)}
                                                    displayEmpty
                                                    MenuProps={{
                                                        PaperProps: {
                                                            sx: {
                                                                bgcolor: themedata.app_bg,
                                                                color: themedata.text_color,

                                                                // Hover item
                                                                "& .MuiMenuItem-root:hover": {
                                                                    backgroundColor: themedata.primary_color + "20",
                                                                },

                                                                // Selected item
                                                                "& .MuiMenuItem-root.Mui-selected": {
                                                                    backgroundColor: themedata.primary_color + "30",
                                                                },

                                                                "& .MuiMenuItem-root.Mui-selected:hover": {
                                                                    backgroundColor: themedata.primary_color + "40",
                                                                },
                                                            },
                                                        },
                                                    }}
                                                // sx={{
                                                //     color: themedata.text_color,
                                                //     background: themedata.app_bg,
                                                //     borderRadius: 1,
                                                // }}
                                                >
                                                    <MenuItem value="scheduled">Scheduled</MenuItem>
                                                    <MenuItem value="completed">Completed</MenuItem>
                                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                                    <MenuItem value="missed">Missed</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>

                                        <Divider sx={{ my: 1.5 }} />

                                        <Typography variant="body2">
                                            <b>Client:</b> {s.client_name}
                                        </Typography>
                                        <Typography variant="body2">
                                            <b>Trainer:</b> {s.trainer_name}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    )}

                    {/* Pagination */}
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, p) => setPage(p)}
                            shape="rounded"
                        />
                    </Box>
                </>
            )}
            <Snackbar
                open={toast.open}
                autoHideDuration={2500}
                onClose={() => setToast((t) => ({ ...t, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    severity={toast.type}
                    variant="filled"
                    onClose={() => setToast((t) => ({ ...t, open: false }))}
                >
                    {toast.msg}
                </Alert>
            </Snackbar>

        </Box>
    );
}
