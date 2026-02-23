import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Stack,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { COLORS } from "../Themes";

const AppointmentsSection = () => {
  const [tab, setTab] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();
   const [theme, setTheme] = useState({});
      const [loading, setLoading] = useState(true);
    
        const fetchTheme = async () => {
            setLoading(true);
            try {
              const res = await fetch(`${process.env.REACT_APP_URL}/api/theme`, {
                method: "GET",
                credentials: "include",
              });
              const json = await res.json();
        
              if (!res.ok || !json.success) {
                alert("Failed to load theme", "error");
                setTheme({});
              } else {
                setTheme({ ...(json.data || {}) });
                console.log("Theme loaded:", json.data);
              }
            } catch (err) {
              console.error(err);
              alert("Network error while loading theme", "error");
              setTheme({});
            } finally {
              setLoading(false);
            }
          };
        
          useEffect(() => {
            fetchTheme();
            // eslint-disable-next-line react-hooks/exhaustive-deps
          }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      const res = await axios.get(
        `${process.env.REACT_APP_URL}/api/sessions`,
        { withCredentials: true },
      );
      setAppointments(res.data.sessions);
    };
    fetchAppointments();
  }, []);

  const today = dayjs().startOf("day");

  const { upcoming, past } = useMemo(() => {
    const upcoming = [];
    const past = [];

    appointments.forEach((a) => {
      const date = dayjs(a.session_date);
      date.isBefore(today) ? past.push(a) : upcoming.push(a);
    });

    return {
      upcoming: upcoming.sort(
        (a, b) => dayjs(a.session_date) - dayjs(b.session_date),
      ),
      past: past.sort(
        (a, b) => dayjs(b.session_date) - dayjs(a.session_date),
      ),
    };
  }, [appointments]);

  const activeList = tab === 0 ? upcoming : past;
  const visibleList = activeList.slice(0, 3);

  const statusColors = {
    assigned: COLORS.primary,
    completed: COLORS.success,
    cancelled: COLORS.danger,
  };
  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        flex: 1,
        borderRadius: 4,
        p: { xs: 1.5, md: 2 }, // ✅ responsive padding
        bgcolor: theme.app_bg,
      }}
    >
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        TabIndicatorProps={{
          sx: {
            backgroundColor: theme.primary_color,
            height: 3,
            borderRadius: 2,
            color: theme.text_color,
          },
        }}
        sx={{
          mb: 2,
          minHeight: 36,
          width: { xs: "100%", md: "100%", lg: "auto" },
          color: theme.text_color,

          "& .MuiTab-root": {
            fontSize: { xs: "8px", md: "14px" },
            minHeight: 36,
            fontWeight: 500,
            color: theme.text_color,
          },

          "& .MuiTab-root.Mui-selected": {
            color: theme.primary_color, // ✅ selected tab color
          },
        }}
      >
        <Tab label="Upcoming Sessions" />
        <Tab label="Past Sessions" />
      </Tabs>

      {visibleList.length === 0 ? (
        <Typography fontSize={13} sx={{color:theme.text_color}}>
          No appointments found
        </Typography>
      ) : (
        <Stack spacing={1.2}>
          {visibleList.map((a) => (
            <Box
              key={a.id}
              sx={{
                p: { xs: 1.2, md: 1.8 },
                borderRadius: 2,
                bgcolor: theme.sidebar_bg,
                color: theme.text_color,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: { xs: 1.5, md: 3 },
                  alignItems: { xs: "flex-start", md: "center" },
                }}
              >
                {/* Date & Time */}
                <Box sx={{ minWidth: { md: 140 } }}>
                  <Typography fontWeight={600} fontSize={13}>
                    {dayjs(a.session_date).format("DD MMM YYYY")}
                  </Typography>
                  <Typography fontSize={11} sx={{color:theme.text_color}}>
                    {a.start_time} - {a.end_time}
                  </Typography>
                </Box>

                {/* Purpose */}
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0, // 🔑 allows wrapping
                    maxWidth: { md: "40%" },
                  }}
                >
                  <Typography fontSize={11} sx={{color:theme.text_color}}>
                    Purpose
                  </Typography>
                  <Typography
                    fontWeight={600}
                    fontSize={13}
                    sx={{
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {a.trainer_id}
                  </Typography>
                </Box>

                {/* Doctor */}
                <Box sx={{ minWidth: { md: 140 } }}>
                  <Typography fontSize={11} sx={{color:theme.text_color}}>
                    Trainer
                  </Typography>
                  <Typography fontWeight={600} fontSize={13}>
                    {a.trainer_name}
                  </Typography>
                </Box>

                {/* Status */}
                <Box
                  sx={{
                    minWidth: { md: 120 },
                  }}
                >
                  <Typography fontSize={11} sx={{color:theme.text_color}}>
                    Status
                  </Typography>
                  <Typography
                    sx={{
                      px: 1.6,
                      py: 0.4,
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 10,
                      color: theme.text_color,
                      bgcolor: theme.primary_color,
                      display: "inline-block",
                    }}
                  >
                    {a.status}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      )}

      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button
          size="small"
          endIcon={<ArrowForwardIosIcon fontSize="small" />}
          onClick={() => navigate("/client/sessions")}
          sx={{
            fontSize: { xs: 11, md: 13 },
            textTransform: "capitalize",
            color: theme.primary_color,
          }}
        >
          See All
        </Button>
      </Box>
    </Paper>
  );
};

export default AppointmentsSection;
