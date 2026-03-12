import {
  ArticleSection,
  CsvFigure,
  FigureFrame,
  HeatmapFigure,
  InlineCitation,
  InteractiveTable,
  RankedBarFigure,
  ReferenceList,
  ReportShell,
  SmallMultiplesFigure,
  TimelineFigure,
} from "@repo/report-ui";
import {
  citationItems,
  indicatorTableColumns,
  indicatorTableRows,
  reportMeta,
  stockDatasetColumns,
  stockDatasetRows,
} from "../data/report";

const citationById = Object.fromEntries(
  citationItems.map((item) => [item.id, item]),
);

export function ReportArticle() {
  return (
    <ReportShell meta={reportMeta}>
      <ArticleSection id="introduction" title="Introduction">
        <p>
          Stock price prediction has long been an important topic in finance.
          Traditional approaches typically rely on financial indicators,
          statistical models, and expert interpretation to estimate future price
          movements. While these methods provide structured analytical
          frameworks, they may struggle to capture complex nonlinear
          relationships present in financial markets. In recent years, machine
          learning techniques have increasingly been applied to financial
          prediction tasks because they can detect patterns in large datasets
          that may not be visible through conventional statistical analysis.
        </p>
        <p>
          Despite their predictive capabilities, many machine learning models
          introduce a significant limitation: lack of interpretability. Complex
          models such as ensemble methods or neural networks often behave as
          “black boxes,” producing predictions without providing clear
          explanations of the underlying reasoning. As a result, a model may
          generate accurate forecasts while still remaining opaque in terms of
          which input variables most strongly influenced the prediction.
        </p>
        <p>
          For finance students and practitioners, this opacity represents a
          practical challenge. Financial analysis is not solely concerned with
          generating predictions; it also requires understanding the economic
          drivers behind those predictions. A forecasting model that predicts
          tomorrow’s stock price is far more valuable if analysts can identify
          which factors contributed to the prediction and evaluate whether those
          factors are economically meaningful. Without such transparency, it
          becomes difficult to trust or interpret the model’s outputs.
        </p>
        <p>
          To address this limitation, this study introduces a method from
          Explainable Artificial Intelligence (XAI) known as SHAP (SHapley
          Additive exPlanations)
          <InlineCitation item={citationById["lundberg-2017"]} />. By
          decomposing predictions into feature-level contributions, SHAP
          provides insights into how machine learning models make decisions and
          which factors most strongly influence the output. Using historical
          stock data from the Banking Sector Index, constructed from five major
          Vietnamese commercial banks - Vietcombank (VCB), VietinBank (CTG),
          BIDV (BID), MBBank (MBB), and Sacombank (STB) - this study builds
          several time-series forecasting models and interprets their
          predictions through SHAP analysis. In addition to traditional
          financial features, the study also introduces a synthetic gold signal,
          representing gold price information, to examine whether gold prices
          may act as a useful external indicator for stock price movements.
        </p>
        <p>This research is guided by the following questions:</p>
        <ol className="article-list">
          <li>
            <strong>Research Question 1.</strong> How can SHAP be applied to
            machine learning models for stock price prediction to determine
            which factors contribute most to the model’s predictions?
          </li>
          <li>
            <strong>Research Question 2.</strong> Can the price of gold be used
            as a useful feature or indicator when predicting stock prices?
          </li>
        </ol>
        <p>
          The objective of this study is primarily educational. It aims to
          demonstrate how modern machine learning interpretability techniques
          can be applied in a financial context, allowing students and
          practitioners to better understand not only how predictive models
          perform but also why they produce certain predictions.
        </p>

        <FigureFrame
          caption="The shared market-context chart rebases the Banking Sector Index, its five constituent banks, and gold to a common base value of 100. This keeps the introductory market background aligned with the study context stated above."
          label="Introduction"
          lane="screen"
          title="The banking-sector index, its five constituent banks, and gold provide the common market context for the study."
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
            seriesStyleMap={{
              "Banking basket": {
                color: "#2457a6",
                drawOrder: 90,
                legendOrder: 1,
                lineWidth: 2.5,
                mutedColor: "rgba(88, 107, 140, 0.44)",
              },
              BID: {
                color: "#c8ccd1",
                drawOrder: 10,
                legendOrder: 3,
                lineWidth: 1.55,
                mutedColor: "rgba(200, 204, 209, 0.5)",
              },
              CTG: {
                color: "#cfc7bf",
                drawOrder: 11,
                legendOrder: 4,
                lineWidth: 1.55,
                mutedColor: "rgba(207, 199, 191, 0.5)",
              },
              Gold: {
                color: "#c59a16",
                drawOrder: 91,
                legendOrder: 2,
                lineWidth: 2.4,
                mutedColor: "rgba(165, 138, 55, 0.46)",
              },
              MBB: {
                color: "#cbc6d6",
                drawOrder: 12,
                legendOrder: 5,
                lineWidth: 1.55,
                mutedColor: "rgba(203, 198, 214, 0.5)",
              },
              STB: {
                color: "#d3cbb9",
                drawOrder: 13,
                legendOrder: 6,
                lineWidth: 1.55,
                mutedColor: "rgba(211, 203, 185, 0.5)",
              },
              VCB: {
                color: "#c4ccd8",
                drawOrder: 14,
                legendOrder: 7,
                lineWidth: 1.55,
                mutedColor: "rgba(196, 204, 216, 0.5)",
              },
            }}
            showLegend
            src="/data/market-context.csv"
          />
        </FigureFrame>
      </ArticleSection>

      <ArticleSection id="background-concepts" title="Background Concepts">
        <h3 id="time-series-forecasting">Machine Learning for Time-Series Forecasting</h3>
        <p>
          Financial markets naturally produce time-series data. In stock
          markets, prices are observed across trading days, and each
          observation—such as a daily closing price—is not independent. Instead,
          it is often influenced by previous market behavior and trends.
          Therefore, stock price prediction typically requires analyzing
          historical patterns over time rather than treating each data point as
          an isolated observation.
        </p>
        <p>
          Time-series forecasting therefore differs from traditional supervised
          learning tasks where observations are assumed to be independent. In
          this type of problems, models often rely on a lookback window, where
          information from previous time steps is used as input for predicting
          future values. This approach allows the model to capture dependencies
          and short-term trends in financial data.
        </p>
        <p>
          Before the widespread adoption of modern machine learning methods,
          researchers and financial analysts relied heavily on statistical
          time-series models to forecast financial variables. Common approaches
          include ARIMA (AutoRegressive Integrated Moving Average), linear
          regression, and Vector AutoRegression (VAR) models. These techniques
          are grounded in statistical theory and are specifically designed to
          model relationships between past and future observations. ARIMA
          models, in particular, have been widely applied for decades due to
          their mathematical simplicity and ability to model temporal
          dependencies in economic and financial data
          <InlineCitation item={citationById["kontopoulou-2023"]} />.
        </p>
        <p>
          However, traditional statistical models often rely on assumptions such
          as linearity, stationarity, and predefined relationships between
          variables. In real financial markets, price movements are influenced
          by many interacting factors, including macroeconomic indicators,
          investor sentiment, and global events. These interactions may lead to
          nonlinear patterns that are difficult to capture using classical
          statistical models. As a result, researchers have increasingly turned
          to machine learning approaches, which can learn complex relationships
          directly from data without requiring strong assumptions about the
          underlying structure of the time series
          <InlineCitation item={citationById["qian-2017"]} />.
        </p>
        <p>
          Despite their advantages, many advanced deep learning models—such as
          Recurrent Neural Networks (RNNs) or Long Short-Term Memory (LSTM)
          networks—can be computationally expensive and may require large
          datasets and significant training time. For educational or
          exploratory studies, simpler neural forecasting models can provide a
          practical alternative. Therefore, this report focuses on several
          lightweight neural baselines as they are simpler than large recurrent
          architectures, train faster, and still provide a meaningful
          comparison framework.
        </p>
        <p>
          To provide a broader comparison between neural and tree-based machine
          learning approaches, this study evaluates several commonly used models
          in time-series prediction and tabular machine learning. Each model
          represents a different modeling philosophy, ranging from simple linear
          projections to ensemble decision-tree methods widely used in applied
          machine learning.
        </p>
        <p>
          <strong>Linear Model</strong> – A simple linear forecasting model
          that predicts future values using a direct linear transformation of
          the historical lookback window. Although mathematically simple,
          linear models can provide strong baselines for time-series
          forecasting and help determine whether complex nonlinear architectures
          are necessary
          <InlineCitation item={citationById["zeng-2022"]} />.
        </p>
        <p>
          <strong>DLinear (Decomposition Linear Model)</strong> – DLinear
          separates the input time series into trend and seasonal components,
          then applies linear layers to each component independently. This
          decomposition allows the model to capture long-term trends while
          maintaining a lightweight architecture suitable for efficient training
          <InlineCitation item={citationById["zeng-2022"]} />.
        </p>
        <p>
          <strong>NLinear (Normalization Linear Model)</strong> – NLinear
          improves upon the simple linear model by normalizing the input
          sequence relative to the most recent observation before prediction.
          This helps stabilize training and allows the model to better adapt to
          shifting time-series levels
          <InlineCitation item={citationById["zeng-2022"]} />.
        </p>
        <p>
          <strong>Random Forest</strong> – Random Forest is an ensemble
          learning method that builds multiple decision trees using random
          subsets of data and features. The final prediction is obtained by
          averaging the outputs of the individual trees, which reduces
          overfitting and improves generalization performance
          <InlineCitation item={citationById["breiman-2001"]} />.
        </p>
        <p>
          <strong>XGBoost</strong> – Extreme Gradient Boosting (XGBoost) is a
          highly optimized gradient boosting algorithm that sequentially builds
          decision trees to minimize prediction errors. Due to its efficiency,
          scalability, and strong predictive performance, it has become one of
          the most widely used machine learning models in data science and
          financial prediction tasks
          <InlineCitation item={citationById["chen-2016"]} />.
        </p>
        <p>
          <strong>LightGBM</strong> – Light Gradient Boosting Machine
          (LightGBM) is another gradient boosting framework designed for high
          efficiency and scalability. It introduces techniques such as
          histogram-based learning and leaf-wise tree growth, enabling faster
          training and improved performance on large datasets
          <InlineCitation item={citationById["ke-2017"]} />.
        </p>
        <p>
          By comparing these models, the study aims to evaluate how different
          machine learning approaches—ranging from simple linear neural
          architectures to ensemble tree methods—perform in the context of
          financial time-series forecasting. This comparison also provides
          insight into the trade-offs between model complexity,
          interpretability, and predictive performance.
        </p>

        <FigureFrame
          caption="The target profile is shown as four small multiples so the effect of extending the forecast horizon stays visually explicit. It supports the lookback-window discussion in the time-series forecasting section."
          label="Background Concepts"
          lane="page"
          title="The forecasting target widens as the prediction horizon extends from day 1 to day 7."
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

        <h3 id="technical-indicators">Technical Indicators in Finance</h3>
        <p>
          In addition to research focusing on statistical and intelligent
          approaches for financial time series forecasting, especially in stock
          returns prediction, it is essential to apply a minimal number of input
          features when forecasting the market trends. Introducing more input
          features means increasing the dimensionality of the data, expanding
          its sparsity in the data space. This leads to the exponential
          acceleration of training data as more features are included to cover
          every combination of feature values. Hence, it is crucial to
          investigate the most significant technical indicators for predicting
          stock market trends. This enhances the predictive performance of
          machine learning (ML) models while simultaneously reducing analysis
          time and potential risks in stock market trading and investment. By
          emphasizing the most important indicators, traders can make more
          informed buy and sell decisions, which can ultimately lead to
          improved trading and investment outcomes. In this context, identifying
          key indicators for predicting the price movements of a banking sector
          index constructed from five major banks is important, as the index
          serves as a representative benchmark for Vietnam’s banking sector.
        </p>
        <p>
          To achieve this, we focused on the lagged returns and four main
          categories of indicators: volume, volatility, trend, and momentum. We
          aimed to identify the most significant indicators in each category,
          providing valuable insights into profitable technical indicators that
          have proven effective in forecasting the banking stock index.
          Furthermore, the analysis investigates whether returns from Gold
          Futures have any influence on the performance of the banking sector.
        </p>
        <p>
          The indicators in these four categories are selected based on a
          previous study that identified the most impactful technical indicators
          for the S&amp;P 500 Index. The selected indicators include:
        </p>

        <FigureFrame
          caption="The line overlay keeps the indicator discussion anchored to the underlying time series. It shows how the raw close is transformed into smoother technical signals before the wider feature table is assembled."
          label="Background Concepts"
          lane="screen"
          title="The technical-indicator layer begins by smoothing raw price behavior into trend-following signals."
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
          caption="The table preserves the indicator list from the report text while making it easier to filter by category or search by indicator name."
          label="Background Concepts"
          lane="screen"
          title="The selected indicators cover momentum, trend, volatility, and volume."
        >
          <InteractiveTable
            columns={indicatorTableColumns}
            filterKey="category"
            label="Technical indicator reference table"
            rows={indicatorTableRows}
            searchKeys={["indicator", "category", "description"]}
            searchPlaceholder="Search indicators or descriptions"
          />
        </FigureFrame>
      </ArticleSection>

      <ArticleSection id="explainable-ai-shap" title="Explainable AI and SHAP">
        <h3>The Interpretability Problem</h3>
        <p>
          Machine learning models may achieve strong predictive performance, but
          their internal decision-making process is often difficult to
          interpret. This interpretability problem becomes apparent when a model
          produces a plausible forecast without revealing the reasons behind the
          prediction. Traditional evaluation metrics such as Mean Squared Error
          (MSE) or Root Mean Squared Error (RMSE) can measure how close
          predictions are to the true values, but they cannot explain why a
          model produced a particular result.
        </p>
        <p>For example, a model may produce the following forecast:</p>
        <p className="article-callout">Predicted banking-sector index tomorrow: 92.5</p>
        <p>
          While this output may appear reasonable, it raises several important
          analytical questions:
        </p>
        <ol className="article-list">
          <li>Was the prediction influenced primarily by recent price trends?</li>
          <li>Did trading volume play an important role?</li>
          <li>
            Did external indicators, such as macroeconomic variables or
            commodity prices, affect the prediction?
          </li>
        </ol>
        <p>
          Without additional interpretability tools, these questions remain
          unanswered. As a result, even accurate machine learning models can be
          difficult to trust or analyze in financial contexts where
          understanding the drivers of predictions is often as important as the
          predictions themselves. To address this limitation, researchers use
          SHAP as a systematic way to explain the predictions of complex
          models.
        </p>

        <h3>What is SHAP?</h3>
        <p>
          SHAP is based on the concept of Shapley values from cooperative game
          theory, originally developed by Lloyd Shapley. In cooperative games,
          each participant contributes to a final payoff, and Shapley values
          provide a mathematically principled way to fairly distribute that
          payoff among the players. SHAP applies the same principle to machine
          learning models: each input feature is treated as a “player”
          contributing to the final prediction, and the method estimates how
          much each feature contributes to the output
          <InlineCitation item={citationById["lundberg-2017"]} />.
        </p>
        <p>
          Using this framework, SHAP decomposes a model’s prediction into a set
          of feature-level contributions, making it possible to understand how
          different variables influence the result. For example, a predicted
          stock price may be interpreted as a baseline value adjusted upward or
          downward by the influence of different features such as recent price
          changes, technical indicators, or external economic signals.
        </p>
        <p>SHAP provides several useful forms of interpretability:</p>
        <ol className="article-list">
          <li>
            <strong>Local explanations</strong> – It explains individual
            predictions by quantifying how each feature contributed to a
            specific forecast.
          </li>
          <li>
            <strong>Global explanations</strong> – It aggregates feature
            contributions across many observations to identify which variables
            are generally most influential in the model.
          </li>
          <li>
            <strong>Model-agnostic interpretation</strong> – It can be applied
            to a wide range of machine learning models, including nonlinear
            models and ensemble methods.
          </li>
        </ol>
        <p>
          Because of these properties, SHAP has become one of the most widely
          used tools for interpreting machine learning models in fields such as
          finance, healthcare, and risk analysis. In this study, SHAP is used
          to analyze the predictions generated by the forecasting models and
          identify which variables contribute most strongly to predicted stock
          prices.
        </p>

      </ArticleSection>

      <ArticleSection id="data-collection-processing" title="Data Collection and Processing">
        <h3>Stock Dataset</h3>
        <p>
          The dataset used in this study contains the historical stock data of
          5 major commercial banks - Vietcombank (VCB), Vietinbank (CTG), BIDV
          (BID), MBBank (MBB), and Sacombank (STB) - all of which are core
          constituents of the VN30 index. Furthermore, the stock data of Gold
          Futures are collected to define the influence of gold on the
          Vietnamese Banking sector. Moreover, this study focuses on the data
          from 05/01/2015 - 27/02/2026.
        </p>
        <p>
          The original data of each stock includes 6 daily features: Date
          (time), Opening price (open), Closing price (close), Highest price
          (high), Lowest price (low), and Trading volume (volume). These
          variables are used to construct the sector-level time series for
          subsequent analysis. All price values of banking stocks are reported
          in Vietnamese dong (VND), while those of gold are measured in USD.
          The data were collected from vn.investing.com. This is the example
          structure of the stock data:
        </p>

        <FigureFrame
          caption="The sample table keeps the original stock-data structure visible before the sector index and engineered features are constructed."
          label="Data Collection"
          lane="screen"
          title="Each raw stock series begins with the standard OHLCV structure."
        >
          <InteractiveTable
            columns={stockDatasetColumns}
            label="Sample stock dataset structure"
            rows={stockDatasetRows}
          />
        </FigureFrame>

        <h3>Building the Banking Sector Index</h3>
        <p>
          An equal-weighted sector index is constructed by assigning the same
          weight to each constituent stock within the sector, regardless of its
          market capitalization or trading size. In other words, each stock in
          a banking sector index of N stocks is assigned a weight of 1/N. Each
          price feature (open, high, low, and close) at each time step is
          computed as the arithmetic average of the corresponding prices of all
          5 banking institutions. This ensures that each stock contributes
          equally to the sector’s price movement rather than allowing large-cap
          firms to dominate the index.
        </p>
        <p>
          For trading activity, the sector volume is typically calculated as
          the sum of the trading volumes of all constituent stocks at each time
          step. Unlike prices, which represent relative value and can be
          averaged under equal weighting, volume reflects the total amount of
          shares traded in the sector. Summing the volumes therefore provides a
          measure of the overall liquidity and trading intensity of the banking
          sector during that period.
        </p>

        <h3>Implemented Features</h3>
        <p>
          During the feature engineering stage, two different feature sets were
          developed for deep linear models and traditional machine learning
          models. Although both share the same set of technical indicator
          features, the feature set for the machine learning models includes
          lagged returns. This is because deep linear models inherently capture
          temporal dependencies by using sequential time-series inputs,
          effectively incorporating lagged information through the time-series
          window.
        </p>

        <h3>Building the Time-Series Dataset</h3>
        <p>
          The data preprocessing pipeline was designed to support both
          traditional machine learning models and deep linear models
          (LTSF-Linear models) while maintaining a consistent data splitting
          strategy.
        </p>
        <p>
          For machine learning models such as XGBoost, LightGBM, and Random
          Forest, the dataset is organized in a tabular format where each row
          represents a single observation with engineered technical indicators
          as input features and future returns as prediction targets.
        </p>
        <p>
          For LTSF-Linear models, the data is converted into a sequential
          time-series format using a sliding window approach. Each sample
          consists of a sequence of historical observations used to predict the
          next seven days of returns. Multiple input sequence lengths (7, 30,
          120, and 480 days) are used to capture both short-term and long-term
          market dynamics.
        </p>
        <p>
          For both model types, the dataset is split chronologically into
          training (70%), validation (15%), and test (15%) sets to preserve
          the temporal order of financial data. Feature and target
          normalization is applied using scalers fitted only on the training
          set, and the same transformation is applied to the validation and
          test sets to prevent information leakage.
        </p>

        <FigureFrame
          caption="The split timeline makes the preprocessing rule explicit: training, validation, and test sets follow chronological order rather than random sampling."
          label="Data Collection"
          lane="page"
          title="The dataset is divided into chronological training, validation, and test windows."
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
      </ArticleSection>

      <ArticleSection id="results" title="Results">
        <p>
          The results presented in this web version are organized around the
          exported SHAP figures currently available in the workspace. Rather
          than repeating the methodological discussion, this section focuses on
          how the diagrams summarize feature-level contributions at both the
          local and global levels.
        </p>
        <p>
          The first figure below decomposes a single forecast into feature
          pushes and pulls. The following heatmaps then aggregate the same
          explanatory logic across the model family so that broader patterns in
          feature influence can be read more systematically.
        </p>

        <FigureFrame
          caption="This exported local SHAP view illustrates how one prediction can be decomposed into feature-level pushes and pulls, matching the explanation-focused results discussed in the report."
          label="Results"
          lane="page"
          title="Local SHAP explanations show how individual features contribute to a single forecast."
        >
          <RankedBarFigure
            defaultGroup="Positive-contribution case · 2018-07-05"
            groupKey="case"
            label="Local SHAP explanation"
            labelKey="feature"
            limit={10}
            mode="diverging"
            src="/data/tree-local-shap.csv"
            valueKey="contribution"
          />
        </FigureFrame>

        <FigureFrame
          caption="This feature-family heatmap provides a global view by aggregating SHAP mass into broader feature families so the explanatory pattern can be compared across models."
          label="Results"
          lane="screen"
          title="Global SHAP explanations summarize which feature families remain influential across the model family."
        >
          <HeatmapFigure
            label="Feature family heatmap"
            src="/data/tree-feature-family.csv"
            valueKey="share"
            valueFormat="percent"
            xKey="family"
            xLabelMap={{
              external: "Gold",
              long_return: "Long return",
              price_level: "Price level",
              short_return: "Short return",
              trend_ma: "Trend MA",
              volatility: "Volatility",
              volume_flow: "Volume flow",
            }}
            yKey="model"
          />
        </FigureFrame>

        <FigureFrame
          caption="Ranks are shown instead of raw importance so the three tree models can be compared on the same visual footing. Lower ranks indicate stronger influence."
          label="Results"
          lane="screen"
          title="The tree models still agree on a compact set of high-priority return features."
        >
          <HeatmapFigure
            label="Feature rank heatmap"
            reverseScale
            src="/data/tree-feature-rank-heatmap.csv"
            valueKey="rank"
            xKey="feature"
            xLabelMap={{
              ATR_14: "ATR 14",
              gold_return: "Gold return",
              return_10d_past: "10d return",
              return_120d_past: "120d return",
              return_1d_past: "1d return",
              return_30d_past: "30d return",
              return_3d_past: "3d return",
              return_480d_past: "480d return",
              return_6d_past: "6d return",
              return_7d_past: "7d return",
            }}
            yKey="model"
          />
        </FigureFrame>
      </ArticleSection>

      <ArticleSection
        id="research-questions-analysis"
        title="Research Questions Analysis"
      >
        <p>
          The two research questions introduced earlier can be addressed using
          the observed lag patterns in the time-series data and the SHAP
          feature-attribution results produced by the trained models. Together,
          these analyses allow the study to move beyond simple prediction
          accuracy and instead evaluate which factors influence the model’s
          forecasts and how additional variables contribute to predictive
          performance.
        </p>

        <h3>RQ1: How can SHAP be applied to machine learning models for stock price prediction to determine which factors contribute most to the model’s predictions?</h3>
        <p>
          Across the SHAP visualizations used in this study, the most
          influential features include recent lagged returns, moving-average
          related features, and short-term return indicators. When these
          variables dominate the feature rankings, it suggests that the model
          behaves similarly to a momentum-sensitive forecaster, relying heavily
          on recent market trends to generate predictions rather than treating
          all features equally.
        </p>

        <h3>RQ2: Can the price of gold be used as a useful feature or indicator when predicting stock prices?</h3>
        <p>
          Gold does not become the dominant explanatory factor, but it does not
          disappear either. In the current SHAP ranking shown in the web
          report, gold return sits in the middle of the feature table rather
          than at the very top or very bottom. This leads to a balanced
          conclusion: gold price may serve as a complementary indicator, but it
          does not replace the predictive power of recent stock-price
          dynamics.
        </p>
      </ArticleSection>

      <ArticleSection
        id="why-shap-is-valuable"
        title="Why SHAP is Valuable for Finance"
      >
        <p>
          In financial analysis, prediction accuracy alone is not sufficient.
          Analysts must also understand what factors drove a model’s prediction
          and whether those factors make economic sense. A forecasting model
          that predicts a future stock price without explaining the reasoning
          behind the prediction provides limited practical value.
        </p>
        <p>
          SHAP addresses this problem by decomposing each prediction into
          feature-level contributions. Instead of returning a single forecast
          value, the model output can be broken down into components that show
          how each input feature moved the prediction upward or downward
          relative to a baseline. This framework is particularly useful in
          finance because it allows analysts to verify whether the model
          behaves in a financially plausible way.
        </p>
        <p>In practical applications, SHAP provides several concrete benefits for financial analysis:</p>
        <ol className="article-list">
          <li>
            <strong>Interpretation of model behavior</strong> – Analysts can
            identify which variables consistently influence predictions and
            determine whether the model relies on sensible financial signals.
          </li>
          <li>
            <strong>Model comparison beyond accuracy</strong> – Competing
            models can be evaluated not only by forecast error but also by
            examining how their feature contributions differ.
          </li>
          <li>
            <strong>Detection of unstable predictors</strong> – SHAP can reveal
            when a model relies excessively on noisy or weakly justified
            indicators.
          </li>
        </ol>
        <p>
          Because of these capabilities, SHAP allows researchers and
          practitioners to evaluate models not only in terms of predictive
          performance, but also in terms of transparency and economic
          interpretability, which are critical for applying machine learning in
          real financial contexts.
        </p>
      </ArticleSection>

      <ArticleSection id="conclusion" title="Conclusion">
        <p>
          This report demonstrates how machine learning and SHAP-based
          interpretability can be studied together in a financial context. By
          combining forecasting models, technical indicators, and feature-level
          explanations, the study emphasizes that predictive performance and
          interpretability should be examined together rather than separately.
        </p>
        <p>
          In the context of banking stock prediction, this makes the analysis
          more transparent and more useful for students and practitioners who
          need to understand not only how a model performs, but also why it
          produces particular forecasts.
        </p>
      </ArticleSection>

      <section className="backmatter l-page" id="sources">
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
