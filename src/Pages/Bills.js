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
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import PaymentForm from "./PaymentForm";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const Bills = () => {
  const isMobile = useMediaQuery("(max-width:768px)");

  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [openPayment, setOpenPayment] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const handlePayClick = (bill) => {
    setSelectedBill(bill);
    setOpenPayment(true);
  };

  const handleClosePayment = () => {
    setOpenPayment(false);
    setSelectedBill(null);
  };

  const [filters, setFilters] = useState({
    billId: "",
    requestId: "",
    status: "",
    date: "", // ✅ NEW (default null)
  });

  const [page, setPage] = useState(1);
  const rowsPerPage = 6;

  // ---------------- FETCH ----------------
  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    const res = await axios.get(
      `${process.env.REACT_APP_URL}/bill/client/bills`,
      { withCredentials: true }
    );
    setBills(res.data);
    setFilteredBills(res.data);
  };

  // ---------------- FILTER ----------------
  useEffect(() => {
    let data = [...bills];

    if (filters.billId) {
      data = data.filter((b) => b.id.toString().includes(filters.billId));
    }

    if (filters.requestId) {
      data = data.filter((b) => b.request_id === Number(filters.requestId));
    }

    if (filters.status) {
      data = data.filter((b) => b.bill_status === filters.status);
    }

    // ✅ IF DATE SELECTED → FILTER
    if (filters.date) {
      data = data.filter((b) => {
        const billDate = dayjs(b.created_at).format("YYYY-MM-DD");
        return billDate === filters.date;
      });
    }
    // ✅ IF NO DATE → NEWEST FIRST
    else {
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredBills(data);
    setPage(1);
  }, [filters, bills]);

  const handleReset = () => {
    setFilters({
      billId: "",
      requestId: "",
      status: "",
      date: "", // ✅ clear calendar
    });
    setFilteredBills(bills);
    setPage(1);
  };

  // ---------------- PAGINATION ----------------
  const totalPages = Math.ceil(filteredBills.length / rowsPerPage);
  const paginatedBills = filteredBills.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleDownload = (invoiceId) => {
    const url = `${process.env.REACT_APP_URL}/api/invoices/${invoiceId}/download`;

    // open in new tab → forces file download
    window.open(url, "_blank");
  };

  //table head styling
  const headStyle = {
    fontWeight: 700,
    color: "#2563eb",
    whiteSpace: "nowrap",
  };

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
        mb={2}
      >
        Bills
      </Typography>

      {/* ================= FILTER BAR ================= */}
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
          {/* Bill ID */}
          <Box sx={{ flex: "1 1 160px", minWidth: 160 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Bill ID"
              value={filters.billId}
              onChange={(e) =>
                setFilters({ ...filters, billId: e.target.value })
              }
            />
          </Box>

          {/* Request ID */}
          <Box sx={{ flex: "1 1 160px", minWidth: 160 }}>
            <TextField
              fullWidth
              size="small"
              select
              label="Request ID"
              value={filters.requestId}
              onChange={(e) =>
                setFilters({ ...filters, requestId: e.target.value })
              }
            >
              <MenuItem value="">All</MenuItem>
              {[...new Set(bills.map((b) => b.request_id))].map((id) => (
                <MenuItem key={id} value={id}>
                  RQ - {id}
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
              {[...new Set(bills.map((b) => b.bill_status))].map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Date Filter */}
          <Box sx={{ flex: "1 1 160px", minWidth: 160 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Bill Date"
                value={filters.date ? dayjs(filters.date) : null}
                onChange={(newValue) =>
                  setFilters({
                    ...filters,
                    date: newValue ? newValue.format("YYYY-MM-DD") : "",
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
              variant="outlined"
              sx={{ border: "1px solid #2563eb" }}
              onClick={handleReset}
            >
              Reset
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* ================= TABLE / LIST ================= */}
      <Paper sx={{ p: 2, background: "#EEF3FF", mt: 3 }}>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: { xs: 14, md: 24 },
          }}
          mb={2}
        >
          View Past Bills
        </Typography>

        {/* -------- DESKTOP TABLE -------- */}
        {!isMobile && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={headStyle}>
                    Bill ID
                  </TableCell>
                  <TableCell align="center" sx={headStyle}>
                    Request ID
                  </TableCell>
                  <TableCell align="right" sx={headStyle}>
                    Total Amount
                  </TableCell>
                  <TableCell align="center" sx={headStyle}>
                    Status
                  </TableCell>
                  <TableCell align="center" sx={headStyle}>
                    Due Date
                  </TableCell>
                  <TableCell align="left" sx={headStyle}>
                    Note
                  </TableCell>
                  <TableCell align="center" sx={headStyle}>
                    Date
                  </TableCell>
                  <TableCell align="center" sx={headStyle}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedBills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Box py={4}>
                        <Typography>No Data Available</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBills.map((b) => (
                    <TableRow key={b.id} hover>
                      <TableCell align="center">BL - {b.id}</TableCell>

                      <TableCell align="center">RQ - {b.request_id}</TableCell>

                      <TableCell align="right">₹ {b.total_amount}</TableCell>

                      <TableCell align="center">
                        <Chip
                          label={b.bill_status}
                          size="small"
                          color={
                            b.bill_status === "Paid"
                              ? "success"
                              : b.bill_status === "Overdue"
                              ? "error"
                              : "warning"
                          }
                        />
                      </TableCell>

                      <TableCell align="center">
                        {dayjs(b.due_date).format("DD/MM/YYYY")}
                      </TableCell>

                      <TableCell align="left">{b.notes || "-"}</TableCell>

                      <TableCell align="center">
                        {dayjs(b.created_at).format("DD/MM/YYYY")}
                      </TableCell>

                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={b.bill_status === "Cancelled"}
                            onClick={() => handleDownload(b.id)}
                            startIcon={<DownloadForOfflineIcon />}
                          >
                            Invoice
                          </Button>

                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            disabled={b.bill_status === "Paid"}
                            onClick={() => handlePayClick(b)}
                          >
                            Pay
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* -------- MOBILE CARD VIEW -------- */}
        {isMobile &&
          (paginatedBills.length === 0 ? (
            <Box py={4}>
              <Typography textAlign="center">No Data Available</Typography>
            </Box>
          ) : (
            paginatedBills.map((b) => (
              <Paper
                key={b.id}
                sx={{ p: 2, mb: 2, display: { xs: "flex", md: "none" } }}
              >
                <Box
                  sx={{
                    gap: 1,
                    flexDirection: "column",
                    display: { xs: "flex", md: "none" },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography fontWeight={600}>BL - {b.id}</Typography>
                    <Chip
                      label={b.bill_status}
                      size="small"
                      color={
                        b.bill_status === "Paid"
                          ? "success"
                          : b.bill_status === "Overdue"
                          ? "error"
                          : "warning"
                      }
                    />
                  </Box>

                  <Typography variant="body2">
                    Request: CL - {b.request_id}
                  </Typography>

                  <Typography variant="body2">
                    Amount: ₹ {b.total_amount}
                  </Typography>

                  <Typography variant="body2">
                    Due: {dayjs(b.due_date).format("DD/MM/YYYY")}
                  </Typography>

                  <Stack direction="row" spacing={1} mt={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={b.bill_status === "Cancelled"}
                      onClick={() => handleDownload(b.id)}
                      endIcon={<DownloadForOfflineIcon />}
                    >
                      Invoice
                    </Button>

                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      disabled={b.bill_status === "Paid"}
                      onClick={() => handlePayClick(b)}
                    >
                      Pay
                    </Button>
                  </Stack>
                </Box>
              </Paper>
            ))
          ))}

        {/* -------- PAGINATION -------- */}
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
            />
          </Box>
        )}
      </Paper>
      <PaymentForm
        open={openPayment}
        bill={selectedBill}
        onClose={handleClosePayment}
        onSuccess={() => {
          handleClosePayment();
          fetchBills();
        }}
      />
    </Box>
  );
};

export default Bills;
