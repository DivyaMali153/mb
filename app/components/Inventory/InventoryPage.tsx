"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import InventoryIcon from "@mui/icons-material/Inventory2";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";

interface InventoryItem {
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
}

type FormState = Omit<InventoryItem, "id" | "quantity" | "availableStock" | "soldQuantity"> & { availableStock: number };
const emptyForm: FormState = {
  barcode: "", sku: "", itemName: "", brand: "", size: "", openingStock: 0,
  availableStock: 0, purchasePrice: 0, sellingPrice: 0, gst: 0, reorderLevel: 5,
};

const statusOf = (item: InventoryItem) => item.availableStock <= 0 ? "Out of Stock" : item.availableStock <= item.reorderLevel ? "Low Stock" : "In Stock";

export default function InventoryPage() {
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [itemRows, setItemRows] = useState<Array<{ itemName: string; quantity: number; soldQuantity: number; openingStock: number; sizes: number; value: number }>>([]);
  const [sizeRows, setSizeRows] = useState<Array<{ size: string; quantity: number; soldQuantity: number; openingStock: number; itemCount: number; value: number }>>([]);
  const [summary, setSummary] = useState({ totalItems: 0, totalAvailableUnits: 0, lowStockItems: 0, outOfStockItems: 0 });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<InventoryItem | null>(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [itemFilter, setItemFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, itemRes, sizeRes] = await Promise.all([
        fetch(`/api/inventory?search=${encodeURIComponent(search)}&status=${encodeURIComponent(statusFilter)}`, { cache: "no-store" }),
        fetch(`/api/inventory?report=item&itemName=${encodeURIComponent(itemFilter)}`, { cache: "no-store" }),
        fetch(`/api/inventory?report=size&itemName=${encodeURIComponent(itemFilter)}&size=${encodeURIComponent(sizeFilter)}`, { cache: "no-store" }),
      ]);
      const [all, itemReport, sizeReport] = await Promise.all([allRes.json(), itemRes.json(), sizeRes.json()]);
      if (!allRes.ok || !all.success) throw new Error(all.message || "Unable to load inventory");
      setItems(Array.isArray(all.items) ? all.items : []);
      setSummary(all.summary ?? { totalItems: 0, totalAvailableUnits: 0, lowStockItems: 0, outOfStockItems: 0 });
      setItemRows(Array.isArray(itemReport.rows) ? itemReport.rows : []);
      setSizeRows(Array.isArray(sizeReport.rows) ? sizeReport.rows : []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load inventory");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, itemFilter, sizeFilter]);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => {
    const refresh = () => loadAll();
    window.addEventListener("inventoryUpdated", refresh);
    window.addEventListener("billsUpdated", refresh);
    return () => {
      window.removeEventListener("inventoryUpdated", refresh);
      window.removeEventListener("billsUpdated", refresh);
    };
  }, [loadAll]);

  const itemNames = useMemo(() => Array.from(new Set(items.map((item) => item.itemName))).sort(), [items]);
  const sizes = useMemo(() => Array.from(new Set(items.map((item) => item.size).filter(Boolean))).sort(), [items]);
  const money = (value: number) => `₹ ${Number(value || 0).toFixed(2)}`;
  const setField = (field: keyof FormState, value: string | number) => setForm((prev) => ({ ...prev, [field]: value }));

  const saveItem = async () => {
    if (!form.itemName.trim() || !form.size.trim()) return setMessage("Item Name and Size are required.");
    if (form.openingStock < 0 || form.availableStock < 0) return setMessage("Stock cannot be negative.");
    if (form.availableStock > form.openingStock) return setMessage("Available Stock cannot be greater than Opening Stock.");
    const url = editingId ? `/api/inventory/${editingId}` : "/api/inventory";
    const method = editingId ? "PUT" : "POST";
    try {
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Operation failed");
      setMessage(result.message);
      setForm(emptyForm);
      setEditingId(null);
      setTab(2);
      await loadAll();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Operation failed");
    }
  };

  const editItem = (item: InventoryItem) => {
    setEditingId(item.id);
    setForm({
      barcode: item.barcode, sku: item.sku ?? "", itemName: item.itemName, brand: item.brand, size: item.size,
      openingStock: item.openingStock, availableStock: item.availableStock, purchasePrice: item.purchasePrice,
      sellingPrice: item.sellingPrice, gst: item.gst, reorderLevel: item.reorderLevel,
    });
    setTab(0);
  };

  const deleteItem = async () => {
    if (!confirmDelete) return;
    try {
      const response = await fetch(`/api/inventory/${confirmDelete.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Delete failed");
      setMessage(result.message);
      setConfirmDelete(null);
      await loadAll();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed");
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: "#FFFBEA", minHeight: "calc(100vh - 64px)" }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Inventory Management</Typography>

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <SummaryCard title="Total Items" value={summary.totalItems} icon={<InventoryIcon />} />
        <SummaryCard title="Total Available Units" value={summary.totalAvailableUnits} icon={<InventoryIcon />} />
        <SummaryCard title="Low Stock Items" value={summary.lowStockItems} icon={<WarningAmberIcon />} />
        <SummaryCard title="Out of Stock" value={summary.outOfStockItems} icon={<RemoveShoppingCartIcon />} />
      </Grid>

      <Card elevation={2} sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" allowScrollButtonsMobile>
          <Tab icon={<AddIcon />} iconPosition="start" label="1. ADD ITEM" />
          <Tab icon={<InventoryIcon />} iconPosition="start" label="2. ALL STOCK" />
          <Tab icon={<InventoryIcon />} iconPosition="start" label="3. AVAILABLE STOCK" />
          <Tab label="4. ITEM WISE" />
          <Tab label="5. SIZE WISE" />
        </Tabs>
      </Card>

      {tab === 0 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{editingId ? "Edit Inventory Item" : "Add Inventory Item"}</Typography>
          <Grid container spacing={2}>
            {([
              ["itemName", "Item Name", "text"], ["sku", "SKU", "text"], ["barcode", "Barcode", "text"], ["brand", "Brand", "text"], ["size", "Size / Variant", "text"],
              ["openingStock", "Opening Stock", "number"], ["availableStock", "Available Stock", "number"], ["purchasePrice", "Purchase Price", "number"], ["sellingPrice", "Selling Price", "number"], ["gst", "GST %", "number"], ["reorderLevel", "Low Stock Threshold", "number"],
            ] as const).map(([field, label, type]) => (
              <Grid key={field} size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField fullWidth label={label} type={type} value={form[field]} onChange={(e) => setField(field, type === "number" ? Number(e.target.value) : e.target.value)} />
              </Grid>
            ))}
            {editingId && <Grid size={12}><Alert severity="info">Sold Quantity is calculated from Opening Stock − Available Stock and is maintained automatically by billing sales.</Alert></Grid>}
            <Grid size={12}>
              <Button variant="contained" color="success" startIcon={editingId ? <EditIcon /> : <AddIcon />} onClick={saveItem}>{editingId ? "Update Item" : "Add Item"}</Button>
              {editingId && <Button sx={{ ml: 1 }} onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel Edit</Button>}
            </Grid>
          </Grid>
        </Card>
      )}

      {tab === 1 && (
        <StockTable title="All Stock" items={items} loading={loading} search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onEdit={editItem} onDelete={setConfirmDelete} money={money} />
      )}

      {tab === 2 && (
        <StockTable title="Available Stock" items={items} loading={loading} search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onEdit={editItem} onDelete={setConfirmDelete} money={money} available />
      )}

      {tab === 3 && (
        <ReportCard title="Stock Report - Item Wise" itemNames={itemNames} value={itemFilter} onChange={setItemFilter}>
          <table className="inventory-report-table"><thead><tr><th>Item Name</th><th>Opening Stock</th><th>Sold</th><th>Available</th><th>Sizes</th><th>Stock Value</th></tr></thead><tbody>{loading ? <tr><td colSpan={6}>Loading...</td></tr> : itemRows.length === 0 ? <tr><td colSpan={6}>No stock found</td></tr> : itemRows.map((row) => <tr key={row.itemName}><td>{row.itemName}</td><td>{row.openingStock}</td><td>{row.soldQuantity}</td><td>{row.quantity}</td><td>{row.sizes}</td><td>{money(row.value)}</td></tr>)}</tbody></table>
        </ReportCard>
      )}

      {tab === 4 && (
        <ReportCard title="Stock Report - Size Wise" itemNames={itemNames} value={itemFilter} onChange={setItemFilter} extra={<TextField select size="small" label="Size" value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} sx={{ minWidth: 160 }}><MenuItem value="">All Sizes</MenuItem>{sizes.map((size) => <MenuItem key={size} value={size}>{size}</MenuItem>)}</TextField>}>
          <table className="inventory-report-table"><thead><tr><th>Size</th><th>Opening Stock</th><th>Sold</th><th>Available</th><th>Item Count</th><th>Stock Value</th></tr></thead><tbody>{loading ? <tr><td colSpan={6}>Loading...</td></tr> : sizeRows.length === 0 ? <tr><td colSpan={6}>No stock found</td></tr> : sizeRows.map((row) => <tr key={row.size}><td>{row.size}</td><td>{row.openingStock}</td><td>{row.soldQuantity}</td><td>{row.quantity}</td><td>{row.itemCount}</td><td>{money(row.value)}</td></tr>)}</tbody></table>
        </ReportCard>
      )}

      <Dialog open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Delete Inventory Item?</DialogTitle>
        <DialogContent>Are you sure you want to permanently delete <strong>{confirmDelete?.itemName} / {confirmDelete?.size}</strong>?</DialogContent>
        <DialogActions><Button onClick={() => setConfirmDelete(null)}>Cancel</Button><Button color="error" variant="contained" startIcon={<DeleteIcon />} onClick={deleteItem}>Delete</Button></DialogActions>
      </Dialog>
      <Snackbar open={Boolean(message)} autoHideDuration={3500} onClose={() => setMessage("")}><Alert severity="info" onClose={() => setMessage("")}>{message}</Alert></Snackbar>
    </Box>
  );
}

function SummaryCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return <Grid size={{ xs: 12, sm: 6, md: 3 }}><Card sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5, height: "100%" }}><Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#E8F5E9", borderRadius: 2, p: 1 }}>{icon}</Box><Box><Typography variant="body2" color="text.secondary">{title}</Typography><Typography variant="h5" fontWeight={800}>{value}</Typography></Box></Card></Grid>;
}

function StockTable({ title, items, loading, search, setSearch, statusFilter, setStatusFilter, onEdit, onDelete, money, available = false }: { title: string; items: InventoryItem[]; loading: boolean; search: string; setSearch: (value: string) => void; statusFilter: string; setStatusFilter: (value: string) => void; onEdit: (item: InventoryItem) => void; onDelete: (item: InventoryItem) => void; money: (value: number) => string; available?: boolean }) {
  return <Card sx={{ p: 2, overflowX: "auto" }}>
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap", mb: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mr: "auto" }}>{title}</Typography>
      <TextField size="small" label="Search item / barcode / brand" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <SearchIcon sx={{ mr: 0.5, color: "text.secondary" }} /> }} />
      <TextField select size="small" label="Stock Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 170 }}>
        <MenuItem value="">All Status</MenuItem><MenuItem value="In Stock">In Stock</MenuItem><MenuItem value="Low Stock">Low Stock</MenuItem><MenuItem value="Out of Stock">Out of Stock</MenuItem>
      </TextField>
    </Box>
    <table className="inventory-report-table"><thead><tr><th>Item</th><th>Barcode / SKU</th><th>Brand</th><th>Size / Variant</th><th>Opening</th><th>Sold</th><th>Available</th><th>Rate</th><th>Status</th><th>Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan={10}>Loading...</td></tr> : items.length === 0 ? <tr><td colSpan={10}>No stock found</td></tr> : items.map((item) => { const status = statusOf(item); return <tr key={item.id}><td>{item.itemName}</td><td>{item.barcode || item.sku || "-"}</td><td>{item.brand || "-"}</td><td>{item.size}</td><td>{item.openingStock}</td><td>{item.soldQuantity}</td><td><strong>{item.availableStock}</strong></td><td>{money(item.sellingPrice)}</td><td><Chip size="small" label={status} color={status === "In Stock" ? "success" : status === "Low Stock" ? "warning" : "error"} /></td><td><Button size="small" startIcon={<EditIcon />} onClick={() => onEdit(item)}>Edit</Button><Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(item)}>Delete</Button></td></tr>; })}</tbody></table>
  </Card>;
}

function ReportCard({ title, itemNames, value, onChange, extra, children }: { title: string; itemNames: string[]; value: string; onChange: (value: string) => void; extra?: React.ReactNode; children: React.ReactNode }) {
  return <Card sx={{ p: 2, overflowX: "auto" }}><Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", mb: 2 }}><Typography variant="h6" sx={{ fontWeight: 700, mr: "auto" }}>{title}</Typography><TextField select size="small" label="Item" value={value} onChange={(e) => onChange(e.target.value)} sx={{ minWidth: 180 }}><MenuItem value="">All Items</MenuItem>{itemNames.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}</TextField>{extra}</Box>{children}</Card>;
}
