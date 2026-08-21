import { promises as fs } from "fs";
import path from "path";

export const billsFilePath = path.join(process.cwd(), "app", "data", "bills.json");
export const inventoryFilePath = path.join(process.cwd(), "app", "data", "inventory.json");

export interface InventoryItem {
  id: string;
  barcode: string;
  sku?: string;
  itemName: string;
  brand: string;
  size: string;
  openingStock: number;
  quantity: number;
  availableStock: number;
  soldQuantity: number;
  purchasePrice: number;
  sellingPrice: number;
  gst: number;
  reorderLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface BillItem {
  id: number;
  inventoryItemId?: string;
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
  id?: string;
  billNo: number;
  date: string;
  paymentMode: "Cash" | "Online";
  total: number;
  items: BillItem[];
}

let lock: Promise<void> = Promise.resolve();

export async function withStoreLock<T>(work: () => Promise<T>): Promise<T> {
  const previous = lock;
  let release!: () => void;
  lock = new Promise<void>((resolve) => { release = resolve; });
  await previous;
  try {
    return await work();
  } finally {
    release();
  }
}

export async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    if (!raw.trim()) return fallback;
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch (error: unknown) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), "utf-8");
      return fallback;
    }
    throw error;
  }
}

export async function writeJson<T>(filePath: string, value: T) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf-8");
}

export function normalize(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export function normalizeInventoryItem(item: Partial<InventoryItem> & { id: string }): InventoryItem {
  const legacyQuantity = Number(item.quantity ?? 0);
  const openingStock = Number(item.openingStock ?? legacyQuantity);
  const availableStock = Number(item.availableStock ?? item.quantity ?? openingStock);
  const soldQuantity = Number(item.soldQuantity ?? Math.max(0, openingStock - availableStock));
  return {
    id: item.id,
    barcode: String(item.barcode ?? "").trim(),
    sku: item.sku ? String(item.sku).trim() : undefined,
    itemName: String(item.itemName ?? "").trim(),
    brand: String(item.brand ?? "").trim(),
    size: String(item.size ?? "").trim(),
    openingStock: Math.max(0, openingStock),
    quantity: Math.max(0, availableStock),
    availableStock: Math.max(0, availableStock),
    soldQuantity: Math.max(0, soldQuantity),
    purchasePrice: Math.max(0, Number(item.purchasePrice ?? 0)),
    sellingPrice: Math.max(0, Number(item.sellingPrice ?? 0)),
    gst: Math.max(0, Number(item.gst ?? 0)),
    reorderLevel: Math.max(0, Number(item.reorderLevel ?? 0)),
    createdAt: String(item.createdAt ?? new Date().toISOString()),
    updatedAt: String(item.updatedAt ?? new Date().toISOString()),
  };
}

export function getStockStatus(item: InventoryItem) {
  if (item.availableStock <= 0) return "Out of Stock" as const;
  if (item.availableStock <= item.reorderLevel) return "Low Stock" as const;
  return "In Stock" as const;
}

export function getBillKey(bill: BillData) {
  return bill.id ? `id:${bill.id}` : `billNo:${bill.billNo}`;
}

export function findInventoryForBillItem(items: InventoryItem[], billItem: BillItem) {
  if (billItem.inventoryItemId) {
    const byId = items.find((item) => item.id === billItem.inventoryItemId);
    if (byId) return byId;
  }
  if (billItem.barcode) {
    const byBarcode = items.find((item) => item.barcode && item.barcode === billItem.barcode);
    if (byBarcode) return byBarcode;
  }
  const itemName = normalize(billItem.itemName);
  const brand = normalize(billItem.brand);
  const size = normalize(billItem.size);
  return items.find((item) =>
    normalize(item.itemName) === itemName &&
    normalize(item.brand) === brand &&
    normalize(item.size) === size,
  );
}

export function aggregateBillQuantities(items: InventoryItem[], bill: BillData) {
  const quantities = new Map<string, number>();
  for (const billItem of bill.items ?? []) {
    const qty = Number(billItem.qty || 0);
    if (qty <= 0) continue;
    const inventoryItem = findInventoryForBillItem(items, billItem);
    if (!inventoryItem) {
      throw new Error(`Inventory item not found for "${billItem.itemName}"${billItem.size ? ` (${billItem.size})` : ""}. Select the item from inventory before saving.`);
    }
    quantities.set(inventoryItem.id, (quantities.get(inventoryItem.id) ?? 0) + qty);
  }
  return quantities;
}

export function applySaleDelta(items: InventoryItem[], delta: Map<string, number>) {
  const updated = items.map((raw) => normalizeInventoryItem(raw));
  for (const [inventoryId, quantityDelta] of delta.entries()) {
    const index = updated.findIndex((item) => item.id === inventoryId);
    if (index < 0) throw new Error("Inventory item not found while updating stock.");
    const current = updated[index];
    const nextAvailable = current.availableStock - quantityDelta;
    if (nextAvailable < 0) {
      throw new Error(`Insufficient stock. Only ${current.availableStock} units are available for ${current.itemName}${current.size ? ` (${current.size})` : ""}.`);
    }
    updated[index] = {
      ...current,
      quantity: nextAvailable,
      availableStock: nextAvailable,
      soldQuantity: Math.max(0, current.soldQuantity + quantityDelta),
      updatedAt: new Date().toISOString(),
    };
  }
  return updated;
}

export function diffSaleQuantities(items: InventoryItem[], oldBill: BillData | null, newBill: BillData) {
  const oldQuantities = oldBill ? aggregateBillQuantities(items, oldBill) : new Map<string, number>();
  const newQuantities = aggregateBillQuantities(items, newBill);
  const delta = new Map<string, number>();
  const ids = new Set([...oldQuantities.keys(), ...newQuantities.keys()]);
  for (const id of ids) {
    const oldQty = oldQuantities.get(id) ?? 0;
    const newQty = newQuantities.get(id) ?? 0;
    const change = newQty - oldQty;
    if (change !== 0) delta.set(id, change);
  }
  return delta;
}
