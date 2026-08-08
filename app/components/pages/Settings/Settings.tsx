import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Divider,
} from "@mui/material";

const Settings = () => {
  const [formData, setFormData] = useState({
    name: "Admin",
    email: "admin@gmail.com",
    language: "English",
    notification: true,
    darkMode: false,
  });

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSave = () => {
    alert("Settings Saved Successfully");
    console.log(formData);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Settings
      </Typography>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>
          Profile Information
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>

              <Select
                label="Language"
                value={formData.language}
                onChange={(e) => handleChange("language", e.target.value)}
              >
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Hindi">Hindi</MenuItem>
                <MenuItem value="Marathi">Marathi</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" mb={2}>
          Preferences
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={formData.notification}
              onChange={(e) => handleChange("notification", e.target.checked)}
            />
          }
          label="Enable Notifications"
        />

        <br />

        <FormControlLabel
          control={
            <Switch
              checked={formData.darkMode}
              onChange={(e) => handleChange("darkMode", e.target.checked)}
            />
          }
          label="Dark Mode"
        />

        <Box mt={4}>
          <Button variant="contained" size="large" onClick={handleSave}>
            Save Settings
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;
