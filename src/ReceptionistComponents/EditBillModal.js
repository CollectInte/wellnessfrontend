import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
  Box,
} from "@mui/material";
import axios from "axios";
import { COLORS } from "./Themes";

const BILL_STATUSES = ["Pending", "Paid", "Overdue", "Cancelled"];

const EditBillModal = ({ open, bill, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    subtotal: "",
    tax: "",
    total_amount: "",
    bill_status: "Pending",
    notes: "",
  });

  // Populate form when bill changes
  useEffect(() => {
    if (bill) {
      setForm({
        subtotal: bill.subtotal ?? "",
        tax: bill.tax ?? "",
        total_amount: bill.total_amount ?? "",
        bill_status: bill.bill_status ?? "Pending",
        notes: bill.notes ?? "",
      });
    }
  }, [bill]);

  // 🔢 Auto-calculate total
  useEffect(() => {
    const subtotal = parseFloat(form.subtotal) || 0;
    const tax = parseFloat(form.tax) || 0;

    setForm((prev) => ({
      ...prev,
      total_amount: (subtotal + tax).toFixed(2),
    }));
  }, [form.subtotal, form.tax]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_URL}/bill/bills/${bill.bill_id}`,
        {
          subtotal: form.subtotal,
          tax: form.tax,
          total_amount: form.total_amount,
          bill_status: form.bill_status,
          notes: form.notes,
        },
        { withCredentials: true },
      );

      onUpdated();
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  if (!bill) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Bill</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              gap: 3,
            }}
          >
            <TextField
              label="Subtotal"
              name="subtotal"
              type="number"
              fullWidth
              size="small"
              value={form.subtotal}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />

            <TextField
              label="Tax"
              name="tax"
              type="number"
              size="small"
              fullWidth
              value={form.tax}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              gap: 3,
            }}
          >
            <TextField
              label="Total Amount"
              name="total_amount"
              size="small"
              fullWidth
              value={form.total_amount}
              InputProps={{ readOnly: true }}
            />

            <TextField
              select
              label="Bill Status"
              name="bill_status"
              size="small"
              fullWidth
              value={form.bill_status}
              onChange={handleChange}
            >
              {BILL_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            label="Notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            multiline
            rows={3}
            placeholder="Add internal notes or remarks..."
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button sx={{ color: COLORS.primary }} onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{ bgcolor: COLORS.primary }}
          onClick={handleSubmit}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditBillModal;
