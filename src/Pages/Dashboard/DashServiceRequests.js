import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Divider,
  Button,
  Chip,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DashServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [complianceMap, setComplianceMap] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  // -------------------------
  // FETCH SERVICE REQUESTS
  // -------------------------
  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_URL}/service/client/service-request`,
        { withCredentials: true }
      );

      let list = Array.isArray(res.data) ? res.data : [];

      // ✅ latest first
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // ✅ fetch compliance names
      list.forEach((r) => {
        if (r.compliance_type_id) fetchCompliance(r.compliance_type_id);
      });

      // ✅ dashboard = show only 3
      setRequests(list.slice(0, 4));
    } catch (err) {
      console.error("Dashboard SR error", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // FETCH COMPLIANCE NAME
  // -------------------------
  const fetchCompliance = async (id) => {
    if (complianceMap[id]) return;

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_URL}/api/getcompliancetypes/${id}`,
        { withCredentials: true }
      );

      setComplianceMap((prev) => ({
        ...prev,
        [id]: res.data.data.name,
      }));
    } catch (err) {
      console.error("Compliance fetch failed", err);
    }
  };

  return (
    <Paper
      sx={{
        bgcolor: "#DDE6FA",
        borderRadius: 3,
        p: 2,
        width: "100%",
      }}
    >
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography fontWeight={600} fontSize={18}>
          Recent Requested Services
        </Typography>
        <Button onClick={() => navigate("/client/services")} >
          See More
        </Button>
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ mt: 1.5 }}>
        {loading ? (
          <Typography align="center">Loading...</Typography>
        ) : requests.length === 0 ? (
          <Typography align="center">No Service Requests</Typography>
        ) : (
          <Stack spacing={1.5}>
            {requests.map((r) => (
              <Paper
                key={r.id}
                sx={{
                  p: 1.5,
                  borderLeft: "4px solid #2563eb",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography fontWeight={600}>Request #{r.id}</Typography>

                  <Chip
                    size="small"
                    label={r.status}
                    variant="outline"
                    color={r.status === "pending" ? "warning" : "success"}
                  />
                </Box>

                <Typography fontSize={13}>
                  Compliance:
                  <b>{complianceMap[r.compliance_type_id] || "Loading..."}</b>
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography fontSize={12} color="text.secondary" mt={0.5}>
                    Preferred:
                    {new Date(r.preferred_date).toLocaleDateString("en-IN")}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={0.5}>
                    <Chip
                      size="small"
                      label={r.priority}
                      color={
                        r.priority === "high"
                          ? "error"
                          : r.priority === "medium"
                          ? "warning"
                          : "default"
                      }
                    />
                  </Stack>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Paper>
  );
};

export default DashServiceRequests;
