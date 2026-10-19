from common import page

D3 = '<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>\n'


def scripts(name):
    return D3 + f'<script src="../assets/viz.js"></script>\n<script src="../assets/{name}.js"></script>\n'


def hub():
    body = """
<header class="dash-head"><div class="wrap">
<p class="eyebrow">Interactive</p>
<h1>Dashboards</h1>
<p>Three dashboards turn the published results into tools you can explore. Each one lists its data sources and how the numbers were obtained.</p>
</div></header>
<section><div class="wrap" style="display:grid;gap:22px">
<div class="findings three">
<a class="finding" href="mjo.html" style="text-decoration:none;color:inherit"><p class="eyebrow">Study 2 · Predict</p><p class="figure-num" style="font-size:1.4rem">MJO forecast skill</p><p>Compare correction methods by lead time and MJO strength, test whether history helps, check seasonality, and browse 2,080 FuXi-S2S ensemble forecasts (2002–2021) in phase space.</p><p><span class="btn">Open</span></p></a>
<a class="finding" href="precipitation.html" style="text-decoration:none;color:inherit"><p class="eyebrow">Study 1 · Diagnose</p><p class="figure-num" style="font-size:1.4rem">Precipitation baselines</p><p>See how a water year ranks against a 30-year normal versus a recent window, follow moving 20-year statistics, and compare regional and seasonal losses and the climate modes selected.</p><p><span class="btn">Open</span></p></a>
<a class="finding" href="chill.html" style="text-decoration:none;color:inherit"><p class="eyebrow">Study 3 · Impact</p><p class="figure-num" style="font-size:1.4rem">Orchard chill risk</p><p>Set a crop threshold and count shortfall years in observations and projections, separate the effect of variability from the mean trend, and check forecast accuracy by lead.</p><p><span class="btn">Open</span></p></a>
</div>
<div class="provenance"><b>About the numbers</b><span>Published curves and series were read from the articles' figures at full resolution and checked against values stated in the text. Exact tables are transcribed as published. Forecast trajectories in the MJO browser come directly from the public FuXi-S2S RMM archive released with Study 2. Where the original data files become available, they replace the digitized values without changes to the dashboards.</span></div>
</div></section>
"""
    return page("Fusion Outlook Dashboards", "Interactive dashboards for MJO forecast skill, California precipitation baselines and orchard chill risk.", "dash", 1, body)


