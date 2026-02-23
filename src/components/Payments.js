"use client";

import { useEffect, useState } from "react";
import {
    Box,
    Dialog,
    DialogContent,
    IconButton,
    Typography,
    CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";

export default function PaymentsTable() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const [openImage, setOpenImage] = useState(false);
    const [imageSrc, setImageSrc] = useState("");

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await fetch(process.env.REACT_APP_PAYMENT_ADMINFETCH, {
                credentials: "include",
            });

            const data = await res.json();

            // DataGrid requires `id`
            const formatted = data.map((item) => ({
                ...item,
                id: item.id,
            }));

            setRows(formatted);
            console.log("Fetched payments:", formatted);
        } catch (err) {
            console.error("Failed to fetch payments", err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageClick = (path) => {
        setImageSrc(`${process.env.REACT_APP_PAYMENTIMAGE_ADMINFETCH}/${path}`);
        setOpenImage(true);
    };

    const columns = [
        {
            field: "bill_id",
            headerName: "Bill ID",
            width: 100,
        },
        {
            field: "transaction_id",
            headerName: "Transaction ID",
            width: 180,
        },
        {
            field: "client_id",
            headerName: "Client ID",
            width: 120,
        },
        {
            field: "payment_screenshot",
            headerName: "Screenshot",
            width: 150,
            sortable: false,
            renderCell: (params) => (
                <img
                    src={`${process.env.REACT_APP_PAYMENTIMAGE_ADMINFETCH}/${params.value}`}
                    alt="payment"
                    style={{
                        width: 50,
                        height: 50,
                        objectFit: "cover",
                        cursor: "pointer",
                        borderRadius: 4,
                    }}
                    onClick={() => handleImageClick(params.value)}
                />
            ),
        },
        {
            field: "payment_date",
            headerName: "Payment Date",
            width: 220,
            renderCell: (params) => {
                if (!params.value) return "-";
                return new Date(params.value).toLocaleString("en-IN");
            },
        }

    ];

    return (
        <Box sx={{ height: 500, width: "100%", mt: 10, p: 3 }}>
            <Typography variant="h6" mb={2}>
                Payments
            </Typography>

            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                pageSizeOptions={[5, 10, 20]}
                disableRowSelectionOnClick
            />

            {/* Image Popup */}
            <Dialog open={openImage} onClose={() => setOpenImage(false)} maxWidth="md">
                <IconButton
                    onClick={() => setOpenImage(false)}
                    sx={{ position: "absolute", right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>

                <DialogContent>
                    {imageSrc ? (
                        <img
                            src={imageSrc}
                            alt="Payment Screenshot"
                            style={{ width: "100%", borderRadius: 6 }}
                        />
                    ) : (
                        <CircularProgress />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}
