import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = join(__dirname, "..");
const dataDir = join(appDir, "public", "data");
const rawDir = join(dataDir, "raw");
const notebookPath = join(appDir, "content", "general_study_banking_gold_ML.ipynb");

mkdirSync(dataDir, { recursive: true });

const LINEAR_MODELS = ["Linear", "DLinear", "NLinear"];
const LINEAR_LOOKBACKS = [
  { days: 7, label: "7d" },
  { days: 30, label: "30d" },
  { days: 120, label: "120d" },
  { days: 480, label: "480d" },
];
const LINEAR_FEATURE_GROUPS = [
  { label: "return_1d", features: ["return_1d"] },
  { label: "price level", features: ["close_log", "HCL3", "BBL_20"] },
  { label: "moving averages", features: ["KAMA_10", "SMA_20", "EMA_20", "HMA_20"] },
  { label: "volume flow", features: ["OBV", "PVT"] },
  { label: "volatility", features: ["ATR_14"] },
  { label: "gold_return", features: ["gold_return"] },
];
const LINEAR_PERFORMANCE_ROWS = [
  { input_length: "7d", model: "Linear", rmse: "0.0153", mae: "0.0090", r2: "-0.0161", direction: "0.4896" },
  { input_length: "7d", model: "DLinear", rmse: "0.0153", mae: "0.0090", r2: "-0.0161", direction: "0.4877" },
  { input_length: "7d", model: "NLinear", rmse: "0.0164", mae: "0.0099", r2: "-0.1627", direction: "0.5037" },
  { input_length: "30d", model: "Linear", rmse: "0.0154", mae: "0.0090", r2: "-0.0249", direction: "0.5123" },
  { input_length: "30d", model: "DLinear", rmse: "0.0154", mae: "0.0090", r2: "-0.0252", direction: "0.5112" },
  { input_length: "30d", model: "NLinear", rmse: "0.0156", mae: "0.0092", r2: "-0.0472", direction: "0.4944" },
  { input_length: "120d", model: "Linear", rmse: "0.0162", mae: "0.0098", r2: "-0.0735", direction: "0.5160" },
  { input_length: "120d", model: "DLinear", rmse: "0.0162", mae: "0.0098", r2: "-0.0729", direction: "0.5171" },
  { input_length: "120d", model: "NLinear", rmse: "0.0163", mae: "0.0099", r2: "-0.0867", direction: "0.5048" },
  { input_length: "480d", model: "Linear", rmse: "0.0175", mae: "0.0109", r2: "-0.1670", direction: "0.5326" },
  { input_length: "480d", model: "DLinear", rmse: "0.0175", mae: "0.0109", r2: "-0.1676", direction: "0.5326" },
  { input_length: "480d", model: "NLinear", rmse: "0.0175", mae: "0.0108", r2: "-0.1640", direction: "0.5161" },
];
const LINEAR_FAMILY_HEATMAP_GROUPS = [
  { family: "short_return", features: ["return_1d"] },
  { family: "long_return", features: [] },
  { family: "trend_ma", features: ["KAMA_10", "SMA_20", "EMA_20", "HMA_20"] },
  { family: "price_level", features: ["close_log", "HCL3", "BBL_20"] },
  { family: "volatility", features: ["ATR_14"] },
  { family: "volume_flow", features: ["OBV", "PVT"] },
  { family: "external", features: ["gold_return"] },
];

const TREE_MODELS = ["RandomForest", "XGBoost", "LightGBM"];
const CONSTITUENT_BANKS = ["BID", "CTG", "MBB", "STB", "VCB"];
const MARKET_CONTEXT_SERIES_ORDER = ["Banking basket", ...CONSTITUENT_BANKS, "Gold"];
const TREE_FAMILIES = new Map([
  [
    "short_return",
    [
      "return_1d_past",
      "return_2d_past",
      "return_3d_past",
      "return_4d_past",
      "return_5d_past",
      "return_6d_past",
      "return_7d_past",
      "return_10d_past",
    ],
  ],
  ["long_return", ["return_20d_past", "return_30d_past", "return_120d_past", "return_480d_past"]],
  ["trend_ma", ["KAMA_10", "SMA_20", "TEMA_20", "EMA_20", "HMA_20", "FWMA_10"]],
  ["price_level", ["HLC3", "BBL_20"]],
  ["volatility", ["ATR_14"]],
  ["volume_flow", ["OBV", "PVT"]],
  ["external", ["gold_return"]],
]);

