import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

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

interface BillData {
  id: string;
  billNo: number;
  date: string;
  paymentMode: PaymentMode;
  total: number;
  items: BillItem[];
}

async function readBills(): Promise<BillData[]> {
  const raw = await fs.readFile(filePath, "utf-8");
  const parsed = raw.trim() ? JSON.parse(raw) : [];
  if (!Array.isArray(parsed)) throw new Error("bills.json must contain an array");

  let changed = false;
  const bills = parsed.map((bill: Partial<BillData>, index: number) => {
    if (!bill.id) changed = true;
    return {
      id: String(bill.id || `legacy-${bill.billNo ?? "bill"}-${index}`),
      billNo: Number(bill.billNo || 0),
      date: String(bill.date || ""),
      paymentMode: bill.paymentMode === "Online" ? "Online" : "Cash",
      total: Number(bill.total || 0),
      items: Array.isArray(bill.items) ? bill.items : [],
    } as BillData;
  });

  if (changed) await writeBills(bills);
  return bills;
}

async function writeBills(bills: BillData[]) {
  await fs.writeFile(filePath, JSON.stringify(bills, null, 2), "utf-8");
}

function getId(context: { params: Promise<{ id: string }> }) {
  return context.params.then(({ id }) => decodeURIComponent(id));
}

function validate(body: Partial<BillData>) {
  if (!body?.billNo) return "Bill number is required";
  if (!Array.isArray(body.items)) return "Bill items are required";
  return null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const id = await getId(context);
    const bills = await readBills();
    const bill = bills.find((item) => item.id === id);

    if (!bill) {
      return NextResponse.json({ success: false, message: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, bill });
  } catch (error) {
    console.error("GET /api/bills/[id] failed", error);
    return NextResponse.json({ success: false, message: "Unable to read bill" }, { status: 500 });
  }
}

// UPDATE existing bill. This never creates a duplicate.
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const id = await getId(context);
    const body = (await request.json()) as Partial<BillData>;
    const validationError = validate(body);

    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const bills = await readBills();
    const index = bills.findIndex((item) => item.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, message: "Bill not found" }, { status: 404 });
    }

    const updatedBill: BillData = {
      id,
      billNo: Number(body.billNo),
      date: String(body.date || bills[index].date),
      paymentMode: body.paymentMode === "Online" ? "Online" : "Cash",
      total: Number(body.total || 0),
      items: body.items || [],
    };

    const updatedBills = [...bills];
    updatedBills[index] = updatedBill;
    await writeBills(updatedBills);

    return NextResponse.json({
      success: true,
      message: "Bill updated successfully",
      bill: updatedBill,
      bills: updatedBills,
    });
  } catch (error) {
    console.error("PUT /api/bills/[id] failed", error);
    return NextResponse.json({ success: false, message: "Unable to update bill" }, { status: 500 });
  }
}

// DELETE only the exact bill id supplied by the Report Page.
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const id = await getId(context);
    const bills = await readBills();
    const bill = bills.find((item) => item.id === id);

    if (!bill) {
      return NextResponse.json({ success: false, message: "Bill not found" }, { status: 404 });
    }

    const updatedBills = bills.filter((item) => item.id !== id);
    await writeBills(updatedBills);

    return NextResponse.json({
      success: true,
      message: "Bill deleted successfully",
      deletedBillId: id,
      bills: updatedBills,
    });
  } catch (error) {
    console.error("DELETE /api/bills/[id] failed", error);
    return NextResponse.json({ success: false, message: "Unable to delete bill" }, { status: 500 });
  }
}
