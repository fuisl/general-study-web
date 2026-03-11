# Distill-Inspired Report Template

A static long-form report template built with Turborepo and Next.js. The layout now stays much closer to Distill's quieter article style: narrow text, wider figure lanes, and simple interactive figures backed by CSV files.

## Stack

- `pnpm` workspace
- `turbo` for orchestration
- `Next.js` static export in `apps/web`
- Shared article components in `packages/report-ui`
- CSV-backed interactive chart component for report figures

## Run

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

The static site is exported to [apps/web/out](/Users/fuisloy/general-study-web/apps/web/out).

## Edit

- Author the narrative in [apps/web/content/report-article.tsx](/Users/fuisloy/general-study-web/apps/web/content/report-article.tsx)
- Change page metadata and source links in [apps/web/data/report.ts](/Users/fuisloy/general-study-web/apps/web/data/report.ts)
- Adjust the shared shell in [packages/report-ui/src/report-shell.tsx](/Users/fuisloy/general-study-web/packages/report-ui/src/report-shell.tsx)
- Reuse or extend the CSV chart in [packages/report-ui/src/csv-figure.tsx](/Users/fuisloy/general-study-web/packages/report-ui/src/csv-figure.tsx)
- Put CSV files in [apps/web/public/data](/Users/fuisloy/general-study-web/apps/web/public/data)

## CSV Figures

The example article uses a client-side CSV figure so the site stays statically exportable.

```tsx
<CsvFigure
  src="/data/sample-study.csv"
  defaultX="month"
  defaultY="score"
  defaultColor="cohort"
  defaultView="line"
/>
```

Use tidy CSVs when possible: one row per observation, one column per variable. That keeps the chart controls simple.

## Vercel

The app already uses `output: "export"` in Next.js, so it can be hosted as static files.

- Install Command: `pnpm install`
- Build Command: `pnpm build:web`
- Output Directory: `apps/web/out`

This works on Vercel's free hosting and still keeps Turborepo in the build path.
