import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import axios from "axios";

const PaymentForm = ({ open, onClose, bill, onSuccess }) => {
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState(null);

  useEffect(() => {
    if (open) {
      setTransactionId("");
      setScreenshot(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!transactionId || !screenshot) {
      alert("Transaction ID & Screenshot required");
      return;
    }

    const formData = new FormData();
    formData.append("bill_id", bill.id);
    formData.append("transaction_id", transactionId);
    formData.append("payment_screenshot", screenshot);

    await axios.post(
      `${process.env.REACT_APP_URL}/api/create/payments`,
      formData,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    alert("Payment submitted successfully");
    onSuccess();
  };

  if (!bill) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Pay Bill</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Bill ID" value={`BL - ${bill.id}`} disabled />

          <TextField label="Amount" value={`₹ ${bill.total_amount}`} disabled />

          <TextField
            label="Transaction ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            required
          />

          <Button variant="outlined" component="label">
            Upload Screenshot
            <input
              type="file"
              hidden
              required
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files[0])}
            />
          </Button>

          {screenshot && (
            <Typography variant="caption">{screenshot.name}</Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="success" onClick={handleSubmit}>
          Submit Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentForm;
