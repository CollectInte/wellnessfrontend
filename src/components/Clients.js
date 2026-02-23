import Button from "@mui/material/Button";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { DataGrid } from "@mui/x-data-grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// const style = {
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: 600,
//   bgcolor: "background.paper",
//   border: "0px solid #000",
//   borderRadius: "20px",
//   boxShadow: 24,
//   p: 4,
// };
// const style = {
//   position: 'absolute',
//   top: '50%',
//   left: '50%',
//   transform: 'translate(-50%, -50%)',
//   width: '90vw',  // Responsive width: 90% viewport on small screens
//   maxWidth: '700px',  // Cap width on large screens
//   maxHeight: '90vh',
//   overflowY: 'auto',
//   bgcolor: 'background.paper',
//   boxShadow: 24,
//   p: 4,
//   borderRadius: 2,
// };

const Clients = () => {
  const [employees, setEmployees] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = React.useState(false);
  const [singleopen, setSingleopen] = React.useState(false);
  const [theme, setTheme] = useState({});
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    // users table
    email: "",
    password: "",

    // clients table
    name: "",
    age: "",
    mobile: "",
    gender: "",

    height_cm: "",
    joining_date: "",

    goal: "",             // "fat_loss" | "muscle_gain" | "maintenance"
    program_type: "",     // whatever you store: "3_days" | "5_days" or "basic" etc.

    plan_start_date: "",
    plan_end_date: "",

    weight_at_joining: "",
    current_weight: "",

    status: "active"      // because your backend uses status ?? "active"
  });

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedEmployee((prev) => ({
      ...prev,
      [name]: name === "status" ? Number(value) : value,
    }));
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleeditOpen = () => setSingleopen(true);
  const handleeditClose = () => setSingleopen(false);

  const formatDate = (date) => (date ? date.split("T")[0] : "");

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 90,
      renderCell: (params) => (
        <Button
          variant="text"
          size="small"
          sx={{ textTransform: "none" }}
          onClick={() => handleIdClick(params.value)}
        >
          {params.row.id}
        </Button>
      ),
    },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "joining_date", headerName: "Date of Joining", flex: 1 },
    { field: "mobile", headerName: "Mobile", width: 140 },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <span
          style={{
            color: params.value === "active" ? "green" : "red",
            fontWeight: 600,
          }}
        >
          {params.value}
        </span>
      ),
    },
    { field: "goal", headerName: "Goal", width: 140 },
    {
      field: "actions",
      headerName: "Action",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  const filteredRows = employees.filter((row) =>
    Object.values(row).join(" ").toLowerCase().includes(search.toLowerCase())
  );

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

  // Adding the Employee
  const submitEmployee = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_CLIENT_CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit");
      }
      setFormData("");
      Employeedetails();
      handleClose();
      // console.log("Employee created:", result);
      alert("Client added successfully!");
    } catch (error) {
      console.error("Error:", error.message);
      alert(error.message);
    }
  };

  // Adding the Employee

  const Employeedetails = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_CLIENT_FETCH, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch employee details");
      }

      const data = await response.json();
      // console.log("Employee details:", data);
      setEmployees(data.data);
      return data; // return if needed
    } catch (error) {
      console.error("Error fetching employees:", error.message);
    }
  };

  const fetchBusinessTypes = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BUSINESSDETAILS_FETCH,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const result = await response.json();
      setBusinessTypes(result.data || []);
    } catch (error) {
      console.error("Failed to fetch business types", error);
    }
  };

  useEffect(() => {
    Employeedetails();
    fetchBusinessTypes();
  }, []);

  // Deleting the Employee
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_URL}/api/client/delete/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }

      // 🔴 Remove row from state
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };
  // Deleting the Employee

  // Editing the Employee
  const handleIdClick = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SINGLECLIENT_FETCH}/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const result = await response.json();
      if (!response.ok) {
        alert("some error Occured");
      }
      setSelectedEmployee(result.data);
      handleeditOpen();
    } catch (error) {
      alert(error);
    }
  };

  const handleUpdate = async () => {
    try {
      const updateData = {
        name: selectedEmployee?.name,
        mobile: selectedEmployee?.mobile,
        age: selectedEmployee?.age,
        gender: selectedEmployee?.gender,
        height_cm: selectedEmployee?.height_cm,
        joining_date: selectedEmployee?.joining_date,
        goal: selectedEmployee?.goal,
        program_type: selectedEmployee?.program_type,
        plan_start_date: selectedEmployee?.plan_start_date,
        plan_end_date: selectedEmployee?.plan_end_date,
        weight_at_joining: selectedEmployee?.weight_at_joining,
        current_weight: selectedEmployee?.current_weight,
        status: selectedEmployee?.client_status,  // Use client_status from API
        email: selectedEmployee?.login_email,    // Use login_email from API
        // password: selectedEmployee?.password   // Only include if you add password field
      };

      // Remove undefined/null values (backend handles partial updates)
      Object.keys(updateData).forEach(key =>
        (updateData[key] === undefined || updateData[key] === null || updateData[key] === "") && delete updateData[key]
      );

      const response = await fetch(
        `${process.env.REACT_APP_SINGLECLIENT_UPDATE}/${selectedEmployee.client_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            // Backend expects auth via authMiddleware, so include token if using JWT
            // "Authorization": `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: "include",
          body: JSON.stringify(updateData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Update failed");
      }

      alert("Client updated successfully!");
      handleeditClose();
      Employeedetails(); // Refresh data
    } catch (error) {
      console.error("Update error:", error);
      alert(error.message);
    }
  };


  // Editing the Employee

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90vw',  // Responsive width: 90% viewport on small screens
    maxWidth: '700px',  // Cap width on large screens
    maxHeight: '90vh',
    overflowY: 'auto',
    bgcolor: theme.app_bg,
    border: `1px solid ${theme.primary_color}`,
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  return (
    <>
      <div className="container-fluid" style={{ marginTop: "10px" }}>
        <div className="row">
          <div className="col-12 text-end">
            <Button
              variant="contained"
              onClick={handleOpen}
              sx={{ textTransform: "none", background: theme.primary_color, color: theme.text_color }}
            >
              <AddIcon /> Add Client
            </Button>
          </div>
          <Box
            sx={{
              width: "100%",
              height: { xs: 400, sm: 500, md: 441 }, // responsive height
              overflowX: "auto", // allows horizontal scroll on small screens
              mt: 2,
            }}
          >
            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={(row) => row.id}
              initialState={{
                pagination: { paginationModel: { pageSize: 6, page: 0 } },
              }}
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
              }}
              disableRowSelectionOnClick
            />
          </Box>
          {/* Employee Addition modal */}
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography
                id="modal-modal-title"
                sx={{ textAlign: "center", color: theme.text_color }}
                variant="h6"
                component="h2"
              >
                Add the Client
              </Typography>

              {/* CLOSE ICON */}
              <IconButton
                onClick={handleClose}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  color: theme.primary_color,
                }}
              >
                <CloseIcon />
              </IconButton>

              <br />

              <div className="d-flex justify-content-between p-3" style={{ gap: 24 }}>
                {/* LEFT COLUMN */}
                <div style={{ flex: 1 }}>
                  <TextField
                    type="text"
                    name="name"
                    variant="standard"
                    value={formData.name}
                    onChange={handleChange}
                    label="Name"
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

                      // 🔹 Underline Default
                      "& .MuiInput-underline:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Hover
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Focused
                      "& .MuiInput-underline:after": {
                        borderBottomColor: theme.text_color,
                      },
                    }}
                    required
                    fullWidth
                  />
                  <br />
                  <br />

                  <TextField
                    type="email"
                    variant="standard"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    label="Email"
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

                      // 🔹 Underline Default
                      "& .MuiInput-underline:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Hover
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Focused
                      "& .MuiInput-underline:after": {
                        borderBottomColor: theme.text_color,
                      },
                    }}
                    required
                    fullWidth
                  />
                  <br />
                  <br />

                  <TextField
                    type="password"
                    name="password"
                    variant="standard"
                    value={formData.password}
                    onChange={handleChange}
                    label="Password"
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

                      // 🔹 Underline Default
                      "& .MuiInput-underline:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Hover
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Focused
                      "& .MuiInput-underline:after": {
                        borderBottomColor: theme.text_color,
                      },
                    }}
                    required
                    fullWidth
                  />
                  <br />
                  <br />

                  <TextField
                    type="number"
                    variant="standard"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    label="Mobile"
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

                      // 🔹 Underline Default
                      "& .MuiInput-underline:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Hover
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Focused
                      "& .MuiInput-underline:after": {
                        borderBottomColor: theme.text_color,
                      },
                    }}
                    required
                    fullWidth
                  />
                  <br />
                  <br />

                  <TextField
                    type="number"
                    variant="standard"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    label="Age"
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

                      // 🔹 Underline Default
                      "& .MuiInput-underline:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Hover
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Focused
                      "& .MuiInput-underline:after": {
                        borderBottomColor: theme.text_color,
                      },
                    }}
                    fullWidth
                  />
                  <br />
                  <br />

                  <FormControl variant="standard" sx={{
                    m: 1,
                    minWidth: 120,

                    // 🔹 Underline default
                    "& .MuiInput-underline:before": {
                      borderBottomColor: theme.text_color,
                    },

                    // 🔹 Underline hover
                    "& .MuiInput-underline:hover:before": {
                      borderBottomColor: theme.text_color,
                    },

                    // 🔹 Underline focused
                    "& .MuiInput-underline:after": {
                      borderBottomColor: theme.text_color,
                    },
                    m: 1, minWidth: 120
                  }} fullWidth required>
                    <InputLabel id="gender-label" sx={{
                      color: theme.text_color,
                      "&.Mui-focused": {
                        color: theme.text_color,
                      },
                    }}>Gender</InputLabel>
                    <Select
                      labelId="gender-label"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      sx={{
                        // 🔹 Selected text color
                        "& .MuiSelect-select": {
                          color: theme.text_color,
                        },

                        // 🔹 Dropdown arrow color
                        "& .MuiSvgIcon-root": {
                          color: theme.text_color,
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                  <br />
                  <br />

                  <TextField
                    type="number"
                    variant="standard"
                    name="height_cm"
                    value={formData.height_cm}
                    onChange={handleChange}
                    label="Height (cm)"
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

                      // 🔹 Underline Default
                      "& .MuiInput-underline:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Hover
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Focused
                      "& .MuiInput-underline:after": {
                        borderBottomColor: theme.text_color,
                      },
                    }}
                    fullWidth
                  />
                  <br />
                  <br />
                  <FormControl variant="standard" sx={{
                    m: 1,
                    minWidth: 120,

                    // 🔹 Underline default
                    "& .MuiInput-underline:before": {
                      borderBottomColor: theme.text_color,
                    },

                    // 🔹 Underline hover
                    "& .MuiInput-underline:hover:before": {
                      borderBottomColor: theme.text_color,
                    },

                    // 🔹 Underline focused
                    "& .MuiInput-underline:after": {
                      borderBottomColor: theme.text_color,
                    },
                    m: 1, minWidth: 120
                  }} fullWidth required>
                    <InputLabel id="status-label" sx={{
                      color: theme.text_color,
                      "&.Mui-focused": {
                        color: theme.text_color,
                      },
                    }}>Status</InputLabel>
                    <Select
                      labelId="status-label"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      sx={{
                        // 🔹 Selected text color
                        "& .MuiSelect-select": {
                          color: theme.text_color,
                        },

                        // 🔹 Dropdown arrow color
                        "& .MuiSvgIcon-root": {
                          color: theme.text_color,
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>

                      {/* If your backend expects "active"/"inactive", use strings */}
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>

                      {/* If your backend expects 1/0, use these instead */}
                      {/* <MenuItem value={1}>Active</MenuItem>
            <MenuItem value={0}>Inactive</MenuItem> */}
                    </Select>
                  </FormControl>
                </div>

                {/* RIGHT COLUMN */}
                <div style={{ flex: 1 }} className="p-3">
                  <InputLabel htmlFor="joining_date" sx={{
                    color: theme.text_color,
                    "&.Mui-focused": {
                      color: theme.text_color,
                    },
                  }}>Joining Date</InputLabel>
                  <TextField
                    type="date"
                    variant="standard"
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleChange}
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

                      // 🔹 Underline Default
                      "& .MuiInput-underline:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Hover
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Focused
                      "& .MuiInput-underline:after": {
                        borderBottomColor: theme.text_color,
                      },
                      "& input[type='date']::-webkit-calendar-picker-indicator": {
                        filter:
                          theme.app_bg === "black" ||
                            theme.app_bg === "#000000"
                            ? "invert(1)"
                            : "invert(0)",
                      },
                    }}
                    required
                    fullWidth
                  />
                  <br />
                  <br />

                  <FormControl variant="standard" sx={{
                    m: 1,
                    minWidth: 120,

                    // 🔹 Underline default
                    "& .MuiInput-underline:before": {
                      borderBottomColor: theme.text_color,
                    },

                    // 🔹 Underline hover
                    "& .MuiInput-underline:hover:before": {
                      borderBottomColor: theme.text_color,
                    },

                    // 🔹 Underline focused
                    "& .MuiInput-underline:after": {
                      borderBottomColor: theme.text_color,
                    },
                    m: 1, minWidth: 120
                  }} fullWidth required>
                    <InputLabel id="goal-label" sx={{
                      color: theme.text_color,
                      "&.Mui-focused": {
                        color: theme.text_color,
                      },
                    }}>Goal</InputLabel>
                    <Select
                      labelId="goal-label"
                      name="goal"
                      value={formData.goal}
                      onChange={handleChange}
                      sx={{
                        // 🔹 Selected text color
                        "& .MuiSelect-select": {
                          color: theme.text_color,
                        },

                        // 🔹 Dropdown arrow color
                        "& .MuiSvgIcon-root": {
                          color: theme.text_color,
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value="fat_loss">Fat loss</MenuItem>
                      <MenuItem value="muscle_gain">Muscle gain</MenuItem>
                      <MenuItem value="maintenance">Maintenance</MenuItem>
                    </Select>
                  </FormControl>
                  <br />
                  <br />

                  <FormControl variant="standard" sx={{
                    m: 1,
                    minWidth: 120,

                    // 🔹 Underline default
                    "& .MuiInput-underline:before": {
                      borderBottomColor: theme.text_color,
                    },

                    // 🔹 Underline hover
                    "& .MuiInput-underline:hover:before": {
                      borderBottomColor: theme.text_color,
                    },

                    // 🔹 Underline focused
                    "& .MuiInput-underline:after": {
                      borderBottomColor: theme.text_color,
                    },
                    m: 1, minWidth: 120
                  }} fullWidth required>
                    <InputLabel id="program-type-label" sx={{
                      color: theme.text_color,
                      "&.Mui-focused": {
                        color: theme.text_color,
                      },
                    }}>Program Type</InputLabel>
                    <Select
                      labelId="program-type-label"
                      name="program_type"
                      value={formData.program_type}
                      onChange={handleChange}
                      sx={{
                        // 🔹 Selected text color
                        "& .MuiSelect-select": {
                          color: theme.text_color,
                        },

                        // 🔹 Dropdown arrow color
                        "& .MuiSvgIcon-root": {
                          color: theme.text_color,
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value="5_days">5 Days / Week</MenuItem>
                      <MenuItem value="3_days">3 Days / Week</MenuItem>
                    </Select>
                  </FormControl>
                  <br />
                  <br />

                  <InputLabel htmlFor="plan_start_date" sx={{
                    color: theme.text_color,
                    "&.Mui-focused": {
                      color: theme.text_color,
                    },
                  }}>Plan Start Date</InputLabel>
                  <TextField
                    type="date"
                    variant="standard"
                    name="plan_start_date"
                    value={formData.plan_start_date}
                    onChange={handleChange}
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

                      // 🔹 Underline Default
                      "& .MuiInput-underline:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Hover
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Focused
                      "& .MuiInput-underline:after": {
                        borderBottomColor: theme.text_color,
                      },

                      "& input[type='date']::-webkit-calendar-picker-indicator": {
                        filter:
                          theme.app_bg === "black" ||
                            theme.app_bg === "#000000"
                            ? "invert(1)"
                            : "invert(0)",
                      },
                    }}
                    required
                    fullWidth
                  />
                  <br />
                  <br />

                  <InputLabel htmlFor="plan_end_date" sx={{
                    color: theme.text_color,
                    "&.Mui-focused": {
                      color: theme.text_color,
                    },
                  }}>Plan End Date</InputLabel>
                  <TextField
                    type="date"
                    variant="standard"
                    name="plan_end_date"
                    value={formData.plan_end_date}
                    onChange={handleChange}
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

                      // 🔹 Underline Default
                      "& .MuiInput-underline:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Hover
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Focused
                      "& .MuiInput-underline:after": {
                        borderBottomColor: theme.text_color,
                      },

                      "& input[type='date']::-webkit-calendar-picker-indicator": {
                        filter: "invert(1)", // makes icon white
                        cursor: "pointer",
                      },
                    }}
                    required
                    fullWidth
                  />
                  <br />
                  <br />

                  <TextField
                    type="number"
                    variant="standard"
                    name="weight_at_joining"
                    value={formData.weight_at_joining}
                    onChange={handleChange}
                    label="Weight at Joining (kg)"
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

                      // 🔹 Underline Default
                      "& .MuiInput-underline:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Hover
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Focused
                      "& .MuiInput-underline:after": {
                        borderBottomColor: theme.text_color,
                      },
                    }}
                    fullWidth
                  />
                  <br />
                  <br />

                  <TextField
                    type="number"
                    variant="standard"
                    name="current_weight"
                    value={formData.current_weight}
                    onChange={handleChange}
                    label="Current Weight (kg)"
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

                      // 🔹 Underline Default
                      "& .MuiInput-underline:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Hover
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Focused
                      "& .MuiInput-underline:after": {
                        borderBottomColor: theme.text_color,
                      },
                    }}
                    fullWidth
                  />
                  <br />
                  <br />


                </div>
              </div>

              <div className="col-12 pt-4 text-center">
                <Button
                  variant="contained"
                  onClick={submitEmployee}
                  sx={{ textTransform: "none", backgroundColor: theme.primary_color, color: theme.text_color }}
                >
                  Add Client
                </Button>
              </div>
            </Box>
          </Modal>

          {/* Employee Addition modal */}

          {/* Employee editing */}
          <Modal open={singleopen} onClose={handleeditClose}>
            <Box sx={style}>
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: theme.text_color, textAlign: "center" }}>Edit Client</Typography>
                <IconButton onClick={handleeditClose} sx={{ color: '#6b7280' }}>
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Responsive Two-Column Form */}
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3
              }}>
                {/* LEFT COLUMN - Personal Info */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: theme.text_color }}>Personal Info</Typography>

                  <TextField
                    fullWidth
                    variant="standard"
                    name="name"
                    label="Name"
                    value={selectedEmployee?.name || ""}
                    onChange={handleEditChange}
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

                      // 🔹 Underline Default
                      "& .MuiInput-underline:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Hover
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Focused
                      "& .MuiInput-underline:after": {
                        borderBottomColor: theme.text_color,
                      },
                      mb: 2
                    }}
                    required
                  />

                  <TextField
                    fullWidth
                    type="email"
                    variant="standard"
                    name="login_email"
                    label="Email"
                    value={selectedEmployee?.login_email || ""}
                    onChange={handleEditChange}
                    sx={{
                      mb: 2,
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

                      // 🔹 Underline Default
                      "& .MuiInput-underline:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Hover
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Focused
                      "& .MuiInput-underline:after": {
                        borderBottomColor: theme.text_color,
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    variant="standard"
                    name="mobile"
                    label="Mobile"
                    type="tel"
                    value={selectedEmployee?.mobile || ""}
                    onChange={handleEditChange}
                    sx={{
                      mb: 2,
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

                      // 🔹 Underline Default
                      "& .MuiInput-underline:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Hover
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Focused
                      "& .MuiInput-underline:after": {
                        borderBottomColor: theme.text_color,
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    variant="standard"
                    name="age"
                    label="Age"
                    type="number"
                    value={selectedEmployee?.age || ""}
                    onChange={handleEditChange}
                    sx={{
                      mb: 2,
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

                      // 🔹 Underline Default
                      "& .MuiInput-underline:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Hover
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Focused
                      "& .MuiInput-underline:after": {
                        borderBottomColor: theme.text_color,
                      },
                    }}
                  />

                  <FormControl fullWidth variant="standard" sx={{
                    mb: 2,

                    // 🔹 Underline default
                    "& .MuiInput-underline:before": {
                      borderBottomColor: theme.text_color,
                    },

                    // 🔹 Underline hover
                    "& .MuiInput-underline:hover:before": {
                      borderBottomColor: theme.text_color,
                    },

                    // 🔹 Underline focused
                    "& .MuiInput-underline:after": {
                      borderBottomColor: theme.text_color,
                    },
                  }}>
                    <InputLabel sx={{
                      color: theme.text_color,
                      "&.Mui-focused": {
                        color: theme.text_color,
                      },
                    }}>Gender</InputLabel>
                    <Select
                      name="gender"
                      value={selectedEmployee?.gender || ""}
                      onChange={handleEditChange}
                      label="Gender"
                      sx={{
                        // 🔹 Selected text color
                        "& .MuiSelect-select": {
                          color: theme.text_color,
                        },

                        // 🔹 Dropdown arrow color
                        "& .MuiSvgIcon-root": {
                          color: theme.text_color,
                        },
                      }}
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    type="date"
                    variant="outlined"
                    name="plan_end_date"
                    label="Plan End Date"
                    value={selectedEmployee?.plan_end_date || ""}
                    onChange={handleEditChange}
                    sx={{
                      minWidth: 160,

                      // 🔹 Label
                      "& .MuiInputLabel-root": {
                        color: theme.text_color,
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: theme.text_color,
                      },

                      // 🔹 Input text
                      "& .MuiOutlinedInput-input": {
                        color: theme.text_color,
                      },

                      // 🔹 Chrome fix (important for date input)
                      "& input": {
                        WebkitTextFillColor: theme.text_color,
                      },

                      // 🔹 Default border
                      "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                      },

                      // 🔹 Hover border
                      "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                      },

                      // 🔹 Focus border
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                        borderWidth: 2,
                      },

                      // 🔹 Calendar icon color (important)
                      "& input[type='date']::-webkit-calendar-picker-indicator": {
                        filter: theme.app_bg === "#000000" || theme.app_bg === "black"
                          ? "invert(1)"
                          : "invert(0)",
                        cursor: "pointer",
                      },

                      // 🔹 Smooth transition
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s ease",
                      },
                      mb:2
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>

                {/* RIGHT COLUMN - Fitness Data */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: theme.text_color }}>Fitness Data</Typography>

                  <TextField
                    fullWidth
                    variant="standard"
                    name="height_cm"
                    label="Height (cm)"
                    type="number"
                    value={selectedEmployee?.height_cm || ""}
                    onChange={handleEditChange}
                    sx={{
                      mb: 2,
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

                      // 🔹 Underline Default
                      "& .MuiInput-underline:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Hover
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Focused
                      "& .MuiInput-underline:after": {
                        borderBottomColor: theme.text_color,
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    type="date"
                    variant="outlined"
                    name="joining_date"
                    label="Joining Date"
                    value={selectedEmployee?.joining_date || ""}
                    onChange={handleEditChange}
                    sx={{
                      minWidth: 160,

                      // 🔹 Label
                      "& .MuiInputLabel-root": {
                        color: theme.text_color,
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: theme.text_color,
                      },

                      // 🔹 Input text
                      "& .MuiOutlinedInput-input": {
                        color: theme.text_color,
                      },

                      // 🔹 Chrome fix (important for date input)
                      "& input": {
                        WebkitTextFillColor: theme.text_color,
                      },

                      // 🔹 Default border
                      "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                      },

                      // 🔹 Hover border
                      "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                      },

                      // 🔹 Focus border
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                        borderWidth: 2,
                      },

                      // 🔹 Calendar icon color (important)
                      "& input[type='date']::-webkit-calendar-picker-indicator": {
                        filter: theme.app_bg === "#000000" || theme.app_bg === "black"
                          ? "invert(1)"
                          : "invert(0)",
                        cursor: "pointer",
                      },

                      // 🔹 Smooth transition
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s ease",
                      },
                      mb:2
                    }}
                    InputLabelProps={{ shrink: true }}
                  />

                  <TextField
                    fullWidth
                    variant="standard"
                    name="weight_at_joining"
                    label="Weight at Joining (kg)"
                    type="number"
                    step="0.01"
                    value={selectedEmployee?.weight_at_joining || ""}
                    onChange={handleEditChange}
                    sx={{
                      mb: 2,
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

                      // 🔹 Underline Default
                      "& .MuiInput-underline:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Hover
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Focused
                      "& .MuiInput-underline:after": {
                        borderBottomColor: theme.text_color,
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    variant="standard"
                    name="current_weight"
                    label="Current Weight (kg)"
                    type="number"
                    step="0.01"
                    value={selectedEmployee?.current_weight || ""}
                    onChange={handleEditChange}
                    sx={{
                      mb: 2,
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

                      // 🔹 Underline Default
                      "& .MuiInput-underline:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Hover
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: theme.text_color,
                      },

                      // 🔹 Underline Focused
                      "& .MuiInput-underline:after": {
                        borderBottomColor: theme.text_color,
                      },
                    }}
                  />

                  <FormControl fullWidth variant="standard" sx={{
                    mb: 2,

                    // 🔹 Underline default
                    "& .MuiInput-underline:before": {
                      borderBottomColor: theme.text_color,
                    },

                    // 🔹 Underline hover
                    "& .MuiInput-underline:hover:before": {
                      borderBottomColor: theme.text_color,
                    },

                    // 🔹 Underline focused
                    "& .MuiInput-underline:after": {
                      borderBottomColor: theme.text_color,
                    },
                  }}>
                    <InputLabel sx={{
                      color: theme.text_color,
                      "&.Mui-focused": {
                        color: theme.text_color,
                      },
                    }}>Status</InputLabel>
                    <Select
                      name="client_status"
                      value={selectedEmployee?.client_status || "active"}
                      onChange={handleEditChange}
                      label="Status"
                      sx={{
                        // 🔹 Selected text color
                        "& .MuiSelect-select": {
                          color: theme.text_color,
                        },

                        // 🔹 Dropdown arrow color
                        "& .MuiSvgIcon-root": {
                          color: theme.text_color,
                        },
                      }}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    type="date"
                    variant="outlined"
                    name="plan_start_date"
                    label="Plan Start Date"
                    value={selectedEmployee?.plan_start_date || ""}
                    onChange={handleEditChange}
                    sx={{
                      minWidth: 160,

                      // 🔹 Label
                      "& .MuiInputLabel-root": {
                        color: theme.text_color,
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: theme.text_color,
                      },

                      // 🔹 Input text
                      "& .MuiOutlinedInput-input": {
                        color: theme.text_color,
                      },

                      // 🔹 Chrome fix (important for date input)
                      "& input": {
                        WebkitTextFillColor: theme.text_color,
                      },

                      // 🔹 Default border
                      "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                      },

                      // 🔹 Hover border
                      "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                      },

                      // 🔹 Focus border
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                        borderWidth: 2,
                      },

                      // 🔹 Calendar icon color (important)
                      "& input[type='date']::-webkit-calendar-picker-indicator": {
                        filter: theme.app_bg === "#000000" || theme.app_bg === "black"
                          ? "invert(1)"
                          : "invert(0)",
                        cursor: "pointer",
                      },

                      // 🔹 Smooth transition
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s ease",
                      },
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleeditClose}
                  sx={{ textTransform: 'none', borderColor: theme.primary_color, color: theme.text_color }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleUpdate}
                  sx={{ textTransform: 'none', backgroundColor: theme.primary_color, color: theme.text_color }}
                >
                  Update Client
                </Button>
              </Box>
            </Box>
          </Modal>

          {/* Employee Editing */}
        </div>
      </div>
    </>
  );
};

export default Clients;
