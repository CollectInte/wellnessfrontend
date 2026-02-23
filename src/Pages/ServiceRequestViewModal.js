import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Stack,
  Divider,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import axios from "axios";

const ServiceRequestViewModal = ({ open, onClose, data }) => {
  const [compliance, setCompliance] = useState(null);

  useEffect(() => {
    if (data?.compliance_type_id && open) {
      fetchCompliance(data.compliance_type_id);
    }
  }, [data, open]);

  const fetchCompliance = async (id) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_URL}/api/getcompliancetypes/${id}`,
        { withCredentials: true }
      );

      // ✅ FIXED HERE
      setCompliance(res.data.data);
    } catch (err) {
      console.error("Compliance fetch error", err);
      setCompliance(null);
    }
  };

  if (!data) return null;

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN") : "N/A";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {/* HEADER */}
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography fontWeight={600}>Service Request Details</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon sx={{color:"red"}}/>
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={1.2}>
          <Typography>
            <b>Request ID:</b> {data.id}
          </Typography>

          {/* ✅ DEPENDENT COMPLIANCE DATA */}
          <Typography>
            <b>Compliance Type:</b>
            {compliance ? compliance.name : "Loading..."}
          </Typography>

          <Divider />

          <Typography>
            <b>Priority:</b> {data.priority}
          </Typography>
          <Typography>
            <b>Status:</b> {data.status}
          </Typography>

          <Divider />

          <Typography>
            <b>Preferred Date:</b> {formatDate(data.preferred_date)}
          </Typography>
          <Typography>
            <b>Assigned At:</b> {formatDate(data.assigned_at)}
          </Typography>
          <Typography>
            <b>Completed At:</b> {formatDate(data.completed_at)}
          </Typography>
          <Typography>
            <b>Created At:</b> {formatDate(data.created_at)}
          </Typography>

          <Divider />

          <Typography>
            <b>Delay Reason:</b>
          </Typography>
          <Typography color="text.secondary">
            {data.delay_reason || "No delay"}
          </Typography>

          <Divider />

          <Typography>
            <b>Description:</b>
          </Typography>
          <Typography color="text.secondary">{data.description}</Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceRequestViewModal;
