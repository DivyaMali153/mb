import { Paper, TextField, Typography } from "@mui/material";

interface CustomerPanelProps {
  mobile?: string;
  onChange?: (value: string) => void;
}

export default function CustomerPanel({
  mobile = "",
  onChange,
}: CustomerPanelProps) {
  return (
    <Paper
      sx={{
        p: 2,
        height: "100%",
      }}
    >
      <Typography variant="subtitle1" fontWeight={700} mb={1}>
        Track Customer Bill by Mobile No
      </Typography>

      <TextField
        fullWidth
        size="small"
        placeholder="Enter Mobile Number"
        value={mobile}
        onChange={(e) => onChange?.(e.target.value)}
        inputProps={{
          maxLength: 10,
          inputMode: "numeric",
        }}
        autoComplete="off"
      />
    </Paper>
  );
}
