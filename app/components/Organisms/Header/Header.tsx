"use client";

import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Admin Dashboard
        </Typography>

        <Box>
          <Button
            color="inherit"
            onClick={() => router.push("/billSystem/profile")}
          >
            Profile
          </Button>

          <Button
            color="inherit"
            onClick={() => router.push("/billSystem/settings")}
          >
            Settings
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            onClick={() => router.push("/billSystem/login")}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
