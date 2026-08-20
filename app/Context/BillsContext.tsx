"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface BillItem {
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

export interface Bill {
  id: number;
  billNo: number;
  date: string;
  paymentMode: "Cash" | "Online";
  total: number;
  items: BillItem[];
}

interface BillsContextType {
  bills: Bill[];
  addBill: (bill: Omit<Bill, "id">) => void;
  deleteBill: (id: number) => void;
  clearBills: () => void;
}

const BillsContext = createContext<BillsContextType | undefined>(undefined);

export const BillsProvider = ({ children }: { children: React.ReactNode }) => {
  const [bills, setBills] = useState<Bill[]>([]);

  // Load old bills when application starts
  useEffect(() => {
    const savedBills = localStorage.getItem("billing-system-bills");

    if (savedBills) {
      try {
        setBills(JSON.parse(savedBills));
      } catch (error) {
        console.error("Failed to load bills:", error);
      }
    }
  }, []);

  // Save bills whenever bills change
  useEffect(() => {
    localStorage.setItem("billing-system-bills", JSON.stringify(bills));
  }, [bills]);

  const addBill = (bill: Omit<Bill, "id">) => {
    const newBill: Bill = {
      ...bill,
      id: Date.now(),
    };

    setBills((prevBills) => [...prevBills, newBill]);
  };

  const deleteBill = (id: number) => {
    setBills((prevBills) => prevBills.filter((bill) => bill.id !== id));
  };

  const clearBills = () => {
    setBills([]);
    localStorage.removeItem("billing-system-bills");
  };

  return (
    <BillsContext.Provider
      value={{
        bills,
        addBill,
        deleteBill,
        clearBills,
      }}
    >
      {children}
    </BillsContext.Provider>
  );
};

export const useBills = () => {
  const context = useContext(BillsContext);

  if (!context) {
    throw new Error("useBills must be used inside BillsProvider");
  }

  return context;
};
