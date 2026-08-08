import { Card, Grid, TextField, Button } from "@mui/material";

const ReportFilters = () => {
  return (
    <Card sx={{ p: 2, mt: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="From Date"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="To Date"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField fullWidth size="small" label="Customer Name" />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Button variant="contained" fullWidth sx={{ height: "40px" }}>
            Search
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
};

export default ReportFilters;
