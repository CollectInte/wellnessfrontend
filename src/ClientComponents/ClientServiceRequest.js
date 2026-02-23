import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Paper,
  Stack,
} from "@mui/material";
import { Pagination } from "@mui/material";
import axios from "axios";
import ServiceRequestForm from "./ServiceRequestForm";
import ServiceRequestViewModal from "./ServiceRequestViewModal";
import KeyboardDoubleArrowRightRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
const ClientServiceRequestPage = () => {
  const [openForm, setOpenForm] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  const [allRequests, setAllRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [complianceMap, setComplianceMap] = useState({});

  const [filters, setFilters] = useState({
    requestId: "",
    priority: "",
    status: "",
    preferredDate: "",
  });

  const [filterOptions, setFilterOptions] = useState({
    requestIds: [],
    priorities: [],
    statuses: [],
  });
  // -------------------------
  // FETCH SERVICE REQUESTS
  // -------------------------
  const fetchServiceRequests = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_URL}/service/client/service-request`,
        { withCredentials: true }
      );

      const list = Array.isArray(res.data) ? res.data : [];
      setAllRequests(list);
      list.forEach((req) => {
        if (req.compliance_type_id) {
          fetchComplianceById(req.compliance_type_id);
        }
      });
      setFilteredRequests(list);
    } catch (err) {
      console.error("FETCH ERROR:", err);
      setAllRequests([]);
      setFilteredRequests([]);
    }
  };

  // -------------------------
  // FETCH FILTER OPTIONS
  // -------------------------

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  // -------------------------
  // BUILD FILTER OPTIONS FROM DATA
  // -------------------------
  useEffect(() => {
    if (!allRequests.length) return;

    const requestIds = [...new Set(allRequests.map((r) => r.id))];

    const priorities = [
      ...new Set(allRequests.map((r) => r.priority).filter(Boolean)),
    ];

    const statuses = [
      ...new Set(allRequests.map((r) => r.status).filter(Boolean)),
    ];

    setFilterOptions({
      requestIds,
      priorities,
      statuses,
    });
  }, [allRequests]);

  // -------------------------
  // APPLY FILTERS
  // -------------------------
  useEffect(() => {
    let data = [...allRequests];

    if (filters.requestId) {
      data = data.filter((r) => r.id === Number(filters.requestId));
    }

    if (filters.priority) {
      data = data.filter((r) => r.priority === filters.priority);
    }

    if (filters.status) {
      data = data.filter((r) => r.status === filters.status);
    }

    // ✅ IF DATE SELECTED → FILTER
    if (filters.preferredDate) {
      data = data.filter((r) => {
        const dbDate = new Date(r.preferred_date).toISOString().split("T")[0];
        return dbDate === filters.preferredDate;
      });
    }
    // ✅ IF NO DATE SELECTED → TODAY FIRST
    else {
      const today = dayjs().format("YYYY-MM-DD");

      data = [...data].sort((a, b) => {
        const aDate = new Date(a.preferred_date).toISOString().split("T")[0];
        const bDate = new Date(b.preferred_date).toISOString().split("T")[0];

        const aIsToday = aDate === today;
        const bIsToday = bDate === today;

        if (aIsToday && !bIsToday) return -1;
        if (!aIsToday && bIsToday) return 1;
        return 0;
      });
    }

    setFilteredRequests(data);
    setPage(1);
  }, [filters, allRequests]);

  // -------------------------
  // FETCH Fetch Compliance Type Name By Id
  // -------------------------
  const fetchComplianceById = async (id) => {
    // already fetched → no API call
    if (complianceMap[id]) return;

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_URL}/api/getcompliancetypes/${id}`,
        { withCredentials: true }
      );

      // API format: { success, data }
      setComplianceMap((prev) => ({
        ...prev,
        [id]: res.data.data.name,
      }));
    } catch (err) {
      console.error("Compliance fetch error", err);
    }
  };

  // -------------------------
  // Paginated Requests
  // -------------------------
  const [page, setPage] = useState(1);
  const rowsPerPage = 6;
  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);

  const paginatedRequests = filteredRequests.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Box
      sx={{
        px: { xs: 0, md: 2 },
        py: { xs: 2, md: 4 },
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: 22, md: 26 },
          fontWeight: 600,
        }}
      >
        Service Request
      </Typography>

      {/* FILTERS */}
      <Paper
        sx={{
          p: 2,
          mt: 2,
          borderRadius: 3,
          border: "1px solid #2563eb",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          {/* Request ID */}
          <Box sx={{ flex: "1 1 160px", minWidth: 160 }}>
            <TextField
              fullWidth
              size="small"
              label="Request ID"
              value={filters.requestId}
              onChange={(e) =>
                setFilters({ ...filters, requestId: e.target.value })
              }
            />
          </Box>

          {/* Priority */}
          <Box sx={{ flex: "1 1 160px", minWidth: 160 }}>
            <TextField
              fullWidth
              size="small"
              select
              label="Priority"
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value })
              }
            >
              <MenuItem value="">All</MenuItem>
              {filterOptions.priorities.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Status */}
          <Box sx={{ flex: "1 1 160px", minWidth: 160 }}>
            <TextField
              fullWidth
              size="small"
              select
              label="Status"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <MenuItem value="">All</MenuItem>
              {filterOptions.statuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Preferred Date */}
          <Box sx={{ flex: "1 1 160px", minWidth: 160 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Preferred Date"
                value={
                  filters.preferredDate ? dayjs(filters.preferredDate) : null
                }
                onChange={(newValue) =>
                  setFilters({
                    ...filters,
                    preferredDate: newValue
                      ? newValue.format("YYYY-MM-DD")
                      : "",
                  })
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
              />
            </LocalizationProvider>
          </Box>

          {/* Reset Button */}
          <Box sx={{ flex: "1 1 140px", minWidth: 140 }}>
            <Button
              fullWidth
              sx={{ height: 40, border: "solid 1px #2563eb" }}
              onClick={() =>
                setFilters({
                  requestId: "",
                  priority: "",
                  status: "",
                  preferredDate: "", // ✅ clears calendar
                })
              }
            >
              Reset
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* TABLE */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: "#ebeffd" }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          borderBottom="1px solid #2563eb"
          py={1.5}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: { xs: 14, md: 24 },
            }}
          >
            View Past Service Requests
          </Typography>

          <Button
            sx={{
              bgcolor: "#2563eb",
              color: "#fff",
              fontSize: { xs: 10, md: 16 },
            }}
            onClick={() => setOpenForm(true)}
          >
            Make Service Requests
          </Button>
        </Box>

        {/* Header */}
        <Box
          display={{ xs: "none", md: "flex" }}
          py={2}
          fontWeight={600}
          sx={{ color: "#2563eb" }}
        >
          <Box flex={1}>Request ID</Box>
          <Box flex={2}>Compliance</Box>
          <Box flex={1}>Priority</Box>
          <Box flex={1}>Status</Box>
          <Box flex={1}>Created</Box>
          <Box flex={1}>Action</Box>
        </Box>

        {/* Rows */}
        {paginatedRequests.length === 0 ? (
          <Box py={4} textAlign="center">
            <Typography>No Data Available</Typography>
          </Box>
        ) : (
          paginatedRequests.map((row) => (
            <Box key={row.id} py={2} borderTop="1px solid #2563eb">
              {/* Desktop */}
              <Box display={{ xs: "none", md: "flex" }}>
                <Box flex={1}>{row.id}</Box>

                <Box flex={2}>
                  {complianceMap[row.compliance_type_id] || "Loading..."}
                </Box>

                <Box flex={1}>{row.priority}</Box>
                <Box flex={1}>{row.status}</Box>

                <Box flex={1}>
                  {new Date(row.created_at).toLocaleDateString("en-IN")}
                </Box>

                <Box flex={1} display="flex" gap={1}>
                  <Button
                    size="small"
                    color="warning"
                    onClick={() => {
                      setEditData(row);
                      setIsEdit(true);
                      setOpenForm(true);
                    }}
                    sx={{ border: "1px solid #ED6C02" }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedRequest(row);
                      setOpenView(true);
                    }}
                    sx={{ border: "1px solid #1976D2" }}
                  >
                    View
                    <KeyboardDoubleArrowRightRoundedIcon />
                  </Button>
                </Box>
              </Box>

              {/* Mobile */}
              <Stack
                display={{ xs: "flex", md: "none" }}
                sx={{
                  gap: 1,
                }}
              >
                <Typography>
                  <b>ID:</b> {row.id}
                </Typography>

                <Typography>
                  <b>Compliance:</b>
                  {complianceMap[row.compliance_type_id] || "Loading..."}
                </Typography>

                <Typography>
                  <b>Status:</b> {row.status}
                </Typography>
                <Typography>
                  <b>Created:</b>
                  {new Date(row.created_at).toLocaleDateString("en-IN")}
                </Typography>

                <Box display={"flex"} justifyContent={"space-around"}>
                  <Button
                    size="small"
                    color="warning"
                    onClick={() => {
                      setEditData(row);
                      setIsEdit(true);
                      setOpenForm(true);
                    }}
                    sx={{ border: "1px solid #ED6C02" }}
                  >
                    Edit
                  </Button>{" "}
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedRequest(row);
                      setOpenView(true);
                    }}
                    sx={{ border: "1px solid #1976D2" }}
                  >
                    View
                    <KeyboardDoubleArrowRightRoundedIcon />
                  </Button>
                </Box>
              </Stack>
            </Box>
          ))
        )}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              shape="rounded"
              showFirstButton
              showLastButton
              siblingCount={1} // prev, current, next = 3 pages
              boundaryCount={1} // hide extra start/end numbers
            />
          </Box>
        )}
      </Paper>

      {/* MODALS */}
      <ServiceRequestForm
        open={openForm}
        isEdit={isEdit}
        editData={editData}
        onClose={() => {
          setOpenForm(false);
          setEditData(null);
          setIsEdit(false);
          fetchServiceRequests();
        }}
      />

      <ServiceRequestViewModal
        open={openView}
        onClose={() => setOpenView(false)}
        data={selectedRequest}
      />
    </Box>
  );
};

export default ClientServiceRequestPage;
