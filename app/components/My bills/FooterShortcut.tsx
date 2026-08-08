import { Box, Grid, Typography } from "@mui/material";

export default function FooterShortcuts() {
  return (
    <Box
      sx={{
        mt: 1,
        px: 1,
        py: 0.5,
        bgcolor: "#f7f7f7",
        borderTop: "1px solid #bdbdbd",
        fontSize: 12,
      }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 3 }}>
          <Typography variant="caption" display="block">
            F1 - Sale of Current User
          </Typography>
          <Typography variant="caption" display="block">
            F2 - Cash / Credit
          </Typography>
        </Grid>

        <Grid size={{ xs: 3 }}>
          <Typography variant="caption" display="block">
            F3 - Bill Change
          </Typography>
          <Typography variant="caption" display="block">
            F4 - Cash Receipt
          </Typography>
        </Grid>

        <Grid size={{ xs: 3 }}>
          <Typography variant="caption" display="block">
            F5 - Barcode Last Sale
          </Typography>
          <Typography variant="caption" display="block">
            F6 - Barcode Stock
          </Typography>
        </Grid>

        <Grid size={{ xs: 3 }}>
          <Typography variant="caption" display="block">
            F10 - Save Bill
          </Typography>
        </Grid>
      </Grid>

      <Box
        sx={{
          mt: 1,
          display: "flex",
          justifyContent: "center",
          gap: 3,
          fontWeight: 700,
          fontSize: 18,
        }}
      >
        <Typography color="primary">SELECT --&gt;</Typography>

        <Typography color="success.main">+ SAVE</Typography>

        <Typography color="warning.main">- EDIT</Typography>
      </Box>
    </Box>
  );
}
