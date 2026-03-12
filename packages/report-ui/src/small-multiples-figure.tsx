"use client";

import { useState } from "react";
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

type MetricConfig = {
  key: string;
  label: string;
};

type SmallMultiplesFigureProps = {
  src: string;
  xKey: string;
  metrics: MetricConfig[];
  groupKey?: string;
  label?: string;
  showLegend?: boolean;
  chartConfig?: {
    height?: number;
    lineWidth?: number;
    maxXTicks?: number;
    maxYTicks?: number;
    pointRadius?: number;
    rotateXLabels?: boolean;
    showPoints?: boolean;
    xTickFormat?: "raw" | "ym" | "ymd-short";
  };
};

export function SmallMultiplesFigure({
  chartConfig,
  groupKey,
  label = "Small multiples chart",
  metrics,
  showLegend = true,
  src,
  xKey,
}: SmallMultiplesFigureProps) {
  const { error, rows, status } = useCsvData(src);
  const [inspected, setInspected] = useState<{
    groupName: string;
    metricKey: string;
    row: CsvRow;
  } | null>(null);

  if (status === "loading") {
    return <div className="csv-figure__state">Loading data...</div>;
  }

  if (status === "error") {
    return <div className="csv-figure__state">{error}</div>;
  }

  const groupNames = groupKey ? uniqueValues(rows, groupKey) : ["All"];
  const pointsByMetric = metrics
    .map((metric) => ({
      ...metric,
      series: groupNames
        .map((groupName) => ({
          groupName,
          points: rows
            .filter((row) => (groupKey ? row[groupKey] === groupName : true))
            .map((row) => ({
              row,
              xLabel: row[xKey],
              xValue: toNumber(row[xKey]),
              yValue: toNumber(row[metric.key]),
            }))
            .filter(
              (
                point,
              ): point is { row: CsvRow; xLabel: string; xValue: number | null; yValue: number } =>
                point.yValue !== null && point.xLabel !== "",
            ),
        }))
        .filter((series) => series.points.length > 0),
    }))
    .filter((metric) => metric.series.length > 0);

  if (!pointsByMetric.length) {
    return <div className="csv-figure__state">This figure has no numeric metric panels to render.</div>;
  }

  const xValues = uniqueValues(rows, xKey);
  const xNumericValues = xValues
    .map((value) => toNumber(value))
    .filter((value): value is number => value !== null);
  const xIsNumeric = xNumericValues.length === xValues.length;
  const [safeXMin, safeXMax] = normalizeExtent(
    xNumericValues.length ? Math.min(...xNumericValues) : 0,
    xNumericValues.length ? Math.max(...xNumericValues) : 1,
  );

  const width = 430;
  const height = chartConfig?.height ?? 240;
  const margin = { top: 20, right: 18, bottom: 42, left: 52 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const maxXTicks = chartConfig?.maxXTicks ?? 5;
  const maxYTicks = chartConfig?.maxYTicks ?? 4;
  const lineWidth = chartConfig?.lineWidth ?? 2;
  const pointRadius = chartConfig?.pointRadius ?? 3;
  const showPoints = chartConfig?.showPoints ?? true;

  const legendGroups =
    groupKey && showLegend && groupNames.length > 1 ? groupNames : [];

  return (
    <div className="small-multiples-figure">
      {legendGroups.length ? (
        <div className="csv-figure__legend small-multiples-figure__legend" role="group" aria-label="Series legend">
          {legendGroups.map((groupName, index) => (
            <span className="csv-legend-button small-multiples-figure__legend-item" key={groupName}>
              <span
                aria-hidden="true"
                className="csv-legend-button__swatch"
                style={{ backgroundColor: chartPalette[index % chartPalette.length] }}
              />
              {groupName}
            </span>
          ))}
        </div>
      ) : null}

      <div className="small-multiples-grid" role="img" aria-label={label}>
        {pointsByMetric.map((metric) => {
          const yValues = metric.series.flatMap((series) =>
            series.points.map((point) => point.yValue),
          );
          const [safeYMin, safeYMax] = normalizeExtent(Math.min(...yValues), Math.max(...yValues));
          const yTicks = buildTicks(safeYMin, safeYMax, maxYTicks);
          const focusedGroup =
            inspected?.metricKey === metric.key ? inspected.groupName : null;

          return (
            <div className="small-multiples-card" key={metric.key}>
              <div className="small-multiples-card__header">
                <strong>{metric.label}</strong>
              </div>
              <svg className="small-multiples-chart" viewBox={`0 0 ${width} ${height}`}>
                <g className="csv-grid">
                  {yTicks.map((tick) => {
                    const y = margin.top + plotHeight - scaleLinear(tick, safeYMin, safeYMax, plotHeight);
                    return (
                      <g key={tick}>
                        <line x1={margin.left} x2={width - margin.right} y1={y} y2={y} />
                        <text x={margin.left - 10} y={y + 4}>
                          {formatShortNumber(tick, 3)}
                        </text>
                      </g>
                    );
                  })}
                </g>

                <g className="csv-axis">
                  <line
                    x1={margin.left}
                    x2={width - margin.right}
                    y1={height - margin.bottom}
                    y2={height - margin.bottom}
                  />
                  <line x1={margin.left} x2={margin.left} y1={margin.top} y2={height - margin.bottom} />
                </g>

                {renderSmallMultipleXAxis({
                  maxXTicks,
                  margin,
                  plotHeight,
                  plotWidth,
                  rotateLabels: chartConfig?.rotateXLabels,
                  safeXMax,
                  safeXMin,
                  tickFormat: chartConfig?.xTickFormat,
                  values: xValues,
                  xIsNumeric,
                })}

                {metric.series.map((series, seriesIndex) => {
                  const isFocused = !focusedGroup || focusedGroup === series.groupName;
                  const seriesColor = chartPalette[seriesIndex % chartPalette.length];

                  return (
                    <g key={`${metric.key}-${series.groupName}`}>
                      <path
                        className={`csv-line${isFocused ? " is-focused" : " is-muted"}`}
                        d={series.points
                          .map((point, index) => {
                            const x = getSmallMultipleX({
                              marginLeft: margin.left,
                              plotWidth,
                              safeXMax,
                              safeXMin,
                              value: point.xValue,
                              valueLabel: point.xLabel,
                              values: xValues,
                              xIsNumeric,
                            });
                            const y =
                              margin.top +
                              plotHeight -
                              scaleLinear(point.yValue, safeYMin, safeYMax, plotHeight);

                            return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                          })
                          .join(" ")}
                        style={{ stroke: seriesColor, strokeWidth: lineWidth }}
                      />

                      {showPoints
                        ? series.points.map((point, index) => {
                            const x = getSmallMultipleX({
                              marginLeft: margin.left,
                              plotWidth,
                              safeXMax,
                              safeXMin,
                              value: point.xValue,
                              valueLabel: point.xLabel,
                              values: xValues,
                              xIsNumeric,
                            });
                            const y =
                              margin.top +
                              plotHeight -
                              scaleLinear(point.yValue, safeYMin, safeYMax, plotHeight);
                            const isActive =
                              inspected?.metricKey === metric.key &&
                              inspected.row === point.row &&
                              inspected.groupName === series.groupName;

                            return (
                              <circle
                                className={`csv-point${isFocused ? " is-focused" : " is-muted"}${isActive ? " is-active" : ""}`}
                                cx={x}
                                cy={y}
                                key={`${metric.key}-${series.groupName}-${index}`}
                                onFocus={() =>
                                  setInspected({
                                    groupName: series.groupName,
                                    metricKey: metric.key,
                                    row: point.row,
                                  })
                                }
                                onMouseEnter={() =>
                                  setInspected({
                                    groupName: series.groupName,
                                    metricKey: metric.key,
                                    row: point.row,
                                  })
                                }
                                r={isActive ? pointRadius + 1.5 : pointRadius}
                                style={{ fill: seriesColor }}
                                tabIndex={0}
                              />
                            );
                          })
                        : null}
                    </g>
                  );
                })}
              </svg>
            </div>
          );
        })}
      </div>

      <div className="csv-figure__inspect" aria-live="polite">
        {inspected ? (
          <>
            <span>
              <strong>{xKey}:</strong> {inspected.row[xKey]}
            </span>
            {groupKey ? (
              <span>
                <strong>{groupKey}:</strong> {inspected.row[groupKey] || inspected.groupName}
              </span>
            ) : null}
            <span>
              <strong>{metrics.find((metric) => metric.key === inspected.metricKey)?.label}:</strong>{" "}
              {inspected.row[inspected.metricKey]}
            </span>
          </>
        ) : (
          "Hover a point to inspect a metric."
        )}
      </div>
    </div>
  );
}

function renderSmallMultipleXAxis({
  maxXTicks,
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
  maxXTicks: number;
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
    return buildTicks(safeXMin, safeXMax, maxXTicks).map((tick) => {
      const x = margin.left + scaleLinear(tick, safeXMin, safeXMax, plotWidth);

      return (
        <g className="csv-axis" key={tick}>
          <line x1={x} x2={x} y1={margin.top + plotHeight} y2={margin.top + plotHeight + 6} />
          <text x={x} y={margin.top + plotHeight + 22}>
            {formatShortNumber(tick)}
          </text>
        </g>
      );
    });
  }

  const visibleIndexes =
    values.length <= maxXTicks
      ? values.map((_, index) => index)
      : Array.from(
          new Set([
            ...values
              .map((_, index) => index)
              .filter((index) => index % Math.ceil((values.length - 1) / (maxXTicks - 1)) === 0),
            values.length - 1,
          ]),
        );
  const shouldRotate = rotateLabels ?? visibleIndexes.length > 5;

  return visibleIndexes.map((index) => {
    const value = values[index];
    const step = plotWidth / Math.max(values.length, 1);
    const x = margin.left + (index + 0.5) * step;
    const y = margin.top + plotHeight + (shouldRotate ? 28 : 22);

    return (
      <g className="csv-axis" key={`${value}-${index}`}>
        <line x1={x} x2={x} y1={margin.top + plotHeight} y2={margin.top + plotHeight + 6} />
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

function getSmallMultipleX({
  marginLeft,
  plotWidth,
  safeXMax,
  safeXMin,
  value,
  valueLabel,
  values,
  xIsNumeric,
}: {
  marginLeft: number;
  plotWidth: number;
  safeXMax: number;
  safeXMin: number;
  value: number | null;
  valueLabel: string;
  values: string[];
  xIsNumeric: boolean;
}) {
  if (xIsNumeric) {
    return marginLeft + scaleLinear(value ?? 0, safeXMin, safeXMax, plotWidth);
  }

  const step = plotWidth / Math.max(values.length, 1);
  const index = Math.max(values.indexOf(valueLabel), 0);
  return marginLeft + (index + 0.5) * step;
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
