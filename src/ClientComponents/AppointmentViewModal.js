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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BusinessIcon from "@mui/icons-material/Business";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import axios from "axios";
import dayjs from "dayjs";
import { COLORS } from "./Themes";

const AppointmentDetailsModal = ({ open, appointmentId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [theme, setTheme] = useState({});
  
    const fetchTheme = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_URL}/api/theme`, {
          method: "GET",
          credentials: "include",
        });
        const json = await res.json();
  
        if (!res.ok || !json.success) {
          alert("Failed to load theme", "error");
          setTheme({});
        } else {
          setTheme({ ...(json.data || {}) });
          console.log("Theme loaded:", json.data);
        }
      } catch (err) {
        console.error(err);
        alert("Network error while loading theme", "error");
        setTheme({});
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchTheme();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  useEffect(() => {
    if (open && appointmentId) {
      fetchAppointment();
    }
  }, [open, appointmentId]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_URL}/api/plans/${appointmentId}`,
        { withCredentials: true }
      );
      setAppointment(res.data.plan);
    } catch (err) {
      console.error(err);
      setAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: theme.sidebar_bg,
          color: theme.text_color,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 600,
        }}
      >
        Plan Details
        <IconButton onClick={onClose} sx={{ color: theme.text_color }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
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
                Plan #{appointment.plan_id}
              </Typography>

              <Typography fontWeight={600}>
                Plan Start Date:
              <Chip
                label={appointment.start_date}
                sx={{
                  bgcolor: theme.sidebar_bg,
                  color: theme.text_color,
                  textTransform: "capitalize",
                  fontSize: 12,
                }}
              />
              </Typography>
            </Box>

            <Divider />

            {/* Details */}
            <Stack spacing={1.2}>
              <Detail icon={<PersonIcon sx={{ color: theme.sidebar_bg }} />} label="Client">
                {appointment.client_name}
              </Detail>

              <Detail icon={<EventIcon sx={{ color: theme.sidebar_bg }} />} label="Plan Type">
                {appointment.plan_type} /Week
              </Detail>

              <Detail icon={<AccountCircleIcon sx={{ color: theme.sidebar_bg }} />} label="Trainer">
                {appointment.trainer_name}
              </Detail>

              {/* <Detail icon={<InfoOutlinedIcon />} label="Purpose">
                {appointment.purpose}
              </Detail> */}

              <Detail icon={<EventIcon sx={{ color: theme.sidebar_bg }} />} label="Plan EndDate">
                {dayjs(appointment.end_date).format("DD/MM/YYYY")}
              </Detail>

              {/* <Detail icon={<AccessTimeIcon />} label="Time">
                {appointment.from_time} - {appointment.to_time}
              </Detail> */}

              {/* <Detail icon={<BusinessIcon />} label="Branch">
                {appointment.branch.toUpperCase()}
              </Detail> */}
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
