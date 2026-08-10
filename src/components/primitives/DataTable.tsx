/*
 * Copyright 2026 Shane
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { type ReactNode, useMemo, useState } from "react";

import { cn } from "./cn";
import { Input } from "./form";

/**
 * Props for {@link DataTable}.
 *
 * @typeParam Row - The row record type.
 * @since 1.0.0
 */
export interface DataTableProps<Row> {
  columns: ListColumn<Row>[];
  defaultSortDirection?: SortDirection;
  defaultSortKey?: string;
  getRowId: (row: Row) => string;
  onRowClick?: (row: Row) => void;
  pageSize?: number;
  rows: Row[];
  searchPlaceholder?: string;
}

/**
 * A column definition for {@link DataTable}.
 *
 * @typeParam Row - The row record type.
 * @since 1.0.0
 */
export interface ListColumn<Row> {
  // Render the cell body for a row.
  cell: (row: Row) => ReactNode;
  // Contributes this column's text to the free-text search index.
  filterValue?: (row: Row) => string;
  key: string;
  label: ReactNode;
  // When true, the cell is not wrapped in default muted text styling.
  plain?: boolean;
  sortable?: boolean;
  // A comparable value for sorting; required for `sortable` columns.
  sortValue?: (row: Row) => number | string;
  // Fixed pixel width for the column.
  width?: number;
}

/**
 * Sort direction for {@link DataTable}.
 *
 * @since 1.0.0
 */
export type SortDirection = "asc" | "desc";

const compare = (a: number | string, b: number | string): number => {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
};

/**
 * A generic, dependency-free list table with free-text search, click-to-sort
 * headers, and client-side pagination. A minimal stand-in for a full data-grid.
 *
 * @typeParam Row - The row record type.
 * @since 1.0.0
 */
export const DataTable = <Row,>({
  columns,
  defaultSortDirection = "asc",
  defaultSortKey,
  getRowId,
  onRowClick,
  pageSize = 50,
  rows,
  searchPlaceholder = "Search…",
}: DataTableProps<Row>) => {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | undefined>(defaultSortKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);
  const [page, setPage] = useState(0);

  const searchable = columns.filter((column) => column.filterValue);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      searchable.some((column) => column.filterValue!(row).toLowerCase().includes(q)),
    );
  }, [rows, query, searchable]);

  const sorted = useMemo(() => {
    const column = columns.find((c) => c.key === sortKey);
    if (!column?.sortValue) return filtered;
    const direction = sortDirection === "asc" ? 1 : -1;
    return filtered.toSorted(
      (a, b) => compare(column.sortValue!(a), column.sortValue!(b)) * direction,
    );
  }, [filtered, columns, sortKey, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const visible = sorted.slice(current * pageSize, current * pageSize + pageSize);

  const toggleSort = (column: ListColumn<Row>) => {
    if (!column.sortable || !column.sortValue) return;
    if (sortKey === column.key) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(column.key);
      setSortDirection("asc");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Input
        className="h-8 max-w-xs text-sm"
        onChange={(event) => {
          setQuery(event.target.value);
          setPage(0);
        }}
        placeholder={searchPlaceholder}
        value={query}
      />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              {columns.map((column) => (
                <th
                  className={cn(
                    "px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500",
                    column.sortable && column.sortValue ? "cursor-pointer select-none" : "",
                  )}
                  key={column.key}
                  onClick={() => toggleSort(column)}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.label}
                  {sortKey === column.key ? (sortDirection === "asc" ? " ^" : " v") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                className={cn(
                  "border-b border-slate-100",
                  onRowClick ? "cursor-pointer hover:bg-slate-50" : "",
                )}
                key={getRowId(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <td
                    className={cn("px-3 py-2 align-middle", column.plain ? "" : "text-slate-600")}
                    key={column.key}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pageCount > 1 ? (
        <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
          <button
            className="rounded border border-slate-200 px-2 py-1 disabled:opacity-40"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
            type="button"
          >
            Prev
          </button>
          <span>
            Page {current + 1} of {pageCount}
          </span>
          <button
            className="rounded border border-slate-200 px-2 py-1 disabled:opacity-40"
            disabled={current >= pageCount - 1}
            onClick={() => setPage(current + 1)}
            type="button"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
};
