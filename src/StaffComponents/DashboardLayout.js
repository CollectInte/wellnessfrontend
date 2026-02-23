import { Box } from "@mui/material";
import Sidebar, { drawerWidth, drawerWidthClosed } from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "./services/api";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [company, setCompany] = useState(null);
    const [theme, setTheme] = useState({});
      const [loading, setLoading] = useState(false);
    
    
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

  // Fetch company info once
  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await api.get("/api/company-info");
      setCompany(res.data.data || res.data);
    } catch (err) {
      console.error("Company info fetch failed:", err);
    }
  };

  return (
    <Box sx={{ display: "flex", bgcolor: theme.app_bg, minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        company={company}
      />

      {/* MAIN CONTENT WRAPPER */}
      <Box
        sx={{
          flexGrow: 1,
          width: {
            xs: "100%",
            md: `calc(100% - ${
              sidebarOpen ? drawerWidth : drawerWidthClosed
            }px)`,
          },
          transition: "width 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* TOPBAR */}
        <Topbar sidebarOpen={sidebarOpen} company={company} />

        {/* PAGE CONTENT */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 3 },
            ml: { xs: 0, md: 1.5 },
            overflowX: "hidden",
            overflowY: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
