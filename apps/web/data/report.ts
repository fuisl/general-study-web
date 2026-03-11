import type { ReportMeta, SourceItem } from "@repo/report-ui";

export const reportMeta: ReportMeta = {
  university: "Vietnamese - German University",
  department: "Department of Computer Science",
  reportLabel: "Final Report",
  title: "Predicting and Explaining Stock Prices with Machine Learning: A SHAP-Based Study on FPT Stock",
  dek: "An educational study using fake but internally consistent stock-market data to compare forecasting models and explain predictions with SHAP, with special attention to whether gold price contributes useful predictive signal.",
  authors: [
    { name: "Bui Duc Xuan", studentId: "10422085" },
    { name: "Truong Hao Nhien", studentId: "10422062" },
    { name: "Tran Hai Duong", studentId: "10422021" },
  ],
  affiliation: "Vietnamese - German University",
  supervisor: "Dr. Dinh Hai Dung",
  published: "Mar. 11, 2026",
  abstract:
    "This report studies how machine learning can be used to forecast FPT stock prices while remaining interpretable enough for finance students and practitioners. The reported figures are rendered from illustrative CSV datasets prepared for this template, so the visualizations are real even though the underlying values are synthetic.",
  toc: [
    { id: "introduction", label: "1. Introduction" },
    { id: "background", label: "2. Background Concepts" },
    { id: "background-ml", label: "2.2. Time-Series Forecasting" },
    { id: "shap", label: "3. Explainable AI and SHAP" },
    { id: "data", label: "4. Data Collection and Processing" },
    { id: "applying-shap", label: "5. Applying SHAP to the Model" },
    { id: "interpreting", label: "6. Interpreting SHAP Values" },
    { id: "results", label: "7. Results" },
    { id: "research-questions", label: "8. Research Question Analysis" },
    { id: "why-shap", label: "10. Why SHAP is Valuable for Finance" },
    { id: "sources", label: "Sources" },
    { id: "conclusion", label: "11. Conclusion" },
  ],
};

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
