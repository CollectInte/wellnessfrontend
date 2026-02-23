import * as React from "react";
import { useEffect } from "react";
import {
  Box,
  styled,
  useTheme,
  Toolbar,
  List,
  Typography,
  ListItemButton,
  ListItem,
  ListItemIcon,
  Tooltip,
  ListItemText,
  CssBaseline,
  Avatar,
} from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import EventIcon from "@mui/icons-material/Event";
import AssignmentIcon from "@mui/icons-material/Assignment";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import LogoutIcon from "@mui/icons-material/Logout";
import logo from "../Assets/RV_logo_black.png";
import ClientProfileModal from "../Pages/ClientProfileModal";
import CalculateIcon from '@mui/icons-material/Calculate';
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationListener from "../NotificationListener";
import NotificationBell from "../NotificationBell";
const drawerWidth = 220;
const collapsedWidth = 72;

/* ---------- styles (same as yours) ---------- */
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  whiteSpace: "nowrap",
  ...(open
    ? {
      ...openedMixin(theme),
      "& .MuiDrawer-paper": openedMixin(theme),
    }
    : {
      ...closedMixin(theme),
      "& .MuiDrawer-paper": closedMixin(theme),
    }),
}));

/* ---------- component ---------- */
export default function SidebarLayout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const userName = localStorage.getItem("userName");
  const [openProfile, setOpenProfile] = React.useState(false);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "dashboard" },
    {
      text: "Document Upload",
      icon: <UploadFileIcon />,
      path: "documents",
    },
    { text: "Appointment", icon: <EventIcon />, path: "appointment" },
    {
      text: "Service Request",
      icon: <AssignmentIcon />,
      path: "services",
    },
    { text: "Reviews", icon: <StarBorderIcon />, path: "reviews" },
    { text: "Tools", icon: <CalculateIcon />, path: "tools" },
    { text: "Bills", icon: <ReceiptIcon />, path: "bills" },
    { text: "Payments", icon: <PaymentIcon />, path: "payments" },
    {
      text: "Log Out",
      icon: <LogoutIcon sx={{ color: "red" }} />,
      action: "logout",
    },
  ];

  const [currentTime, setCurrentTime] = React.useState(new Date());
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const formattedTime = currentTime.toLocaleTimeString();
  const formattedDate = currentTime.toLocaleDateString();

  const handleLogout = async () => {
    try {
      await fetch(process.env.REACT_APP_LOGOUT, {
        method: "POST",
        credentials: "include", // 🔴 REQUIRED
      });
      localStorage.clear(); // optional (admin_id, role, etc.)
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const firstLetter = userName?.charAt(0)?.toUpperCase() || "?";

  const companyfetch = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_COMPANY_FETCH}/${localStorage.getItem("adminId")}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      localStorage.setItem("companyName", data.company_name);
    } catch (error) {
      console.error("Error fetching company name:", error);
    }
  };

  useEffect(() => {
    companyfetch();
  }, []);

  const companyName = localStorage.getItem("companyName");

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        open={open}
        sx={{
          bgcolor: "#ebeffd",
          width: "100%",
          height: "auto",
          left: 0, // 👈 ensure it starts from left
          right: "auto",
        }}
      >
        <Toolbar>
          <IconButton
            onClick={() => setOpen(true)}
            sx={{
              display: open ? "none" : "block",
            }}
          >
            <MenuIcon sx={{ m: 0 }} />
          </IconButton>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: { xs: "100%", md: "100%" },
              // border:"solid red 2px",
              justifyContent: "space-between",
              px: 6,
            }}
          >
            {/* LEFT: Logo + Text */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, sm: 1 },
              }}
            >
              {/* <Box
                component="img"
                src={logo}
                alt="logo"
                sx={{
                  width: { xs: 50, sm: 80, md: 120 },
                  height: "auto",
                }}
              /> */}

              <Typography
                sx={{
                  fontSize: { xs: "1rem", sm: "1.5rem", md: "2rem" },
                  fontWeight: 600,
                  color: "#000000",
                  whiteSpace: "nowrap",
                }}
              >
                {companyName}
              </Typography>
            </Box>


            {/* RIGHT: Welcome + Date */}
            <Box sx={{
              display: "flex", alignItems: "center", justifyContent: { xs: "flex-start", md: "flex-end" }
              , gap: 2, ml: { xs: -2.5, md: 0 }
            }}>
              <NotificationBell />
              <Box
                sx={{
                  textAlign: "right",
                  color: "black",
                  display: { xs: "none", md: "block" },
                }}
              >

                <Typography>Welcome {userName}</Typography>
                <Typography variant="body2">
                  {formattedDate} | {formattedTime}
                </Typography>
              </Box>

              <IconButton onClick={() => setOpenProfile(true)}>
                <Avatar
                  sx={{
                    bgcolor: "#1976d2",
                    width: { xs: 30, md: 50 },
                    height: { xs: 30, md: 50 },
                    fontSize: { xs: 18, md: 28 },
                    fontWeight: 600,
                  }}
                >
                  {firstLetter}
                </Avatar>{" "}
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* PROFILE MODAL */}
      <ClientProfileModal
        open={openProfile}
        onClose={() => setOpenProfile(false)}
      />
      {/* Drawer */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : collapsedWidth,
            transition: "width 0.3s",
            boxSizing: "border-box",
          },
        }}
      >
        <DrawerHeader sx={{ marginTop: { xs: 3, md: 3 } }}>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              // marginTop: { xs: 0.5, md: 4 },
              marginBottom: { xs: 1, md: 2 },
            }}
          >
            <Typography variant="h6" color="initial">
              Close
            </Typography>
            <CloseIcon sx={{ color: "red" }} />
          </IconButton>
        </DrawerHeader>

        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <Tooltip title={item.text} placement="right" arrow>
                <ListItemButton
                  component={item.action === "logout" ? "button" : NavLink}
                  to={item.path} // relative path
                  end={item.path === "dashboard"}
                  onClick={item.action === "logout" ? handleLogout : undefined}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    px: 3,

                    "&.active": {
                      backgroundColor: "#eef2ff",
                      color: "#2563eb",
                    },

                    "&.active .MuiListItemIcon-root": {
                      color: "#2563eb",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>

                  {/* Text can stay or be hidden when collapsed */}
                  <ListItemText
                    primary={item.text}
                    sx={{ display: open ? "block" : "none" }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* MAIN CONTENT */}
      <Box component="main" sx={{ flexGrow: 1, p: 1 }}>
        <DrawerHeader sx={{ marginTop: { xs: 1, md: 3 } }} />
        {/* Socket notifications for CLIENT */}
        <NotificationListener />
        <Outlet /> {/*  pages render here */}
      </Box>
    </Box>
  );
}