def mjo():
    body = """
<header class="dash-head"><div class="wrap">
<p class="eyebrow">Dashboard · Study 2</p>
<h1>MJO forecast skill</h1>
<p>How well the FuXi-S2S AI foundation model, with and without bias correction, predicts the Madden–Julian Oscillation 1 to 42 days ahead. Test period 2019–2021 unless stated. <a href="../papers/mjo-prediction.html">About the study</a></p>
</div></header>
<div class="wrap dash-body">
<div class="kpis">
<div class="kpi"><span class="k">Skillful horizon</span><span class="v">37 → 40 <small>days</small></span><span class="d">FuXi-S2S alone vs with LSTM correction (BCOR ≥ 0.5)</span></div>
<div class="kpi"><span class="k">Error, weeks 5–6</span><span class="v">−11%</span><span class="d">LSTM vs uncorrected, all forecasts; −19% for strong MJO</span></div>
<div class="kpi"><span class="k">Strong-MJO forecasts</span><span class="v">≥ 42 <small>days</small></span><span class="d">Skillful through the full horizon when amplitude ≥ 1; weak: ~24 days</span></div>
<div class="kpi"><span class="k">MJO history alone</span><span class="v">9–12 <small>days</small></span><span class="d">Up to 720 days of lookback adds no skill</span></div>
</div>

<section class="panel" aria-labelledby="p-skill">
<div class="panel-head"><div><h2 id="p-skill">Skill by lead time</h2><p>Faded segments are not significantly different from the uncorrected forecast (95% bootstrap). The BoM view verifies against Bureau of Meteorology indices, where data mismatch makes correction look larger.</p></div>
<div class="controls"><div id="metric-seg"></div><div id="subset-seg"></div></div></div>
<div class="controls legend" id="method-toggles"></div>
<div class="panel-grid wide-left">
<div class="chart" id="skill-chart"></div>
<div class="readout" id="skill-readout"></div>
</div>
</section>

<div class="panel-grid split">
<section class="panel" aria-labelledby="p-lb">
<div class="panel-head"><div><h2 id="p-lb">Does MJO history help?</h2><p>Skillful days for two time-series models given 0 to 720 days of past MJO indices. Open circles: history only. Filled: history plus the FuXi-S2S forecast. Triangles: skillful through all 42 days.</p></div></div>
<div class="chart" id="lookback-chart"></div>
<div class="legend"><span><span class="swatch" style="background:var(--s1)"></span>Temporal Fusion Transformer</span><span><span class="swatch" style="background:var(--s2)"></span>TSMixer</span><span><span class="swatch dash"></span>FuXi-S2S alone</span></div>
</section>
<section class="panel" aria-labelledby="p-bias">
<div class="panel-head"><div><h2 id="p-bias">Amplitude and phase bias</h2><p>FuXi-S2S forecasts a weaker MJO as lead grows and, after week 3, moves it east too fast (negative phase bias). Corrections reduce the phase error by weakening amplitude further.</p></div><div class="controls"><div id="bias-seg"></div></div></div>
<div class="chart" id="bias-chart"></div>
<div class="legend"><span><span class="swatch dash"></span>FuXi-S2S</span><span><span class="swatch" style="background:var(--s3)"></span>Mean bias</span><span><span class="swatch" style="background:var(--s2)"></span>MVLR</span><span><span class="swatch" style="background:var(--s1)"></span>LSTM</span></div>
</section>
</div>

<section class="panel" aria-labelledby="p-season">
<div class="panel-head"><div><h2 id="p-season">Skill by start month</h2><p>FuXi-S2S bivariate correlation by initialization month and lead (training period 2002–2017, in bands of 0.1). Orange marks where correlation drops below 0.5; months without a mark stay skillful through 42 days.</p></div></div>
<div class="chart" id="season-chart"></div>
<div class="legend" id="season-legend"></div>
</section>

<section class="panel" aria-labelledby="p-exp">
<div class="panel-head"><div><h2 id="p-exp">Forecast browser</h2><p>Any of the 2,080 FuXi-S2S ensemble forecasts in the public archive (51 members, 42 days). The thick line is the ensemble mean; dots mark every 5 days. Observed indices are not part of the archive and are not shown.</p></div>
<div class="controls">
<label class="field" for="init-year">Year <select id="init-year"></select></label>
<label class="field" for="init-date">Start <select id="init-date"></select></label>
<label class="toggle"><input type="checkbox" id="show-members" checked> Show members</label>
</div></div>
<div class="controls"><span class="muted">February 2017 case study:</span>
<button class="btn" type="button" data-preset="2017-01-17">17 Jan</button>
<button class="btn" type="button" data-preset="2017-01-24">24 Jan</button>
<button class="btn" type="button" data-preset="2017-01-31">31 Jan</button>
<button class="btn" type="button" data-preset="2017-02-07">7 Feb</button></div>
<div class="panel-grid split">
<div class="chart" id="phase-chart" style="max-width:520px;justify-self:center;width:100%"></div>
<div style="display:grid;gap:14px;align-content:start;min-width:0">
<div class="chart" id="amp-chart"></div>
<div class="legend"><span><span class="swatch" style="background:var(--s1)"></span>Ensemble-mean amplitude</span><span><span class="swatch" style="background:repeating-linear-gradient(90deg,var(--s1) 0 2px,transparent 2px 5px)"></span>Member median</span><span><span class="swatch" style="height:10px;background:var(--s1);opacity:.25"></span>Members, 10–90%</span></div>
<div class="readout" id="explorer-readout"></div>
</div>
</div>
</section>

<section class="panel" aria-labelledby="p-damp">
<div class="panel-head"><div><h2 id="p-damp">Why the ensemble mean weakens</h2><p>Computed here from the full archive. Individual members keep their MJO amplitude, but as they drift apart in phase their average shrinks. Much of the ensemble-mean amplitude loss is spread, not a weaker MJO in each member.</p></div></div>
<div class="chart" id="damp-chart"></div>
<div class="legend" id="damp-legend"></div>
</section>

<div class="provenance"><b>Data and method</b>
<span>Skill, bias and seasonality values were digitized from Figs. 1–6 and 8 of Virji, A &amp; Velicogna (2026) at one-day lead resolution (about ±0.005 in correlation, ±0.01 in error) and checked against the paper: they reproduce the reported 37 → 40 day horizons and error reductions (3%/9% MVLR, 4%/11% LSTM, 5%/16% and 7%/19% for strong MJO, 38%/17%/12% vs BoM) to within one percentage point. Seasonality cells are binned to 0.1 as in the published figure. Forecast trajectories and the amplitude diagnostic use the FuXi-S2S RMM indices published at <a href="https://github.com/khalilv/mjo-predict">github.com/khalilv/mjo-predict</a>.</span></div>
</div>
"""
    return page("MJO Forecast Skill", "Interactive MJO forecast skill dashboard: correction methods, history test, seasonality and a browser for 2,080 FuXi-S2S ensemble forecasts.", "dash", 1, body, scripts=scripts("mjo"))


