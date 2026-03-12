import {
  ArticleSection,
  CsvFigure,
  FootnoteList,
  FigureFrame,
  HeatmapFigure,
  InlineCitation,
  InlineFootnote,
  RankedBarFigure,
  ReferenceList,
  ReportShell,
  TimelineFigure,
} from "@repo/report-ui";
import { citationItems, footnoteItems, reportMeta } from "../data/report";

export function ReportArticle() {
  return (
    <ReportShell meta={reportMeta}>
      <ArticleSection
        id="introduction"
        title="Introduction"
        lede="Stock-price forecasting becomes more useful when the model family, the predictive result, and the explanation all remain visible at the same time. This report therefore presents a dual-family view instead of a single leaderboard."
      >
        <p>
          Traditional stock-forecasting studies often present one model family
          at a time. That hides an important distinction: some models are chosen
          because they are sequence-native and easy to pair with local
          explanations, while others are included as strong nonlinear baselines
          that stress-test the feature set itself.
          <InlineCitation item={citationItems[0]} />
        </p>
        <p>
          The current workspace contains both of those strands. The authored
          report bundle preserves the main <strong>Linear / DLinear / NLinear</strong>{" "}
          study and its <strong>DeepExplainer</strong> outputs, while the raw
          banking-and-gold notebook exports add <strong>RandomForest</strong>,{" "}
          <strong>XGBoost</strong>, and <strong>LightGBM</strong> baselines with{" "}
          <strong>TreeExplainer</strong>. Bringing the two families together
          creates a fuller picture, but only if the article keeps their evidence
          streams separate rather than flattening them into one metric table.
          <InlineCitation item={citationItems[1]} />
        </p>
        <p>
          This report therefore uses shared data figures up front, then splits
          the modeling and explanation story into two tracks: DeepExplainer for
          the linear family and TreeExplainer for the tree baselines. The gold
          signal is shown exactly as it is currently exported in the workspace
          <InlineFootnote item={footnoteItems[0]} />, and the later research
          section compares how each family treats it.
          <InlineCitation item={citationItems[2]} />
        </p>
        <ol className="article-list">
          <li>
            <strong>Research Question 1.</strong> Which feature patterns recur
            across DeepExplainer and TreeExplainer, and which are specific to
            only one model family?
          </li>
          <li>
            <strong>Research Question 2.</strong> Does gold stay secondary
            across both families, or does its importance strengthen once the
            model class changes?
          </li>
        </ol>
      </ArticleSection>

      <FigureFrame
        caption="Both series are rebased to 100 at the first available month. The chart is used as a shared context view only: it sits before the report splits into linear-family and tree-family evidence."
        label="Shared data"
        lane="screen"
        title="The available workspace already combines a rebased stock basket and an exported gold proxy."
      >
        <CsvFigure
          controls={[]}
          defaultColor="series"
          defaultView="line"
          defaultX="date"
          defaultY="index_value"
          showLegend
          src="/data/market-context.csv"
        />
      </FigureFrame>

      <ArticleSection
        id="data-features"
        title="Data and Feature Engineering"
        lede="Before the report reaches any model, the shared pipeline has already defined the sequence target, engineered the main indicators, and fixed the chronological split used across the exported workspace."
      >
        <p>
          The raw market table still follows the familiar financial layout:
          date, open, high, low, close, and volume. From there, the pipeline
          derives return horizons, moving-average variants, volatility measures,
          and volume-flow signals. Those derived variables become the common
          substrate for both model families even if the later explainers differ.
        </p>
        <p>
          The figure sequence below focuses on what is shared. The indicator
          overlay shows how the recent price path is smoothed into trend
          features, the horizon profile shows how dispersion grows as the target
          moves further into the future, and the split timeline makes the
          chronological evaluation boundary explicit.
        </p>
      </ArticleSection>

      <FigureFrame
        caption="The final year of the exported dataset is shown so the trend estimators stay readable. KAMA, EMA, and SMA compress the raw movement into smoother trajectories that can later be interpreted by either explainer family."
        label="Shared data"
        lane="page"
        title="The engineered features begin with trend-following views of the same underlying price path."
      >
        <CsvFigure
          controls={[]}
          defaultColor="series"
          defaultView="line"
          defaultX="date"
          defaultY="value"
          showLegend
          src="/data/technical-indicators.csv"
        />
      </FigureFrame>

      <FigureFrame
        caption="The target remains multi-step even before any model is selected. Standard deviation grows steadily from day 1 to day 7, while the positive-share curve remains comparatively stable."
        label="Shared data"
        lane="body"
        title="The forecasting target becomes more dispersed as the prediction horizon moves further out."
      >
        <CsvFigure
          controls={["y"]}
          defaultView="line"
          defaultX="horizon_day"
          defaultY="std_return"
          showLegend={false}
          src="/data/forecast-horizon-profile.csv"
        />
      </FigureFrame>

      <FigureFrame
        caption="The split is chronological rather than random. This is the shared evaluation backbone for the workspace, even though the model families are exported from different result bundles."
        label="Shared data"
        lane="page"
        title="The report keeps training, validation, and test windows in explicit time order."
      >
        <TimelineFigure
          endKey="end_date"
          label="Chronological split"
          labelKey="split"
          src="/data/dataset-split.csv"
          startKey="start_date"
          valueKey="observations"
        />
      </FigureFrame>

      <ArticleSection
        id="model-families"
        title="Model Families"
        lede="The six-model story works only when the two families are read in parallel. The linear family remains the main forecasting track, while the tree family acts as a nonlinear baseline that tests the same feature space from a different inductive bias."
      >
        <p>
          The <strong>linear family</strong> consists of Linear, DLinear, and
          NLinear. Their exported figures remain framed as the main forecasting
          study, which is why they carry lookback selection, prediction traces,
          and gold-ablation results.
        </p>
        <p>
          The <strong>tree family</strong> consists of RandomForest, XGBoost,
          and LightGBM. These baselines come from the raw notebook outputs in
          the workspace. They do not currently include the same prediction-trace
          bundle, but they do provide real summary metrics and full SHAP exports
          through TreeExplainer.
        </p>
        <p>
          Because the currently available metrics live on different target and
          scale conventions, the report does not place all six models on one
          shared RMSE axis. Instead, each family is summarized inside its own
          panel and then compared qualitatively in the research-question
          section.
        </p>
      </ArticleSection>

      <FigureFrame
        caption="The linear family remains the primary forecasting track. The metric selector can switch between RMSE, MAE, and MAPE without mixing these values with the tree-baseline scale."
        label="Linear family"
        lane="body"
        title="Linear, DLinear, and NLinear are evaluated together as the main forecasting family."
      >
        <CsvFigure
          controls={["y"]}
          defaultView="bar"
          defaultX="model"
          defaultY="rmse"
          showLegend={false}
          src="/data/linear-model-metrics.csv"
        />
      </FigureFrame>

      <FigureFrame
        caption="These values come from the notebook output already stored in the repository. They are shown as a separate baseline family rather than as a direct continuation of the linear-family leaderboard."
        label="Tree family"
        lane="body"
        title="RandomForest, XGBoost, and LightGBM provide a nonlinear benchmark on the exported feature table."
      >
        <CsvFigure
          controls={["y"]}
          defaultView="bar"
          defaultX="model"
          defaultY="rmse"
          showLegend={false}
          src="/data/tree-model-metrics.csv"
        />
      </FigureFrame>

      <FigureFrame
        caption="The linear-family trace is kept intact from the authored report bundle. It remains useful because it shows how the main study presents actual-versus-forecast movement rather than summary error alone."
        label="Linear family"
        lane="screen"
        title="The sequence-model track still includes an explicit prediction trace against the observed path."
      >
        <CsvFigure
          controls={[]}
          defaultColor="series"
          defaultView="line"
          defaultX="day"
          defaultY="price"
          showLegend
          src="/data/linear-prediction-trace.csv"
        />
      </FigureFrame>

      <ArticleSection
        id="deep-explainer"
        title="DeepExplainer for Linear Models"
        lede="The linear family keeps the original interpretability frame: DeepExplainer is used to open the model, compare lookback choices, and summarize both local and global attribution patterns."
      >
        <p>
          In the sequence-model track, the report still centers the explanatory
          analysis on the linear-family results bundle. The lookback curve is
          used to justify the selected configuration, the local explanation
          contrasts bullish and bearish samples, and the lag summary makes the
          temporal shape of the forecast explicit.
        </p>
        <p>
          This section deliberately remains faithful to the authored linear
          study: the point is not to replace DeepExplainer, but to keep it as
          one half of the dual-family story and then read TreeExplainer beside
          it rather than instead of it.
        </p>
      </ArticleSection>

      <FigureFrame
        caption="The validation curve is kept exactly in the linear-family track because it is the result-bundle artifact that determines which lookback window later receives the detailed DeepExplainer treatment."
        label="Linear family"
        lane="page"
        title="The main sequence-model study still selects its lookback window before explanation."
      >
        <CsvFigure
          controls={["y"]}
          defaultColor="model"
          defaultView="line"
          defaultX="lookback"
          defaultY="rmse"
          showLegend
          src="/data/linear-lookback-validation.csv"
        />
      </FigureFrame>

      <FigureFrame
        caption="The ranked bars preserve the original DeepExplainer local-view idea, but the interaction is cleaner here because the bullish and bearish cases are switched explicitly rather than averaged together."
        label="Linear family"
        lane="page"
        title="DeepExplainer makes the local contribution pattern legible one sample at a time."
      >
        <RankedBarFigure
          defaultGroup="Bullish sample"
          groupKey="case"
          label="Linear-family local SHAP"
          labelKey="feature"
          limit={10}
          mode="diverging"
          src="/data/linear-local-shap.csv"
          valueKey="contribution"
        />
      </FigureFrame>

      <FigureFrame
        caption="Lag importance stays unique to the linear-family explanation track because it summarizes how DeepExplainer attributes a sequence model across the lookback window."
        label="Linear family"
        lane="page"
        title="The lag curve shows how temporal importance decays across forecast horizons."
      >
        <CsvFigure
          controls={[]}
          defaultColor="horizon"
          defaultView="line"
          defaultX="lag_day"
          defaultY="importance"
          showLegend
          src="/data/linear-lag-importance.csv"
        />
      </FigureFrame>

      <FigureFrame
        caption="The global DeepExplainer ranking remains the simplest summary for the sequence-model family: it collapses local attribution patterns into one ordered list of recurring drivers."
        label="Linear family"
        lane="page"
        title="The sequence-model family still resolves into a compact global importance ordering."
      >
        <RankedBarFigure
          label="Linear-family feature importance"
          labelKey="feature"
          limit={10}
          mode="positive"
          src="/data/linear-feature-importance.csv"
          valueKey="importance"
        />
      </FigureFrame>

      <ArticleSection
        id="tree-explainer"
        title="TreeExplainer for Tree Baselines"
        lede="The tree-family baselines are not substitutes for the linear study; they are a second explanatory lens. They show how the same exported feature table behaves once the model class is allowed to be nonlinear from the start."
      >
        <p>
          TreeExplainer is applied to the three tree models already present in
          the raw workspace exports. These baselines do not reproduce the
          linear-family lag curves, but they do provide real local SHAP vectors,
          stable global rankings, and a feature-family heatmap that is useful
          for checking whether the nonlinear models focus on the same parts of
          the input space.
        </p>
        <p>
          In the current export bundle, LightGBM is used as the primary local
          example because its SHAP rows are fully available and its importance
          profile sits close to the best tree-family summary metric. The other
          two tree models remain visible in the global and family-level views.
        </p>
      </ArticleSection>

      <FigureFrame
        caption="The local TreeExplainer view is built directly from the exported LightGBM SHAP rows. The bullish and bearish samples are fixed so the interaction stays deterministic."
        label="Tree family"
        lane="page"
        title="TreeExplainer exposes how one positive and one negative tree-based forecast are assembled."
      >
        <RankedBarFigure
          defaultGroup="Bullish sample"
          groupKey="case"
          label="Tree-family local SHAP"
          labelKey="feature"
          limit={10}
          mode="diverging"
          src="/data/tree-local-shap.csv"
          valueKey="contribution"
        />
      </FigureFrame>

      <FigureFrame
        caption="The grouped ranking comes from mean absolute SHAP values per model. Switching between LightGBM, XGBoost, and RandomForest shows whether the same features stay near the top under different nonlinear learners."
        label="Tree family"
        lane="page"
        title="The tree baselines produce a full global importance ranking rather than a single anecdotal explanation."
      >
        <RankedBarFigure
          defaultGroup="LightGBM"
          groupKey="model"
          label="Tree-family feature importance"
          labelKey="feature"
          limit={12}
          mode="positive"
          src="/data/tree-feature-importance.csv"
          valueKey="importance"
        />
      </FigureFrame>

      <FigureFrame
        caption="The heatmap aggregates SHAP values into fixed feature families. Reading it row-wise is more useful than reading it as a winner-takes-all chart because it shows where the three models agree and where they diverge."
        label="Tree family"
        lane="page"
        title="TreeExplainer reveals that return-history families dominate, while volume, volatility, and gold remain secondary but persistent."
      >
        <HeatmapFigure
          label="Tree-family feature family heatmap"
          src="/data/tree-feature-family.csv"
          valueKey="share"
          xKey="model"
          yKey="family"
        />
      </FigureFrame>

      <ArticleSection
        id="research-questions"
        title="Research Question Analysis"
        lede="The dual-family structure is most useful here. The report can now compare what DeepExplainer and TreeExplainer agree on, and what each family treats differently."
      >
        <h3>Using SHAP to identify important features</h3>
        <p>
          The linear family emphasizes recent lags and moving-average structure
          because its explanatory view is built around temporal position as well
          as feature identity. The tree family strips away that sequence framing
          and asks a different question: once the same engineered table is fed
          into nonlinear baselines, which variables still rise to the top?
        </p>
        <p>
          Across the current exports, the answer is not random. Short- and
          medium-horizon return features remain central, volatility stays
          visible, and the gold signal rarely disappears entirely. That overlap
          is why the report treats explainability as a cross-family pattern
          rather than as one model&apos;s anecdote.
        </p>
      </ArticleSection>

      <FigureFrame
        caption="Ranks are shown instead of raw importance so the three tree models can be compared on the same visual footing. Lower ranks are stronger, which is why darker cells represent more prominent features here."
        label="Tree family"
        lane="page"
        title="The tree models still agree on a compact set of high-priority return features."
      >
        <HeatmapFigure
          label="Tree-family rank heatmap"
          reverseScale
          src="/data/tree-feature-rank-heatmap.csv"
          valueKey="rank"
          xKey="model"
          yKey="feature"
        />
      </FigureFrame>

      <section className="article-section l-body">
        <h3>Can gold price be used as an indicator?</h3>
        <p>
          The current workspace gives two different answers, and both are worth
          keeping. In the linear family, the authored ablation figure shows a
          modest but consistent improvement when gold is included. In the tree
          family, gold is evaluated through SHAP rank and sign balance rather
          than through a saved ablation run.
        </p>
        <p>
          Taken together, that supports a balanced interpretation: gold is not
          the dominant driver in either family, but it remains too visible to be
          dismissed as irrelevant noise. The two figures below are deliberately
          separate because they answer the question in different explanatory
          languages.
        </p>
      </section>

      <FigureFrame
        caption="The linear-family bundle already contains an explicit with-gold versus without-gold comparison. It remains the clearest direct answer for the main FPT-style track."
        label="Linear family"
        lane="page"
        title="Within the sequence-model family, adding gold remains a modest but repeatable improvement."
      >
        <CsvFigure
          controls={["y"]}
          defaultColor="scenario"
          defaultView="line"
          defaultX="model"
          defaultY="rmse"
          showLegend
          src="/data/linear-gold-ablation.csv"
        />
      </FigureFrame>

      <FigureFrame
        caption="The tree-family view summarizes how much absolute SHAP weight gold receives, what rank it holds inside each model, and how often its contribution is positive versus negative."
        label="Tree family"
        lane="body"
        title="Across the tree baselines, gold stays visible but clearly secondary to the main return features."
      >
        <CsvFigure
          controls={["y"]}
          defaultView="bar"
          defaultX="model"
          defaultY="mean_abs_shap"
          showLegend={false}
          src="/data/tree-gold-summary.csv"
        />
      </FigureFrame>

      <ArticleSection
        id="conclusion"
        title="Conclusion"
        lede="The value of the current workspace is not that it forces one winner. It is that it lets the report keep its main linear-family study while also exposing a second, tree-based explanatory baseline."
      >
        <p>
          The combined article now uses everything that is currently available.
          Shared figures come directly from the exported stock table, the main
          sequence-model story keeps its DeepExplainer artifacts, and the tree
          family adds a real TreeExplainer baseline without pretending to live
          on the same error scale.
        </p>
        <p>
          That structure makes the report more defensible. The linear family
          still carries the main forecasting narrative, the tree family tests
          whether the engineered features survive a nonlinear benchmark, and the
          research-question section compares patterns rather than flattening
          unlike quantities into one chart. The next step is not to change the
          structure again, but simply to replace each family&apos;s CSV bundle with
          cleaner final exports as they become available.
        </p>
      </ArticleSection>

      <section className="backmatter l-page" id="sources">
        <div className="backmatter__row">
          <h2 className="backmatter__label">Footnotes</h2>
          <div className="backmatter__content">
            <FootnoteList items={footnoteItems} />
          </div>
        </div>

        <div className="backmatter__row">
          <h2 className="backmatter__label">References</h2>
          <div className="backmatter__content">
            <ReferenceList items={citationItems} />
          </div>
        </div>
      </section>
    </ReportShell>
  );
}
