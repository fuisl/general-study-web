import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { CitationItem, FootnoteItem, ReportMeta, SourceItem } from "@repo/report-ui";

export const reportMeta: ReportMeta = {
  university: "Vietnamese - German University",
  department: "Department of Computer Science",
  reportLabel: "Final Report",
  title: "Predicting and Explaining Stock Prices with Machine Learning: A SHAP-Based Study on FPT Stock",
  dek: "An educational study using fake but internally consistent stock-market data to compare forecasting models and explain predictions with SHAP, with special attention to whether gold price contributes useful predictive signal.",
  authors: [
    { name: "Bui Duc Xuan", studentId: "10422085" },
    { name: "Truong Hao Nhien", studentId: "10422062" },
    { name: "Tran Hai Duong", studentId: "10422050" },
  ],
  affiliation: "Vietnamese - German University",
  supervisor: "Dr. Dinh Hai Dung",
  published: "Mar. 11, 2026",
  abstract:
    "This report studies how machine learning can be used to forecast FPT stock prices while remaining interpretable enough for finance students and practitioners. The reported figures are rendered from illustrative CSV datasets prepared for this template, so the visualizations are real even though the underlying values are synthetic.",
  toc: [
    { id: "introduction", label: "Introduction" },
    { id: "background", label: "Background Concepts" },
    { id: "background-ml", label: "Time-Series Forecasting" },
    { id: "shap", label: "Explainable AI and SHAP" },
    { id: "data", label: "Data Collection and Processing" },
    { id: "applying-shap", label: "Applying SHAP to the Model" },
    { id: "interpreting", label: "Interpreting SHAP Values" },
    { id: "results", label: "Results" },
    { id: "research-questions", label: "Research Question Analysis" },
    { id: "why-shap", label: "Why SHAP is Valuable for Finance" },
    { id: "sources", label: "References and Notes" },
    { id: "conclusion", label: "Conclusion" },
  ],
};

export const citationItems: CitationItem[] = loadCitationItems();

export const footnoteItems: FootnoteItem[] = [
  {
    id: "synthetic-signal",
    index: 1,
    text:
      "The gold series used in this template is illustrative only. It exists to demonstrate how an external macro feature could be discussed before real experimental outputs are available.",
  },
];

export const sourceItems: SourceItem[] = [
  {
    title: "FPT stock dataset (template placeholder)",
    detail:
      "Replace the synthetic price series in apps/web/public/data with your cleaned historical FPT market data.",
  },
  {
    title: "Gold price series (template placeholder)",
    detail:
      "Replace the synthetic gold signal with the external commodity series or macro indicator used in your experiment.",
  },
  {
    title: "SHAP",
    detail:
      "Lundberg and Lee's SHAP framework remains the conceptual basis for the explanatory analysis in this report.",
    href: "https://shap.readthedocs.io/",
  },
  {
    title: "Distill references",
    detail:
      "The layout structure of this template borrows article and navigation ideas from the Distill guide and template.",
    href: "https://distill.pub/guide/",
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
