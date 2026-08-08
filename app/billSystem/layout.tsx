"use client";

import { ReactNode } from "react";
import Box from "@mui/material/Box";

import Header from "../components/Organisms/Header";
import Sidebar from "../components/Organisms/Sidebar/Sidebar";
import Footer from "../components/Organisms/Footer/Footer";

interface BillSystemLayoutProps {
  children: ReactNode;
}

export default function BillSystemLayout({ children }: BillSystemLayoutProps) {
  return (
    <>
      <Header />

      <Sidebar />

      <Box
        component="main"
        sx={{
          ml: "150px", // Sidebar width
          mt: "64px", // Header height
          p: 3,
          minHeight: "calc(100vh - 64px)",
          bgcolor: "#FFFBEA",
        }}
      >
        {children}
      </Box>

      <Footer />
    </>
  );
}
