import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ReceiptIcon from "@mui/icons-material/Receipt";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import DashboardIcon from "@mui/icons-material/Dashboard";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LogoutIcon from "@mui/icons-material/Logout";
import ListAltIcon from "@mui/icons-material/ListAlt";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import { useEffect, useState } from "react";
import { COLORS } from "../Themes";
import ClientProfileModal from "../ClientProfileModal";
import axios from "axios";

export const drawerWidth = 240;
export const drawerWidthClosed = 70;

// const menuItems = [
//   { text: "Dashboard", icon: <DashboardIcon />, path: "dashboard" },
//   {
//     text: "Document Upload",
//     icon: <UploadFileIcon />,
//     path: "documents",
//   },
//   { text: "Appointment", icon: <EventIcon />, path: "appointment" },

//   { text: "Reviews", icon: <StarBorderIcon />, path: "reviews" },
//   { text: "Bills", icon: <ReceiptIcon />, path: "bills" },
// ];



export default function Sidebar({ isOpen, onToggle }) {
  // const staffRole = localStorage.getItem("role");
  const UserName = localStorage.getItem("userName");

  const getAvatarLetters = (name = "") => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const [openProfile, setOpenProfile] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const formattedTime = currentTime.toLocaleTimeString();
  const formattedDate = currentTime.toLocaleDateString();

  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [theme, setTheme] = useState({});
  const [loading, setLoading] = useState(true);


  const protectedModules = {
    documents: modules.some(m => m.module_key === 'documents'),
    appointments: modules.some(m => m.module_key === 'appointments'),
    sessions: modules.some(m => m.module_key === 'sessions'),
    reviews: modules.some(m => m.module_key === 'reviews'),
    billing: modules.some(m => m.module_key === 'billing'),
  };

  const menuItems = [
    // ✅ Always visible (public)
    { text: "Dashboard", icon: <DashboardIcon />, path: "dashboard", protected: false },

    // ✅ Protected - only show if module enabled
    {
      text: "Document Upload",
      icon: <UploadFileIcon />,
      path: "documents",
      moduleKey: "documents",
      protected: true
    },
    {
      text: "Appointment",
      icon: <EventIcon />,
      path: "appointment",
      moduleKey: "appointments",
      protected: true
    },
    {
      text: "Sessions",
      icon: <AccessTimeIcon />,
      path: "sessions",
      moduleKey: "sessions",
      protected: true
    },
    {
      text: "Reviews",
      icon: <StarBorderIcon />,
      path: "reviews",
      moduleKey: "reviews",
      protected: true
    },
    {
      text: "Bills",
      icon: <ReceiptIcon />,
      path: "bills",
      moduleKey: "billing",
      protected: true
    },
  ];

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_URL}/api/user-modules`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setModules(res.data.modules || []);
        }
      } catch (error) {
        console.error("Failed to fetch modules:", error);
      } finally {
        setLoadingModules(false);
      }
    };

    fetchModules();
  }, []);

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
    const fetchCompanyInfo = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_URL}/api/company-info`,
          {
            withCredentials: true,
          }
        );

        if (res.data.success) {
          setCompanyLogo(res.data.data.company_logo);
          setCompanyName(res.data.data.gym_name);
        }
      } catch (error) {
        console.error("Failed to fetch company info", error);
      }
    };

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_URL}/api/client/self`,
          { withCredentials: true },
        );
        localStorage.setItem("userName", res.data.data.name);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
    fetchCompanyInfo();
  }, []);

  const [openAlert, setOpenAlert] = useState(false);
  const handleConfirmLogout = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_URL}/logout`,
        {},
        { withCredentials: true }
      );

      setOpenAlert(true); // ✅ THIS WAS MISSING

      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/";
      }, 100);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        bgcolor: theme.sidebar_bg,
        flexShrink: 0,
        width: isOpen ? drawerWidth : drawerWidthClosed,
        "& .MuiDrawer-paper": {
          width: isOpen ? drawerWidth : drawerWidthClosed,
          boxSizing: "border-box",
          // ✅ keep drawer white
          transition: "width 0.3s ease-in-out",
          display: "flex", // ✅ REQUIRED
          flexDirection: "column", // ✅ REQUIRED
          height: "100vh",
          border: "none",
        },
      }}
    >
      {/* Mobile-only divider */}
      {/* <Box
        sx={{
          display: { xs: "block", md: "none" }, // ✅ mobile only
          height: "1px",
          bgcolor: theme.sidebar_bg,

          mx: 2,
          my: 1.5,
        }}
      /> */}

      {/* Mobile-only Toggle Button */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" }, // ✅ mobile only
          justifyContent: "end",
          p: 1.25,
          bgcolor: theme.sidebar_bg,
        }}
      >
        <IconButton
          onClick={onToggle}
          size="small"
          sx={{
            color: theme.text_color,
            border: `1px solid ${theme.sidebar_bg}`,
            borderRadius: "50%",
            mx: 2.2,
            "&:hover": {
              backgroundColor: theme.sidebar_bg,
            },
          }}
        >
          {isOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      {/* Logo Section */}
      <Box
        sx={{
          bgcolor: theme.app_bg,
          p: isOpen ? 4 : 1,
          display: "flex",
          flexDirection: "column", // 🔹 column layout
          alignItems: "center",
          justifyContent: isOpen ? "flex-start" : "center",
          gap: 1.5,
          transition: "all 0.3s",
        }}
      >
        {companyLogo ? (
          <Box
            sx={{
              width: "100%",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "start",
            }}
          >
            <Box
              component="img"
              src={`${process.env.REACT_APP_URL}/Images/${companyLogo}`}
              alt="Logo"
              sx={{
                width: 200,
                height: 100,
                objectFit: "contain",
                borderRadius: 4,
              }}
            />
          </Box>
        ) : (
          <Typography
            sx={{
              fontSize: { xs: "10px", md: "12px" },
              fontWeight: "bold",
              color: "primary.main",
              textAlign: "center",
            }}
          >
            {companyName}
          </Typography>
        )}
      </Box>

      {/* Blue Section */}
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          background: theme.app_bg, // 👈 IMPORTANT
        }}
      >
        <Box
          sx={{
            flex: 1,
            background: theme.sidebar_bg,
            borderTopRightRadius: { md: 80, xs: 40 },
            pt: { xs: 2, sm: 0 }, // ✅ 5 × 8px = 40px on mobile
            overflowY: "auto", // ✅ ENABLE SCROLL
            overflowX: "hidden",

            // ✅ smooth scrollbar (optional but professional)
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(90, 85, 85, 0.3)",
              borderRadius: "4px",
            },
          }}
        >
          {/* Decorative divider */}
          {/* <Box
          sx={{
            height: "1px",
            backgroundColor: theme.app_bg,
            mx: 2,
            my: 1,
          }}
        /> */}

          {/* Toggle Button */}

          {/* ================= PROFILE ================= */}
          <Box
            sx={{
              py: { xs: 1, md: 4 },
              px: isOpen ? 3 : 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              position: "sticky",
              top: 0,
              zIndex: 10, // important for sidebar stickiness
            }}
          >
            {/* Avatar */}
            <Avatar
              onClick={() => setOpenProfile(true)}
              sx={{
                width: isOpen ? 70 : 40,
                height: isOpen ? 70 : 40,
                mx: "auto",
                mb: 1,
                cursor: "pointer",
                transition: "all 0.3s ease",
                bgcolor: theme.app_bg,
                color: theme.text_color,
                fontWeight: "bold",
                fontSize: isOpen ? "28px" : "14px",
                border: `3px solid ${theme.sidebar_bg}`,
                "&:hover": {
                  opacity: 0.9,
                  transform: "scale(1.05)",
                },
              }}
            >
              {getAvatarLetters(UserName)}
            </Avatar>

            {/* Username */}
            <Typography
              fontWeight="bold"
              sx={{
                color: theme.text_color,
                fontSize: { xs: "10px", md: "18px" },
                mb: { xs: "8px", md: "auto" },
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              {UserName}
            </Typography>

            {/* Date & Time */}
            <Typography
              variant="body2"
              component="div"
              sx={{
                color: theme.text_color,
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                gap: { xs: 0.5, md: 1 },
              }}
            >
              <Box sx={{ fontSize: { xs: "8px", md: "12px" },color: theme.text_color }}>
                {formattedDate}
              </Box>

              {/* Responsive separator */}
              <Box
                sx={{
                  backgroundColor: theme.app_bg,
                  width: { xs: "100%", md: "1px" },
                  height: { xs: "1px", md: "14px" },
                }}
              />

              <Box sx={{ fontSize: { xs: "8px", md: "12px" } }}>
                {formattedTime}
              </Box>
            </Typography>

            {/* Divider (NOT sticky) */}
            <Box
              sx={{
                height: "2px",
                backgroundColor: theme.app_bg,
                mx: 2,
                my: 1,
                width: "100%",
                borderRadius: 2,
              }}
            />
          </Box>

          {/* White divider after Profile */}

          {/* Menu */}
          {/* <List sx={{ px: 2 }}>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              component={NavLink}
              to={item.path}
              end={item.path === "/"}
              sx={{
                mb: 0.5,
                borderRadius: 2,
                color: "white",
                textDecoration: "none",
                justifyContent: isOpen ? "flex-start" : "center",
                px: isOpen ? 2 : 1,
                py: 1,
                minHeight: "44px",
                transition: "all 0.2s",

                "&.active": {
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                },
                "&.active .MuiListItemIcon-root": {
                  color: "white",
                  transform: "scale(1.1)",
                },
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                },
              }}
            >
              <Tooltip
                title={!isOpen ? `${item.text}` : `${item.text}`}
                placement="right"
                arrow
              >
                <ListItemIcon
                  sx={{
                    minWidth: isOpen ? 36 : "auto",
                    justifyContent: "center",
                    color: COLORS.texWhite,
                    transition: "all 0.2s",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
              </Tooltip>
              {isOpen && (
                <ListItemText
                  primary={item.text}
                  sx={{
                    "& .MuiTypography-root": {
                      fontSize: "14px",
                      fontWeight: 500,
                    },
                  }}
                />
              )}
            </ListItem>
          ))}
          <ListItem
            onClick={handleConfirmLogout}
            sx={{
              display: "flex", // ✅ force row
              alignItems: "center", // ✅ vertical align
              gap: 1, // ✅ space between icon & text
              color: "white",
              borderRadius: 2,
              cursor: "pointer",
              justifyContent: isOpen ? "flex-start" : "center",
              "&:hover": { backgroundColor: "rgba(255,0,0,0.25)" },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: "unset", // ✅ prevents extra spacing
                color: "white",
              }}
            >
              <LogoutIcon />
            </ListItemIcon>

            {isOpen && (
              <ListItemText
                primary="Logout"
                sx={{
                  "& .MuiTypography-root": {
                    fontSize: "14px",
                    fontWeight: 500,
                  },
                }}
              />
            )}
          </ListItem>
        </List> */}
          <List sx={{ px: 2 }}>
            {menuItems
              .filter(item => {
                if (!item.protected) return true;  // Always show public
                return protectedModules[item.moduleKey];  // Show only if module enabled
              })
              .map((item) => (
                <ListItem
                  key={item.text}
                  component={NavLink}
                  to={item.path}
                  end={item.path === "/"}
                  sx={{
                    mb: 0.5,
                    borderRadius: 2,
                    color: "white",
                    textDecoration: "none",
                    justifyContent: isOpen ? "flex-start" : "center",
                    px: isOpen ? 2 : 1,
                    py: 1,
                    minHeight: "44px",
                    transition: "all 0.2s",
                    "&.active": {
                      backgroundColor: theme.primary_color,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    },
                    "&.active .MuiListItemIcon-root": {
                      color: "white",
                      transform: "scale(1.1)",
                    },
                    "&:hover": {
                      backgroundColor: theme.primary_color,
                    },
                  }}
                >
                  <Tooltip
                    title={!isOpen ? `${item.text}` : ""}
                    placement="right"
                    arrow
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: isOpen ? 36 : "auto",
                        justifyContent: "center",
                        color: COLORS.texWhite,
                        transition: "all 0.2s",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                  </Tooltip>
                  {isOpen && (
                    <ListItemText
                      primary={item.text}
                      sx={{
                        "& .MuiTypography-root": {
                          fontSize: "14px",
                          fontWeight: 500,
                        },
                      }}
                    />
                  )}
                </ListItem>
              ))}

            {/* Logout - Always visible */}
            <ListItem
              onClick={handleConfirmLogout}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "white",
                borderRadius: 2,
                cursor: "pointer",
                justifyContent: isOpen ? "flex-start" : "center",
                "&:hover": { backgroundColor: "rgba(255,0,0,0.25)" },
              }}
            >
              <ListItemIcon sx={{ minWidth: "unset", color: "white" }}>
                <LogoutIcon />
              </ListItemIcon>
              {isOpen && (
                <ListItemText
                  primary="Logout"
                  sx={{
                    "& .MuiTypography-root": {
                      fontSize: "14px",
                      fontWeight: 500,
                    },
                  }}
                />
              )}
            </ListItem>
          </List>

        </Box>
      </Box>

      <ClientProfileModal
        open={openProfile}
        onClose={() => setOpenProfile(false)}
      />
      <Snackbar
        open={openAlert}
        autoHideDuration={1500}
        onClose={() => setOpenAlert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled">
          Thank you 👋 Logged out successfully
        </Alert>
      </Snackbar>
    </Drawer>
  );
}
