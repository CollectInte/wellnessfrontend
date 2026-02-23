import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  CircularProgress,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

const InvoicePreviewModal = ({ open, billId, onClose }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !billId) return;

    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_URL}/api/invoices/${billId}/download`,
          {
            withCredentials: true,
            responseType: "blob",
          }
        );

        const blob = new Blob([res.data], { type: "application/pdf" });
        setPdfUrl(URL.createObjectURL(blob));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [open, billId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}                 // ⛔ disable MUI sizing
      PaperProps={{
        sx: {
          width: 900,                  // ✅ FIXED WIDTH
          height: 600,                 // ✅ FIXED HEIGHT
          maxWidth: "none",
        },
      }}
    >
      <DialogTitle sx={{ pr: 5 }}>
        Invoice Preview
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, height: "100%" }}>
        {loading ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          pdfUrl && (
            <iframe
              src={pdfUrl}
              title="Invoice Preview"
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreviewModal;
