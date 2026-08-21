import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const filePath = path.join(process.cwd(), "app", "data", "bills.json");

type PaymentMode = "Cash" | "Online";

interface BillItem {
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

export interface BillData {
  id: string;
  billNo: number;
  date: string;
  paymentMode: PaymentMode;
  total: number;
  items: BillItem[];
}

function normalizeBill(raw: Partial<BillData>, index: number): BillData {
  return {
    id: String(raw.id || `legacy-${raw.billNo ?? "bill"}-${index}`),
    billNo: Number(raw.billNo || 0),
    date: String(raw.date || ""),
    paymentMode: raw.paymentMode === "Online" ? "Online" : "Cash",
    total: Number(raw.total || 0),
    items: Array.isArray(raw.items) ? raw.items : [],
  };
}

async function readBills(): Promise<BillData[]> {
  const fileData = await fs.readFile(filePath, "utf-8");
  if (!fileData.trim()) return [];

  const parsed = JSON.parse(fileData);
  if (!Array.isArray(parsed)) throw new Error("bills.json must contain an array");

  const bills = parsed.map((bill, index) => normalizeBill(bill, index));

  // One-time migration for old backup bills that do not have an id.
  if (parsed.some((bill) => !bill?.id)) {
    await writeBills(bills);
  }

  return bills;
}

async function writeBills(bills: BillData[]) {
  await fs.writeFile(filePath, JSON.stringify(bills, null, 2), "utf-8");
}

function validateBill(body: Partial<BillData>) {
  if (!body || !body.billNo) return "Bill number is required";
  if (!Array.isArray(body.items)) return "Bill items are required";
  return null;
}

export async function GET() {
  try {
    const bills = await readBills();
    return NextResponse.json({ success: true, bills });
  } catch (error) {
    console.error("GET /api/bills failed", error);
    return NextResponse.json(
      { success: false, message: "Unable to read bills" },
      { status: 500 },
    );
  }
}

// Existing Save Bill functionality remains POST = CREATE.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<BillData>;
    const validationError = validateBill(body);

    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 },
      );
    }

    const bills = await readBills();
    const bill: BillData = {
      id: String(body.id || randomUUID()),
      billNo: Number(body.billNo),
      date: String(body.date || new Date().toLocaleDateString()),
      paymentMode: body.paymentMode === "Online" ? "Online" : "Cash",
      total: Number(body.total || 0),
      items: body.items || [],
    };

    const updatedBills = [...bills, bill];
    await writeBills(updatedBills);

    return NextResponse.json(
      { success: true, message: "Bill saved successfully", bill, bills: updatedBills },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/bills failed", error);
    return NextResponse.json(
      { success: false, message: "Unable to save bill" },
      { status: 500 },
    );
  }
}
