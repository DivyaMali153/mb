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
  aggregateBillQuantities,
} from "../../_lib/billingStore";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

async function readBills() {
  const bills = await readJson<BillData[]>(billsFilePath, []);
  return Array.isArray(bills) ? bills : [];
}

async function readInventory() {
  const items = await readJson<InventoryItem[]>(inventoryFilePath, []);
  return Array.isArray(items) ? items.map(normalizeInventoryItem) : [];
}

function findBill(bills: BillData[], id: string) {
  return bills.findIndex((bill) => bill.id === id || (!bill.id && String(bill.billNo) === id));
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const bills = await readBills();
    const index = findBill(bills, id);
    if (index < 0) return NextResponse.json({ success: false, message: "Bill not found" }, { status: 404 });
    return NextResponse.json({ success: true, bill: bills[index] });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to load bill" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const incoming = await request.json() as BillData;
    const result = await withStoreLock(async () => {
      const bills = await readBills();
      const inventory = await readInventory();
      const index = findBill(bills, id);
      if (index < 0) return { status: 404, body: { success: false, message: "Bill not found" } };
      if (!Array.isArray(incoming.items) || incoming.items.length === 0) return { status: 400, body: { success: false, message: "At least one bill item is required" } };

      const current = bills[index];
      const updatedBill: BillData = { ...current, ...incoming, id: current.id || id };
      const duplicateBill = bills.find((bill, billIndex) => billIndex !== index && bill.billNo === updatedBill.billNo);
      if (duplicateBill) return { status: 409, body: { success: false, message: `Bill No ${updatedBill.billNo} already exists.` } };

      const delta = diffSaleQuantities(inventory, current, updatedBill);
      const updatedInventory = applySaleDelta(inventory, delta);
      const updatedBills = bills.map((bill, billIndex) => billIndex === index ? updatedBill : bill);

      await writeJson(inventoryFilePath, updatedInventory);
      try {
        await writeJson(billsFilePath, updatedBills);
      } catch (error) {
        await writeJson(inventoryFilePath, inventory);
        throw error;
      }

      return { status: 200, body: { success: true, message: "Bill updated and stock adjusted successfully", bill: updatedBill, bills: updatedBills } };
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("PUT /api/bills/[id] failed", error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to update bill" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const result = await withStoreLock(async () => {
      const bills = await readBills();
      const inventory = await readInventory();
      const index = findBill(bills, id);
      if (index < 0) return { status: 404, body: { success: false, message: "Bill not found" } };

      const bill = bills[index];
      const sold = aggregateBillQuantities(inventory, bill);
      const restoreDelta = new Map<string, number>();
      for (const [inventoryId, qty] of sold.entries()) restoreDelta.set(inventoryId, -qty);
      const updatedInventory = applySaleDelta(inventory, restoreDelta);
      const updatedBills = bills.filter((_entry, billIndex) => billIndex !== index);

      await writeJson(inventoryFilePath, updatedInventory);
      try {
        await writeJson(billsFilePath, updatedBills);
      } catch (error) {
        await writeJson(inventoryFilePath, inventory);
        throw error;
      }

      return { status: 200, body: { success: true, message: "Bill deleted and stock restored successfully", bills: updatedBills } };
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("DELETE /api/bills/[id] failed", error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to delete bill" }, { status: 400 });
  }
}
