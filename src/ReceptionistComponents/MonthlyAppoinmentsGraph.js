import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import api from "./services/api";

const MonthlyAppointmentsGraph = () => {
    const [dailyData, setDailyData] = useState([]);
    const [hovered, setHovered] = useState(null);

    useEffect(() => {
        fetchMonthlyAppointments();
    }, []);

    const fetchMonthlyAppointments = async () => {
        try {
            const res = await api.get("/appointment/appointments/monthly-visitors");
            if (res.data.success) {
                setDailyData(res.data.data); // [{ day: 1, count: 3 }, ...]
            }
        } catch (err) {
            console.error("Monthly graph error:", err);
        }
    };

    /* ======================
       GRAPH CALCULATIONS
    ====================== */

    const maxValue = Math.max(...dailyData.map((d) => d.count), 1);
    const chartHeight = 80;

    // total days in current month
    const totalDaysInMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
    ).getDate();

    // X position based on ACTUAL DAY
    const getX = (day) => (day / totalDaysInMonth) * 90 + 5;

    // Y position based on count
    const getY = (count) =>
        chartHeight - (count / maxValue) * (chartHeight - 10) + 5;

    // Line path
    const linePath = dailyData
        .map((d, i) =>
            `${i === 0 ? "M" : "L"} ${getX(d.day)} ${getY(d.count)}`
        )
        .join(" ");

    // Area path
    const areaPath = `
    ${linePath}
    L ${getX(dailyData[dailyData.length - 1]?.day || 1)} ${chartHeight + 5}
    L ${getX(dailyData[0]?.day || 1)} ${chartHeight + 5}
    Z
  `;

    const monthLabel = new Date().toLocaleString("default", {
        month: "short",
    });

    /* ======================
       UI
    ====================== */

    return (
        <Card sx={{ borderRadius: 3, boxShadow: 3, height: 220, width: 250 }}>
            <CardContent sx={{ p: 2 }}>
                <Typography
                    sx={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "#1a9b8e",
                        mb: 2,
                    }}
                >
                    Monthly Appointments
                </Typography>

                <Box sx={{ height: 120, position: "relative" }}>
                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#1a9b8e" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#1a9b8e" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Grid */}
                        {[20, 40, 60, 80].map((y) => (
                            <line
                                key={y}
                                x1="5"
                                y1={y}
                                x2="95"
                                y2={y}
                                stroke="#e0e0e0"
                                strokeDasharray="2,2"
                                strokeWidth="0.3"
                            />
                        ))}

                        {/* Area */}
                        {dailyData.length > 1 && (
                            <path d={areaPath} fill="url(#areaFill)" />
                        )}

                        {/* Line */}
                        {dailyData.length > 1 && (
                            <path
                                d={linePath}
                                fill="none"
                                stroke="#1a9b8e"
                                strokeWidth="2"
                            />
                        )}

                        {/* Points + Hover */}
                        {dailyData.map((d, i) => {
                            const x = getX(d.day);
                            const y = getY(d.count);

                            return (
                                <circle
                                    key={i}
                                    cx={x}
                                    cy={y}
                                    r="3"
                                    fill="#1a9b8e"
                                    onMouseEnter={() =>
                                        setHovered({ x, y, day: d.day, count: d.count })
                                    }
                                    onMouseLeave={() => setHovered(null)}
                                />
                            );
                        })}

                        {/* Tooltip */}
                        {hovered && (
                            <>
                                <rect
                                    x={hovered.x - 12}
                                    y={hovered.y - 18}
                                    width="24"
                                    height="12"
                                    rx="2"
                                    fill="#1a9b8e"
                                />
                                <text
                                    x={hovered.x}
                                    y={hovered.y - 10}
                                    textAnchor="middle"
                                    fontSize="4"
                                    fill="#fff"
                                >
                                    {hovered.count}
                                </text>
                            </>
                        )}
                    </svg>

                    {/* Y-axis label */}
                    <Typography
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: -35,
                            transform: "rotate(-90deg)",
                            fontSize: "0.7rem",
                            color: "text.secondary",
                        }}
                    >
                        Appointments
                    </Typography>
                </Box>

                {/* X-axis → ONLY 10, 20, 30 */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        px: 1,
                        mt: 1,
                    }}
                >
                    {[10, 20, 30].map((day) => (
                        <Typography
                            key={day}
                            sx={{ fontSize: "0.7rem", color: "text.secondary" }}
                        >
                            {monthLabel} {day}
                        </Typography>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
};

export default MonthlyAppointmentsGraph;
