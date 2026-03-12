import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = join(__dirname, "..");
const dataDir = join(appDir, "public", "data");
const rawDir = join(dataDir, "raw");
const notebookPath = join(appDir, "content", "general_study_banking_gold_ML.ipynb");

mkdirSync(dataDir, { recursive: true });

const LINEAR_FILE_MAP = new Map([
  ["lookback-validation.csv", "linear-lookback-validation.csv"],
  ["model-metrics.csv", "linear-model-metrics.csv"],
  ["prediction-trace.csv", "linear-prediction-trace.csv"],
  ["gold-ablation.csv", "linear-gold-ablation.csv"],
  ["local-shap.csv", "linear-local-shap.csv"],
  ["lag-importance.csv", "linear-lag-importance.csv"],
  ["feature-importance.csv", "linear-feature-importance.csv"],
]);

const TREE_MODELS = ["RandomForest", "XGBoost", "LightGBM"];
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

main();

function main() {
  const stockRows = parseCsvFile(join(rawDir, "stock_data.csv"));
  copyLinearFiles();
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

function copyLinearFiles() {
  for (const [sourceName, targetName] of LINEAR_FILE_MAP.entries()) {
    copyFileSync(join(dataDir, sourceName), join(dataDir, targetName));
  }
}

function buildMarketContext(rows) {
  const grouped = new Map();
  const firstClose = Number(rows[0].close);
  let goldIndex = 100;

  rows.forEach((row, index) => {
    if (index > 0) {
      goldIndex *= Math.exp(Number(row.gold_return));
    }

    const key = row.time.slice(0, 7);
    grouped.set(key, {
      bankingIndex: (Number(row.close) / firstClose) * 100,
      date: key,
      goldIndex,
    });
  });

  const monthlyEntries = Array.from(grouped.values());
  const baseBanking = monthlyEntries[0]?.bankingIndex ?? 100;
  const baseGold = monthlyEntries[0]?.goldIndex ?? 100;
  const output = [];
  for (const entry of monthlyEntries) {
    output.push({
      date: entry.date,
      index_value: formatNumber((entry.bankingIndex / baseBanking) * 100),
      series: "Banking basket",
    });
    output.push({
      date: entry.date,
      index_value: formatNumber((entry.goldIndex / baseGold) * 100),
      series: "Gold proxy",
    });
  }

  return output;
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
    { label: "Bullish sample", sampleIndex: 316 },
    { label: "Bearish sample", sampleIndex: 644 },
  ];

  return cases.flatMap((entry) => {
    const row = rows[entry.sampleIndex];
    const features = Object.entries(row)
      .filter(([feature]) => feature !== "sample_index")
      .map(([feature, value]) => ({
        contribution: Number(value),
        feature,
      }))
      .sort((left, right) => Math.abs(right.contribution) - Math.abs(left.contribution))
      .slice(0, 10);

    return features.map((featureEntry, index) => ({
      case: entry.label,
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

function formatNumber(value) {
  return Number(value).toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
}

function parseCsvFile(filePath) {
  const contents = readFileSync(filePath, "utf8").trim();
  const [headerLine, ...lines] = contents.split(/\r?\n/);
  const headers = parseCsvLine(headerLine);

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
