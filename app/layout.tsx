import type { Metadata } from "next";
import { BillsProvider } from "./Context/BillsContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Billing System",
  description: "Billing Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <BillsProvider>{children}</BillsProvider>
      </body>
    </html>
  );
}
