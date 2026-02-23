import React from "react";
import { Paper, Box, Typography } from "@mui/material";
import doctorIllustration from "../../Assets/clientbanner.svg";
import { COLORS } from "../Themes";
import { useEffect, useState } from "react";

const WelcomeBanner = () => {
  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const userName = localStorage.getItem("userName") || "User";

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

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
    <Paper
      elevation={0}
      sx={{
        bgcolor: theme.sidebar_bg,
        borderRadius: 4,
        px: { xs: 2.5, sm: 3, md: 4 },
        py: { xs: 3, md: 1 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* LEFT CONTENT */}
      <Box sx={{ maxWidth: "70%" }}>
        <Typography fontSize={13} sx={{color:theme.text_color}} mb={1}>
          {today}
        </Typography>

        <Typography fontSize={{ xs: 14, sm: 20, md: 22 }} fontWeight={600} sx={{color:theme.text_color}}>
          {greeting}
          <Box component="span" sx={{ pl: 0.5, color: theme.text_color }}>
            {userName}
          </Box>
        </Typography>
      </Box>

      {/* RIGHT IMAGE */}
      <Box
        component="img"
        src={doctorIllustration}
        alt="Doctor Illustration"
        sx={{
          height: { xs: 60,md: 150, },
          maxWidth: "100%",
          objectFit: "contain",
          flexShrink: 0,
        }}
      />
    </Paper>
  );
};

export default WelcomeBanner;
