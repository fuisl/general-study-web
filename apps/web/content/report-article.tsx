import {
  ArticleSection,
  CsvFigure,
  FigureFrame,
  ReportShell,
  SourceList,
} from "@repo/report-ui";
import { reportMeta, sourceItems } from "../data/report";

export function ReportArticle() {
  return (
    <ReportShell meta={reportMeta}>
      <ArticleSection
        id="overview"
        title="Write the argument in plain language."
        lede="The Distill references work because the page stays calm. The text establishes the claim, the figure shows the mechanism, and the interaction only asks the reader to inspect the data more closely."
      >
        <p>
          This template uses the same basic rhythm. The article remains a simple
          authored file, while the chart component is reusable. That keeps the
          narrative easy to edit without turning the layout into a pile of custom
          one-off blocks.
        </p>
        <p>
          The first job of the page is orientation. Tell the reader what changed,
          what the chart represents, and why the interaction is worth touching.
          Save exhaustive notes for the appendix or linked sources.
        </p>
        <aside className="article-callout">
          Put CSV files in <code>apps/web/public/data</code>. Because they are
          just static assets, the same figure component works in local
          development, static export, and Vercel hosting.
        </aside>
      </ArticleSection>

      <FigureFrame
        id="explore"
        caption="The sample chart reads a CSV file from the public folder, lets you switch axes, and can filter or compare series without leaving the article."
        label="Interactive figure"
        lane="page"
        title="Render an interactive diagram directly from CSV."
      >
        <CsvFigure
          defaultColor="cohort"
          defaultView="line"
          defaultX="month"
          defaultY="score"
          src="/data/sample-study.csv"
        />
      </FigureFrame>

      <ArticleSection
        id="reading"
        title="Keep the interaction close to the claim."
        lede="Interactive figures help when they reveal one comparison at a time. The control surface should be small enough that a reader can understand it at a glance."
      >
        <p>
          The example data is intentionally tidy: one row per month and cohort,
          with several numeric measures. That makes the chart flexible without
          making the controls noisy. For real reports, tidy CSV exports are much
          easier to reuse than wide spreadsheet tables.
        </p>
        <p>
          When you replace the sample data, write the caption declaratively.
          Tell the reader what pattern to look for before they start interacting.
          Distill-style interaction is strongest when it sharpens the argument
          instead of creating a separate exploratory tool inside the article.
        </p>
      </ArticleSection>

      <ArticleSection
        id="authoring"
        title="Author the story and the figure separately."
        lede="The article should stay legible as prose. The figure should stay reusable as a component. That separation is the most useful lesson to borrow from Distill."
      >
        <p>
          Edit the page narrative in <code>apps/web/content/report-article.tsx</code>.
          Drop new CSV files into <code>apps/web/public/data</code>. Then point
          the chart at the new file and choose the default columns you want the
          reader to see first.
        </p>
        <p>
          The component loads the CSV on the client, so the site still exports as
          static HTML and works cleanly on Vercel. You keep the speed of a static
          site while preserving lightweight interaction for report diagrams.
        </p>
      </ArticleSection>

      <ArticleSection
        id="sources"
        title="Keep the trail back to the source material."
        lede="The article is more trustworthy when the reader can see where the layout ideas came from and where the data files live."
      >
        <p>
          Replace these links with your appendix, dashboard, paper set, or data
          room. If the report is presented live, this section also makes the page
          usable after the meeting without a second deck.
        </p>
        <SourceList items={sourceItems} />
      </ArticleSection>
    </ReportShell>
  );
}
