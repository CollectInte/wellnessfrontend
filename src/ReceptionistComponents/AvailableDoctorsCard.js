import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "./services/api"; // adjust path if needed

const AvailableDoctorsCard = () => {
  const navigate = useNavigate();

  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [pastAttendance, setPastAttendance] = useState([]);

  useEffect(() => {
    fetchAvailableDoctors();
  }, []);

  const fetchAvailableDoctors = async () => {
    try {
      setAttendanceLoading(true);

      const res = await api.get("/api/available-doctors");

      if (res.data.success) {
        setPastAttendance(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching available doctors", error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  return (
    <Grid item xs={12} sm={12} md={5} sx={{ width: { md: "400px", xs: "100%" } }}>
      <Card sx={{ bgcolor: "#dfeeee", borderRadius: 3, boxShadow: "none" }}>
        <CardContent sx={{ p: 1 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography sx={{ fontWeight: 700, color: "#0b7c7a" }}>
              Available Doctors
            </Typography>

            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
              onClick={() => navigate('/receptionist/dashboard/schedule')}
            >
              See All &gt;
            </Typography>
          </Box>

          {/* Content */}
          {attendanceLoading ? (
            <Typography align="center">Loading...</Typography>
          ) : pastAttendance.length === 0 ? (
            <Typography align="center" fontSize="0.85rem">
              No Available Doctors
            </Typography>
          ) : (
            pastAttendance.slice(0, 3).map((item) => (
              <Card
                key={item.doctorId}
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 2,
                  boxShadow: "0px 3px 10px rgba(0,0,0,0.1)",
                  mb: 1.5,
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 1.5,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "#0b7c7a",
                      width: 42,
                      height: 42,
                      mr: 1.5,
                    }}
                  >
                    {item.doctorName?.charAt(0)}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
                      {item.doctorName}
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.7rem", color: "text.secondary" }}
                    >
                      {item.specialization}
                    </Typography>
                  </Box>

                  <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                  <Box sx={{ textAlign: "center", px: 1 }}>
                    <Typography sx={{ fontSize: "0.7rem", color: "#0b7c7a" }}>
                      Today Appointments
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {item.todayAppointments ?? 0}
                    </Typography>
                  </Box>

                  <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                  <Box sx={{ textAlign: "center", px: 1 }}>
                    <Typography sx={{ fontSize: "0.7rem", color: "#0b7c7a" }}>
                      Available Slots
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {item.availableSlots}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default AvailableDoctorsCard;
