import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

// ==================================================
// JSON FILE LOCATION
// Your current structure:
//
// app
// ├── api
// │   └── bills
// │       └── route.ts
// └── data
//     └── bills.json
// ==================================================

const filePath = path.join(process.cwd(), "app", "data", "bills.json");

// ==================================================
// TYPES
// ==================================================

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
  billNo: number;
  date: string;
  paymentMode: "Cash" | "Online";
  total: number;
  items: BillItem[];
}

// ==================================================
// READ BILLS
// ==================================================

async function readBills(): Promise<BillData[]> {
  try {
    console.log("📂 Reading bills from:");
    console.log(filePath);

    const fileData = await fs.readFile(filePath, "utf-8");

    console.log("📄 bills.json content:");
    console.log(fileData);

    if (!fileData.trim()) {
      return [];
    }

    const bills = JSON.parse(fileData);

    if (!Array.isArray(bills)) {
      console.error("❌ bills.json does not contain an array");

      return [];
    }

    return bills;
  } catch (error) {
    console.error("❌ Error reading bills.json:", error);

    throw error;
  }
}

// ==================================================
// WRITE BILLS
// ==================================================

async function writeBills(bills: BillData[]) {
  console.log("💾 Writing bills to:");
  console.log(filePath);

  await fs.writeFile(filePath, JSON.stringify(bills, null, 2), "utf-8");

  console.log("✅ bills.json written successfully");
}

// ==================================================
// GET BILLS
// ==================================================

export async function GET() {
  console.log("=================================");
  console.log("🔥 GET /api/bills");
  console.log("=================================");

  try {
    const bills = await readBills();

    return NextResponse.json({
      success: true,
      bills,
    });
  } catch (error) {
    console.error("❌ GET /api/bills failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to read bills",
      },
      {
        status: 500,
      },
    );
  }
}

// ==================================================
// SAVE BILL
// ==================================================

export async function POST(request: Request) {
  console.log("=================================");
  console.log("🔥 POST /api/bills CALLED");
  console.log("=================================");

  try {
    // ----------------------------------------------
    // READ REQUEST
    // ----------------------------------------------

    const billData: BillData = await request.json();

    console.log("📥 Bill received:");
    console.log(billData);

    // ----------------------------------------------
    // VALIDATION
    // ----------------------------------------------

    if (!billData) {
      return NextResponse.json(
        {
          success: false,
          message: "Bill data is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!billData.billNo) {
      return NextResponse.json(
        {
          success: false,
          message: "Bill number is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!Array.isArray(billData.items)) {
      return NextResponse.json(
        {
          success: false,
          message: "Bill items are required",
        },
        {
          status: 400,
        },
      );
    }

    // ----------------------------------------------
    // READ OLD BILLS
    // ----------------------------------------------

    const oldBills = await readBills();

    console.log("📚 Existing bills:");
    console.log(oldBills);

    // ----------------------------------------------
    // ADD NEW BILL
    // ----------------------------------------------

    const updatedBills = [...oldBills, billData];

    console.log("➕ New bills list:");
    console.log(updatedBills);

    // ----------------------------------------------
    // SAVE TO JSON
    // ----------------------------------------------

    await writeBills(updatedBills);

    // ----------------------------------------------
    // SUCCESS
    // ----------------------------------------------

    console.log("=================================");
    console.log("✅ BILL SAVED SUCCESSFULLY");
    console.log("=================================");

    return NextResponse.json(
      {
        success: true,
        message: "Bill saved successfully",
        bill: billData,
        bills: updatedBills,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("=================================");
    console.error("❌ SAVE BILL API ERROR");
    console.error("=================================");
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save bill",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}
