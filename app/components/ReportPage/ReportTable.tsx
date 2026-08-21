"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Paper,
  Snackbar,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";

interface BillItem {
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

interface BillData {
  id?: string;
  billNo: number;
  date: string;
  paymentMode: "Cash" | "Online";
  total: number;
  items: BillItem[];
}

const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char] as string));

export default function ReportTable() {
  const [bills, setBills] = useState<BillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadBills = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/bills", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to load bills");
      setBills(Array.isArray(result.bills) ? result.bills : []);
    } catch (error) {
      setBills([]);
      setMessage(error instanceof Error ? error.message : "Unable to load bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
    const refresh = () => loadBills();
    window.addEventListener("billsUpdated", refresh);
    window.addEventListener("inventoryUpdated", refresh);
    return () => {
      window.removeEventListener("billsUpdated", refresh);
      window.removeEventListener("inventoryUpdated", refresh);
    };
  }, []);

  const billIdentifier = (bill: BillData) => bill.id || String(bill.billNo);

  const editBill = (bill: BillData) => {
    window.location.href = `/billSystem/my-bills?edit=${encodeURIComponent(billIdentifier(bill))}`;
  };

  const deleteBill = async (bill: BillData) => {
    if (!window.confirm(`Are you sure you want to delete bill ${bill.billNo}? Sold stock from this bill will be returned.`)) return;
    try {
      const response = await fetch(`/api/bills/${encodeURIComponent(billIdentifier(bill))}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to delete bill");
      setMessage("Bill deleted and stock restored successfully.");
      await loadBills();
      window.dispatchEvent(new Event("billsUpdated"));
      window.dispatchEvent(new Event("inventoryUpdated"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete bill");
    }
  };

  const printBill = async (bill: BillData) => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      setMessage("Please allow pop-ups to print the bill.");
      return;
    }
    printWindow.document.write("<p style='font-family:Arial;padding:30px'>Preparing bill...</p>");
    try {
      const response = await fetch(`/api/bills/${encodeURIComponent(billIdentifier(bill))}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to load bill for printing");
      const latest = result.bill as BillData;
      const rows = (latest.items || []).map((item) => `<tr><td>${escapeHtml(item.itemName)}</td><td>${escapeHtml(item.barcode)}</td><td>${escapeHtml(item.size)}</td><td class="right">${item.qty}</td><td class="right">₹ ${Number(item.rate || 0).toFixed(2)}</td><td class="right">${Number(item.discount || 0).toFixed(2)}%</td><td class="right">${Number(item.gst || 0).toFixed(2)}%</td><td class="right">₹ ${Number(item.amount || 0).toFixed(2)}</td></tr>`).join("");
      printWindow.document.open();
      printWindow.document.write(`<!doctype html><html><head><title>Bill ${escapeHtml(latest.billNo)}</title><style>body{font-family:Arial,sans-serif;margin:32px;color:#222}.header{display:flex;justify-content:space-between;border-bottom:2px solid #222;padding-bottom:14px;margin-bottom:18px}.title{font-size:24px;font-weight:700}.meta{line-height:1.8}table{width:100%;border-collapse:collapse;margin-top:18px}th,td{border:1px solid #bbb;padding:8px;font-size:12px}th{background:#f1f1f1;text-align:left}.right{text-align:right}.total{margin-left:auto;margin-top:18px;width:300px;border-top:2px solid #222;padding-top:10px;font-size:18px;font-weight:700;display:flex;justify-content:space-between}@media print{body{margin:12mm}.no-print{display:none}}</style></head><body><div class="header"><div><div class="title">BILL</div><div class="meta">Bill No: ${escapeHtml(latest.billNo)}<br>Date: ${escapeHtml(latest.date)}</div></div><div class="meta"><strong>Payment Mode:</strong> ${escapeHtml(latest.paymentMode)}</div></div><table><thead><tr><th>Item</th><th>Barcode</th><th>Size</th><th>Qty</th><th>Rate</th><th>Discount</th><th>GST</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><div class="total"><span>Total</span><span>₹ ${Number(latest.total || 0).toFixed(2)}</span></div><script>window.onload=function(){window.print();setTimeout(function(){window.close()},400)}</script></body></html>`);
      printWindow.document.close();
    } catch (error) {
      printWindow.document.body.innerHTML = `<p style="font-family:Arial;padding:30px;color:#b71c1c">${escapeHtml(error instanceof Error ? error.message : "Unable to print bill")}</p>`;
      setMessage(error instanceof Error ? error.message : "Unable to print bill");
    }
  };

  return (
    <>
      <TableContainer component={Paper} elevation={3} sx={{ mt: 2, borderRadius: 2, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1050 }}>
          <TableHead><TableRow>
            {['Bill No', 'Date', 'Payment', 'Items', 'Total', 'Actions'].map((label) => <TableCell key={label} align={label === "Total" ? "right" : "left"} sx={{ fontWeight: 700, fontSize: 15 }}>{label}</TableCell>)}
          </TableRow></TableHead>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><Typography color="text.secondary">Loading bills...</Typography></TableCell></TableRow> : bills.length === 0 ? <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><Typography color="text.secondary">No bills found</Typography></TableCell></TableRow> : bills.map((bill) => {
              const totalItems = bill.items?.reduce((total, item) => total + Number(item.qty || 0), 0) || 0;
              return <TableRow key={billIdentifier(bill)} hover>
                <TableCell>{bill.billNo}</TableCell><TableCell>{bill.date}</TableCell><TableCell>{bill.paymentMode}</TableCell><TableCell>{totalItems}</TableCell><TableCell align="right"><Typography fontWeight={700}>₹ {Number(bill.total || 0).toFixed(2)}</Typography></TableCell>
                <TableCell><Button size="small" startIcon={<EditIcon />} onClick={() => editBill(bill)}>Edit</Button><Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => deleteBill(bill)}>Delete</Button><Button size="small" color="primary" startIcon={<PrintIcon />} onClick={() => printBill(bill)}>Print</Button></TableCell>
              </TableRow>;
            })}
          </TableBody>
        </table>
      </TableContainer>
      <Snackbar open={Boolean(message)} autoHideDuration={4500} onClose={() => setMessage("")}><Alert severity="info" onClose={() => setMessage("")}>{message}</Alert></Snackbar>
    </>
  );
}
