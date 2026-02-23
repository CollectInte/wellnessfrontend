import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Paper, Link } from "@mui/material";
// import Swal from "sweetalert2";
import ForgotPassword from "./ForgotPassword";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_URL}/login`,
        { email, password },
        { withCredentials: true }
      );
      localStorage.setItem("userName", res.data.user.name);
      localStorage.setItem("id", res.data.user.id);
      localStorage.setItem("role", res.data.user.role);

      navigate("/client");
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          alert("Invalid email or password");
        } else {
          alert("Server error");
        }
      } else {
        alert("Network error");
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        marginTop: 25,
        mx: 1,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: 400, boxShadow: 15 }}>
        {showForgot ? (
          //   <ForgotPassword onClose={() => setShowForgot(false)} />
          ""
        ) : (
          <>
            <Typography variant="h5" align="center" gutterBottom>
              Login
            </Typography>
            <form onSubmit={handleLogin}>
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                variant="contained"
                fullWidth
                type="submit"
                sx={{ mt: 2 }}
              >
                Login
              </Button>
            </form>

            {/* <Box marginTop={2} textAlign="right">
              <Link
                component="button"
                variant="body2"
                onClick={() => setShowForgot(true)}
              >
                Forgot Password?
              </Link>
            </Box> */}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Login;
