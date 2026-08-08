"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  Card,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

interface EntryHeaderProps {
  billNo: number;
  paymentMode: "Cash" | "Online";
  setPaymentMode: Dispatch<SetStateAction<"Cash" | "Online">>;
}

export default function EntryHeader({
  billNo,
  paymentMode,
  setPaymentMode,
}: EntryHeaderProps) {
  const today = new Date().toLocaleDateString();

  return (
    <Card
      elevation={2}
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 2,
        bgcolor: "#FFF9D8",
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {/* Bill Number */}
        <Grid size={{ xs: 12, sm: 3, md: 2 }}>
          <Typography fontWeight={700} mb={0.5}>
            Bill No
          </Typography>

          <TextField
            fullWidth
            size="small"
            value={billNo}
            InputProps={{
              readOnly: true,
            }}
          />
        </Grid>

        {/* Date */}
        <Grid size={{ xs: 12, sm: 3, md: 2 }}>
          <Typography fontWeight={700} mb={0.5}>
            Date
          </Typography>

          <TextField
            fullWidth
            size="small"
            value={today}
            InputProps={{
              readOnly: true,
            }}
          />
        </Grid>

        {/* Payment Mode */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography fontWeight={700} mb={0.5}>
            Payment Mode
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={paymentMode === "Cash"}
                onChange={(e) =>
                  setPaymentMode(e.target.checked ? "Cash" : "Online")
                }
              />
            }
            label={paymentMode}
          />
        </Grid>

        {/* Last Bill */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 2,
            }}
          >
            <Grid container spacing={1}>
              <Grid size={6}>
                <Typography fontWeight={600}>Last Bill</Typography>
              </Grid>

              <Grid size={6}>
                <Typography>{billNo - 1}</Typography>
              </Grid>

              <Grid size={6}>
                <Typography fontWeight={600}>Amount</Typography>
              </Grid>

              <Grid size={6}>
                <Typography>₹ 0.00</Typography>
              </Grid>

              <Grid size={6}>
                <Typography fontWeight={600}>Payment</Typography>
              </Grid>

              <Grid size={6}>
                <Typography>{paymentMode}</Typography>
              </Grid>

              <Grid size={6}>
                <Typography fontWeight={600}>User</Typography>
              </Grid>

              <Grid size={6}>
                <Typography>Admin</Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Card>
  );
}