await main();

async function main() {
  const stockRows = parseCsvFile(join(rawDir, "stock_data.csv"));
  const linearData = await buildLinearData();

  writeCsv(
    join(dataDir, "linear-lookback-validation.csv"),
    buildLinearLookbackSummary(linearData.summaries),
    [
      "lookback",
      "model",
      "mean_abs_shap",
      "peak_abs_shap",
      "mean_sample_abs",
      "peak_sample_abs",
    ],
  );
  writeCsv(
    join(dataDir, "linear-model-metrics.csv"),
    buildLinearModelMetrics(linearData.summaries, linearData.focusLookback),
    [
      "model",
      "mean_abs_shap",
      "peak_abs_shap",
      "mean_sample_abs",
      "peak_sample_abs",
    ],
  );
  writeCsv(
    join(dataDir, "linear-performance-summary.csv"),
    LINEAR_PERFORMANCE_ROWS,
    ["input_length", "model", "rmse", "mae", "r2", "direction"],
  );
  writeCsv(
    join(dataDir, "linear-prediction-trace.csv"),
    buildLinearAttributionTrace(linearData.focusBundles),
    ["sample", "series", "signal"],
  );
  writeCsv(
    join(dataDir, "linear-local-shap.csv"),
    buildLinearLocalShap(linearData.focusModelBundle),
    ["feature", "case", "contribution"],
  );
  writeCsv(
    join(dataDir, "linear-lag-importance.csv"),
    buildLinearLagImportance(linearData.focusBundles),
    ["lag_day", "model", "importance"],
  );
  writeCsv(
    join(dataDir, "linear-feature-importance.csv"),
    buildLinearFeatureImportance(linearData.summaries),
    ["feature", "importance"],
  );
  writeCsv(
    join(dataDir, "linear-gold-ablation.csv"),
    buildLinearGoldAudit(linearData.summaries),
    ["model", "feature", "status"],
  );

  writeCsv(
    join(dataDir, "market-context.csv"),
    buildMarketContext(stockRows),
    ["date", "series", "index_value"],
  );
  writeCsv(
    join(dataDir, "technical-indicators.csv"),
    buildTechnicalIndicators(stockRows),
    ["date", "series", "value"],
  );
  writeCsv(
    join(dataDir, "dataset-split.csv"),
    buildDatasetSplit(stockRows),
    ["split", "start_date", "end_date", "observations", "share"],
  );
  writeCsv(
    join(dataDir, "forecast-horizon-profile.csv"),
    buildForecastHorizonProfile(stockRows),
    ["horizon_day", "mean_return", "std_return", "positive_share", "range_return"],
  );

  const notebook = JSON.parse(readFileSync(notebookPath, "utf8"));
  writeCsv(
    join(dataDir, "tree-model-metrics.csv"),
    buildTreeModelMetrics(notebook),
    ["model", "rmse", "mae", "r2", "direction_acc"],
  );

  const stockDates = stockRows.map((row) => row.time);
  const shapByModel = Object.fromEntries(
    TREE_MODELS.map((model) => [model, parseCsvFile(join(rawDir, `shap_values_${model}.csv`))]),
  );

  writeCsv(
    join(dataDir, "tree-feature-importance.csv"),
    buildTreeFeatureImportance(shapByModel),
    ["model", "feature", "importance", "rank"],
  );
  writeCsv(
    join(dataDir, "tree-feature-family.csv"),
    buildTreeFeatureFamily(shapByModel),
    ["model", "family", "importance", "share"],
  );
  writeCsv(
    join(dataDir, "model-feature-family.csv"),
    await buildModelFeatureFamily(linearData.focusLookback, shapByModel),
    ["model", "family", "importance", "share"],
  );
  writeCsv(
    join(dataDir, "tree-feature-rank-heatmap.csv"),
    buildTreeFeatureRankHeatmap(shapByModel),
    ["feature", "model", "rank", "importance"],
  );
  writeCsv(
    join(dataDir, "tree-local-shap.csv"),
    buildTreeLocalShap(shapByModel.LightGBM, stockDates),
    ["model", "case", "feature", "contribution", "rank", "sample_index", "date"],
  );
  writeCsv(
    join(dataDir, "tree-gold-summary.csv"),
    buildTreeGoldSummary(shapByModel),
    ["model", "mean_abs_shap", "rank", "positive_share", "negative_share", "mean_shap"],
  );
}

