import { Box } from "@mui/material";

import ReportFilters from "../ReportPage/ReportFilters";
import ReportHeader from "../ReportPage/ReportHeader";
import ReportSummary from "../ReportPage/ReportSummary";
import ReportTable from "../ReportPage/ReportTable";

export default function ReportPage() {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "#FFFBEA",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <ReportHeader />

      {/* Filters */}
      <ReportFilters />

      {/* Summary */}
      <ReportSummary />

      {/* Table */}
      <ReportTable />
    </Box>
  );
}
