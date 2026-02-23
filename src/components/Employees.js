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



const DEFAULT_THEME = {
  app_bg: "#ffffff",
  sidebar_bg: "#107881",
  topbar_bg: "#107881",
  text_color: "#ffffff",
  primary_color: "#33a1ab",
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = React.useState(false);
  const [singleopen, setSingleopen] = React.useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    status: "",
    qualification: "",
    date_of_joining: "",
    designation: "",
    branch: "",
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [theme, setTheme] = useState({});
  const [loading, setLoading] = useState(true);


  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  // profile photo update
  const updateProfilePhoto = async () => {
    if (!photoFile || !selectedEmployee?.id) return;

    const formData = new FormData();
    formData.append("profile_photo", photoFile);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_URL}/api/staff/update/${selectedEmployee.id}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Profile photo updated");
        setPreviewImage(null);
        setSelectedEmployee((prev) => ({
          ...prev,
          profile_photo: data.profile_photo,
        }));
        window.location.reload();
      }
    } catch (err) {
      console.error("Photo update error", err);
    }
  };
  // profile photo update

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
    { field: "branch", headerName: "Branch", flex: 1 },
    { field: "designation", headerName: "Role", flex: 1 },
    { field: "phone", headerName: "Mobile", width: 140 },
    {
      field: "status",
      headerName: "Status",
      width: 120,
    },
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

  // Adding the Employee
  const submitEmployee = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_URL}/api/create`, {
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
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        status: "",
        qualification: "",
        date_of_joining: "",
        designation: "",
        branch: "",
      });
      Employeedetails();
      handleClose();

      // console.log("Employee created:", result);
      alert("Employee added successfully!");
    } catch (error) {
      console.error("Error:", error.message);
      alert(error.message);
    }
  };

  // Adding the Employee

  const Employeedetails = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_EMPLOYEE_FETCH, {
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

  useEffect(() => {
    Employeedetails();
  }, []);

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
        setTheme(DEFAULT_THEME);
      } else {
        setTheme({ ...DEFAULT_THEME, ...(json.data || {}) });
      }
    } catch (err) {
      console.error(err);
      alert("Network error while loading theme", "error");
      setTheme(DEFAULT_THEME);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deleting the Employee
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_URL}/api/staff/delete/${id}`,
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
        `${process.env.REACT_APP_SINGLEEMPLOYEE_FETCH}/${id}`,
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
      console.log(result.data);
      handleeditOpen();
    } catch (error) {
      alert(error);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_URL}/api/staff/update/${selectedEmployee.staff_id}`,
        {
          method: "PUT", // or POST based on backend
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: selectedEmployee.name,
            email: selectedEmployee.login_email,
            phone: selectedEmployee.phone,
            address: selectedEmployee.address,
            status: selectedEmployee.status,
            date_of_joining: selectedEmployee.date_of_joining,
            role: selectedEmployee.role,
            qualification: selectedEmployee.qualification,
            branch: selectedEmployee.branch,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Update failed");
      }

      alert("Employee updated successfully");
      handleeditClose();
      Employeedetails();
    } catch (error) {
      alert(error.message);
    }
  };

  // Editing the Employee

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: theme.app_bg,
    border: `1px solid ${theme.primary_color}`,
    borderRadius: "20px",
    boxShadow: 24,
    p: 4,
  };

  return (
    <>
      <div className="container-fluid" style={{ marginTop: "10px" }}>
        <div className="row">
          {/* <div className="col-12 text-center">
                        <Typography variant="h5">Employees</Typography>
                    </div> */}
          <div className="col-12 text-end">
            <Button
              variant="contained"
              onClick={handleOpen}
              sx={{ textTransform: "none", background: theme.primary_color, color: theme.text_color }}
            >
              <AddIcon /> Add Employee
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
                sx={{ textAlign: "center", color: theme.text_color, fontWeight: 600 }}
                variant="h6"
                component="h2"
              >
                Add the Employee
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
              <div className="d-flex justify-content-between">
                <div>
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
                  />
                  {/* <br />
                <br />
                <TextField
                  type="text"
                  variant="standard"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  label="Qualification"
                  required
                /> */}
                  <br />
                  <br />
                  {/* <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel id="demo-simple-select-standard-label">
                    Role
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-standard-label"
                    id="demo-simple-select-standard"
                    name="role"
                    label="Role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="doctor">Doctor</MenuItem>
                    <MenuItem value="receptionist">Receptionist</MenuItem>
                  </Select>
                </FormControl> */}
                  <TextField
                    type="text"
                    variant="standard"
                    name="designation"
                    label="Designation"
                    onChange={handleChange}
                    value={formData.designation}
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
                  />
                  <br />
                  <br />
                  <TextField
                    type="text"
                    variant="standard"
                    name="address"
                    label="Address"
                    value={formData.address}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    sx={{
                      // 🔹 Input Text Color
                      "& .MuiInputBase-input": {
                        color: theme.text_color,
                      },

                      // 🔹 Label Color
                      "& .MuiInputLabel-root": {
                        color: theme.text_color,
                        borderColor: theme.text_color,
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
                  />
                </div>
                <div>
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
                  />
                  <br />
                  <br />
                  <TextField
                    type="number"
                    variant="standard"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    label="Phone"
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
                  />
                  <br />
                  <br />
                  <TextField
                    type="text"
                    variant="standard"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    label="Branch"
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
                  }}>
                    <InputLabel id="demo-simple-select-standard-label" sx={{
                      color: theme.text_color,
                      "&.Mui-focused": {
                        color: theme.text_color,
                      },
                    }}>
                      Status
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-standard-label"
                      id="demo-simple-select-standard"
                      name="status"
                      label="Status"
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
                      required
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                  <br />
                  <br />
                  <TextField
                    type="date"
                    name="date_of_joining"
                    variant="standard"
                    value={formData.date_of_joining}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    label="DateofJoining"
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
                  />
                </div>
              </div>
              <div className="col-12 pt-2 text-center">
                <Button
                  variant="contained"
                  onClick={submitEmployee}
                  sx={{ textTransform: "none", backgroundColor: theme.primary_color, color: theme.text_color }}
                >
                  Submit
                </Button>
              </div>
            </Box>
          </Modal>
          {/* Employee Addition modal */}

          {/* Employee editing */}
          <Modal
            open={singleopen}
            onClose={handleeditClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <div className="col-12 text-start">
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  id="profilePhotoInput"
                  onChange={handlePhotoChange}
                />

                <img
                  src={
                    selectedEmployee?.profile_photo
                      ? `${process.env.REACT_APP_URL}/Images/${selectedEmployee?.profile_photo}`
                      : `${process.env.REACT_APP_URL}/Images/profile.jpg`
                  }
                  // src={
                  //   previewImage ||
                  //   (selectedEmployee?.profile_photo
                  //     ? `${process.env.REACT_APP_URL}/Images/${selectedEmployee.profile_photo}`
                  //     : `${process.env.REACT_APP_URL}/Images/profile.jpg`)
                  // }
                  alt="Profile"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    cursor: "pointer",
                    border: "2px solid #3f6f7a",
                  }}
                  onClick={() =>
                    document.getElementById("profilePhotoInput").click()
                  }
                />
                <br />
                {/* <Button
                variant="contained"
                sx={{ mt: 2, textTransform: "none", backgroundColor: "#3f6f7a" }}
                disabled={!photoFile}
                onClick={updateProfilePhoto}
              >
                Update Photo
              </Button> */}
              </div>

              <div className="d-flex justify-content-between pt-3">
                <div>
                  <TextField
                    variant="standard"
                    name="name"
                    label="Name"
                    onChange={handleEditChange}
                    value={selectedEmployee?.name || " "}
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
                  />
                  <br />
                  <br />
                  <TextField
                    variant="standard"
                    name="login_email"
                    label="Email"
                    onChange={handleEditChange}
                    value={selectedEmployee?.login_email || " "}
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
                  />
                  <br />
                  <br />
                  <TextField
                    variant="standard"
                    name="phone"
                    label="Phone"
                    onChange={handleEditChange}
                    value={selectedEmployee?.phone || " "}
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
                  }} fullWidth>
                    <InputLabel sx={{
                      color: theme.text_color,
                      "&.Mui-focused": {
                        color: theme.text_color,
                      },
                    }} id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      name="status"
                      value={selectedEmployee?.staff_status ?? ""}
                      onChange={handleEditChange}
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
                  <br />
                  <br />
                  {/* <FormControl variant="standard" fullWidth>
                  <InputLabel id="status-label">Role</InputLabel>
                  <Select
                    labelId="status-label"
                    name="role"
                    value={selectedEmployee?.role ?? ""}
                    onChange={handleEditChange}
                  >
                    <MenuItem value="doctor">Doctor</MenuItem>
                    <MenuItem value="receptionist">Receptionist</MenuItem>
                  </Select>
                </FormControl> */}
                  <TextField
                    variant="standard"
                    name="designation"
                    label="Designation"
                    onChange={handleEditChange}
                    value={selectedEmployee?.designation || " "}
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
                  />
                </div>
                <div>
                  <TextField
                    variant="standard"
                    name="address"
                    label="Address"
                    onChange={handleEditChange}
                    value={selectedEmployee?.address || " "}
                    multiline
                    rows={3}
                    sx={{
                      // 🔹 Input Text Color
                      "& .MuiInputBase-input": {
                        color: theme.text_color,
                      },

                      // 🔹 Label Color
                      "& .MuiInputLabel-root": {
                        color: theme.text_color,
                        borderColor: theme.text_color,
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
                  <br />
                  <br />
                  <TextField
                    variant="standard"
                    name="branch"
                    label="Branch"
                    onChange={handleEditChange}
                    value={selectedEmployee?.branch || " "}
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
                  />
                  <br />
                  <br />
                  <TextField
                    variant="standard"
                    name="date_of_joining"
                    label="Date of Joining"
                    onChange={handleEditChange}
                    value={
                      selectedEmployee?.date_of_joining
                        ? selectedEmployee.date_of_joining.split("T")[0]
                        : ""
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
                  <br />
                  <br />
                  {/* <TextField
                  variant="standard"
                  name="qualification"
                  label="Qualification"
                  onChange={handleEditChange}
                  value={selectedEmployee?.qualification || " "}
                /> */}
                </div>
              </div>
              <div className="col-12 text-end">
                <Button
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    color: theme.text_color,
                    borderColor: theme.sidebar_bg,
                  }}
                  onClick={handleeditClose}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleUpdate}
                  sx={{
                    textTransform: "none",
                    marginLeft: "10px",
                    backgroundColor: theme.primary_color,
                    color: theme.text_color,
                  }}
                >
                  Update
                </Button>
              </div>
            </Box>
          </Modal>
          {/* Employee Editing */}
        </div>
      </div >
    </>
  );
};

export default Employees;
