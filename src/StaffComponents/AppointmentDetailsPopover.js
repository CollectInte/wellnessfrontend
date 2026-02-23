import React, { useEffect,useState } from "react";
import {
  Popover,
  Dialog,
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import api from "./services/api";

export default function AppointmentDetailsPopover({
  anchorEl,
  onClose,
  appointment,
  onStatusUpdate,
}) {
  const open = Boolean(anchorEl);

  const [successOpen, setSuccessOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [localStatus, setLocalStatus] = useState(appointment.status);

  useEffect(() => {
  setLocalStatus(appointment.status);
}, [appointment.status]);

  // ✅ MOBILE DETECTION
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!appointment) return null;

  // ✅ Status color
  const getStatusColor = (status) => {
    if (status === "cancelled") return "#e53935";
    if (status === "assigned" || status === "completed") return "#1fa46c";
    return "#9e9e9e";
  };

 const updateAppointmentStatus = async (status) => {
  if (localStatus === status) return; // ⛔ prevent double call

  try {
    setActionLoading(status);

    await api.put(
      `/appointment/appointment/${appointment._id}/status`,
      { status }
    );

    // ✅ update local + parent immediately
    setLocalStatus(status);
    onStatusUpdate?.(appointment._id, status);

    setSuccessMessage(
      status === "completed"
        ? "Appointment marked as completed"
        : "Appointment cancelled successfully"
    );

    setSuccessOpen(true);
    setTimeout(() => {
  onClose();
}, 800);

  } catch (error) {
    alert(error?.response?.data?.message || "Status update failed");
  } finally {
    setActionLoading(null);
  }
};


  // ✅ COMMON CONTENT (USED IN BOTH POPOVER & DIALOG)
  const CONTENT = (
    <Box
      sx={{
        width: { xs: "100%", sm: 560, md: 520 },
        maxWidth: "95vw",
        bgcolor: "#01636B",
        color: "white",
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography fontWeight={400} fontSize={15}>
          Appointment Details
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={appointment.status}
            size="small"
            sx={{
              bgcolor: getStatusColor(appointment.status),
              color: "white",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          />

          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: "white",
              bgcolor: "rgba(255,255,255,0.15)",
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      <Divider sx={{ bgcolor: "white", opacity: 0.7, my: 2 }} />

      {/* BODY */}
      <Stack direction="row" spacing={2}>
        {/* LEFT */}
        <Box flex={1}>
          <Typography sx={{ color: "#CCE0E1", fontWeight: 500 }}>
            Patient Information
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" mt={1}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                bgcolor: "#fff",
                color: "#01636B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {appointment.client_name?.charAt(0)}
            </Box>

            <Box>
              <Typography fontWeight={600} fontSize={14}>
                {appointment.client_name}
              </Typography>
              <Typography variant="body2" opacity={0.85}>
                ID: {appointment.client_id}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* RIGHT */}
        <Box flex={1}>
          <Typography sx={{ color: "#CCE0E1", fontWeight: 500 }}>
            Date & Time
          </Typography>

          <Stack spacing={1} mt={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: "#B2EAD2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <EventIcon fontSize="small" sx={{ color: "#0F3B3C" }} />
              </Box>
              <Typography fontSize={13}>
                {appointment.appointment_date}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: "#B2EAD2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AccessTimeIcon fontSize="small" sx={{ color: "#0F3B3C" }} />
              </Box>
              <Typography fontSize={13}>
                {appointment.from_time} - {appointment.to_time}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>

      {/* ACTION BUTTONS */}
      {appointment.status === "assigned" && (
        <Stack direction="row" justifyContent="space-between" mt={2.5}>
          <Button
            onClick={() => updateAppointmentStatus("cancelled")}
            sx={{
              bgcolor: "#ff4d4f",
              color: "white",
              textTransform: "none",
              width: { md: 200, xs: 150 },
              borderRadius: 2,
            }}
          >
            {actionLoading === "cancelled" ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "cancel appointment"
            )}
          </Button>

          <Button
            onClick={() => updateAppointmentStatus("completed")}
            sx={{
              bgcolor: "#16a34a",
              color: "white",
              textTransform: "none",
              width: { md: 200, xs: 100 },
              borderRadius: 2,
            }}
          >
            {actionLoading === "completed" ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "completed"
            )}
          </Button>
        </Stack>
      )}
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Dialog open={open} onClose={onClose} fullWidth>
          {CONTENT}
        </Dialog>
      ) : (
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={onClose}
          anchorOrigin={{ vertical: "center", horizontal: "right" }}
          transformOrigin={{ vertical: "center", horizontal: "left" }}
        >
          {CONTENT}
        </Popover>
      )}

      <Snackbar
        open={successOpen}
        autoHideDuration={4000}
        onClose={() => setSuccessOpen(false)}
      >
        <Alert severity="success" variant="filled">
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}