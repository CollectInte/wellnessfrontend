import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Grid,
  Rating,
  Divider,
  Pagination,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import api from "./services/api";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 4;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    api.get("/staff/reviews").then((res) => {
      setReviews(res.data.reviews || []);
    });
  }, []);

  const paginatedReviews = reviews.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Card sx={{ p: 2, borderRadius: 3 }}>
      {/* Header */}
      <Typography variant="h6" fontWeight={600}>
        Reviews from Clients
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Total reviews, {reviews.length}
      </Typography>

      {/* Table Header */}
      {!isMobile && (
        <Grid container sx={{ py: 1 }}>
          <Grid item xs={4}>
            <Typography fontWeight={600}>STUDENTS & COURSES</Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography fontWeight={600}>RATINGS & REVIEWS</Typography>
          </Grid>
          <Grid item xs={3} textAlign="right">
            <Typography fontWeight={600}>POSTED DATE</Typography>
          </Grid>
        </Grid>
      )}

      <Divider />

      {/* Rows */}
      {paginatedReviews.map((r) => (
        <Box key={r.id} py={2}>
          <Grid container spacing={2} alignItems="center">
            {/* Client */}
            <Grid item xs={12} sm={4}>
              <Typography fontWeight={600}>{r.client_name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {r.admin_name}
              </Typography>
            </Grid>

            {/* Rating */}
            <Grid item xs={12} sm={5}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography fontWeight={600}>{r.rating.toFixed(1)}</Typography>
                <Rating value={r.rating} readOnly size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {r.review}
              </Typography>
            </Grid>

            {/* Date */}
            <Grid item xs={12} sm={3} textAlign={isMobile ? "left" : "right"}>
              <Typography fontWeight={600}>
                {new Date(r.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ mt: 2 }} />
        </Box>
      ))}

      {/* Pagination */}
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Pagination
          count={Math.ceil(reviews.length / rowsPerPage)}
          page={page}
          onChange={(_, value) => setPage(value)}
          size={isMobile ? "small" : "medium"}
        />
      </Box>
    </Card>
  );
};

export default Reviews;