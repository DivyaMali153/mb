"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import RefreshIcon from "@mui/icons-material/Refresh";

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
  id: string;
  billNo: number;
  date: string;
  paymentMode: "Cash" | "Online";
  total: number;
  items: BillItem[];
}

const money = (value: number) => `₹ ${Number(value || 0).toFixed(2)}`;

async function printBill(bill: BillData) {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    alert("Please allow pop-ups to print the bill.");
    return;
  }

  try {
    // Always fetch the selected bill from the API before printing so the
    // printed copy is based on the current stored record.
    const response = await fetch(`/api/bills/${encodeURIComponent(bill.id)}`, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok || !result.success || !result.bill) {
      throw new Error(result.message || "Unable to load bill for printing");
    }
    bill = result.bill as BillData;
  } catch (error) {
    printWindow.close();
    alert(error instanceof Error ? error.message : "Unable to load bill for printing");
    return;
  }

  const rows = bill.items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.itemName || "-")}</td>
          <td>${escapeHtml(item.brand || "-")}</td>
          <td>${escapeHtml(item.size || "-")}</td>
          <td class="right">${Number(item.qty || 0)}</td>
          <td class="right">${money(item.rate)}</td>
          <td class="right">${Number(item.discount || 0).toFixed(2)}%</td>
          <td class="right">${Number(item.gst || 0).toFixed(2)}%</td>
          <td class="right">${money(item.amount)}</td>
        </tr>`,
    )
    .join("");

  printWindow.document.write(`<!doctype html>
<html><head><title>Bill ${escapeHtml(String(bill.billNo))}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, sans-serif; margin: 0; padding: 32px; color: #222; }
  .bill { max-width: 900px; margin: 0 auto; }
  .header { display:flex; justify-content:space-between; border-bottom:2px solid #222; padding-bottom:16px; margin-bottom:20px; }
  h1 { margin:0 0 6px; font-size:28px; }
  .muted { color:#666; }
  .meta { text-align:right; line-height:1.7; }
  table { width:100%; border-collapse:collapse; margin-top:18px; }
  th, td { border:1px solid #bbb; padding:8px; font-size:12px; }
  th { background:#f2f2f2; text-align:left; }
  .right { text-align:right; }
  .total { margin-top:20px; margin-left:auto; width:320px; }
  .total-row { display:flex; justify-content:space-between; padding:7px 0; }
  .grand { border-top:2px solid #222; font-size:18px; font-weight:bold; margin-top:6px; padding-top:10px; }
  .footer { margin-top:28px; font-size:12px; color:#666; text-align:center; }
  @media print { body { padding:0; } .no-print { display:none !important; } }
</style></head>
<body><div class="bill">
  <div class="header">
    <div><h1>SALES BILL</h1><div class="muted">Professional Billing Receipt</div></div>
    <div class="meta"><strong>Bill No:</strong> ${escapeHtml(String(bill.billNo))}<br/>
      <strong>Date:</strong> ${escapeHtml(bill.date)}<br/>
      <strong>Payment:</strong> ${escapeHtml(bill.paymentMode)}</div>
  </div>
  <table><thead><tr>
    <th>Item</th><th>Brand</th><th>Size</th><th>Qty</th><th>Rate</th><th>Discount</th><th>GST</th><th>Amount</th>
  </tr></thead><tbody>${rows}</tbody></table>
  <div class="total">
    <div class="total-row"><span>Payment Mode</span><strong>${escapeHtml(bill.paymentMode)}</strong></div>
    <div class="total-row grand"><span>Total</span><span>${money(bill.total)}</span></div>
  </div>
  <div class="footer">Thank you for your business.</div>
</div>
<script>window.onload=function(){window.focus();window.print();window.onafterprint=function(){window.close();};};</script>
</body></html>`);
  printWindow.document.close();
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] || character);
}

export default function ReportTable() {
  const [bills, setBills] = useState<BillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<BillData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const loadBills = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/bills", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load bills");
      }
      setBills(Array.isArray(result.bills) ? result.bills : []);
    } catch (err) {
      console.error(err);
      setBills([]);
      setError(err instanceof Error ? err.message : "Unable to load bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
    const handleBillsUpdated = () => loadBills();
    window.addEventListener("billsUpdated", handleBillsUpdated);
    return () => window.removeEventListener("billsUpdated", handleBillsUpdated);
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const response = await fetch(`/api/bills/${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete bill");
      }
      setDeleteTarget(null);
      setMessageType("success");
      setMessage("Bill deleted successfully");
      await loadBills();
      window.dispatchEvent(new Event("billsUpdated"));
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage(err instanceof Error ? err.message : "Unable to delete bill");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <TableContainer component={Paper} elevation={3} sx={{ mt: 2, borderRadius: 2 }}>
        <Box sx={{ p: 1.5, display: "flex", justifyContent: "flex-end" }}>
          <Button startIcon={<RefreshIcon />} onClick={loadBills} disabled={loading}>
            Refresh
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
            <TableHead>
              <TableRow>
                {['Bill No', 'Date', 'Payment', 'Items', 'Total', 'Actions'].map((heading, index) => (
                  <TableCell key={heading} align={index >= 4 ? "right" : "left"} sx={{ fontWeight: 700 }}>
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell></TableRow>
              ) : bills.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}><Typography color="text.secondary">No bills found</Typography></TableCell></TableRow>
              ) : bills.map((bill) => {
                const totalItems = bill.items?.reduce((sum, item) => sum + Number(item.qty || 0), 0) || 0;
                return (
                  <TableRow key={bill.id} hover>
                    <TableCell sx={{ verticalAlign: "top", fontWeight: 700 }}>{bill.billNo}</TableCell>
                    <TableCell sx={{ verticalAlign: "top" }}>{bill.date}</TableCell>
                    <TableCell sx={{ verticalAlign: "top" }}>{bill.paymentMode}</TableCell>
                    <TableCell sx={{ verticalAlign: "top", minWidth: 430 }}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">{totalItems} total quantity</Typography>
                        {bill.items.map((item) => (
                          <Box key={`${bill.id}-${item.id}`} sx={{ p: 0.75, bgcolor: "#fafafa", borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.itemName || "Unnamed item"}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Qty {item.qty} × {money(item.rate)} · Disc {item.discount}% · GST {item.gst}% · {money(item.amount)}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ verticalAlign: "top" }}><Typography sx={{ fontWeight: 700 }}>{money(bill.total)}</Typography></TableCell>
                    <TableCell align="right" sx={{ verticalAlign: "top" }}>
                      <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
                        <Tooltip title="Edit Bill"><IconButton color="primary" onClick={() => { window.location.href = `/billSystem/my-bills?edit=${encodeURIComponent(bill.id)}`; }}><EditIcon /></IconButton></Tooltip>
                        <Tooltip title="Delete Bill"><IconButton color="error" onClick={() => setDeleteTarget(bill)}><DeleteIcon /></IconButton></Tooltip>
                        <Tooltip title="Print Bill"><IconButton color="success" onClick={() => printBill(bill)}><PrintIcon /></IconButton></Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </table>
        </Box>
      </TableContainer>

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)}>
        <DialogTitle>Delete Bill</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this bill{deleteTarget ? ` #${deleteTarget.billNo}` : ""}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(message)} autoHideDuration={3500} onClose={() => setMessage("")}>
        <Alert severity={messageType} onClose={() => setMessage("")} variant="filled">{message}</Alert>
      </Snackbar>
    </>
  );
}
