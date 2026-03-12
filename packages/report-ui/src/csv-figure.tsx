"use client";

import { csvParse } from "d3-dsv";
import type { DSVRowString } from "d3-dsv";
import { useEffect, useState } from "react";

type CsvRow = Record<string, string>;

type CsvFigureProps = {
  src: string;
  defaultView?: "line" | "scatter" | "bar";
  defaultX?: string;
  defaultY?: string;
  defaultColor?: string;
  controls?: Array<"view" | "x" | "y" | "series">;
  chartConfig?: {
    activePointRadius?: number;
    height?: number;
    lineWidth?: number;
    maxXTicks?: number;
    maxYTicks?: number;
    pointRadius?: number;
    rotateXLabels?: boolean;
    showPoints?: boolean;
    width?: number;
    xTickFormat?: "raw" | "ym" | "ymd-short";
  };
  label?: string;
  showLegend?: boolean;
};

const ALL_SERIES = "__all__";
const palette = ["#2457a6", "#2c7a7b", "#a4582f", "#6b4fb3", "#c17f16"];

export function CsvFigure({
  chartConfig,
  controls = ["view", "x", "y", "series"],
  src,
  defaultView = "line",
  defaultX,
  defaultY,
  defaultColor,
  label = "Interactive CSV chart",
  showLegend = true,
}: CsvFigureProps) {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [view, setView] = useState<"line" | "scatter" | "bar">(defaultView);
  const [xKey, setXKey] = useState(defaultX ?? "");
  const [yKey, setYKey] = useState(defaultY ?? "");
  const [colorKey, setColorKey] = useState(defaultColor ?? "");
  const [activeSeries, setActiveSeries] = useState(ALL_SERIES);
  const [inspectedRow, setInspectedRow] = useState<CsvRow | null>(null);

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

        const numericColumns = nextColumns.filter((column: string) =>
          isNumericColumn(nextRows, column),
        );
        const fallbackX = pickColumn(nextColumns, defaultX, nextColumns[0] ?? "");
        const fallbackY = pickColumn(
          numericColumns,
          defaultY,
          numericColumns.find((column: string) => column !== fallbackX) ??
            numericColumns[0] ??
            "",
        );
        const fallbackColor = pickColumn(
          nextColumns.filter(
            (column: string) =>
              column !== fallbackX &&
              column !== fallbackY &&
              !numericColumns.includes(column),
          ),
          defaultColor,
          "",
        );

        setRows(nextRows);
        setColumns(nextColumns);
        setXKey(fallbackX);
        setYKey(fallbackY);
        setColorKey(fallbackColor);
        setView(defaultView);
        setActiveSeries(ALL_SERIES);
        setInspectedRow(nextRows[0] ?? null);
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
  }, [defaultColor, defaultView, defaultX, defaultY, src]);

  useEffect(() => {
    setActiveSeries(ALL_SERIES);
    setInspectedRow(null);
  }, [colorKey, view, xKey, yKey]);

  if (status === "loading") {
    return <div className="csv-figure__state">Loading data...</div>;
  }

  if (status === "error") {
    return <div className="csv-figure__state">{error}</div>;
  }

  const numericColumns = columns.filter((column) => isNumericColumn(rows, column));
  const categoricalColumns = columns.filter((column) => !numericColumns.includes(column));
  const currentX = columns.includes(xKey) ? xKey : columns[0] ?? "";
  const currentY = numericColumns.includes(yKey)
    ? yKey
    : numericColumns.find((column) => column !== currentX) ?? numericColumns[0] ?? "";
  const currentColor = columns.includes(colorKey) ? colorKey : "";
  const currentView =
    view === "scatter" && !numericColumns.includes(currentX)
      ? "line"
      : view === "bar" && !currentY
        ? "line"
        : view;

  const width = chartConfig?.width ?? 760;
  const height = chartConfig?.height ?? 390;
  const margin = { top: 24, right: 18, bottom: 66, left: 58 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const xIsNumeric = numericColumns.includes(currentX);
  const seriesNames = currentColor ? uniqueValues(rows, currentColor) : [];
  const focusedSeries = currentColor && activeSeries !== ALL_SERIES ? activeSeries : null;
  const visibleSeries = seriesNames;
  const xCategories = uniqueValues(rows, currentX);
  const filteredRows =
    currentView === "bar" && currentColor && activeSeries !== ALL_SERIES
      ? rows.filter((row) => row[currentColor] === activeSeries)
      : rows;

  const yValues = rows
    .map((row) => toNumber(row[currentY]))
    .filter((value): value is number => value !== null);

  const hasNumericData = Boolean(currentX && currentY && yValues.length);

  if (!hasNumericData) {
    return (
      <div className="csv-figure__state">
        This figure needs at least one numeric column for the vertical axis.
      </div>
    );
  }

  const yMin =
    currentView === "bar" ? Math.min(0, Math.min(...yValues)) : Math.min(...yValues);
  const yMax =
    currentView === "bar" ? Math.max(0, Math.max(...yValues)) : Math.max(...yValues);
  const [safeYMin, safeYMax] = normalizeExtent(yMin, yMax);
  const xNumericValues = rows
    .map((row) => toNumber(row[currentX]))
    .filter((value): value is number => value !== null);
  const [safeXMin, safeXMax] = normalizeExtent(
    xNumericValues.length ? Math.min(...xNumericValues) : 0,
    xNumericValues.length ? Math.max(...xNumericValues) : 1,
  );
  const yTicks = buildTicks(safeYMin, safeYMax, chartConfig?.maxYTicks ?? 5);
  const baselineY =
    margin.top + plotHeight - scaleLinear(0, safeYMin, safeYMax, plotHeight);
  const numberFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  });
  const pointRadius =
    chartConfig?.pointRadius ?? (xCategories.length > 40 ? 3.2 : 4.5);
  const activePointRadius =
    chartConfig?.activePointRadius ?? pointRadius + 1.5;
  const lineWidth = chartConfig?.lineWidth ?? 2;
  const showPoints = chartConfig?.showPoints ?? true;

  const lineSeries = (currentColor ? visibleSeries : ["All"]).map((seriesName, index) => {
    const seriesRows = currentColor
      ? rows.filter((row) => row[currentColor] === seriesName)
      : rows;

    const points = seriesRows
      .map((row) => {
        const xValue = xIsNumeric ? toNumber(row[currentX]) : null;
        const yValue = toNumber(row[currentY]);

        if (yValue === null || (xIsNumeric && xValue === null)) {
          return null;
        }

        return {
          row,
          xLabel: row[currentX],
          xValue,
          yValue,
        };
      })
      .filter((point): point is NonNullable<typeof point> => point !== null)
      .sort((left, right) => {
        if (!xIsNumeric) {
          return xCategories.indexOf(left.xLabel) - xCategories.indexOf(right.xLabel);
        }

        return (left.xValue ?? 0) - (right.xValue ?? 0);
      });

    return {
      color: palette[index % palette.length],
      isFocused: !focusedSeries || seriesName === focusedSeries,
      name: seriesName,
      points,
    };
  });

  const scatterPoints = rows
    .map((row) => {
      const xValue = toNumber(row[currentX]);
      const yValue = toNumber(row[currentY]);

      if (xValue === null || yValue === null) {
        return null;
      }

      return {
        color:
          currentColor && row[currentColor]
            ? palette[seriesNames.indexOf(row[currentColor]) % palette.length]
            : palette[0],
        isFocused:
          !focusedSeries || !currentColor || row[currentColor] === focusedSeries,
        row,
        xValue,
        yValue,
      };
    })
    .filter((point): point is NonNullable<typeof point> => point !== null);

  const barData = aggregateRows(filteredRows, currentX, currentY, xIsNumeric);

  return (
    <div className="csv-figure">
      {controls.length ? (
        <div className="csv-figure__controls" role="group" aria-label="Chart controls">
          {controls.includes("view") ? (
            <Control
              label="View"
              onChange={(nextValue) =>
                setView(nextValue as "line" | "scatter" | "bar")
              }
              options={[
                { label: "Line", value: "line" },
                { label: "Scatter", value: "scatter", disabled: !xIsNumeric },
                { label: "Bar", value: "bar" },
              ]}
              value={currentView}
            />
          ) : null}
          {controls.includes("x") ? (
            <Control
              label="X axis"
              onChange={setXKey}
              options={columns.map((column) => ({
                label: column,
                value: column,
              }))}
              value={currentX}
            />
          ) : null}
          {controls.includes("y") ? (
            <Control
              label="Y axis"
              onChange={setYKey}
              options={numericColumns
                .filter((column) => column !== currentX)
                .map((column) => ({
                label: column,
                value: column,
                }))}
              value={currentY}
            />
          ) : null}
          {controls.includes("series") ? (
            <Control
              label="Series"
              onChange={setColorKey}
              options={[
                { label: "None", value: "" },
                ...categoricalColumns
                  .filter((column) => column !== currentX)
                  .map((column) => ({
                    label: column,
                    value: column,
                  })),
              ]}
              value={currentColor}
            />
          ) : null}
        </div>
      ) : null}

      <div className="csv-figure__canvas">
        <svg aria-label={label} className="csv-chart" role="img" viewBox={`0 0 ${width} ${height}`}>
          <g className="csv-grid">
            {yTicks.map((tick) => {
              const y = margin.top + plotHeight - scaleLinear(tick, safeYMin, safeYMax, plotHeight);

              return (
                <g key={tick}>
                  <line x1={margin.left} x2={width - margin.right} y1={y} y2={y} />
                  <text x={margin.left - 10} y={y + 4}>
                    {numberFormatter.format(tick)}
                  </text>
                </g>
              );
            })}
          </g>

          <g className="csv-axis">
            <line
              x1={margin.left}
              x2={width - margin.right}
              y1={currentView === "bar" ? baselineY : height - margin.bottom}
              y2={currentView === "bar" ? baselineY : height - margin.bottom}
            />
            <line
              x1={margin.left}
              x2={margin.left}
              y1={margin.top}
              y2={height - margin.bottom}
            />
            <text className="csv-axis__title" x={width / 2} y={height - 12}>
              {currentX}
            </text>
            <text
              className="csv-axis__title"
              transform={`translate(18 ${height / 2}) rotate(-90)`}
            >
              {currentY}
            </text>
          </g>

          {renderXAxisLabels({
            maxTicks: chartConfig?.maxXTicks,
            margin,
            plotHeight,
            plotWidth,
            rotateLabels: chartConfig?.rotateXLabels,
            safeXMax,
            safeXMin,
            tickFormat: chartConfig?.xTickFormat,
            values: currentView === "bar" ? barData.map((bar) => bar.label) : xCategories,
            xIsNumeric,
          })}

          {currentView === "line"
            ? lineSeries.map((series) => (
                <g
                  className={`csv-series${series.isFocused ? " is-focused" : " is-muted"}`}
                  key={series.name}
                >
                  <path
                    className={`csv-line${series.isFocused ? " is-focused" : " is-muted"}`}
                    d={series.points
                      .map((point, index) => {
                        const x = getXPosition({
                          categories: xCategories,
                          marginLeft: margin.left,
                          plotWidth,
                          safeXMax,
                          safeXMin,
                          value: point.xValue,
                          valueLabel: point.xLabel,
                          xIsNumeric,
                        });
                        const y =
                          margin.top +
                          plotHeight -
                          scaleLinear(point.yValue, safeYMin, safeYMax, plotHeight);

                        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                      })
                      .join(" ")}
                    style={{
                      stroke: series.isFocused ? series.color : "rgba(142, 142, 142, 0.82)",
                      strokeWidth: series.isFocused ? lineWidth + 0.2 : Math.max(lineWidth - 0.2, 1.2),
                    }}
                  />
                  {showPoints
                    ? series.points.map((point) => {
                        const x = getXPosition({
                          categories: xCategories,
                          marginLeft: margin.left,
                          plotWidth,
                          safeXMax,
                          safeXMin,
                          value: point.xValue,
                          valueLabel: point.xLabel,
                          xIsNumeric,
                        });
                        const y =
                          margin.top +
                          plotHeight -
                          scaleLinear(point.yValue, safeYMin, safeYMax, plotHeight);
                        const isActive = inspectedRow === point.row;

                        return (
                          <circle
                            aria-label={`${point.xLabel}, ${currentY}: ${point.yValue}`}
                            className={`csv-point${isActive ? " is-active" : ""}${
                              series.isFocused ? " is-focused" : " is-muted"
                            }`}
                            cx={x}
                            cy={y}
                            key={`${series.name}-${point.xLabel}-${point.yValue}`}
                            onFocus={() => setInspectedRow(point.row)}
                            onMouseEnter={() => setInspectedRow(point.row)}
                            r={isActive ? activePointRadius : pointRadius}
                            style={{
                              fill: series.isFocused ? series.color : "rgba(154, 154, 154, 0.82)",
                            }}
                            tabIndex={0}
                          />
                        );
                      })
                    : null}
                </g>
              ))
            : null}

          {currentView === "scatter"
            ? scatterPoints.map((point, index) => {
                const x =
                  margin.left +
                  scaleLinear(point.xValue, safeXMin, safeXMax, plotWidth);
                const y =
                  margin.top +
                  plotHeight -
                  scaleLinear(point.yValue, safeYMin, safeYMax, plotHeight);
                const isActive = inspectedRow === point.row;

                return (
                  <circle
                    aria-label={`${point.row[currentX]}, ${currentY}: ${point.yValue}`}
                    className={`csv-point${isActive ? " is-active" : ""}${
                      point.isFocused ? " is-focused" : " is-muted"
                    }`}
                    cx={x}
                    cy={y}
                    key={index}
                    onFocus={() => setInspectedRow(point.row)}
                    onMouseEnter={() => setInspectedRow(point.row)}
                    r={isActive ? activePointRadius : pointRadius}
                    style={{
                      fill: point.isFocused ? point.color : "rgba(154, 154, 154, 0.82)",
                    }}
                    tabIndex={0}
                  />
                );
              })
            : null}

          {currentView === "bar"
            ? barData.map((bar, index) => {
                const step = plotWidth / Math.max(barData.length, 1);
                const barWidth = Math.max(step * 0.7, 12);
                const x = margin.left + index * step + (step - barWidth) / 2;
                const valueY =
                  margin.top +
                  plotHeight -
                  scaleLinear(bar.value, safeYMin, safeYMax, plotHeight);
                const top = Math.min(valueY, baselineY);
                const heightValue = Math.max(Math.abs(baselineY - valueY), 1);
                const isActive = inspectedRow?.[currentX] === bar.label;

                return (
                  <g key={bar.label}>
                    <rect
                      aria-label={`${bar.label}, ${currentY}: ${bar.value}`}
                      className={`csv-bar${isActive ? " is-active" : ""}`}
                      height={heightValue}
                      onFocus={() => setInspectedRow(bar.row)}
                      onMouseEnter={() => setInspectedRow(bar.row)}
                      rx={4}
                      ry={4}
                      style={{ fill: palette[0] }}
                      tabIndex={0}
                      width={barWidth}
                      x={x}
                      y={top}
                    />
                  </g>
                );
              })
            : null}
        </svg>

        <div className="csv-figure__inspect" aria-live="polite">
          {inspectedRow ? (
            <>
              <strong>{currentX}:</strong> {inspectedRow[currentX] || "-"}
              <span>
                <strong>{currentY}:</strong> {inspectedRow[currentY] || "-"}
              </span>
              {currentColor ? (
                <span>
                  <strong>{currentColor}:</strong> {inspectedRow[currentColor] || "-"}
                </span>
              ) : null}
            </>
          ) : (
            "Hover a point or bar to inspect an individual row."
          )}
        </div>
      </div>

      {showLegend && currentColor && seriesNames.length ? (
        <div className="csv-figure__legend" role="group" aria-label="Series filter">
          <button
            className={`csv-legend-button${activeSeries === ALL_SERIES ? " is-active" : ""}`}
            onClick={() => setActiveSeries(ALL_SERIES)}
            type="button"
          >
            All
          </button>
          {seriesNames.map((seriesName, index) => (
            <button
              className={`csv-legend-button${activeSeries === seriesName ? " is-active" : ""}`}
              key={seriesName}
              onClick={() => setActiveSeries(seriesName)}
              type="button"
            >
              <span
                aria-hidden="true"
                className="csv-legend-button__swatch"
                style={{ backgroundColor: palette[index % palette.length] }}
              />
              {seriesName}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Control({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string; disabled?: boolean }>;
  value: string;
}) {
  return (
    <label className="csv-control">
      <span>{label}</span>
      <select onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map((option) => (
          <option disabled={option.disabled} key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function renderXAxisLabels({
  maxTicks,
  margin,
  plotHeight,
  plotWidth,
  rotateLabels,
  safeXMax,
  safeXMin,
  tickFormat,
  values,
  xIsNumeric,
}: {
  maxTicks?: number;
  margin: { top: number; right: number; bottom: number; left: number };
  plotHeight: number;
  plotWidth: number;
  rotateLabels?: boolean;
  safeXMax: number;
  safeXMin: number;
  tickFormat?: "raw" | "ym" | "ymd-short";
  values: string[];
  xIsNumeric: boolean;
}) {
  if (xIsNumeric) {
    return buildTicks(safeXMin, safeXMax, maxTicks ?? 5).map((tick) => {
      const x = margin.left + scaleLinear(tick, safeXMin, safeXMax, plotWidth);

      return (
        <g className="csv-axis" key={tick}>
          <line
            x1={x}
            x2={x}
            y1={margin.top + plotHeight}
            y2={margin.top + plotHeight + 6}
          />
          <text x={x} y={margin.top + plotHeight + 24}>
            {formatShortNumber(tick)}
          </text>
        </g>
      );
    });
  }

  const labelLimit = Math.max(maxTicks ?? 10, 2);
  const visibleIndexes =
    values.length <= labelLimit
      ? values.map((_, index) => index)
      : Array.from(
          new Set([
            ...values
              .map((_, index) => index)
              .filter((index) => index % Math.ceil((values.length - 1) / (labelLimit - 1)) === 0),
            values.length - 1,
          ]),
        );
  const shouldRotate =
    rotateLabels ?? (visibleIndexes.length > 6 || values.some((value) => value.length > 10));

  return visibleIndexes.map((index) => {
    const value = values[index];
    const step = plotWidth / Math.max(values.length, 1);
    const x = margin.left + (index + 0.5) * step;
    const y = margin.top + plotHeight + (shouldRotate ? 30 : 24);

    return (
      <g className="csv-axis" key={value}>
        <line
          x1={x}
          x2={x}
          y1={margin.top + plotHeight}
          y2={margin.top + plotHeight + 6}
        />
        <text
          textAnchor={shouldRotate ? "end" : "middle"}
          transform={shouldRotate ? `translate(${x} ${y}) rotate(-32)` : undefined}
          x={shouldRotate ? 0 : x}
          y={shouldRotate ? 0 : y}
        >
          {formatTickLabel(value, tickFormat)}
        </text>
      </g>
    );
  });
}

function getXPosition({
  categories,
  marginLeft,
  plotWidth,
  safeXMax,
  safeXMin,
  value,
  valueLabel,
  xIsNumeric,
}: {
  categories: string[];
  marginLeft: number;
  plotWidth: number;
  safeXMax: number;
  safeXMin: number;
  value: number | null;
  valueLabel: string;
  xIsNumeric: boolean;
}) {
  if (xIsNumeric) {
    return marginLeft + scaleLinear(value ?? 0, safeXMin, safeXMax, plotWidth);
  }

  const step = plotWidth / Math.max(categories.length, 1);
  const index = Math.max(categories.indexOf(valueLabel), 0);
  return marginLeft + (index + 0.5) * step;
}

function aggregateRows(rows: CsvRow[], xKey: string, yKey: string, xIsNumeric: boolean) {
  const groups = new Map<
    string,
    {
      count: number;
      row: CsvRow;
      sum: number;
    }
  >();

  rows.forEach((row) => {
    const label = row[xKey];
    const numericValue = toNumber(row[yKey]);

    if (!label || numericValue === null) {
      return;
    }

    const current = groups.get(label) ?? { count: 0, row, sum: 0 };
    current.count += 1;
    current.sum += numericValue;
    groups.set(label, current);
  });

  return Array.from(groups.entries())
    .map(([label, group]) => ({
      label,
      row: group.row,
      value: group.sum / group.count,
    }))
    .sort((left, right) => {
      if (!xIsNumeric) {
        return 0;
      }

      return Number(left.label) - Number(right.label);
    });
}

function pickColumn(columns: string[], preferred: string | undefined, fallback: string) {
  if (preferred && columns.includes(preferred)) {
    return preferred;
  }

  return fallback;
}

function isNumericColumn(rows: CsvRow[], key: string) {
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

function uniqueValues(rows: CsvRow[], key: string) {
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

function toNumber(value: string) {
  if (!value) {
    return null;
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? null : numericValue;
}

function normalizeExtent(min: number, max: number): [number, number] {
  if (min === max) {
    const padding = min === 0 ? 1 : Math.abs(min) * 0.1;
    return [min - padding, max + padding];
  }

  return [min, max];
}

function scaleLinear(value: number, min: number, max: number, size: number) {
  if (max === min) {
    return size / 2;
  }

  return ((value - min) / (max - min)) * size;
}

function buildTicks(min: number, max: number, count: number) {
  const ticks: number[] = [];

  for (let index = 0; index < count; index += 1) {
    const ratio = index / Math.max(count - 1, 1);
    ticks.push(min + (max - min) * ratio);
  }

  return ticks;
}

function formatShortNumber(value: number) {
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  });

  return formatter.format(value);
}

function formatTickLabel(value: string, tickFormat: "raw" | "ym" | "ymd-short" = "raw") {
  if (tickFormat === "raw") {
    return value;
  }

  if (tickFormat === "ym") {
    return /^\d{4}-\d{2}(-\d{2})?$/.test(value) ? value.slice(0, 7) : value;
  }

  if (tickFormat === "ymd-short") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value.slice(2);
    }
    return value;
  }

  return value;
}
