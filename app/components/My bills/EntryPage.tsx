"use client";

import { useMemo, useState } from "react";
import { Box, Grid } from "@mui/material";

import EntryHeader from "./EntryHeader";
import EntryTable from "./EntryTable";
import AddRows from "./AddRows";
import SelectedSizePanel from "./SelectedSizePanel";
import CalculationPanel from "./CalculationPanel";
import AmountPanel from "./AmountPanel";
import FooterButtons from "./FooterButtons";

export interface BillItem {
  id: number;
  barcode: string;
  itemName: string;
  brand: string;
  size: string;
  qty: number;
  rate: number;
  discount: number;
  gst: number;
  amount: number;
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

export default function EntryPage() {
  const [billNo] = useState(Date.now());

  const [paymentMode, setPaymentMode] = useState<"Cash" | "Online">("Cash");

  const [items, setItems] = useState<BillItem[]>(
    Array.from({ length: 10 }, (_, index) => createEmptyRow(index + 1)),
  );

  const discount = useMemo(() => {
    return items.reduce((total, item) => {
      const gross = item.qty * item.rate;
      return total + (gross * item.discount) / 100;
    }, 0);
  }, [items]);

  const gst = useMemo(() => {
    return items.reduce((total, item) => {
      const gross = item.qty * item.rate;
      const disc = (gross * item.discount) / 100;
      const taxable = gross - disc;

      return total + (taxable * item.gst) / 100;
    }, 0);
  }, [items]);

  const extraAdd = 0;

  const grandTotal = useMemo(() => {
    return items.reduce((total, item) => total + item.amount, 0);
  }, [items]);

  const saveBill = () => {
    const validItems = items.filter(
      (item) =>
        item.barcode.trim() !== "" ||
        item.itemName.trim() !== "" ||
        item.qty > 0 ||
        item.rate > 0,
    );

    if (validItems.length === 0) {
      alert("Please enter at least one item.");
      return;
    }

    const billData = {
      billNo,
      date: new Date().toLocaleDateString(),
      paymentMode,
      total: grandTotal,
      items: validItems,
    };

    console.log("Bill Saved:", billData);

    alert("Bill Saved Successfully");

    setItems(
      Array.from({ length: 10 }, (_, index) => createEmptyRow(index + 1)),
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        p: 1,
        bgcolor: "#f4f1b6",
      }}
    >
      {/* Header */}
      <EntryHeader
        billNo={billNo}
        paymentMode={paymentMode}
        setPaymentMode={setPaymentMode}
      />

      {/* Billing Table */}
      <EntryTable items={items} setItems={setItems} />

      {/* Add Rows */}
      <AddRows items={items} setItems={setItems} />

      {/* Bottom Panels */}
      <Grid container spacing={1} mt={1}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SelectedSizePanel />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <CalculationPanel
            discount={discount}
            gst={gst}
            extraAdd={extraAdd}
            grandTotal={grandTotal}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AmountPanel amount={grandTotal} />
        </Grid>
      </Grid>

      {/* Footer Buttons */}
      <FooterButtons
        grandTotal={grandTotal}
        onSave={saveBill}
        onPrint={() => window.print()}
        onNewBill={() => console.log("New Bill")}
        onReset={() => console.log("Reset")}
        onCancel={() => console.log("Cancel")}
      />
    </Box>
  );
}
