import { Paper, Typography, Grid, TextField } from "@mui/material";

export default function SelectedSizePanel() {
  return (
    <Paper
      sx={{
        p: 2,
        border: "1px solid #bdbdbd",
        minHeight: 180,
      }}
    >
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Selected Size
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 3 }}>
          <Typography fontWeight="bold">Size</Typography>

          <TextField fullWidth size="small" defaultValue="MIX SIZE" />
        </Grid>

        <Grid size={{ xs: 3 }}>
          <Typography fontWeight="bold">Color</Typography>

          <TextField fullWidth size="small" defaultValue="Mix Color" />
        </Grid>

        <Grid size={{ xs: 3 }}>
          <Typography fontWeight="bold">Rate</Typography>

          <TextField fullWidth size="small" type="number" defaultValue={0} />
        </Grid>

        <Grid size={{ xs: 3 }}>
          <Typography fontWeight="bold">Stock</Typography>

          <TextField fullWidth size="small" type="number" defaultValue={2593} />
        </Grid>
      </Grid>
    </Paper>
  );
}
