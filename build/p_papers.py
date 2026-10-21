from common import page, fig, pager

CC = "CC BY 4.0"
KIM_REF = ('<sup><a href="https://doi.org/10.1038/s41467-021-23406-3" title="Kim, H., Ham, Y. G., Joo, Y. S. &amp; Son, S. W. (2021). '
           'Deep learning for bias correction of MJO prediction. Nature Communications, 12, 3087.">1</a></sup>')


def head_block(step, title, authors, venue, doi, actions):
    acts = "".join(f'<a class="btn{" solid" if i == 0 else ""}" href="{h}">{t}</a>' for i, (t, h) in enumerate(actions))
    return f"""<header class="paper-head"><div class="wrap">
<p class="eyebrow">{step}</p>
<h1>{title}</h1>
<p class="authors">{authors}</p>
<p class="venue">{venue} · Open access · <a href="https://doi.org/{doi}">doi.org/{doi}</a></p>
<div class="actions">{acts}</div>
</div></header>"""


def findings(items, cls="four"):
    return f'<div class="findings {cls}">' + "".join(
        f'<div class="finding"><p class="figure-num">{n}</p><p>{t}</p></div>' for n, t in items) + "</div>"


def cite(text):
    return f'<p class="cite">{text}</p>'


# ---------------------------------------------------------------- Study 1
def precip():
    d = 1
    body = head_block(
        "Study 1 of 4 · Diagnose",
        "Recent shift in California's precipitation distribution based on observations",
        "Gulnaz Shalgumbayeva, Geruo A, Isabella Velicogna",
        "<i>Environmental Research Communications</i> 8, 041013 (2026)", "10.1088/2515-7620/ae5eda",
        [("Open the dashboard", "../dashboards/precipitation.html"), ("Read the article", "https://doi.org/10.1088/2515-7620/ae5eda"), ("Supplementary data", "https://doi.org/10.1088/2515-7620/ae5eda/data1")])
    body += f"""
<section><div class="wrap" style="display:grid;gap:28px">
<p class="lede">Four decades of daily PRISM observations at 800 m show that California has become drier since the late 1990s, with fewer extreme-wet months and smaller swings from year to year. Large-scale climate modes reproduce where the drying happens, but explain only about a quarter of the year-to-year variation in wet months.</p>
{findings([
 (">30%", "Share of California where mean water-year precipitation fell by more than 100 mm per year, 2002–2021 vs 1982–2001. Losses exceed 400 mm per year in parts of the northern Sierra Nevada."),
 ("24% → 17%", "Contribution of extreme-wet months (z &gt; 1.5, roughly the top 8%) to annual precipitation, 1982–2001 vs 2002–2021."),
 ("17%", "Area with a statistically significant drying trend over 1982–2022. Large year-to-year swings and storms such as water year 2017 hide the underlying decline."),
 ("~25%", "Variance in wet anomalies explained by climate modes and their pairwise interactions, statewide. The Sierra Nevada is lowest (R² ≈ 0.19).")])}
</div></section>

<section><div class="wrap two-col">
<div class="prose">
<p class="eyebrow">Why it matters</p>
<h2 style="font-size:1.6rem">What water managers can take from it</h2>
<ul class="ledger" style="margin-top:6px">
<li><span class="tag">Baseline</span><div><h4>Shorten the reference period</h4><p>A recent ~20-year climatology fits today's hydroclimate better than a 30-year one. That choice can move drought triggers, reservoir rule curves and allocations.</p></div></li>
<li><span class="tag">Predictors</span><div><h4>Trust the trend, not the swings</h4><p>Use climate modes for the spatial pattern and direction of drying, not for the size or timing of wet years.</p></div></li>
<li><span class="tag">Supply</span><div><h4>Plan for fewer big storms</h4><p>Less of the supply now arrives in the extreme-wet months that atmospheric rivers and snowpack deliver. Carryover storage and recharge readiness become more valuable.</p></div></li>
<li><span class="tag">Outlooks</span><div><h4>Re-verify seasonal outlooks on recent years</h4><p>Both the baseline and the relationships between predictors and precipitation are moving, so skill measured on older periods may not hold.</p></div></li>
</ul>
</div>
<div class="prose">
<p class="eyebrow">What we did</p>
<h2 style="font-size:1.6rem">Data and methods</h2>
<p>We used daily PRISM precipitation for water years 1982–2022 on its native 800 m grid (1138 × 1235 cells), checked against 65 CIMIS stations (mean R² = 0.8) and the NOAA CPC gauge analysis (R² = 0.9). Results are reported by grid cell and for the nine regions of California's Fourth Climate Change Assessment, with the Sierra Nevada split into four subregions.</p>
<p>Changes in mean and variance were tested with t-tests and F-tests in 20-year moving windows stepped by 5 years. Extreme months were defined from monthly z-scores against 1981–2000: z &gt; 1.5 for wet and z &lt; −1 for dry, each about 8% of months.</p>
<p>To test climate modes, each grid cell's wet anomalies were regressed on eight indices (East- and Central-Pacific ENSO, PDO, PNA, AO, PMM, MJO amplitude and phase) and their 28 pairwise interactions. Forward selection kept a predictor only if it was significant and also lowered AICc, raised adjusted R², and improved leave-one-out cross-validated R².</p>
</div>
</div></section>

<section><div class="wrap" style="display:grid;gap:36px">
<div class="sec-head" style="margin-bottom:0"><p class="eyebrow">Figures</p><h2>Key results</h2></div>
{fig("precip-fig1.webp", "<b>Figure 1.</b> Change in water-year mean (a) and interannual standard deviation (b) between 2002–2021 and 1982–2001. Crosses mark 10 × 10 blocks where most cells are significant at α = 0.05. Panels i–xii show the distribution of grid-cell mean precipitation in each region for successive 20-year windows; the curves shift toward drier values over time.", "Shalgumbayeva et al. 2026, Fig. 1, " + CC, d)}
<div class="fig-grid split">
{fig("precip-fig3.webp", "<b>Figure 3.</b> (a) Trend in water-year precipitation, 1982–2022; crosses mark significant cells. (b) Statewide latitude-weighted mean with the 5-year moving mean ± standard error. The decline that starts around 1997 is partly masked by wet years such as 2017.", "Shalgumbayeva et al. 2026, Fig. 3, " + CC, d)}
{fig("precip-fig6.webp", "<b>Figure 6.</b> Trend in water-year totals of wet anomalies: observed (left), reconstructed from the selected climate-mode models (middle), and the residual (right). The modeled trend reproduces the observed pattern, with the largest declines in northern California.", "Shalgumbayeva et al. 2026, Fig. 6, " + CC, d)}
</div>
{fig("precip-fig4.webp", "<b>Figure 4.</b> (a) Change in the contribution of extreme-wet months to water-year totals (percentage points). (b) That contribution through time by region, using 20-year windows. Panels i–xii compare the number of extreme-wet months per grid cell in 1982–2001 (black) and 2002–2021 (red).", "Shalgumbayeva et al. 2026, Fig. 4, " + CC, d)}
{fig("precip-fig5.webp", "<b>Figure 5.</b> Regression models fitted at each grid cell. (a) Coefficient of determination R². (b) Its distribution, with a statewide mean of 0.25. (c) Number of predictors kept; over 90% of models use fewer than four. (d) How often each index or interaction is selected; interactions such as PNA × PDO and PDO × AO lead.", "Shalgumbayeva et al. 2026, Fig. 5, " + CC, d)}
</div></section>

<section><div class="wrap two-col">
<div class="prose">
<p class="eyebrow">Limits of the analysis</p>
<h2 style="font-size:1.4rem">What this study does not settle</h2>
<ul>
<li>The trends are weak and significant over a small part of the state. A shorter window can show strong drying (1997–2016) or almost none (2002–2021, which includes water year 2017).</li>
<li>The recent decline in variability runs against the longer-term rise in wet and dry extremes since the 1960s and against model projections of more variability. Whether it is temporary is open.</li>
<li>The regression explains the wet tail only. Separating natural variability from human influence needs a longer record or a dedicated attribution study.</li>
</ul>
</div>
<div class="prose">
<p class="eyebrow">Where this leads</p>
<h2 style="font-size:1.4rem">From diagnosis to prediction</h2>
<p>If the climate modes behind seasonal outlooks explain only a quarter of the wet-month variance, the practical question becomes which sources of skill do work at the 2–6 week range that reservoir and allocation decisions need. The Madden–Julian Oscillation is the leading candidate, and it is the subject of Study 2.</p>
<h3>Cite</h3>
{cite("Shalgumbayeva, G., A, G. &amp; Velicogna, I. (2026). Recent shift in California's precipitation distribution based on observations. Environmental Research Communications, 8, 041013. https://doi.org/10.1088/2515-7620/ae5eda")}
</div>
</div></section>
<section><div class="wrap">{pager(None, ("papers/mjo-prediction.html", "Deep learning MJO prediction", "Study 2"), d)}</div></section>
"""
    return page("California Precipitation Shift", "Study 1: observed shift in California's precipitation distribution, 1982–2022, and the limited role of climate modes.", "p1", d, body)


