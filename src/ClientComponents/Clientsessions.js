

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Avatar,
    Chip,
    Grid,
    IconButton,
    CircularProgress,
    Alert,
    Paper,
    Divider,
    Stack,
    Button,
    Modal,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import TodayIcon from '@mui/icons-material/Today';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    maxWidth: '90vw',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2
};

const ClientSessionsCalendar = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [editModal, setEditModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [editForm, setEditForm] = useState({});
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

    // Fetch sessions
    const fetchSessions = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${process.env.REACT_APP_URL}/api/sessions`, {
                withCredentials: true,
            });
            if (res.data.success) {
                setSessions(res.data.sessions);
            }
        } catch (err) {
            setError('Failed to load sessions. Please try again.');
            console.error('Sessions error:', err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchSessions();
    }, []);

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

    // Get sessions for specific date
    const getSessionsForDate = (dateStr) => {
        return sessions.filter(session => session.session_date === dateStr);
    };

    // Generate calendar days
    const generateCalendarDays = (month = currentMonth) => {
        const year = month.getFullYear();
        const thisMonth = new Date(year, month.getMonth(), 1);
        const firstDay = thisMonth.getDay();
        const daysInMonth = new Date(year, month.getMonth() + 1, 0).getDate();

        const days = [];

        // Previous month days
        for (let i = 0; i < firstDay; i++) {
            days.push({ date: null, day: null });
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const daySessions = getSessionsForDate(dateStr);

            days.push({
                date: dateStr,
                day,
                sessions: daySessions,
                hasSession: daySessions.length > 0
            });
        }

        // Fill remaining days
        const totalDays = 42; // 6 weeks
        while (days.length < totalDays) {
            days.push({ date: null, day: null });
        }

        return days;
    };

    const calendarDays = generateCalendarDays();

    // Navigation
    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentMonth(new Date());
        setSelectedDate(null);
    };

    // Format month/year
    const formatMonthYear = () => {
        return currentMonth.toLocaleDateString('en-IN', {
            month: 'long',
            year: 'numeric'
        });
    };

    // Status helpers
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'scheduled': return 'primary';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircleIcon fontSize="small" />;
            case 'scheduled': return <ScheduleIcon fontSize="small" />;
            case 'cancelled': return <EventBusyIcon fontSize="small" />;
            default: return <AccessTimeIcon fontSize="small" />;
        }
    };

    const formatTime = (timeStr) => timeStr ? timeStr.slice(0, 5) : 'N/A';

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size={60} />
                <Typography sx={{ ml: 2, fontSize: '1.2rem' }}>Loading your sessions...</Typography>
            </Box>
        );
    }

    return (
        // <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
        //     {/* Header */}
        //     <Paper elevation={3} sx={{ p: 3, mb: 4,color: theme.text_color, bgcolor: theme.app_bg }}>
        //         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        //             <Box>
        //                 <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        //                     My Training Calendar
        //                 </Typography>
        //                 <Typography variant="h6" sx={{color:theme.text_color}}>
        //                     {sessions.length} sessions across {calendarDays.filter(day => day.hasSession).length} days
        //                 </Typography>
        //             </Box>
        //             {/* <Button
        //                 variant="contained"
        //                 startIcon={<TodayIcon />}
        //                 onClick={goToToday}
        //                 sx={{ fontWeight: 600 }}
        //             >
        //                 Today
        //             </Button> */}
        //         </Box>
        //     </Paper>

        //     {/* Selected Date Sessions */}
        //     {selectedDate && (
        //         <Box sx={{ mt: 4 }}>
        //             <Typography variant="h5" sx={{ mb: 3, fontWeight: 600,color: theme.text_color }}>
        //                 Sessions on {new Date(selectedDate).toLocaleDateString('en-IN', {
        //                     weekday: 'long',
        //                     year: 'numeric',
        //                     month: 'long',
        //                     day: 'numeric'
        //                 })}
        //             </Typography>

        //             <Grid container spacing={3}>
        //                 {getSessionsForDate(selectedDate).map((session) => (
        //                     <Grid item xs={12} sm={6} md={4} key={session.id}>
        //                         <Card elevation={4} sx={{ height: '100%' }}>
        //                             <CardContent sx={{ p: 3 }}>
        //                                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        //                                     <Avatar sx={{ bgcolor: theme.sidebar_bg, mr: 2 }}>
        //                                         {session.trainer_name.charAt(0).toUpperCase()}
        //                                     </Avatar>
        //                                     <Box>
        //                                         <Typography variant="h6" fontWeight={600}>
        //                                             {session.trainer_name}
        //                                         </Typography>
        //                                         <Typography variant="body2" color="text.secondary">
        //                                             Trainer
        //                                         </Typography>
        //                                     </Box>
        //                                 </Box>

        //                                 <Box sx={{ mb: 3 }}>
        //                                     <Typography variant="h5" fontWeight={600}>
        //                                         {formatTime(session.start_time)} - {formatTime(session.end_time)}
        //                                     </Typography>
        //                                 </Box>

        //                                 <Chip
        //                                     icon={getStatusIcon(session.status)}
        //                                     label={session.status.toUpperCase()}
        //                                     color={getStatusColor(session.status)}
        //                                     sx={{ fontWeight: 600 }}
        //                                 />
        //                                 <IconButton
        //                                     color="primary"
        //                                     onClick={() => {
        //                                         setSelectedSession(session);
        //                                         setEditForm({
        //                                             // session_date: session.session_date,
        //                                             // start_time: session.start_time,
        //                                             // end_time: session.end_time,
        //                                             status: session.status
        //                                         });
        //                                         setEditModal(true);
        //                                     }}
        //                                 >
        //                                     <EditIcon sx={{ color: theme.primary_color }} />
        //                                 </IconButton>
        //                             </CardContent>
        //                         </Card>
        //                         {/* Edit Session Modal */}
        //                         <Modal open={editModal} onClose={() => setEditModal(false)}>
        //                             <Box sx={modalStyle}>
        //                                 <Typography variant="h6" gutterBottom>
        //                                     Edit Session
        //                                 </Typography>
        //                                 {selectedSession && (
        //                                     <Stack spacing={2}>

        //                                         <FormControl fullWidth>
        //                                             <InputLabel>Status</InputLabel>
        //                                             <Select
        //                                                 value={editForm.status || ''}
        //                                                 label="Status"
        //                                                 onChange={(e) => setEditForm({
        //                                                     ...editForm,
        //                                                     status: e.target.value
        //                                                 })}
        //                                             >
        //                                                 <MenuItem value="scheduled">Scheduled</MenuItem>
        //                                                 <MenuItem value="completed">Completed</MenuItem>
        //                                                 <MenuItem value="cancelled">Cancelled</MenuItem>
        //                                                 <MenuItem value="missed">Missed</MenuItem>
        //                                             </Select>
        //                                         </FormControl>
        //                                         <Box display="flex" gap={2} justifyContent="flex-end">
        //                                             <Button onClick={() => setEditModal(false)}>Cancel</Button>
        //                                             <Button
        //                                                 variant="contained"
        //                                                 onClick={handleUpdateSession}
        //                                             >
        //                                                 Update Session
        //                                             </Button>
        //                                         </Box>
        //                                     </Stack>
        //                                 )}
        //                             </Box>
        //                         </Modal>
        //                     </Grid>
        //                 ))}
        //             </Grid>
        //         </Box>
        //     )}

        //     {/* Calendar Navigation */}
        //     <Paper elevation={2} sx={{ p: 2.5, mt: 3, mb: 4,bgcolor: theme.app_bg, color: theme.text_color }}>
        //         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        //             <IconButton onClick={goToPreviousMonth} size="large">
        //                 <ArrowBackIosIcon sx={{bgcolor: theme.app_bg, color: theme.text_color}}/>
        //             </IconButton>

        //             <Typography variant="h5" fontWeight={700}>
        //                 {formatMonthYear()}
        //             </Typography>

        //             <IconButton onClick={goToNextMonth} size="large">
        //                 <ArrowForwardIosIcon sx={{bgcolor: theme.app_bg, color: theme.text_color}} />
        //             </IconButton>
        //         </Box>
        //     </Paper>

        //     {/* Calendar Grid */}
        //     <Paper elevation={3} sx={{ p: 3, overflowX: 'auto',bgcolor: theme.app_bg, color: theme.text_color }}>
        //         {/* Weekday Headers */}
        //         <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 2, fontWeight: 600 }}>
        //             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        //                 <Box key={day} sx={{ textAlign: 'center', py: 1.5, fontSize: '0.9rem', color: theme.text_color }}>
        //                     {day}
        //                 </Box>
        //             ))}
        //         </Box>

        //         {/* Calendar Days */}
        //         <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        //             {calendarDays.map((day, index) => (
        //                 <Paper
        //                     key={index}
        //                     elevation={day.date === selectedDate ? 8 : day.hasSession ? 4 : 1}
        //                     sx={{
        //                         p: 1.5,
        //                         minHeight: 100,
        //                         cursor: 'pointer',
        //                         borderRadius: 2,
        //                         bgcolor: day.date === selectedDate
        //                             ? theme.sidebar_bg
        //                             : day.hasSession
        //                                 ? theme.sidebar_bg
        //                                 : theme.app_bg,
        //                         color: day.date === selectedDate ? theme.text_color : theme.text_color,
        //                         transition: 'all 0.2s',
        //                         border: day.date === selectedDate ? '2px solid primary.dark' : '1px solid transparent',
        //                         '&:hover': {
        //                             transform: 'scale(1.02)',
        //                             boxShadow: 4,
        //                         },
        //                         display: 'flex',
        //                         flexDirection: 'column',
        //                         gap: 0.5
        //                     }}
        //                     onClick={() => day.date && setSelectedDate(day.date)}
        //                 >
        //                     {/* Day Number */}
        //                     <Typography variant="body2" fontWeight={600}>
        //                         {day.day || ''}
        //                     </Typography>

        //                     {/* Session Indicators */}
        //                     {day.hasSession && (
        //                         <Box sx={{ mt: 'auto' }}>
        //                             {/* Replace this single Chip */}
        //                             {day.sessions.slice(0, 2).map((session, sIndex) => (
        //                                 <Box
        //                                     key={session.id}
        //                                     sx={{
        //                                         p: 0.5,
        //                                         bgcolor: `${getStatusColor(session.status)}`,
        //                                         borderRadius: 1,
        //                                         mt: 0.25,
        //                                         border: `1px solid ${getStatusColor(session.status)}.main`,
        //                                         minHeight: 28,
        //                                     }}
        //                                 >
        //                                     <Stack direction="column" sx={{ height: '100%' }}>
        //                                         {/* Time (Top) */}
        //                                         <Typography
        //                                             variant="caption"
        //                                             sx={{
        //                                                 fontSize: '0.65rem',
        //                                                 fontWeight: 600,
        //                                                 lineHeight: 1,
        //                                                 mx: 'auto',
        //                                                 color: `${getStatusColor(session.status)}`
        //                                             }}
        //                                         >
        //                                             {formatTime(session.start_time)}
        //                                         </Typography>

        //                                         {/* Trainer Initials (Middle) */}
        //                                         <Typography
        //                                             variant="caption"
        //                                             sx={{
        //                                                 fontSize: '0.7rem',
        //                                                 fontWeight: 700,
        //                                                 lineHeight: 1,
        //                                                 color: 'black',
        //                                                 mt: 1,
        //                                                 textAlign: 'center'
        //                                             }}
        //                                         >
        //                                             {session.trainer_name}
        //                                         </Typography>

        //                                         {/* Status Dot (Bottom) */}
        //                                         <Box sx={{ mx: 'auto', mt: 0.25, fontSize: '0.65rem' }}>
        //                                             {session.status}
        //                                         </Box>
        //                                     </Stack>
        //                                 </Box>
        //                             ))}

        //                             {/* Multiple sessions indicator */}
        //                             {day.sessions.length > 2 && (
        //                                 <Chip
        //                                     label={`+${day.sessions.length - 2}`}
        //                                     size="small"
        //                                     color="secondary"
        //                                     sx={{
        //                                         fontSize: '0.65rem',
        //                                         height: 20,
        //                                         mt: 0.25,
        //                                         fontWeight: 700
        //                                     }}
        //                                 />
        //                             )}

        //                         </Box>
        //                     )}
        //                 </Paper>
        //             ))}
        //         </Box>
        //     </Paper>



        //     {/* Error */}
        //     {error && (
        //         <Alert severity="error" sx={{ mt: 4 }} onClose={() => setError(null)}>
        //             {error}
        //         </Alert>
        //     )}
        // </Box>
        <Box
            sx={{
                p: { xs: 1.5, sm: 2, md: 4 },
                maxWidth: 1400,
                mx: "auto",
                width: "100%",
            }}
        >
            {/* Header */}
            <Paper
                elevation={3}
                sx={{
                    p: { xs: 2, md: 3 },
                    mb: { xs: 2, md: 4 },
                    color: theme.text_color,
                    bgcolor: theme.app_bg,
                    borderRadius: 2,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                mb: 0.5,
                                fontSize: { xs: "1.4rem", sm: "2rem" },
                            }}
                        >
                            My Training Calendar
                        </Typography>

                        <Typography
                            variant="h6"
                            sx={{
                                color: theme.text_color,
                                fontSize: { xs: "0.95rem", sm: "1.1rem" },
                            }}
                        >
                            {sessions.length} sessions across{" "}
                            {calendarDays.filter((day) => day.hasSession).length} days
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Selected Date Sessions */}
            {selectedDate && (
                <Box sx={{ mt: { xs: 2, md: 4 } }}>
                    <Typography
                        variant="h5"
                        sx={{
                            mb: { xs: 2, md: 3 },
                            fontWeight: 600,
                            color: theme.text_color,
                            fontSize: { xs: "1.1rem", sm: "1.4rem" },
                        }}
                    >
                        Sessions on{" "}
                        {new Date(selectedDate).toLocaleDateString("en-IN", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </Typography>

                    <Grid container spacing={{ xs: 2, md: 3 }}>
                        {getSessionsForDate(selectedDate).map((session) => (
                            <Grid item xs={12} sm={6} md={4} key={session.id}>
                                <Card sx={{ height: "100%", borderRadius: 2 }}>
                                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                            <Avatar sx={{ bgcolor: theme.sidebar_bg, mr: 2 }}>
                                                {session.trainer_name.charAt(0).toUpperCase()}
                                            </Avatar>

                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                    variant="h6"
                                                    fontWeight={600}
                                                    sx={{
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}
                                                >
                                                    {session.trainer_name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Trainer
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ mb: 3 }}>
                                            <Typography
                                                variant="h5"
                                                fontWeight={600}
                                                sx={{ fontSize: { xs: "1.1rem", sm: "1.4rem" } }}
                                            >
                                                {formatTime(session.start_time)} - {formatTime(session.end_time)}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Chip
                                                icon={getStatusIcon(session.status)}
                                                label={session.status.toUpperCase()}
                                                color={getStatusColor(session.status)}
                                                sx={{ fontWeight: 600 }}
                                            />

                                            <IconButton
                                                onClick={() => {
                                                    setSelectedSession(session);
                                                    setEditForm({ status: session.status });
                                                    setEditModal(true);
                                                }}
                                            >
                                                <EditIcon sx={{ color: theme.primary_color }} />
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>

                                {/* Edit Modal */}
                                <Modal open={editModal} onClose={() => setEditModal(false)}>
                                    <Box
                                        sx={{
                                            ...modalStyle,
                                            width: { xs: "92%", sm: 420 },
                                            maxWidth: "92%",
                                        }}
                                    >
                                        <Typography variant="h6" gutterBottom>
                                            Edit Session
                                        </Typography>

                                        {selectedSession && (
                                            <Stack spacing={2}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Status</InputLabel>
                                                    <Select
                                                        value={editForm.status || ""}
                                                        label="Status"
                                                        onChange={(e) =>
                                                            setEditForm({ ...editForm, status: e.target.value })
                                                        }
                                                    >
                                                        <MenuItem value="scheduled">Scheduled</MenuItem>
                                                        <MenuItem value="completed">Completed</MenuItem>
                                                        <MenuItem value="cancelled">Cancelled</MenuItem>
                                                        <MenuItem value="missed">Missed</MenuItem>
                                                    </Select>
                                                </FormControl>

                                                <Box display="flex" gap={2} justifyContent="flex-end">
                                                    <Button onClick={() => setEditModal(false)}>Cancel</Button>
                                                    <Button variant="contained" onClick={handleUpdateSession}>
                                                        Update Session
                                                    </Button>
                                                </Box>
                                            </Stack>
                                        )}
                                    </Box>
                                </Modal>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Calendar Navigation */}
            <Paper
                elevation={2}
                sx={{
                    p: { xs: 1.5, md: 2.5 },
                    mt: { xs: 2, md: 3 },
                    mb: { xs: 2, md: 4 },
                    bgcolor: theme.app_bg,
                    color: theme.text_color,
                    borderRadius: 2,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <IconButton onClick={goToPreviousMonth} size="medium">
                        <ArrowBackIosIcon sx={{ color: theme.text_color, fontSize: { xs: 18, md: 22 } }} />
                    </IconButton>

                    <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{ fontSize: { xs: "1.05rem", sm: "1.3rem" } }}
                    >
                        {formatMonthYear()}
                    </Typography>

                    <IconButton onClick={goToNextMonth} size="medium">
                        <ArrowForwardIosIcon sx={{ color: theme.text_color, fontSize: { xs: 18, md: 22 } }} />
                    </IconButton>
                </Box>
            </Paper>

            {/* Calendar Grid */}
            <Paper
                elevation={3}
                sx={{
                    p: { xs: 1.5, md: 3 },
                    bgcolor: theme.app_bg,
                    color: theme.text_color,
                    borderRadius: 2,
                    overflow: "hidden",
                }}
            >
                {/* Weekday Headers - hide on mobile */}
                <Box
                    sx={{
                        display: { xs: "none", md: "grid" },
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: 1,
                        mb: 2,
                        fontWeight: 600,
                    }}
                >
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <Box
                            key={day}
                            sx={{
                                textAlign: "center",
                                py: 1.5,
                                fontSize: "0.9rem",
                                color: theme.text_color,
                            }}
                        >
                            {day}
                        </Box>
                    ))}
                </Box>

                {/* Days */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "repeat(2, 1fr)",   // ✅ mobile
                            sm: "repeat(4, 1fr)",   // ✅ tablet
                            md: "repeat(7, 1fr)",   // ✅ desktop calendar
                        },
                        gap: 1,
                    }}
                >
                    {calendarDays.map((day, index) => (
                        <Paper
                            key={index}
                            elevation={day.date === selectedDate ? 6 : day.hasSession ? 3 : 1}
                            sx={{
                                p: { xs: 1, md: 1.5 },
                                minHeight: { xs: 80, sm: 90, md: 110 },
                                cursor: "pointer",
                                borderRadius: 2,
                                bgcolor: day.date === selectedDate
                                    ? theme.sidebar_bg
                                    : day.hasSession
                                        ? theme.sidebar_bg
                                        : theme.app_bg,
                                color: theme.text_color,
                                transition: "all 0.2s",
                                "&:hover": { transform: "scale(1.01)", boxShadow: 4 },
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.5,
                                overflow: "hidden",
                            }}
                            onClick={() => day.date && setSelectedDate(day.date)}
                        >
                            <Typography variant="body2" fontWeight={700}>
                                {day.day || ""}
                            </Typography>

                            {/* session preview */}
                            {day.hasSession && (
                                <Box sx={{ mt: "auto" }}>
                                    {day.sessions.slice(0, 1).map((session) => (
                                        <Typography
                                            key={session.id}
                                            variant="caption"
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: "0.7rem",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {formatTime(session.start_time)} • {session.trainer_name}
                                        </Typography>
                                    ))}

                                    {day.sessions.length > 1 && (
                                        <Chip
                                            label={`+${day.sessions.length - 1}`}
                                            size="small"
                                            sx={{
                                                mt: 0.5,
                                                height: 18,
                                                fontSize: "0.65rem",
                                                fontWeight: 800,
                                            }}
                                        />
                                    )}
                                </Box>
                            )}
                        </Paper>
                    ))}
                </Box>
            </Paper>

            {/* Error */}
            {error && (
                <Alert severity="error" sx={{ mt: 4 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
        </Box>

    );
};

export default ClientSessionsCalendar;
