import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

interface CalculationPanelProps {
  discount: number;
  gst: number;
  extraAdd?: number;
  grandTotal: number;
}

export default function CalculationPanel({
  discount,
  gst,
  extraAdd = 0,
  grandTotal,
}: CalculationPanelProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        height: 170,
        border: "1px solid #bdbdbd",
        overflow: "hidden",
      }}
    >
      <Table
        size="small"
        sx={{
          "& th": {
            fontWeight: 700,
            bgcolor: "#f5f5f5",
            p: 0.5,
            fontSize: 12,
          },
          "& td": {
            p: 0.5,
            fontSize: 12,
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell width={60}>A/c.</TableCell>
            <TableCell>Particular</TableCell>
            <TableCell align="right">Calc%</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="center">+/-</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          <TableRow>
            <TableCell>D1</TableCell>
            <TableCell>Discount</TableCell>
            <TableCell align="right">0.000</TableCell>
            <TableCell align="right">{discount.toFixed(2)}</TableCell>
            <TableCell align="center">-</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>OC1</TableCell>
            <TableCell>Extra Add</TableCell>
            <TableCell align="right">0.000</TableCell>
            <TableCell align="right">{extraAdd.toFixed(2)}</TableCell>
            <TableCell align="center">+</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>GST</TableCell>
            <TableCell>GST Tax</TableCell>
            <TableCell align="right">0.000</TableCell>
            <TableCell align="right">{gst.toFixed(2)}</TableCell>
            <TableCell align="center">+</TableCell>
          </TableRow>

          <TableRow
            sx={{
              bgcolor: "#f0f0f0",
              "& td": {
                fontWeight: 700,
              },
            }}
          >
            <TableCell colSpan={3}>Grand Total</TableCell>
            <TableCell align="right">{grandTotal.toFixed(2)}</TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
}
