import React, { useState, useEffect } from "react";
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
import axios from "axios";

export default function AppointmentDetailsPopover({
  anchorEl,
  onClose,
  appointment,
  onStatusUpdate,
}) {
  const open = Boolean(anchorEl);

  const [successOpen, setSuccessOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ✅ MOBILE DETECTION
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (appointment?.status) {
      setCurrentStatus(appointment.status);
    }
  }, [appointment]);

  if (!appointment) return null;

  // ✅ Status color
  const getStatusColor = (status) => {
    if (status === "cancelled") return "#e53935";
    if (status === "assigned" || status === "completed") return "#1fa46c";
    return "#9e9e9e";
  };

  const updateAppointmentStatus = async (status) => {
    try {
      setActionLoading(status);

     await axios.put(
        `${process.env.REACT_APP_URL}/appointment/appointment/${appointment.id}/status`,
        {
          status,
        },
        {
          withCredentials: true,
        }
      );

      setCurrentStatus(status);
      onStatusUpdate?.(appointment.id, status);

      setSuccessMessage(
        status === "completed"
          ? "Appointment marked as completed"
          : "Appointment cancelled successfully"
      );

      setSuccessOpen(true);
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
        width: { xs: "100%", sm: 560, md: 520 }, // ⬅️ wider popup
        maxWidth: "95vw", // ⬅️ safety for small screens
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
            label={currentStatus}
            size="small"
            sx={{
              bgcolor: getStatusColor(currentStatus),
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
      <Stack direction={{ xs: "row", sm: "row" }} spacing={2}>
        {/* LEFT */}
        <Box flex={1} textAlign={{ xs: "left", sm: "left" }}>
          <Typography
            sx={{
              color: "#CCE0E1",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500, // Inter Medium = 500
            }}
          >
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
        <Box flex={1} textAlign={{ xs: "left", sm: "left" }}>
          <Typography
            sx={{
              color: "#CCE0E1",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500, // Inter Medium =
            }}
          >
            Appointment Time
          </Typography>

          <Stack spacing={1} mt={1}>
            

            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: "#B2EAD2", // circle background
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
      {/* ACTION BUTTONS */}
      {currentStatus === "assigned" && (
        <Stack
          direction={{ xs: "row", sm: "row" }} // Mobile: stacked, Desktop: row
          justifyContent={"space-between"}
          spacing={1}
          mt={2.5}
        >
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
      {/* ✅ MOBILE → DIALOG */}
      {isMobile ? (
        <Dialog
          open={open}
          onClose={onClose}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: isMobile ? "16px 16px 0 0" : 3,
              position: isMobile ? "fixed" : "static",
              bottom: isMobile ? 0 : "",
              m: isMobile ? 0 : "",
              bgcolor: "transparent",
              overflow: "visible",
            },
          }}
        >
          {CONTENT}
        </Dialog>
      ) : (
        /* ✅ DESKTOP → POPOVER */
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={onClose}
          anchorOrigin={{ vertical: "center", horizontal: "right" }}
          transformOrigin={{ vertical: "center", horizontal: "left" }}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
            },
          }}
        >
          {CONTENT}
        </Popover>
      )}

      {/* SUCCESS MESSAGE */}
      <Snackbar
        open={successOpen}
        autoHideDuration={4000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled">
          {successMessage} for <strong>{appointment.client_name}</strong> (ID:
          {appointment.client_id})
        </Alert>
      </Snackbar>
    </>
  );
}
