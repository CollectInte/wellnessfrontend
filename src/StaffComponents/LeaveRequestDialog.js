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
  onUpdate,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [activeDateField, setActiveDateField] = useState("fromDate");
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [themedata, setTheme] = useState({});

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

  // ✅ Robust data mapping for ANY backend response shape
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      const leaveType =
        initialData.leave_type ||
        initialData.leaveType ||
        initialData.type ||
        "";

      const fromDateRaw =
        initialData.start_date ||
        initialData.fromDate ||
        initialData.startDate ||
        "";

      const toDateRaw =
        initialData.end_date ||
        initialData.toDate ||
        initialData.endDate ||
        "";

      setFormData({
        leaveType,
        fromDate: fromDateRaw ? dayjs(fromDateRaw).format("YYYY-MM-DD") : "",
        toDate: toDateRaw ? dayjs(toDateRaw).format("YYYY-MM-DD") : "",
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

        if (onUpdate) onUpdate();

      } else {
        await api.post("/api/leave/create/", payload);
        setSnack({
          open: true,
          message: "Leave request submitted successfully!",
          severity: "success",
        });

        setTimeout(() => {
          setFormData(initialState);
          onClose();
        }, 1000);
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
            backgroundColor: themedata.app_bg,
          },
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8, color: themedata.text_color }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent
          sx={{
            bgcolor: themedata.app_bg,
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
            <Box flex={1} sx={{ borderRadius: 3, p: 2, background: themedata.app_bg, color: themedata.text_color }}>
              <Typography
                fontWeight={700}
                fontSize={18}
                mb={1}
                sx={{ color: themedata.sidebar_bg }}
              >
                {activeDateField === "fromDate"
                  ? "Select start date"
                  : activeDateField === "toDate"
                    ? "Select end date"
                    : "Select date"}
              </Typography>

              {/* <Box
                sx={{
                  border: `1px solid ${themedata.text_color}`,
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

              </Box> */}
              <Box
                sx={{
                  border: `1px solid ${themedata.text_color}`,
                  borderRadius: 4,
                  p: 1,
                  bgcolor: themedata.app_bg, // ✅ important
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar
                    value={
                      activeDateField === "toDate"
                        ? formData.toDate
                          ? dayjs(formData.toDate, "YYYY-MM-DD", true)
                          : null
                        : formData.fromDate
                          ? dayjs(formData.fromDate, "YYYY-MM-DD", true)
                          : null
                    }
                    onChange={(newValue) => {
                      if (!newValue || !activeDateField) return;
                      const formatted = newValue.format("YYYY-MM-DD");
                      setFormData((prev) => ({ ...prev, [activeDateField]: formatted }));
                    }}

                    // ✅ Style the internal parts using slots
                    slotProps={{
                      day: {
                        sx: {
                          color: themedata.text_color,

                          "&.Mui-selected": {
                            backgroundColor: themedata.primary_color, // white
                            color: themedata.app_bg, // black text
                          },

                          "&:hover": {
                            backgroundColor: "rgba(255,255,255,0.2)",
                          },

                          "&.MuiPickersDay-today": {
                            borderColor: themedata.primary_color,
                          },
                        },
                      },

                      calendarHeader: {
                        sx: {
                          "& .MuiPickersCalendarHeader-label": {
                            color: themedata.sidebar_bg,
                            fontWeight: 700,
                          },
                          "& .MuiIconButton-root": {
                            color: themedata.text_color,
                          },
                        },
                      },

                      leftArrowButton: { sx: { color: themedata.text_color } },
                      rightArrowButton: { sx: { color: themedata.text_color } },

                      // weekday labels (Sun, Mon...)
                      dayOfWeekLabel: {
                        sx: { color: themedata.text_color, fontWeight: 600 },
                      },
                    }}

                    // ✅ Background on the main wrapper
                    sx={{
                      bgcolor: themedata.app_bg,
                      borderRadius: 3,

                      // sometimes needed to force the layout bg
                      "& .MuiPickersLayout-root": {
                        backgroundColor: themedata.app_bg,
                      },
                      "& .MuiDayCalendar-root": {
                        backgroundColor: themedata.app_bg,
                      },
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
                  bgcolor: themedata.sidebar_bg,
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

                    // 🔹 Label
                    "& .MuiInputLabel-root": {
                      color: themedata.text_color,
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: themedata.primary_color,
                    },

                    // 🔹 Input text
                    "& .MuiOutlinedInput-input": {
                      color: themedata.text_color,
                    },

                    // 🔹 Chrome fix (important for date)
                    "& input": {
                      WebkitTextFillColor: themedata.text_color,
                    },

                    // 🔹 Default border
                    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                      borderColor: themedata.text_color,
                    },

                    // 🔹 Hover border
                    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: themedata.text_color,
                    },

                    // 🔹 Focus border
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: themedata.text_color,
                      borderWidth: 2,
                    },

                    // 🔹 Calendar icon color (VERY IMPORTANT for date inputs)
                    "& input[type='date']::-webkit-calendar-picker-indicator": {
                      filter: "invert(22%) sepia(89%) saturate(402%) hue-rotate(150deg)",
                      cursor: "pointer",
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

                    // 🔹 Label
                    "& .MuiInputLabel-root": {
                      color: themedata.text_color,
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: themedata.primary_color,
                    },

                    // 🔹 Input text
                    "& .MuiOutlinedInput-input": {
                      color: themedata.text_color,
                    },

                    // 🔹 Chrome fix (important for date)
                    "& input": {
                      WebkitTextFillColor: themedata.text_color,
                    },

                    // 🔹 Default border
                    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                      borderColor: themedata.text_color,
                    },

                    // 🔹 Hover border
                    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: themedata.text_color,
                    },

                    // 🔹 Focus border
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: themedata.text_color,
                      borderWidth: 2,
                    },

                    // 🔹 Calendar icon color (VERY IMPORTANT for date inputs)
                    "& input[type='date']::-webkit-calendar-picker-indicator": {
                      filter: "invert(22%) sepia(89%) saturate(402%) hue-rotate(150deg)",
                      cursor: "pointer",
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

                  // 🔹 Label
                  "& .MuiInputLabel-root": { color: themedata.text_color },
                  "& .MuiInputLabel-root.Mui-focused": { color: themedata.text_color },

                  // 🔹 Selected text
                  "& .MuiOutlinedInput-input": { color: themedata.text_color },


                  // 🔹 Border
                  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                    borderColor: themedata.text_color,
                  },
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: themedata.text_color,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: themedata.text_color,
                    borderWidth: 2,
                  },

                  // 🔹 Dropdown arrow icon
                  "& .MuiSvgIcon-root": {
                    color: themedata.text_color,
                  },
                }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        // dropdown background
                        bgcolor: themedata.app_bg,
                        // dropdown text color
                        color: themedata.text_color,

                        // menu item hover
                        "& .MuiMenuItem-root:hover": {
                          backgroundColor: themedata.app_bg,
                        },

                        // selected item
                        "& .MuiMenuItem-root.Mui-selected": {
                          backgroundColor: themedata.app_bg,
                        },
                        "& .MuiMenuItem-root.Mui-selected:hover": {
                          backgroundColor: themedata.app_bg,
                        },
                      },
                    },
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
                  // 🔹 Label
                  "& .MuiInputLabel-root": {
                    color: themedata.text_color,
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: themedata.text_color,
                  },

                  // 🔹 Textarea text (important for multiline)
                  "& textarea": {
                    color: themedata.text_color,
                  },

                  // 🔹 Default border
                  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                    borderColor: themedata.text_color,
                  },

                  // 🔹 Hover border
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: themedata.text_color,
                  },

                  // 🔹 Focus border
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: themedata.text_color,
                    borderWidth: 2,
                  },
                }}
              />


              <Box textAlign="center">
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{
                    bgcolor: themedata.primary_color,
                    color: themedata.text_color,
                    borderRadius: 20,
                    px: 4,
                    mt: 2,
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: themedata.sidebar_bg,
                    },
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