function buildMarketContext(rows) {
  const basketSeries = buildMonthEndSeries(
    rows.map((row) => ({
      date: row.time,
      value: Number(row.close),
    })),
  );
  const sharedMonths = new Set(basketSeries.map((entry) => entry.date));
  const output = formatIndexedSeries("Banking basket", basketSeries);

  CONSTITUENT_BANKS.forEach((ticker) => {
    const filePath = join(rawDir, "banking", `${ticker}.csv`);
    if (!existsSync(filePath)) {
      return;
    }

    const seriesRows = parseImportedQuoteFile(filePath).filter((entry) =>
      sharedMonths.has(entry.date.slice(0, 7)),
    );
    output.push(...formatIndexedSeries(ticker, buildMonthEndSeries(seriesRows)));
  });

  const goldPath = join(rawDir, "Gold.csv");
  if (existsSync(goldPath)) {
    const goldRows = parseImportedQuoteFile(goldPath).filter((entry) =>
      sharedMonths.has(entry.date.slice(0, 7)),
    );
    output.push(...formatIndexedSeries("Gold", buildMonthEndSeries(goldRows)));
  } else {
    let goldIndex = 100;
    const goldProxySeries = buildMonthEndSeries(
      rows.map((row, index) => {
        if (index > 0) {
          goldIndex *= Math.exp(Number(row.gold_return));
        }

        return {
          date: row.time,
          value: goldIndex,
        };
      }),
    );
    output.push(...formatIndexedSeries("Gold", goldProxySeries));
  }

  return output.sort(
    (left, right) =>
      left.date.localeCompare(right.date) ||
      MARKET_CONTEXT_SERIES_ORDER.indexOf(left.series) -
        MARKET_CONTEXT_SERIES_ORDER.indexOf(right.series),
  );
}

function buildTechnicalIndicators(rows) {
  const relevantRows = rows.slice(-252);
  const seriesKeys = [
    ["close", "Close"],
    ["SMA_20", "SMA 20"],
    ["EMA_20", "EMA 20"],
    ["KAMA_10", "KAMA 10"],
  ];

  return relevantRows.flatMap((row) =>
    seriesKeys.map(([key, label]) => ({
      date: row.time,
      series: label,
      value: formatNumber(Number(row[key])),
    })),
  );
}

function buildDatasetSplit(rows) {
  const total = rows.length;
  const trainEnd = Math.floor(total * 0.7);
  const validationEnd = Math.floor(total * 0.85);
  const splits = [
    ["Train", rows.slice(0, trainEnd)],
    ["Validation", rows.slice(trainEnd, validationEnd)],
    ["Test", rows.slice(validationEnd)],
  ];

  return splits.map(([split, splitRows]) => ({
    end_date: splitRows[splitRows.length - 1].time,
    observations: String(splitRows.length),
    share: formatNumber(splitRows.length / total),
    split,
    start_date: splitRows[0].time,
  }));
}

function buildForecastHorizonProfile(rows) {
  return Array.from({ length: 7 }, (_, index) => {
    const horizonDay = index + 1;
    const values = rows
      .map((row) => Number(row[`return_${horizonDay}d`]))
      .filter((value) => Number.isFinite(value));
    const mean = average(values);
    const variance = average(values.map((value) => (value - mean) ** 2));
    const positiveShare = values.filter((value) => value > 0).length / values.length;
    const rangeReturn = Math.max(...values) - Math.min(...values);

    return {
      horizon_day: String(horizonDay),
      mean_return: formatNumber(mean),
      positive_share: formatNumber(positiveShare),
      range_return: formatNumber(rangeReturn),
      std_return: formatNumber(Math.sqrt(variance)),
    };
  });
}

