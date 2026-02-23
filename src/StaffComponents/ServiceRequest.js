import React, { useEffect, useState } from "react";
import api from "./services/api";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Select,
  MenuItem,
  Button,
  Typography,
  TablePagination,
  TextField,
  Stack,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Divider,
  Alert
} from "@mui/material";

import CircularProgress from "@mui/material/CircularProgress";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function ServiceRequests() {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [mode, setMode] = useState("view"); // view | update
  const [selectedRow, setSelectedRow] = useState(null);
  const [serviceName, setServiceName] = useState("");
  const [delayReason, setDelayReason] = useState("");
  const [status, setStatus] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [file, setFile] = useState(null);
  const [updateOption, setUpdateOption] = useState("single"); // "single" | "multiple" | "all"
  const [selectedIds, setSelectedIds] = useState([]); // for multiple selection
  const [saving, setSaving] = useState(false);

  const rowsPerPage = 10;
  const isMobile = useMediaQuery("(max-width:600px)");

  // 🔍 Filters state
  const [filters, setFilters] = useState({
    clientId: "",
    clientName: "",
    preferredDate: "",
    priority: "",
    createdDate: "",
    completedDate: "",
  });

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    setLoading(true);

    api
      .get("/service/staff-client/service-requests")
      .then((res) => {
        const data = res.data || [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sortedData = data.sort((a, b) => {
          const dateA = a.preferred_date
            ? new Date(a.preferred_date)
            : new Date("9999-12-31");

          const dateB = b.preferred_date
            ? new Date(b.preferred_date)
            : new Date("9999-12-31");

          return Math.abs(dateA - today) - Math.abs(dateB - today);
        });

        setRows(sortedData);
        setFilteredRows(sortedData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const normalizeDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d)) return null;

    return {
      day: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
      iso: d.toISOString().split("T")[0],
    };
  };

  const getMonthIndex = (input) => {
    if (!input) return null;

    const months = [
      "january","february","march","april","may","june",
      "july","august","september","october","november","december"
    ];

    const shortMonths = months.map(m => m.slice(0, 3));

    input = input.toLowerCase();

    if (months.includes(input)) return months.indexOf(input);
    if (shortMonths.includes(input)) return shortMonths.indexOf(input);

    return null;
  };

  const matchDateFlexible = (recordDate, filterValue) => {
    if (!filterValue) return true;
    if (!recordDate) return false;

    const filter = filterValue.trim().toLowerCase();
    const record = normalizeDate(recordDate);

    if (!record) return false;

    const parsedFilter = normalizeDate(filter);
    const monthIndex = getMonthIndex(filter);
    const yearOnly = /^\d{4}$/.test(filter);
    const dayOnly = /^\d{1,2}$/.test(filter);

    if (parsedFilter) {
      return record.iso === parsedFilter.iso;
    }

    if (monthIndex !== null) {
      return record.month === monthIndex;
    }

    if (yearOnly) {
      return record.year === Number(filter);
    }

    if (dayOnly) {
      return record.day === Number(filter);
    }

    return false;
  };

  // ---------------- FILTER SEARCH ----------------
  const handleSearch = () => {
    const clientId = filters.clientId.trim();
    const clientName = filters.clientName.trim().toLowerCase();

    const data = rows.filter((r) => {
      return (
        (!clientId || String(r.client_id).includes(clientId)) &&
        (!clientName ||
          r.client_name?.toLowerCase().includes(clientName)) &&
        (!filters.priority || r.priority === filters.priority) &&
        matchDateFlexible(r.preferred_date, filters.preferredDate) &&
        matchDateFlexible(r.created_at, filters.createdDate) &&
        matchDateFlexible(r.completed_at, filters.completedDate)
      );
    });

    setFilteredRows(data);
    setPage(0);
  };

  // ---------------- CLEAR FILTERS ----------------
  const handleClear = () => {
    setFilters({
      clientId: "",
      clientName: "",
      preferredDate: "",
      priority: "",
      createdDate: "",
      completedDate: "",
    });
    setFilteredRows(rows);
    setPage(0);
  };

  // ---------------- STATUS UPDATE ----------------
  const handleStatusChange = async (id, status) => {
    await api.put(`/service/service-request/${id}/status`, { status });

    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    setFilteredRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  // ---------------- COMPLETED NOW ----------------
  const handleCompletedNow = async (id) => {
    const now = new Date().toISOString();

    await api.put(`service/service-request/${id}/completed-datetime`, {
      completed_at: now,
    });

    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "completed", completed_at: now }
          : r
      )
    );

    setFilteredRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "completed", completed_at: now }
          : r
      )
    );
  };

  const priorityColor = (p) =>
    p === "high" ? "error" : p === "medium" ? "warning" : "success";

  const paginatedRows = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleView = (row) => {
    setMode("view");
    setSelectedRow(row);
    fetchServiceName(row.compliance_type_id);
    setOpenDialog(true);
  };

  const fetchServiceName = async (complianceTypeId) => {
    try {
      const res = await api.get(`/api/getcompliancetypes/${complianceTypeId}`);
      setServiceName(res.data.data.name);
    } catch (error) {
      console.error("Error fetching service name:", error);
    }
  };

  const handleUpdate = (row) => {
    setMode("update");
    setUpdateOption("single");
    setSelectedIds([]);
    setSelectedRow(row);
    setStatus(row.status);
    setDelayReason(row.delay_reason || "");
    setCompletedAt(row.completed_at || "");
    setFile(null);
    fetchServiceName(row.compliance_type_id);
    setOpenDialog(true);
  };

  // ---------------- HANDLE CHECKBOX SELECTION ----------------
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ---------------- GET TARGET IDS BASED ON UPDATE OPTION ----------------
  const getTargetIds = () => {
    if (updateOption === "single") {
      return [selectedRow.id];
    } else if (updateOption === "multiple") {
      return selectedIds;
    } else if (updateOption === "all") {
      return filteredRows.map((r) => r.id);
    }
    return [];
  };

  // ---------------- SAVE UPDATES ----------------
 const handleSave = async () => {
  try {
    setSaving(true);

    // Validation
    if (status === "delayed" && !delayReason.trim()) {
      alert("Please enter delay reason");
      return;
    }

    if (status === "completed" && !completedAt) {
      alert("Please select completed date");
      return;
    }

    // Update service request
    await api.put(
      `/service/service-request/${selectedRow.id}/updateservice`,
      {
        status,
        delay_reason: status === "delayed" ? delayReason : null,
        completed_at: status === "completed" ? completedAt : null,
      }
    );

    // Upload file only if completed
    if (status === "completed" && file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("client_id", selectedRow.client_id);

      await api.post("/api/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    // Update local table state
    setRows((prev) =>
      prev.map((r) =>
        r.id === selectedRow.id
          ? {
              ...r,
              status,
              delay_reason: delayReason || null,
              completed_at: completedAt || null,
            }
          : r
      )
    );

    setFilteredRows((prev) =>
      prev.map((r) =>
        r.id === selectedRow.id
          ? {
              ...r,
              status,
              delay_reason: delayReason || null,
              completed_at: completedAt || null,
            }
          : r
      )
    );

    alert("Service request updated successfully");
    setOpenDialog(false);
  } catch (error) {
    console.error(error);
    alert(error.response?.data?.message || "Update failed");
  } finally {
    setSaving(false);
  }
};


  if (loading) {
    return (
      <Box
        height="60vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: {xs:"90%",md:"95%"},
        maxWidth: "100%",
        p: { xs: 1.5, sm: 2 },
      }}
    >
      <Paper
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: 3,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        {/* 🔍 FILTER BAR */}
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={2}
          mb={2}
          sx={{
            "& > *": { width: isMobile ? "100%" : "auto" },
          }}
        >
          <TextField
            label="Client ID"
            size="small"
            fullWidth={isMobile}
            value={filters.clientId}
            onChange={(e) =>
              setFilters({ ...filters, clientId: e.target.value })
            }
            sx={{ minWidth: isMobile ? "auto" : 120 }}
          />

          <TextField
            label="Preferred Date"
            size="small"
            fullWidth={isMobile}
            placeholder="2025-01-16"
            value={filters.preferredDate}
            onChange={(e) =>
              setFilters({
                ...filters,
                preferredDate: e.target.value.trim(),
              })
            }
            sx={{ minWidth: isMobile ? "auto" : 160 }}
          />

          <Select
            size="small"
            fullWidth={isMobile}
            displayEmpty
            value={filters.priority}
            onChange={(e) =>
              setFilters({ ...filters, priority: e.target.value })
            }
            sx={{ minWidth: isMobile ? "auto" : 130 }}
          >
            <MenuItem value="">All Priority</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>

          <TextField
            label="Created Date"
            size="small"
            fullWidth={isMobile}
            placeholder="2025-01-10"
            value={filters.createdDate}
            onChange={(e) =>
              setFilters({
                ...filters,
                createdDate: e.target.value.trim(),
              })
            }
            sx={{ minWidth: isMobile ? "auto" : 150 }}
          />

          <TextField
            label="Completed Date"
            size="small"
            fullWidth={isMobile}
            placeholder="2025-01-18"
            value={filters.completedDate}
            onChange={(e) =>
              setFilters({
                ...filters,
                completedDate: e.target.value.trim(),
              })
            }
            sx={{ minWidth: isMobile ? "auto" : 160 }}
          />

          <Button 
            variant="contained" 
            fullWidth={isMobile}
            onClick={handleSearch}
            sx={{ minWidth: isMobile ? "auto" : 100 }}
          >
            Search
          </Button>

          <Button 
            variant="outlined" 
            fullWidth={isMobile}
            onClick={handleClear}
            sx={{ minWidth: isMobile ? "auto" : 100 }}
          >
            Clear
          </Button>
        </Stack>

        {/* 📋 DATA VIEW */}
        {isMobile ? (
          /* 📱 MOBILE CARD VIEW */
          <Stack spacing={2}>
            {paginatedRows.map((r) => (
              <Card
                key={r.id}
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid #E5E7EB",
                  maxWidth: "100%",
                  overflow: "hidden",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography variant="subtitle2" fontWeight={600} color="#1976d2">
                    Client ID: {r.client_id}
                  </Typography>
                  <Chip
                    label={r.priority}
                    size="small"
                    color={priorityColor(r.priority)}
                  />
                </Stack>

                <Typography variant="body2" color="text.secondary" mb={1}>
                  Request ID: <span style={{ fontWeight: 600, color: "#1976d2" }}>{r.compliance_type_id}</span>
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={1.5}>
                  Preferred Date:{" "}
                  <span style={{ fontWeight: 600 }}>
                    {r.preferred_date
                      ? new Date(r.preferred_date).toLocaleDateString("en-IN")
                      : "—"}
                  </span>
                </Typography>

                <Stack direction="row" spacing={1} mt={2}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleView(r)}
                    fullWidth
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleUpdate(r)}
                    fullWidth
                  >
                    Update
                  </Button>
                </Stack>
              </Card>
            ))}
          </Stack>
        ) : (
          /* 🖥 DESKTOP TABLE VIEW */
          <TableContainer sx={{ bgcolor: "#eaeffd" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#3089f2", fontSize: "15px", fontWeight: "700" }}>
                    Client ID
                  </TableCell>
                  <TableCell sx={{ color: "#3089f2", fontSize: "15px", fontWeight: "700" }}>
                    Request Id
                  </TableCell>
                  <TableCell sx={{ color: "#3089f2", fontSize: "15px", fontWeight: "700" }}>
                    Preferred Date
                  </TableCell>
                  <TableCell sx={{ color: "#3089f2", fontSize: "15px", fontWeight: "700" }}>
                    Priority
                  </TableCell>
                  <TableCell sx={{ color: "#3089f2", fontSize: "15px", fontWeight: "700" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ color: "#3089f2", fontSize: "15px", fontWeight: "700" }}>
                    Created
                  </TableCell>
                  <TableCell sx={{ color: "#3089f2", fontSize: "15px", fontWeight: "700" }}>
                    Completed
                  </TableCell>
                  <TableCell sx={{ color: "#3089f2", fontWeight: 700 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedRows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.client_id}</TableCell>
                    <TableCell>{r.compliance_type_id}</TableCell>
                    <TableCell>
                      {r.preferred_date
                        ? new Date(r.preferred_date).toLocaleDateString("en-IN")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.priority}
                        size="small"
                        color={priorityColor(r.priority)}
                      />
                    </TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell>{r.created_at?.split("T")[0]}</TableCell>
                    <TableCell>
                      {r.completed_at
                        ? new Date(r.completed_at).toLocaleDateString("en-IN")
                        : "—"}
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleView(r)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleUpdate(r)}
                        >
                          Update
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* 📝 UPDATE DIALOG */}
       <Dialog
  open={openDialog}
  onClose={() => setOpenDialog(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>
    Update Service Request #{selectedRow?.id}
  </DialogTitle>
<DialogContent dividers>
  <Typography fontWeight={600} mb={1}>
    Service Name: {serviceName}
  </Typography>

  <Typography mb={1}>
    Client ID: {selectedRow?.client_id}
  </Typography>

  <Typography mb={2}>
    Description: {selectedRow?.description || "—"}
  </Typography>

  {/* 🔥 SHOW UPDATE FIELDS ONLY IN UPDATE MODE */}
  {mode === "update" && (
    <>
      {/* STATUS */}
      <Typography variant="subtitle2" fontWeight={600} mb={1}>
        Status
      </Typography>

      <Select
        fullWidth
        size="small"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setDelayReason("");
          setCompletedAt("");
          setFile(null);
        }}
        sx={{ mb: 2 }}
      >
        <MenuItem value="in_progress">In Progress</MenuItem>
        <MenuItem value="completed">Completed</MenuItem>
        <MenuItem value="delayed">Delayed</MenuItem>
      </Select>

      {/* DELAY REASON */}
      {status === "delayed" && (
        <TextField
          label="Delay Reason"
          multiline
          rows={3}
          fullWidth
          required
          value={delayReason}
          onChange={(e) => setDelayReason(e.target.value)}
          sx={{ mb: 2 }}
        />
      )}

      {/* COMPLETED FIELDS */}
      {status === "completed" && (
        <>
          <TextField
            label="Completed Date & Time"
            type="datetime-local"
            fullWidth
            required
            value={completedAt}
            onChange={(e) => setCompletedAt(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />

          <Button component="label" variant="outlined" fullWidth sx={{ mb: 1 }}>
            Upload Document
            <input
              hidden
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </Button>

          {file && (
            <Typography variant="caption" color="success.main">
              ✓ File selected: {file.name}
            </Typography>
          )}
        </>
      )}
    </>
  )}
</DialogContent>


 <DialogActions>
  <Button onClick={() => setOpenDialog(false)} disabled={saving}>
    Close
  </Button>

  {/* Save button ONLY for UPDATE mode */}
  {mode === "update" && (
    <Button
      variant="contained"
      onClick={handleSave}
      disabled={saving}
    >
      {saving ? "Saving..." : "Save"}
    </Button>
  )}
</DialogActions>

</Dialog>

        {/* 📄 PAGINATION */}
        <TablePagination
          component="div"
          count={filteredRows.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10]}
          sx={{
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            },
          }}
        />

        {filteredRows.length === 0 && (
          <Box p={3} textAlign="center">
            <Typography>No service requests found</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}