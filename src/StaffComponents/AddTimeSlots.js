import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  IconButton,
  Typography,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { Add, Delete, Close } from "@mui/icons-material";
import api from "./services/api";

export default function AddTimeSlotDialog({ open, onClose }) {
  const [slots, setSlots] = useState([{ slot_date: "", slot_time_from: "", slot_time_to: "" }]);
  const [existingSlots, setExistingSlots] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const fetchSlots = async () => {
    try {
      const res = await api.get("/api/staff/time-slots");
      setExistingSlots(res.data || []);
    } catch (err) {
      console.error("Error fetching slots", err);
      showMessage("Failed to fetch slots", "error");
    }
  };

  useEffect(() => {
    if (open) fetchSlots();
  }, [open]);

  const handleAddRow = () => setSlots([...slots, { slot_date: "", slot_time_from: "", slot_time_to: "" }]);
  const handleRemoveRow = (index) => setSlots(slots.filter((_, i) => i !== index));
  const handleChange = (index, field, value) => {
    const updated = [...slots];
    updated[index][field] = value;
    setSlots(updated);
  };

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async () => {
    try {
      if (slots.length === 1) {
        const s = slots[0];
        await api.post("/api/staff/time-slots", s);
      } else {
        await api.post("/api/staff/time-slots/bulk", { slots });
      }
      showMessage("Time slot(s) added successfully", "success");
      setSlots([{ slot_date: "", slot_time_from: "", slot_time_to: "" }]);
      fetchSlots();
    } catch (err) {
      console.error("Error adding slots", err);
      showMessage(err.response?.data?.message || "Failed to add slots", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;
    try {
      await api.delete(`/api/staff/time-slots/${id}`);
      showMessage("Slot deleted successfully", "success");
      fetchSlots();
    } catch (err) {
      console.error("Error deleting slot", err);
      showMessage(err.response?.data?.message || "Failed to delete slot", "error");
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add Time Slots
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
            size="large"
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            {slots.map((s, i) => (
              <Stack key={i} direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Date"
                  type="date"
                  value={s.slot_date}
                  onChange={(e) => handleChange(i, "slot_date", e.target.value)}
                  sx={{ flex: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="From"
                  type="time"
                  value={s.slot_time_from}
                  onChange={(e) => handleChange(i, "slot_time_from", e.target.value)}
                  sx={{ flex: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="To"
                  type="time"
                  value={s.slot_time_to}
                  onChange={(e) => handleChange(i, "slot_time_to", e.target.value)}
                  sx={{ flex: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
                <IconButton color="error" onClick={() => handleRemoveRow(i)}>
                  <Delete />
                </IconButton>
              </Stack>
            ))}
            <Button startIcon={<Add />} onClick={handleAddRow}>
              Add Another Slot
            </Button>
          </Stack>

          <Box mt={3}>
            <Typography variant="h6">Existing Slots</Typography>
            {existingSlots.length === 0 && <Typography>No slots yet</Typography>}
            {existingSlots.map((slot) => (
              <Stack
                key={slot.id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ p: 1, border: "1px solid #e0e0e0", borderRadius: 1, mt: 1 }}
              >
                <Typography>
                  {slot.slot_date} | {slot.slot_time_from} - {slot.slot_time_to}{" "}
                  {slot.is_booked ? "(Booked)" : ""}
                </Typography>
                {!slot.is_booked && (
                  <IconButton color="error" size="small" onClick={() => handleDelete(slot.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            ))}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save Slots
          </Button>
        </DialogActions>
      </Dialog>

      {/* Responsive Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