async function buildLinearData() {
  const summaries = [];

  for (const lookback of LINEAR_LOOKBACKS) {
    for (const model of LINEAR_MODELS) {
      summaries.push(await summarizeLinearBundle(lookback, model));
    }
  }

  const focusLookback = LINEAR_LOOKBACKS.map((lookback) => {
    const lookbackSummaries = summaries.filter(
      (summary) => summary.lookbackLabel === lookback.label,
    );
    return {
      label: lookback.label,
      score: average(lookbackSummaries.map((summary) => summary.meanAbsShap)),
    };
  }).sort((left, right) => right.score - left.score)[0].label;

  const focusModel = summaries
    .filter((summary) => summary.lookbackLabel === focusLookback)
    .sort((left, right) => right.meanAbsShap - left.meanAbsShap)[0].model;

  const focusBundles = [];
  for (const model of LINEAR_MODELS) {
    focusBundles.push(await buildLinearFocusBundle(focusLookback, model));
  }

  return {
    focusBundles,
    focusLookback,
    focusModel,
    focusModelBundle: focusBundles.find((bundle) => bundle.model === focusModel),
    summaries,
  };
}

async function summarizeLinearBundle(lookback, model) {
  const filePath = join(
    rawDir,
    "shap_results",
    lookback.label,
    `${model}_shap_values.csv`,
  );
  const features = new Set();
  const nonzeroFeatures = new Set();
  const sampleAbs = new Map();
  const lagTotals = new Map();
  const lagCounts = new Map();
  let currentSample = null;
  let currentLag = null;
  let currentLagAbs = 0;
  let rowCount = 0;
  let totalAbs = 0;
  let peakAbs = 0;

  function flushLag() {
    if (currentLag === null) {
      return;
    }

    lagTotals.set(currentLag, (lagTotals.get(currentLag) ?? 0) + currentLagAbs);
    lagCounts.set(currentLag, (lagCounts.get(currentLag) ?? 0) + 1);
  }

  await streamCsvRows(filePath, (row) => {
    const sampleId = Number(row.sample_id);
    const lagDay = Number(row.timestep) + 1;
    const shapValue = Number(row.shap_value);
    const absValue = Math.abs(shapValue);

    if (currentSample !== null && (sampleId !== currentSample || lagDay !== currentLag)) {
      flushLag();
      currentLagAbs = 0;
    }

    currentSample = sampleId;
    currentLag = lagDay;

    rowCount += 1;
    totalAbs += absValue;
    peakAbs = Math.max(peakAbs, absValue);
    features.add(row.feature);
    if (absValue > 0) {
      nonzeroFeatures.add(row.feature);
    }

    currentLagAbs += absValue;
    sampleAbs.set(sampleId, (sampleAbs.get(sampleId) ?? 0) + absValue);
  });
  flushLag();

  const lagImportanceRows = Array.from(lagTotals.entries())
    .map(([lagDay, importance]) => ({
      importance: importance / Math.max(lagCounts.get(lagDay) ?? 1, 1),
      lagDay,
    }))
    .sort((left, right) => left.lagDay - right.lagDay);
  const sampleAbsValues = Array.from(sampleAbs.values());
  const peakLag =
    lagImportanceRows.reduce(
      (best, current) =>
        current.importance > best.importance ? current : best,
      lagImportanceRows[0] ?? { importance: 0, lagDay: 1 },
    ).lagDay;

  return {
    featureCount: features.size,
    features: Array.from(features).sort(),
    lagImportanceRows,
    lookback: String(lookback.days),
    lookbackLabel: lookback.label,
    meanAbsShap: totalAbs / Math.max(rowCount, 1),
    meanSampleAbs: average(sampleAbsValues),
    model,
    nonzeroFeatureCount: nonzeroFeatures.size,
    nonzeroFeatures: Array.from(nonzeroFeatures).sort(),
    peakAbsShap: peakAbs,
    peakLag,
    peakSampleAbs: Math.max(...sampleAbsValues),
    samples: sampleAbs.size,
    timesteps: lagImportanceRows.length,
  };
}

