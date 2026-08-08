"use client";

import { Box, Button, Card, Stack, Typography } from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

interface FooterButtonsProps {
  grandTotal: number;
  onSave: () => void;
  onNewBill?: () => void;
  onReset?: () => void;
  onCancel?: () => void;
  onPrint?: () => void;
}

export default function FooterButtons({
  grandTotal,
  onSave,
  onNewBill = () => {},
  onReset = () => {},
  onCancel = () => {},
  onPrint = () => {},
}: FooterButtonsProps) {
  return (
    <Card
      elevation={3}
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: "#FFF9D8",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        {/* Left Buttons */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          flexWrap="wrap"
        >
          <Button
            variant="contained"
            color="success"
            startIcon={<SaveIcon />}
            onClick={onSave}
          >
            Save Bill
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={onPrint}
          >
            Print
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={onNewBill}
          >
            New Bill
          </Button>

          <Button
            variant="contained"
            color="warning"
            startIcon={<RestartAltIcon />}
            onClick={onReset}
          >
            Reset
          </Button>

          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </Stack>

        {/* Grand Total */}
        <Card
          elevation={2}
          sx={{
            minWidth: 220,
            px: 3,
            py: 1.5,
            bgcolor: "#0D5C22",
            color: "#fff",
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="body2">Grand Total</Typography>

          <Typography variant="h5" fontWeight="bold">
            ₹ {grandTotal.toFixed(2)}
          </Typography>
        </Card>
      </Box>
    </Card>
  );
}
