"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Grid, Typography } from "@mui/material";

interface BillItem {
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

interface BillData {
  billNo: number;
  date: string;
  paymentMode: "Cash" | "Online";
  total: number;
  items: BillItem[];
}

const ReportSummary = () => {
  const [bills, setBills] = useState<BillData[]>([]);
  const [loading, setLoading] = useState(true);

  // ==================================================
  // GET BILLS FROM API
  // ==================================================

  const loadBills = async () => {
    try {
      setLoading(true);

      console.log("=================================");
      console.log("📊 REPORT SUMMARY");
      console.log("GET /api/bills");
      console.log("=================================");

      const response = await fetch("/api/bills", {
        method: "GET",
        cache: "no-store",
      });

      console.log("API Response Status:", response.status);

      const result = await response.json();

      console.log("API Response:");
      console.log(result);

      if (!response.ok || !result.success) {
        console.error("Failed to load bills:", result.message);

        setBills([]);
        return;
      }

      // ----------------------------------------------
      // GET BILLS FROM API RESPONSE
      // ----------------------------------------------

      const apiBills: BillData[] = Array.isArray(result.bills)
        ? result.bills
        : [];

      console.log("Bills received from API:");
      console.log(apiBills);

      console.log("Total Bills from bills.json:", apiBills.length);

      setBills(apiBills);
    } catch (error) {
      console.error("❌ Error loading bills from API:", error);

      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOAD WHEN REPORT PAGE OPENS
  // ==================================================

  useEffect(() => {
    loadBills();

    // ----------------------------------------------
    // OPTIONAL REFRESH EVENT
    // ----------------------------------------------
    // EntryPage already dispatches this event after
    // successful save.

    const handleBillsUpdated = () => {
      console.log("🔄 Bill updated - refreshing report");

      loadBills();
    };

    window.addEventListener("billsUpdated", handleBillsUpdated);

    return () => {
      window.removeEventListener("billsUpdated", handleBillsUpdated);
    };
  }, []);

  // ==================================================
  // TOTAL BILLS
  // ==================================================

  const totalBills = bills.length;

  // ==================================================
  // TOTAL SALES
  // ==================================================

  const totalSales = bills.reduce(
    (sum, bill) => sum + Number(bill.total || 0),
    0,
  );

  // ==================================================
  // CASH SALES
  // ==================================================

  const cashSales = bills
    .filter((bill) => bill.paymentMode === "Cash")
    .reduce((sum, bill) => sum + Number(bill.total || 0), 0);

  // ==================================================
  // ONLINE SALES
  // ==================================================

  const onlineSales = bills
    .filter((bill) => bill.paymentMode === "Online")
    .reduce((sum, bill) => sum + Number(bill.total || 0), 0);

  // ==================================================
  // CARDS
  // ==================================================

  const cards = [
    {
      title: "Total Bills",
      value: loading ? "..." : totalBills,
      color: "#1976D2",
    },
    {
      title: "Total Sales",
      value: loading ? "..." : `₹ ${totalSales.toFixed(2)}`,
      color: "#2E7D32",
    },
    {
      title: "Cash Collection",
      value: loading ? "..." : `₹ ${cashSales.toFixed(2)}`,
      color: "#EF6C00",
    },
    {
      title: "Online Collection",
      value: loading ? "..." : `₹ ${onlineSales.toFixed(2)}`,
      color: "#8E24AA",
    },
  ];

  // ==================================================
  // UI
  // ==================================================

  return (
    <Grid
      container
      spacing={2}
      sx={{
        mt: 2,
      }}
    >
      {cards.map((card) => (
        <Grid
          key={card.title}
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card
            elevation={3}
            sx={{
              borderLeft: `6px solid ${card.color}`,
              borderRadius: 2,
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600}>
                {card.title}
              </Typography>

              <Typography
                variant="h5"
                fontWeight={700}
                color={card.color}
                mt={1}
              >
                {card.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ReportSummary;
