export interface BillItem {
  id: number;
  barcode: string;
  itemName: string;
  qty: number;
  mrp: number;
  disc: number;
  gst: number;
}

export const emptyRow = (): BillItem => ({
  id: Date.now(),
  barcode: "",
  itemName: "",
  qty: 1,
  mrp: 0,
  disc: 0,
  gst: 0,
});
