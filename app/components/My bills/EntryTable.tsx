"use client";

import type { CSSProperties, Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";

import {
  Autocomplete,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";

import type { BillItem } from "./EntryPage";

/* =========================================================
   INVENTORY ITEM
========================================================= */

interface InventoryItem {
  id: string;
  barcode?: string;
  sku?: string;
  itemName: string;
  brand?: string;
  size?: string;
  quantity?: number;
  purchasePrice?: number;
  sellingPrice?: number;
  gst?: number;
  reorderLevel?: number;
}

/* =========================================================
   PROPS
========================================================= */

interface EntryTableProps {
  items: BillItem[];
  setItems: Dispatch<SetStateAction<BillItem[]>>;
}

/* =========================================================
   TABLE COLUMNS
========================================================= */

const columns = [
  "NO",
  "ITEM NAME",
  "BRAND",
  "SIZE",
  "QTY",
  "DISC %",
  "DISC RS",
  "GST %",
  "RATE",
  "AMOUNT",
];

/* =========================================================
   NEW ROW
========================================================= */

const createNewRow = (id: number): BillItem => ({
  id,
  barcode: "",
  itemName: "",
  brand: "",
  size: "",
  qty: 0,
  rate: 0,
  discount: 0,
  gst: 0,
  amount: 0,
});

/* =========================================================
   CALCULATE AMOUNT
========================================================= */

const calculateAmount = (
  qty: number,
  rate: number,
  discount: number,
  gst: number
) => {
  const gross = qty * rate;

  const discountRs = (gross * discount) / 100;

  const taxable = gross - discountRs;

  const gstAmount = (taxable * gst) / 100;

  return taxable + gstAmount;
};

/* =========================================================
   INVENTORY AUTOCOMPLETE
========================================================= */

function ItemAutocompleteCell({
  value,
  onSelect,
  onTextChange,
}: {
  value: string;
  onSelect: (item: InventoryItem) => void;
  onTextChange: (value: string) => void;
}) {
  const [inputValue, setInputValue] = useState(value);

  const [options, setOptions] = useState<InventoryItem[]>([]);

  const [loading, setLoading] = useState(false);

  /* -------------------------------------------------------
     Keep autocomplete synchronized with parent value
  ------------------------------------------------------- */

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  /* -------------------------------------------------------
     SEARCH INVENTORY THROUGH API
  ------------------------------------------------------- */

  useEffect(() => {
    const query = inputValue.trim();

    if (!query) {
      setOptions([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/inventory?search=${encodeURIComponent(query)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          setOptions(
            Array.isArray(result.items)
              ? result.items
              : []
          );
        } else {
          setOptions([]);
        }
      } catch (error) {
        console.error(
          "Inventory item search failed:",
          error
        );

        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [inputValue]);

  /* -------------------------------------------------------
     AUTOCOMPLETE
  ------------------------------------------------------- */

  return (
    <Autocomplete
      freeSolo
      options={options}
      loading={loading}
      value={null}
      inputValue={inputValue}
      fullWidth
      onInputChange={(_, nextValue) => {
        setInputValue(nextValue);

        onTextChange(nextValue);
      }}
      onChange={(_, selected) => {
        if (
          selected &&
          typeof selected !== "string"
        ) {
          setInputValue(selected.itemName);

          onSelect(selected);
        }
      }}
      getOptionLabel={(option) => {
        if (typeof option === "string") {
          return option;
        }

        return [
          option.itemName,
          option.size,
          option.brand,
        ]
          .filter(Boolean)
          .join(" — ");
      }}
      isOptionEqualToValue={(option, selected) => {
        return (
          typeof selected !== "string" &&
          option.id === selected.id
        );
      }}
      noOptionsText={
        inputValue.trim()
          ? "No inventory item found"
          : "Type to search inventory"
      }
      sx={{
        width: "100%",

        "& .MuiOutlinedInput-root": {
          padding: "0 !important",
        },

        "& .MuiAutocomplete-input": {
          padding: "8px 10px !important",
        },

        "& .MuiAutocomplete-endAdornment": {
          right: 4,
        },
      }}
      renderOption={(props, option) => (
        <li
          {...props}
          key={option.id}
          style={{
            padding: "9px 12px",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 13,
                color: "#263238",
              }}
            >
              {option.itemName}

              {option.size
                ? ` — ${option.size}`
                : ""}
            </div>

            <div
              style={{
                fontSize: 11,
                color: "#78909C",
              }}
            >
              {option.brand || "No brand"}

              {" · "}

              Rate ₹
              {Number(
                option.sellingPrice || 0
              ).toFixed(2)}

              {" · "}

              Stock{" "}
              {Number(
                option.quantity || 0
              )}
            </div>
          </div>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          placeholder=""
          InputLabelProps={{
            shrink: false,
          }}
          sx={{
            "& .MuiInputBase-root": {
              fontSize: 13,
            },

            "& .MuiInputBase-input": {
              padding: "8px 8px !important",
            },

            "& .MuiInput-underline:before": {
              borderBottom: "none !important",
            },

            "& .MuiInput-underline:after": {
              borderBottom: "none !important",
            },

            "& .MuiInput-underline:hover:not(.Mui-disabled):before":
              {
                borderBottom:
                  "none !important",
              },
          }}
        />
      )}
    />
  );
}

/* =========================================================
   MAIN TABLE
========================================================= */

export default function EntryTable({
  items,
  setItems,
}: EntryTableProps) {
  /* -------------------------------------------------------
     UPDATE ROW
  ------------------------------------------------------- */

  const updateRow = (
    index: number,
    updater: (row: BillItem) => BillItem
  ) => {
    setItems((prev) => {
      const rows = [...prev];

      if (!rows[index]) {
        return prev;
      }

      rows[index] = updater(rows[index]);

      return rows;
    });
  };

  /* -------------------------------------------------------
     HANDLE INPUT CHANGE
  ------------------------------------------------------- */

  const handleChange = (
    index: number,
    field: keyof BillItem,
    value: string
  ) => {
    setItems((prev) => {
      const rows = [...prev];

      if (!rows[index]) {
        return prev;
      }

      const numericFields = [
        "qty",
        "rate",
        "discount",
        "gst",
      ];

      const parsedValue = numericFields.includes(
        field
      )
        ? value === ""
          ? 0
          : Number(value)
        : value;

      const updatedRow: BillItem = {
        ...rows[index],

        ...(field === "itemName"
          ? {
              inventoryItemId: undefined,
            }
          : {}),

        [field]: parsedValue,
      } as BillItem;

      /* ---------------------------------------------------
         CALCULATE AMOUNT
      --------------------------------------------------- */

      updatedRow.amount = calculateAmount(
        Number(updatedRow.qty || 0),
        Number(updatedRow.rate || 0),
        Number(updatedRow.discount || 0),
        Number(updatedRow.gst || 0)
      );

      rows[index] = updatedRow;

      /* ---------------------------------------------------
         ADD NEW ROW AUTOMATICALLY
      --------------------------------------------------- */

      const hasData =
        Boolean(updatedRow.itemName) ||
        Boolean(updatedRow.brand) ||
        Boolean(updatedRow.size) ||
        Boolean(updatedRow.qty) ||
        Boolean(updatedRow.rate);

      if (
        index === rows.length - 1 &&
        hasData
      ) {
        rows.push(
          createNewRow(rows.length + 1)
        );
      }

      return rows;
    });
  };

  /* -------------------------------------------------------
     INVENTORY ITEM SELECT
  ------------------------------------------------------- */

  const handleInventorySelect = (
    index: number,
    inventoryItem: InventoryItem
  ) => {
    updateRow(index, (row) => {
      const next = {
        ...row,

        inventoryItemId:
          inventoryItem.id,

        /*
         * Barcode remains in the data model
         * for API/stock identification,
         * but is NOT displayed in this table.
         */
        barcode:
          inventoryItem.barcode || "",

        itemName:
          inventoryItem.itemName || "",

        brand:
          inventoryItem.brand || "",

        size:
          inventoryItem.size || "",

        rate: Number(
          inventoryItem.sellingPrice || 0
        ),

        gst: Number(
          inventoryItem.gst || 0
        ),
      };

      next.amount = calculateAmount(
        Number(next.qty || 0),
        Number(next.rate || 0),
        Number(next.discount || 0),
        Number(next.gst || 0)
      );

      return next;
    });
  };

  /* -------------------------------------------------------
     INPUT RENDER
  ------------------------------------------------------- */

  const renderInput = (
    index: number,
    field: keyof BillItem,
    value: string | number,
    type = "text"
  ) => (
    <input
      type={type}
      value={
        value === 0
          ? ""
          : value
      }
      onChange={(event) =>
        handleChange(
          index,
          field,
          event.target.value
        )
      }
      style={{
        ...inputStyle,

        textAlign:
          type === "number"
            ? "right"
            : "left",
      }}
    />
  );

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",

        border:
          "1px solid rgba(46, 125, 50, 0.22)",

        background:
          "#FFFFFF",

        boxShadow:
          "0 4px 18px rgba(30, 70, 40, 0.08)",
      }}
    >
      <TableContainer
        sx={{
          width: "100%",
          maxHeight: 420,

          overflowX: "auto",

          "&::-webkit-scrollbar": {
            height: 7,
          },

          "&::-webkit-scrollbar-thumb": {
            background:
              "rgba(46, 125, 50, 0.25)",
            borderRadius: 10,
          },
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            width: "100%",

            /*
             * Important:
             * Column widths are intentionally
             * different.
             */
            tableLayout: "fixed",

            minWidth: 1050,

            "& .MuiTableCell-root": {
              boxSizing: "border-box",
            },
          }}
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column}
                  sx={{
                    ...headerStyle,

                    width:
                      columnWidths[column],

                    whiteSpace:
                      "nowrap",
                  }}
                >
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* =================================================
              BODY
          ================================================= */}

          <TableBody>
            {items.map(
              (item, index) => {
                const gross =
                  Number(item.qty || 0) *
                  Number(item.rate || 0);

                const discountRs =
                  (gross *
                    Number(
                      item.discount || 0
                    )) /
                  100;

                return (
                  <TableRow
                    key={item.id}
                    hover
                    sx={{
                      height: 48,

                      transition:
                        "background-color 0.15s ease",

                      "&:hover": {
                        backgroundColor:
                          "#F7FCF7",

                        "& .row-number": {
                          color:
                            "#2E7D32",
                        },
                      },
                    }}
                  >
                    {/* -------------------------------------
                        NO
                    ------------------------------------- */}

                    <TableCell
                      sx={{
                        ...cellStyle,

                        width:
                          columnWidths.NO,

                        textAlign:
                          "center",
                      }}
                    >
                      <span
                        className="row-number"
                        style={{
                          fontWeight: 600,
                          color: "#607D8B",
                          transition:
                            "color 0.15s ease",
                        }}
                      >
                        {index + 1}
                      </span>
                    </TableCell>

                    {/* -------------------------------------
                        ITEM NAME
                    ------------------------------------- */}

                    <TableCell
                      sx={{
                        ...inputCell,

                        width:
                          columnWidths[
                            "ITEM NAME"
                          ],

                        backgroundColor:
                          "#FFFFFF",
                      }}
                    >
                      <ItemAutocompleteCell
                        value={
                          item.itemName
                        }
                        onTextChange={(
                          value
                        ) =>
                          handleChange(
                            index,
                            "itemName",
                            value
                          )
                        }
                        onSelect={(
                          selected
                        ) =>
                          handleInventorySelect(
                            index,
                            selected
                          )
                        }
                      />
                    </TableCell>

                    {/* -------------------------------------
                        BRAND
                    ------------------------------------- */}

                    <TableCell
                      sx={{
                        ...inputCell,

                        width:
                          columnWidths.BRAND,
                      }}
                    >
                      {renderInput(
                        index,
                        "brand",
                        item.brand
                      )}
                    </TableCell>

                    {/* -------------------------------------
                        SIZE
                    ------------------------------------- */}

                    <TableCell
                      sx={{
                        ...inputCell,

                        width:
                          columnWidths.SIZE,
                      }}
                    >
                      {renderInput(
                        index,
                        "size",
                        item.size
                      )}
                    </TableCell>

                    {/* -------------------------------------
                        QTY
                    ------------------------------------- */}

                    <TableCell
                      sx={{
                        ...inputCell,

                        width:
                          columnWidths.QTY,

                        textAlign:
                          "right",
                      }}
                    >
                      {renderInput(
                        index,
                        "qty",
                        item.qty,
                        "number"
                      )}
                    </TableCell>

                    {/* -------------------------------------
                        DISCOUNT %
                    ------------------------------------- */}

                    <TableCell
                      sx={{
                        ...inputCell,

                        width:
                          columnWidths[
                            "DISC %"
                          ],

                        textAlign:
                          "right",
                      }}
                    >
                      {renderInput(
                        index,
                        "discount",
                        item.discount,
                        "number"
                      )}
                    </TableCell>

                    {/* -------------------------------------
                        DISCOUNT RS
                    ------------------------------------- */}

                    <TableCell
                      sx={{
                        ...rightCell,

                        width:
                          columnWidths[
                            "DISC RS"
                          ],
                      }}
                    >
                      {discountRs > 0
                        ? discountRs.toFixed(
                            2
                          )
                        : ""}
                    </TableCell>

                    {/* -------------------------------------
                        GST %
                    ------------------------------------- */}

                    <TableCell
                      sx={{
                        ...inputCell,

                        width:
                          columnWidths[
                            "GST %"
                          ],

                        textAlign:
                          "right",
                      }}
                    >
                      {renderInput(
                        index,
                        "gst",
                        item.gst,
                        "number"
                      )}
                    </TableCell>

                    {/* -------------------------------------
                        RATE
                    ------------------------------------- */}

                    <TableCell
                      sx={{
                        ...inputCell,

                        width:
                          columnWidths.RATE,

                        textAlign:
                          "right",
                      }}
                    >
                      {renderInput(
                        index,
                        "rate",
                        item.rate,
                        "number"
                      )}
                    </TableCell>

                    {/* -------------------------------------
                        AMOUNT
                    ------------------------------------- */}

                    <TableCell
                      sx={{
                        ...amountCell,

                        width:
                          columnWidths.AMOUNT,
                      }}
                    >
                      {item.amount > 0
                        ? `₹ ${Number(
                            item.amount
                          ).toFixed(2)}`
                        : ""}
                    </TableCell>
                  </TableRow>
                );
              }
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* =====================================================
          TABLE FOOTER
      ===================================================== */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          padding:
            "10px 14px",

          background:
            "#F8FAF8",

          borderTop:
            "1px solid #E3EAE3",

          fontSize: 12,
          color: "#607D8B",
        }}
      >
        <span>
          Total Rows:{" "}
          <strong
            style={{
              color: "#2E7D32",
            }}
          >
            {items.length}
          </strong>
        </span>

        <span
          style={{
            fontSize: 11,
          }}
        >
          Search inventory item
          to auto-fill details
        </span>
      </div>
    </Paper>
  );
}

/* =========================================================
   COLUMN WIDTHS
========================================================= */

const columnWidths: Record<
  string,
  string
> = {
  /*
   * VERY SMALL
   */
  NO: "46px",

  /*
   * BIGGEST COLUMN
   */
  "ITEM NAME": "290px",

  /*
   * MEDIUM
   */
  BRAND: "125px",

  SIZE: "85px",

  /*
   * SMALL
   */
  QTY: "65px",

  "DISC %": "72px",

  "DISC RS": "82px",

  "GST %": "68px",

  /*
   * MONEY
   */
  RATE: "105px",

  AMOUNT: "125px",
};

/* =========================================================
   STYLES
========================================================= */

const headerStyle = {
  background:
    "linear-gradient(180deg, #EEF5D5 0%, #E5EDC4 100%)",

  border:
    "1px solid #B7C9A1",

  fontWeight: 700,

  fontSize: 12,

  color: "#263238",

  textAlign: "center" as const,

  padding:
    "11px 6px",

  letterSpacing:
    "0.2px",

  whiteSpace:
    "nowrap" as const,
};

const cellStyle = {
  border:
    "1px solid #E1E8DE",

  fontSize: 13,

  height: 48,

  padding:
    "4px 6px",

  color: "#37474F",

  backgroundColor:
    "#FFFFFF",
};

const inputCell = {
  border:
    "1px solid #E1E8DE",

  padding: 0,

  height: 48,

  color: "#37474F",

  backgroundColor:
    "#FFFFFF",
};

const rightCell = {
  border:
    "1px solid #E1E8DE",

  textAlign:
    "right" as const,

  fontSize: 12,

  height: 48,

  padding:
    "4px 8px",

  color: "#546E7A",

  backgroundColor:
    "#FFFFFF",
};

const amountCell = {
  border:
    "1px solid #E1E8DE",

  textAlign:
    "right" as const,

  fontWeight: 700,

  color: "#1B5E20",

  fontSize: 13,

  height: 48,

  padding:
    "4px 8px",

  background:
    "#F7FBF5",
};

const inputStyle: CSSProperties = {
  width: "100%",

  height: "46px",

  border: "none",

  outline: "none",

  background:
    "transparent",

  padding:
    "4px 8px",

  fontSize: "13px",

  fontFamily:
    "inherit",

  color:
    "#263238",

  boxSizing:
    "border-box",

  appearance:
    "none",
};