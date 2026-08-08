import { Box, Button, Stack, Typography } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const ReportHeader = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: 2,
        boxShadow: 2,
        p: 2,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Sales Report
          </Typography>

          <Typography color="text.secondary">
            View, Print and Export Sales Reports
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button variant="contained" startIcon={<PrintIcon />}>
            Print
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={<FileDownloadIcon />}
          >
            Excel
          </Button>

          <Button
            variant="contained"
            color="error"
            startIcon={<PictureAsPdfIcon />}
          >
            PDF
          </Button>

          <Button variant="contained" color="secondary" startIcon={<AddIcon />}>
            New Bill
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ReportHeader;
