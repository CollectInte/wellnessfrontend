import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  useMediaQuery,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";

import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import { useTheme } from "@mui/material/styles";
import api from "./services/api";

const initialState = {
  leaveType: "",
  fromDate: "",
  toDate: "",
  reason: "",
};

const LEAVE_TYPES = [
  "Sick",
  "Casual",
  "Paid",
  "Unpaid",
  "Maternity",
  "Other",
];

export default function LeaveRequestDialog({
  open,
  onClose,
  initialData,
  onSuccess,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [activeDateField, setActiveDateField] = useState("fromDate"); // ✅ default
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ✅ Populate form when editing
  useEffect(() => {
    if (!open) return;

    if (initialData?.id) {
      setFormData({
        leaveType: initialData.leave_type || "",
        fromDate: initialData.start_date
          ? dayjs(initialData.start_date).format("YYYY-MM-DD")
          : "",
        toDate: initialData.end_date
          ? dayjs(initialData.end_date).format("YYYY-MM-DD")
          : "",
        reason: initialData.reason || "",
      });
      setActiveDateField("fromDate");
    } else {
      setFormData(initialState);
      setActiveDateField("fromDate");
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        leave_type: formData.leaveType,
        start_date: formData.fromDate,
        end_date: formData.toDate,
        reason: formData.reason,
      };

     if (initialData?.id) {
  await api.put(`/api/leave/update/${initialData.id}`, payload);

  setSnack({
    open: true,
    message: "Leave request updated successfully!",
    severity: "success",
  });

  if (onSuccess) onSuccess(); // notify parent
  onClose(); // ✅ CLOSE EDIT DIALOG
}
else {
        await api.post("/api/leave/create/", payload);
        setSnack({
          open: true,
          message: "Leave request submitted successfully!",
          severity: "success",
        });
        setTimeout(onClose, 800);
      }
    } catch (error) {
      setSnack({
        open: true,
        message:
          error?.response?.data?.message || "Failed to submit leave request",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackClose = () => {
    setSnack((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 4,
            p: 1,
            width: { md: "800px", xs: "100%" },
          },
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8, color: "#01636B" }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent
          sx={{
            bgcolor: "#ffffff",
            borderRadius: 3,
            p: isMobile ? 1 : 3,
          }}
        >
          <Box
            display="flex"
            flexDirection={isMobile ? "column" : "row"}
            gap={2}
          >
            {/* LEFT CALENDAR PANEL */}
            <Box flex={1} sx={{ borderRadius: 3, p: 2, background: "white" }}>
              <Typography
                fontWeight={700}
                fontSize={18}
                mb={1}
                sx={{ color: "#024e52" }}
              >
                {activeDateField === "fromDate"
                  ? "Select start date"
                  : activeDateField === "toDate"
                  ? "Select end date"
                  : "Select date"}
              </Typography>

              <Box
                sx={{
                  border: "1px solid #cfe7e5",
                  borderRadius: 4,
                  p: 1,
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar
                    value={
                      activeDateField === "toDate"
                        ? formData.toDate
                          ? dayjs(formData.toDate)
                          : null
                        : formData.fromDate
                        ? dayjs(formData.fromDate)
                        : null
                    }
                    onChange={(newValue) => {
                      if (!newValue || !activeDateField) return;
                      const formatted = newValue.format("YYYY-MM-DD");
                      setFormData((prev) => ({
                        ...prev,
                        [activeDateField]: formatted,
                      }));
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </Box>

            {/* DIVIDER */}
            {!isMobile && (
              <Box
                sx={{
                  width: 4,
                  bgcolor: "#cfe7e5",
                  borderRadius: 2,
                }}
              />
            )}

            {/* RIGHT FORM PANEL */}
            <Box flex={1} sx={{ p: 1 }}>
              <Box
                display="grid"
                gridTemplateColumns={isMobile ? "1fr" : "1fr 1fr"}
                gap={2}
                mb={2}
              >
               <TextField
  label="Start Date"
  name="fromDate"
  type="date"
  value={formData.fromDate}
  onChange={handleChange}
  onFocus={() => setActiveDateField("fromDate")}
  InputLabelProps={{ shrink: true }}
  size="small"
  fullWidth
  sx={{
    mb: 2,
    "& .MuiInputLabel-root": { color: "#01636B" },
    "& .MuiInputBase-input": { color: "#01636B" },
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "#01636B" },
      "&:hover fieldset": { borderColor: "#01636B" },
      "&.Mui-focused fieldset": { borderColor: "#01636B" },
    },
  }}
/>


                <TextField
                  label="End Date"
                  name="toDate"
                  type="date"
                  value={formData.toDate}
                  onChange={handleChange}
                  onFocus={() => setActiveDateField("toDate")}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  fullWidth
                  sx={{
                    mb: 2,
                    "& .MuiInputLabel-root": { color: "#01636B" },
                    "& .MuiInputBase-input": { color: "#01636B" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#01636B" },
                      "&:hover fieldset": { borderColor: "#01636B" },
                      "&.Mui-focused fieldset": { borderColor: "#01636B" },
                    },
                  }}
                />
              </Box>

              <TextField
                label="Leave Type"
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                select
                fullWidth
                size="small"
                sx={{
                  mb: 2,
                  "& .MuiInputLabel-root": { color: "#01636B" },
                  "& .MuiInputBase-input": { color: "#01636B" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#01636B" },
                    "&:hover fieldset": { borderColor: "#01636B" },
                    "&.Mui-focused fieldset": { borderColor: "#01636B" },
                  },
                }}
              >
                {LEAVE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Comment (Optional)"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
                size="small"
                sx={{
                  "& .MuiInputLabel-root": { color: "#01636B" },
                  "& .MuiInputBase-input": { color: "#01636B" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#01636B" },
                    "&:hover fieldset": { borderColor: "#01636B" },
                    "&.Mui-focused fieldset": { borderColor: "#01636B" },
                  },
                }}
              />

              <Box textAlign="center">
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{
                    bgcolor: "#01636B",
                    color: "white",
                    borderRadius: 20,
                    px: 4,
                    mt: 2,
                    textTransform: "none",
                  }}
                >
                  {loading
                    ? initialData?.id
                      ? "Updating..."
                      : "Submitting..."
                    : initialData?.id
                    ? "Update Request"
                    : "Send Request"}
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={handleSnackClose}
          variant="filled"
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}