import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Button,
  TextField,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import api from "./services/api";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";

const initialState = {
  date: "",
  clockIn: "",
  clockOut: "",
  reason: "",
};

export default function UpdateAttendance({ open, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.date || !formData.reason) {
      setSnack({
        open: true,
        message: "Date and reason are required",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/attendance/request-correction", {
        date: formData.date,
        clock_in: formData.clockIn || null,
        clock_out: formData.clockOut || null,
        reason: formData.reason,
      });

      setSnack({
        open: true,
        message: "Attendance correction request sent successfully",
        severity: "success",
      });

      setTimeout(() => {
        setFormData(initialState);
        onClose();
      }, 1000);
    } catch (error) {
      setSnack({
        open: true,
        message:
          error.response?.data?.message ||
          "Failed to send attendance correction request",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={false} // not fullscreen so you can control height
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            height: isMobile ? "70vh" : "auto", // custom height for mobile
            width: isMobile ? "100%" : "450px",
          },
        }}
      >

        <DialogContent
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: isMobile ? 1 : 3,
            height: "100%",
          }}
        >
          {/* 🔴 Close button top-right */}
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography
            fontWeight={700}
            fontSize={25}
            mb={5}
            textAlign="center"
            sx={{
              color: "#01636B",
              textDecoration: "underline",
              textDecorationColor: "#01636B",
              textUnderlineOffset: "10px",     // ⬅️ space between text and underline
              textDecorationThickness: "2px", // (optional) thicker underline
            }}
          >
            Update Your Attendance
          </Typography>


          <Box
            display="flex"
            flexDirection="column"
            gap={2}
            width={isMobile ? "100%" : "80%"}
            alignItems="center"
          >
            <TextField
              type="date"
              label="Date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
              required
            />

            <TextField
              type="time"
              label="Requested Clock In"
              name="clockIn"
              value={formData.clockIn}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />

            <TextField
              type="time"
              label="Requested Clock Out"
              name="clockOut"
              value={formData.clockOut}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />

            <TextField
              label="Reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              multiline
              rows={3}
              size="small"
              fullWidth
              required
            />
          </Box>

          <Box mt={3}>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                borderRadius: 3,
                bgcolor: "#01636B",
                color: "white",
                px: 3,
                textTransform: "none",
                fontWeight: 600   // ⬅️ keep original case
              }}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </Button>

          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}
