"use client";

import type { Dispatch, SetStateAction } from "react";
import { Box, Button } from "@mui/material";

const tabs = ["1. ENTRY", "2. NxReport", "3. REPORT", "4. SUPER"];

interface EntryTabsProps {
  activeTab: number;
  setActiveTab: Dispatch<SetStateAction<number>>;
}

export default function EntryTabs({ activeTab, setActiveTab }: EntryTabsProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        p: 2,
        bgcolor: "#f4f1b6",
        borderBottom: "1px solid #bdbdbd",
      }}
    >
      {tabs.map((tab, index) => (
        <Button
          key={tab}
          onClick={() => setActiveTab(index)}
          disableElevation
          sx={{
            width: 220,
            height: 70,
            borderRadius: 0,
            border: "2px solid #6f6f6f",
            bgcolor: activeTab === index ? "#d5d65b" : "#f8f6e6",
            color: "#222",
            fontSize: 18,
            fontWeight: 500,
            textTransform: "none",
            boxShadow: "none",

            "&:hover": {
              bgcolor: activeTab === index ? "#d5d65b" : "#f8f6e6",
              boxShadow: "none",
            },
          }}
        >
          {tab}
        </Button>
      ))}
    </Box>
  );
}
