import type { ReportMeta, SourceItem } from "@repo/report-ui";

export const reportMeta: ReportMeta = {
  kicker: "Distill-Inspired Report Template",
  title: "A Simpler Article Shell for Interactive Reports",
  dek: "This template keeps the page quiet and lets the figures do the explanatory work. The prose stays narrow, the figures can expand into a wider lane, and CSV-backed charts remain interactive on a static export.",
  authors: "Your Name or Team",
  date: "March 11, 2026",
  abstract:
    "Use this as a presentable report page rather than a slide deck. Write the argument in a single article file, place reusable figures in the shared UI package, and serve CSV files as static assets so Vercel can host the whole site on its free tier.",
  toc: [
    { id: "overview", label: "Overview" },
    { id: "explore", label: "Interactive Figure" },
    { id: "reading", label: "Reading the Figure" },
    { id: "authoring", label: "Authoring" },
    { id: "sources", label: "Sources" },
  ],
};

export const sourceItems: SourceItem[] = [
  {
    title: "Distill Guide",
    detail:
      "Reference for article rhythm, layout lanes, and the idea of combining narrative text with interactive figures.",
    href: "https://distill.pub/guide/",
  },
  {
    title: "Distill Template",
    detail:
      "Reference for the separation between authored article structure and reusable figure components.",
    href: "https://github.com/distillpub/template",
  },
  {
    title: "Sample CSV dataset",
    detail:
      "Replace the example file in apps/web/public/data with your own tidy CSV exports.",
  },
];
