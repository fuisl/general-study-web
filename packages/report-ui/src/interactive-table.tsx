"use client";

import { useMemo, useState } from "react";

export type InteractiveTableColumn = {
  key: string;
  label: string;
  align?: "start" | "end";
  width?: string;
};

type InteractiveTableProps = {
  columns: InteractiveTableColumn[];
  rows: Array<Record<string, string>>;
  label?: string;
  filterKey?: string;
  filterLabel?: string;
  searchKeys?: string[];
  searchPlaceholder?: string;
  emptyMessage?: string;
};

export function InteractiveTable({
  columns,
  emptyMessage = "No rows match the current filters.",
  filterKey,
  filterLabel = "Category",
  label = "Interactive table",
  rows,
  searchKeys,
  searchPlaceholder = "Search the table",
}: InteractiveTableProps) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");

  const filterValues = useMemo(() => {
    if (!filterKey) {
      return [];
    }

    const seen = new Set<string>();
    const values: string[] = [];

    rows.forEach((row) => {
      const value = row[filterKey];
      if (!value || seen.has(value)) {
        return;
      }

      seen.add(value);
      values.push(value);
    });

    return values;
  }, [filterKey, rows]);

  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      if (filterKey && activeFilter !== "All" && row[filterKey] !== activeFilter) {
        return false;
      }

      if (!normalizedQuery || !searchKeys?.length) {
        return true;
      }

      return searchKeys.some((key) =>
        String(row[key] ?? "")
          .toLowerCase()
          .includes(normalizedQuery),
      );
    });
  }, [activeFilter, filterKey, query, rows, searchKeys]);

  return (
    <div className="interactive-table">
      {filterValues.length || searchKeys?.length ? (
        <div className="interactive-table__controls">
          {filterValues.length ? (
            <div className="interactive-table__filters" role="group" aria-label={filterLabel}>
              <button
                className={`interactive-table__chip${activeFilter === "All" ? " is-active" : ""}`}
                onClick={() => setActiveFilter("All")}
                type="button"
              >
                All
              </button>
              {filterValues.map((value) => (
                <button
                  className={`interactive-table__chip${activeFilter === value ? " is-active" : ""}`}
                  key={value}
                  onClick={() => setActiveFilter(value)}
                  type="button"
                >
                  {value}
                </button>
              ))}
            </div>
          ) : null}

          {searchKeys?.length ? (
            <label className="interactive-table__search">
              <span className="sr-only">{searchPlaceholder}</span>
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                type="search"
                value={query}
              />
            </label>
          ) : null}
        </div>
      ) : null}

      <div className="interactive-table__frame">
        <table aria-label={label} className="interactive-table__table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  className={column.align === "end" ? "is-end" : undefined}
                  key={column.key}
                  style={column.width ? { width: column.width } : undefined}
                  scope="col"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length ? (
              visibleRows.map((row, rowIndex) => (
                <tr key={`${rowIndex}-${columns.map((column) => row[column.key]).join("|")}`}>
                  {columns.map((column) => (
                    <td
                      className={column.align === "end" ? "is-end" : undefined}
                      key={column.key}
                    >
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="interactive-table__empty" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="interactive-table__summary">
        Showing {visibleRows.length} of {rows.length} rows.
      </p>
    </div>
  );
}
