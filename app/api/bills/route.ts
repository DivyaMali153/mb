import { NextResponse } from "next/server";
import {
  billsFilePath,
  inventoryFilePath,
  readJson,
  writeJson,
  withStoreLock,
  type BillData,
  type InventoryItem,
  normalizeInventoryItem,
  diffSaleQuantities,
  applySaleDelta,
} from "../_lib/billingStore";

export const runtime = "nodejs";

async function readBills() {
  const bills = await readJson<BillData[]>(billsFilePath, []);
  return Array.isArray(bills) ? bills : [];
}

async function readInventory() {
  const items = await readJson<InventoryItem[]>(inventoryFilePath, []);
  return Array.isArray(items) ? items.map(normalizeInventoryItem) : [];
}

export async function GET() {
  try {
    return NextResponse.json({ success: true, bills: await readBills() });
  } catch (error) {
    console.error("GET /api/bills failed", error);
    return NextResponse.json({ success: false, message: "Unable to read bills" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const incoming = await request.json() as BillData;
    if (!incoming?.billNo) return NextResponse.json({ success: false, message: "Bill number is required" }, { status: 400 });
    if (!Array.isArray(incoming.items) || incoming.items.length === 0) return NextResponse.json({ success: false, message: "At least one bill item is required" }, { status: 400 });

    const result = await withStoreLock(async () => {
      const bills = await readBills();
      const inventory = await readInventory();
      const bill: BillData = { ...incoming, id: incoming.id || crypto.randomUUID() };

      if (bills.some((entry) => entry.id === bill.id || (!entry.id && entry.billNo === bill.billNo) || entry.billNo === bill.billNo)) {
        throw new Error(`Bill No ${bill.billNo} already exists. Please use a new bill number.`);
      }

      const delta = diffSaleQuantities(inventory, null, bill);
      const updatedInventory = applySaleDelta(inventory, delta);
      const updatedBills = [...bills, bill];

      // Both files are written while the process lock is held. If the second write fails,
      // restore the first file so a failed sale does not leave stock partially changed.
      await writeJson(inventoryFilePath, updatedInventory);
      try {
        await writeJson(billsFilePath, updatedBills);
      } catch (error) {
        await writeJson(inventoryFilePath, inventory);
        throw error;
      }

      return { bill, updatedBills, updatedInventory };
    });

    return NextResponse.json({ success: true, message: "Bill saved and stock updated successfully", bill: result.bill, bills: result.updatedBills }, { status: 201 });
  } catch (error) {
    console.error("POST /api/bills failed", error);
    const message = error instanceof Error ? error.message : "Unable to save bill";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
