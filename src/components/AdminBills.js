import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  Typography,
} from "@mui/material";

import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";


import { DataGrid } from "@mui/x-data-grid";

const AdminBills = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patient, setPatient] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [openAddBill, setOpenAddBill] = useState(false);
  const [theme, setTheme] = useState({});

  const COLORS = {
    primary: "#1976d2",
    success: "#2e7d32",
    warning: "#ed6c02",
    error: "#d32f2f",
    grey: "#6b7280"
  };


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

  /* ================= FETCH COMPLETED APPOINTMENTS ================= */
  useEffect(() => {
    if (!openAddBill) return;

    axios
      .get(`${process.env.REACT_APP_URL}/api/plans`, {
        withCredentials: true,
      })
      .then((res) => {
        const completed = res.data.plans.filter(
          (a) => a.payment_status === "pending",
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
  }, [openAddBill]);

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
          plan_id: appointment.plan_id,
          subtotal: form.subtotal,
          tax: form.tax,
          total_amount: form.total_amount,
          notes: form.notes,
        },
        { withCredentials: true },
      );

      // 👇 REFRESH BILLS LIST

      setAlert({
        open: true,
        type: "success",
        message: "Bill created successfully",
      });

      setTimeout(setOpenAddBill(false), 1200);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 409) {
        setAlert({
          open: true,
          type: "error",
          message: "Bill already exists for this plan",
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

  // const billedAppointmentIds = new Set(bills.map((b) => b.plan_id));
  const appointmentOptions = appointments;

  console.log(appointmentOptions);

  const labelSx = {
    color: "#3f6f7a",
    mb: 0.8,
  };

  const fieldSx = {
    "& .MuiInputBase-root": {
      height: 35,
      paddingX: 0.3,
      border: `2px solid #3f6f7a`,
    },

    "& fieldset": {
      border: "none",
    },

    "& .MuiInputBase-root:hover": {
      borderColor: "#3f6f7a",
    },

    "& .MuiInputBase-root.Mui-focused": {
      borderColor: "#3f6f7a",
    },
  };

  const amountSx = {
    "& .MuiInputBase-root": {
      height: 35,
      width: 180,
      border: `2px solid #3f6f7a`,
    },

    "& fieldset": {
      border: "none",
    },

    "& .MuiInputBase-root:hover": {
      borderColor: "#3f6f7a",
    },

    "& .MuiInputBase-root.Mui-focused": {
      borderColor: "#3f6f7a",
    },
  };

  /* ---------------- FETCH ALL BILLS ---------------- */
  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_URL}/bill/bills`, {
        withCredentials: true,
      });

      const formatted = res.data.bills.map((b) => ({
        ...b,
        id: b.id,
        due_date: b.due_date
          ? new Date(b.due_date).toISOString().split("T")[0] // YYYY-MM-DD
          : null,
        created_at: new Date(b.created_at).toISOString().split("T")[0],
      }));

      setRows(formatted);
      // console.log("Fetched bills:", formatted);
    } catch (err) {
      console.error("Fetch bills error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  /* ---------------- VIEW BILL ---------------- */
  const handleView = async (billId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_URL}/bill/bills/${billId}`,
        { withCredentials: true }
      );
      setSelectedBill(res.data.bill);
      setOpen(true);
    } catch (err) {
      console.error("Fetch bill error", err);
    }
  };

  /* ---------------- UPDATE BILL ---------------- */
  const handleUpdate = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_URL}/bill/bills/${selectedBill.bill_id}`,
        selectedBill,
        { withCredentials: true }
      );

      setOpen(false);
      fetchBills();
    } catch (err) {
      console.error("Update bill error", err);
    }
  };

  /* ---------------- COLUMNS ---------------- */
  const columns = [
    { field: "bill_id", headerName: "Bill ID", flex: 0.6, minWidth: 80 },
    { field: "plan_id", headerName: "Plan ID", flex: 0.8, minWidth: 100 },
    { field: "client_name", headerName: "Client", flex: 1.2, minWidth: 140 },
    { field: "notes", headerName: "Notes", flex: 0.9, minWidth: 110 },
    { field: "total_amount", headerName: "Total", flex: 0.8, minWidth: 110 },
    { field: "bill_status", headerName: "Status", flex: 0.8, minWidth: 110 },
    { field: "created_at", headerName: "Created", flex: 1, minWidth: 130 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 140,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="contained"
          sx={{
            backgroundColor: theme.primary_color,
            textTransform: "none",
          }}
          onClick={() => handleView(params.row.bill_id)}
        >
          View / Edit
        </Button>
      ),
    },
  ];


  return (
    <Box p={2} mt={1}>
      {/* <Typography variant="h6" mb={2}>
        Bills
      </Typography> */}

      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto",
        }}
      >
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 text-end mb-3">
              <Button sx={{
                backgroundColor: theme.primary_color,
                textTransform: "none",
              }} variant="contained" onClick={() => setOpenAddBill(true)}>
                Add Bill
              </Button>
            </div>
          </div>
        </div>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.bill_id}
          initialState={{
            pagination: { paginationModel: { pageSize: 6, page: 0 } },
          }}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          columnBuffer={2}
          disableColumnResize
          sx={{
            // 🔹 Entire Grid Background
            backgroundColor: theme.app_bg,

            // 🔹 Header Background
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: theme.app_bg,
              color: theme.text_color,
              fontWeight: 600,
            },

            "& .MuiDataGrid-columnHeader": {
              backgroundColor: theme.sidebar_bg,
              color: theme.text_color,
            },

            // 🔹 Header Title Text
            "& .MuiDataGrid-columnHeaderTitle": {
              color: theme.text_color,
              fontWeight: 600,
            },

            // 🔹 Row Background
            "& .MuiDataGrid-row": {
              backgroundColor: theme.app_bg,
            },

            // 🔹 Cell Text Color
            "& .MuiDataGrid-cell": {
              color: theme.text_color,
            },

            // 🔹 Selected Row Color
            "& .MuiDataGrid-row.Mui-selected": {
              backgroundColor: theme.primary_color,
            },

            // 🔹 Hover Effect
            "& .MuiDataGrid-row:hover": {
              backgroundColor: theme.app_bg, // 20 for transparency
            },

            "& .MuiDataGrid-footerContainer": {
              backgroundColor: theme.app_bg,
              color: theme.text_color,
              borderTop: "none",
            },

            // 🔹 Pagination Root
            "& .MuiTablePagination-root": {
              color: theme.text_color,
            },
            "& .MuiTablePagination-actions .MuiIconButton-root.Mui-disabled": {
              color: `${theme.text_color}80`, // slightly transparent
            },
          }}
        />
      </Box>

      {/* ---------------- VIEW / EDIT DIALOG ---------------- */}
      <Dialog open={open} onClose={() => setOpen(false)} sx={{ borderRadius: "20px" }} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: theme.app_bg, color: theme.text_color, textAlign: "center" }}>Bill Details</DialogTitle>

        {selectedBill && (
          <DialogContent sx={{ backgroundColor: theme.app_bg, color: theme.text_color }}>
            <Grid container spacing={2} mt={1}>
              <Grid item size={4}>
                <TextField
                  label="Subtotal"
                  fullWidth
                  value={selectedBill.subtotal || ""}
                  onChange={(e) =>
                    setSelectedBill({
                      ...selectedBill,
                      subtotal: e.target.value,
                    })
                  }
                  sx={{
                    // 🔹 Input Text Color
                    "& .MuiInputBase-input": {
                      color: theme.text_color,
                    },

                    // 🔹 Label Color
                    "& .MuiInputLabel-root": {
                      color: theme.text_color,
                    },

                    // 🔹 Label When Focused
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: theme.text_color,
                    },

                    // Outline default
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // Outline hover
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // Outline focused
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },
                    minWidth: 180, borderRadius: 1
                  }}
                />
              </Grid>

              <Grid item size={4}>
                <TextField
                  label="Penalty"
                  fullWidth
                  value={selectedBill.penalty || ""}
                  onChange={(e) =>
                    setSelectedBill({
                      ...selectedBill,
                      penalty: e.target.value,
                    })
                  }
                  sx={{
                    // 🔹 Input Text Color
                    "& .MuiInputBase-input": {
                      color: theme.text_color,
                    },

                    // 🔹 Label Color
                    "& .MuiInputLabel-root": {
                      color: theme.text_color,
                    },

                    // 🔹 Label When Focused
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: theme.text_color,
                    },

                    // Outline default
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // Outline hover
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // Outline focused
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },
                    minWidth: 180, borderRadius: 1
                  }}
                />
              </Grid>

              <Grid item size={4}>
                <TextField
                  label="Tax"
                  fullWidth
                  value={selectedBill.tax || ""}
                  onChange={(e) =>
                    setSelectedBill({
                      ...selectedBill,
                      tax: e.target.value,
                    })
                  }
                  sx={{
                    // 🔹 Input Text Color
                    "& .MuiInputBase-input": {
                      color: theme.text_color,
                    },

                    // 🔹 Label Color
                    "& .MuiInputLabel-root": {
                      color: theme.text_color,
                    },

                    // 🔹 Label When Focused
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: theme.text_color,
                    },

                    // Outline default
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // Outline hover
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // Outline focused
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },
                    minWidth: 180, borderRadius: 1
                  }}
                />
              </Grid>

              <Grid item size={4}>
                <TextField
                  label="Total Amount"
                  fullWidth
                  value={selectedBill.total_amount || ""}
                  onChange={(e) =>
                    setSelectedBill({
                      ...selectedBill,
                      total_amount: e.target.value,
                    })
                  }
                  sx={{
                    // 🔹 Input Text Color
                    "& .MuiInputBase-input": {
                      color: theme.text_color,
                    },

                    // 🔹 Label Color
                    "& .MuiInputLabel-root": {
                      color: theme.text_color,
                    },

                    // 🔹 Label When Focused
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: theme.text_color,
                    },

                    // Outline default
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // Outline hover
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // Outline focused
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },
                    minWidth: 180, borderRadius: 1
                  }}
                />
              </Grid>

              <Grid item size={4}>
                <TextField
                  select
                  label="Bill Status"
                  fullWidth
                  value={selectedBill.bill_status}
                  onChange={(e) =>
                    setSelectedBill({
                      ...selectedBill,
                      bill_status: e.target.value,
                    })
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

                    // 🔹 Default Border
                    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // 🔹 Hover Border
                    "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.primary_color,
                    },

                    // 🔹 Focused Border
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.primary_color,
                      borderWidth: "2px",
                    },

                    // 🔹 Dropdown arrow icon
                    "& .MuiSvgIcon-root": {
                      color: theme.text_color,
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: theme.app_bg,
                        color: theme.text_color,

                        // Selected item
                        "& .MuiMenuItem-root.Mui-selected": {
                          backgroundColor: theme.primary_color,
                          color: "#fff",
                        },

                        // Hover item
                        "& .MuiMenuItem-root:hover": {
                          backgroundColor: theme.primary_color + "20",
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>

              <Grid item size={4}>
                {/* <TextField
                  type="date"
                  label="Due Date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  value={
                    selectedBill.due_date
                      ? dayjs(selectedBill.due_date).format("YYYY-MM-DD")
                      : ""
                  }
                  onChange={(e) =>
                    setSelectedBill({
                      ...selectedBill,
                      due_date: e.target.value,
                    })
                  }
                /> */}
              </Grid>

              <Grid item size={8}>
                <TextField
                  label="Notes"
                  fullWidth
                  multiline
                  rows={3}
                  value={selectedBill.notes || ""}
                  onChange={(e) =>
                    setSelectedBill({
                      ...selectedBill,
                      notes: e.target.value,
                    })
                  }
                  sx={{
                    // 🔹 Input Text Color
                    "& .MuiInputBase-input": {
                      color: theme.text_color,
                    },

                    // 🔹 Label Color
                    "& .MuiInputLabel-root": {
                      color: theme.text_color,
                    },

                    // 🔹 Label When Focused
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: theme.text_color,
                    },

                    // Outline default
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // Outline hover
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // Outline focused
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },
                    minWidth: 180, borderRadius: 1
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
        )}

        <DialogActions sx={{ backgroundColor: theme.app_bg, color: theme.text_color }}>
          <Button sx={{ color: theme.text_color }} onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" sx={{ backgroundColor: theme.primary_color, color: theme.text_color }} onClick={handleUpdate}>
            Update Bill
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openAddBill}
        onClose={() => setOpenAddBill(false)}
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
            backgroundColor: theme.app_bg,
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: 18,
              color: theme.text_color,
              textAlign: "center",
            }}
          >
            Add Bill
          </Typography>
          <IconButton onClick={() => setOpenAddBill(false)} sx={{ color: theme.primary_color }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* CONTENT */}
        <DialogContent
          sx={{
            px: 4,
            py: 1,
            backgroundColor: theme.app_bg,
          }}
        >
          <Stack spacing={1.5}>
            {/* PATIENT */}
            {/* <Box>
              <Typography sx={labelSx}>Client</Typography>
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
            </Box> */}

            {/* APPOINTMENT */}
            <Box>
              <Typography sx={{ color: theme.text_color }}>Plan ID</Typography>
              <Autocomplete
                fullWidth
                options={appointments}
                getOptionLabel={(o) =>
                  `Plan ID ${o.plan_id} — (${o.client_name})`
                }
                value={appointment}
                onChange={(e, v) => setAppointment(v)}
                sx={{
                  // 🔹 Input text
                  "& .MuiOutlinedInput-input": {
                    color: theme.text_color,
                  },

                  // 🔹 Placeholder
                  "& .MuiInputBase-input::placeholder": {
                    color: theme.text_color,
                    opacity: 0.7,
                  },

                  // 🔹 Label
                  "& .MuiInputLabel-root": {
                    color: theme.text_color,
                  },

                  "& .MuiInputLabel-root.Mui-focused": {
                    color: theme.primary_color,
                  },

                  // 🔹 Border default
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.text_color,
                  },

                  // 🔹 Border hover
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.primary_color,
                  },

                  // 🔹 Border focused
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.primary_color,
                    borderWidth: "2px",
                  },

                  // 🔹 Dropdown arrow icon
                  "& .MuiSvgIcon-root": {
                    color: theme.text_color,
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Select Plan"
                  />
                )}
                slotProps={{
                  paper: {
                    sx: {
                      backgroundColor: theme.app_bg,
                      color: theme.text_color,

                      // Selected option
                      "& .MuiAutocomplete-option[aria-selected='true']": {
                        backgroundColor: theme.primary_color,
                        color: theme.text_color,
                      },

                      // Hover option
                      "& .MuiAutocomplete-option:hover": {
                        backgroundColor: theme.primary_color + "20",
                      },
                    },
                  },
                }}
              />

            </Box>

            {/* DOCTOR */}
            <Box>
              <Typography sx={{ color: theme.text_color }}>Trainer Name</Typography>
              <TextField
                value={appointment?.trainer_name || ""}
                fullWidth
                disabled
                placeholder="Trainer"
                sx={{
                  // 🔹 Input Text Color (disabled)
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: theme.text_color, // Important for disabled text
                  },

                  // 🔹 Disabled Border Fix
                  "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.text_color,
                  },

                  // 🔹 Optional: Slight opacity adjustment
                  "& .MuiOutlinedInput-root.Mui-disabled": {
                    opacity: 1, // prevents faded look
                  },

                  minWidth: 180,
                  borderRadius: 1,
                }}
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
                <Typography sx={{ color: theme.text_color }}>Sub Total</Typography>
                <TextField
                  value={form.subtotal}
                  type="number"
                  onChange={(e) =>
                    setForm({ ...form, subtotal: e.target.value })
                  }
                  fullWidth
                  placeholder="Enter amount"
                  sx={{
                    // 🔹 Input Text Color
                    "& .MuiInputBase-input": {
                      color: theme.text_color,
                    },

                    // 🔹 Label Color
                    "& .MuiInputLabel-root": {
                      color: theme.text_color,
                    },

                    // 🔹 Label When Focused
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: theme.text_color,
                    },

                    // Outline default
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // Outline hover
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // Outline focused
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },
                    minWidth: 180, borderRadius: 1
                  }}
                />
              </Box>

              {/* TAX */}
              <Box>
                <Typography sx={{ color: theme.text_color }}>Tax Amount</Typography>
                <TextField
                  type="number"
                  value={form.tax}
                  onChange={(e) => setForm({ ...form, tax: e.target.value })}
                  fullWidth
                  placeholder="Enter tax amount"
                  sx={{
                    // 🔹 Input Text Color
                    "& .MuiInputBase-input": {
                      color: theme.text_color,
                    },

                    // 🔹 Label Color
                    "& .MuiInputLabel-root": {
                      color: theme.text_color,
                    },

                    // 🔹 Label When Focused
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: theme.text_color,
                    },

                    // Outline default
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // Outline hover
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },

                    // Outline focused
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.text_color,
                    },
                    minWidth: 180, borderRadius: 1
                  }}
                />
              </Box>
            </Box>

            {/* TOTAL */}
            <Box>
              <Typography sx={{ color: theme.text_color }}>Total Amount</Typography>
              <TextField
                value={form.total_amount}
                fullWidth
                disabled
                placeholder="Total"
                sx={{
                  // 🔹 Input Text Color (disabled)
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: theme.text_color, // Important for disabled text
                  },

                  // 🔹 Disabled Border Fix
                  "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.text_color,
                  },

                  // 🔹 Optional: Slight opacity adjustment
                  "& .MuiOutlinedInput-root.Mui-disabled": {
                    opacity: 1, // prevents faded look
                  },

                  minWidth: 180,
                  borderRadius: 1,
                }}
              />
            </Box>

            {/* NOTES */}
            <Box>
              <Typography sx={{ color: theme.text_color }}>Notes</Typography>
              <TextField
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                fullWidth
                multiline
                rows={3}
                placeholder="Additional notes"
                sx={{
                  // 🔹 Input Text Color
                  "& .MuiInputBase-input": {
                    color: theme.text_color,
                  },

                  // 🔹 Label Color
                  "& .MuiInputLabel-root": {
                    color: theme.text_color,
                  },

                  // 🔹 Label When Focused
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: theme.text_color,
                  },

                  // Outline default
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.text_color,
                  },

                  // Outline hover
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.text_color,
                  },

                  // Outline focused
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.text_color,
                  },
                  minWidth: 180, borderRadius: 1
                }}
              />
            </Box>

            {/* SUBMIT */}
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                sx={{
                  bgcolor: theme.primary_color,
                  color: theme.text_color,
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
    </Box>
  );
};

export default AdminBills;
