import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Paper,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import { Pagination } from "@mui/material";
import axios from "axios";
import AppointmentForm from "./AppointmentForm";

// 🔥 DATE PICKER IMPORTS
import dayjs from "dayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const AppointmentsPage = () => {
  const today = dayjs().format("YYYY-MM-DD");

  const [openForm, setOpenForm] = useState(false);
  const [allAppointments, setAllAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");

  // ✅ DEFAULT DATE = TODAY
  const [filters, setFilters] = useState({
    appointmentId: "",
    type: "",
    status: "",
    date: "",
  });

  const [filterOptions, setFilterOptions] = useState({
    appointmentIds: [],
    types: [],
    statuses: [],
  });

  // -------------------------
  // FETCH APPOINTMENTS
  // -------------------------
  const fetchAppointments = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_URL}/appointment/client/appointment`,
        { withCredentials: true }
      );

      const list = Array.isArray(res.data) ? res.data : [];
      setAllAppointments(list);
      setFilteredAppointments(list);
    } catch (err) {
      console.error("FETCH ERROR:", err);
      setAllAppointments([]);
      setFilteredAppointments([]);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // -------------------------
  // BUILD FILTER OPTIONS
  // -------------------------
  useEffect(() => {
    if (!allAppointments.length) return;

    setFilterOptions({
      appointmentIds: [...new Set(allAppointments.map((a) => a.id))],
      types: [...new Set(allAppointments.map((a) => a.type).filter(Boolean))],
      statuses: [
        ...new Set(allAppointments.map((a) => a.status).filter(Boolean)),
      ],
    });
  }, [allAppointments]);

  // -------------------------
  // APPLY FILTERS
  // -------------------------

  const sortTodayFirst = (data) => {
    const today = dayjs().format("YYYY-MM-DD");

    return [...data].sort((a, b) => {
      const aIsToday = a.date === today;
      const bIsToday = b.date === today;

      if (aIsToday && !bIsToday) return -1;
      if (!aIsToday && bIsToday) return 1;

      return 0; // keep original order for others
    });
  };
  useEffect(() => {
    let data = [...allAppointments];

    if (filters.appointmentId) {
      data = data.filter((a) => a.id === Number(filters.appointmentId));
    }

    if (filters.type) {
      data = data.filter((a) => a.type === filters.type);
    }

    if (filters.status) {
      data = data.filter((a) => a.status === filters.status);
    }

    // ✅ IF DATE SELECTED → FILTER BY DATE
    if (filters.date) {
      data = data.filter((a) => a.date === filters.date);
    }
    // ✅ IF NO DATE SELECTED → TODAY FIRST
    else {
      const today = dayjs().format("YYYY-MM-DD");
      data = [...data].sort((a, b) => {
        const aIsToday = a.date === today;
        const bIsToday = b.date === today;

        if (aIsToday && !bIsToday) return -1;
        if (!aIsToday && bIsToday) return 1;
        return 0;
      });
    }

    setFilteredAppointments(data);
    setPage(1);
  }, [filters, allAppointments]);

  // -------------------------
  // PAGINATION
  // -------------------------
  const [page, setPage] = useState(1);
  const rowsPerPage = 6;
  const totalPages = Math.ceil(filteredAppointments.length / rowsPerPage);

  const paginatedAppointments = filteredAppointments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // -------------------------
  // CANCEL APPOINTMENT
  // -------------------------
  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;

    try {
      await axios.put(
        `${process.env.REACT_APP_URL}/appointment/cancel/${appointmentId}`,
        {},
        { withCredentials: true }
      );

      alert("Appointment cancelled successfully");
      fetchAppointments();
    } catch (err) {
      console.error("Cancel error:", err);
      alert("Failed to cancel appointment");
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 0, md: 2 },
        py: { xs: 2, md: 4 },
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: 22, md: 26 },
          fontWeight: 600,
        }}
      >
        Appointments
      </Typography>

      {/* FILTERS */}
      <Paper
        sx={{
          p: 2,
          mt: 2,
          borderRadius: 3,
          border: "1px solid #2563eb",
        }}
      >
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          <TextField
            size="small"
            label="Appointment ID"
            value={filters.appointmentId}
            onChange={(e) =>
              setFilters({ ...filters, appointmentId: e.target.value })
            }
            sx={{ flex: "1 1 200px" }}
          />

          <TextField
            size="small"
            select
            label="Type"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            sx={{ flex: "1 1 200px" }}
          >
            <MenuItem value="">All</MenuItem>
            {filterOptions.types.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            sx={{ flex: "1 1 200px" }}
          >
            <MenuItem value="">All</MenuItem>
            {filterOptions.statuses.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>

          {/* ✅ DATE CALENDAR FILTER */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Appointment Date"
              value={filters.date ? dayjs(filters.date) : null}
              onChange={(newValue) =>
                setFilters({
                  ...filters,
                  date: newValue ? newValue.format("YYYY-MM-DD") : "",
                })
              }
              slotProps={{
                textField: {
                  size: "small",
                  sx: { flex: "1 1 200px" },
                },
              }}
            />
          </LocalizationProvider>

          <Button
            sx={{
              flex: "0 0 auto",
              height: 40,
              width: { xs: "100%", md: "20%" },
              border: "1px solid #2563eb",
              px: 3,
            }}
            onClick={() =>
              setFilters({
                appointmentId: "",
                type: "",
                status: "",
                date: "", // ✅ clear date
              })
            }
          >
            Reset
          </Button>
        </Box>
      </Paper>

      {/* TABLE */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: "#ebeffd" }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          borderBottom="1px solid #2563eb"
          py={1.5}
        >
          <Typography fontWeight={600} fontSize={{ xs: 14, md: 24 }}>
            View Appointments
          </Typography>

          <Button
            sx={{
              bgcolor: "#2563eb",
              color: "#fff",
              fontSize: { xs: 8, md: 16 },
            }}
            onClick={() => setOpenForm(true)}
          >
            Make Appointment
          </Button>
        </Box>

        {/* HEADER */}
        <Box display={{ xs: "none", md: "flex" }} py={2} fontWeight={600}>
          <Box flex={1} sx={{ color: "#2563eb" }}>
            ID
          </Box>
          <Box flex={2} sx={{ color: "#2563eb" }}>
            Purpose
          </Box>
          <Box flex={1} sx={{ color: "#2563eb" }}>
            Type
          </Box>
          <Box flex={1} sx={{ color: "#2563eb" }}>
            Date
          </Box>
          <Box flex={1} sx={{ color: "#2563eb" }}>
            Time
          </Box>
          <Box flex={1} sx={{ color: "#2563eb" }}>
            Status
          </Box>
          <Box flex={1} sx={{ color: "#2563eb" }}>
            Action
          </Box>
        </Box>

        {/* ROWS */}
        {paginatedAppointments.length === 0 ? (
          <Box py={4} textAlign="center">
            <Typography>No Data Available</Typography>
          </Box>
        ) : (
          paginatedAppointments.map((row) => (
            <Box key={row.id} py={2} borderTop="1px solid #2563eb">
              <Box display={{ xs: "none", md: "flex" }}>
                <Box flex={1}>{row.id}</Box>
                <Box flex={2}>{row.purpose || "-"}</Box>
                <Box flex={1}>{row.type}</Box>
                <Box flex={1}>{row.date}</Box>
                <Box flex={1}>
                  {row.from_time} - {row.to_time}
                </Box>
                <Box flex={1}>{row.status}</Box>
                <Box flex={1}>
                  {["pending", "assigned", "approved"].includes(row.status) && (
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => cancelAppointment(row.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </Box>
              </Box>

              {/* MOBILE */}
              <Stack display={{ xs: "flex", md: "none" }} gap={1}>
                <Typography>
                  <b>ID:</b> {row.id}
                </Typography>
                <Typography>
                  <b>Purpose:</b> {row.purpose}
                </Typography>
                <Typography>
                  <b>Date:</b> {row.date}
                </Typography>
                <Typography>
                  <b>Time:</b> {row.from_time} - {row.to_time}
                </Typography>
                <Typography>
                  <b>Status:</b> {row.status}
                </Typography>

                {["pending", "assigned", "approved"].includes(row.status) && (
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => cancelAppointment(row.id)}
                  >
                    Cancel Appointment
                  </Button>
                )}
              </Stack>
            </Box>
          ))
        )}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              shape="rounded"
              showFirstButton
              showLastButton
              siblingCount={1} // prev, current, next = 3 pages
              boundaryCount={1}
            />
          </Box>
        )}

        <AppointmentForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSuccess={() => {
            setOpenForm(false);
            setSuccessMsg("Appointment booked successfully ✅");
            fetchAppointments();
          }}
        />

        <Snackbar
          open={!!successMsg}
          autoHideDuration={3000}
          onClose={() => setSuccessMsg("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="success" onClose={() => setSuccessMsg("")}>
            {successMsg}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default AppointmentsPage;
