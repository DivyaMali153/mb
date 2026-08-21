"use client";

import type { CSSProperties, Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import {
  Autocomplete,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import type { BillItem } from "./EntryPage";

interface InventoryItem {
  id: string;
  barcode: string;
  sku?: string;
  itemName: string;
  brand: string;
  size: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  gst: number;
  reorderLevel: number;
}

interface EntryTableProps {
  items: BillItem[];
  setItems: Dispatch<SetStateAction<BillItem[]>>;
}

const columns = ["NO", "Barcode", "Item Name", "Brand", "Size", "Qty", "Disc %", "Disc Rs", "GST %", "Rate", "Amount"];

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

function ItemAutocompleteCell({ value, onSelect, onTextChange }: { value: string; onSelect: (item: InventoryItem) => void; onTextChange: (value: string) => void }) {
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => setInputValue(value), [value]);

  useEffect(() => {
    const query = inputValue.trim();
    if (!query) {
      setOptions([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/inventory?search=${encodeURIComponent(query)}`, { cache: "no-store" });
        const result = await response.json();
        if (response.ok && result.success) setOptions(Array.isArray(result.items) ? result.items : []);
      } catch (error) {
        console.error("Inventory item search failed", error);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [inputValue]);

  return (
    <Autocomplete
      freeSolo
      options={options}
      loading={loading}
      value={null}
      inputValue={inputValue}
      onInputChange={(_, nextValue) => {
        setInputValue(nextValue);
        onTextChange(nextValue);
      }}
      onChange={(_, selected) => {
        if (selected && typeof selected !== "string") {
          setInputValue(selected.itemName);
          onSelect(selected);
        }
      }}
      getOptionLabel={(option) => typeof option === "string" ? option : `${option.itemName}${option.size ? ` — ${option.size}` : ""}${option.brand ? ` — ${option.brand}` : ""}`}
      isOptionEqualToValue={(option, selected) => typeof selected !== "string" && option.id === selected.id}
      noOptionsText={inputValue.trim() ? "No inventory item found" : "Type to search inventory"}
      sx={{ width: "100%" }}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <div>
            <strong>{option.itemName}</strong>{option.size ? ` — ${option.size}` : ""}
            <div style={{ fontSize: 11, opacity: 0.7 }}>
              {option.brand || "No brand"} · Rate ₹{Number(option.sellingPrice || 0).toFixed(2)} · Stock {option.quantity}
            </div>
          </div>
        </li>
      )}
      renderInput={(params) => <TextField {...params} placeholder="Search inventory item" variant="standard" />}
    />
  );
}

export default function EntryTable({ items, setItems }: EntryTableProps) {
  const updateRow = (index: number, updater: (row: BillItem) => BillItem) => {
    setItems((prev) => {
      const rows = [...prev];
      rows[index] = updater(rows[index]);
      return rows;
    });
  };

  const handleChange = (index: number, field: keyof BillItem, value: string) => {
    setItems((prev) => {
      const rows = [...prev];
      const updatedRow: BillItem = {
        ...rows[index],
        ...(field === "itemName" ? { inventoryItemId: undefined } : {}),
        [field]: ["qty", "rate", "discount", "gst"].includes(field)
          ? value === "" ? 0 : Number(value)
          : value,
      } as BillItem;

      const gross = updatedRow.qty * updatedRow.rate;
      const discountRs = (gross * updatedRow.discount) / 100;
      const taxable = gross - discountRs;
      updatedRow.amount = taxable + (taxable * updatedRow.gst) / 100;
      rows[index] = updatedRow;

      if (index === rows.length - 1 && (updatedRow.barcode || updatedRow.itemName || updatedRow.brand || updatedRow.size || updatedRow.qty > 0 || updatedRow.rate > 0)) {
        rows.push(createNewRow(rows.length + 1));
      }
      return rows;
    });
  };

  const handleInventorySelect = (index: number, inventoryItem: InventoryItem) => {
    updateRow(index, (row) => {
      const next = {
        ...row,
        inventoryItemId: inventoryItem.id,
        barcode: inventoryItem.barcode,
        itemName: inventoryItem.itemName,
        brand: inventoryItem.brand,
        size: inventoryItem.size,
        rate: Number(inventoryItem.sellingPrice || 0),
        gst: Number(inventoryItem.gst || 0),
      };
      const gross = next.qty * next.rate;
      const discountRs = (gross * next.discount) / 100;
      const taxable = gross - discountRs;
      next.amount = taxable + (taxable * next.gst) / 100;
      return next;
    });
  };

  const renderInput = (index: number, field: keyof BillItem, value: string | number, type = "text") => (
    <input type={type} value={value === 0 ? "" : value} onChange={(e) => handleChange(index, field, e.target.value)} style={inputStyle} />
  );

  return (
    <Paper elevation={2} sx={{ border: "1px solid #4CAF50", borderRadius: 1, overflow: "auto", height: 400 }}>
      <Table stickyHeader size="small" sx={{ minWidth: 1200, tableLayout: "fixed" }}>
        <TableHead><TableRow>{columns.map((col) => <TableCell key={col} sx={headerStyle}>{col}</TableCell>)}</TableRow></TableHead>
        <TableBody>
          {items.map((item, index) => {
            const gross = item.qty * item.rate;
            const discountRs = (gross * item.discount) / 100;
            return (
              <TableRow key={item.id} hover sx={{ "&:hover": { bgcolor: "#FFFDE7" } }}>
                <TableCell sx={cellStyle}>{index + 1}</TableCell>
                <TableCell sx={inputCell}>{renderInput(index, "barcode", item.barcode)}</TableCell>
                <TableCell sx={inputCell}>
                  <ItemAutocompleteCell value={item.itemName} onTextChange={(value) => handleChange(index, "itemName", value)} onSelect={(selected) => handleInventorySelect(index, selected)} />
                </TableCell>
                <TableCell sx={inputCell}>{renderInput(index, "brand", item.brand)}</TableCell>
                <TableCell sx={inputCell}>{renderInput(index, "size", item.size)}</TableCell>
                <TableCell sx={inputCell}>{renderInput(index, "qty", item.qty, "number")}</TableCell>
                <TableCell sx={inputCell}>{renderInput(index, "discount", item.discount, "number")}</TableCell>
                <TableCell sx={rightCell}>{discountRs === 0 ? "" : discountRs.toFixed(2)}</TableCell>
                <TableCell sx={inputCell}>{renderInput(index, "gst", item.gst, "number")}</TableCell>
                <TableCell sx={inputCell}>{renderInput(index, "rate", item.rate, "number")}</TableCell>
                <TableCell sx={amountCell}>{item.amount === 0 ? "" : item.amount.toFixed(2)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}

const headerStyle = { bgcolor: "#E6DFA5", border: "1px solid #4CAF50", fontWeight: 700, fontSize: 13, textAlign: "center", p: 1 };
const cellStyle = { border: "1px solid #4CAF50", fontSize: 13, height: 36 };
const inputCell = { border: "1px solid #4CAF50", p: 0 };
const rightCell = { border: "1px solid #4CAF50", textAlign: "right", fontSize: 13 };
const amountCell = { border: "1px solid #4CAF50", textAlign: "right", fontWeight: 700, color: "#1B5E20", fontSize: 13 };
const inputStyle: CSSProperties = { width: "100%", height: "36px", border: "none", outline: "none", background: "transparent", padding: "4px 8px", fontSize: "13px", boxSizing: "border-box" };
