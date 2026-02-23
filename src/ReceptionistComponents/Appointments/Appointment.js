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
  Pagination,
  useMediaQuery,
  Card,
  CardContent,
  colors,
  Chip,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import axios from "axios";
import AppointmentForm from "./AppointmentForm";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
// OR if you want cancel instead of edit
import CancelIcon from "@mui/icons-material/Cancel";
import { IconButton, Tooltip } from "@mui/material";

// DATE PICKER
import dayjs from "dayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { COLORS } from "../Themes";
import AppointmentDetailsPopover from "./AppointmentDetailsPopover";
import AppointmentDetailsModal from "./AppointmentViewModal";

/* 🎨 COLORS – MATCH IMAGE */
const Colors = {
  primary: COLORS.primary,
  primaryDark: COLORS.primary,
  rowAlt: COLORS.softBg,
  bg: "#f6f8f8",
};

const AppointmentsPage = () => {
  const isMobile = useMediaQuery("(max-width:900px)");

  const [openForm, setOpenForm] = useState(false);
  const [allAppointments, setAllAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    appointmentId: "",
    status: "",
    date: "",
  });

  const [filterOptions, setFilterOptions] = useState({
    statuses: [],
    dates: [],
  });

  /* ---------------- FETCH ---------------- */
  const fetchAppointments = async (query = "") => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${process.env.REACT_APP_URL}/appointment/appointments`,
        {
          params: { search: query },
          withCredentials: true,
        },
      );

      const list = res.data.appointments.map((a) => ({
        id: a.id,
        date: a.appointment_date,
        client_name: a.client_name,
        client_id: a.client_id,
        from_time: a.from_time,
        to_time: a.to_time,
        selected_branch: a.selected_branch,
        doctor_name: a.doctor_name,
        status: a.status,
      }));

      setAllAppointments(list);
      setFilteredAppointments(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchAppointments(search);
    }, 400); // debounce

    return () => clearTimeout(delay);
  }, [search]);

  /* ---------------- FILTER OPTIONS ---------------- */
  useEffect(() => {
    if (!allAppointments.length) return;

    setFilterOptions({
      statuses: [
        ...new Set(allAppointments.map((a) => a.status).filter(Boolean)),
      ],
      dates: [...new Set(allAppointments.map((a) => a.date).filter(Boolean))],
    });
  }, [allAppointments]);

  /* ---------------- APPLY FILTERS ---------------- */
  useEffect(() => {
    let data = [...allAppointments];

    // Appointment ID filter
    if (filters.appointmentId) {
      data = data.filter((a) => String(a.id).includes(filters.appointmentId));
    }

    // Date filter
    if (filters.date) {
      data = data.filter((a) => a.date === filters.date);
    }

    // 🔍 SEARCH FILTER (NEW)
    if (search.trim()) {
      const q = search.toLowerCase();

      data = data.filter((a) =>
        [a.id, a.client_name, a.client_id, a.doctor_name, a.status]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q)),
      );
    }

    setFilteredAppointments(data);
    setPage(1);
  }, [filters, search, allAppointments]);

  /* ---------------- Edit Status ---------------- */

  const [appointments, setAppointments] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_URL}/appointment/appointment/${appointmentId}/status`,
        {
          status: newStatus,
        },
      );
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.appointment_id === appointmentId
            ? { ...appt, status: newStatus }
            : appt,
        ),
      );
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const [openAppointment, setOpenAppointment] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const handleOpenAppointment = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setOpenAppointment(true);
  };

  /* ---------------- PAGINATION ---------------- */
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const totalPages = Math.ceil(filteredAppointments.length / rowsPerPage);

  const paginatedAppointments = filteredAppointments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  /* ---------------- CANCEL ---------------- */
  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm("Cancel this appointment?")) return;

    await axios.put(
      `${process.env.REACT_APP_URL}/appointment/client/appointment/cancel`,
      { appointmentId }, // ✅ MATCH backend
      { withCredentials: true },
    );

    fetchAppointments();
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const h = Number(hours);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${suffix}`;
  };

  const STATUS_COLORS = {
    completed: COLORS.success,
    assigned: COLORS.warning,
    cancelled: COLORS.danger,
  };

  const inputSx = {
    "& .MuiInputBase-root": {
      height: 40,
      fontSize: "12px",
    },
    "& .MuiInputLabel-root": {
      fontSize: "11px",
    },
  };

  return (
    <Box px={{ xs: "none", md: 1 }} sx={{ pt: 2 }}>
      {/* ================= TOP ACTION ================= */}
      <Box display="flex" justifyContent="flex-end" px={2}>
        <Button
          sx={{
            bgcolor: Colors.primary,
            color: "#fff",
            mb: { xs: 1, md: "none" },
            borderRadius: 2,
            borderTopRightRadius: 60,

            height: { xs: "38px", md: "53px" },
            width: { xs: "120px", md: "239px" },
            fontSize: { xs: "10px", md: "16px" },
            textTransform: "capitalize",
          }}
          onClick={() => setOpenForm(true)}
        >
          Make An Appointment
        </Button>
      </Box>

      {/* ================= HEADING ================= */}
      <Box
        sx={{
          bgcolor: COLORS.primary,
          color: "#fff",
          fontSize: { xs: "14px", md: "18px" },
          px: 1,
          py: 1,
          width: { xs: "70%", md: "20%" },
          borderTopRightRadius: 60,
        }}
      >
        All Appointments
      </Box>

      {/* ================= FILTERS (UNCHANGED) ================= */}
      {/* 👉 KEEP YOUR EXISTING FILTER CODE HERE (MOBILE + DESKTOP) */}
      {/* I did not modify filters */}

      {/* ================= FILTER SECTION ================= */}
      {isMobile ? (
        /* -------- MOBILE FILTER -------- */
        <Box sx={{ width: "100%", my: 1 }}>
          {/* Row 1: Appointment ID + Status */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
              mb: 1,
            }}
          >
            <TextField
              size="small"
              fullWidth
              label="Search"
              placeholder="Search appointments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={inputSx}
            />
          </Box>

          {/* Row 2: Date */}
          <Box sx={{ mb: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Appointment Date"
                value={filters.date ? dayjs(filters.date) : null}
                onChange={(v) =>
                  setFilters((prev) => ({
                    ...prev,
                    date: v ? v.format("YYYY-MM-DD") : "",
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    sx: inputSx,
                  },
                }}
              />
            </LocalizationProvider>
          </Box>

          {/* Row 3: Reset */}
          <Button
            fullWidth
            sx={{
              height: 40,
              fontSize: "12px",
              textTransform: "capitalize",
              bgcolor: COLORS.primary,
              color: "#fff",
              "&:hover": { bgcolor: COLORS.primary },
            }}
            onClick={() => {
              setFilters({
                appointmentId: "",
                status: "",
                date: "",
              });
              setSearch("");
              fetchAppointments("");
            }}
          >
            Reset
          </Button>
        </Box>
      ) : (
        /* -------- DESKTOP FILTER -------- */
        <Box
          sx={{
            width: "100%",
            display: "flex",
            gap: 2,
            my: 2,
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            label="Search by name, ID, doctor, status..."
            placeholder="Search by name, ID, doctor, status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 300 }}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Appointment Date"
              value={filters.date ? dayjs(filters.date) : null}
              onChange={(v) =>
                setFilters((prev) => ({
                  ...prev,
                  date: v ? v.format("YYYY-MM-DD") : "",
                }))
              }
              slotProps={{
                textField: { size: "small", sx: { width: 200 } },
              }}
            />
          </LocalizationProvider>

          <Button
            variant="outlined"
            sx={{
              height: 40,
              minWidth: 120,
              textTransform: "capitalize",
              fontSize: "18px",
              bgcolor: COLORS.primary,
              color: "#fff",
              "&:hover": {
                bgcolor: COLORS.primary,
              },
            }}
            onClick={() => {
              setFilters({
                appointmentId: "",
                status: "",
                date: "",
              });
              setSearch("");
              fetchAppointments("");
            }}
          >
            Reset
          </Button>
        </Box>
      )}

      {/* ================= DESKTOP TABLE ================= */}
      {!isMobile && (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            overflowY: "auto",
            maxHeight: 380,

            /* ===== Scrollbar Styling ===== */
            scrollbarColor: Colors.primary,

            "&::-webkit-scrollbar": {
              width: 8, // Chrome / Edge / Safari
              backgroundColor: "#f8f6f6",
            },
            "&::-webkit-scrollbar-track": {
              borderRadius: 10,
              backgroundColor: "#f8f6f6",
            },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: 10,
              backgroundColor: Colors.primary,
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: Colors.primary,
            },
          }}
        >
          <Table stickyHeader sx={{ tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                {[
                  "ID",
                  "Date",
                  "Pateint Name",
                  "Pateint ID",
                  "From & To Time",
                  "Branch",
                  "Doctor Name",
                  "Action",
                ].map((head) => (
                  <TableCell
                    sx={{
                      bgcolor: COLORS.activeBg,
                    }}
                  >
                    <Box
                      key={head}
                      align="center"
                      sx={{
                        bgcolor: COLORS.activeBg,
                        color: COLORS.primary,
                        fontWeight: 600,
                        border: `solid 2px ${COLORS.primary}`,
                        borderRadius: 40,
                      }}
                    >
                      {head}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedAppointments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography fontWeight={600} color="text.secondary">
                      No appointments found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {[...paginatedAppointments].reverse().map((row, index) => (
                <TableRow
                  key={row.id}
                  sx={{
                    "& td": {
                      borderBottom: "1px dotted #9ECACA",
                      fontSize: 13,
                    },
                  }}
                >
                  <TableCell align="center">{row.id}</TableCell>
                  <TableCell align="center">{row.date}</TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      width: 500, // 👈 set column width
                      maxWidth: 500,
                    }}
                  >
                    {row.client_name}
                  </TableCell>
                  <TableCell align="center">{row.client_id}</TableCell>

                  <TableCell align="center">
                    <Box
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {formatTime(row.from_time)} - {formatTime(row.to_time)}
                    </Box>
                  </TableCell>
                  <TableCell align="center">{row.selected_branch}</TableCell>
                  <TableCell align="center">{row.doctor_name}</TableCell>

                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1.5,
                      }}
                    >
                      {/* View Icon */}
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          sx={{
                            color: "#01636B",
                            border: "1px solid #01636B",
                            borderRadius: "8px",
                            cursor: "pointer",
                            justifyContent: "center",
                          }}
                          onClick={() => handleOpenAppointment(row.id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Edit Icon (or Cancel if you prefer) */}
                      <Tooltip title="Edit Appointment">
                        <IconButton
                          size="small"
                          sx={{
                            color: "#1976d2",
                            border: "1px solid #1976d2",
                            borderRadius: "8px",
                          }}
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setSelectedAppointment(row);
                          }}
                          disabled={row.status === "cancelled" || row.status === "completed"}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ================= MOBILE CARDS (UNCHANGED) ================= */}
      {isMobile && (
        <Box
          sx={{
            maxHeight: 430, // 👈 same idea as desktop table
            overflowY: "auto", // 👈 enables inner scrolling
            borderRadius: 2,
          }}
        >
          {paginatedAppointments.length === 0 && (
            <Box
              sx={{
                textAlign: "center",
                py: 5,
                color: "#777",
                bgcolor: COLORS.activeBg,
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              No appointments found
            </Box>
          )}

          {paginatedAppointments.map((row, index) => {
            return (
              <Card
                key={row.id}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                  <Stack spacing={0.4}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography fontSize="12px">
                        <b>App ID:</b> {row.id}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1.5,
                        }}
                      >
                        {/* View Icon */}
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            sx={{
                              color: "#01636B",
                              border: "1px solid #01636B",
                              borderRadius: "8px",
                              cursor: "pointer",
                              justifyContent: "center",
                            }}
                            onClick={() => handleOpenAppointment(row.id)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* Edit Icon (or Cancel if you prefer) */}
                        <Tooltip title="Edit Appointment">
                          <IconButton
                            size="small"
                            sx={{
                              color: "#1976d2",
                              border: "1px solid #1976d2",
                              borderRadius: "8px",
                            }}
                            onClick={(e) => {
                              setAnchorEl(e.currentTarget);
                              setSelectedAppointment(row);
                            }}
                            disabled={row.status === "cancelled"}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography fontSize="12px">
                        <b>Date:</b> {row.date}
                      </Typography>

                      <Typography fontSize="12px">
                        <b>Time:</b> {formatTime(row.from_time)} –{" "}
                        {formatTime(row.to_time)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography fontSize="12px">
                        <b>Client Name :</b> {row.client_name}
                      </Typography>
                      <Typography fontSize="12px">
                        <b>Client ID :</b> {row.client_id}
                      </Typography>
                    </Box>

                    <Typography fontSize="12px">
                      <b>Selected Branch:</b> {row.selected_branch}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <Box
          display="flex"
          justifyContent="center"
          sx={{
            my: { xs: 1, md: 2 },
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, v) => setPage(v)}
          />
        </Box>
      )}

      {/* ================= MODALS & SNACKBAR ================= */}
      <AppointmentForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={() => {
          setOpenForm(false);
          setSuccessMsg("Appointment booked successfully");
          fetchAppointments();
        }}
      />

      <AppointmentDetailsPopover
        anchorEl={anchorEl}
        appointment={selectedAppointment}
        onClose={() => {
          setAnchorEl(null);
          setSelectedAppointment(null);
        }}
        onStatusUpdate={handleStatusChange}
      />

      <AppointmentDetailsModal
        open={openAppointment}
        appointmentId={selectedAppointmentId}
        onClose={() => setOpenAppointment(false)}
      />

      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          onClose={() => setSuccessMsg("")}
          sx={{ width: "100%" }}
        >
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AppointmentsPage;