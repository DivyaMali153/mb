import { Box, Paper, Typography, Grid, Avatar } from "@mui/material";

const Profile = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Profile
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mb: 2,
              }}
            >
              A
            </Avatar>
          </Grid>

          <Grid size={12}>
            <Typography>
              <strong>Name :</strong> Admin User
            </Typography>
          </Grid>

          <Grid size={12}>
            <Typography>
              <strong>Email :</strong> admin@gmail.com
            </Typography>
          </Grid>

          <Grid size={12}>
            <Typography>
              <strong>Mobile :</strong> 9876543210
            </Typography>
          </Grid>

          <Grid size={12}>
            <Typography>
              <strong>Role :</strong> Administrator
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;
