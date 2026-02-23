import { Box } from "@mui/material";
import Sidebar, { drawerWidth, drawerWidthClosed } from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "./services/api";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [company, setCompany] = useState(null);

  // Fetch company info once
  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await api.get("/api/company-info");
      setCompany(res.data.data || res.data);
      console.log("company data",company);
    } catch (err) {
      console.error("Company info fetch failed:", err);
    }
  };

  return (
    <Box sx={{ display: "flex", bgcolor: "#F8F6F6", minHeight: "100vh"}}>
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
            xs: "80%",
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
            p: { xs: 1, md: 0 },
           
            m: { xs: 0, md: 1 },
            overflowX: "hidden",
            overflowY: "auto"
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
