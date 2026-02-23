import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Card,
  CardContent,
  Stack,
  useMediaQuery,
  TextField,
  Button,
  Pagination,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import dayjs from "dayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const Payments = () => {
  const isMobile = useMediaQuery("(max-width:768px)");

  /* ---------------- STATES ---------------- */
  const [allPayments, setAllPayments] = useState([]);
  const [payments, setPayments] = useState([]);

  const [filters, setFilters] = useState({
    paymentId: "",
    billId: "",
    date: "",
  });

  const [page, setPage] = useState(1);
  const rowsPerPage = 6;

  const [openPreview, setOpenPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewType, setPreviewType] = useState("");

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    const res = await axios.get(
      `${process.env.REACT_APP_URL}/api/get/payments`,
      { withCredentials: true }
    );

    const sorted = [...res.data].sort(
      (a, b) => new Date(b.payment_date) - new Date(a.payment_date)
    );

    setAllPayments(sorted);
    setPayments(sorted);
  };

  /* ---------------- FILTER ---------------- */
  useEffect(() => {
    let data = [...allPayments];

    if (filters.paymentId) {
      data = data.filter((p) => p.id.toString().includes(filters.paymentId));
    }

    if (filters.billId) {
      data = data.filter((p) => p.bill_id.toString().includes(filters.billId));
    }

    if (filters.date) {
      data = data.filter(
        (p) => dayjs(p.payment_date).format("YYYY-MM-DD") === filters.date
      );
    } else {
      data.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
    }

    setPayments(data);
    setPage(1);
  }, [filters, allPayments]);

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(payments.length / rowsPerPage);
  const paginatedPayments = payments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  /* ---------------- PREVIEW ---------------- */
  const openPaymentPreview = async (paymentId) => {
    const res = await axios.get(
      `${process.env.REACT_APP_URL}/api/get/payments/view/${paymentId}`,
      {
        withCredentials: true,
        responseType: "blob",
        validateStatus: () => true,
      }
    );

    if (res.status !== 200 || !res.data) return;

    const blob = res.data;
    setPreviewUrl(URL.createObjectURL(blob));
    setPreviewType(blob.type === "application/pdf" ? "pdf" : "image");
    setOpenPreview(true);
  };

  const closePreview = () => {
    setOpenPreview(false);
    setPreviewUrl("");
    setPreviewType("");
  };

  /* ---------------- TABLE HEAD STYLE (SAME AS BILLS) ---------------- */
  const headStyle = {
    fontWeight: 700,
    color: "#2563eb",
    whiteSpace: "nowrap",
  };

  return (
    <Box p={2}>
      <Typography fontSize={28} fontWeight={600} mb={2}>
        Payments
      </Typography>

      {/* ================= FILTER BAR (BILLS STYLE) ================= */}
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
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            alignItems: { xs: "stretch", md: "center" },
          }}
        >
          <TextField
            size="small"
            placeholder="Payment ID"
            fullWidth
            value={filters.paymentId}
            onChange={(e) =>
              setFilters({ ...filters, paymentId: e.target.value })
            }
          />

          <TextField
            size="small"
            placeholder="Bill ID"
            fullWidth
            value={filters.billId}
            onChange={(e) => setFilters({ ...filters, billId: e.target.value })}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Payment Date"
              value={filters.date ? dayjs(filters.date) : null}
              onChange={(v) =>
                setFilters({
                  ...filters,
                  date: v ? v.format("YYYY-MM-DD") : "",
                })
              }
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                },
              }}
            />
          </LocalizationProvider>

          <Button
            variant="outlined"
            sx={{
              border: "1px solid #2563eb",
              width: { xs: "100%", md: "40%" },
              height: 40, // 👈 aligns with TextField height
              whiteSpace: "nowrap",
            }}
            onClick={() => setFilters({ paymentId: "", billId: "", date: "" })}
          >
            Reset
          </Button>
        </Box>
      </Paper>

      {/* ================= TABLE / CARDS ================= */}
      <Paper sx={{ p: 2, background: "#EEF3FF", mt: 3 }}>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: { xs: 14, md: 24 },
          }}
          mb={2}
        >
          View Past Payments
        </Typography>

        {/* -------- DESKTOP TABLE -------- */}
        {!isMobile && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={headStyle}>
                    Payment ID
                  </TableCell>
                  <TableCell align="center" sx={headStyle}>
                    Transaction ID
                  </TableCell>
                  <TableCell align="center" sx={headStyle}>
                    Bill ID
                  </TableCell>
                  <TableCell align="center" sx={headStyle}>
                    Date
                  </TableCell>
                  <TableCell align="center" sx={headStyle}>
                    Preview
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedPayments.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell align="center">PY - {p.id}</TableCell>
                    <TableCell align="center">{p.transaction_id}</TableCell>
                    <TableCell align="center">BL - {p.bill_id}</TableCell>
                    <TableCell align="center">
                      {dayjs(p.payment_date).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => openPaymentPreview(p.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {!paginatedPayments.length && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No payments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* -------- MOBILE CARDS (BILLS STYLE) -------- */}
        {isMobile &&
          paginatedPayments.map((p) => (
            <Paper key={p.id} sx={{ p: 2, mb: 2 }}>
              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight={600}>PY - {p.id}</Typography>
                <IconButton
                  color="primary"
                  onClick={() => openPaymentPreview(p.id)}
                >
                  <VisibilityIcon />
                </IconButton>
              </Box>

              <Typography variant="body2">
                Transaction: {p.transaction_id}
              </Typography>
              <Typography variant="body2">Bill: BL - {p.bill_id}</Typography>
              <Typography variant="body2">
                Date: {dayjs(p.payment_date).format("DD/MM/YYYY")}
              </Typography>
            </Paper>
          ))}

        {/* -------- PAGINATION -------- */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, v) => setPage(v)}
              color="primary"
              shape="rounded"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Paper>

      {/* ================= PREVIEW ================= */}
      <Dialog open={openPreview} onClose={closePreview} maxWidth="md" fullWidth>
        <DialogTitle>Payment Preview</DialogTitle>
        <DialogContent>
          {previewType === "image" && (
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                width: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
              }}
            />
          )}

          {previewType === "pdf" && (
            <iframe
              src={previewUrl}
              title="PDF"
              style={{
                width: "100%",
                height: "70vh",
                border: "none",
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Payments;
