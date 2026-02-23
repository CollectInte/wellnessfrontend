import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Stack,
  Chip,
  CircularProgress,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BusinessIcon from "@mui/icons-material/Business";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import axios from "axios";
import dayjs from "dayjs";
import { COLORS } from "../Themes";

const AppointmentDetailsModal = ({ open, appointmentId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    if (open && appointmentId) {
      fetchAppointment();
    }
  }, [open, appointmentId]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_URL}/appointment/appointments/${appointmentId}`,
        { withCredentials: true }
      );
      setAppointment(res.data.appointment);
    } catch (err) {
      console.error(err);
      setAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  const STATUS_COLORS = {
    pending: {
      bg: "#FFF3CD",
      color: "#856404",
    },
    confirmed: {
      bg: "#D1E7DD",
      color: "#0F5132",
    },
    completed: {
      bg: "#E7F1FF",
      color: "#084298",
    },
    cancelled: {
      bg: "#F8D7DA",
      color: "#842029",
    },
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: COLORS.activeBg,
          color: COLORS.primary,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 600,
        }}
      >
        Appointment Details
        <IconButton onClick={onClose} sx={{ color: COLORS.primary }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3,
          background: `linear-gradient(180deg, ${COLORS.activeBg} 10%,${COLORS.texWhite} 100%)`,
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : appointment ? (
          <Stack spacing={2}>
            {/* ID + Status */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                pt: 4,
              }}
            >
              <Typography fontWeight={600}>
                Appointment #{appointment.id}
              </Typography>

              <Chip
                label={appointment.status}
                sx={{
                  bgcolor:
                    STATUS_COLORS[appointment.status?.toLowerCase()]?.bg ||
                    "#E0E0E0",
                  color:
                    STATUS_COLORS[appointment.status?.toLowerCase()]?.color ||
                    "#424242",
                  textTransform: "capitalize",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
            </Box>

            <Divider />

            {/* Details */}
            <Stack spacing={1.2}>
              <Detail icon={<PersonIcon />} label="Patient">
                {appointment.client_name}
              </Detail>

              <Detail icon={<PhoneIcon />} label="Mobile">
                {appointment.client_mobile}
              </Detail>

              <Detail icon={<LocalHospitalIcon />} label="Doctor">
                {appointment.doctor_name}
              </Detail>

              <Detail icon={<InfoOutlinedIcon />} label="Purpose">
                {appointment.purpose}
              </Detail>

              <Detail icon={<EventIcon />} label="Date">
                {dayjs(appointment.appointment_date).format("DD/MM/YYYY")}
              </Detail>

              <Detail icon={<AccessTimeIcon />} label="Time">
                {appointment.from_time} - {appointment.to_time}
              </Detail>

              <Detail icon={<BusinessIcon />} label="Branch">
                {appointment.selected_branch
                  ? appointment.selected_branch.charAt(0).toUpperCase() +
                    appointment.selected_branch.slice(1)
                  : "N/A"}
              </Detail>
            </Stack>
          </Stack>
        ) : (
          <Typography>No appointment data found</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* Reusable detail row */
const Detail = ({ icon, label, children }) => (
  <Stack direction="row" spacing={1.5} alignItems="center">
    <Box sx={{ color: "#0F7C7C" }}>{icon}</Box>
    <Typography variant="body2">
      <b>{label}:</b> {children}
    </Typography>
  </Stack>
);

export default AppointmentDetailsModal;
