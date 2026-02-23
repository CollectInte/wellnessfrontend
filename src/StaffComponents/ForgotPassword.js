import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    Stack,
    IconButton,
    Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

const ForgotPassword = ({ open, onClose }) => {
    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const resetState = () => {
        setStep(1);
        setEmail("");
        setOtp("");
        setPassword("");
        setConfirmPassword("");
        setMessage({ type: "", text: "" });
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    /* ---------------- SEND OTP ---------------- */
    const sendOtp = async () => {
        if (!email) {
            setMessage({ type: "error", text: "Email is required" });
            return;
        }

        try {
            setLoading(true);
            setMessage({ type: "", text: "" });

            const res = await fetch(
                `${process.env.REACT_APP_URL}/api/auth/forgot-password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: "error", text: data.error });
                return;
            }

            setMessage({ type: "success", text: "OTP sent to your email ✅" });
            setStep(2);
        } catch {
            setMessage({ type: "error", text: "Server error" });
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- RESET PASSWORD ---------------- */
    const resetPassword = async () => {
        if (!otp || !password || !confirmPassword) {
            setMessage({ type: "error", text: "All fields are required" });
            return;
        }

        if (password !== confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match" });
            return;
        }

        if (password.length < 8) {
            setMessage({
                type: "error",
                text: "Password must be at least 8 characters",
            });
            return;
        }

        try {
            setLoading(true);
            setMessage({ type: "", text: "" });

            const res = await fetch(
                `${process.env.REACT_APP_URL}/api/auth/reset-password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        otp,
                        password,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: "error", text: data.error });
                return;
            }

            setMessage({
                type: "success",
                text: "Password reset successful 🔒",
            });

            setTimeout(() => {
                handleClose(); // close modal
                navigate("/"); // redirect to login page
            }, 1500);
        } catch {
            setMessage({ type: "error", text: "Server error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
                Forgot Password
                <IconButton onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} mt={1}>
                    {message.text && (
                        <Alert severity={message.type}>{message.text}</Alert>
                    )}

                    {/* STEP 1 */}
                    {step === 1 && (
                        <>
                            <TextField
                                label="Registered Email"
                                fullWidth
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <Button variant="contained" onClick={sendOtp} disabled={loading}>
                                Send OTP
                            </Button>
                        </>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <>
                            <TextField
                                label="OTP"
                                fullWidth
                                inputProps={{ maxLength: 6 }}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />

                            <TextField
                                label="New Password"
                                type="password"
                                fullWidth
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <TextField
                                label="Confirm Password"
                                type="password"
                                fullWidth
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />

                            <Button
                                variant="contained"
                                onClick={resetPassword}
                                disabled={loading}
                            >
                                Reset Password
                            </Button>
                        </>
                    )}
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default ForgotPassword;
