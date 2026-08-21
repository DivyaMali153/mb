import { NextResponse } from "next/server";
import { inventoryFilePath, readJson, writeJson, normalize, normalizeInventoryItem, withStoreLock, type InventoryItem } from "../../_lib/billingStore";

export const runtime = "nodejs";
type Params = { params: Promise<{ id: string }> };

async function readInventory() {
  const items = await readJson<InventoryItem[]>(inventoryFilePath, []);
  return Array.isArray(items) ? items.map(normalizeInventoryItem) : [];
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const item = (await readInventory()).find((entry) => entry.id === id);
    if (!item) return NextResponse.json({ success: false, message: "Inventory item not found" }, { status: 404 });
    return NextResponse.json({ success: true, item });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to load inventory item" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await withStoreLock(async () => {
      const items = await readInventory();
      const index = items.findIndex((entry) => entry.id === id);
      if (index < 0) return { status: 404, body: { success: false, message: "Inventory item not found" } };
      const current = items[index];

      const duplicate = items.find((item, itemIndex) => itemIndex !== index && (
        (body.barcode && normalize(item.barcode) === normalize(body.barcode)) ||
        (body.sku && normalize(item.sku) === normalize(body.sku)) ||
        (normalize(item.itemName) === normalize(body.itemName ?? current.itemName) && normalize(item.brand) === normalize(body.brand ?? current.brand) && normalize(item.size) === normalize(body.size ?? current.size))
      ));
      if (duplicate) return { status: 409, body: { success: false, message: "Another inventory item already has the same barcode/SKU or item + brand + size." } };

      const requestedOpening = body.openingStock === undefined ? current.openingStock : Math.max(0, Number(body.openingStock) || 0);
      const requestedAvailable = body.availableStock ?? body.quantity;
      const availableStock = requestedAvailable === undefined ? current.availableStock : Math.max(0, Number(requestedAvailable) || 0);
      if (availableStock > requestedOpening) {
        return { status: 400, body: { success: false, message: "Available Stock cannot be greater than Opening Stock." } };
      }
      const updated = normalizeInventoryItem({
        ...current,
        barcode: body.barcode ?? current.barcode,
        sku: body.sku ?? current.sku,
        itemName: body.itemName ?? current.itemName,
        brand: body.brand ?? current.brand,
        size: body.size ?? current.size,
        openingStock: requestedOpening,
        quantity: availableStock,
        availableStock,
        soldQuantity: Math.max(0, Number(requestedOpening - availableStock)),
        purchasePrice: body.purchasePrice ?? current.purchasePrice,
        sellingPrice: body.sellingPrice ?? current.sellingPrice,
        gst: body.gst ?? current.gst,
        reorderLevel: body.reorderLevel ?? current.reorderLevel,
        updatedAt: new Date().toISOString(),
      });
      items[index] = updated;
      await writeJson(inventoryFilePath, items);
      return { status: 200, body: { success: true, message: "Inventory item updated successfully", item: updated } };
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to update inventory item" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const result = await withStoreLock(async () => {
      const items = await readInventory();
      const item = items.find((entry) => entry.id === id);
      if (!item) return { status: 404, body: { success: false, message: "Inventory item not found" } };
      if (item.soldQuantity > 0) return { status: 409, body: { success: false, message: "This item has sales history and cannot be deleted. Keep it for stock/report consistency." } };
      await writeJson(inventoryFilePath, items.filter((entry) => entry.id !== id));
      return { status: 200, body: { success: true, message: "Inventory item deleted successfully" } };
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to delete inventory item" }, { status: 500 });
  }
}
