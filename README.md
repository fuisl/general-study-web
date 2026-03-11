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

## GitHub Actions CI/CD

The pipeline is defined in [ci-cd.yml](/Users/fuisloy/general-study-web/.github/workflows/ci-cd.yml).

- On `pull_request` to `main`: runs `pnpm typecheck` and `pnpm build:web`
- On `push` to `main`: runs CI, then deploys to Vercel (if secrets are set)
- Manual run is also supported via `workflow_dispatch`

## Vercel Free Hosting Setup

The app already uses `output: "export"` in Next.js, so Vercel free hosting works well.

### 1) Create the Vercel project

Import this repo in Vercel and use:

- Framework Preset: `Other`
- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm build:web`
- Output Directory: `apps/web/out`

The repo includes `vercel.json` with these same values so both Vercel UI deploys and GitHub Actions deploys use the same build/output settings.

### 2) Get Vercel IDs for GitHub Actions deploy

Run locally once:

```bash
pnpm dlx vercel login
pnpm dlx vercel link
cat .vercel/project.json
```

Copy `orgId` and `projectId` from `.vercel/project.json`.

### 3) Add GitHub repository secrets

In GitHub: `Settings -> Secrets and variables -> Actions`, add:

- `VERCEL_TOKEN` (create in Vercel: Account Settings -> Tokens)
- `VERCEL_ORG_ID` (from `.vercel/project.json`)
- `VERCEL_PROJECT_ID` (from `.vercel/project.json`)

### 4) Deploy flow

- Push to `main`
- GitHub Actions runs CI
- If CI passes, the workflow runs `vercel pull`, `vercel build`, and `vercel deploy --prebuilt` for production

If the three Vercel secrets are missing, CI still runs and deploy is skipped.
