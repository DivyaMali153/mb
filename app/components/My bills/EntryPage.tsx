"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  inventoryItemId?: string;
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

export interface BillData {
  id?: string;
  billNo: number;
  date: string;
  paymentMode: "Cash" | "Online";
  total: number;
  items: BillItem[];
}

const createEmptyRow = (id: number): BillItem => ({
  id,
  inventoryItemId: undefined,
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState(() => new Date().toLocaleDateString());
  const [loadingBill, setLoadingBill] = useState(false);

  // --------------------------------------------------
  // BILL NUMBER
  // --------------------------------------------------

  const [billNo, setBillNo] = useState<number>(() => Date.now());

  // --------------------------------------------------
  // PAYMENT MODE
  // --------------------------------------------------

  const [paymentMode, setPaymentMode] = useState<"Cash" | "Online">("Cash");

  // --------------------------------------------------
  // BILL ITEMS
  // --------------------------------------------------

  const [items, setItems] = useState<BillItem[]>(
    Array.from({ length: 10 }, (_, index) => createEmptyRow(index + 1)),
  );

  useEffect(() => {
    let cancelled = false;
    const loadBillForEdit = async () => {
      if (!editId) {
        setEditingId(null);
        return;
      }
      try {
        setLoadingBill(true);
        const response = await fetch(`/api/bills/${encodeURIComponent(editId)}`, { cache: "no-store" });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Unable to load bill");
        if (cancelled) return;
        const bill = result.bill as BillData;
        setEditingId(bill.id || editId);
        setBillNo(bill.billNo);
        setDate(bill.date || new Date().toLocaleDateString());
        setPaymentMode(bill.paymentMode || "Cash");
        const loadedItems = Array.isArray(bill.items) ? bill.items : [];
        setItems([...loadedItems, ...Array.from({ length: Math.max(0, 10 - loadedItems.length) }, (_, index) => createEmptyRow(loadedItems.length + index + 1))]);
      } catch (error) {
        if (!cancelled) alert(error instanceof Error ? error.message : "Unable to load bill");
      } finally {
        if (!cancelled) setLoadingBill(false);
      }
    };
    loadBillForEdit();
    return () => { cancelled = true; };
  }, [editId]);

  // --------------------------------------------------
  // DISCOUNT CALCULATION
  // --------------------------------------------------

  const discount = useMemo(() => {
    return items.reduce((total, item) => {
      const gross = item.qty * item.rate;

      const discountAmount = (gross * item.discount) / 100;

      return total + discountAmount;
    }, 0);
  }, [items]);

  // --------------------------------------------------
  // GST CALCULATION
  // --------------------------------------------------

  const gst = useMemo(() => {
    return items.reduce((total, item) => {
      const gross = item.qty * item.rate;

      const discountAmount = (gross * item.discount) / 100;

      const taxableAmount = gross - discountAmount;

      const gstAmount = (taxableAmount * item.gst) / 100;

      return total + gstAmount;
    }, 0);
  }, [items]);

  // --------------------------------------------------
  // EXTRA ADD
  // --------------------------------------------------

  const extraAdd = 0;

  // --------------------------------------------------
  // GRAND TOTAL
  // --------------------------------------------------

  const grandTotal = useMemo(() => {
    return items.reduce((total, item) => total + Number(item.amount || 0), 0);
  }, [items]);

  // ==================================================
  // SAVE BILL
  // ==================================================

  const saveBill = async () => {
    // ------------------------------------------------
    // ONLY KEEP ROWS THAT CONTAIN SOME DATA
    // ------------------------------------------------

    const validItems = items.filter(
      (item) =>
        item.barcode.trim() !== "" ||
        item.itemName.trim() !== "" ||
        item.brand.trim() !== "" ||
        item.size.trim() !== "" ||
        item.qty > 0 ||
        item.rate > 0,
    );

    // ------------------------------------------------
    // CHECK IF AT LEAST ONE ITEM EXISTS
    // ------------------------------------------------

    if (validItems.length === 0) {
      alert("Please enter at least one item.");
      return;
    }

    if (validItems.some((item) => item.qty <= 0)) {
      alert("Quantity must be greater than zero for every sold item.");
      return;
    }

    // ------------------------------------------------
    // CREATE BILL OBJECT
    // ------------------------------------------------

    const billData: BillData = {
      ...(editingId ? { id: editingId } : {}),
      billNo: billNo,
      date: date,
      paymentMode: paymentMode,
      total: grandTotal,
      items: validItems,
    };

    // ------------------------------------------------
    // CONSOLE - BEFORE API
    // ------------------------------------------------

    console.log("=================================");
    console.log("SAVE BILL CLICKED");
    console.log("=================================");

    console.log("Bill data sending to API:");
    console.log(billData);

    try {
      // ----------------------------------------------
      // CALL SAVE BILL API
      // ----------------------------------------------

      const response = await fetch(editingId ? `/api/bills/${encodeURIComponent(editingId)}` : "/api/bills", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billData),
      });

      // ----------------------------------------------
      // CONSOLE - API STATUS
      // ----------------------------------------------

      console.log("API Response Status:", response.status);

      // ----------------------------------------------
      // READ API RESPONSE
      // ----------------------------------------------

      const result = await response.json();

      console.log("API Response:");
      console.log(result);

      // ----------------------------------------------
      // CHECK API RESPONSE
      // ----------------------------------------------

      if (!response.ok || !result.success) {
        console.error("API failed to save bill:", result);

        alert(result.message || "Unable to save bill. Please try again.");

        return;
      }

      // ----------------------------------------------
      // SUCCESS
      // ----------------------------------------------

      console.log("=================================");
      console.log("BILL SAVED SUCCESSFULLY");
      console.log("=================================");

      console.log("Saved Bill:", result.bill);

      // ----------------------------------------------
      // NOTIFY REPORT PAGE
      // ----------------------------------------------
      // Keep this event for your current report
      // components. Later we will change the report
      // to directly read from the API.

      window.dispatchEvent(new Event("billsUpdated"));

      // ----------------------------------------------
      // SUCCESS MESSAGE
      // ----------------------------------------------

      alert(editingId ? "Bill updated successfully and stock adjusted." : "Bill saved successfully and stock updated.");

      if (editingId) {
        window.dispatchEvent(new Event("billsUpdated"));
        window.dispatchEvent(new Event("inventoryUpdated"));
        router.push("/billSystem/my-bills?tab=2");
        router.refresh();
        return;
      }

      // ----------------------------------------------
      // CREATE NEW BILL NUMBER
      // ----------------------------------------------

      setBillNo(Date.now());
      setDate(new Date().toLocaleDateString());

      // ----------------------------------------------
      // CLEAR TABLE
      // ----------------------------------------------

      setItems(
        Array.from({ length: 10 }, (_, index) => createEmptyRow(index + 1)),
      );

      // ----------------------------------------------
      // RESET PAYMENT MODE
      // ----------------------------------------------

      setPaymentMode("Cash");
      setEditingId(null);
      window.dispatchEvent(new Event("inventoryUpdated"));
    } catch (error) {
      // ----------------------------------------------
      // API / NETWORK ERROR
      // ----------------------------------------------

      console.error("Error calling Save Bill API:", error);

      alert("Unable to save bill. Please check the server and try again.");
    }
  };

  // ==================================================
  // NEW BILL
  // ==================================================

  const handleNewBill = () => {
    setEditingId(null);
    setBillNo(Date.now());
    setDate(new Date().toLocaleDateString());

    setPaymentMode("Cash");

    setItems(
      Array.from({ length: 10 }, (_, index) => createEmptyRow(index + 1)),
    );
  };

  // ==================================================
  // RESET BILL
  // ==================================================

  const handleReset = () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset this bill?",
    );

    if (!confirmReset) {
      return;
    }

    setItems(
      Array.from({ length: 10 }, (_, index) => createEmptyRow(index + 1)),
    );
  };

  // ==================================================
  // CANCEL BILL
  // ==================================================

  const handleCancel = () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this bill?",
    );

    if (!confirmCancel) {
      return;
    }

    setEditingId(null);
    setBillNo(Date.now());
    setDate(new Date().toLocaleDateString());

    setPaymentMode("Cash");

    setItems(
      Array.from({ length: 10 }, (_, index) => createEmptyRow(index + 1)),
    );
  };

  // ==================================================
  // PRINT BILL
  // ==================================================

  const handlePrint = () => {
    window.print();
  };

  // ==================================================
  // UI
  // ==================================================

  if (loadingBill) {
    return <Box sx={{ p: 4, textAlign: "center" }}>Loading bill...</Box>;
  }

  return (
    <Box
      sx={{
        width: "100%",
        p: 1,
        bgcolor: "#f4f1b6",
      }}
    >
      {/* ============================================
          ENTRY HEADER
      ============================================ */}

      <EntryHeader
        billNo={billNo}
        date={date}
        paymentMode={paymentMode}
        setPaymentMode={setPaymentMode}
      />

      {/* ============================================
          BILLING TABLE
      ============================================ */}

      <EntryTable items={items} setItems={setItems} />

      {/* ============================================
          ADD ROW
      ============================================ */}

      <AddRows items={items} setItems={setItems} />

      {/* ============================================
          BOTTOM PANELS
      ============================================ */}

      <Grid container spacing={1} mt={1}>
        {/* ==========================================
            SELECTED SIZE
        ========================================== */}

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <SelectedSizePanel />
        </Grid>

        {/* ==========================================
            CALCULATION
        ========================================== */}

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <CalculationPanel
            discount={discount}
            gst={gst}
            extraAdd={extraAdd}
            grandTotal={grandTotal}
          />
        </Grid>

        {/* ==========================================
            AMOUNT
        ========================================== */}

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <AmountPanel amount={grandTotal} />
        </Grid>
      </Grid>

      {/* ============================================
          FOOTER BUTTONS
      ============================================ */}

      <FooterButtons
        grandTotal={grandTotal}
        onSave={saveBill}
        onPrint={handlePrint}
        onNewBill={handleNewBill}
        onReset={handleReset}
        onCancel={handleCancel}
      />
    </Box>
  );
}
