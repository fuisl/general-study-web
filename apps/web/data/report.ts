import { readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  CitationItem,
  FootnoteItem,
  InteractiveTableColumn,
  ReportMeta,
  SourceItem,
} from "@repo/report-ui";

export const reportMeta: ReportMeta = {
  university: "Vietnamese - German University",
  department: "Department of Computer Science",
  reportLabel: "Final Report",
  title:
    "Predicting and Explaining Stock Prices with Machine Learning: A SHAP-Based Study on the Banking Sector Index",
  dek:
    "An educational report on how SHAP can be used to interpret machine learning models built on an equal-weighted Vietnamese banking sector index and an additional gold signal.",
  authors: [
    { name: "Bui Duc Xuan", studentId: "10422085" },
    { name: "Truong Hao Nhien", studentId: "10422062" },
    { name: "Tran Hai Duong", studentId: "10422050" },
  ],
  affiliation: "Vietnamese - German University",
  supervisor: "Dr. Dinh Hai Dung",
  published: "Mar. 12, 2026",
  abstract:
    "This report studies how machine learning models and SHAP-based interpretability can be applied to a Banking Sector Index constructed from Vietcombank, VietinBank, BIDV, MBBank, and Sacombank. The objective is educational: to show how predictive performance, technical indicators, and explanation methods can be examined together in a financial forecasting context.",
  toc: [
    { id: "introduction", label: "Introduction" },
    { id: "background-concepts", label: "Background Concepts" },
    { id: "time-series-forecasting", label: "Machine Learning for Time-Series Forecasting" },
    { id: "technical-indicators", label: "Technical Indicators in Finance" },
    { id: "explainable-ai-shap", label: "Explainable AI and SHAP" },
    { id: "data-collection-processing", label: "Data Collection and Processing" },
    { id: "sources", label: "References" },
  ],
};

export const citationItems: CitationItem[] = loadCitationItems();

export const footnoteItems: FootnoteItem[] = [];

export const stockDatasetColumns: InteractiveTableColumn[] = [
  { key: "time", label: "time" },
  { key: "close", label: "close", align: "end" },
  { key: "open", label: "open", align: "end" },
  { key: "high", label: "high", align: "end" },
  { key: "low", label: "low", align: "end" },
  { key: "volume", label: "volume", align: "end" },
];

export const stockDatasetRows = [
  {
    close: "8197.0",
    high: "8260.6",
    low: "8197.0",
    open: "8197.0",
    time: "2015-01-05",
    volume: "87400.0",
  },
  {
    close: "8387.7",
    high: "8451.2",
    low: "8133.5",
    open: "8133.5",
    time: "2015-01-06",
    volume: "530810.0",
  },
  {
    close: "8641.8",
    high: "8641.8",
    low: "8324.1",
    open: "8387.7",
    time: "2015-01-07",
    volume: "1090000.0",
  },
  {
    close: "8641.8",
    high: "8768.9",
    low: "8514.7",
    open: "8641.8",
    time: "2015-01-08",
    volume: "1050000.0",
  },
  {
    close: "9213.7",
    high: "9213.7",
    low: "8641.8",
    open: "8641.8",
    time: "2015-01-09",
    volume: "4330000.0",
  },
];

export const indicatorTableColumns: InteractiveTableColumn[] = [
  { key: "indicator", label: "Indicator", width: "8rem" },
  { key: "category", label: "Category", width: "9rem" },
  { key: "description", label: "Description" },
];