async function buildLinearFocusBundle(lookbackLabel, model) {
  const filePath = join(rawDir, "shap_results", lookbackLabel, `${model}_shap_values.csv`);
  const sampleSignal = new Map();
  const sampleLagSignal = new Map();
  const lagTotals = new Map();
  const lagCounts = new Map();
  let currentSample = null;
  let currentLag = null;
  let currentLagSigned = 0;
  let currentLagAbs = 0;

  function flushLag() {
    if (currentLag === null || currentSample === null) {
      return;
    }

    lagTotals.set(currentLag, (lagTotals.get(currentLag) ?? 0) + currentLagAbs);
    lagCounts.set(currentLag, (lagCounts.get(currentLag) ?? 0) + 1);

    if (!sampleLagSignal.has(currentSample)) {
      sampleLagSignal.set(currentSample, new Map());
    }

    sampleLagSignal.get(currentSample).set(currentLag, currentLagSigned);
  }

  await streamCsvRows(filePath, (row) => {
    const sampleId = Number(row.sample_id);
    const lagDay = Number(row.timestep) + 1;
    const shapValue = Number(row.shap_value);
    const absValue = Math.abs(shapValue);

    if (currentSample !== null && (sampleId !== currentSample || lagDay !== currentLag)) {
      flushLag();
      currentLagSigned = 0;
      currentLagAbs = 0;
    }

    currentSample = sampleId;
    currentLag = lagDay;
    currentLagSigned += shapValue;
    currentLagAbs += absValue;
    sampleSignal.set(sampleId, (sampleSignal.get(sampleId) ?? 0) + shapValue);
  });
  flushLag();

  return {
    lagImportanceRows: Array.from(lagTotals.entries())
      .map(([lagDay, importance]) => ({
        importance: importance / Math.max(lagCounts.get(lagDay) ?? 1, 1),
        lagDay,
      }))
      .sort((left, right) => left.lagDay - right.lagDay),
    lookbackLabel,
    model,
    sampleLagSignal,
    sampleSignal,
  };
}

function buildLinearLookbackSummary(summaries) {
  return summaries.map((summary) => ({
    lookback: summary.lookback,
    mean_abs_shap: formatNumber(summary.meanAbsShap),
    mean_sample_abs: formatNumber(summary.meanSampleAbs),
    model: summary.model,
    peak_abs_shap: formatNumber(summary.peakAbsShap),
    peak_sample_abs: formatNumber(summary.peakSampleAbs),
  }));
}

function buildLinearModelMetrics(summaries, focusLookback) {
  return summaries
    .filter((summary) => summary.lookbackLabel === focusLookback)
    .map((summary) => ({
      mean_abs_shap: formatNumber(summary.meanAbsShap),
      mean_sample_abs: formatNumber(summary.meanSampleAbs),
      model: summary.model,
      peak_abs_shap: formatNumber(summary.peakAbsShap),
      peak_sample_abs: formatNumber(summary.peakSampleAbs),
    }));
}

function buildLinearAttributionTrace(focusBundles) {
  const rows = [];
  const allSampleIds = Array.from(
    new Set(
      focusBundles.flatMap((bundle) => Array.from(bundle.sampleSignal.keys())),
    ),
  ).sort((left, right) => left - right);

  allSampleIds.forEach((sampleId) => {
    const bundleValues = focusBundles.map(
      (bundle) => bundle.sampleSignal.get(sampleId) ?? 0,
    );

    focusBundles.forEach((bundle) => {
      rows.push({
        sample: String(sampleId + 1),
        series: bundle.model,
        signal: formatNumber(bundle.sampleSignal.get(sampleId) ?? 0),
      });
    });

    rows.push({
      sample: String(sampleId + 1),
      series: "Family average",
      signal: formatNumber(average(bundleValues)),
    });
  });

  return rows;
}

