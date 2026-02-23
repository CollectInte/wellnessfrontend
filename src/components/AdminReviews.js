import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  Card,
  Avatar,
  TextField,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

const themeColor = "#0A6A6E";

const ReviewCard = ({ review }) => {
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
  const rating = Number(review.rating) || 0;

  return (
    <Card
      sx={{
        backgroundColor: "#fff",
        p: 2,
        borderRadius: 2,
        boxShadow: 2,
        borderLeft: `6px solid ${theme.sidebar_bg}`,
      }}
    >
      {/* Top Row */}
      <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              bgcolor: theme.sidebar_bg,
              width: 44,
              height: 44,
              fontWeight: "bold",
            }}
          >
            {review.staff_name?.charAt(0)?.toUpperCase() || "S"}
          </Avatar>

          <Box>
            <Typography fontWeight="bold">
              {review.staff_name}{" "}
              <Typography component="span" sx={{ color: "#666", fontSize: 12 }}>
                ({review.branch || "—"})
              </Typography>
            </Typography>

            <Typography sx={{ fontSize: 12, color: "#777" }}>
              Client: <b>{review.client_name || "—"}</b> • Plan:{" "}
              <b>{review.plan_id ?? "—"}</b>
            </Typography>

            <Typography sx={{ fontSize: 12, color: "#777" }}>
              {review.created_at
                ? new Date(review.created_at).toLocaleString()
                : ""}
            </Typography>
          </Box>
        </Box>

        {/* Rating */}
        <Box textAlign="right">
          <Typography fontWeight="bold" sx={{ color: theme.sidebar_bg }}>
            {rating.toFixed(1)}
          </Typography>

          <Box display="flex" justifyContent="flex-end" gap={0.2}>
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                sx={{
                  fontSize: 18,
                  color: i < Math.round(rating) ? "#ffc107" : "#ddd",
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Review text */}
      <Box mt={2} sx={{ backgroundColor: "#f6fafa", p: 1.5, borderRadius: 2 }}>
        <Typography sx={{ fontSize: 14, color: "#333" }}>
          {review.review || "—"}
        </Typography>
      </Box>
    </Card>
  );
};

export default function AdminReviews() {
  const adminId = localStorage.getItem("adminId");

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState({});
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

  // filters
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");

  const branches = useMemo(() => {
    return [...new Set((reviews || []).map((r) => r.branch).filter(Boolean))];
  }, [reviews]);

  const staffList = useMemo(() => {
    const map = new Map();
    (reviews || []).forEach((r) => {
      if (r.staff_id && !map.has(r.staff_id)) {
        map.set(r.staff_id, r.staff_name || `Staff ${r.staff_id}`);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [reviews]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_ADMINPROFILE_FETCH}/${adminId}`,
        { credentials: "include" }
      );
      const json = await res.json();
      setProfile(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async (filters = {}) => {
    try {
      const qs = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
        )
      ).toString();

      const url = qs
        ? `${process.env.REACT_APP_URL}/review/reviews?${qs}`
        : `${process.env.REACT_APP_URL}/review/reviews`;

      const res = await fetch(url, { credentials: "include" });
      const json = await res.json();

      setReviews(json.reviews || []);
      console.log("Reviews Data:", json);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchReviews()]);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: theme.text_color }}>No profile data found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, backgroundColor:theme.app_bg }}>
      {/* Header */}
      {/* <Box
        sx={{
          backgroundColor: themeColor,
          color: "#fff",
          px: 3,
          py: 1,
          borderRadius: 1,
          width: "fit-content",
          mb: 3,
          fontWeight: "bold",
        }}
      >
        Staff Reviews
      </Box> */}

      {/* Filters */}
      <Box
        display="flex"
        gap={2}
        mb={3}
        flexWrap="wrap"
        alignItems="center"
      >
        <Select
          size="small"
          displayEmpty
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.text_color,
            },

            "&.Mui-focused": {
              color: theme.text_color,
            },
            // 🔹 Selected text color
            "& .MuiSelect-select": {
              color: theme.text_color,
            },

            // 🔹 Dropdown arrow color
            "& .MuiSvgIcon-root": {
              color: theme.text_color,
            },
            minWidth: 180
          }}
        >
          <MenuItem value="">All Branches</MenuItem>
          {branches.map((b) => (
            <MenuItem key={b} value={b}>
              {b}
            </MenuItem>
          ))}
        </Select>

        <Select
          size="small"
          displayEmpty
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.text_color,
            },

            "&.Mui-focused": {
              color: theme.text_color,
            },
            // 🔹 Selected text color
            "& .MuiSelect-select": {
              color: theme.text_color,
            },

            // 🔹 Dropdown arrow color
            "& .MuiSvgIcon-root": {
              color: theme.text_color,
            },
            minWidth: 200
          }}
        >
          <MenuItem value="">All Staff</MenuItem>
          {staffList.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}
            </MenuItem>
          ))}
        </Select>

        <TextField
          size="small"
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          placeholder="Plan ID (optional)"
          sx={{
            // 🔹 Input Text Color
            "& .MuiInputBase-input": {
              color: theme.text_color,
            },

            // 🔹 Label Color
            "& .MuiInputLabel-root": {
              color: theme.text_color,
            },

            // 🔹 Label When Focused
            "& .MuiInputLabel-root.Mui-focused": {
              color: theme.text_color,
            },

            // Outline default
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.text_color,
            },

            // Outline hover
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.text_color,
            },

            // Outline focused
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.text_color,
            },
            minWidth: 180, borderRadius: 1
          }}
        />

        <Button
          variant="contained"
          sx={{
            backgroundColor: theme.primary_color,
            textTransform: "none",
            px: 4,
          }}
          onClick={() =>
            fetchReviews({
              branch: selectedBranch || null,
              staff_id: selectedStaff || null,
              plan_id: selectedPlan || null,
            })
          }
        >
          Search
        </Button>

        <Button
          variant="outlined"
          sx={{ textTransform: "none", color: theme.text_color, borderColor: theme.primary_color }}
          onClick={() => {
            setSelectedBranch("");
            setSelectedStaff("");
            setSelectedPlan("");
            fetchReviews();
          }}
        >
          Reset
        </Button>
      </Box>

      {/* Company Banner */}
      <Box
        sx={{
          backgroundColor: theme.sidebar_bg,
          color: theme.text_color,
          borderRadius: 2,
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box display="flex" gap={3} alignItems="center">
          <Box
            sx={{
              width: 120,
              height: 80,
              backgroundColor: theme.sidebar_bg,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.text_color,
              fontSize: 12,
              fontWeight: "bold",
              overflow: "hidden",
            }}
          >
            <img
              src={`${process.env.REACT_APP_URL}/Images/${localStorage.getItem(
                "companyLogo"
              )}`}
              alt="company-logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </Box>

          <Box>
            <Typography variant="h6">{profile?.gym_name}</Typography>
            <Typography fontSize="13px">{profile?.address}</Typography>
          </Box>
        </Box>

        <Box textAlign="right">
          <Typography fontSize="14px">Total Reviews</Typography>
          <Typography variant="h6">{reviews?.length || 0}</Typography>
        </Box>
      </Box>

      {/* Reviews Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 3,
          maxHeight: "70vh",      // adjust: 60vh / 65vh / 70vh as you like
          overflowY: "auto",

          // optional polish
          pr: 1,
        }}
      >
        {reviews.map((r) => (
          <ReviewCard key={r.review_id} review={r} />
        ))}
      </Box>
    </Box>
  );
}
