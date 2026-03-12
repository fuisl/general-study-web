"use client";

import { csvParse } from "d3-dsv";
import type { DSVRowString } from "d3-dsv";
import { useEffect, useState } from "react";

export type CsvRow = Record<string, string>;

export const chartPalette = ["#2457a6", "#2c7a7b", "#a4582f", "#6b4fb3", "#c17f16"];

export function useCsvData(src: string) {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRows() {
      setStatus("loading");
      setError("");

      try {
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`Unable to load ${src}`);
        }

        const text = await response.text();
        const parsed = csvParse(text);
        const nextColumns: string[] = parsed.columns;
        const nextRows: CsvRow[] = parsed.map((row: DSVRowString<string>) => {
          const normalizedRow: CsvRow = {};

          nextColumns.forEach((column: string) => {
            normalizedRow[column] = row[column]?.trim() ?? "";
          });

          return normalizedRow;
        });

        if (cancelled) {
          return;
        }

        setRows(nextRows);
        setColumns(nextColumns);
        setStatus("ready");
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setStatus("error");
        setError(
          loadError instanceof Error ? loadError.message : "Unable to load CSV data.",
        );
      }
    }

    loadRows();

    return () => {
      cancelled = true;
    };
  }, [src]);

  return { columns, error, rows, status };
}

export function buildTicks(min: number, max: number, count: number) {
  const ticks: number[] = [];

  for (let index = 0; index < count; index += 1) {
    const ratio = index / Math.max(count - 1, 1);
    ticks.push(min + (max - min) * ratio);
  }

  return ticks;
}

export function formatShortNumber(value: number, maximumFractionDigits = 2) {
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  });

  return formatter.format(value);
}

export function isNumericColumn(rows: CsvRow[], key: string) {
  let foundNumericValue = false;

  for (const row of rows) {
    const value = row[key];
    if (!value) {
      continue;
    }

    if (Number.isNaN(Number(value))) {
      return false;
    }

    foundNumericValue = true;
  }

  return foundNumericValue;
}

export function normalizeExtent(min: number, max: number): [number, number] {
  if (min === max) {
    const padding = min === 0 ? 1 : Math.abs(min) * 0.1;
    return [min - padding, max + padding];
  }

  return [min, max];
}

export function scaleLinear(value: number, min: number, max: number, size: number) {
  if (max === min) {
    return size / 2;
  }

  return ((value - min) / (max - min)) * size;
}

export function toNumber(value: string) {
  if (!value) {
    return null;
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? null : numericValue;
}

export function uniqueValues(rows: CsvRow[], key: string) {
  const seen = new Set<string>();
  const values: string[] = [];

  rows.forEach((row) => {
    const value = row[key];
    if (!value || seen.has(value)) {
      return;
    }

    seen.add(value);
    values.push(value);
  });

  return values;
}
