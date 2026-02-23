import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Button from "@mui/material/Button";
import { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import GenerateBill from "./GenerateBill";
import Chip from "@mui/material/Chip";
import EditIcon from "@mui/icons-material/Edit";
import AddTaskIcon from '@mui/icons-material/AddTask';

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "0px solid #000",
  boxShadow: 24,
  p: 4,
};

const ServiceRequest = () => {
  const [requestsfetch, setRequestfetch] = React.useState([]);
  const [Employees, setEmployees] = React.useState([]);
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [singleopen, setSingleopen] = React.useState(false);
  const [openBill, setOpenBill] = useState(false);
  const [billParams, setBillParams] = useState(null);
  const [clients, setClients] = useState([]);
  const [complianceTypes, setComplianceTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    client_id: "",
    description: "",
    compliance_type_id: "",
    preferred_date: "",
    priority: ""
  });
  const [open, setOpen] = useState(false);
  const onClose = () => setOpen(false);


  const handleGenerateBill = (row) => {
    setBillParams({
      requestId: row.id,
      clientId: row.client_id,
      staffId: row.staff_id,
    });
    setOpenBill(true);
  };

  const handleeditOpen = () => setSingleopen(true);
  const handleeditClose = () => setSingleopen(false);

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 60,
    },
    { field: "client_id", headerName: "Client ID", flex: 1 },
    { field: "client_name", headerName: "Client Name", flex: 1 },
    { field: "compliance_type_name", headerName: "Compliance Type", flex: 1 },
    {
      field: "staff_name",
      headerName: "Assigned To",
      flex: 1,
      renderCell: (params) =>
        params.value ? (
          <Chip label={params.value} size="small" color="warning" />
        ) : (
          <Chip label="Admin" size="small" color="primary" />
        ),
    },
    {
      field: "preferred_date",
      headerName: "Preferred Date",
      width: 140,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <span
          style={{
            color: params.value === "completed" ? "green" : "red",
            fontWeight: 200,
          }}
        >
          {params.value}
        </span>
      ),
    },
    { field: "priority", headerName: "Priority", width: 140 },
    {
      field: "generate_bill",
      headerName: "Generate Bill",
      width: 160,
      sortable: false,
      renderCell: (params) => {
        const isGenerated =
          params.row.bill_status === "Pending" ||
          params.row.bill_status === "Paid";

        return (
          <Button
            size="small"
            variant="contained"
            disabled={isGenerated}
            onClick={() => handleGenerateBill(params.row)}
            sx={{ backgroundColor: "#673AB7", textTransform: "none" }}
          >
            {isGenerated ? "Generated" : "Generate"}
          </Button>
        );
      },
    },
    {
      field: "actions",
      headerName: "Action",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          {/* VIEW / ID */}
          <Button
            variant="text"
            size="small"
            sx={{ textTransform: "none", minWidth: "auto" }}
            onClick={() => handleIdClick(params.row.id)}
          >
            <EditIcon
              sx={{
                color: "#9202baff",
              }}
            />{" "}
            Edit
          </Button>

          {/* DELETE */}
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const filteredRows = requestsfetch.filter((row) =>
    Object.values(row).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedRequest((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_REQUEST_FETCH, {
        method: "GET",
        credentials: "include",
      });
      const result = await response.json();
      setRequestfetch(result.data || []);
    } catch (error) {
      console.error("Failed to fetch the Requests", error);
    }
  };

  // Fetching the Employees
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
    fetchRequests();
    Employeedetails();
  }, []);

  // Editing the Requests
  const handleIdClick = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SINGLEREQUEST_FETCH}/${id}`,
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
      setSelectedRequest(result.data);
      handleeditOpen();
    } catch (error) {
      alert(error);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_REQUEST_UPDATE}/${selectedRequest.id}`,
        {
          method: "PUT", // or POST based on backend
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            staff_id: selectedRequest.staff_id,
            status: selectedRequest.status,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Update failed");
      }

      alert("Request updated successfully");
      handleeditClose();
      fetchRequests();
    } catch (error) {
      alert(error.message);
    }
  };

  // Editing the Requests

  // Delete Request
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Request?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_REQUEST_DELETE}/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }

      // 🔴 Remove row from state
      setRequestfetch((prev) => prev.filter((emp) => emp.id !== id));
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };
  // Delete Request

  // ---------------- FETCH CLIENTS ----------------
  useEffect(() => {
    if (!open) return;

    const fetchClients = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_URL}/api/client/get`,
          {
            credentials: "include"
          }
        );
        const data = await res.json();
        if (res.ok) setClients(data.data || []);
      } catch (err) {
        console.error("CLIENT FETCH ERROR:", err);
      }
    };

    const fetchComplianceTypes = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_URL}/api/getcompliancetypes`,
          {
            credentials: "include"
          }
        );
        const data = await res.json();
        if (res.ok) setComplianceTypes(data.data || []);
      } catch (err) {
        console.error("COMPLIANCE TYPE FETCH ERROR:", err);
      }
    };

    fetchClients();
    fetchComplianceTypes();
  }, [open]);

  // ---------------- HANDLERS ----------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.description || !form.preferred_date || !form.compliance_type_id ||!form.client_id) return;

    setLoading(true);

    try {
      const payload = {
        client_id: form.client_id || null,
        compliance_type_id: form.compliance_type_id || null,
        description: form.description,
        preferred_date: form.preferred_date,
        priority: form.priority
      };

      const res = await fetch(
        `${process.env.REACT_APP_URL}/service/admin/service-request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create request");
        return;
      }
      onClose();
      setForm({
        client_id: "",
        description: "",
        preferred_date: "",
        priority: ""
      });
      fetchRequests();

    } catch (err) {
      console.error("CREATE REQUEST ERROR:", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="container-fluid" style={{ marginTop: "100px" }}>
        <div className="row">
          <div className="col-12 text-center">
            <Typography variant="h4">Service Requests</Typography>
          </div>
          <div className="col-12 text-end">
            <Button
              variant="contained"
              onClick={() => setOpen(true)}
              sx={{ backgroundColor: "#673AB7", textTransform: "none",textAlign:"end" }}
            >
              <AddTaskIcon sx={{ mr: 1 }} /> Create Service Request
            </Button>
          </div>
          <div className="col-12 text-center pt-5">
            <DataGrid
              rows={filteredRows}
              columns={columns}
              pageSizeOptions={[5, 10, 25]}
              getRowId={(row) => row.id}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
              }}
              disableRowSelectionOnClick
            />
          </div>
          {/* Request editing */}
          <Modal
            open={singleopen}
            onClose={handleeditClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <div className="">
                <div>
                  <TextField
                    variant="standard"
                    name="client_id"
                    label="Client ID"
                    onChange={handleEditChange}
                    value={selectedRequest?.client_id || " "}
                    disabled
                  />
                  <br />
                  <br />
                  {/* <TextField variant="standard" name="compliance_type_name" label="Compliance Type" onChange={handleEditChange} value={selectedRequest?.compliance_type_name || " "} disabled />
                                    <br />
                                    <br /> */}
                  <TextField
                    variant="standard"
                    fullWidth
                    name="description"
                    label="Description"
                    onChange={handleEditChange}
                    value={selectedRequest?.description || " "}
                    multiline
                    rows={3}
                    disabled
                  />
                  <br />
                  <br />
                  <FormControl variant="standard" fullWidth>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      name="status"
                      value={selectedRequest?.status ?? ""}
                      onChange={handleEditChange}
                    >
                      <MenuItem value="pending">pending</MenuItem>
                      <MenuItem value="assigned">assigned</MenuItem>
                      <MenuItem value="completed">completed</MenuItem>
                      <MenuItem value="cancelled">cancelled</MenuItem>
                    </Select>
                  </FormControl>
                  <br />
                  <br />
                  <FormControl variant="standard" fullWidth>
                    <InputLabel id="assigned-to-label">Assign To</InputLabel>
                    <Select
                      labelId="assigned-to-label"
                      name="staff_id"
                      value={selectedRequest?.staff_id ?? ""}
                      onChange={handleEditChange}
                    >
                      <MenuItem value="">Admin</MenuItem>

                      {Employees.map((employee) => (
                        <MenuItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <br />
                  <br />
                </div>
              </div>
              <div className="col-12 text-end">
                <Button
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    color: "#673AB7",
                    borderColor: "#673AB7",
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
                    backgroundColor: "green",
                  }}
                >
                  Update
                </Button>
              </div>
            </Box>
          </Modal>
          {/* Request Editing */}

          {/* Generate Bill Modal */}
          {openBill && (
            <GenerateBill
              open={openBill}
              onClose={() => setOpenBill(false)}
              requestId={billParams.requestId}
              clientId={billParams.clientId}
              staffId={billParams.staffId}
            />
          )}
          {/* Generate Bill Modal */}
          {/* Create Service Request Dialog */}
          <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Create Service Request</DialogTitle>

            <DialogContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>

                {/* Client Select */}
                <FormControl fullWidth>
                  <InputLabel>Client</InputLabel>
                  <Select
                    name="client_id"
                    value={form.client_id}
                    label="Client"
                    onChange={handleChange}
                  >
                    {/* <MenuItem value="0">
                      <em>Other / Walk-in</em>
                    </MenuItem> */}
                    {clients.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Compliancetype */}
                <FormControl fullWidth>
                  <InputLabel>Compliance Type</InputLabel>
                  <Select
                    name="compliance_type_id"
                    value={form.compliance_type_id}
                    label="Compliance Type"
                    onChange={handleChange}
                  >
                    {/* <MenuItem value="">
                      <em>Other / Walk-in</em>
                    </MenuItem> */}
                    {complianceTypes.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Description */}
                <TextField
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  required
                />

                {/* Preferred Date */}
                <TextField
                  type="date"
                  label="Preferred Date"
                  name="preferred_date"
                  InputLabelProps={{ shrink: true }}
                  value={form.preferred_date}
                  onChange={handleChange}
                  required
                />

                {/* Priority */}
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={form.priority}
                    label="Priority"
                    onChange={handleChange}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>

              </Box>
            </DialogContent>

            <DialogActions>
              <Button onClick={onClose}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create"}
              </Button>
            </DialogActions>
          </Dialog>
          {/* Create Service Request Dialog */}
        </div>
      </div>
    </>
  );
};

export default ServiceRequest;
