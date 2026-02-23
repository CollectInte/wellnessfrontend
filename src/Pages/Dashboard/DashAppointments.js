import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Divider,
  Button,
  colors,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const formatTime = (t) => (t ? t.slice(0, 5) : "-");

const statusColor = (status) => {
  if (status === "assigned") return "#2563eb";
  if (status === "approved") return "#16a34a";
  return "#374151";
};

const DashAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  // const fetchAppointments = async () => {
  //   try {
  //     const res = await axios.get(
  //       `${process.env.REACT_APP_URL}/appointment/client/appointment`,
  //       { withCredentials: true }
  //     );

  //     const list = Array.isArray(res.data) ? res.data : [];
  //     const today = new Date().toISOString().split("T")[0];

  //     const upcoming = list
  //       .filter((a) => a.date >= today && a.status !== "cancelled")
  //       .sort((a, b) => {
  //         if (a.date !== b.date) return a.date.localeCompare(b.date);
  //         return a.from_time.localeCompare(b.from_time);
  //       });

  //     // ✅ Show only 3 appointments
  //     setAppointments(upcoming.slice(0, 4));
  //   } catch (err) {
  //     setError("Failed to load appointments");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_URL}/appointment/client/appointment`,
        { withCredentials: true }
      );

      const list = Array.isArray(res.data) ? res.data : [];
      const today = new Date().toISOString().split("T")[0];

      const todaysAppointments = list
        .filter((a) => a.date === today && a.status !== "cancelled")
        .sort((a, b) => a.from_time.localeCompare(b.from_time));

      // ✅ show max 4 today
      setAppointments(todaysAppointments.slice(0, 4));
    } catch (err) {
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography fontWeight={600} fontSize={18}>
          Appointments
        </Typography>

        <Button
          onClick={() => navigate("/client/appointment")}
          sx={{
            mt: "auto", // ✅ pushes button to bottom
          }}
        >
          See More
        </Button>
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ mt: 1.5 }}>
        {loading && <Typography textAlign="center">Loading...</Typography>}

        {!loading && error && (
          <Typography color="error" textAlign="center">
            {error}
          </Typography>
        )}

        {!loading && !error && appointments.length === 0 && (
          <Typography textAlign="center">No Appointments Today</Typography>
        )}

        <Stack spacing={1.5}>
          {!loading &&
            appointments.map((item) => (
              <Box
                key={item.id}
                sx={{
                  bgcolor: "#ffffff",
                  p: 1.2,
                  borderRadius: 2,
                  height: "12vh",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                }}
              >
                <Typography
                  fontSize={16}
                  fontWeight={600}
                  sx={{ color: statusColor(item.status) }}
                >
                  Purpose: {item.purpose}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography fontSize={13} fontWeight={"bold"}>
                    <span style={{ color: "#2563eb" }}>Date:</span>
                    {item.date}
                  </Typography>

                  <Typography fontSize={13} fontWeight={"bold"}>
                    <span style={{ color: "#2563eb" }}>Time:</span>
                    {formatTime(item.from_time)} - {formatTime(item.to_time)}
                  </Typography>
                </Box>

                <Typography fontSize={14} fontWeight={300}>
                  Status: {item.status}
                </Typography>
              </Box>
            ))}
        </Stack>
      </Box>
    </Paper>
  );
};

export default DashAppointments;
