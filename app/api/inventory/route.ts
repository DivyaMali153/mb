import { NextResponse } from "next/server";
import { inventoryFilePath, readJson, writeJson, normalize, normalizeInventoryItem, getStockStatus, withStoreLock, type InventoryItem } from "../_lib/billingStore";

export const runtime = "nodejs";

async function readInventory() {
  const items = await readJson<InventoryItem[]>(inventoryFilePath, []);
  return Array.isArray(items) ? items.map(normalizeInventoryItem) : [];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = normalize(searchParams.get("search"));
    const itemName = normalize(searchParams.get("itemName"));
    const size = normalize(searchParams.get("size"));
    const status = searchParams.get("status") || "";
    const report = searchParams.get("report") || "";
    const availableOnly = searchParams.get("availableOnly") === "true";

    const items = await readInventory();
    const filtered = items.filter((item) => {
      const matchesSearch = !search || [item.itemName, item.barcode, item.sku, item.brand, item.size].some((field) => normalize(field).includes(search));
      const matchesItem = !itemName || normalize(item.itemName) === itemName;
      const matchesSize = !size || normalize(item.size) === size;
      const itemStatus = getStockStatus(item);
      const matchesStatus = !status || itemStatus === status;
      const matchesAvailable = !availableOnly || item.availableStock > 0;
      return matchesSearch && matchesItem && matchesSize && matchesStatus && matchesAvailable;
    });

    if (report === "item") {
      const groups = new Map<string, { itemName: string; quantity: number; soldQuantity: number; openingStock: number; sizes: number; value: number }>();
      filtered.forEach((item) => {
        const key = normalize(item.itemName);
        const current = groups.get(key) ?? { itemName: item.itemName, quantity: 0, soldQuantity: 0, openingStock: 0, sizes: 0, value: 0 };
        current.quantity += item.availableStock;
        current.soldQuantity += item.soldQuantity;
        current.openingStock += item.openingStock;
        current.sizes += 1;
        current.value += item.availableStock * item.sellingPrice;
        groups.set(key, current);
      });
      return NextResponse.json({ success: true, report: "item", rows: Array.from(groups.values()) });
    }

    if (report === "size") {
      const groups = new Map<string, { size: string; quantity: number; soldQuantity: number; openingStock: number; itemCount: number; value: number }>();
      filtered.forEach((item) => {
        const key = normalize(item.size) || "unspecified";
        const current = groups.get(key) ?? { size: item.size || "Unspecified", quantity: 0, soldQuantity: 0, openingStock: 0, itemCount: 0, value: 0 };
        current.quantity += item.availableStock;
        current.soldQuantity += item.soldQuantity;
        current.openingStock += item.openingStock;
        current.itemCount += 1;
        current.value += item.availableStock * item.sellingPrice;
        groups.set(key, current);
      });
      return NextResponse.json({ success: true, report: "size", rows: Array.from(groups.values()) });
    }

    const summary = {
      totalItems: items.length,
      totalAvailableUnits: items.reduce((sum, item) => sum + item.availableStock, 0),
      lowStockItems: items.filter((item) => getStockStatus(item) === "Low Stock").length,
      outOfStockItems: items.filter((item) => getStockStatus(item) === "Out of Stock").length,
    };

    return NextResponse.json({ success: true, items: filtered, summary });
  } catch (error) {
    console.error("GET /api/inventory failed", error);
    return NextResponse.json({ success: false, message: "Unable to load inventory" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = ["itemName", "size"];
    const missing = required.filter((field) => !String(body?.[field] ?? "").trim());
    if (missing.length) return NextResponse.json({ success: false, message: `${missing.join(", ")} is required` }, { status: 400 });

    const result = await withStoreLock(async () => {
      const items = await readInventory();
      const duplicate = items.find((item) =>
        (body.barcode && normalize(item.barcode) === normalize(body.barcode)) ||
        (body.sku && normalize(item.sku) === normalize(body.sku)) ||
        (normalize(item.itemName) === normalize(body.itemName) && normalize(item.brand) === normalize(body.brand) && normalize(item.size) === normalize(body.size)),
      );
      if (duplicate) return { status: 409, body: { success: false, message: "This inventory item already exists (matching barcode/SKU or item + brand + size)." } };

      const now = new Date().toISOString();
      const openingStock = Math.max(0, Number(body.openingStock ?? body.quantity) || 0);
      const item: InventoryItem = normalizeInventoryItem({
        id: crypto.randomUUID(),
        barcode: body.barcode,
        sku: body.sku,
        itemName: body.itemName,
        brand: body.brand,
        size: body.size,
        openingStock,
        quantity: openingStock,
        availableStock: openingStock,
        soldQuantity: 0,
        purchasePrice: body.purchasePrice,
        sellingPrice: body.sellingPrice,
        gst: body.gst,
        reorderLevel: body.reorderLevel,
        createdAt: now,
        updatedAt: now,
      });
      const updated = [...items, item];
      await writeJson(inventoryFilePath, updated);
      return { status: 201, body: { success: true, message: "Inventory item added successfully", item } };
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("POST /api/inventory failed", error);
    return NextResponse.json({ success: false, message: "Unable to add inventory item" }, { status: 500 });
  }
}
