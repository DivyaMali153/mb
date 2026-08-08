import { Box, Typography } from "@mui/material";

export default function TotalBar() {
  return (
    <Box
      sx={{
        mt: 0.5,
        bgcolor: "#0b6b1a",
        color: "#fff",
        display: "grid",
        gridTemplateColumns: "1fr 120px 140px",
        alignItems: "center",
        px: 2,
        py: 1,
        border: "1px solid #064411",
      }}
    >
      <Typography fontWeight={700}>TOTAL</Typography>

      <Typography textAlign="center" fontWeight={700}>
        0
      </Typography>

      <Typography textAlign="right" fontWeight={700}>
        0.00
      </Typography>
    </Box>
  );
}
