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

  useEffect(() => {
    const data: BillData[] = JSON.parse(localStorage.getItem("Bills") || "[]");

    setBills(data);
  }, []);

  const totalBills = bills.length;

  const totalSales = bills.reduce((sum, bill) => sum + bill.total, 0);

  const cashSales = bills
    .filter((bill) => bill.paymentMode === "Cash")
    .reduce((sum, bill) => sum + bill.total, 0);

  const onlineSales = bills
    .filter((bill) => bill.paymentMode === "Online")
    .reduce((sum, bill) => sum + bill.total, 0);

  const cards = [
    {
      title: "Total Bills",
      value: totalBills,
      color: "#1976D2",
    },
    {
      title: "Total Sales",
      value: `₹ ${totalSales.toFixed(2)}`,
      color: "#2E7D32",
    },
    {
      title: "Cash Collection",
      value: `₹ ${cashSales.toFixed(2)}`,
      color: "#EF6C00",
    },
    {
      title: "Online Collection",
      value: `₹ ${onlineSales.toFixed(2)}`,
      color: "#8E24AA",
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {cards.map((card) => (
        <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={3}
            sx={{
              borderLeft: `6px solid ${card.color}`,
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary">
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