# ---------------------------------------------------------------- Study 2
def mjo():
    d = 1
    body = head_block(
        "Study 2 of 4 · Predict",
        "On the importance of historical context and bias correction in deep learning MJO prediction models",
        "Khalil Virji, Geruo A, Isabella Velicogna",
        "<i>npj Climate and Atmospheric Science</i> 9, 193 (2026)", "10.1038/s41612-026-01459-9",
        [("Open the dashboard", "../dashboards/mjo.html"), ("Read the article", "https://doi.org/10.1038/s41612-026-01459-9"), ("Code and forecast indices", "https://github.com/khalilv/mjo-predict")])
    body += f"""
<section><div class="wrap" style="display:grid;gap:28px">
<p class="lede">The Madden–Julian Oscillation (MJO) is a primary source of weather predictability 2 to 6 weeks ahead, and it shapes atmospheric rivers and Sierra Nevada snowpack. We paired FuXi-S2S, an AI foundation model for global subseasonal forecasting, with state-of-the-art time-series and bias-correction models adapted for MJO prediction. Our corrected forecasts extend the state-of-the-art skillful window from 37 to 40 days, and our experiments answer two open questions: whether modeling extended MJO history improves predictions, and whether existing bias-correction methods work for AI models the same way they do for physics-based models.{KIM_REF}</p>
{findings([
 ("37 → 40 days", "of skillful MJO forecasts (bivariate correlation &gt; 0.5) after bias-correcting FuXi-S2S forecasts. Operational systems such as ECMWF reach around 30 days."),
 ("11%", "reduction in forecast error (bivariate MSE) in weeks 5 and 6 (lead times of 29–42 days) after bias correction. When FuXi-S2S forecasts a strong MJO, the reduction is 19%."),
 ("9–12 days", "of skill using only historical RMM indices to predict future MJO activity. Predictions do not improve whether the model sees 1 day or 720 days of past behavior. The current state carries the predictive information."),
 ("Weeks 3+", "is when bias correction starts to correct systematic errors in FuXi-S2S. In a previous study of physics-based models, it helped from day 1." + KIM_REF)])}
</div></section>

<section><div class="wrap two-col">
<div class="prose">
<p class="eyebrow">Why it matters</p>
<h2 style="font-size:1.6rem">For California water management</h2>
<ul class="ledger" style="margin-top:6px">
<li><span class="tag">Lead time</span><div><h4>Three more skillful days of MJO prediction, and smaller errors in weeks 3–6</h4><p>Bias correction extends the skillful window from 37 to 40 days and reduces forecast errors in weeks 3–6, the range that matters for reservoir operations, drought preparedness and water allocation planning.</p></div></li>
<li><span class="tag">Trust</span><div><h4>Know when to rely on a forecast</h4><p>When FuXi-S2S forecasts a strong MJO (amplitude ≥ 1 at a given lead time), skill holds through the full 42-day horizon. When it forecasts a weak MJO, skill lasts about 24 days, so predictions in weeks 4–6 should be interpreted with caution. Forecasts initialized in May and September–February stay skillful past 40 days, whereas forecasts initialized in March and June–August have shorter skillful windows (as low as 35 days).</p></div></li></ul>
</div>
<div class="prose">
<p class="eyebrow">Why it matters</p>
<h2 style="font-size:1.6rem">For model developers and funders</h2>
<ul class="ledger" style="margin-top:6px">
<li><span class="tag">Inputs</span><div><h4>Invest in the current atmospheric state, not in modeling longer history</h4><p>Extended lookback windows of MJO activity do not improve skill. A richer representation of the current atmospheric state, with higher spatial resolution and more variables, is a more promising direction. It also keeps operational systems tractable.</p></div></li>
<li><span class="tag">Evaluation</span><div><h4>Separate systematic model errors from dataset mismatches</h4><p>Evaluating against MJO indices from the Bureau of Meteorology, instead of indices built from the same data sources used to initialize FuXi-S2S, makes bias correction look much stronger: our correction model reduces BMSE by 38% in weeks 1–2. This improvement largely comes from correcting a distribution shift between the data used to initialize forecasts and the data used for evaluation, rather than a systematic model error. Part of the large gains reported for physics-based models likely comes from correcting such mismatches.</p></div></li>
<li><span class="tag">Next</span><div><h4>Further correcting amplitude and propagation errors requires new approaches</h4><p>FuXi-S2S underestimates MJO amplitude at all lead times and propagates it too fast after week 3. Beyond week 3, bias correction reduces the phase bias (not always significantly) but weakens the amplitude further, trading one error for the other. Fixing both may require alternative training objectives, large ensembles, and better representation of moisture and the Maritime Continent.</p></div></li>
</ul>
</div>
</div></section>

<section><div class="wrap" style="display:grid;gap:36px">
<div class="sec-head" style="margin-bottom:0"><p class="eyebrow">Figures</p><h2>Key results</h2></div>
{fig("mjo-fig1.webp", "<b>Figure 1.</b> Skill of two leading time-series models, the Temporal Fusion Transformer (a) and TSMixer (b), when forecasting the MJO from its historical activity. Black marks show where correlation drops below 0.5. Adding history beyond the current state (L = 1) does not extend the 9–12 day skillful window.", "Virji et al. 2026, Fig. 1, " + CC, d)}
{fig("mjo-fig2.webp", "<b>Figure 2.</b> Bivariate correlation (a) and BMSE (b) for FuXi-S2S with three corrections: mean bias, multivariate linear regression and an LSTM network. Faded segments are not significantly different from the uncorrected forecast at 95%", "Virji et al. 2026, Fig. 2, " + CC, d)}
{fig("mjo-fig3.webp", "<b>Figure 3.</b> Amplitude bias (a) and phase bias (b) for FuXi-S2S with and without correction. FuXi-S2S forecasts a weaker MJO at every lead, and after week 3 its negative phase bias means the MJO moves east too fast. Corrections reduce the phase bias but weaken the amplitude further. Faded segments are not significantly different from the uncorrected forecast at 95%", "Virji et al. 2026, Fig. 3, " + CC, d)}
{fig("mjo-fig4.webp", "<b>Figure 4.</b> Skill split by the forecasted MJO amplitude by FuXi-S2S at each lead: weak (a, b) and strong (c, d). Strong-MJO forecasts remain skillful through 42 days, and bias correction reduces BMSE by up to 19% in weeks 5–6.", "Virji et al. 2026, Fig. 4, " + CC, d)}
{fig("mjo-fig6.webp", "<b>Figure 6.</b> Combining MJO history with the FuXi-S2S forecasts in TFT (a) and TSMixer (c), against FuXi-S2S alone (b). Fusion extends the skillful window by about 1–3 days, and longer history again brings no consistent gain.", "Virji et al. 2026, Fig. 6, " + CC, d)}
<div class="fig-grid split">
{fig("mjo-fig7.webp", "<b>Figure 7.</b> 42-day composite trajectories in RMM phase space: FuXi-S2S ensemble mean (blue) and observations (dashed), computed over 2002–2017. Unlike physics-based models, FuXi-S2S shows no notable bias at short leads. Large circles mark a 1-day lead; smaller circles follow in 5-day increments.", "Virji et al. 2026, Fig. 7, " + CC, d)}
{fig("mjo-fig8.webp", "<b>Figure 8.</b> MJO forecast skill by initialization month, computed over 2002–2017. Forecasts started in May and September–February stay above 0.5 correlation beyond 40 days; March and June–August starts are shortest, as low as 35 days.", "Virji et al. 2026, Fig. 8, " + CC, d)}
</div>
<div class="fig-grid split">
{fig("mjo-case-20170201.webp", "<b>Case study (project briefing, not in the paper).</b> Forecast from 1 February 2017, two weeks before the peak of a strong MJO event. The FuXi-S2S forecast (blue) captures the event's strength and ending; ECMWF (red) underestimates it and ends it early. Observed trajectory dashed.", "Project briefing, Oct 2025", d)}
{fig("mjo-case-precip2017.webp", "<b>Case study (project briefing, not in the paper).</b> MJO amplitude and daily California precipitation, December 2016 – March 2017. The strongest MJO activity coincides with the sustained heavy precipitation of mid-February 2017.", "Project briefing, Oct 2025", d)}
</div>
</div></section>

<section><div class="wrap two-col">
<div class="prose">
<p class="eyebrow">What we did</p>
<h2 style="font-size:1.4rem">Data and methods</h2>
<p>The MJO is tracked using the Real-time Multivariate MJO (RMM) indices, computed from NOAA outgoing longwave radiation (OLR) and ERA5 winds at 850 and 250 hPa over a 1979–2001 reference period (250 hPa replaces the typical 200 hPa, which the FuXi-S2S archive does not include). Our indices correlate at 0.91 with RMM indices from the Bureau of Meteorology.</p>
<p>FuXi-S2S, trained on 67 years of ERA5 (1950–2016), forecasts 51-member ensembles out to 42 days. Its public archive has twice-weekly starts (every 3–4 days) from 2002 to 2021. All models were trained on 2002–2017, validated on 2018 and tested on 2019–2021.</p>
<p>For our experiments modeling historical MJO activity, we trained a Temporal Fusion Transformer (TFT) and an MLP-based TSMixer with lookback windows of historical RMM indices ranging from none to 720 days. Neither architecture showed a clear advantage over the other, and neither model clearly improved with longer history. For bias correction, we trained mean-bias, multivariate linear regression (MVLR) and LSTM correction models separately for each lead time and MJO phase group. Our corrections showed no systematic dependence on phase or season.</p>
</div>
<div class="prose">
<p class="eyebrow">Limits</p>
<h2 style="font-size:1.4rem">Read with care</h2>
<ul>
<li>FuXi-S2S was trained on 1950–2016, so skill measured over that period, such as the seasonality analysis, may be higher than for years outside the training set.</li>
<li>Results are shown for FuXi-S2S, tested on 2019–2021. Other models with different architectures or training objectives, such as diffusion-based models, may show different MJO biases.</li>
<li>History may still carry information in fields that the RMM, ROMI and VPM indices do not capture, such as the stratospheric QBO or moisture. Modeling richer historical contexts could see history play a larger role in predictive performance.</li>
</ul>
<h3>Data and code</h3>
<p>Code and the FuXi-S2S RMM forecast indices: <a href="https://github.com/khalilv/mjo-predict">github.com/khalilv/mjo-predict</a>. Raw FuXi-S2S forecasts: <a href="https://huggingface.co/datasets/FudanFuXi/FuXi-S2S">Hugging Face</a>. ERA5 data: <a href="https://console.cloud.google.com/storage/browser/weatherbench2">WeatherBench 2</a>. OLR, ROMI and VPM indices: <a href="https://psl.noaa.gov/">NOAA PSL</a>. BoM RMM indices: <a href="https://www.bom.gov.au/climate/mjo/">Bureau of Meteorology</a>.</p>
<h3>Cite</h3>
{cite("Virji, K., A, G. &amp; Velicogna, I. (2026). On the importance of historical context and bias correction in deep learning MJO prediction models. npj Climate and Atmospheric Science, 9, 193. https://doi.org/10.1038/s41612-026-01459-9")}
</div>
</div></section>
<section><div class="wrap">{pager(("papers/precipitation-shift.html", "California's precipitation shift", "Study 1"), ("papers/chill-risk.html", "Chill insufficiency in specialty crops", "Study 3"), d)}</div></section>
"""
    return page("MJO Prediction Study", "Study 2: AI-based MJO prediction reaches 40 skillful days; long history does not help, and bias correction helps only after week 3.", "p2", d, body)


