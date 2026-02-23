import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar,
  Alert,
} from "@mui/material";
import dayjs from "dayjs";
import axios from "axios";
import CommonDatePicker from "../CommonDatePicker";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

const AppointmentForm = ({ open, onClose, onSuccess }) => {
  const [purpose, setPurpose] = useState("");
  const [type, setType] = useState("online");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [role, setRole] = useState("admin");
  const [staffId, setStaffId] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({ open: false, msg: "", type: "success" });

  // ----------------------------
  // FETCH STAFF
  // ----------------------------
  useEffect(() => {
    if (!open) return;

    axios
      .get(`${process.env.REACT_APP_URL}/api/available-staff`, {
        withCredentials: true,
      })
      .then((res) => setStaffList(res.data || []))
      .catch(() => setStaffList([]));
  }, [open]);

  // ----------------------------
  // FETCH SLOTS
  // ----------------------------
  useEffect(() => {
    if (!selectedDate) return;
    if (role === "staff" && !staffId) return;

    axios
      .get(`${process.env.REACT_APP_URL}/api/client/appointment/slots`, {
        params: {
          date: selectedDate.format("YYYY-MM-DD"),
          staff_id: role === "staff" ? staffId : null,
        },
        withCredentials: true,
      })
      .then((res) => setSlots(res.data || []))
      .catch(() => setSlots([]));
  }, [selectedDate, role, staffId]);

  // ----------------------------
  // 12 HR FORMAT (UI ONLY)
  // ----------------------------
  const formatTo12Hour = (time) =>
    dayjs(`2025-01-01 ${time}`).format("hh:mm A");

  // ----------------------------
  // VALIDATION
  // ----------------------------
  const validateForm = () => {
    const newErrors = {};
    if (!purpose.trim()) newErrors.purpose = "Purpose is required";
    if (!selectedSlot) newErrors.slot = "Select a time slot";
    if (role === "staff" && !staffId) newErrors.staff = "Select staff";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ----------------------------
  // SUBMIT
  // ----------------------------
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await axios.post(
        `${process.env.REACT_APP_URL}/appointment/client/appointment`,
        {
          date: selectedDate.format("YYYY-MM-DD"),
          from_time: selectedSlot.slot_time_from, // 24 hr → backend
          to_time: selectedSlot.slot_time_to,
          purpose: purpose.trim(),
          type,
          staff_id: role === "staff" ? staffId : null,
        },
        { withCredentials: true }
      );

      setSnack({
        open: true,
        msg: "Appointment booked successfully",
        type: "success",
      });

      // 🔥 Notify parent immediately
      onSuccess();

      // RESET
      setPurpose("");
      setSelectedSlot(null);
    } catch (err) {
      setSnack({ open: true, msg: "Booking failed", type: "error" });
    }
  };

  const isSlotDisabled = (slot) => {
    // 2️⃣ If not today → allow
    if (!selectedDate.isSame(dayjs(), "day")) return false;

    // 3️⃣ Disable past time (today only)
    const now = dayjs();
    const slotTime = dayjs(
      `${selectedDate.format("YYYY-MM-DD")} ${slot.slot_time_from}`
    );

    return slotTime.isBefore(now);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography align="center" fontWeight={700} mb={2}>
            Book an Appointment
          </Typography>

          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>

          <Stack spacing={2}>
            <TextField
              label="Purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              error={!!errors.purpose}
              helperText={errors.purpose}
              fullWidth
            />

            <TextField
              select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value="appointment">Appointment</MenuItem>
              <MenuItem value="scheduleacall">Schedule a call</MenuItem>
            </TextField>

            <RadioGroup
              row
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <FormControlLabel
                value="admin"
                control={<Radio />}
                label="Admin"
              />
              <FormControlLabel
                value="staff"
                control={<Radio />}
                label="Staff"
              />
            </RadioGroup>
            {role === "staff" &&
              (staffList.length > 0 ? (
                <TextField
                  select
                  label="Select Staff"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  error={!!errors.staff}
                  helperText={errors.staff}
                  fullWidth
                >
                  {staffList.map((s) => (
                    <MenuItem key={s.staff_id} value={s.staff_id}>
                      {s.staff_name}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <Typography color="error" variant="body2">
                  No staff available for appointment
                </Typography>
              ))}

            <CommonDatePicker
              label="Choose Date"
              value={selectedDate}
              onChange={setSelectedDate}
              disableSunday={true}
            />
            <Box display="flex" flexWrap="wrap" gap={1}>
              {slots.map((slot) => (
                <Button
                  key={slot.id}
                  disabled={isSlotDisabled(slot)}
                  onClick={() => setSelectedSlot(slot)}
                  variant={
                    selectedSlot?.id === slot.id ? "contained" : "outlined"
                  }
                  sx={{
                    borderRadius: 20,
                    opacity: isSlotDisabled(slot) ? 1 : 1,
                    cursor: isSlotDisabled(slot) ? "not-allowed" : "pointer",
                  }}
                >
                  {formatTo12Hour(slot.slot_time_from)}

                  {slot.is_booked === 1}
                </Button>
              ))}
            </Box>

            {errors.slot && (
              <Typography color="error">{errors.slot}</Typography>
            )}

            <Button variant="contained" onClick={handleSubmit}>
              Book Now
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentForm;
