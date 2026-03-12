import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { CitationItem, FootnoteItem, ReportMeta, SourceItem } from "@repo/report-ui";

export const reportMeta: ReportMeta = {
  university: "Vietnamese - German University",
  department: "Department of Computer Science",
  reportLabel: "Final Report",
  title: "Predicting and Explaining Stock Prices with Machine Learning: A SHAP-Based Study on FPT Stock",
  dek: "A dual-family report that pairs Linear, DLinear, and NLinear with DeepExplainer, then adds LightGBM, RandomForest, and XGBoost baselines interpreted through TreeExplainer.",
  authors: [
    { name: "Bui Duc Xuan", studentId: "10422085" },
    { name: "Truong Hao Nhien", studentId: "10422062" },
    { name: "Tran Hai Duong", studentId: "10422021" },
  ],
  affiliation: "Vietnamese - German University",
  supervisor: "Dr. Dinh Hai Dung",
  published: "Mar. 11, 2026",
  abstract:
    "This report keeps the FPT-focused presentation, but the current workspace now exposes two complementary evidence streams: linear-family report exports already prepared for the main study, and tree-based baseline exports rebuilt from the banking-and-gold notebook in the repository. The article therefore separates shared data figures, DeepExplainer results for Linear, DLinear, and NLinear, and TreeExplainer baselines for RandomForest, XGBoost, and LightGBM.",
  toc: [
    { id: "introduction", label: "Introduction" },
    { id: "data-features", label: "Data and Feature Engineering" },
    { id: "model-families", label: "Model Families" },
    { id: "deep-explainer", label: "DeepExplainer for Linears" },
    { id: "tree-explainer", label: "TreeExplainer for Trees" },
    { id: "research-questions", label: "Research Question Analysis" },
    { id: "conclusion", label: "Conclusion" },
    { id: "sources", label: "References and Notes" },
  ],
};

export const citationItems: CitationItem[] = loadCitationItems();

export const footnoteItems: FootnoteItem[] = [
  {
    id: "gold-proxy",
    index: 1,
    text:
      "The shared market-context figures rebuild the exported gold_return signal exactly as it exists in the workspace. It should be read as the currently available gold proxy rather than a cleaned standalone commodity benchmark.",
  },
];

export const sourceItems: SourceItem[] = [
  {
    title: "Linear-family report exports",
    detail:
      "The Linear, DLinear, and NLinear figures come from the current CSV bundle in apps/web/public/data.",
  },
  {
    title: "Banking-and-gold notebook exports",
    detail:
      "The tree-family baselines and shared data figures are rebuilt from apps/web/public/data/raw and the notebook outputs stored in content/general_study_banking_gold_ML.ipynb.",
  },
  {
    title: "SHAP and Explainers",
    detail:
      "DeepExplainer is retained for the linear family and TreeExplainer is used for the tree baselines, while the article keeps the shared SHAP vocabulary for both groups.",
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