function buildLinearLocalShap(focusModelBundle) {
  const sampleEntries = Array.from(focusModelBundle.sampleSignal.entries());
  const bullishSample = sampleEntries.reduce((best, current) =>
    current[1] > best[1] ? current : best,
  );
  const bearishSample = sampleEntries.reduce((best, current) =>
    current[1] < best[1] ? current : best,
  );

  return [
    ...formatLocalSampleRows(focusModelBundle, bullishSample[0], "Bullish sample"),
    ...formatLocalSampleRows(focusModelBundle, bearishSample[0], "Bearish sample"),
  ];
}

function formatLocalSampleRows(bundle, sampleId, caseLabel) {
  const lagMap = bundle.sampleLagSignal.get(sampleId) ?? new Map();

  return Array.from(lagMap.entries())
    .map(([lagDay, contribution]) => ({
      contribution,
      feature: `return_1d · lag ${lagDay}`,
    }))
    .sort((left, right) => Math.abs(right.contribution) - Math.abs(left.contribution))
    .slice(0, 10)
    .map((entry) => ({
      case: caseLabel,
      contribution: formatNumber(entry.contribution),
      feature: entry.feature,
    }));
}

function buildLinearLagImportance(focusBundles) {
  return focusBundles.flatMap((bundle) =>
    bundle.lagImportanceRows.map((row) => ({
      importance: formatNumber(row.importance),
      lag_day: String(row.lagDay),
      model: bundle.model,
    })),
  );
}

function buildLinearFeatureImportance(summaries) {
  return summaries
    .flatMap((summary) =>
      summary.lagImportanceRows.map((row) => ({
        feature: `${summary.model} · ${summary.lookbackLabel} · L${row.lagDay}`,
        importance: row.importance,
      })),
    )
    .sort((left, right) => right.importance - left.importance)
    .slice(0, 10)
    .map((row) => ({
      feature: row.feature,
      importance: formatNumber(row.importance),
    }));
}

function buildLinearGoldAudit(summaries) {
  return LINEAR_MODELS.flatMap((model) => {
    const modelSummaries = summaries.filter((summary) => summary.model === model);
    const availableFeatures = new Set(
      modelSummaries.flatMap((summary) => summary.features),
    );
    const activeFeatures = new Set(
      modelSummaries.flatMap((summary) => summary.nonzeroFeatures),
    );

    return LINEAR_FEATURE_GROUPS.map((group) => {
      let status = 0;

      if (group.features.some((feature) => availableFeatures.has(feature))) {
        status = 1;
      }

      if (group.features.some((feature) => activeFeatures.has(feature))) {
        status = 2;
      }

      return {
        feature: group.label,
        model,
        status: String(status),
      };
    });
  });
}

async function buildModelFeatureFamily(focusLookback, shapByModel) {
  const linearRows = [];

  for (const model of LINEAR_MODELS) {
    const filePath = join(rawDir, "shap_results", focusLookback, `${model}_shap_values.csv`);
    const familyTotals = new Map(
      LINEAR_FAMILY_HEATMAP_GROUPS.map((group) => [group.family, 0]),
    );
    let totalAbs = 0;

    await streamCsvRows(filePath, (row) => {
      const absValue = Math.abs(Number(row.shap_value));

      if (!Number.isFinite(absValue)) {
        return;
      }

      totalAbs += absValue;

      const group = LINEAR_FAMILY_HEATMAP_GROUPS.find((entry) =>
        entry.features.includes(row.feature),
      );

      if (!group) {
        return;
      }

      familyTotals.set(group.family, (familyTotals.get(group.family) ?? 0) + absValue);
    });

    LINEAR_FAMILY_HEATMAP_GROUPS.forEach((group) => {
      const importance = familyTotals.get(group.family) ?? 0;
      linearRows.push({
        family: group.family,
        importance: formatNumber(importance),
        model,
        share: formatNumber(totalAbs === 0 ? 0 : importance / totalAbs),
      });
    });
  }

  return [...linearRows, ...buildTreeFeatureFamily(shapByModel)];
}

