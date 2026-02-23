import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  MenuItem,
  Rating,
  Stack,
} from "@mui/material";
import axios from "axios";

const Reviews = () => {
  const [requestId, setRequestId] = useState("");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const [serviceRequests, setServiceRequests] = useState([]);
  const [pastReviews, setPastReviews] = useState([]);

  /* ---------------- FETCH SERVICE REQUEST IDS ---------------- */
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_URL}/service/client/service-requests`, {
        withCredentials: true,
      })
      .then((res) => {
        setServiceRequests(res.data.data || []);
      })
      .catch((err) => console.error(err));
  }, []);

  /* ---------------- FETCH PAST REVIEWS ---------------- */
  const fetchPastReviews = () => {
    axios
      .get(`${process.env.REACT_APP_URL}/review/client/reviews`, {
        withCredentials: true,
      })
      .then((res) => {
        setPastReviews(res.data.reviews || []);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchPastReviews();
  }, []);

  /* ---------------- SUBMIT REVIEW ---------------- */
  const handleSubmit = async () => {
    if (!requestId || rating === 0) {
      alert("Request ID and rating are required");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_URL}/review/client/review`,
        {
          request_id: requestId,
          rating,
          review,
        },
        { withCredentials: true }
      );

      alert("Review submitted successfully");

      setRequestId("");
      setRating(0);
      setReview("");

      fetchPastReviews();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 0, md: 2 },
        py: { xs: 2, md: 4 },
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: 22, md: 26 },
          fontWeight: 600,
        }}
        mb={3}
      >
        Reviews For Services Requested
      </Typography>

      {/* FLEX CONTAINER */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexWrap: "wrap", // 👈 stacks on small screens
        }}
      >
        {/* LEFT : SEND FEEDBACK */}
        <Box
          sx={{
            flex: { xs: "1 1 100%", md: "1 1 48%" },
            borderRadius: 5,
          }}
        >
          <Paper
            sx={{
              p: 3,
              height: "100%",
              border: "solid 1px #2563eb",
              borderRadius: 5,
            }}
          >
            <Typography fontSize={20} fontWeight={600} mb={2} color="#2563eb">
              Send Feedback :
            </Typography>

            <TextField
              select
              fullWidth
              label="Enter Request ID"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              sx={{ mb: 2 }}
            >
              {serviceRequests.filter(
                (req) =>
                  req.status === "completed" && // ✅ only completed
                  !pastReviews.some((r) => r.request_id === req.id) // ✅ not reviewed
              ).length === 0 ? (
                <MenuItem disabled>
                  No completed service requests available
                </MenuItem>
              ) : (
                serviceRequests
                  .filter(
                    (req) =>
                      req.status === "completed" &&
                      !pastReviews.some((r) => r.request_id === req.id)
                  )
                  .map((req) => (
                    <MenuItem key={req.id} value={req.id}>
                      {req.id} – {req.compliance_type_name}
                    </MenuItem>
                  ))
              )}
            </TextField>

            <Box
              sx={{
                display: { xs: "block", md: "flex" },
                gap: 2,
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "12", md: "18" },
                  my: 2,
                }}
              >
                Rating :
              </Typography>
              <Rating
                value={rating}
                onChange={(e, newValue) => setRating(newValue)}
                size="large"
              />
            </Box>

            <Typography my={2}>Review Comment :</Typography>
            <TextField
              multiline
              rows={4}
              fullWidth
              value={review}
              onChange={(e) => setReview(e.target.value)}
              inputProps={{ maxLength: 400 }}
              placeholder="Describe your experience"
            />

            <Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>
              Submit Review
            </Button>
          </Paper>
        </Box>

        {/* RIGHT : PAST RATINGS */}
        <Box
          sx={{
            flex: { xs: "1 1 100%", md: "1 1 48%" },
            boxShadow: 3,
            borderRadius: 5,
          }}
        >
          <Paper
            sx={{
              p: 3,
              height: { xs: 500, md: 500 }, // 👈 fixed height on desktop
              display: "flex",
              flexDirection: "column",
              borderRadius: 5,
            }}
          >
            <Typography fontSize={20} fontWeight={600} mb={2} color="#2563eb">
              View Past Rating
            </Typography>

            {pastReviews.length === 0 ? (
              <Typography>No reviews yet</Typography>
            ) : (
              <Box
                sx={{
                  flexGrow: 1, // 👈 takes remaining height
                  overflowY: "auto", // 👈 enables vertical scroll
                  pr: 1, // 👈 space for scrollbar
                }}
              >
                <Box display="flex" flexDirection="column" gap={2}>
                  {pastReviews.map((r) => (
                    <Paper key={r.id} sx={{ p: 2, bgcolor: "#dbeafe" }}>
                      <Box display="flex" flexDirection="column" gap={1}>
                        {/* Top Row */}
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          flexWrap="wrap"
                          gap={1}
                        >
                          <Box display="flex" gap={1} flexWrap="wrap">
                            <Typography fontWeight={600}>
                              Request ID: {r.request_id}
                            </Typography>
                            <Rating value={r.rating} readOnly size="small" />
                            <Typography variant="body2">{r.rating}</Typography>
                          </Box>

                          <Typography variant="caption" color="text.secondary">
                            {new Date(r.created_at).toLocaleDateString("en-IN")}
                          </Typography>
                        </Box>

                        {/* Review */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                            whiteSpace: "normal",
                          }}
                        >
                          {r.review || "No comment"}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Reviews;
