import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Typography,
  Pagination,
  useMediaQuery,
  Tooltip,
  IconButton,
  colors,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { COLORS } from "./Themes";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LaunchIcon from "@mui/icons-material/Launch";
import AppointmentDetailsModal from "./AppointmentViewModal";

const Bills = () => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [selectedBill, setSelectedBill] = useState(null);

  const [openAppointment, setOpenAppointment] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [theme, setTheme] = useState({});
  const [loading, setLoading] = useState(true);

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

  const handleOpenAppointment = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setOpenAppointment(true);
  };

  // ---------------- FETCH ----------------
  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_URL}/bill/bills`, {
        withCredentials: true,
      });

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data?.bills)
            ? res.data.bills
            : [];

      setBills(list);
      console.log(list);
    } catch (err) {
      console.error("Fetch bills error:", err.response || err);
      setBills([]);
    }
  };

  // ---------------- PAGINATION ----------------
  const totalPages = Math.ceil((filteredBills?.length || 0) / rowsPerPage);

  const paginatedBills = filteredBills.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleDownload = async (id) => {
    try {
      if (!id) {
        alert("Invalid invoice ID");
        return;
      }

      const res = await axios.get(
        `${process.env.REACT_APP_URL}/api/invoices/${id}/download`,
        {
          withCredentials: true, // ✅ send auth cookie
          responseType: "blob", // ✅ receive PDF
        }
      );

      // ✅ Create downloadable file
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${id}.pdf`;
      document.body.appendChild(a);
      a.click();

      // cleanup
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Invoice download failed:", error);
      alert("Failed to download invoice");
    }
  };

  // Column background helper
  const colBg = (index) => ({
    backgroundColor:
      index % 2 === 0 ? `${COLORS.activeBg}` : `${COLORS.texWhite}`,
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return COLORS.success; // green
      case "pending":
        return COLORS.warning; // orange
      case "overdue":
        return COLORS.danger; // red
      case "cancelled":
        return COLORS.textGray; // default
      default:
        return; // red
    }
  };

  // ---------------- FILTER ----------------

  const [filters, setFilters] = useState({
    billId: "",
    appointmentId: "",
    status: "",
    date: "",
  });

  useEffect(() => {
    let data = [...bills];

    if (filters.billId) {
      data = data.filter((b) => String(b.bill_id).includes(filters.billId));
    }

    if (filters.appointmentId) {
      data = data.filter((b) =>
        String(b.appointment_id).includes(filters.appointmentId)
      );
    }

    if (filters.status) {
      data = data.filter((b) => b.bill_status === filters.status);
    }

    if (filters.date) {
      data = data.filter(
        (b) => dayjs(b.created_at).format("YYYY-MM-DD") === filters.date
      );
    } else {
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredBills(data);

    // ✅ prevent cursor jump
  }, [filters, bills]);

  const inputSx = {
    "& .MuiInputBase-root": {
      height: 40,
      fontSize: "12px",
    },
    "& .MuiInputLabel-root": {
      fontSize: "11px",
    },
  };

  const handleReset = () => {
    setFilters({
      billId: "",
      appointmentId: "",
      status: "",
      date: "",
    });
    setFilteredBills(bills);
    setPage(1);
  };

  return (
    <Box
      px={{ xs: 1, md: 1 }}
      sx={{
        pt: 2.8,
      }}
    >
      {/* Heading */}
      <Box
        sx={{
          bgcolor: theme.sidebar_bg,
          color: theme.text_color,
          fontSize: { xs: "14px", md: "24px" },
          px: 1,
          py: 1,
          my: 1,
          width: { xs: "50%", md: "30%" },
          borderTopRightRadius: 60,
          fontWeight: 600,
        }}
      >
        View Your Bills
      </Box>
      {/* ================= FILTER BAR (UNCHANGED) ================= */}
      {isMobile ? (
        /* ================= FILTER BAR Mobile ================= */

        <Box sx={{ width: "100%", my: 1 }}>
          {/* ROW 1: Bill ID + Appointment ID */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
              mb: 1,
            }}
          >
            <TextField
              size="small"
              variant="outlined"
              fullWidth
              label="Bill ID"
              value={filters.billId}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, billId: e.target.value }))
              }
              sx={{
                // 🔹 Input text color
                "& .MuiOutlinedInput-input": {
                  color: theme.text_color,
                },

                // 🔹 Label color
                "& .MuiInputLabel-root": {
                  color: theme.text_color,
                },

                // 🔹 Label when focused
                "& .MuiInputLabel-root.Mui-focused": {
                  color: theme.primary_color,
                },

                // 🔹 Default border
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },

                // 🔹 Hover border
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.primary_color,
                },

                // 🔹 Focused border
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.primary_color,
                  borderWidth: "2px",
                },

                // 🔹 Optional background (if using dark theme)
                "& .MuiOutlinedInput-root": {
                  backgroundColor: theme.app_bg,
                },

                // 🔹 Fix Chrome grey text issue
                "& .MuiInputBase-input": {
                  WebkitTextFillColor: theme.text_color,
                },
              }}
            />


            <TextField
              size="small"
              fullWidth
              label="Appointment ID"
              value={filters.appointmentId}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  appointmentId: e.target.value,
                }))
              }
              sx={{
              // 🔹 Input text color
              "& .MuiOutlinedInput-input": {
                color: theme.text_color,
              },

              // 🔹 Label color
              "& .MuiInputLabel-root": {
                color: theme.text_color,
              },

              // 🔹 Label when focused
              "& .MuiInputLabel-root.Mui-focused": {
                color: theme.primary_color,
              },

              // 🔹 Default border
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.text_color,
              },

              // 🔹 Hover border
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.primary_color,
              },

              // 🔹 Focused border
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.primary_color,
                borderWidth: "2px",
              },

              // 🔹 Optional background (if using dark theme)
              "& .MuiOutlinedInput-root": {
                backgroundColor: theme.app_bg,
              },

              // 🔹 Fix Chrome grey text issue
              "& .MuiInputBase-input": {
                WebkitTextFillColor: theme.text_color,
              },
            }}
            />
          </Box>

          {/* ROW 2: Date (full width) */}
          <Box sx={{ mb: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Bill Date"
                value={filters.date ? dayjs(filters.date) : null}
                onChange={(v) =>
                  setFilters((prev) => ({
                    ...prev,
                    date: v ? v.format("YYYY-MM-DD") : "",
                  }))
                }
                slotProps={{
                textField: {
                  size: "small",
                  variant: "outlined",
                  sx: {
                    width: 200,

                    // 🔹 Input text color
                    "& .MuiOutlinedInput-input": {
                      color: theme.text_color,
                    },

                    // 🔹 Placeholder / typed value (Chrome fix)
                    "& .MuiInputBase-input": {
                      WebkitTextFillColor: theme.text_color,
                    },

                    // 🔹 Label color
                    "& .MuiInputLabel-root": {
                      color: theme.text_color,
                    },

                    // 🔹 Label when focused
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: theme.primary_color,
                    },

                    // 🔹 Default border
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // 🔹 Hover border
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.primary_color,
                    },

                    // 🔹 Focus border
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.primary_color,
                      borderWidth: "2px",
                    },

                    // 🔹 Calendar icon color
                    "& .MuiSvgIcon-root": {
                      color: theme.text_color,
                    },

                    // 🔹 Background (optional for dark UI)
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: theme.app_bg,
                    },
                  },
                },
                popper: {
                  sx: {
                    // Popup paper
                    "& .MuiPaper-root": {
                      backgroundColor: theme.app_bg,
                      color: theme.text_color,
                    },

                    // Day labels / days
                    "& .MuiPickersDay-root": {
                      color: theme.text_color,
                    },

                    // Selected day
                    "& .MuiPickersDay-root.Mui-selected": {
                      backgroundColor: theme.primary_color,
                      color: theme.text_color,
                    },

                    // Hover day
                    "& .MuiPickersDay-root:hover": {
                      backgroundColor: theme.primary_color + "20",
                    },

                    // Header (month / year)
                    "& .MuiPickersCalendarHeader-label": {
                      color: theme.text_color,
                    },

                    // Arrows
                    "& .MuiIconButton-root": {
                      color: theme.text_color,
                    },
                  },
                },
              }}
              />
            </LocalizationProvider>
          </Box>

          {/* ROW 3: Status + Reset */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
            }}
          >
            <TextField
              size="small"
              select
              fullWidth
              label="Status"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              sx={{
              width: 200,

              // 🔹 Input text
              "& .MuiOutlinedInput-input": {
                color: theme.text_color,
              },

              // 🔹 Label
              "& .MuiInputLabel-root": {
                color: theme.text_color,
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: theme.primary_color,
              },

              // 🔹 Default border
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.text_color,
              },

              // 🔹 Hover border
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.primary_color,
              },

              // 🔹 Focus border
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.primary_color,
                borderWidth: "2px",
              },

              // 🔹 Dropdown arrow icon
              "& .MuiSvgIcon-root": {
                color: theme.text_color,
              },

              // 🔹 Background (optional if dark theme)
              "& .MuiOutlinedInput-root": {
                backgroundColor: theme.app_bg,
              },

              // 🔹 Chrome fix
              "& .MuiInputBase-input": {
                WebkitTextFillColor: theme.text_color,
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: theme.app_bg,
                  color: theme.text_color,

                  // 🔹 Selected item
                  "& .MuiMenuItem-root.Mui-selected": {
                    backgroundColor: theme.primary_color,
                    color: theme.text_color,
                  },

                  // 🔹 Hover item
                  "& .MuiMenuItem-root:hover": {
                    backgroundColor: theme.primary_color + "20",
                  },
                },
              },
            }}
            >
              <MenuItem value="">All</MenuItem>
              {[...new Set(bills.map((b) => b.bill_status))].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>

            <Button
              fullWidth
              sx={{
                height: 40,
                fontSize: "12px",
                textTransform: "capitalize",
                bgcolor: theme.primary_color,
                color: theme.text_color,
                "&:hover": { bgcolor: theme.primary_color },
              }}
              onClick={handleReset}
            >
              Reset
            </Button>
          </Box>
        </Box>
      ) : (
        /* ================= FILTER BAR Desktop ================= */

        <Box
          sx={{
            width: "100%",
            display: "flex",
            gap: 2,
            my: 2,
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            variant="outlined"
            label="Bill ID"
            value={filters.billId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, billId: e.target.value }))
            }
            sx={{
              // 🔹 Input text color
              "& .MuiOutlinedInput-input": {
                color: theme.text_color,
              },

              // 🔹 Label color
              "& .MuiInputLabel-root": {
                color: theme.text_color,
              },

              // 🔹 Label when focused
              "& .MuiInputLabel-root.Mui-focused": {
                color: theme.primary_color,
              },

              // 🔹 Default border
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.text_color,
              },

              // 🔹 Hover border
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.primary_color,
              },

              // 🔹 Focused border
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.primary_color,
                borderWidth: "2px",
              },

              // 🔹 Optional background (if using dark theme)
              "& .MuiOutlinedInput-root": {
                backgroundColor: theme.app_bg,
              },

              // 🔹 Fix Chrome grey text issue
              "& .MuiInputBase-input": {
                WebkitTextFillColor: theme.text_color,
              },
            }}
          />

          <TextField
            size="small"
            label="Appointment ID"
            value={filters.appointmentId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, appointmentId: e.target.value }))
            }
            sx={{
              width: 200,
              // 🔹 Input text color
              "& .MuiOutlinedInput-input": {
                color: theme.text_color,
              },

              // 🔹 Label color
              "& .MuiInputLabel-root": {
                color: theme.text_color,
              },

              // 🔹 Label when focused
              "& .MuiInputLabel-root.Mui-focused": {
                color: theme.primary_color,
              },

              // 🔹 Default border
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.text_color,
              },

              // 🔹 Hover border
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.primary_color,
              },

              // 🔹 Focused border
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.primary_color,
                borderWidth: "2px",
              },

              // 🔹 Optional background (if using dark theme)
              "& .MuiOutlinedInput-root": {
                backgroundColor: theme.app_bg,
              },

              // 🔹 Fix Chrome grey text issue
              "& .MuiInputBase-input": {
                WebkitTextFillColor: theme.text_color,
              },
            }}
          />

          <TextField
            size="small"
            select
            variant="outlined"
            label="Status"
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            sx={{
              width: 200,

              // 🔹 Input text
              "& .MuiOutlinedInput-input": {
                color: theme.text_color,
              },

              // 🔹 Label
              "& .MuiInputLabel-root": {
                color: theme.text_color,
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: theme.primary_color,
              },

              // 🔹 Default border
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.text_color,
              },

              // 🔹 Hover border
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.primary_color,
              },

              // 🔹 Focus border
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.primary_color,
                borderWidth: "2px",
              },

              // 🔹 Dropdown arrow icon
              "& .MuiSvgIcon-root": {
                color: theme.text_color,
              },

              // 🔹 Background (optional if dark theme)
              "& .MuiOutlinedInput-root": {
                backgroundColor: theme.app_bg,
              },

              // 🔹 Chrome fix
              "& .MuiInputBase-input": {
                WebkitTextFillColor: theme.text_color,
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: theme.app_bg,
                  color: theme.text_color,

                  // 🔹 Selected item
                  "& .MuiMenuItem-root.Mui-selected": {
                    backgroundColor: theme.primary_color,
                    color: theme.text_color,
                  },

                  // 🔹 Hover item
                  "& .MuiMenuItem-root:hover": {
                    backgroundColor: theme.primary_color + "20",
                  },
                },
              },
            }}
          >
            <MenuItem value="">All</MenuItem>
            {[...new Set(bills.map((b) => b.bill_status))].map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>


          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Bill Date"
              value={filters.date ? dayjs(filters.date) : null}
              onChange={(v) =>
                setFilters((prev) => ({
                  ...prev,
                  date: v ? v.format("YYYY-MM-DD") : "",
                }))
              }
              slotProps={{
                textField: {
                  size: "small",
                  variant: "outlined",
                  sx: {
                    width: 200,

                    // 🔹 Input text color
                    "& .MuiOutlinedInput-input": {
                      color: theme.text_color,
                    },

                    // 🔹 Placeholder / typed value (Chrome fix)
                    "& .MuiInputBase-input": {
                      WebkitTextFillColor: theme.text_color,
                    },

                    // 🔹 Label color
                    "& .MuiInputLabel-root": {
                      color: theme.text_color,
                    },

                    // 🔹 Label when focused
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: theme.primary_color,
                    },

                    // 🔹 Default border
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // 🔹 Hover border
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.primary_color,
                    },

                    // 🔹 Focus border
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.primary_color,
                      borderWidth: "2px",
                    },

                    // 🔹 Calendar icon color
                    "& .MuiSvgIcon-root": {
                      color: theme.text_color,
                    },

                    // 🔹 Background (optional for dark UI)
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: theme.app_bg,
                    },
                  },
                },
                popper: {
                  sx: {
                    // Popup paper
                    "& .MuiPaper-root": {
                      backgroundColor: theme.app_bg,
                      color: theme.text_color,
                    },

                    // Day labels / days
                    "& .MuiPickersDay-root": {
                      color: theme.text_color,
                    },

                    // Selected day
                    "& .MuiPickersDay-root.Mui-selected": {
                      backgroundColor: theme.primary_color,
                      color: theme.text_color,
                    },

                    // Hover day
                    "& .MuiPickersDay-root:hover": {
                      backgroundColor: theme.primary_color + "20",
                    },

                    // Header (month / year)
                    "& .MuiPickersCalendarHeader-label": {
                      color: theme.text_color,
                    },

                    // Arrows
                    "& .MuiIconButton-root": {
                      color: theme.text_color,
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>


          <Button
            variant="outlined"
            sx={{
              height: 40,
              minWidth: 120,
              textTransform: "capitalize",
              fontSize: "18px",
              bgcolor: theme.primary_color,
              color: theme.text_color,
              "&:hover": {
                bgcolor: theme.primary_color,
              },
            }}
            onClick={handleReset}
          >
            Reset
          </Button>
        </Box>
      )}

      {/* ================= TABLE ================= */}
      {!isMobile && (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            overflowY: "auto", // enable vertical scroll
            maxHeight: 380, // adjust height as needed

            /* ===== Scrollbar Styling ===== */
            scrollbarColor: theme.primary_color,

            "&::-webkit-scrollbar": {
              width: 8, // Chrome / Edge / Safari
              backgroundColor: theme.primary_color,
            },
            "&::-webkit-scrollbar-track": {
              borderRadius: 10,
              backgroundColor: theme.sidebar_bg,
            },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: 10,
              backgroundColor: theme.primary_color,
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: theme.primary_color,
            },
          }}
        >
          <Table stickyHeader sx={{ tableLayout: "fixed" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.sidebar_bg }}>
                <TableCell
                  align="center"
                  sx={{
                    color: theme.text_color,
                    bgcolor: theme.sidebar_bg,
                    fontWeight: 600,
                  }}
                >
                  ID
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    color: theme.text_color,
                    bgcolor: theme.sidebar_bg,
                    fontWeight: 600,
                  }}
                >
                  Plan ID
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    color: theme.text_color,
                    bgcolor: theme.sidebar_bg,
                    fontWeight: 600,
                    width: 250,
                    maxWidth: 250,
                  }}
                >
                  Notes
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    color: theme.text_color,
                    bgcolor: theme.sidebar_bg,
                    fontWeight: 600,
                  }}
                >
                  Status
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    color: theme.text_color,
                    bgcolor: theme.sidebar_bg,
                    fontWeight: 600,
                  }}
                >
                  Total Amount
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    color: theme.text_color,
                    bgcolor: theme.sidebar_bg,
                    fontWeight: 600,
                  }}
                >
                  Created Date
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    color: theme.text_color,
                    bgcolor: theme.sidebar_bg,
                    fontWeight: 600,
                  }}
                >
                  Download
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedBills.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography fontWeight={600} sx={{color:theme.text_color}}>
                      No bills Found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {paginatedBills.map((b) => (
                <TableRow
                  key={b.id}
                  sx={{
                    "& td": {
                      borderBottom: `1px dotted ${theme.text_color}`,
                      fontSize: 13,
                      py: 1,
                    },
                  }}
                >
                  <TableCell align="center" sx={{backgroundColor:theme.app_bg,color:theme.text_color,fontWeight:500}}>
                    {" "}
                    ID: {b.bill_id}
                  </TableCell>
                  <TableCell align="center" sx={{backgroundColor:theme.app_bg,color:theme.text_color,fontWeight:500}}>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      sx={{ cursor: "pointer", justifyContent: "center" }}
                      onClick={() => handleOpenAppointment(b.plan_id)}
                    >
                      <Typography
                        sx={{backgroundColor:theme.app_bg,color:theme.text_color,fontWeight:500}}
                      >
                        Plan ID - {b.plan_id}
                      </Typography>

                      <OpenInNewIcon
                        sx={{backgroundColor:theme.app_bg,color:theme.text_color,fontSize:16}}
                      />
                    </Stack>
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{backgroundColor:theme.app_bg,color:theme.text_color,fontWeight:500, width: 250,
                      maxWidth: 350,}}
                  >
                    {b.notes}
                  </TableCell>

                  <TableCell align="center" sx={{backgroundColor:theme.app_bg,color:theme.text_color,fontWeight:500}}>
                    <Chip
                      label={b.bill_status}
                      size="small"
                      sx={{
                        background: getStatusColor(b.bill_status),
                        color: theme.text_color,
                        fontSize: 11,
                      }}
                    />
                  </TableCell>

                  <TableCell align="center" sx={{backgroundColor:theme.app_bg,color:theme.text_color,fontWeight:500}}>
                    {b.total_amount}
                  </TableCell>

                  <TableCell align="center" sx={{backgroundColor:theme.app_bg,color:theme.text_color,fontWeight:500}}>
                    {dayjs(b.created_at).format("DD/MM/YYYY")}
                  </TableCell>

                  <TableCell align="center" sx={{backgroundColor:theme.app_bg,color:theme.text_color,fontWeight:500}}>
                    <IconButton
                      size="small"
                      sx={{
                        background: theme.primary_color,
                        color: theme.text_color,
                        "&:hover": { background: "#0B5F5F" },
                      }}
                      onClick={() => handleDownload(b.bill_id)}
                    >
                      <DownloadForOfflineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* ================= MOBILE VIEW ================= */}
      {isMobile && paginatedBills.length === 0 && (
        <Paper sx={{ p: 2, mt: 2, textAlign: "center" }}>
          <Typography fontWeight={600} sx={{color:theme.text_color}}>
            No bills Found
          </Typography>
        </Paper>
      )}
      {/* ================= MOBILE VIEW (SCROLLABLE) ================= */}

      {isMobile && (
        <Box
          sx={{
            mt: 2,
            maxHeight: 440, // 👈 SAME IDEA AS DESKTOP
            overflowY: "auto", // 👈 ENABLE SCROLL
            borderRadius: 2,
          }}
        >
          {paginatedBills.length === 0 && (
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography fontWeight={600} sx={{color:theme.text_color}}>
                No bills Found
              </Typography>
            </Paper>
          )}

          {paginatedBills.map((b, index) => {
            const bgColor = index % 2 === 0 ? theme.app_bg : theme.sidebar_bg; // 👈 ALTERNATE BACKGROUND

            return (
              <Paper
                key={b.id}
                sx={{
                  p: 2,
                  backgroundColor: theme.sidebar_bg, // 👈 alternating bg
                }}
              >
                <Stack spacing={1}>
                  <Typography fontWeight={600} sx={{color:theme.text_color}}>ID - {b.bill_id}</Typography>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Tooltip title="View appointment details">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        onClick={() => handleOpenAppointment(b.plan_id)}
                        sx={{
                          cursor: "pointer",
                          color: theme.text_color,
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        <Typography fontWeight={600} sx={{color:theme.text_color}}>
                          App ID - {b.plan_id}
                        </Typography>
                        <LaunchIcon sx={{ fontSize: 16 }} />
                      </Stack>
                    </Tooltip>

                    <Chip
                      label={b.bill_status}
                      size="small"
                      sx={{
                        background: getStatusColor(b.bill_status),
                        color: theme.text_color,
                      }}
                    />
                  </Box>

                  <Typography sx={{color:theme.text_color}}>Total : {b.total_amount}₹</Typography>
                  <Typography sx={{color:theme.text_color}}>Note : {b.notes}</Typography>
                  <Typography sx={{color:theme.text_color}}>
                    Date : {dayjs(b.created_at).format("DD/MM/YYYY")}
                  </Typography>

                  <Button
                    size="small"
                    startIcon={<DownloadForOfflineIcon />}
                    onClick={() => handleDownload(b.id)}
                    sx={{color:theme.text_color}}
                  >
                    Download
                  </Button>
                </Stack>
              </Paper>
            );
          })}
        </Box>
      )}

      {totalPages > 1 && (
        <Box
          display="flex"
          justifyContent="center"
          sx={{
            my: { xs: 1, md: 2 },
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, v) => setPage(v)}
          />
        </Box>
      )}
      <AppointmentDetailsModal
        open={openAppointment}
        appointmentId={selectedAppointmentId}
        onClose={() => setOpenAppointment(false)}
      />
    </Box>
  );
};

export default Bills;
