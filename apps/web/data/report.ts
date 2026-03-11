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

export const citationItems: CitationItem[] = [
  {
    id: "fama-1970",
    index: 1,
    authors: "Fama, E. F.",
    title: "Efficient Capital Markets: A Review of Theory and Empirical Work",
    venue: "The Journal of Finance",
    year: "1970",
    note:
      "A foundational reference for the debate over whether market prices already reflect available information.",
    bibtex: `@article{fama1970efficient,
  author = {Fama, Eugene F.},
  title = {Efficient Capital Markets: A Review of Theory and Empirical Work},
  journal = {The Journal of Finance},
  year = {1970},
  volume = {25},
  number = {2},
  pages = {383--417}
}`,
  },
  {
    id: "lim-2021",
    index: 2,
    authors: "Lim, B. and Zohren, S.",
    title: "Time-Series Forecasting With Deep Learning: A Survey",
    venue: "Philosophical Transactions of the Royal Society A",
    year: "2021",
    note:
      "A survey summarizing how neural models are used for sequential prediction tasks and the tradeoffs they introduce.",
    bibtex: `@article{lim2021timeseries,
  author = {Lim, Bryan and Zohren, Stefan},
  title = {Time-Series Forecasting With Deep Learning: A Survey},
  journal = {Philosophical Transactions of the Royal Society A},
  year = {2021},
  volume = {379},
  number = {2194},
  pages = {20200209}
}`,
  },
  {
    id: "lundberg-2017",
    index: 3,
    authors: "Lundberg, S. M. and Lee, S.-I.",
    title: "A Unified Approach to Interpreting Model Predictions",
    venue: "Advances in Neural Information Processing Systems",
    year: "2017",
    note:
      "The original SHAP paper that frames feature attribution through additive explanations and Shapley values.",
    bibtex: `@inproceedings{lundberg2017unified,
  author = {Lundberg, Scott M. and Lee, Su-In},
  title = {A Unified Approach to Interpreting Model Predictions},
  booktitle = {Advances in Neural Information Processing Systems},
  year = {2017},
  pages = {4765--4774}
}`,
    href: "https://proceedings.neurips.cc/paper_files/paper/2017/hash/8a20a8621978632d76c43dfd28b67767-Abstract.html",
  },
];

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
