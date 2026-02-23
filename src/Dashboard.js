import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NotificationBell from './NotificationBell';

export default function HealthcareDashboard() {
  const [time, setTime] = useState(new Date());
  const [clockedIn, setClockedIn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#f5f9f9" }}>
      {/* ================= Sidebar ================= */}
      <Box
        sx={{
          width: { xs: 70, md: 240 },
          background: "#4f7f87",
          color: "#fff",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Healthcare
        </Typography>

        {["Dashboard", "Documents", "Appointments", "Bill Payments", "Reviews"].map(
          (item) => (
            <Box
              key={item}
              sx={{
                cursor: "pointer",
                p: 1,
                borderRadius: 2,
                "&:hover": { background: "rgba(255,255,255,0.2)" },
              }}
            >
              {item}
            </Box>
          )
        )}
      </Box>

      {/* ================= Main Content ================= */}
      <Box sx={{ flex: 1, p: 2 }}>
        {/* Header */}
        <Box
          sx={{
            background: "#457b85",
            color: "#fff",
            p: 2,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            Dashboard
          </Typography>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              size="small"
              placeholder="Search"
              InputProps={{ startAdornment: <SearchIcon /> }}
              sx={{ background: "#fff", borderRadius: 2 }}
            />
            {/* <IconButton> */}
              {/* <NotificationsNoneIcon sx={{ color: "#fff" }} /> */}
            {/* </IconButton> */}
            <NotificationBell />
          </Box>
        </Box>

        {/* ================= Grid Content ================= */}
        <Grid container spacing={2}>
          {/* Welcome */}
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                background: "linear-gradient(90deg, #0f766e, #6aaeb3)",
                color: "#fff",
                p: 3,
                borderRadius: 3,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="h4" fontWeight={600}>
                  Hello Dr. John Wick
                </Typography>
                <Typography>Good Morning</Typography>
                <Typography>Have a good day</Typography>
              </Box>
              <AccessTimeIcon sx={{ fontSize: 80, opacity: 0.4 }} />
            </Box>
          </Grid>

          {/* Clock */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, height: "100%", background: "#006d6f", color: "#fff" }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6">Clock In / Out</Typography>
                <Typography variant="h4">{time.toLocaleTimeString()}</Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2, background: "#0fb9b1" }}
                  onClick={() => setClockedIn(!clockedIn)}
                >
                  {clockedIn ? "Clock Out" : "Clock In"}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Stats */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography fontWeight={600}>Your Shift</Typography>
                <Typography color="text.secondary">09:00 AM</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography fontWeight={600}>Daily Visitors</Typography>
                <Typography variant="h5">45</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography fontWeight={600}>Appointments</Typography>
                <Typography variant="h5">8</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Appointments */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography fontWeight={600} mb={2}>
                  Today Appointments
                </Typography>
                {[1, 2, 3].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                      p: 1,
                      borderRadius: 2,
                      boxShadow: 1,
                    }}
                  >
                    <Avatar />
                    <Box>
                      <Typography fontWeight={600}>Rohit Sharma</Typography>
                      <Typography fontSize={12}>Brain Problem</Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Attendance */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography fontWeight={600}>Past Attendance</Typography>
                <Typography>08:00 hrs</Typography>
                <Typography color="text.secondary">
                  09:00 am - 06:00 pm
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
