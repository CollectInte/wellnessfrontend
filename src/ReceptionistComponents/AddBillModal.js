import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  TextField,
  Button,
  Autocomplete,
  Snackbar,
  Alert,
  Typography,
  Box,
  Stack,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { COLORS } from "./Themes";

const inputSx = {
  "& .MuiInputBase-root": {
    height: 44,
  },
};
const AddBillModal = ({ open, onClose, bills = [], onBillAdded }) => {
  const [appointments, setAppointments] = useState([]);
  const [patient, setPatient] = useState(null);
  const [appointment, setAppointment] = useState(null);

  const [form, setForm] = useState({
    subtotal: "",
    tax: "",
    total_amount: "",
    notes: "",
  });

  const [alert, setAlert] = useState({
    open: false,
    type: "success",
    message: "",
  });

  /* ================= FETCH COMPLETED APPOINTMENTS ================= */
  useEffect(() => {
    if (!open) return;

    axios
      .get(`${process.env.REACT_APP_URL}/appointment/appointments`, {
        withCredentials: true,
      })
      .then((res) => {
        const completed = res.data.appointments.filter(
          (a) => a.status === "completed" && !billedAppointmentIds.has(a.id),
        );

        setAppointments(completed);
      })
      .catch(() => {
        setAlert({
          open: true,
          type: "error",
          message: "Failed to load appointments",
        });
      });
  }, [open]);

  /* ================= AUTO TOTAL ================= */
  useEffect(() => {
    const subtotal = Number(form.subtotal) || 0;
    const tax = Number(form.tax) || 0;

    const total = subtotal + tax;

    setForm((prev) => ({
      ...prev,
      total_amount: total.toFixed(2),
    }));
  }, [form.subtotal, form.tax]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!appointment || !form.subtotal) {
      setAlert({
        open: true,
        type: "warning",
        message: "Please fill all required fields",
      });
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_URL}/bill/bills`,
        {
          appointment_id: appointment.id,
          subtotal: form.subtotal,
          tax: form.tax,
          total_amount: form.total_amount,
          notes: form.notes,
        },
        { withCredentials: true },
      );

      // 👇 REFRESH BILLS LIST
      if (onBillAdded) {
        await onBillAdded();
      }

      setAlert({
        open: true,
        type: "success",
        message: "Bill created successfully",
      });

      setTimeout(onClose, 1200);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 409) {
        setAlert({
          open: true,
          type: "error",
          message: "Bill already exists for this appointment",
        });
      } else if (status === 400) {
        setAlert({
          open: true,
          type: "warning",
          message: message || "Invalid data submitted",
        });
      } else {
        setAlert({
          open: true,
          type: "error",
          message: "Server error. Please try again later",
        });
      }
    }
  };

  /* ================= FILTER HELPERS ================= */
  const patients = Array.from(
    new Map(
      appointments.map((a) => [
        a.client_id,
        { id: a.client_id, name: a.client_name },
      ]),
    ).values(),
  );

  const billedAppointmentIds = new Set(bills.map((b) => b.appointment_id));
  const appointmentOptions = patient
    ? appointments.filter((a) => a.client_id === patient.id)
    : appointments;

  const labelSx = {
    color: COLORS.primary,
    mb: 0.8,
  };

  const fieldSx = {
    "& .MuiInputBase-root": {
      height: 35,
      paddingX: 0.3,
      border: `2px solid ${COLORS.primary}`,
    },

    "& fieldset": {
      border: "none",
    },

    "& .MuiInputBase-root:hover": {
      borderColor: COLORS.primary,
    },

    "& .MuiInputBase-root.Mui-focused": {
      borderColor: COLORS.primary,
    },
  };

  const amountSx = {
    "& .MuiInputBase-root": {
      height: 35,
      width: 180,
      border: `2px solid ${COLORS.primary}`,
    },

    "& fieldset": {
      border: "none",
    },

    "& .MuiInputBase-root:hover": {
      borderColor: COLORS.primary,
    },

    "& .MuiInputBase-root.Mui-focused": {
      borderColor: COLORS.primary,
    },
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {/* HEADER */}
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 2,
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: 18,
              color: COLORS.primary,
            }}
          >
            Add Bill
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* CONTENT */}
        <DialogContent
          sx={{
            px: 4,
            py: 1,
          }}
        >
          <Stack spacing={1.5}>
            {/* PATIENT */}
            <Box>
              <Typography sx={labelSx}>Patient</Typography>
              <Autocomplete
                fullWidth
                options={patients}
                getOptionLabel={(o) => `${o.name} (ID: ${o.id})`}
                onChange={(e, v) => {
                  setPatient(v);
                  setAppointment(null);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select patient"
                    sx={fieldSx}
                  />
                )}
              />
            </Box>

            {/* APPOINTMENT */}
            <Box>
              <Typography sx={labelSx}>Appointment</Typography>
              <Autocomplete
                fullWidth
                options={appointmentOptions}
                getOptionLabel={(o) =>
                  `Appointment ID ${o.id} — (${o.client_name})`
                }
                value={appointment}
                onChange={(e, v) => setAppointment(v)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select appointment"
                    sx={fieldSx}
                  />
                )}
              />
            </Box>

            {/* DOCTOR */}
            <Box>
              <Typography sx={labelSx}>Doctor Name</Typography>
              <TextField
                value={appointment?.doctor_name || ""}
                fullWidth
                disabled
                placeholder="Doctor"
                sx={fieldSx}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              {/* SUB TOTAL */}
              <Box>
                <Typography sx={labelSx}>Sub Total</Typography>
                <TextField
                  value={form.subtotal}
                  type="number"
                  onChange={(e) =>
                    setForm({ ...form, subtotal: e.target.value })
                  }
                  fullWidth
                  placeholder="Enter amount"
                  sx={amountSx}
                />
              </Box>

              {/* TAX */}
              <Box>
                <Typography sx={labelSx}>Tax Amount</Typography>
                <TextField
                  type="number"
                  value={form.tax}
                  onChange={(e) => setForm({ ...form, tax: e.target.value })}
                  fullWidth
                  placeholder="Enter tax amount"
                  sx={amountSx}
                />
              </Box>
            </Box>

            {/* TOTAL */}
            <Box>
              <Typography sx={labelSx}>Total Amount</Typography>
              <TextField
                value={form.total_amount}
                fullWidth
                disabled
                placeholder="Total"
                sx={fieldSx}
              />
            </Box>

            {/* NOTES */}
            <Box>
              <Typography sx={labelSx}>Notes</Typography>
              <TextField
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                fullWidth
                multiline
                rows={3}
                placeholder="Additional notes"
                sx={{
                  ...fieldSx,
                  "& .MuiInputBase-root": {
                    ...fieldSx["& .MuiInputBase-root"],
                    height: "auto",
                  },
                }}
              />
            </Box>

            {/* SUBMIT */}
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                sx={{
                  bgcolor: COLORS.primary,
                  color: "#fff",
                  px: 6,
                  py: 1.2,
                  borderRadius: "24px",
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* ALERTS */}
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={alert.type}
          onClose={() => setAlert({ ...alert, open: false })}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddBillModal;