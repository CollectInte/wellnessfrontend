import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Pagination,
  useMediaQuery,
  Chip,
  Stack,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import { COLORS } from "../Themes";
import AddTimeSlots from "./AddTimeSlots";
import EditTimeSlots from "./EditTimeSlots";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const TimeSlots = () => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const [slots, setSlots] = useState([]);
  const [page, setPage] = useState(1);
  const [openSlots, setOpenSlots] = useState(false);
  const [editSlot, setEditSlot] = useState(null);

  const rowsPerPage = 6;

  useEffect(() => {
    fetchSlots();
  }, []);

  /* ================= Get Slots ================= */

  const fetchSlots = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_URL}/api/staff/time-slots/unbooked/filter`,
        { withCredentials: true },
      );
      setSlots(res.data?.slots || []);
      setPage(1); // 🔥 reset pagination
    } catch (err) {
      console.error(err);
      setSlots([]);
      setSnackbar({
        open: true,
        message: "Failed to load time slots",
        severity: "error",
      });
    }
  };

  const handleEdit = (slot) => {
    setEditSlot(slot);
  };

  /* ================= Delete Slots ================= */

  const handleDelete = async (slot) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_URL}/api/staff/time-slots/delete`,
        {
          withCredentials: true,
          data: {
            doctorName: slot.doctor_name, // receptionist only
            slot_date: slot.slot_date,
            slot_time_from: slot.slot_time_from,
            slot_time_to: slot.slot_time_to,
          },
        },
      );

      setSnackbar({
        open: true,
        message: "Slot deleted successfully",
        severity: "success",
      });
      fetchSlots(); // refresh list
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Delete failed",
        severity: "error",
      });
    }
  };

  /* ================= Filter Section ================= */

  const [filters, setFilters] = useState({
    doctor: "",
    date: "",
  });
  const filteredSlots = slots.filter((s) => {
    const matchDoctor = filters.doctor
      ? s.doctor_name === filters.doctor
      : true;

    const matchDate = filters.date
      ? dayjs(s.slot_date).format("YYYY-MM-DD") === filters.date
      : true;

    return matchDoctor && matchDate;
  });

  const doctorList = [...new Set(slots.map((s) => s.doctor_name))];

  /* ================= Pagination ================= */

  const totalPages = Math.ceil(filteredSlots.length / rowsPerPage);

  const paginatedSlots = filteredSlots.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  /* ================= Alert Section  ================= */

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  return (
    <Box px={1} pt={3}>
      <Box display="flex" justifyContent="flex-end" px={2}>
        <Button
          sx={{
            bgcolor: COLORS.primary,
            color: "#fff",
            mb: { xs: 1, md: 3 },
            borderTopRightRadius: 0,
            borderTopLeftRadius: 20,
            borderBottomRightRadius: 20,
            borderBottomLeftRadius: 0,
            height: { xs: "38px", md: "53px" },
            width: { xs: "120px", md: "220px" },
            fontSize: { xs: "10px", md: "16px" },
            textTransform: "capitalize",
          }}
          onClick={() => setOpenSlots(true)}
        >
          Add Slots for Doctors
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
        Doctors Time Slots
      </Box>

      {/* ================= FILTER BAR ================= */}
      {isMobile ? (
        /* ================= FILTER BAR Mobile ================= */
        <Box sx={{ width: "100%", my: 1 }}>
          {/* 👨‍⚕️ Doctor */}
          <TextField
            size="small"
            fullWidth
            select
            label="Doctor"
            value={filters.doctor}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, doctor: e.target.value }))
            }
            sx={{ mb: 1 }}
          >
            <MenuItem value="">All Doctors</MenuItem>
            {doctorList.map((doc) => (
              <MenuItem key={doc} value={doc}>
                {doc}
              </MenuItem>
            ))}
          </TextField>

          {/* 📅 Date */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Slot Date"
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
                },
              }}
            />
          </LocalizationProvider>

          <Button
            fullWidth
            sx={{
              mt: 1,
              height: 40,
              fontSize: "12px",
              textTransform: "capitalize",
              bgcolor: COLORS.primary,
              color: "#fff",
              "&:hover": { bgcolor: COLORS.primary },
            }}
            onClick={() =>
              setFilters({
                doctor: "",
                date: "",
              })
            }
          >
            Reset
          </Button>
        </Box>
      ) : (
        /* ================= FILTER BAR Desktop ================= */
        <Box
          sx={{
            width: "100%",
            display: "flex",
            gap: 2,
            my: 2,
            alignItems: "center",
          }}
        >
          {/* 👨‍⚕️ Doctor */}
          <TextField
            size="small"
            select
            label="Doctor"
            value={filters.doctor}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, doctor: e.target.value }))
            }
            sx={{ width: 250 }}
          >
            <MenuItem value="">All Doctors</MenuItem>
            {doctorList.map((doc) => (
              <MenuItem key={doc} value={doc}>
                {doc}
              </MenuItem>
            ))}
          </TextField>

          {/* 📅 Date */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Slot Date"
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
              bgcolor: COLORS.primary,
              color: "#fff",
              "&:hover": { bgcolor: COLORS.primary },
            }}
            onClick={() =>
              setFilters({
                doctor: "",
                date: "",
              })
            }
          >
            Reset
          </Button>
        </Box>
      )}

      {/* ================= DESKTOP ================= */}
      {!isMobile && (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            maxHeight: 420,
            overflowY: "auto",

            "&::-webkit-scrollbar": { width: 8 },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: COLORS.primary,
              borderRadius: 10,
            },
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {[
                  "Doctor Name",
                  "Date",
                  "From Time",
                  "To Time",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <TableCell
                    key={h}
                    align="center"
                    sx={{
                      bgcolor: COLORS.primary,
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  >
                    <Box
                      sx={{
                        color: "#fff",
                        fontWeight: 600,
                        border: `solid 2px ${COLORS.texWhite}`,
                        borderRadius: 40,
                        px: 0,
                      }}
                    >
                      {h}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody
              sx={{
                background: `linear-gradient(180deg, ${COLORS.activeBg} 40%,${COLORS.texWhite} 100%)`,
              }}
            >
              {paginatedSlots.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography fontWeight={600} color="text.secondary">
                      No slots found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {paginatedSlots.map((s, index) => (
                <TableRow
                  key={s.id}
                  sx={{
                    "& td": {
                      border: `1px dashed ${COLORS.softBg}`,
                      fontSize: 13,
                      py: 1,
                    },
                  }}
                >
                  <TableCell align="center">{s.doctor_name}</TableCell>
                  <TableCell align="center">
                    {dayjs(s.slot_date).format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell align="center">{s.slot_time_from}</TableCell>
                  <TableCell align="center">{s.slot_time_to}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label="Available"
                      size="small"
                      sx={{
                        bgcolor: COLORS.success,
                        color: "#fff",
                        fontSize: 11,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Edit slot">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(s)}
                          sx={{
                            color: COLORS.texBlack,
                            border: `solid 1px ${COLORS.texBlack}`,
                            borderRadius: 2,
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete slot">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(s)}
                          sx={{
                            color: COLORS.danger,
                            border: `solid 1px ${COLORS.danger}`,
                            borderRadius: 2,
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ================= MOBILE ================= */}
      {isMobile && (
        <Box
          sx={{
            maxHeight: 540,
            overflowY: "auto",
            borderRadius: 2,
          }}
        >
          {paginatedSlots.length === 0 && (
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography fontWeight={600} color="text.secondary">
                No slots found
              </Typography>
            </Paper>
          )}

          {paginatedSlots.map((s, index) => {
            const bg = index % 2 === 0 ? COLORS.activeBg : COLORS.texWhite;

            return (
              <Paper
                key={s.id}
                sx={{
                  p: 2,
                  backgroundColor: bg,
                }}
              >
                <Stack spacing={0.8}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography fontWeight={600}>{s.doctor_name}</Typography>

                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit slot">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(s)}
                          sx={{
                            color: COLORS.texBlack,
                            border: `solid 1px ${COLORS.texBlack}`,
                            borderRadius: 2,
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete slot">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(s)}
                          sx={{
                            color: COLORS.danger,
                            border: `solid 1px ${COLORS.danger}`,
                            borderRadius: 2,
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  <Typography>
                    Time : {s.slot_time_from} - {s.slot_time_to}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography>
                      Date : {dayjs(s.slot_date).format("DD/MM/YYYY")}
                    </Typography>

                    <Chip
                      label="Available"
                      size="small"
                      sx={{
                        bgcolor: COLORS.success,
                        color: "#fff",
                        width: "fit-content",
                      }}
                    />
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, v) => setPage(v)}
          />
        </Box>
      )}

      {/* ================= MODALS FOR ADD AND EDIT  ================= */}

      <AddTimeSlots
        open={openSlots}
        onClose={() => setOpenSlots(false)}
        onSlotAdded={fetchSlots}
        onSuccess={(msg) =>
          setSnackbar({ open: true, message: msg, severity: "success" })
        }
      />

      {editSlot && (
        <EditTimeSlots
          open={!!editSlot}
          slot={editSlot}
          onClose={() => setEditSlot(null)}
          onUpdated={fetchSlots}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TimeSlots;