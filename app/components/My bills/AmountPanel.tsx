import { Box, Paper, Typography } from "@mui/material";

interface AmountPanelProps {
  amount: number;
}

export default function AmountPanel({ amount }: AmountPanelProps) {
  return (
    <Paper
      elevation={2}
      sx={{
        height: 170,
        bgcolor: "#0B8E2E",
        color: "#fff",
        border: "2px solid #0A6F24",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography
        sx={{
          fontSize: 18,
          fontWeight: 600,
          mb: 1,
        }}
      >
        Grand Total
      </Typography>

      <Box
        sx={{
          width: "100%",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          ₹ {amount.toFixed(2)}
        </Typography>
      </Box>
    </Paper>
  );
}
