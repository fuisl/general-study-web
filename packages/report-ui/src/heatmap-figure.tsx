"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
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
  valueFormat?: "number" | "percent";
  xLabelMap?: Record<string, string>;
  yLabelMap?: Record<string, string>;
};

type HeatmapTooltip = {
  row: CsvRow;
  x: number;
  y: number;
};

export function HeatmapFigure({
  label = "Heatmap chart",
  reverseScale = false,
  src,
  valueKey,
  valueFormat = "number",
  xKey,
  xLabelMap,
  yKey,
  yLabelMap,
}: HeatmapFigureProps) {
  const { error, rows, status } = useCsvData(src);
  const [inspectedRow, setInspectedRow] = useState<CsvRow | null>(null);
  const [tooltip, setTooltip] = useState<HeatmapTooltip | null>(null);

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
  const displayXValues = xValues.map((value) => xLabelMap?.[value] ?? value);
  const displayYValues = yValues.map((value) => yLabelMap?.[value] ?? value);
  const maxRowLabelLength = Math.max(...displayYValues.map((value) => value.length));
  const maxColumnLabelLength = Math.max(...displayXValues.map((value) => value.length));
  const cellSize = Math.max(
    32,
    Math.min(42, 420 / Math.max(yValues.length, 1), 420 / Math.max(xValues.length, 1)),
  );
  const margin = {
    top: 22,
    right: 20,
    bottom: Math.max(38, Math.min(56, 22 + maxColumnLabelLength * 1.4)),
    left: Math.max(82, Math.min(150, 22 + maxRowLabelLength * 7)),
  };
  const gap = 6;
  const cellStep = cellSize + gap;
  const width =
    margin.left + margin.right + Math.max(xValues.length * cellStep - gap, cellSize);
  const height =
    margin.top + margin.bottom + Math.max(yValues.length * cellStep - gap, cellSize);

  const viewportWidth = typeof window === "undefined" ? 0 : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 0 : window.innerHeight;
  const tooltipStyle =
    tooltip && viewportWidth && viewportHeight
      ? {
          left: `${Math.min(tooltip.x + 14, viewportWidth - 220)}px`,
          top: `${Math.min(tooltip.y + 14, viewportHeight - 88)}px`,
        }
      : undefined;

  function inspectRow(row: CsvRow) {
    setInspectedRow(row);
  }

  function formatHeatmapValue(value: number) {
    if (valueFormat === "percent") {
      return `${(value * 100).toFixed(1)}%`;
    }

    return formatShortNumber(value, 3);
  }

  function handlePointerMove(
    event: ReactMouseEvent<SVGRectElement>,
    row: CsvRow,
  ) {
    inspectRow(row);
    setTooltip({
      row,
      x: event.clientX,
      y: event.clientY,
    });
  }

  return (
    <div className="heatmap-figure">
      {tooltip ? (
        <div className="heatmap-figure__tooltip" style={tooltipStyle}>
          <div>
            <strong>{xKey}:</strong> {xLabelMap?.[tooltip.row[xKey]] ?? tooltip.row[xKey]}
          </div>
          <div>
            <strong>{yKey}:</strong> {yLabelMap?.[tooltip.row[yKey]] ?? tooltip.row[yKey]}
          </div>
          <div>
            <strong>{valueKey}:</strong>{" "}
            {(() => {
              const numericValue = toNumber(tooltip.row[valueKey]);
              return numericValue === null ? tooltip.row[valueKey] : formatHeatmapValue(numericValue);
            })()}
          </div>
        </div>
      ) : null}

      <div className="csv-figure__canvas">
        <div className="heatmap-figure__frame">
          <svg
            aria-label={label}
            className="heatmap-chart"
            role="img"
            viewBox={`0 0 ${width} ${height}`}
          >
          {yValues.map((rowLabel, rowIndex) => {
            const y = margin.top + rowIndex * cellStep;
            const displayLabel = yLabelMap?.[rowLabel] ?? rowLabel;

            return (
              <text
                className="heatmap-chart__label heatmap-chart__label--row"
                key={rowLabel}
                x={margin.left - 12}
                y={y + cellSize / 2 + 4}
              >
                {displayLabel}
              </text>
            );
          })}

          {xValues.map((columnLabel, columnIndex) => {
            const x = margin.left + columnIndex * cellStep + cellSize / 2;
            const displayLabel = xLabelMap?.[columnLabel] ?? columnLabel;

            return (
              <text
                className="heatmap-chart__label heatmap-chart__label--column"
                key={columnLabel}
                x={x}
                y={height - 10}
              >
                {displayLabel}
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

            const x = margin.left + xIndex * cellStep;
            const y = margin.top + yIndex * cellStep;
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
                  height={cellSize}
                  onBlur={() => setTooltip(null)}
                  onFocus={() => inspectRow(row)}
                  onMouseEnter={(event) => handlePointerMove(event, row)}
                  onMouseLeave={() => setTooltip(null)}
                  onMouseMove={(event) => handlePointerMove(event, row)}
                  rx={6}
                  ry={6}
                  style={{ fill }}
                  tabIndex={0}
                  width={cellSize}
                  x={x}
                  y={y}
                />
                <text
                  className="heatmap-chart__value"
                  x={x + cellSize / 2}
                  y={y + cellSize / 2 + 4}
                >
                  {formatHeatmapValue(numericValue)}
                </text>
              </g>
            );
          })}
        </svg>
        </div>

        <div className="csv-figure__inspect" aria-live="polite">
          {inspectedRow ? (
            <>
              <span>
                <strong>{xKey}:</strong> {xLabelMap?.[inspectedRow[xKey]] ?? inspectedRow[xKey]}
              </span>
              <span>
                <strong>{yKey}:</strong> {yLabelMap?.[inspectedRow[yKey]] ?? inspectedRow[yKey]}
              </span>
              <span>
                <strong>{valueKey}:</strong>{" "}
                {(() => {
                  const numericValue = toNumber(inspectedRow[valueKey]);
                  return numericValue === null ? inspectedRow[valueKey] : formatHeatmapValue(numericValue);
                })()}
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
