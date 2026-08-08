"use client";

import { useState } from "react";
import { Stack, Button } from "@mui/material";

export default function CashOnlineToggle() {
  const [mode, setMode] = useState<"Cash" | "Online">("Cash");

  return (
    <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
      <Button
        fullWidth
        variant={mode === "Cash" ? "contained" : "outlined"}
        onClick={() => setMode("Cash")}
        sx={{
          height: { xs: 42, sm: 48, md: 56 },
          fontSize: { xs: 14, sm: 16, md: 20 },
          fontWeight: 700,
          textTransform: "none",
        }}
      >
        Cash
      </Button>

      <Button
        fullWidth
        variant={mode === "Online" ? "contained" : "outlined"}
        onClick={() => setMode("Online")}
        sx={{
          height: { xs: 42, sm: 48, md: 56 },
          fontSize: { xs: 14, sm: 16, md: 20 },
          fontWeight: 700,
          textTransform: "none",
        }}
      >
        Online
      </Button>
    </Stack>
  );
}
