import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Divider, Grid } from "@mui/material";
import axios from "axios";
import { useSocket } from "../context/SocketContext";
import DashServiceRequests from "./Dashboard/DashServiceRequests";
import DashAppointments from "./Dashboard/DashAppointments";
import TaxCalculatorsPage from "./Calculator";
import DepreciationCalculator from "../StaffComponents/DepriciationCalculator";
import BaseGSTCalculator from "../StaffComponents/BaseGSTcalculator";

const Dashboard = () => {
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);

  const BASE_URL = process.env.REACT_APP_URL;

  const fetchNotifications = async () => {
    const res = await axios.get(`${BASE_URL}/news/notifications`, {
      withCredentials: true,
    });
    setNotifications(res.data);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 🔔 Real-time update
  useEffect(() => {
    if (!socket) return;

    socket.on("new-notification", () => {
      fetchNotifications();
    });

    return () => socket.off("new-notification");
  }, [socket]);

  return (
    <>
      <Box sx={{ px: { xs: 0, md: 2 }, py: { xs: 2, md: 4 }, minHeight: "100vh" }}>
        <Typography sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 600 }}>
          Dashboard
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mt: 2,
            flexDirection: { xs: "column", lg: "row" },
          }}
        >
          {/* LEFT : NOTIFICATIONS */}
          <Paper
            elevation={0}
            sx={{
              flex: { lg: 3 },
              bgcolor: "#dbe6fb",
              borderRadius: 4,
              order: { xs: 2, lg: 1 },
            }}
          >
            {/* Header */}
            <Box sx={{ display: "flex", px: 3, py: 2, fontWeight: 600, color: "#1e88e5" }}>
              <Box sx={{ width: 80 }}>Date</Box>
              <Box>Notifications</Box>
            </Box>

            <Divider />

            {/* Notifications List */}
            <Box>
              {notifications.length === 0 && (
                <Typography sx={{ p: 3 }}>No notifications</Typography>
              )}

              {notifications.map((n) => {
                const date = new Date(n.created_at);

                return (
                  <Box key={n.id}>
                    <Box
                      sx={{
                        display: "flex",
                        px: 2,
                        py: 2,
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      {/* Date */}
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          border: "1px solid #9aa4b2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 600,
                          textAlign: "center",
                          lineHeight: 1.2,
                        }}
                      >
                        {date.toLocaleString("en-IN", { month: "short" })}
                        <br />
                        {date.getDate()}
                      </Box>

                      {/* Text */}
                      <Typography variant="body2">
                        <b>{n.title}</b>
                        <br />
                        {n.message}
                      </Typography>
                    </Box>
                    <Divider />
                  </Box>
                );
              })}
            </Box>
          </Paper>

          {/* RIGHT SIDE */}
          <Box sx={{ flex: { lg: 4 }, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
              <DashServiceRequests />
              <DashAppointments />
            </Box>
          </Box>
        </Box>
        
      </Box>
    </>
  );
};

export default Dashboard;
