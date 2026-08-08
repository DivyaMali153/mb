"use client";

import { useState } from "react";
import { Box } from "@mui/material";

import EntryTabs from "./EntryTabs";
import EntryPage from "./EntryPage";

import SuperPage from "./SuperPage";
import NxReport from "./Nxreport";
import ReportPage from "./Reportpage";

export default function MyBills() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#f4f1b6",
      }}
    >
      <EntryTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 0 && <EntryPage />}

      {activeTab === 1 && <NxReport />}

      {activeTab === 2 && <ReportPage />}

      {activeTab === 3 && <SuperPage />}
    </Box>
  );
}