function buildTreeModelMetrics(notebook) {
  const outputText = notebook.cells
    .flatMap((cell) => cell.outputs ?? [])
    .flatMap((output) => output.text ?? [])
    .join("\n");

  return TREE_MODELS.flatMap((model) => {
    const pattern = new RegExp(
      `------ Training ${model} ------[\\s\\S]*?RMSE:\\s*([\\-\\d.]+)[\\s\\S]*?MAE:\\s*([\\-\\d.]+)[\\s\\S]*?R2:\\s*([\\-\\d.]+)[\\s\\S]*?Direction Accuracy:\\s*([\\-\\d.]+)`,
    );
    const match = outputText.match(pattern);

    if (!match) {
      return [];
    }

    return [
      {
        direction_acc: match[4],
        mae: match[2],
        model,
        r2: match[3],
        rmse: match[1],
      },
    ];
  }).sort((left, right) => Number(left.rmse) - Number(right.rmse));
}

function buildTreeFeatureImportance(shapByModel) {
  return TREE_MODELS.flatMap((model) => {
    const ranked = rankFeatures(shapByModel[model]).slice(0, 12);
    return ranked.map((entry, index) => ({
      feature: entry.feature,
      importance: formatNumber(entry.importance),
      model,
      rank: String(index + 1),
    }));
  });
}

function buildTreeFeatureFamily(shapByModel) {
  return TREE_MODELS.flatMap((model) => {
    const ranked = rankFeatures(shapByModel[model]);
    const importanceMap = new Map(ranked.map((entry) => [entry.feature, entry.importance]));
    const total = ranked.reduce((sum, entry) => sum + entry.importance, 0);

    return Array.from(TREE_FAMILIES.entries()).map(([family, features]) => {
      const importance = features.reduce(
        (sum, feature) => sum + (importanceMap.get(feature) ?? 0),
        0,
      );
      return {
        family,
        importance: formatNumber(importance),
        model,
        share: formatNumber(importance / total),
      };
    });
  });
}

function buildTreeFeatureRankHeatmap(shapByModel) {
  const rankings = Object.fromEntries(
    TREE_MODELS.map((model) => [model, rankFeatures(shapByModel[model])]),
  );
  const averageImportance = new Map();

  TREE_MODELS.forEach((model) => {
    rankings[model].forEach((entry) => {
      averageImportance.set(
        entry.feature,
        (averageImportance.get(entry.feature) ?? 0) + entry.importance / TREE_MODELS.length,
      );
    });
  });

  const selectedFeatures = Array.from(averageImportance.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 10)
    .map(([feature]) => feature);

  return TREE_MODELS.flatMap((model) =>
    selectedFeatures.map((feature) => {
      const rank = rankings[model].findIndex((entry) => entry.feature === feature) + 1;
      const importance = rankings[model][rank - 1]?.importance ?? 0;

      return {
        feature,
        importance: formatNumber(importance),
        model,
        rank: String(rank),
      };
    }),
  );
}

function buildTreeLocalShap(rows, stockDates) {
  const cases = [
    { sampleIndex: 316 },
    { sampleIndex: 644 },
  ];

  return cases.flatMap((entry) => {
    const row = rows[entry.sampleIndex];
    const totalContribution = Object.entries(row)
      .filter(([feature]) => feature !== "sample_index")
      .reduce((sum, [, value]) => sum + Number(value), 0);
    const caseLabel = totalContribution >= 0 ? "Bullish sample" : "Bearish sample";
    const features = Object.entries(row)
      .filter(([feature]) => feature !== "sample_index")
      .map(([feature, value]) => ({
        contribution: Number(value),
        feature,
      }))
      .sort((left, right) => Math.abs(right.contribution) - Math.abs(left.contribution))
      .slice(0, 10);

    return features.map((featureEntry, index) => ({
      case: caseLabel,
      contribution: formatNumber(featureEntry.contribution),
      date: stockDates[entry.sampleIndex] ?? "",
      feature: featureEntry.feature,
      model: "LightGBM",
      rank: String(index + 1),
      sample_index: String(entry.sampleIndex),
    }));
  });
}

