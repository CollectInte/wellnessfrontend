import React from "react";
import { Box } from "@mui/material";
import WelcomeBanner from "./WelcomeBanner";
import AppointmentsSection from "./AppointmentsSection";
import RightButtonsActions from "./RightButtonsActions";

const Dashboard = () => {
  return (
    <Box
      px={{ xs: "none", md: 1 }}
      sx={{
        pt: 3.5,
      }}
    >
      {/* TOP BANNER */}
      <WelcomeBanner />

      {/* MAIN CONTENT */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          mt: 3,
          flexDirection: { xs: "column", lg: "row" },
          alignItems: "stretch",
        }}
      >
        {/* LEFT */}
        <Box
          sx={{
            flex: { md: 3.5 },
            width: "100%",
          }}
        >
          <AppointmentsSection />
        </Box>

        {/* RIGHT */}
        <Box
          sx={{
            flex: { md: 1.5 },
            width: "100%",
          }}
        >
          <RightButtonsActions />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
