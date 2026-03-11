import {
  ArticleSection,
  CsvFigure,
  FootnoteList,
  FigureFrame,
  InlineCitation,
  InlineFootnote,
  ReferenceList,
  ReportShell,
} from "@repo/report-ui";
import { citationItems, footnoteItems, reportMeta } from "../data/report";

export function ReportArticle() {
  return (
    <ReportShell meta={reportMeta}>
      <ArticleSection
        id="introduction"
        title="Introduction"
        lede="Stock-price prediction is a familiar financial problem, but model accuracy alone is not enough when the goal is to understand why a forecast changes. This report therefore combines forecasting with explainability."
      >
        <p>
          Traditional approaches to stock forecasting rely on statistical models,
          financial indicators, and expert interpretation. Machine learning adds
          another layer by detecting nonlinear patterns in large datasets, but it
          often introduces a tradeoff: a model can be accurate while still
          remaining opaque.<InlineCitation item={citationItems[0]} />
        </p>
        <p>
          For finance students and practitioners, that opacity is a practical
          limitation. A model that predicts tomorrow&apos;s FPT price is only useful
          if the analyst can also explain which variables contributed to that
          forecast and whether those drivers make economic sense.
          <InlineCitation item={citationItems[1]} />
        </p>
        <p>
          This study therefore introduces <span className="inline-highlight">SHAP</span>,
          a widely used explainable-AI technique that attributes part of a
          prediction to each input feature.<InlineCitation item={citationItems[2]} />
          Using historical FPT-style stock data together with a{" "}
          <span className="inline-highlight">synthetic gold signal</span>
          <InlineFootnote item={footnoteItems[0]} />, we train several
          time-series forecasting models and interpret them through SHAP.
        </p>
        <ol className="article-list">
          <li>
            <strong>Research Question 1.</strong> How can SHAP be applied to
            machine-learning models for stock-price prediction to determine which
            factors contribute most to the model&apos;s predictions?
          </li>
          <li>
            <strong>Research Question 2.</strong> Can the price of gold be used
            as a useful feature or indicator when predicting FPT stock prices?
          </li>
        </ol>
        <aside className="article-callout">
          The numeric results shown in this template are intentionally fake but
          internally consistent. Every chart is still rendered from real CSV
          files so you can replace them directly with your own final outputs.
        </aside>
      </ArticleSection>

      <FigureFrame
        caption="All three lines are indexed to 100 at the start of the study window so their movement can be compared directly. The pattern suggests that external market context belongs in the feature set even if it does not dominate the final forecast."
        label="Market context"
        lane="screen"
        title="FPT strengthened faster than both the VNIndex and gold across the template study period."
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
        id="background"
        title="Background Concepts"
        lede="The forecasting task combines conventional technical indicators with simple but effective sequence models. The goal is not to use the most complex architecture, but to build a model that is accurate enough to be worth explaining."
      >
        <h3>Technical Indicators in Finance</h3>
        <p>
          The input space begins with common stock-market variables such as open,
          high, low, close, and trading volume. From these raw values, the study
          derives technical indicators that summarize trend, momentum, and market
          pressure, including moving-average gaps, short-horizon returns, RSI,
          and rolling volatility.
        </p>
        <p>
          These indicators are useful because they transform raw price history
          into signals that are easier for a model to interpret. A persistent
          gap between price and moving average may reflect trend continuation,
          while high volatility may indicate instability rather than momentum.
        </p>
      </ArticleSection>

      <FigureFrame
        caption="The chart highlights three price-derived indicators that stay on a comparable scale. Additional features such as RSI, volatility, and gold return are used in the model but omitted here for visual clarity."
        label="Technical indicators"
        lane="page"
        title="The feature set starts with price trend rather than with raw price alone."
      >
        <CsvFigure
          controls={[]}
          defaultColor="series"
          defaultView="line"
          defaultX="day"
          defaultY="value"
          showLegend
          src="/data/technical-indicators.csv"
        />
      </FigureFrame>

      <ArticleSection title="Machine Learning for Time-Series Forecasting" id="background-ml">
        <p>
          Financial markets generate sequential data, so each day&apos;s observation
          depends on what came before it. This makes time-series forecasting
          different from ordinary supervised learning, where examples are often
          treated as independent. The model needs a lookback window that carries
          recent price history forward into the next prediction.
        </p>
        <p>
          Classical approaches such as ARIMA, linear regression, and VAR remain
          important because they are statistically grounded and easy to interpret.
          However, their assumptions about linearity and stationarity can become
          restrictive when market relationships turn nonlinear or interact across
          several features.
        </p>
        <p>
          For that reason, this report focuses on three lightweight neural
          baselines: Linear, DLinear, and NLinear. They are simpler than large
          recurrent models, train faster, and still provide a strong comparison
          space for an educational study.
        </p>
      </ArticleSection>

      <FigureFrame
        caption="Validation error improves as the lookback window grows from 30 to 120 days, then flattens or worsens. That is why the later SHAP analysis concentrates on the NLinear model with a 120-day input window."
        label="Model selection"
        lane="page"
        title="The 120-day lookback gives the strongest validation performance for NLinear in the synthetic experiment."
      >
        <CsvFigure
          controls={["y"]}
          defaultColor="model"
          defaultView="line"
          defaultX="lookback"
          defaultY="rmse"
          showLegend
          src="/data/lookback-validation.csv"
        />
      </FigureFrame>

      <ArticleSection
        id="shap"
        title="Explainable AI and SHAP"
        lede="The interpretability problem appears as soon as a model can produce a plausible forecast without revealing why the prediction changed. SHAP addresses that gap by turning each prediction into a set of feature contributions."
      >
        <p>
          Suppose a model predicts tomorrow&apos;s FPT closing price at 92.5. A
          conventional error metric can tell us whether that forecast was close
          to reality, but it cannot answer which recent lags, technical
          indicators, or external variables influenced the result.
        </p>
        <p>
          SHAP borrows the Shapley-value idea from cooperative game theory. In a
          cooperative game, each player contributes to a final payoff. In a
          predictive model, each feature contributes to the final prediction.
          SHAP estimates those contributions fairly and consistently.
        </p>
        <ul className="article-list">
          <li>It provides local explanations for individual predictions.</li>
          <li>It also provides global explanations across the full test set.</li>
          <li>It remains useful even when model behavior is nonlinear.</li>
        </ul>
      </ArticleSection>

      <FigureFrame
        caption="Positive values push the predicted price upward, while negative values push it downward. The figure can be switched between a bullish and a bearish sample to show how the explanatory pattern changes by case."
        label="Local explanation"
        lane="page"
        title="A SHAP contribution plot reveals which inputs moved one prediction up and another down."
      >
        <CsvFigure
          controls={[]}
          defaultColor="case"
          defaultView="bar"
          defaultX="feature"
          defaultY="contribution"
          showLegend
          src="/data/local-shap.csv"
        />
      </FigureFrame>

      <ArticleSection
        id="data"
        title="Data Collection and Processing"
        lede="The dataset used in this report follows the same structure as a conventional market CSV: date, open, high, low, close, and volume, followed by engineered technical and context features."
      >
        <p>
          In practice, the stock dataset is loaded from CSV and processed with
          Pandas before being converted into rolling windows for forecasting. The
          final feature matrix includes lagged prices, moving-average gaps,
          volatility estimates, volume ratios, and an external gold-return
          signal.
        </p>
        <p>
          The preprocessing pipeline keeps this stage intentionally short:
          missing values are removed, features are aligned by date, and the
          sequence is split chronologically into training, validation, and test
          partitions. This preserves the time order of the data and avoids
          leakage from future observations.
        </p>
        <ul className="article-list">
          <li>Date</li>
          <li>Opening price, highest price, lowest price, closing price</li>
          <li>Trading volume</li>
          <li>Derived technical indicators and external context variables</li>
        </ul>
      </ArticleSection>

      <FigureFrame
        caption="The template split is chronological rather than random, which is essential for time-series experiments. The same 14 engineered features are carried through every split."
        label="Processing summary"
        lane="body"
        title="The synthetic experiment uses a simple 60/20/20 chronological split."
      >
        <CsvFigure
          controls={["y"]}
          defaultView="bar"
          defaultX="split"
          defaultY="observations"
          showLegend={false}
          src="/data/dataset-split.csv"
        />
      </FigureFrame>

      <ArticleSection
        id="applying-shap"
        title="Applying SHAP to the Model"
        lede="After training the forecasting models, the study focuses on the best-performing NLinear specification and applies SHAP to explain the model at both local and global levels."
      >
        <p>
          The implementation uses <code>shap.DeepExplainer</code> with background
          data drawn from the training set. A small set of held-out test
          examples is then passed to the explainer so that SHAP values can be
          computed for each input position in the 120-day lookback window.
        </p>
        <ol className="article-list">
          <li>Select the trained NLinear model.</li>
          <li>Prepare background data from the training partition.</li>
          <li>Select test samples for explanation.</li>
          <li>Compute SHAP values and aggregate them by lag or by feature.</li>
        </ol>
        <p>
          This turns the model from a single forecasting engine into an
          explanatory system. Instead of asking only whether the prediction is
          accurate, the analysis can also ask which historical information the
          model relied on.
        </p>
      </ArticleSection>

      <FigureFrame
        caption="Recent lags dominate the explanation, especially for the one-step forecast. Longer-horizon predictions still use the immediate past, but their importance curve decays more gradually."
        label="Lag importance"
        lane="page"
        title="The model relies most heavily on the first few historical days in the lookback window."
      >
        <CsvFigure
          controls={[]}
          defaultColor="horizon"
          defaultView="line"
          defaultX="lag_day"
          defaultY="importance"
          showLegend
          src="/data/lag-importance.csv"
        />
      </FigureFrame>

      <ArticleSection
        id="interpreting"
        title="Interpreting SHAP Values"
        lede="SHAP values can be aggregated across samples, forecast horizons, or feature groups. In this report, the most useful summaries are lag importance and overall feature importance."
      >
        <p>
          Lag importance answers which historical positions matter most. Feature
          importance answers which variables matter most overall. The latter is
          especially useful for explaining whether the model is mostly reading
          price trend, momentum, liquidity, or external context.
        </p>
        <p>
          In the synthetic results below, lagged closing price and moving-average
          gap clearly dominate the explanatory ranking. Gold return appears lower
          in the hierarchy, but it remains above several secondary indicators,
          which makes it worth testing further in the research-question section.
        </p>
      </ArticleSection>

      <FigureFrame
        caption="The ranking is computed from mean absolute SHAP values. Price-based features dominate, but gold return still appears as a visible mid-tier contributor instead of disappearing entirely."
        label="Feature importance"
        lane="page"
        title="Global SHAP importance turns the model from a black box into a ranked list of drivers."
      >
        <CsvFigure
          controls={[]}
          defaultView="bar"
          defaultX="feature"
          defaultY="importance"
          showLegend={false}
          src="/data/feature-importance.csv"
        />
      </FigureFrame>

      <ArticleSection
        id="results"
        title="Results"
        lede="This section reports synthetic template results for layout purposes. The numbers are not empirical findings, but they are chosen to behave like a plausible forecasting experiment."
      >
        <p>
          The three baseline models produce a clear ordering. Linear offers the
          weakest fit, DLinear improves the error profile, and NLinear achieves
          the strongest overall results. The gap is visible both in summary
          metrics and in the final prediction trace.
        </p>
        <p>
          In this synthetic run, NLinear reaches an RMSE of 2.74, compared with
          3.21 for DLinear and 3.82 for Linear. That difference is large enough
          to justify centering the explanatory analysis on NLinear rather than on
          the simpler baselines.
        </p>
      </ArticleSection>

      <FigureFrame
        caption="Use the metric selector to switch between RMSE, MAE, and MAPE. NLinear remains the strongest model across all three summary measures in the template output."
        label="Performance metrics"
        lane="body"
        title="NLinear delivers the best aggregate forecasting accuracy in the synthetic comparison."
      >
        <CsvFigure
          controls={["y"]}
          defaultView="bar"
          defaultX="model"
          defaultY="rmse"
          showLegend={false}
          src="/data/model-metrics.csv"
        />
      </FigureFrame>

      <FigureFrame
        caption="The actual price path and the three model outputs are plotted over the final twelve test days. NLinear tracks the turning points more closely than the other baselines."
        label="Prediction trace"
        lane="screen"
        title="The strongest model stays closest to the observed FPT path at the end of the test period."
      >
        <CsvFigure
          controls={[]}
          defaultColor="series"
          defaultView="line"
          defaultX="day"
          defaultY="price"
          showLegend
          src="/data/prediction-trace.csv"
        />
      </FigureFrame>

      <ArticleSection
        id="research-questions"
        title="Research Question Analysis"
        lede="The two research questions can now be answered using the model metrics, lag patterns, and SHAP summaries shown above."
      >
        <h3>Using SHAP to identify important features</h3>
        <p>
          SHAP provides a systematic way to quantify which features move a
          prediction. In this project, the values are computed on the trained
          NLinear model and aggregated across samples and prediction horizons.
          The result is an interpretable ranking rather than a vague statement
          that the model &quot;used historical data.&quot;
        </p>
        <p>
          The template outcome is consistent across the different SHAP views:
          recent lagged closing prices, moving-average gap, and short-horizon
          returns dominate the explanation. This means the model behaves like a
          momentum-sensitive forecaster rather than a feature-agnostic black box.
        </p>
        <h3>Can gold price be used as an indicator?</h3>
        <p>
          Gold does not become the dominant explanatory factor, but it does not
          disappear either. In the synthetic SHAP ranking, gold return sits in
          the middle of the feature table. In the ablation test below, adding the
          gold feature reduces forecast error modestly across all three models.
        </p>
        <p>
          That leads to a balanced answer: gold appears useful as a supporting
          indicator, especially when combined with stock-specific trend features,
          but it does not replace the predictive value of recent FPT price
          history.
        </p>
      </ArticleSection>

      <FigureFrame
        caption="The chart compares each model with and without the synthetic gold feature. Error declines modestly in every case, which supports the claim that gold acts as a useful secondary indicator rather than a dominant driver."
        label="Gold feature test"
        lane="page"
        title="Adding gold improves the forecast slightly, but the gain stays incremental rather than transformative."
      >
        <CsvFigure
          controls={["y"]}
          defaultColor="scenario"
          defaultView="line"
          defaultX="model"
          defaultY="rmse"
          showLegend
          src="/data/gold-ablation.csv"
        />
      </FigureFrame>

      <ArticleSection
        id="why-shap"
        title="Why SHAP is Valuable for Finance"
        lede="Finance is rarely interested in prediction alone. Analysts also need to explain what moved the model and whether the explanation matches a plausible market story."
      >
        <p>
          Traditional tools such as correlation analysis, regression
          coefficients, and manual financial reasoning remain useful. However,
          they become less informative once the forecasting model includes
          nonlinear interactions or several overlapping technical indicators.
        </p>
        <p>
          SHAP helps because it measures each feature&apos;s marginal contribution to
          the final prediction. For finance students, that means a model output
          can be interpreted instead of merely accepted. The method also creates
          a bridge between quantitative prediction and domain-level explanation.
        </p>
        <ul className="article-list">
          <li>It supports model comparison beyond raw forecast error.</li>
          <li>It helps detect whether a model is over-relying on noisy features.</li>
          <li>It creates a clearer story for presentation and reporting.</li>
        </ul>
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

      <ArticleSection
        id="conclusion"
        title="Conclusion"
        lede="The main contribution of this report is not just a forecast, but a forecast that can be interrogated."
      >
        <p>
          This project demonstrates how machine learning and explainable AI can
          be combined in a finance setting. Even in a simplified educational
          setup, the workflow shows three useful outcomes: forecasting FPT-like
          stock prices, explaining those forecasts with SHAP, and evaluating the
          contribution of an external gold indicator.
        </p>
        <p>
          The synthetic results suggest that NLinear offers the strongest
          predictive performance in the chosen setup, that recent price history
          dominates the model&apos;s reasoning, and that gold contributes modestly
          rather than decisively. In a final real-data version of the project,
          these same visual structures can be reused with the actual metrics and
          explanations exported from your training pipeline.
        </p>
      </ArticleSection>
    </ReportShell>
  );
}
