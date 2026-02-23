import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function StaffServiceAnalytics() {
  const [staffId, setStaffId] = useState("");
  const [month, setMonth] = useState("ALL");
  const [staffList, setStaffList] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [staffId]);

  const fetchStaff = async () => {
    try {
      const res = await fetch(process.env.REACT_APP_EMPLOYEE_FETCH, {
        credentials: "include",
      });
      const json = await res.json();
      setStaffList(json.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const url = staffId
        ? `${process.env.REACT_APP_REQUEST_STAFFANALYTICS}?staff_id=${staffId}`
        : `${process.env.REACT_APP_REQUEST_STAFFANALYTICS}`;

      const res = await fetch(url, { credentials: "include" });
      const json = await res.json();
      setData(json.data || []);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (month === "ALL") return data;
    return data.filter((d) => d.month_name === month);
  }, [data, month]);

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Typography variant="h5" fontWeight={600} mb={3}>
        📊 Staff Service Analytics
      </Typography>

      {/* Filters Card */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent>
          <Typography fontWeight={600} mb={2}>
            Filters
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {/* Staff */}
            <FormControl sx={{ minWidth: 220 }}>
              <Select
                value={staffId}
                displayEmpty
                onChange={(e) => setStaffId(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Staff</em>
                </MenuItem>
                {staffList.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Month */}
            <FormControl sx={{ minWidth: 200 }}>
              <Select value={month} onChange={(e) => setMonth(e.target.value)}>
                <MenuItem value="ALL">All Months</MenuItem>
                {MONTHS.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Chart Card */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <CardContent>
          {/* Legend */}
          <Stack direction="row" spacing={1} mb={2}>
            <Chip label="Pending" sx={{ bgcolor: "#fff3e0", color: "#ef6c00" }} />
            <Chip label="In Progress" sx={{ bgcolor: "#e3f2fd", color: "#1565c0" }} />
            <Chip label="Completed" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32" }} />
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {loading ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : filteredData.length === 0 ? (
            <Typography align="center">No data available</Typography>
          ) : (
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={filteredData}>
                <XAxis dataKey="month_name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />

                <Bar dataKey="pending_count" fill="#fb8c00" radius={[6,6,0,0]} />
                <Bar dataKey="in_progress_count" fill="#1e88e5" radius={[6,6,0,0]} />
                <Bar dataKey="completed_count" fill="#43a047" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}