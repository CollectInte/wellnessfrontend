import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Typography,
  Stack,
  IconButton,
  Alert,
  colors,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ForgotPassword = ({ open, onClose }) => {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  /* -----------------------------
     PASSWORD VALIDATION
  ----------------------------- */
  const isPasswordValid = (pwd) => {
    return pwd.length >= 6;
  };

  /* -----------------------------
     SEND OTP
  ----------------------------- */
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

      // 🔁 OTP already exists → go to OTP screen
      if (!res.ok && data.error?.includes("OTP already")) {
        setMessage({
          type: "info",
          text: "OTP already sent. Please check your mail or wait 20 minutes.",
        });
        setStep(2);
        return;
      }

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to send OTP" });
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

  /* -----------------------------
     RESET PASSWORD
  ----------------------------- */
  const resetPassword = async () => {
    if (!otp || !password || !confirmPassword) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (!isPasswordValid(password)) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
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
            password, // 🔥 send only password
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Reset failed" });
        return;
      }

      setMessage({
        type: "success",
        text: "Password changed successfully 🔒",
      });

      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch {
      setMessage({ type: "error", text: "Server error" });
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
     CLOSE & RESET STATE
  ----------------------------- */
  const handleClose = () => {
    setStep(1);
    setEmail("");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setMessage({ type: "", text: "" });
    onClose();
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

          {/* STEP 1 : EMAIL */}
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

          {/* STEP 2 : OTP + PASSWORD */}
          {step === 2 && (
            <>
              <TextField
                label="OTP"
                fullWidth
                type="number"
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