def precip():
    body = """
<header class="dash-head"><div class="wrap">
<p class="eyebrow">Dashboard · Study 1</p>
<h1>Precipitation baselines</h1>
<p>How the choice of reference period changes what counts as a dry or normal year in California, and where precipitation has declined. <a href="../papers/precipitation-shift.html">About the study</a></p>
</div></header>
<div class="wrap dash-body">
<div class="kpis">
<div class="kpi"><span class="k">Area losing &gt;100 mm/yr</span><span class="v">&gt;30%</span><span class="d">Of California, 2002–2021 vs 1982–2001</span></div>
<div class="kpi"><span class="k">Extreme-wet share</span><span class="v">24% → 17%</span><span class="d">Of annual precipitation from months with z &gt; 1.5</span></div>
<div class="kpi"><span class="k">Significant drying trend</span><span class="v">17%</span><span class="d">Of state area, water years 1982–2022</span></div>
<div class="kpi"><span class="k">Explained by climate modes</span><span class="v">R² ≈ 0.25</span><span class="d">Wet anomalies, statewide; Sierra Nevada ≈ 0.19</span></div>
</div>

<section class="panel" aria-labelledby="p-clim">
<div class="panel-head"><div><h2 id="p-clim">Which normal should a water year be judged against?</h2><p>Statewide water-year precipitation with two reference periods (line: mean; band: ±1 standard deviation). Pick a year, or click a bar, to see how its rank changes.</p></div></div>
<div class="controls">
<span class="muted">Reference A</span><div id="a-seg"></div>
</div>
<div class="controls">
<span class="muted">Reference B <b id="b-label" class="num" style="color:var(--ink)"></b></span>
<label class="field" for="b-len">Length <input type="range" id="b-len" min="10" max="30" step="1" value="20"><output id="b-len-out" class="num">20</output> yr</label>
<label class="field" for="b-end">Ending <input type="range" id="b-end" min="1991" max="2022" step="1" value="2021"></label>
<label class="field" for="target-year">Water year <select id="target-year"></select></label>
</div>
<div class="chart" id="clim-chart"></div>
<div class="readout" id="clim-readout"></div>
</section>

<div class="panel-grid split">
<section class="panel" aria-labelledby="p-mov">
<div class="panel-head"><div><h2 id="p-mov">Moving-window mean and variability</h2><p>Statewide mean and standard deviation in each moving window. Both fall after windows centered in the late 1990s.</p></div><div class="controls"><div id="mwin-seg"></div></div></div>
<div class="chart" id="moving-chart"></div>
</section>
<section class="panel" aria-labelledby="p-reg">
<div class="panel-head"><div><h2 id="p-reg">Regional change, 2002–2021 vs 1982–2001</h2><p>Bars split the water-year change into wet season (Oct–Mar) and dry season (Apr–Sep); the black tick is the water-year total.</p></div><div class="controls"><div id="region-sort"></div></div></div>
<div class="chart" id="region-chart"></div>
<div class="legend"><span><span class="swatch" style="background:var(--s1)"></span>Wet season</span><span><span class="swatch" style="background:var(--s2)"></span>Dry season</span><span><span class="swatch" style="background:var(--ink);width:3px;height:12px"></span>Water year</span></div>
</section>
</div>

<section class="panel" aria-labelledby="p-pred">
<div class="panel-head"><div><h2 id="p-pred">Which climate modes explain wet months</h2><p>Share of grid cells whose best model selected each predictor. Interactions between modes dominate; no single index appears in more than 6% of cells.</p></div>
<div class="controls"><label class="toggle"><input type="checkbox" id="pred-all"> Show all 36 predictors</label></div></div>
<div class="panel-grid wide-left">
<div style="display:grid;gap:8px;min-width:0"><div class="chart" id="pred-chart"></div><div class="legend"><span><span class="swatch" style="background:var(--s1)"></span>Interaction of two modes</span><span><span class="swatch" style="background:var(--s3)"></span>Single mode</span></div></div>
<div style="display:grid;gap:10px;align-content:start;min-width:0"><div class="chart" id="npred-chart"></div><p class="note">Over 90% of grid-cell models keep three predictors or fewer. Explanatory power is higher in coastal and inland areas (R² ≈ 0.28 in the San Francisco Bay Area) and lowest in the Sierra Nevada, where most of the state's water originates.</p></div>
</div>
</section>

<div class="provenance"><b>Data and method</b>
<span>The statewide series is the latitude-weighted PRISM mean, read from Fig. 3b of Shalgumbayeva, A &amp; Velicogna (2026) to about ±5 mm and checked by reproducing the figure's 5-year running mean. Window statistics, ranks and classes are computed from that series in your browser; percentiles are empirical within each window, and the 20th/80th percentile classes are for illustration. Regional changes are from Fig. 2e (±3 mm) and predictor frequencies from Fig. 5d (±0.1 percentage points). Grid-cell analyses (area fractions, R²) are as reported in the paper.</span></div>
</div>
"""
    return page("Precipitation Baselines", "Interactive dashboard: compare California water years against a 30-year normal and a recent window, with regional losses and the climate modes that explain wet months.", "dash", 1, body, scripts=scripts("precip"))


