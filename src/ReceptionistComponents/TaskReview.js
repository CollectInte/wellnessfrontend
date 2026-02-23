import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Rating,
  Pagination,
  useMediaQuery,
  useTheme,
  Stack,
  TextField,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import api from "./services/api";

const Reviews = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const rowsPerPage = 4;

  const [filters, setFilters] = useState({
    clientName: "",
    date: "",
  });

  /* 🔹 FETCH REVIEWS */
  useEffect(() => {
    api
      .get("/review/reviews")
      .then((res) => {
        setReviews(res.data.reviews || []);
        setFilteredReviews(res.data.reviews || []);
      })
      .finally(() => setLoading(false));
  }, []);

  /* 🔹 FILTER LOGIC (FIXED) */
  useEffect(() => {
    let data = [...reviews];

    if (filters.clientName) {
      data = data.filter((r) =>
        (r.client_name || r.admin_name)
          ?.toLowerCase()
          .includes(filters.clientName.toLowerCase())
      );
    }

    if (filters.date) {
      data = data.filter(
        (r) =>
          new Date(r.created_at).toLocaleDateString("en-GB") ===
          new Date(filters.date).toLocaleDateString("en-GB")
      );
    }

    setFilteredReviews(data);
    setPage(1);
  }, [filters, reviews]);

  const totalPages = Math.ceil(filteredReviews.length / rowsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const greenFieldStyles = {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#01636B",
      },
      "&:hover fieldset": {
        borderColor: "#01636B",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#01636B",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#01636B",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#01636B",
    },
  };

  if (loading) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const getRatingColor = (rating) => {
    if (rating >= 5) return "#16A34A";      // green
    if (rating >= 4) return "#4ADE80";      // light green
    if (rating >= 3) return "#F97316";      // orange
    return "#9CA3AF";                       // gray (optional for <3)
  };

  return (
    <>
      {/* 🔷 TOP BAR */}
      <Box
        sx={{
          px: 3,
          py: 1,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* TITLE */}
        <Box
          sx={{
            bgcolor: "#437986",
            borderRadius: "12px 50px 0 0",
            px: 3,
            py: { md: 1, xs: 1 },
            width: { xs: "80%", md: "50%" },
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: "0.95rem", // mobile
                sm: "1rem",    // tablet
                md: "1.1rem",  // desktop
                lg: "1.25rem", // large screens
              },
              color: "white",
              fontWeight: 700
            }}
          >
            Top Best Reviews From Patients
          </Typography>
        </Box>

        {/* FILTERS */}
        <Box
          sx={{
            borderRadius: 3,
            px: 2,
            py: 1,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "flex-start", // ✅ mobile left
            gap: 1,
          }}
        >
          <TextField
            label="Patient Name"
            size="small"
            value={filters.clientName}
            onChange={(e) =>
              setFilters({ ...filters, clientName: e.target.value })
            }
            sx={greenFieldStyles}
          />

          <TextField
            label="Date"
            type="date"
            size="small"
            value={filters.date}
            onChange={(e) =>
              setFilters({ ...filters, date: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            sx={greenFieldStyles}
          />

          <Button
            variant="outlined"
            size="small"
            onClick={() => setFilters({ clientName: "", date: "" })}
            sx={{
              color: "#01636B",
              borderColor: "#01636B",
              fontWeight: 600,
              alignSelf: { xs: "flex-start", sm: "center" }, // ✅ left on mobile
            }}
          >
            Clear
          </Button>
        </Box>

      </Box>

      {/* 🔷 TABLE / CARD */}
   {/* 🔷 TABLE / CARD */}
<Box sx={{ p: { xs: 1, md: 2 } }}>
  <Card
    elevation={0}
    sx={{
      background: "linear-gradient(180deg, #D6EEE5 0%, #FFFFFF 90%)",
      borderRadius: 4,
      border: "1px solid #B2E5E1",
      overflow: "hidden",
    }}
  >
    {/* ✅ SCROLL CONTAINER (DESKTOP ONLY) */}
    {!isMobile && (
      <Box
        sx={{
          maxHeight: "50vh",            // ✅ TABLE HEIGHT
          overflowY: "auto",            // ✅ VERTICAL SCROLL
          overflowX: "hidden",

          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(6,95,91,0.4)",
            borderRadius: "8px",
          },
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            position: "sticky",         // ✅ STICKY HEADER
            top: 0,
            zIndex: 2,
            py: 1.2,
            backgroundColor: "#EAF6F3",
            borderBottom: "1px dashed rgba(6,95,91,0.3)",
          }}
        >
          {["Patient Name", "Rating", "Review", "Posted Date"].map(
            (label, i) => (
              <Box
                key={label}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  borderRight:
                    i !== 3 ? "1px solid rgba(6,95,91,0.3)" : "none",
                }}
              >
                <Chip
                  label={label}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: "#065F5B",
                    color: "#065F5B",
                    fontWeight: 600,
                  }}
                />
              </Box>
            )
          )}
        </Box>

        {/* ROWS */}
        {paginatedReviews.map((review, index) => (
          <Box
            key={index}
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              py: 2.5,
              borderBottom:
                index !== paginatedReviews.length - 1
                  ? "1px dashed rgba(6,95,91,0.25)"
                  : "none",
              "&:hover": {
                backgroundColor: "rgba(6,95,91,0.05)",
              },
            }}
          >
            {[
              review.client_name || review.admin_name,
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                key="rating"
              >
                <Typography fontWeight={700}>
                  {Number(review.rating).toFixed(1)}
                </Typography>
                <Rating
                  value={Number(review.rating)}
                  readOnly
                  size="small"
                  sx={{
                    "& .MuiRating-iconFilled": {
                      color: getRatingColor(Number(review.rating)),
                    },
                  }}
                />
              </Stack>,
              review.review,
              new Date(review.created_at).toLocaleDateString("en-GB"),
            ].map((cell, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  px: 2,
                  textAlign: "center",
                  borderRight:
                    i !== 3 ? "1px solid rgba(6,95,91,0.3)" : "none",
                }}
              >
                {cell}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    )}

    {/* 📱 MOBILE VIEW (UNCHANGED) */}
 {isMobile &&
  paginatedReviews.map((review, index) => (
    <Card
      key={index}
      elevation={0}
      sx={{
        m: 2,
        p: 2,
        border: "1px solid #B2E5E1",
        borderRadius: 3,
        backgroundColor: "#FFFFFF",
      }}
    >
      <Stack spacing={1.5}>
        {/* Patient Name */}
        <Typography fontWeight={700} color="#065F5B">
          {review.client_name || review.admin_name}
        </Typography>

        {/* Rating */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography fontWeight={600}>
            {Number(review.rating).toFixed(1)}
          </Typography>
          <Rating
            value={Number(review.rating)}
            readOnly
            size="small"
            sx={{
              "& .MuiRating-iconFilled": {
                color: getRatingColor(Number(review.rating)),
              },
            }}
          />
        </Stack>

        {/* Review */}
        <Typography fontSize="0.9rem" sx={{ opacity: 0.85 }}>
          {review.review}
        </Typography>

        {/* Date */}
        <Typography fontSize="0.75rem" color="text.secondary">
          Posted on{" "}
          {new Date(review.created_at).toLocaleDateString("en-GB")}
        </Typography>
      </Stack>
    </Card>
  ))}



    {/* PAGINATION (OUTSIDE SCROLL) */}
    <Box
      sx={{
        p: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px dashed rgba(6,95,91,0.3)",
      }}
    >
      <Typography fontSize={13}>
        {(page - 1) * rowsPerPage + 1}–
        {Math.min(page * rowsPerPage, filteredReviews.length)} of{" "}
        {filteredReviews.length}
      </Typography>

      <Pagination
        count={totalPages}
        page={page}
        onChange={(e, val) => setPage(val)}
        size="small"
      />
    </Box>
  </Card>
</Box>

    </>
  );
};

export default Reviews;