export const indicatorTableRows = [
  {
    category: "Momentum",
    description:
      "The Kaufman’s Adaptive Moving Average is a moving average that adjusts its sensitivity based on market volatility. It becomes smoother during noisy markets and more responsive during strong trends, helping reduce lag while filtering out noise.",
    indicator: "KAMA",
  },
  {
    category: "Momentum",
    description:
      "The Simple Moving Average (SMA) is a technical indicator used to determine whether the price of an asset will continue or reverse its uptrend or downtrend.",
    indicator: "SMA",
  },
  {
    category: "Momentum",
    description:
      "The HLC3 is a simple technical indicator that calculates the average of the High, Low, and Close prices of a specific period. It’s often used as a smoothing technique to reduce price volatility.",
    indicator: "HLC3",
  },
  {
    category: "Trend",
    description:
      "The Exponential Moving Average (EMA) places more emphasis on the latest data points, allowing for quicker responses to current information.",
    indicator: "EMA",
  },
  {
    category: "Trend",
    description:
      "The Hull Moving Average (HMA) is a sophisticated technical indicator designed to swiftly identify emerging trends and potential trading opportunities.",
    indicator: "HMA",
  },
  {
    category: "Trend",
    description:
      "The Triple Exponential Moving Average (TEMA) is designed to reduce lag by combining multiple exponential moving averages. It responds more quickly to price changes than standard EMAs while maintaining smoothness.",
    indicator: "TEMA",
  },
  {
    category: "Trend",
    description:
      "The Fibonacci Weighted Moving Average assigns progressively higher weights to more recent observations, making the indicator more sensitive to recent price movements.",
    indicator: "FWMA",
  },
  {
    category: "Volatility",
    description:
      "The Average True Range (ATR) measures price volatility, larger true ranges usually indicate strong back-and-forth movements.",
    indicator: "ATR",
  },
  {
    category: "Volatility",
    description:
      "The Bollinger Bands Lower Band, calculated as a moving average minus a multiple of the standard deviation, represents a lower boundary where prices may be considered relatively oversold.",
    indicator: "BBL",
  },
  {
    category: "Volume",
    description:
      "The On Balance Volume (OBV) is a cumulative volume-based indicator that adds volume on up days and subtracts volume on down days. It is used to measure buying and selling pressure and detect potential trend changes.",
    indicator: "OBV",
  },
  {
    category: "Volume",
    description:
      "The Price Volume Trend is a momentum-based indicator that measures the buying and selling pressure in the market by combining price and volume data. It helps identify potential trend reversals and confirms existing trends.",
    indicator: "PVT",
  },
];

export const sourceItems: SourceItem[] = [
  {
    title: "Report article shell",
    detail:
      "The current article uses Distill-inspired layout patterns for a static, citation-aware report presentation.",
  },
];

type BibEntry = {
  fields: Record<string, string>;
  key: string;
};

function loadCitationItems() {
  const filePath = join(process.cwd(), "data", "references.bib");
  const contents = readFileSync(filePath, "utf8");
  return parseBibFile(contents).map((entry, index) => ({
    id: entry.key,
    index: index + 1,
    authors: entry.fields.author ?? "",
    title: entry.fields.title ?? entry.key,
    detail: buildReferenceDetail(entry.fields),
    year: entry.fields.year ?? "",
    note: entry.fields.preview,
    href: entry.fields.url,
    linkLabel: entry.fields.linklabel ?? "link",
  }));
}

function parseBibFile(contents: string) {
  const entryPattern = /@\w+\s*\{\s*([^,]+),([\s\S]*?)\n\}/g;
  const fieldPattern = /(\w+)\s*=\s*"([\s\S]*?)"\s*,?/g;
  const entries: BibEntry[] = [];

  for (const match of contents.matchAll(entryPattern)) {
    const key = match[1].trim();
    const body = match[2];
    const fields: Record<string, string> = {};

    for (const fieldMatch of body.matchAll(fieldPattern)) {
      fields[fieldMatch[1].toLowerCase()] = fieldMatch[2].replace(/\s+/g, " ").trim();
    }

    entries.push({ fields, key });
  }

  return entries;
}

function buildReferenceDetail(fields: Record<string, string>) {
  const source = fields.journal ?? fields.booktitle ?? fields.publisher ?? "";
  const volume = fields.volume
    ? `Vol. ${fields.volume}${fields.number ? `(${fields.number})` : ""}`
    : "";
  const pages = fields.pages ? `pp. ${fields.pages}` : "";
  const doi = fields.doi ? `DOI: ${fields.doi}` : "";
  const pieces = [fields.author, fields.year, source, volume, pages, doi].filter(Boolean);

  return pieces.join(". ").replace(/\. pp\./g, ", pp.");
}
