"use client";

import MyBills from "@/app/components/My bills/MyBills";

import { Box } from "@mui/material";

export default function MyBillsPage() {
  return (
    <Box
      sx={{
        p: 3,
        bgcolor: "#FFFBEA",
        minHeight: "100vh",
      }}
    >
      <MyBills />
    </Box>
  );
}
