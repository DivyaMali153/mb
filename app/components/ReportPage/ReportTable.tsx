import { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
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
  billNo: number;
  date: string;
  paymentMode: "Cash" | "Online";
  total: number;
  items: BillItem[];
}

const ReportTable = () => {
  const [bills, setBills] = useState<BillData[]>([]);
  const [search, setSearch] = useState("");

  const loadBills = () => {
    const data: BillData[] = JSON.parse(localStorage.getItem("Bills") || "[]");

    setBills(data);
  };

  useEffect(() => {
    loadBills();
  }, []);

  const handleDelete = (billNo: number) => {
    const updated = bills.filter((bill) => bill.billNo !== billNo);

    localStorage.setItem("Bills", JSON.stringify(updated));

    setBills(updated);
  };

  const filteredBills = bills.filter((bill) =>
    bill.billNo.toString().includes(search)
  );

  return (
    <Paper
      elevation={3}
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 2,
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h6" fontWeight={700}>
          Previous Bills
        </Typography>

        <Box display="flex" gap={1}>
          <TextField
            size="small"
            label="Search Bill No"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={loadBills}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow
              sx={{
                bgcolor: "#EFE3A2",
              }}
            >
              <TableCell align="center">Bill No</TableCell>

              <TableCell align="center">Date</TableCell>

              <TableCell align="center">Payment</TableCell>

              <TableCell align="center">Items</TableCell>

              <TableCell align="right">Total</TableCell>

              <TableCell align="center">Delete</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredBills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No Bills Found
                </TableCell>
              </TableRow>
            ) : (
              filteredBills.map((bill) => (
                <TableRow key={bill.billNo} hover>
                  <TableCell align="center">{bill.billNo}</TableCell>

                  <TableCell align="center">{bill.date}</TableCell>

                  <TableCell align="center">{bill.paymentMode}</TableCell>

                  <TableCell align="center">
                    {bill.items.filter((x) => x.qty > 0).length}
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      color: "green",
                      fontWeight: 700,
                    }}
                  >
                    ₹ {bill.total.toFixed(2)}
                  </TableCell>

                  <TableCell align="center">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(bill.billNo)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ReportTable;
