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
  customerName?: string;
}