def chill():
    body = """
<header class="dash-head"><div class="wrap">
<p class="eyebrow">Dashboard · Study 3</p>
<h1>Orchard chill risk</h1>
<p>Winter chill in <span data-crop-name>Pistachio</span>-growing regions of California south of 37°N, observed and projected, against crop requirements. <a href="../papers/chill-risk.html">About the study</a></p>
</div></header>
<div class="wrap dash-body">
<div class="kpis">
<div class="kpi"><span class="k">Mean chill</span><span class="v">~64 → ~60 <small>CP</small></span><span class="d">1980–1990 vs 2015–2024, all four crop regions</span></div>
<div class="kpi"><span class="k">Year-to-year variability</span><span class="v">+56%</span><span class="d">Median 10-year SD 4.3–4.6 → 7.1–7.2 CP after 1998</span></div>
<div class="kpi"><span class="k">CMIP6 variability</span><span class="v">~½</span><span class="d">Of observed; 60–70% of shortfall years missed</span></div>
<div class="kpi"><span class="k">In-season forecast</span><span class="v">42 <small>of 43 yr</small></span><span class="d">Within ±10% using obs through Jan + Feb forecast</span></div>
</div>

<section class="panel" aria-labelledby="p-ts">
<div class="panel-head"><div><h2 id="p-ts">Chill against crop requirements</h2><p>Observed Nov–Feb chill portions (GRIDMET), CMIP6 historical simulations and SSP5-8.5 projections. Orange points fall below the threshold. Move the threshold to test a lower- or higher-chill cultivar.</p></div>
<div class="controls"><div id="crop-seg"></div></div></div>
<div class="controls">
<label class="field" for="thr">Threshold <input type="range" id="thr" min="40" max="70" step="0.5" value="58"><output id="thr-out" class="num">58</output> CP</label>
<button class="btn" type="button" id="thr-reset">Reset to median requirement</button>
</div>
<div class="panel-grid wide-left">
<div style="display:grid;gap:8px;min-width:0"><div class="chart" id="ts-chart"></div>
<div class="legend"><span><span class="swatch" style="background:var(--s1)"></span>Observed</span><span><span class="swatch dash"></span>CMIP6 historical</span><span><span class="swatch" style="background:var(--s2)"></span>CMIP6 SSP5-8.5</span><span><span class="swatch" style="background:var(--ochre)"></span>Threshold</span><span><span class="swatch" style="height:10px;background:var(--surface-2);border:1px solid var(--rule)"></span>Cultivar range</span></div></div>
<div class="readout" id="ts-readout"></div>
</div>
</section>

<div class="panel-grid split">
<section class="panel" aria-labelledby="p-dist">
<div class="panel-head"><div><h2 id="p-dist">Variability drives the deep shortfalls</h2><p>Each dot is one winter in <span data-crop-name>Pistachio</span> regions. The middle row moves the early period by the observed change in the mean but keeps its old spread. Near the median requirement the mean shift explains most of the change. Below 52 CP, every crop region has 3 observed winters in 2004–2023 against 1 from the mean shift alone: the wider spread triples the severe shortfalls.</p></div></div>
<div class="chart" id="dist-chart"></div>
<div class="readout" id="dist-readout"></div>
<div class="chart" id="cdf-chart"></div>
<div class="legend"><span><span class="swatch" style="background:var(--neutral-mark)"></span>1979–1998</span><span><span class="swatch" style="background:repeating-linear-gradient(90deg,var(--ink-3) 0 4px,transparent 4px 7px)"></span>1979–1998 + mean shift</span><span><span class="swatch" style="background:var(--s1)"></span>2004–2023</span><span><span class="swatch" style="background:var(--ochre)"></span>Current threshold</span></div>
</section>
<section class="panel" aria-labelledby="p-sd">
<div class="panel-head"><div><h2 id="p-sd">Ten-year rolling variability</h2><p>Standard deviation of chill in a 10-year moving window. The selected crop is drawn thicker.</p></div></div>
<div class="chart" id="sd-chart"></div>
<div class="legend" id="sd-legend"></div>
</section>
</div>

<div class="panel-grid split">
<section class="panel" aria-labelledby="p-acc">
<div class="panel-head"><div><h2 id="p-acc">Forecast accuracy by lead</h2><p>Share of the 43 winters (1981–2024) where chill from observations plus ECMWF forecasts for the remaining months matched the observed total. Supplementary Table 1.</p></div>
<div class="controls"><div id="acc-tol"></div><div id="acc-level"></div></div></div>
<div class="chart" id="acc-chart"></div>
<div class="legend"><span><span class="swatch" style="background:var(--s1)"></span>Daily forecasts (MD)</span><span><span class="swatch" style="background:var(--s3)"></span>Monthly-mean forecasts (MM)</span></div>
</section>
<section class="panel" aria-labelledby="p-fc">
<div class="panel-head"><div><h2 id="p-fc">End-of-January check, every winter</h2><p>Observed Nov–Jan chill plus a February forecast, against the observed season total for all four crop regions combined. Grey band: ±10% of observed.</p></div></div>
<div class="chart" id="fc-chart"></div>
<div class="legend"><span><span class="swatch dash"></span>Observed</span><span><span class="swatch" style="background:var(--s1)"></span>Obs + daily Feb forecast</span><span><span class="swatch" style="background:var(--s3)"></span>Obs + monthly Feb forecast</span></div>
</section>
</div>

<div class="provenance"><b>Data and method</b>
<span>Regional series were read from Fig. 2 (±0.2 CP), Fig. 3 and Supplementary Fig. 6 of Jha, A, Pathak &amp; Velicogna (2026) and checked against the paper's reported means, standard deviations, CMIP6 variability ratio and projection counts. Supplementary Table 1 is transcribed exactly. Counts at the median threshold reported in the paper come from the gridded data and can differ from the plotted series by a year where values sit very close to the threshold. The mean-shift comparison is an illustration computed in your browser. Year labels follow the paper's figures. Processed data are on Zenodo (<a href="https://doi.org/10.5281/zenodo.20058559">10.5281/zenodo.20058559</a>).</span></div>
</div>
"""
    return page("Orchard Chill Risk Dashboard", "Interactive dashboard: winter chill against crop thresholds for California pistachio, walnut, cherry and plum, the role of variability, and in-season forecast accuracy.", "dash", 1, body, scripts=scripts("chill"))