# ---------------------------------------------------------------- Study 3
def chill():
    d = 1
    body = head_block(
        "Study 3 of 4 · Impact",
        "From intermittent to persistent chill insufficiency in California's specialty crops",
        "Prakash K. Jha, Geruo A, Tapan B. Pathak, Isabella Velicogna",
        "<i>Communications Sustainability</i> 1, 76 (2026)", "10.1038/s44458-026-00084-0",
        [("Open the dashboard", "../dashboards/chill.html"), ("Read the article", "https://doi.org/10.1038/s44458-026-00084-0"), ("Data on Zenodo", "https://doi.org/10.5281/zenodo.20058559")])
    body += f"""
<section><div class="wrap" style="display:grid;gap:28px">
<p class="lede">Pistachio, walnut, cherry and plum trees need enough winter cold to break dormancy and set fruit. Using 44 years of observations, we find that winter chill in crop regions south of 37°N has already fallen close to crop requirements. What turns that into losses now is rising year-to-year variability, which climate models underestimate by about half. A simple in-season forecast can tell growers by the end of January whether this winter will fall short.</p>
{findings([
 ("−4 to −6 CP", "Drop in mean Nov–Feb chill from 1980–1990 (about 64–65 chill portions) to 2015–2024 (about 60). Over 91% of grid cells in each crop region show a decline."),
 ("+56%", "Increase in year-to-year variability since the late 1990s: the median 10-year standard deviation rose from 4.3–4.6 to 7.1–7.2 chill portions."),
 ("~30% · 25%", "Share of the past two decades with insufficient chill in pistachio and plum regions. In 1979–1998 it was 3 and 2 years; in 2004–2023, 6 and 5."),
 ("41–42 of 43", "Years in which observed chill through January plus a 1-month ECMWF February forecast came within 10% of the season total.")])}
</div></section>

<section><div class="wrap two-col">
<div class="prose">
<p class="eyebrow">Why it matters</p>
<h2 style="font-size:1.6rem">For growers and advisors</h2>
<ul class="ledger" style="margin-top:6px">
<li><span class="tag">This season</span><div><h4>Check chill at the end of January</h4><p>Dormancy-breaking treatments usually start at least a month before bud break. Observed chill through January plus a February forecast gives a reliable answer in time to decide.</p></div></li>
<li><span class="tag">Risk</span><div><h4>Shortfall years are already here</h4><p>Mean trends alone suggest thresholds will be crossed decades from now. Variability is producing shortfall years today, especially for pistachio and plum.</p></div></li>
<li><span class="tag">Walnut</span><div><h4>Low-risk crops are moving closer</h4><p>Walnut has not dropped below its median requirement, but winters within 5 chill portions of it have tripled since 1998.</p></div></li>
</ul>
</div>
<div class="prose">
<p class="eyebrow">Why it matters</p>
<h2 style="font-size:1.6rem">For breeding programs and planners</h2>
<ul class="ledger" style="margin-top:6px">
<li><span class="tag">Breeding</span><div><h4>Target about 50 chill portions</h4><p>New cultivars take 15–20 years to develop. Those started now will reach orchards around 2040–2050, when chill in these regions is projected to average about 50 CP, with more variable winters.</p></div></li>
<li><span class="tag">Projections</span><div><h4>Climate models understate near-term risk</h4><p>CMIP6 historical simulations have about half the observed variability and miss 60–70% of observed shortfall years. Risk assessments built on them start too late.</p></div></li>
<li><span class="tag">Forecasts</span><div><h4>Longer leads need new sources of skill</h4><p>Seasonal forecast skill for chill largely disappears beyond one month, and ENSO is only weakly linked to chill (r of about 0.2). Subseasonal predictors are the gap to close.</p></div></li>
</ul>
</div>
</div></section>

<section><div class="wrap" style="display:grid;gap:36px">
<div class="sec-head" style="margin-bottom:0"><p class="eyebrow">Figures</p><h2>Key results</h2></div>
{fig("chill-fig2.webp", "<b>Figure 2.</b> Nov–Feb chill in crop regions south of 37°N for pistachio (a), walnut (b), cherry (c) and plum (d). Blue: observations (GRIDMET). Black dashed: CMIP6 historical simulations. Green: CMIP6 SSP5-8.5 projections. Grey band: range of cultivar requirements; red dashed: median requirement.", "Jha et al. 2026, Fig. 2, " + CC, d)}
<div class="fig-grid split">
{fig("chill-fig1.webp", "<b>Figure 1.</b> Trend in winter chill, 1980–2023 (Theil–Sen slope; only significant cells shown). Declines dominate the Central Valley and coastal growing areas.", "Jha et al. 2026, Fig. 1, " + CC, d)}
{fig("chill-fig3.webp", "<b>Figure 3.</b> Ten-year rolling standard deviation of chill in the four crop regions. Variability jumped in the late 1990s and has stayed high.", "Jha et al. 2026, Fig. 3, " + CC, d)}
</div>
{fig("chill-fig4.webp", "<b>Figure 4.</b> Anomaly correlation between chill computed from ECMWF forecasts and from observations, by month. Skill is high for November (1-month lead) and mostly gone by December. Top: daily forecasts; bottom: monthly-mean forecasts.", "Jha et al. 2026, Fig. 4, " + CC, d)}
</div></section>

<section><div class="wrap two-col">
<div class="prose">
<p class="eyebrow">What we did</p>
<h2 style="font-size:1.4rem">Data and methods</h2>
<p>Chill portions were computed with the Dynamic Model (chillR) from hourly temperatures derived from GRIDMET daily maximum and minimum temperature at 4 km. Crop regions come from the 2022 USDA Cropland Data Layer. Trends use Sen's slope with an autocorrelation-adjusted Mann–Kendall test.</p>
<p>Projections use three CMIP6 models that perform well for California (ACCESS-CM2, EC-Earth3, EC-Earth3-Veg), downscaled with LOCA2, under SSP5-8.5 to match earlier chill assessments. ECMWF seasonal hindcasts (1981–2024) were downscaled to 4 km by applying forecast anomalies to the observed climatology with standard-deviation scaling.</p>
<p>Crop thresholds are the median requirement across cultivars: 58 CP for pistachio, 47.5 for walnut, 48 for cherry and 57.5 for plum.</p>
</div>
<div class="prose">
<p class="eyebrow">Limits</p>
<h2 style="font-size:1.4rem">Read with care</h2>
<ul>
<li>Median thresholds are regional benchmarks; individual cultivars can need more or less chill.</li>
<li>The interaction between chilling and spring heat accumulation is not modeled.</li>
<li>Projections use one high-emissions pathway, chosen to give the earliest plausible timeline.</li>
</ul>
<h3>Cite</h3>
{cite("Jha, P. K., A, G., Pathak, T. B. &amp; Velicogna, I. (2026). From intermittent to persistent chill insufficiency in California's specialty crops. Communications Sustainability, 1, 76. https://doi.org/10.1038/s44458-026-00084-0")}
</div>
</div></section>
<section><div class="wrap">{pager(("papers/mjo-prediction.html", "Deep learning MJO prediction", "Study 2"), ("papers/decision-tools.html", "Climate tools without climate consensus", "Study 4"), d)}</div></section>
"""
    return page("Orchard Chill Risk", "Study 3: rising variability is already causing chill shortfalls for California pistachio, plum and cherry; an in-season forecast gives growers a reliable answer by the end of January.", "p3", d, body)


