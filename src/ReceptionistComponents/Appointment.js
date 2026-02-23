import React, { useEffect, useState } from "react";
import api from "./services/api";
import { Grid } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import TodayIcon from "@mui/icons-material/Today";
import RateReviewIcon from "@mui/icons-material/RateReview";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";

import AppointmentDetailsPopover from "./AppointmentDetailsPopover";

import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Typography,
  Card,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { Pagination } from "@mui/material";
const headerChipStyle = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#01636B",
  border: "1px solid #01636B",
  borderRadius: "25px",
  px: 1.5,
  py: 0.5,
  textAlign: "center",
  whiteSpace: "nowrap",
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const rowsPerPage = 5;
  const today = new Date().toISOString().slice(0, 10);
  const [reviewPercentage, setReviewPercentage] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: "",
    clientName: "",
    clientId: "",
    status: "all",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    date: "",
    clientName: "",
    clientId: "",
    status: "all",
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchDoctorReview();
  }, []);

  const fetchDoctorReview = async () => {
    try {
      setReviewLoading(true);
      const res = await api.get("review/doctor/overall-percentage");
      if (res.data.success) {
        setReviewPercentage(res.data.review_percentage);
      }
    } catch (err) {
      console.error("Failed to fetch doctor review", err);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleClear = () => {
    const resetFilters = {
      date: "",
      clientName: "",
      clientId: "",
      status: "all",
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setPage(1);
  };

  const filteredAppointments = appointments.filter((appt) => {
    const matchDate = (() => {
      if (!appliedFilters.date) return true;
      if (!appt.appointment_date) return false;
      const d = new Date(appt.appointment_date);
      if (isNaN(d.getTime())) return false;
      return d.toISOString().slice(0, 10) === appliedFilters.date;
    })();

    const matchClientName =
      !appliedFilters.clientName ||
      appt.client_name
        ?.toLowerCase()
        .includes(appliedFilters.clientName.toLowerCase());

    const matchClientId =
      !appliedFilters.clientId ||
      appt.client_id?.toString().includes(appliedFilters.clientId);

    const matchStatus =
      appliedFilters.status === "all" || appt.status === appliedFilters.status;

    return matchDate && matchClientName && matchClientId && matchStatus;
  });

  const totalPages = Math.ceil(filteredAppointments.length / rowsPerPage);

  const paginatedAppointments = filteredAppointments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get("/appointment/appointments");
        setAppointments(res.data.appointments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointment/appointment/${appointmentId}/status`, {
        status: newStatus,
      });
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.appointment_id === appointmentId
            ? { ...appt, status: newStatus }
            : appt
        )
      );
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#1fa46c";
      case "assigned":
        return "#1fa46c";
      case "cancelled":
        return "#e53935";
      default:
        return "#9e9e9e";
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "--";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "--";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(255,255,255,0.7)",
          zIndex: 2000,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        p: { xs: 2, sm: 2, md: 1 },
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <Typography fontWeight={600} fontSize={{ xs: 18, md: 20 }} sx={{mb:0}}>
          Appointment List
        </Typography>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={4} md={4}>
          <Card
            sx={{
              height: 70,
              borderRadius: 3,
              backgroundColor: "#1f7a83",
              color: "white",
              display: "flex",
              alignItems: "center",
              px: 5.5,
              boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
              borderTopLeftRadius: 5,
              borderBottomRightRadius: 0,
              borderTopRightRadius: 25,
              borderBottomLeftRadius: 5,
            }}
          >
            <Box sx={{ width: 36, height: 36, borderRadius: 1, mr: 2 }}>
              <EventIcon />
            </Box>
            <Box>
              <Typography fontSize="13px" fontWeight={500} opacity={0.9}>
                Total Appointments
              </Typography>
              <Typography fontSize="20px" fontWeight="bold">
                {appointments.length}
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={4}>
          <Card
            sx={{
              height: 70,
              borderRadius: 3,
              backgroundColor: "#1f7a83",
              color: "white",
              display: "flex",
              alignItems: "center",
              px: 4,
              boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
              borderTopLeftRadius: 5,
              borderBottomRightRadius: 0,
              borderTopRightRadius: 25,
              borderBottomLeftRadius: 5,
            }}
          >
            <Box sx={{ width: 36, height: 36, borderRadius: 1, mr: 2 }}>
              <TodayIcon />
            </Box>
            <Box>
              <Typography fontSize="13px" fontWeight={500} opacity={0.9}>
                Today Appointments
              </Typography>
              <Typography fontSize="20px" fontWeight="bold">
                {
                  appointments.filter((a) => {
                    if (!a.appointment_date) return false;
                    const d = new Date(a.appointment_date);
                    if (isNaN(d.getTime())) return false;
                    return d.toISOString().slice(0, 10) === today;
                  }).length
                }
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={4}>
          <Card
            sx={{
              height: 70,
              borderRadius: 3,
              backgroundColor: "#1f7a83",
              color: "white",
              display: "flex",
              alignItems: "center",
              px: 5.5,
              boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
              borderTopLeftRadius: 5,
              borderBottomRightRadius: 0,
              borderTopRightRadius: 25,
              borderBottomLeftRadius: 5,
            }}
          >
            <Box sx={{ width: 36, height: 36, borderRadius: 1, mr: 2 }}>
              <RateReviewIcon />
            </Box>
            <Box>
              <Typography fontSize="13px" fontWeight={500} opacity={0.9}>
                Doctors Review
              </Typography>
              <Typography fontSize="20px" fontWeight="bold">
                {reviewLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  `${reviewPercentage}%`
                )}
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box
        sx={{
          p: 1,
          
          position: { xs: "sticky", sm: "static" }, // ⬅️ sticky only for mobile

          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "#437986" },
            "&:hover fieldset": { borderColor: "#437986" },
            "&.Mui-focused fieldset": { borderColor: "#437986" },
          },
          "& .MuiInputBase-input": { color: "#437986" },
          "& .MuiInputBase-input::placeholder": {
            color: "#437986",
            opacity: 0.7,
          },
          "& .MuiInputLabel-root": { color: "#437986" },
          "& .MuiInputLabel-root.Mui-focused": { color: "#437986" },
          "& .MuiSelect-select": { color: "#437986" },
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems="flex-start"

        >
          <TextField
            size="small"
            type="date"
            label="Date"
            name="date"
            InputLabelProps={{ shrink: true }}
            value={filters.date}
            onChange={handleFilterChange}
            sx={{ width: { xs: "100%", sm: 160, md: 300 } }}
          />
          <TextField
            size="small"
            label="Client Name"
            name="clientName"
            value={filters.clientName}
            onChange={handleFilterChange}
            sx={{ width: { xs: "100%", sm: 150, md: 300 } }}
          />
          <TextField
            size="small"
            label="Client ID"
            name="clientId"
            value={filters.clientId}
            onChange={handleFilterChange}
            sx={{ width: { xs: "100%", sm: 120, md: 350 } }}
          />
          <FormControl
            size="small"
            sx={{ minWidth: 120, width: { xs: "100%", sm: "auto", md: 300 } }}
          >
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={filters.status}
              label="Status"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="assigned">Assigned</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
            <Button
              onClick={handleSearch}
              sx={{
                borderRadius: 2,
                width: { xs: "50%", sm: "auto", md: 150 },
                backgroundColor: "#437986",
                color: "white",
                textTransform:"none"
              }}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              onClick={handleClear}
              sx={{
                borderRadius: 2,
                width: { xs: "50%", sm: "auto", md: 150 },
                color: "#437986",
                borderColor: "#437986",
                 textTransform:"none"
              }}
            >
              Clear
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Content */}
      {!isMobile ? (
        // DESKTOP VIEW
        <Paper
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            maxWidth: "100%",
            background: "white",
            padding: 2,
          }}
        >
          <Typography sx={{  fontSize: "20px", fontWeight: 600,m:1}}>
            New Appointments
          </Typography>
          <TableContainer
            sx={{
              background:
                "linear-gradient(180deg, #a5d0d4ff 0%, #ffffff 100%)",
              borderRadius: 5,maxHeight: "55vh", overflowY: "auto"
            }}
          >
            <Table sx={{ borderCollapse: "collapse" }}>
              <TableHead sx={{
    position: "sticky",
    top: 0,
    zIndex: 4,
     background:"#a5d0d4ff"
  }}>
                <TableRow sx={{fontSize:"5px"}}>
                  <TableCell
                    sx={{ fontWeight: 600, color: "#01636B" }}
                  >
                    <Typography
                     sx={headerChipStyle}
                    >
                      Appointment Id
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, color: "#01636B" }}
                  >
                    <Typography
                     sx={headerChipStyle}
                    >
                      Patient Id
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600,  color: "#01636B" }}
                  >
                    <Typography
                     sx={headerChipStyle}
                    >
                      Patient Name
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600,  color: "#01636B" }}
                  >
                    <Typography
                      sx={headerChipStyle}
                    >
                      Date
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, color: "#01636B" }}
                  >
                    <Typography
                      sx={headerChipStyle}
                    >
                      Time Slots
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, color: "#01636B" }}
                  >
                    <Typography
                      sx={headerChipStyle}
                    >
                      Purpose
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600,  color: "#01636B" }}
                  >
                    <Typography
                      sx={headerChipStyle}
                    >
                      Status
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, color: "#01636B" }}
                  >
                    <Typography
                      sx={headerChipStyle}
                    >
                      Details
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No appointments found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAppointments.map((row) => (
                    <TableRow key={row.appointment_id} hover sx={{ fontSize: "10px" }}>
                      <TableCell align="center">{row.id}</TableCell>
                      <TableCell>{row.client_id}</TableCell>
                      <TableCell>{row.client_name}</TableCell>
                      <TableCell>{formatDate(row.appointment_date)}</TableCell>
                      <TableCell>
                        {row.from_time} to {row.to_time}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        {row.purpose}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: getStatusColor(row.status),
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ textTransform: "capitalize" }}
                          >
                            {row.status}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            backgroundColor: "#ffffff",
                            color: "#01636B",
                            borderRadius: "10px",
                            border: "1px solid #01636B",
                            textTransform: "none",
                            fontSize: "13px",
                            px: 2,
                          }}
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setSelectedAppointment(row);
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={2}
          >
            <Typography fontSize={12} color="#666">
              {(page - 1) * rowsPerPage + 1}-
              {Math.min(page * rowsPerPage, filteredAppointments.length)} of{" "}
              {filteredAppointments.length}
            </Typography>
            {totalPages > 1 && (
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                size="small"
              />
            )}
          </Box>
        </Paper>
      ) : (
        // MOBILE CARD VIEW
        <Box>
          <Typography sx={{ mb: 2, fontSize: 18, fontWeight: 600, color: "#01636B" }}>
            New Appointments
          </Typography>

          {paginatedAppointments.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: "center", borderRadius: 2 }}>
              <Typography>No appointments found</Typography>
            </Paper>
          ) : (

            <Stack spacing={2}>
              {paginatedAppointments.map((row) => (
                <Card
                  key={row.appointment_id}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(1, 99, 107, 0.15)",
                    background:
                      "linear-gradient(180deg, #a5d0d4ff 0%, #ffffff 100%)",
                    width: "96%"
                  }}
                >
                  {/* Header Section */}
                  <Box
                    sx={{
                      bgcolor: "#01636B",
                      color: "white",
                      p: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",

                    }}
                  >
                    <Box>
                      <Typography fontSize={11} sx={{ opacity: 0.8, mb: 0.5 }}>
                        Appointment ID
                      </Typography>
                      <Typography fontWeight={700} fontSize={16}>
                        {row.id}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                        bgcolor: "rgba(255,255,255,0.15)",
                        px: 1.5,
                        py: 0.8,
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: getStatusColor(row.status),
                        }}
                      />
                      <Typography
                        fontSize={12}
                        fontWeight={600}
                        sx={{ textTransform: "capitalize" }}
                      >
                        {row.status}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Content Section */}
                  <Box sx={{ p: 2.5 }}>
                    {/* Patient Info */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        mb: 2.5,
                        pb: 2,
                        borderBottom: "1px solid rgba(1, 99, 107, 0.15)",
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: "#01636B",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                        }}
                      >
                        <PersonIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography
                          fontSize={15}
                          fontWeight={700}
                          color="#01636B"
                        >
                          {row.client_name}
                        </Typography>
                        <Typography fontSize={12} color="#437986">
                          Patient ID: {row.client_id}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Date & Time */}
                    <Stack spacing={1.5} mb={2.5} direction={{ xs: "column", sm: "row" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            bgcolor: "rgba(1, 99, 107, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#01636B",
                          }}
                        >
                          <EventIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                          <Typography fontSize={11} color="#437986" mb={0.3}>
                            Date
                          </Typography>
                          <Typography fontSize={14} fontWeight={600} color="#01636B">
                            {formatDate(row.appointment_date)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            bgcolor: "rgba(1, 99, 107, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#01636B",
                          }}
                        >
                          <AccessTimeIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                          <Typography fontSize={11} color="#437986" mb={0.3}>
                            Time Slot
                          </Typography>
                          <Typography fontSize={14} fontWeight={600} color="#01636B">
                            {row.from_time} - {row.to_time}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                    <Typography fontSize={11} fontWeight={600} color="#437986">
                      Purpose
                    </Typography>
                    {/* Purpose */}
                    {row.purpose && (
                      <Box
                        sx={{
                          bgcolor: "rgba(1, 99, 107, 0.08)",
                          border: "1px solid rgba(1, 99, 107, 0.2)",
                          borderRadius: 2,
                          p: 1,
                          mb: 2.5,
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center", // ✅ horizontal center
                        }}
                      >

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center", // ✅ center icon + text
                            gap: 1,
                            mb: 0.8,
                          }}
                        >

                        </Box>
                        <Typography fontSize={13} color="#01636B" lineHeight={1.6}>
                          {row.purpose}
                        </Typography>
                      </Box>
                    )}


                    {/* View Details Button */}
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedAppointment(row);
                      }}
                      sx={{
                        borderRadius: 2,
                        border: "1px solid #01636B",
                        color: "#01636B",
                        bgcolor: "white",
                        textTransform: "none",
                        fontSize: 13,
                        fontWeight: 600,
                        py: 1.2,
                        "&:hover": {
                          bgcolor: "#01636B",
                          color: "white",
                        },
                      }}
                    >
                      View Full Details
                    </Button>
                  </Box>
                </Card>
              ))}
            </Stack>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              mt={3}
              flexDirection="column"
              gap={2}
            >
              <Typography fontSize={12} color="#666">
                {(page - 1) * rowsPerPage + 1}-
                {Math.min(page * rowsPerPage, filteredAppointments.length)} of{" "}
                {filteredAppointments.length}
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                size="small"
              />
            </Box>
          )}
        </Box>
      )}

      <AppointmentDetailsPopover
        anchorEl={anchorEl}
        appointment={selectedAppointment}
        onClose={() => {
          setAnchorEl(null);
          setSelectedAppointment(null);
        }}
        onStatusUpdate={handleStatusChange}
      />
    </Box>
  )
}