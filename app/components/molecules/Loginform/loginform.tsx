"use client";
import { useState } from "react";

import { Paper, Typography, TextField, Box, Alert } from "@mui/material";
import PrimaryButton from "../../atoms/Button";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");

    if (!username || !password) {
      setError("Username and Password are required.");
      return;
    }

    // Dummy Login
    if (username === "1" && password === "1") {
      return true;
    } else {
      setError("Invalid Username or Password.");
    }
  };

  return (
    <Paper
      elevation={5}
      sx={{
        width: 450,
        p: 4,
        mx: "auto",
        mt: 10,
        borderRadius: 2,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          mb: 3,
        }}
      >
        Login
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Username"
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <TextField
        fullWidth
        type="password"
        label="Password"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Box mt={3}>
        <PrimaryButton title="Login" onClick={handleLogin} />
      </Box>
    </Paper>
  );
};

export default LoginForm;
