"use client";

import { useEffect, useState } from "react";
import {
  Paper,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Typography,
} from "@mui/material";

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

const ReportTable = () => {
  const [bills, setBills] = useState<BillData[]>([]);
  const [loading, setLoading] = useState(true);

  // ==================================================
  // LOAD BILLS FROM API
  // ==================================================

  const loadBills = async () => {
    try {
      setLoading(true);

      console.log("=================================");
      console.log("📋 REPORT TABLE");
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

      // ----------------------------------------------
      // API ERROR
      // ----------------------------------------------

      if (!response.ok || !result.success) {
        console.error("❌ Failed to load bills:", result.message);

        setBills([]);
        return;
      }

      // ----------------------------------------------
      // GET BILLS FROM API
      // ----------------------------------------------

      const apiBills: BillData[] = Array.isArray(result.bills)
        ? result.bills
        : [];

      console.log("✅ Bills received from bills.json:");

      console.log(apiBills);

      console.log("Total Bills:", apiBills.length);

      setBills(apiBills);
    } catch (error) {
      console.error("❌ Error loading bills from API:", error);

      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOAD WHEN PAGE OPENS
  // ==================================================

  useEffect(() => {
    loadBills();

    // ----------------------------------------------
    // LISTEN WHEN NEW BILL IS SAVED
    // ----------------------------------------------

    const handleBillsUpdated = () => {
      console.log("🔄 New bill saved - refreshing ReportTable");

      loadBills();
    };

    window.addEventListener("billsUpdated", handleBillsUpdated);

    return () => {
      window.removeEventListener("billsUpdated", handleBillsUpdated);
    };
  }, []);

  // ==================================================
  // UI
  // ==================================================

  return (
    <TableContainer
      component={Paper}
      elevation={3}
      sx={{
        mt: 2,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        {/* ============================================
            TABLE HEADER
        ============================================ */}

        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              Bill No
            </TableCell>

            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              Date
            </TableCell>

            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              Payment
            </TableCell>

            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              Items
            </TableCell>

            <TableCell
              align="right"
              sx={{
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              Total
            </TableCell>
          </TableRow>
        </TableHead>

        {/* ============================================
            TABLE BODY
        ============================================ */}

        <TableBody>
          {/* ------------------------------------------
              LOADING
          ------------------------------------------ */}

          {loading ? (
            <TableRow>
              <TableCell
                colSpan={5}
                align="center"
                sx={{
                  py: 4,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Loading bills...
                </Typography>
              </TableCell>
            </TableRow>
          ) : bills.length === 0 ? (
            /* ----------------------------------------
               NO BILLS
            ---------------------------------------- */

            <TableRow>
              <TableCell
                colSpan={5}
                align="center"
                sx={{
                  py: 4,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No bills found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            /* ----------------------------------------
               BILLS
            ---------------------------------------- */

            bills.map((bill, index) => {
              // --------------------------------------
              // TOTAL QUANTITY
              // --------------------------------------

              const totalItems =
                bill.items?.reduce(
                  (total, item) => total + Number(item.qty || 0),
                  0,
                ) || 0;

              return (
                <TableRow key={`${bill.billNo}-${index}`} hover>
                  {/* Bill Number */}

                  <TableCell>{bill.billNo}</TableCell>

                  {/* Date */}

                  <TableCell>{bill.date}</TableCell>

                  {/* Payment Mode */}

                  <TableCell>{bill.paymentMode}</TableCell>

                  {/* Total Items */}

                  <TableCell>{totalItems}</TableCell>

                  {/* Total */}

                  <TableCell align="right">
                    <Typography fontWeight={700}>
                      ₹ {Number(bill.total || 0).toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </table>
    </TableContainer>
  );
};

export default ReportTable;
