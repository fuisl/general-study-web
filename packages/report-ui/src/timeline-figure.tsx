"use client";

import { useState } from "react";
import {
  buildTicks,
  CsvRow,
  formatShortNumber,
  normalizeExtent,
  scaleLinear,
  useCsvData,
} from "./chart-utils";

type TimelineFigureProps = {
  src: string;
  labelKey: string;
  startKey: string;
  endKey: string;
  valueKey?: string;
  label?: string;
};

export function TimelineFigure({
  endKey,
  label = "Timeline chart",
  labelKey,
  src,
  startKey,
  valueKey,
}: TimelineFigureProps) {
  const { error, rows, status } = useCsvData(src);
  const [inspectedRow, setInspectedRow] = useState<CsvRow | null>(null);

  if (status === "loading") {
    return <div className="csv-figure__state">Loading data...</div>;
  }

  if (status === "error") {
    return <div className="csv-figure__state">{error}</div>;
  }

  const parsedRows = rows
    .map((row) => {
      const start = Date.parse(row[startKey]);
      const end = Date.parse(row[endKey]);

      if (Number.isNaN(start) || Number.isNaN(end)) {
        return null;
      }

      return { end, row, start };
    })
    .filter((entry): entry is { end: number; row: CsvRow; start: number } => entry !== null);

  if (!parsedRows.length) {
    return <div className="csv-figure__state">This timeline needs valid date ranges.</div>;
  }

  const width = 760;
  const rowHeight = 42;
  const margin = { top: 18, right: 18, bottom: 34, left: 160 };
  const height = margin.top + margin.bottom + parsedRows.length * rowHeight;
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const [safeMin, safeMax] = normalizeExtent(
    Math.min(...parsedRows.map((entry) => entry.start)),
    Math.max(...parsedRows.map((entry) => entry.end)),
  );
  const ticks = buildTicks(safeMin, safeMax, 5);

  return (
    <div className="timeline-figure">
      <div className="csv-figure__canvas">
        <svg aria-label={label} className="timeline-chart" role="img" viewBox={`0 0 ${width} ${height}`}>
          <g className="timeline-chart__grid">
            {ticks.map((tick) => {
              const x = margin.left + scaleLinear(tick, safeMin, safeMax, plotWidth);

              return (
                <g key={tick}>
                  <line x1={x} x2={x} y1={margin.top} y2={margin.top + plotHeight} />
                  <text x={x} y={height - 10}>
                    {new Date(tick).toISOString().slice(0, 7)}
                  </text>
                </g>
              );
            })}
          </g>

          {parsedRows.map((entry, index) => {
            const y = margin.top + index * rowHeight;
            const x = margin.left + scaleLinear(entry.start, safeMin, safeMax, plotWidth);
            const widthValue = Math.max(
              scaleLinear(entry.end, safeMin, safeMax, plotWidth) -
                scaleLinear(entry.start, safeMin, safeMax, plotWidth),
              2,
            );
            const isActive = inspectedRow === entry.row;

            return (
              <g key={entry.row[labelKey]}>
                <text className="timeline-chart__label" x={margin.left - 12} y={y + 18}>
                  {entry.row[labelKey]}
                </text>
                <rect
                  className={`timeline-chart__bar${isActive ? " is-active" : ""}`}
                  height={18}
                  onFocus={() => setInspectedRow(entry.row)}
                  onMouseEnter={() => setInspectedRow(entry.row)}
                  rx={6}
                  ry={6}
                  tabIndex={0}
                  width={widthValue}
                  x={x}
                  y={y + 6}
                />
                {valueKey ? (
                  <text className="timeline-chart__value" x={x + widthValue + 8} y={y + 18}>
                    {entry.row[valueKey]}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>

        <div className="csv-figure__inspect" aria-live="polite">
          {inspectedRow ? (
            <>
              <span>
                <strong>{labelKey}:</strong> {inspectedRow[labelKey]}
              </span>
              <span>
                <strong>{startKey}:</strong> {inspectedRow[startKey]}
              </span>
              <span>
                <strong>{endKey}:</strong> {inspectedRow[endKey]}
              </span>
              {valueKey ? (
                <span>
                  <strong>{valueKey}:</strong> {inspectedRow[valueKey]}
                </span>
              ) : null}
            </>
          ) : (
            "Hover a range to inspect the selected split."
          )}
        </div>
      </div>
    </div>
  );
}
