"use client";

import type { CSSProperties, Dispatch, SetStateAction } from "react";

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import type { BillItem } from "./EntryPage";

interface EntryTableProps {
  items: BillItem[];
  setItems: Dispatch<SetStateAction<BillItem[]>>;
}

const columns = [
  "NO",
  "Barcode",
  "Item Name",
  "Brand",
  "Size",
  "Qty",
  "Disc %",
  "Disc Rs",
  "GST %",
  "Rate",
  "Amount",
];

const createNewRow = (id: number): BillItem => ({
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

export default function EntryTable({ items, setItems }: EntryTableProps) {
  const handleChange = (
    index: number,
    field: keyof BillItem,
    value: string,
  ) => {
    setItems((prev) => {
      const rows = [...prev];

      const updatedRow: BillItem = {
        ...rows[index],
        [field]:
          field === "qty" ||
          field === "rate" ||
          field === "discount" ||
          field === "gst"
            ? value === ""
              ? 0
              : Number(value)
            : value,
      };

      const gross = updatedRow.qty * updatedRow.rate;
      const discountRs = (gross * updatedRow.discount) / 100;
      const taxable = gross - discountRs;
      const gstRs = (taxable * updatedRow.gst) / 100;

      updatedRow.amount = taxable + gstRs;

      rows[index] = updatedRow;

      // Auto Add New Row
      if (
        index === rows.length - 1 &&
        (updatedRow.barcode ||
          updatedRow.itemName ||
          updatedRow.brand ||
          updatedRow.size ||
          updatedRow.qty > 0 ||
          updatedRow.rate > 0)
      ) {
        rows.push(createNewRow(rows.length + 1));
      }

      return rows;
    });
  };

  const renderInput = (
    index: number,
    field: keyof BillItem,
    value: string | number,
    type: string = "text",
  ) => (
    <input
      type={type}
      value={value === 0 ? "" : value}
      onChange={(e) => handleChange(index, field, e.target.value)}
      style={inputStyle}
    />
  );

  return (
    <Paper
      elevation={2}
      sx={{
        border: "1px solid #4CAF50",
        borderRadius: 1,
        overflow: "auto",
        height: 400,
      }}
    >
      <Table
        stickyHeader
        size="small"
        sx={{
          minWidth: 1200,
          tableLayout: "fixed",
        }}
      >
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col} sx={headerStyle}>
                {col}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((item, index) => {
            const gross = item.qty * item.rate;
            const discountRs = (gross * item.discount) / 100;

            return (
              <TableRow
                key={item.id}
                hover
                sx={{
                  "&:hover": {
                    bgcolor: "#FFFDE7",
                  },
                }}
              >
                <TableCell sx={cellStyle}>{index + 1}</TableCell>

                <TableCell sx={inputCell}>
                  {renderInput(index, "barcode", item.barcode)}
                </TableCell>

                <TableCell sx={inputCell}>
                  {renderInput(index, "itemName", item.itemName)}
                </TableCell>

                <TableCell sx={inputCell}>
                  {renderInput(index, "brand", item.brand)}
                </TableCell>

                <TableCell sx={inputCell}>
                  {renderInput(index, "size", item.size)}
                </TableCell>

                <TableCell sx={inputCell}>
                  {renderInput(index, "qty", item.qty, "number")}
                </TableCell>

                <TableCell sx={inputCell}>
                  {renderInput(index, "discount", item.discount, "number")}
                </TableCell>

                <TableCell sx={rightCell}>
                  {discountRs === 0 ? "" : discountRs.toFixed(2)}
                </TableCell>
                <TableCell sx={inputCell}>
                  {renderInput(index, "gst", item.gst, "number")}
                </TableCell>

                <TableCell sx={inputCell}>
                  {renderInput(index, "rate", item.rate, "number")}
                </TableCell>

                <TableCell sx={amountCell}>
                  {item.amount === 0 ? "" : item.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}

const headerStyle = {
  bgcolor: "#E6DFA5",
  border: "1px solid #4CAF50",
  fontWeight: 700,
  fontSize: 13,
  textAlign: "center",
  p: 1,
};

const cellStyle = {
  border: "1px solid #4CAF50",
  fontSize: 13,
  height: 36,
};

const inputCell = {
  border: "1px solid #4CAF50",
  p: 0,
};

const rightCell = {
  border: "1px solid #4CAF50",
  textAlign: "right",
  fontSize: 13,
};

const amountCell = {
  border: "1px solid #4CAF50",
  textAlign: "right",
  fontWeight: 700,
  color: "#1B5E20",
  fontSize: 13,
};

const inputStyle: CSSProperties = {
  width: "100%",
  height: "36px",
  border: "none",
  outline: "none",
  background: "transparent",
  padding: "4px 8px",
  fontSize: "13px",
  boxSizing: "border-box",
};