function buildTreeGoldSummary(shapByModel) {
  return TREE_MODELS.map((model) => {
    const ranked = rankFeatures(shapByModel[model]);
    const goldRank = ranked.findIndex((entry) => entry.feature === "gold_return") + 1;
    const goldValues = shapByModel[model]
      .map((row) => Number(row.gold_return))
      .filter((value) => Number.isFinite(value));
    const positiveCount = goldValues.filter((value) => value > 0).length;
    const negativeCount = goldValues.filter((value) => value < 0).length;

    return {
      mean_abs_shap: formatNumber(average(goldValues.map((value) => Math.abs(value)))),
      mean_shap: formatNumber(average(goldValues)),
      model,
      negative_share: formatNumber(negativeCount / goldValues.length),
      positive_share: formatNumber(positiveCount / goldValues.length),
      rank: String(goldRank),
    };
  });
}

function buildMonthEndSeries(rows) {
  const monthly = new Map();
  const sorted = rows
    .filter((row) => Number.isFinite(row.value) && row.date)
    .sort((left, right) => left.date.localeCompare(right.date));

  sorted.forEach((row) => {
    monthly.set(row.date.slice(0, 7), {
      date: row.date.slice(0, 7),
      value: row.value,
    });
  });

  return Array.from(monthly.values());
}

function formatIndexedSeries(series, rows) {
  if (!rows.length) {
    return [];
  }

  const baseValue = rows[0].value;
  return rows.map((row) => ({
    date: row.date,
    index_value: formatNumber((row.value / baseValue) * 100),
    series,
  }));
}

function parseImportedQuoteFile(filePath) {
  return parseCsvFile(filePath)
    .map((row) => ({
      date: normalizeImportedDate(row["Ngày"]),
      value: parseImportedNumber(row["Lần cuối"]),
    }))
    .filter((row) => row.date && Number.isFinite(row.value));
}

function rankFeatures(rows) {
  const features = Object.keys(rows[0]).filter((feature) => feature !== "sample_index");

  return features
    .map((feature) => ({
      feature,
      importance: average(rows.map((row) => Math.abs(Number(row[feature])))),
    }))
    .sort((left, right) => right.importance - left.importance);
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

function normalizeImportedDate(value) {
  if (!value) {
    return "";
  }

  const [day, month, year] = value.split("/");
  if (!day || !month || !year) {
    return "";
  }

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function parseImportedNumber(value) {
  if (!value) {
    return Number.NaN;
  }

  return Number(String(value).replaceAll(",", "").trim());
}

function formatNumber(value) {
  return Number(value).toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
}

function parseCsvFile(filePath) {
  const contents = readFileSync(filePath, "utf8").trim();
  const [headerLine, ...lines] = contents.split(/\r?\n/);
  const headers = parseCsvLine(headerLine).map(stripBom);

  return lines
    .filter(Boolean)
    .map((line) => {
      const values = parseCsvLine(line);
      return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    });
}

function parseCsvLine(line) {
  const values = [];
  let buffer = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === "\"") {
      if (inQuotes && nextCharacter === "\"") {
        buffer += "\"";
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      values.push(buffer);
      buffer = "";
      continue;
    }

    buffer += character;
  }

  values.push(buffer);
  return values;
}

function writeCsv(filePath, rows, headers) {
  const lines = [headers.join(",")];

  rows.forEach((row) => {
    lines.push(
      headers
        .map((header) => {
          const value = row[header] ?? "";
          const normalized = String(value);
          if (/[",\n]/.test(normalized)) {
            return `"${normalized.replaceAll("\"", "\"\"")}"`;
          }
          return normalized;
        })
        .join(","),
    );
  });

  writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

async function streamCsvRows(filePath, onRow) {
  const lineReader = createInterface({
    crlfDelay: Infinity,
    input: createReadStream(filePath, { encoding: "utf8" }),
  });
  let headers = null;

  for await (const line of lineReader) {
    if (!line.trim()) {
      continue;
    }

    if (!headers) {
      headers = parseCsvLine(line).map(stripBom);
      continue;
    }

    const values = parseCsvLine(line);
    const row = Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    );
    onRow(row);
  }
}

function stripBom(value) {
  return value.replace(/^\uFEFF/, "");
}
