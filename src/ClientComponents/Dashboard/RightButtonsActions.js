import React from "react";
import { useState,useEffect } from "react";
import { Paper, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import EventIcon from "@mui/icons-material/Event";
import { COLORS } from "../Themes";

const RightButtonsActions = () => {
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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "row", md: "column" },
        gap: { xs: 2, md: 3 },
      }}
    >
      {/* ===== Card 1 ===== */}
      <Paper
        elevation={0}
        onClick={() => navigate("/client/sessions")}
        sx={{
          flex: { xs: 1, md: "unset" },
          bgcolor: theme.sidebar_bg,
          borderRadius: 4,
          p: { xs: 2, md: 3 },
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: 4,
            transform: "translateY(-4px)",
          },
        }}
      >
        <Box
          sx={{
            width: { xs: 40, md: 70 },
            height: { xs: 40, md: 70 },
            bgcolor: theme.app_bg,
            borderRadius: 100,
            mx: "auto",
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.text_color,
          }}
        >
          <EventIcon sx={{ fontSize: { xs: 18, md: 40 } }} />
        </Box>

        <Typography fontWeight={450} sx={{color:theme.text_color}} fontSize={{ xs: 8, md: 18 }}>
          View All Sessions
        </Typography>
      </Paper>

      {/* ===== Card 2 ===== */}
      <Paper
        elevation={0}
        onClick={() => navigate("/client/documents")}
        sx={{
          flex: { xs: 1, md: "unset" },
          bgcolor: theme.sidebar_bg,
          borderRadius: 4,
          p: { xs: 2, md: 3 },
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: 4,
            transform: "translateY(-4px)",
          },
        }}
      >
        <Box
          sx={{
            width: { xs: 40, md: 70 },
            height: { xs: 40, md: 70 },
            bgcolor: theme.app_bg,
            borderRadius: 100,
            mx: "auto",
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.text_color,
          }}
        >
          <UploadFileIcon sx={{ fontSize: { xs: 18, md: 40 } }} />
        </Box>

        <Typography fontWeight={450} sx={{color:theme.text_color}} fontSize={{ xs: 8, md: 18 }}>
          View & Upload Your Documents
        </Typography>
      </Paper>
    </Box>
  );
};

export default RightButtonsActions;
