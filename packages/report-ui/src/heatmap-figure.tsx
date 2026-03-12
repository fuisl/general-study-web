"use client";

import { useState } from "react";
import {
  CsvRow,
  formatShortNumber,
  normalizeExtent,
  toNumber,
  uniqueValues,
  useCsvData,
} from "./chart-utils";

type HeatmapFigureProps = {
  src: string;
  xKey: string;
  yKey: string;
  valueKey: string;
  label?: string;
  reverseScale?: boolean;
};

export function HeatmapFigure({
  label = "Heatmap chart",
  reverseScale = false,
  src,
  valueKey,
  xKey,
  yKey,
}: HeatmapFigureProps) {
  const { error, rows, status } = useCsvData(src);
  const [inspectedRow, setInspectedRow] = useState<CsvRow | null>(null);

  if (status === "loading") {
    return <div className="csv-figure__state">Loading data...</div>;
  }

  if (status === "error") {
    return <div className="csv-figure__state">{error}</div>;
  }

  const xValues = uniqueValues(rows, xKey);
  const yValues = uniqueValues(rows, yKey);
  const numericValues = rows
    .map((row) => toNumber(row[valueKey]))
    .filter((value): value is number => value !== null);

  if (!xValues.length || !yValues.length || !numericValues.length) {
    return <div className="csv-figure__state">This heatmap needs labeled numeric cells.</div>;
  }

  const [safeMin, safeMax] = normalizeExtent(
    Math.min(...numericValues),
    Math.max(...numericValues),
  );
  const width = Math.max(760, 170 + xValues.length * 120);
  const height = Math.max(300, 88 + yValues.length * 44);
  const margin = { top: 26, right: 20, bottom: 34, left: 170 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const cellWidth = plotWidth / Math.max(xValues.length, 1);
  const cellHeight = plotHeight / Math.max(yValues.length, 1);

  return (
    <div className="heatmap-figure">
      <div className="csv-figure__canvas">
        <svg aria-label={label} className="heatmap-chart" role="img" viewBox={`0 0 ${width} ${height}`}>
          {yValues.map((rowLabel, rowIndex) => {
            const y = margin.top + rowIndex * cellHeight;

            return (
              <text className="heatmap-chart__label heatmap-chart__label--row" key={rowLabel} x={margin.left - 12} y={y + cellHeight / 2 + 4}>
                {rowLabel}
              </text>
            );
          })}

          {xValues.map((columnLabel, columnIndex) => {
            const x = margin.left + columnIndex * cellWidth + cellWidth / 2;

            return (
              <text className="heatmap-chart__label" key={columnLabel} x={x} y={height - 10}>
                {columnLabel}
              </text>
            );
          })}

          {rows.map((row, index) => {
            const xIndex = xValues.indexOf(row[xKey]);
            const yIndex = yValues.indexOf(row[yKey]);
            const numericValue = toNumber(row[valueKey]);

            if (xIndex < 0 || yIndex < 0 || numericValue === null) {
              return null;
            }

            const x = margin.left + xIndex * cellWidth;
            const y = margin.top + yIndex * cellHeight;
            const ratio =
              safeMax === safeMin
                ? 0.5
                : (numericValue - safeMin) / Math.max(safeMax - safeMin, Number.EPSILON);
            const normalizedRatio = reverseScale ? 1 - ratio : ratio;
            const fill = `hsl(214 70% ${92 - normalizedRatio * 40}%)`;
            const isActive = inspectedRow === row;

            return (
              <g key={`${row[xKey]}-${row[yKey]}-${index}`}>
                <rect
                  className={`heatmap-chart__cell${isActive ? " is-active" : ""}`}
                  height={cellHeight - 4}
                  onFocus={() => setInspectedRow(row)}
                  onMouseEnter={() => setInspectedRow(row)}
                  rx={6}
                  ry={6}
                  style={{ fill }}
                  tabIndex={0}
                  width={cellWidth - 4}
                  x={x + 2}
                  y={y + 2}
                />
                <text className="heatmap-chart__value" x={x + cellWidth / 2} y={y + cellHeight / 2 + 4}>
                  {formatShortNumber(numericValue, 3)}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="csv-figure__inspect" aria-live="polite">
          {inspectedRow ? (
            <>
              <span>
                <strong>{xKey}:</strong> {inspectedRow[xKey]}
              </span>
              <span>
                <strong>{yKey}:</strong> {inspectedRow[yKey]}
              </span>
              <span>
                <strong>{valueKey}:</strong> {inspectedRow[valueKey]}
              </span>
            </>
          ) : (
            "Hover a cell to inspect a value."
          )}
        </div>
      </div>
    </div>
  );
}
