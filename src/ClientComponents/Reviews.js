import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  Stack,
  Chip,
  Tooltip,
} from "@mui/material";
import axios from "axios";
import { COLORS } from "./Themes";
import { Backdrop, CircularProgress, Snackbar, Alert } from "@mui/material";

/* ---------------- RATING CONFIG ---------------- */
const ratingOptions = [
  { label: "Very Good", value: 5, color: "#15803d" },
  { label: "Good", value: 4, color: "#22c55e" },
  { label: "Average", value: 3, color: "#facc15" },
  { label: "Below Average", value: 2, color: "#fb923c" },
  { label: "Bad", value: 1, color: "#dc2626" },
];

const Reviews = () => {
  const [appointments, setAppointments] = useState([]);
  const [pastReviews, setPastReviews] = useState([]);

  const [appointmentId, setAppointmentId] = useState("");
  const [rating, setRating] = useState(null);
  const [review, setReview] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    type: "success",
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
  const showSnack = (msg, type = "success") => {
    setSnack({ open: true, msg, type });
  };

  /* ---------------- FETCH PLANS ---------------- */
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_URL}/api/plans`, {
        withCredentials: true,
      })
      .then((res) => {
        setAppointments(res.data.plans);
      })

      .catch(console.error);
  }, []);
  /* ---------------- FETCH PAST REVIEWS ---------------- */
  const fetchPastReviews = () => {
    axios
      .get(`${process.env.REACT_APP_URL}/review/reviews`, {
        withCredentials: true,
      })
      .then((res) => {
        setPastReviews(res.data.reviews || []);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchPastReviews();
  }, []);

  /* ---------------- SUBMIT REVIEW ---------------- */
  const handleSubmit = async () => {
    if (!appointmentId || !rating) {
      showSnack("Appointment and rating are required", "warning");
      return;
    }

    try {
      setSubmitting(true);

      // Optional UX delay so loader is visible
      await new Promise((resolve) => setTimeout(resolve, 800));

      await axios.post(
        `${process.env.REACT_APP_URL}/review/client/review`,
        {
          plan_id: appointmentId,
          rating,
          review,
        },
        { withCredentials: true }
      );

      showSnack("Review submitted successfully", "success");

      setAppointmentId("");
      setRating(null);
      setReview("");

      fetchPastReviews();
    } catch (err) {
      showSnack(err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- FILTER UNREVIEWED COMPLETED ---------------- */
  // const availableAppointments = appointments.filter(
  //   (a) =>
  //     a.status?.toLowerCase() === "completed" &&
  //     !pastReviews.some((r) => r.appointment_id === a.id)
  // );

  /* ---------------- Rating Bar  ---------------- */
  const barRatings = [
    { label: "Very Good", percent: "100%", value: 5, color: "#0f8a5f" },
    { label: "Good", percent: "75%", value: 4, color: "#34c38f" },
    { label: "Average", percent: "50%", value: 3, color: "#ffb020" },
    { label: "Below Average", percent: "25%", value: 2, color: "#ffd18b" },
    { label: "Bad", percent: "5%", value: 1, color: "#a80707" },
  ];

  const SelectableRatingBar = ({ value, onChange }) => {
    return (
      <Box>
        {/* BAR */}
        <Box
          sx={{
            display: "flex",
            borderRadius: 1,
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          {barRatings.map((r) => (
            <Box
              key={r.value}
              onClick={() => onChange(r.value)}
              sx={{
                flex: 1,
                bgcolor: r.color,
                color: "#fff",
                py: 2,
                textAlign: "center",
                fontWeight: 600,
                fontSize: 16,
                opacity: value === r.value ? 1 : 0.4,
                transition: "0.3s",
                "&:hover": {
                  opacity: 1,
                },
              }}
            >
              {r.percent}
            </Box>
          ))}
        </Box>

        {/* LABELS */}
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {barRatings.map((r) => (
            <Box
              key={r.value}
              sx={{
                flex: 1,
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor: r.color,
                  mx: "auto",
                  mb: 0.5,
                }}
              />
              <Typography fontSize={12}>{r.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const feedbackRef = useRef(null);

  return (
    <Box
      px={{ xs: "none", md: 1 }}
      sx={{
        pt: 2.8,
      }}
    >
      {/* Heading */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            bgcolor: theme.sidebar_bg,
            color: theme.text_color,
            fontSize: { xs: "14px", md: "24px" },
            px: 1,
            py: 1,
            my: 1,
            width: { xs: "50%", md: "30%" },
            borderTopRightRadius: 60,
            fontWeight: 600,
          }}
        >
          Reviews
        </Box>
        <Box display={{ xs: "block", md: "none" }} my={2}>
          <Button
            variant="contained"
            sx={{
              bgcolor: theme.sidebar_bg,
              color: theme.text_color,
              fontSize: 8,
              width: "100%",
              textTransform: "capitalize",
            }}
            onClick={() =>
              feedbackRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
          >
            Give Your Feedback
          </Button>
        </Box>
      </Box>

      <Box
        display="flex"
        gap={3}
        flexWrap="wrap"
        sx={{
          flexDirection: { xs: "column-reverse", md: "row" },
        }}
      >
        {/* ================= LEFT ================= */}
        <Box
          ref={feedbackRef}
          flex={{ xs: "1 1 100%", md: "1 1 48%" }}
          sx={{
            borderRight: { xs: "none", md: `5px solid ${theme.sidebar_bg}` },
            borderBottom: { xs: `5px solid ${theme.sidebar_bg}`, md: "none" },
          }}
        >
          <Box
            sx={{
              pr: 3,
              py: 1.2,
            }}
          >
            <Typography fontSize={20} mb={2} sx={{ color: theme.text_color }}>
              Give Your Feedback
            </Typography>

            {/* Appointment */}
            <TextField
              select
              variant="outlined"
              fullWidth
              label="Select Plans"
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
              sx={{
                mb: 2,

                // 🔹 Input text
                "& .MuiOutlinedInput-input": {
                  color: theme.text_color,
                },

                // 🔹 Label
                "& .MuiInputLabel-root": {
                  color: theme.text_color,
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: theme.primary_color,
                },

                // 🔹 Border default
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },

                // 🔹 Border hover
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.primary_color,
                },

                // 🔹 Border focused
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.primary_color,
                  borderWidth: "2px",
                },

                // 🔹 Dropdown arrow icon
                "& .MuiSvgIcon-root": {
                  color: theme.text_color,
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                    maxWidth: 250,
                    overflowY: "auto",
                    whiteSpace: "normal",

                    backgroundColor: theme.app_bg,
                    color: theme.text_color,

                    // 🔹 Selected item
                    "& .MuiMenuItem-root.Mui-selected": {
                      backgroundColor: theme.primary_color,
                      color: theme.text_color,
                    },

                    // 🔹 Hover item
                    "& .MuiMenuItem-root:hover": {
                      backgroundColor: theme.primary_color,
                    },
                  },
                },
              }}
            >
              {appointments.length === 0 ? (
                <MenuItem disabled>No completed appointments</MenuItem>
              ) : (
                appointments.map((a) => (
                  <MenuItem
                    key={a.plan_id}
                    value={a.plan_id}
                    sx={{
                      alignItems: "flex-start",
                      whiteSpace: "normal",
                      py: 1,
                      backgroundColor: theme.primary_color
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                      }}
                    >
                      <Typography
                        fontWeight={500}
                        sx={{
                          fontSize: { xs: 10, md: 14 },
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                          color: theme.text_color,
                        }}
                      >
                        ID: {a.plan_id || "No Purpose"}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: { xs: 8, md: 12 },
                          mt: 0.3,
                          color: theme.text_color + "B3", // slightly lighter
                        }}
                      >
                        Plan Type: {a.plan_type}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </TextField>


            {/* Review */}
            <TextField
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your review"
              sx={{
                mb: 3,

                // 🔹 Input text color
                "& .MuiOutlinedInput-input": {
                  color: theme.text_color,
                },

                // 🔹 Placeholder color
                "& .MuiInputBase-input::placeholder": {
                  color: theme.text_color,
                  opacity: 0.6,
                },

                // 🔹 Default Border
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },

                // 🔹 Hover Border
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.primary_color,
                },

                // 🔹 Focus Border
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.primary_color,
                  borderWidth: "2px",
                },

                // 🔹 Background (optional if dark theme)
                "& .MuiOutlinedInput-root": {
                  backgroundColor: theme.app_bg,
                },

                // 🔹 Fix Chrome text color issue
                "& .MuiInputBase-input": {
                  WebkitTextFillColor: theme.text_color,
                },
              }}
            />


            {/* Rating Selector */}

            <Typography
              fontWeight={600}
              mb={2}
              textAlign="center"
              sx={{
                color: theme.text_color,
                fontSize: { xs: 14, md: 18 },
              }}
            >
              Click The Colour Give Your Feedback
            </Typography>

            <SelectableRatingBar
              value={rating}
              onChange={(val) => setRating(val)}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button
                variant="contained"
                disabled={submitting}
                sx={{
                  mt: 3,
                  bgcolor: theme.primary_color,
                  color: theme.text_color,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: { xs: 15, md: 30 },
                  borderTopLeftRadius: { xs: 15, md: 30 },
                  borderBottomLeftRadius: 0,
                  width: { xs: "100%", md: "50%" },
                  fontSize: { xs: "12px", md: "18px" },
                }}
                onClick={handleSubmit}
              >
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* ================= RIGHT ================= */}
        <Box flex={{ xs: "1 1 100%", md: "1 1 48%" }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              height: 500,
              display: "flex",
              flexDirection: "column",
              backgroundColor: theme.app_bg,
              color: theme.text_color,
            }}
          >
            <Typography fontSize={20} mb={2} sx={{color:theme.text_color}}>
              View Past Rating
            </Typography>

            <Box flexGrow={1} overflow="auto">
              {pastReviews.length === 0 ? (
                <Typography sx={{color:theme.text_color}}>No reviews yet</Typography>
              ) : (
                <Stack spacing={2}>
                  {pastReviews.map((r) => {
                    const meta = ratingOptions.find(
                      (x) => x.value === r.rating
                    );

                    return (
                      <Paper
                        key={r.review_id}
                        sx={{ p: 2, bgcolor: theme.sidebar_bg, color: theme.text_color }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{
                            mr: { xs: "none", md: 2 },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: { xs: "10px", md: "16px" },
                              }}
                            >
                              Plan ID:
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: { xs: "10px", md: "16px" },
                                fontWeight: "bold",
                                color: theme.text_color,
                              }}
                            >
                              {r.plan_id}
                            </Typography>
                          </Box>
                          <Tooltip title={meta?.label} arrow placement="bottom">
                            <Chip
                              label={meta?.label}
                              size="small"
                              sx={{
                                bgcolor: meta?.color,
                                color: "#fff",
                                fontWeight: 600,
                                borderRadius: 50,
                              }}
                            />
                          </Tooltip>
                        </Stack>

                        <Typography fontSize={12}  mt={1} sx={{color:theme.text_color}}>
                          Reviewd At: {new Date(r.created_at).toLocaleDateString("en-IN")}
                        </Typography>

                        <Box sx={{}}>
                          <Typography
                            sx={{
                              fontSize: { xs: "10px", md: "16px" },
                              fontWeight: "bold",
                            }}
                          >
                            Description:
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: { xs: "10px", md: "16px" },
                              color: theme.text_color,
                            }}
                          >
                            {r.review || "No description"}
                          </Typography>
                        </Box>

                        <Typography fontSize={14} mt={1}></Typography>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Paper>
        </Box>

        <Backdrop
          open={submitting}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            color: "#fff",
            backgroundColor: "rgba(255,255,255,0.7)",
          }}
        >
          <CircularProgress size={60} sx={{ color: COLORS.primary }} />
        </Backdrop>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snack.type}
          variant="filled"
          onClose={() => setSnack({ ...snack, open: false })}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Reviews;
