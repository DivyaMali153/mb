"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box } from "@mui/material";

import EntryTabs from "./EntryTabs";
import EntryPage from "./EntryPage";

import SuperPage from "./SuperPage";
import NxReport from "./Nxreport";
import ReportPage from "./Reportpage";

export default function MyBills() {
  const searchParams = useSearchParams();
  const initialTab = Number(searchParams.get("tab") ?? 0);
  const [activeTab, setActiveTab] = useState(Number.isFinite(initialTab) && initialTab >= 0 && initialTab <= 3 ? initialTab : 0);

  useEffect(() => {
    const nextTab = Number(searchParams.get("tab") ?? 0);
    if (Number.isFinite(nextTab) && nextTab >= 0 && nextTab <= 3) setActiveTab(nextTab);
  }, [searchParams]);

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
