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
  SmallMultiplesFigure,
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
          The current workspace contains both of those strands. The linear side
          now comes directly from the raw <strong>DeepExplainer</strong> export
          folders for <strong>Linear / DLinear / NLinear</strong>, while the
          banking-and-gold notebook exports add <strong>RandomForest</strong>,{" "}
          <strong>XGBoost</strong>, and <strong>LightGBM</strong> baselines
          interpreted through <strong>TreeExplainer</strong>. Bringing the two
          families together creates a fuller picture, but only if the article
          keeps their evidence streams separate rather than flattening them into
          one metric table.
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
        caption="The chart overlays the banking basket, the five constituent bank price series, and gold. Every line is rebased to 100 at the first shared month so relative movement stays comparable before the article splits into linear-family and tree-family evidence."
        label="Shared data"
        lane="screen"
        title="The available workspace now combines the banking basket, its five constituent banks, and gold in one shared market view."
      >
        <CsvFigure
          chartConfig={{
            height: 440,
            lineWidth: 2,
            maxXTicks: 10,
            maxYTicks: 5,
            pointRadius: 2.2,
            rotateXLabels: false,
            showPoints: false,
            width: 980,
            xTickFormat: "ym",
          }}
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
        lane="screen"
        title="The engineered features begin with trend-following views of the same underlying price path."
      >
        <CsvFigure
          chartConfig={{
            height: 440,
            lineWidth: 1.9,
            maxXTicks: 6,
            maxYTicks: 5,
            pointRadius: 2.4,
            rotateXLabels: false,
            showPoints: false,
            width: 980,
            xTickFormat: "ym",
          }}
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
        caption="The target remains multi-step even before any model is selected. Dispersion, range, and average return all widen as the horizon extends, while the positive-share curve moves more gradually."
        label="Shared data"
        lane="page"
        title="The forecasting target becomes more dispersed as the prediction horizon moves further out."
      >
        <SmallMultiplesFigure
          chartConfig={{
            height: 220,
            lineWidth: 2,
            maxXTicks: 4,
            maxYTicks: 4,
            pointRadius: 3,
            showPoints: true,
          }}
          metrics={[
            { key: "mean_return", label: "Mean return" },
            { key: "std_return", label: "Std. deviation" },
            { key: "positive_share", label: "Positive share" },
            { key: "range_return", label: "Return range" },
          ]}
          src="/data/forecast-horizon-profile.csv"
          xKey="horizon_day"
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
          NLinear. The raw export gives four DeepExplainer history windows for
          each model, so the linear-family figures below are rebuilt around
          explanation structure: window summaries, sample-level signed traces,
          local lag decompositions, and lag rankings.
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
        caption="These bars summarize the strongest normalized DeepExplainer window rather than forecast RMSE. The selector switches between mean sample |SHAP|, peak cell |SHAP|, and normalized mean |SHAP| so the three linear models can still be compared on one axis."
        label="Linear family"
        lane="body"
        title="Within the most concentrated DeepExplainer window, NLinear carries the strongest attribution signal."
      >
        <CsvFigure
          controls={["y"]}
          defaultView="bar"
          defaultX="model"
          defaultY="mean_sample_abs"
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
        caption="Each line is the signed SHAP sum across all lags and features for one explained sample in the 7-day linear bundle. The family-average trace is added as a reference so the shared turning points stay visible."
        label="Linear family"
        lane="screen"
        title="The sample-wise attribution trace shows where the three linear models turn bullish or bearish."
      >
        <CsvFigure
          chartConfig={{
            height: 430,
            lineWidth: 2.1,
            maxXTicks: 8,
            maxYTicks: 5,
            pointRadius: 2.6,
            rotateXLabels: false,
            showPoints: false,
            width: 980,
          }}
          controls={[]}
          defaultColor="series"
          defaultView="line"
          defaultX="sample"
          defaultY="signal"
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
          In the rebuilt sequence-model track, the explanatory analysis now
          starts from the four saved DeepExplainer window bundles themselves.
          The first comparison asks which history window concentrates the most
          normalized attribution mass, then the later plots zoom into the
          7-day bundle where that concentration is strongest.
        </p>
        <p>
          That makes the linear side more honest: instead of relying on hidden
          placeholder validation tables, this section stays with the DeepExplainer
          artifacts that are actually saved to disk, including local sample
          decompositions and lag-level importance curves.
        </p>
      </ArticleSection>

      <FigureFrame
        caption="The selector compares four raw DeepExplainer windows across the three linear models. Normalized mean |SHAP| is the fairest default because it compares windows of very different lengths without rewarding them merely for having more lags."
        label="Linear family"
        lane="page"
        title="The raw linear export spans four history windows, and the 7-day bundle is the most concentrated."
      >
        <CsvFigure
          controls={["y"]}
          defaultColor="model"
          defaultView="line"
          defaultX="lookback"
          defaultY="mean_abs_shap"
          showLegend
          src="/data/linear-lookback-validation.csv"
        />
      </FigureFrame>

      <FigureFrame
        caption="The local view uses the strongest model-window bundle: NLinear with a 7-day history. Each bar is one lag-specific return contribution, so the bullish and bearish samples can be read as explicit temporal stacks rather than as a blended feature list."
        label="Linear family"
        lane="page"
        title="DeepExplainer makes the dominant lag contributions legible one sample at a time."
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
        caption="These lines come from the same 7-day bundle used for the local view. They average absolute lag contribution across samples so the three linear models can be compared on the same temporal axis."
        label="Linear family"
        lane="page"
        title="Within the 7-day bundle, the models agree that only a handful of recent lags dominate."
      >
        <CsvFigure
          controls={[]}
          defaultColor="model"
          defaultView="line"
          defaultX="lag_day"
          defaultY="importance"
          showLegend
          src="/data/linear-lag-importance.csv"
        />
      </FigureFrame>

      <FigureFrame
        caption="Because the exported linear SHAP tables activate only one raw feature, the global ranking is expressed as model-window-lag combinations rather than as many distinct variables. That still reveals which bundles and lag positions repeatedly concentrate the family’s explanatory mass."
        label="Linear family"
        lane="page"
        title="Across all linear bundles, a small set of lag positions carries most of the attribution weight."
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
          The linear family now speaks almost entirely through temporal
          position. In the saved DeepExplainer export, only <code>return_1d</code>
          carries nonzero attribution, so the main question becomes which lags
          of that return signal dominate each model and history window. The
          tree family strips away that sequence framing and asks a different
          question: once the same engineered table is fed into nonlinear
          baselines, which variables still rise to the top?
        </p>
        <p>
          Across the current exports, the answer is still not random. Return
          information dominates both families, but the tree models keep a wider
          surrounding cast of volatility, volume, and gold features visible,
          while the linear export collapses to a much narrower single-feature
          story. That contrast is why the report treats explainability as a
          cross-family pattern rather than as one model&apos;s anecdote.
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
          The current workspace gives one direct answer and one audit. In the
          tree family, gold is evaluated through SHAP rank and sign balance. In
          the raw linear DeepExplainer export, gold is not present in the saved
          feature set at all, so the linear side can only answer by showing that
          absence explicitly.
        </p>
        <p>
          Taken together, that yields a narrower but cleaner interpretation. The
          current linear bundle cannot support a gold claim because the variable
          never enters the saved DeepExplainer tensors, while the tree family
          shows that gold is secondary but nonzero once it is actually present.
        </p>
      </section>

      <FigureFrame
        caption="Status 2 means present and active in SHAP, 1 means present but zero throughout the saved export, and 0 means absent. Gold is absent across all three linear models, while only return_1d receives nonzero attribution."
        label="Linear family"
        lane="page"
        title="Within the saved linear export, gold is absent rather than merely weak."
      >
        <HeatmapFigure
          label="Linear-family feature audit"
          src="/data/linear-gold-ablation.csv"
          valueKey="status"
          xKey="model"
          yKey="feature"
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
          Shared figures come directly from the exported stock table, the linear
          story is rebuilt directly from raw DeepExplainer windows, and the tree
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
