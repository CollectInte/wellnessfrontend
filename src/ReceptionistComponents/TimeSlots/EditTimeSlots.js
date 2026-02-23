import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import dayjs from "dayjs";
import axios from "axios";
import { COLORS } from "../Themes";

const EditTimeSlots = ({ open, onClose, slot, onUpdated }) => {
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (slot) {
      setFromTime(slot.slot_time_from);
      setToTime(slot.slot_time_to);
    }
  }, [slot]);

  const handleUpdate = async () => {
    // 🔴 Validation
    if (!fromTime || !toTime) {
      setSnackbar({
        open: true,
        message: "From time and To time are required",
        severity: "error",
      });
      return;
    }

    if (toTime <= fromTime) {
      setSnackbar({
        open: true,
        message: "End time must be after start time",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      await axios.put(
        `${process.env.REACT_APP_URL}/api/staff/time-slots/update`,
        {
          doctorName: slot.doctor_name, // receptionist only
          slot_date: slot.slot_date, // REQUIRED by backend
          old_from: slot.slot_time_from, // REQUIRED
          old_to: slot.slot_time_to, // REQUIRED
          new_from: fromTime, // REQUIRED
          new_to: toTime, // REQUIRED
        },
        { withCredentials: true }
      );

      setSnackbar({
        open: true,
        message: "Time slot updated successfully",
        severity: "success",
      });

      onUpdated(); // refresh table
      setTimeout(onClose, 300);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Update failed",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!slot) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Time Slot</DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography fontWeight={600}>{slot.doctor_name}</Typography>

              {/* Date shown but NOT editable */}
              <Typography color="text.secondary">
                Date: {dayjs(slot.slot_date).format("DD/MM/YYYY")}
              </Typography>
            </Box>

            <TextField
              label="From Time"
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="To Time"
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={loading}
            sx={{ bgcolor: COLORS.primary }}
          >
            {loading ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Alerts */}
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
    </>
  );
};

export default EditTimeSlots;
