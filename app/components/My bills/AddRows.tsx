"use client";

import { Box, Button, Typography } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import type { BillItem } from "./EntryPage";

interface AddRowsProps {
  items: BillItem[];
  setItems: Dispatch<SetStateAction<BillItem[]>>;
}

const createEmptyRow = (id: number): BillItem => ({
  id,
  barcode: "",
  itemName: "",
  brand: "",
  size: "",
  qty: 0,
  rate: 0,
  discount: 0,
  gst: 0,
  amount: 0,
});

export default function AddRows({ items, setItems }: AddRowsProps) {
  const handleAddRow = () => {
    setItems((prevItems) => [
      ...prevItems,
      createEmptyRow(prevItems.length + 1),
    ]);
  };

  return (
    <Box
      sx={{
        mt: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography fontWeight={600}>Total Rows: {items.length}</Typography>

      <Button variant="contained" color="success" onClick={handleAddRow}>
        + Add Row
      </Button>
    </Box>
  );
}
