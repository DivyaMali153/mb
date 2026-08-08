import { Box } from "@mui/material";
import ReportHeader from "./ReportHeader";

const ReportPage = () => {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "#FFFBEA",
        minHeight: "100vh",
      }}
    >
      <ReportHeader />
    </Box>
  );
};

export default ReportPage;
