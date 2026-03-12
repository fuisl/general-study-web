"use client";

import { useEffect, useState } from "react";
import {
  buildTicks,
  chartPalette,
  CsvRow,
  formatShortNumber,
  normalizeExtent,
  scaleLinear,
  toNumber,
  uniqueValues,
  useCsvData,
} from "./chart-utils";

type RankedBarFigureProps = {
  src: string;
  labelKey: string;
  valueKey: string;
  groupKey?: string;
  defaultGroup?: string;
  label?: string;
  limit?: number;
  mode?: "positive" | "diverging";
};

export function RankedBarFigure({
  defaultGroup,
  groupKey,
  label = "Ranked bar chart",
  labelKey,
  limit = 12,
  mode = "positive",
  src,
  valueKey,
}: RankedBarFigureProps) {
  const { error, rows, status } = useCsvData(src);
  const [activeGroup, setActiveGroup] = useState(defaultGroup ?? "");
  const [inspectedRow, setInspectedRow] = useState<CsvRow | null>(null);

  const groups = groupKey ? uniqueValues(rows, groupKey) : [];

  useEffect(() => {
    if (!groupKey) {
      setActiveGroup("");
      return;
    }

    if (defaultGroup && groups.includes(defaultGroup)) {
      setActiveGroup(defaultGroup);
      return;
    }

    setActiveGroup(groups[0] ?? "");
  }, [defaultGroup, groupKey, groups]);

  if (status === "loading") {
    return <div className="csv-figure__state">Loading data...</div>;
  }

  if (status === "error") {
    return <div className="csv-figure__state">{error}</div>;
  }

  const filteredRows =
    groupKey && activeGroup ? rows.filter((row) => row[groupKey] === activeGroup) : rows;
  const rankedRows = filteredRows
    .map((row) => ({
      label: row[labelKey],
      row,
      value: toNumber(row[valueKey]),
    }))
    .filter((entry): entry is { label: string; row: CsvRow; value: number } =>
      Boolean(entry.label) && entry.value !== null,
    )
    .sort((left, right) =>
      mode === "diverging"
        ? Math.abs(right.value) - Math.abs(left.value)
        : right.value - left.value,
    )
    .slice(0, limit);

  if (!rankedRows.length) {
    return <div className="csv-figure__state">This figure has no rows to display.</div>;
  }

  const width = 760;
  const rowHeight = 34;
  const margin = { top: 18, right: 22, bottom: 36, left: 196 };
  const height = margin.top + margin.bottom + rankedRows.length * rowHeight;
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const values = rankedRows.map((entry) => entry.value);
  const minValue = mode === "diverging" ? Math.min(0, ...values) : 0;
  const maxValue = Math.max(...values);
  const [safeMin, safeMax] = normalizeExtent(minValue, maxValue);
  const baseline = margin.left + scaleLinear(0, safeMin, safeMax, plotWidth);
  const ticks = buildTicks(safeMin, safeMax, 5);

  return (
    <div className="ranked-bar-figure">
      {groupKey && groups.length > 1 ? (
        <div className="csv-figure__legend" role="group" aria-label="Group filter">
          {groups.map((groupName, index) => (
            <button
              className={`csv-legend-button${activeGroup === groupName ? " is-active" : ""}`}
              key={groupName}
              onClick={() => setActiveGroup(groupName)}
              type="button"
            >
              <span
                aria-hidden="true"
                className="csv-legend-button__swatch"
                style={{ backgroundColor: chartPalette[index % chartPalette.length] }}
              />
              {groupName}
            </button>
          ))}
        </div>
      ) : null}

      <div className="csv-figure__canvas">
        <svg aria-label={label} className="ranked-bar-chart" role="img" viewBox={`0 0 ${width} ${height}`}>
          <g className="ranked-bar__grid">
            {ticks.map((tick) => {
              const x = margin.left + scaleLinear(tick, safeMin, safeMax, plotWidth);
              return (
                <g key={tick}>
                  <line x1={x} x2={x} y1={margin.top} y2={margin.top + plotHeight} />
                  <text x={x} y={height - 10}>
                    {formatShortNumber(tick, 3)}
                  </text>
                </g>
              );
            })}
          </g>

          <line
            className="ranked-bar__baseline"
            x1={baseline}
            x2={baseline}
            y1={margin.top}
            y2={margin.top + plotHeight}
          />

          {rankedRows.map((entry, index) => {
            const y = margin.top + index * rowHeight;
            const barLength =
              scaleLinear(entry.value, safeMin, safeMax, plotWidth) - scaleLinear(0, safeMin, safeMax, plotWidth);
            const x = barLength >= 0 ? baseline : baseline + barLength;
            const widthValue = Math.max(Math.abs(barLength), 1);
            const isActive = inspectedRow === entry.row;

            return (
              <g key={`${entry.label}-${index}`}>
                <text className="ranked-bar__label" x={margin.left - 12} y={y + 18}>
                  {entry.label}
                </text>
                <rect
                  className={`ranked-bar__bar${isActive ? " is-active" : ""}`}
                  height={20}
                  onFocus={() => setInspectedRow(entry.row)}
                  onMouseEnter={() => setInspectedRow(entry.row)}
                  rx={4}
                  ry={4}
                  style={{
                    fill:
                      entry.value >= 0
                        ? chartPalette[0]
                        : mode === "diverging"
                          ? "#a4582f"
                          : chartPalette[0],
                  }}
                  tabIndex={0}
                  width={widthValue}
                  x={x}
                  y={y + 4}
                />
                <text
                  className="ranked-bar__value"
                  textAnchor={entry.value >= 0 ? "start" : "end"}
                  x={entry.value >= 0 ? x + widthValue + 8 : x - 8}
                  y={y + 18}
                >
                  {formatShortNumber(entry.value, 3)}
                </text>
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
                <strong>{valueKey}:</strong> {inspectedRow[valueKey]}
              </span>
              {groupKey ? (
                <span>
                  <strong>{groupKey}:</strong> {inspectedRow[groupKey] || activeGroup}
                </span>
              ) : null}
            </>
          ) : (
            "Hover a bar to inspect the selected row."
          )}
        </div>
      </div>
    </div>
  );
}
