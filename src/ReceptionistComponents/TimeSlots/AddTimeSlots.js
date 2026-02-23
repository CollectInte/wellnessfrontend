import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const AddTimeSlots = ({ open, onClose, onSlotAdded, onSuccess }) => {
  const [slots, setSlots] = useState([
    { slot_date: null, slot_time_from: null, slot_time_to: null },
  ]);
  const [loading, setLoading] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorName, setSelectedDoctorName] = useState("");

  const [userRole, setUserRole] = useState("");

  /* ================= GET USER ROLE ================= */
  useEffect(() => {
    const role = localStorage.getItem("role"); // or from auth context
    setUserRole(role);
  }, []);

  /* ================= FETCH BRANCH DOCTORS ================= */

  useEffect(() => {
    if (userRole === "receptionist") {
      fetchBranchDoctors();
    }
  }, [userRole]);

  const fetchBranchDoctors = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_URL}/api/staff/branch-doctors`,
        { withCredentials: true }
      );

      setDoctors(res.data?.data || []);
    } catch (err) {
      console.error("Fetch doctors error:", err);
      setDoctors([]);
    }
  };

  /* ================= SLOT HANDLERS ================= */
  const handleChange = (index, field, value) => {
    const updated = [...slots];
    updated[index][field] = value;
    setSlots(updated);
  };

  const addSlot = () => {
    setSlots([
      ...slots,
      { slot_date: null, slot_time_from: null, slot_time_to: null },
    ]);
  };

  const removeSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const isFormValid = () => {
    if (userRole === "receptionist" && !selectedDoctorName) return false;

    return slots.every(
      (s) =>
        s.slot_date &&
        s.slot_time_from &&
        s.slot_time_to &&
        dayjs(s.slot_time_to).isAfter(dayjs(s.slot_time_from))
    );
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        doctorName:
          userRole === "receptionist" ? selectedDoctorName : undefined,

        slots: slots.map((s) => ({
          slot_date: dayjs(s.slot_date).format("YYYY-MM-DD"),
          slot_time_from: dayjs(s.slot_time_from).format("HH:mm:ss"),
          slot_time_to: dayjs(s.slot_time_to).format("HH:mm:ss"),
        })),
      };

      await axios.post(
        `${process.env.REACT_APP_URL}/api/staff/time-slots/bulk`,
        payload,
        { withCredentials: true }
      );

      setSnackbar({
        open: true,
        message: "Bulk slots created successfully",
        severity: "success",
      });

      onSuccess?.("Bulk slots created successfully");
      onSlotAdded?.();
      resetForm();
      onClose();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to create slots",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const resetForm = () => {
    setSlots([{ slot_date: null, slot_time_from: null, slot_time_to: null }]);
    setSelectedDoctorName("");
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ textAlign: "center", fontWeight: 600 }}>
        Create Bulk Time Slots
      </DialogTitle>

      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {/* ================= SLOT INPUTS ================= */}
          {slots.map((slot, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
                alignItems: "center",
                mb: 2,
              }}
            >
              {/* ================= DOCTOR DROPDOWN (ONLY RECEPTIONIST) ================= */}
              {userRole === "receptionist" && (
                <FormControl fullWidth>
                  <InputLabel>Select Doctor</InputLabel>
                  <Select
                    value={selectedDoctorName}
                    label="Select Doctor"
                    onChange={(e) => setSelectedDoctorName(e.target.value)}
                  >
                    {doctors.map((doc) => (
                      <MenuItem key={doc.id} value={doc.name}>
                        {doc.name} (ID: {doc.id})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <DatePicker
                label="Date"
                value={slot.slot_date}
                minDate={dayjs()}
                onChange={(v) => handleChange(index, "slot_date", v)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />

              <TimePicker
                label="From"
                value={slot.slot_time_from}
                onChange={(v) => handleChange(index, "slot_time_from", v)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />

              <TimePicker
                label="To"
                value={slot.slot_time_to}
                onChange={(v) => handleChange(index, "slot_time_to", v)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error:
                      slot.slot_time_from &&
                      slot.slot_time_to &&
                      dayjs(slot.slot_time_to).isBefore(slot.slot_time_from),
                    helperText:
                      slot.slot_time_from &&
                      slot.slot_time_to &&
                      dayjs(slot.slot_time_to).isBefore(slot.slot_time_from)
                        ? "End time must be after start time"
                        : "",
                  },
                }}
              />

              {slots.length > 1 && (
                <IconButton color="error" onClick={() => removeSlot(index)}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}

          <Button variant="outlined" onClick={addSlot}>
            + Add Slot
          </Button>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button
          onClick={() => {
            resetForm();
            onClose();
          }}
          color="error"
        >
          Cancel
        </Button>

        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Submit Slots"}
        </Button>
      </DialogActions>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default AddTimeSlots;