# ---------------------------------------------------------------- Study 4
def tools():
    d = 1
    # native charts with exact published numbers
    def bars():
        rows = [("Currently using decision tools", 45, 37, "χ² = 2.29, p = 0.13"),
                ("Tools would be helpful", 77, 85, "χ² = 2.44, p = 0.12"),
                ("Interested in new online tools", 52, 73, "χ² = 11.05, p = 0.001")]
        W, rowH, ml, mr = 640, 74, 210, 90
        H = rowH * len(rows) + 40
        x = lambda v: ml + v / 100 * (W - ml - mr)
        out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Decision tool use and interest, producers versus advisors" style="width:100%;height:auto;display:block">']
        for v in (0, 25, 50, 75, 100):
            out.append(f'<line x1="{x(v):.1f}" x2="{x(v):.1f}" y1="6" y2="{H-28}" style="stroke:var(--grid)"/><text x="{x(v):.1f}" y="{H-10}" text-anchor="middle" style="font:12px var(--ui);fill:var(--ink-3)">{v}%</text>')
        for i, (lab, p, a, stat) in enumerate(rows):
            y0 = 10 + i * rowH
            out.append(f'<text x="{ml-12}" y="{y0+20}" text-anchor="end" style="font:600 13px var(--ui);fill:var(--ink)">{lab}</text>')
            out.append(f'<text x="{ml-12}" y="{y0+38}" text-anchor="end" style="font:12px var(--ui);fill:var(--ink-3)">{stat}</text>')
            for j, (v, c, who) in enumerate(((p, "var(--s1)", "Producers"), (a, "var(--s2)", "Advisors"))):
                yy = y0 + 6 + j * 24
                out.append(f'<rect x="{x(0)}" y="{yy}" width="{x(v)-x(0):.1f}" height="18" rx="3" style="fill:{c}"/>')
                out.append(f'<text x="{x(v)+6:.1f}" y="{yy+13}" style="font:600 12px var(--ui);fill:var(--ink)">{v}% <tspan style="font-weight:400;fill:var(--ink-2)">{who}</tspan></text>')
        out.append('</svg>')
        return "\n".join(out)

    def suff():
        rows = [("Producers, all", 56, 44), ("Producers, lower climate concern", 68, 32), ("Producers, higher climate concern", 40, 60), ("Advisors (about producers)", 24, 76)]
        W, rowH, ml = 640, 40, 230
        H = rowH * len(rows) + 46
        mid = ml + (W - ml) / 2; sc = (W - ml - 20) / 2 / 100
        out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Do producers have enough information to manage climate risk" style="width:100%;height:auto;display:block">',
               f'<text x="{mid-8}" y="14" text-anchor="end" style="font:600 12px var(--ui);fill:var(--ochre)">Not enough information</text>',
               f'<text x="{mid+8}" y="14" style="font:600 12px var(--ui);fill:var(--accent)">Enough information</text>']
        for i, (lab, yes, no) in enumerate(rows):
            y0 = 28 + i * rowH
            out.append(f'<text x="{ml-12}" y="{y0+17}" text-anchor="end" style="font:13px var(--ui);fill:var(--ink)">{lab}</text>')
            out.append(f'<rect x="{mid-no*sc:.1f}" y="{y0+4}" width="{no*sc:.1f}" height="20" rx="3" style="fill:var(--ochre);opacity:.85"/>')
            out.append(f'<rect x="{mid+1}" y="{y0+4}" width="{yes*sc:.1f}" height="20" rx="3" style="fill:var(--accent)"/>')
            out.append(f'<text x="{mid-no*sc-6:.1f}" y="{y0+18}" text-anchor="end" style="font:600 12px var(--ui);fill:var(--ink)">{no}%</text>')
            out.append(f'<text x="{mid+yes*sc+6:.1f}" y="{y0+18}" style="font:600 12px var(--ui);fill:var(--ink)">{yes}%</text>')
        out.append(f'<line x1="{mid}" x2="{mid}" y1="22" y2="{H-10}" style="stroke:var(--ink-3)"/></svg>')
        return "\n".join(out)

    body = head_block(
        "Study 4 of 4 · Use",
        "Climate tools without climate consensus: weather and climate decision support tools create openings for agricultural adaptation",
        "Natalia Pinzón, Isabella Velicogna, Leslie M. Roche, Mark H. Cooper, Samuel Ikendi, Lauren E. Parker, Vikram Koundinya, Namah Taku-Forchu, A. Geruo, Tapan B. Pathak",
        "<i>Climatic Change</i> 179, 226 (2026)", "10.1007/s10584-026-04253-x",
        [("Read the article", "https://doi.org/10.1007/s10584-026-04253-x"), ("Back to the overview", "../index.html#studies")])
    body += f"""
<section><div class="wrap" style="display:grid;gap:28px">
<p class="lede">Better forecasts only matter if people use them. A statewide survey of 383 California farmers and ranchers and 121 agricultural advisors finds that belief in climate change does not predict whether producers use weather and climate decision tools. Practical fit does. Tools can serve people who disagree about climate change, as long as they help with decisions they already make.</p>
{findings([
 ("p = 0.42", "No significant relationship between the Climate Concern Index and tool use, after controlling for age, farm size, years farming and generational status."),
 ("45% · 37%", "Producers and advisors currently using climate decision tools. The difference is not significant."),
 ("52% · 73%", "Producers and advisors interested in a new online tool, a significant gap (p = 0.001) that points to unmet demand."),
 ("56% vs 24%", "Producers who say they have enough information to manage climate risk, against advisors who think producers do.")])}
</div></section>

<section><div class="wrap two-col">
<figure class="panel" style="align-content:start"><div class="panel-head"><div><h2>Use and interest in decision tools</h2><p>Share of respondents agreeing. Table 2 of the article.</p></div></div>{bars()}<div class="legend"><span><span class="swatch" style="background:var(--s1)"></span>Producers (n = 383)</span><span><span class="swatch" style="background:var(--s2)"></span>Advisors (n = 121)</span></div></figure>
<figure class="panel" style="align-content:start"><div class="panel-head"><div><h2>Do producers have enough information?</h2><p>Producers answered for themselves; advisors answered about producers in their area. Fig. 3 of the article.</p></div></div>{suff()}<p class="note">The gap between producers and advisors is significant (z = −4.52, p &lt; 0.001), and remains so against producers with higher concern (χ² = 6.59, p = 0.010).</p></figure>
</div></section>

<section><div class="wrap two-col">
<div class="prose">
<p class="eyebrow">What the survey shows</p>
<h2 style="font-size:1.6rem">Concern shapes interest, not use</h2>
<p>Climate concern correlates with seeing climate impacts on one's own operation (r = 0.62), with thinking tools would be helpful (0.44) and with interest in new tools (0.33). It barely correlates with actual use (0.14). Use appears to depend on a separate threshold: trust in the source, direct relevance, hands-on help and time to learn.</p>
<p>Advisors and producers also judge "enough information" by different standards. Producers draw on experience and local observation; advisors on scientific literacy and long-range planning. For some producers, being told they lack information dismisses the decisions they already make well.</p>
<p>The authors describe decision tools as <em>boundary objects</em>: shared instruments that people with different views can use toward common goals such as irrigation, risk reduction or variety selection, without first agreeing on what causes climate change.</p>
</div>
<div class="prose">
<p class="eyebrow">Design priorities</p>
<h2 style="font-size:1.6rem">How tools should be built</h2>
<ul class="ledger" style="margin-top:6px">
<li><span class="tag">Fit</span><div><h4>Support decisions growers already make</h4><p>Embed forecasts in tools already in use, such as on-farm weather stations, and match decision calendars.</p></div></li>
<li><span class="tag">Learning</span><div><h4>Show trends and past years</h4><p>Comparisons with earlier seasons and shifting baselines let users build long-range understanding at their own pace.</p></div></li>
<li><span class="tag">Uncertainty</span><div><h4>Be open about uncertainty</h4><p>Ranges tied to specific decisions are easier to trust than single projections.</p></div></li>
<li><span class="tag">Language</span><div><h4>Allow more than one framing</h4><p>Offer both scientific and experiential language, and let users set their own thresholds.</p></div></li>
<li><span class="tag">Advisors</span><div><h4>Invest in trusted advisors</h4><p>Advisors are more interested in tools and translate them into local terms. Training and co-design with them widens reach.</p></div></li>
</ul>
</div>
</div></section>

<section><div class="wrap" style="display:grid;gap:36px">
<div class="fig-grid split">
{fig("ag-fig1.webp", "<b>Figure 1.</b> Responses to the six statements that make up the Climate Concern Index, for producers (a) and advisors (b). Advisors agree more on every item.", "Pinzón et al. 2026, Fig. 1, " + CC, d)}
{fig("ag-fig2.webp", "<b>Figure 2.</b> Climate Concern Index by respondent type (a), years farming (b) and generational status (c). Concern is lower among producers with more than 20 years of experience and among multigenerational producers.", "Pinzón et al. 2026, Fig. 2, " + CC, d)}
</div>
</div></section>

<section><div class="wrap two-col">
<div class="prose">
<p class="eyebrow">What we did</p>
<h2 style="font-size:1.4rem">Survey design</h2>
<p>Three online surveys (farmers, ranchers, advisors) were developed with stakeholder input, reviewed by a 19-member expert panel, piloted with 18 stakeholders and offered in English and Spanish. They went to 12,932 producers and 424 advisors in spring 2023. After 31 fraud-detection checks and removal of incomplete responses, 383 producer and 121 advisor responses remained.</p>
<p>The Climate Concern Index averages six agreement items covering expected change, interest in learning, evidence, human causes, abnormal change and need for action (Cronbach's α = 0.90).</p>
</div>
<div class="prose">
<p class="eyebrow">Limits and connection</p>
<h2 style="font-size:1.4rem">What it means for this program</h2>
<p>The survey was online and in two languages, so producers with limited internet access or who speak other languages are underrepresented, and tool use is self-reported.</p>
<p>For the outlooks in Studies 1–3, the lesson is to frame them around operational decisions, such as a drought trigger, a reservoir release window or a dormancy-treatment date, and to deliver them with Cooperative Extension advisors.</p>
<h3>Cite</h3>
{cite("Pinzón, N., Velicogna, I., Roche, L. M., Cooper, M. H., Ikendi, S., Parker, L. E., Koundinya, V., Taku-Forchu, N., A, G. &amp; Pathak, T. B. (2026). Climate tools without climate consensus: weather and climate decision support tools create openings for agricultural adaptation. Climatic Change, 179, 226. https://doi.org/10.1007/s10584-026-04253-x")}
</div>
</div></section>
<section><div class="wrap">{pager(("papers/chill-risk.html", "Chill insufficiency in specialty crops", "Study 3"), ("index.html", "Back to the overview", "Overview"), d)}</div></section>
"""
    return page("Decision Tools Survey", "Study 4: belief in climate change does not predict use of decision tools among California farmers and ranchers; practical fit does.", "p4", d, body)
