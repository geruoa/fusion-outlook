import json, os
from common import page
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def hero_strip():
    d = json.load(open(os.path.join(ROOT, 'data/precip.json')))['annual']
    yrs, mm = d['years'], d['mm']
    W, H = 640, 250
    ml, mr, mt, mb = 44, 10, 34, 30
    n = len(yrs)
    bw = (W - ml - mr) / n
    y = lambda v: H - mb - v / 1150 * (H - mt - mb)
    m1 = sum(mm[:20]) / 20; m2 = sum(mm[20:40]) / 20
    out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-labelledby="strip-t strip-d" style="width:100%;height:auto;display:block">',
           '<title id="strip-t">California water-year precipitation, 1982–2022</title>',
           f'<desc id="strip-d">Statewide mean precipitation averaged {m1:.0f} mm in water years 1982–2001 and {m2:.0f} mm in 2002–2021.</desc>']
    for v in (250, 500, 750, 1000):
        out.append(f'<line x1="{ml}" x2="{W-mr}" y1="{y(v):.1f}" y2="{y(v):.1f}" style="stroke:var(--grid)"/>')
        out.append(f'<text x="{ml-6}" y="{y(v)+4:.1f}" text-anchor="end" style="font:12px var(--ui);fill:var(--ink-3)">{v}</text>')
    for i, (yr, v) in enumerate(zip(yrs, mm)):
        x = ml + i * bw + bw * 0.14
        late = 2002 <= yr <= 2021
        out.append(f'<rect x="{x:.1f}" y="{y(v):.1f}" width="{bw*0.72:.1f}" height="{y(0)-y(v):.1f}" rx="1.5" style="fill:{"var(--accent)" if late else "var(--neutral-mark)"};opacity:{0.85 if late else 0.45}"><title>WY {yr}: {v} mm</title></rect>')
    x0, x20, x40 = ml, ml + 20 * bw, ml + 40 * bw
    out.append(f'<line x1="{x0:.1f}" x2="{x20:.1f}" y1="{y(m1):.1f}" y2="{y(m1):.1f}" style="stroke:var(--ink);stroke-width:2.5"/>')
    out.append(f'<line x1="{x20:.1f}" x2="{x40:.1f}" y1="{y(m2):.1f}" y2="{y(m2):.1f}" style="stroke:var(--ochre);stroke-width:2.5"/>')
    out.append(f'<line x1="{ml}" x2="{ml+22}" y1="12" y2="12" style="stroke:var(--ink);stroke-width:2.5"/>')
    out.append(f'<text x="{ml+28}" y="16" style="font:600 13px var(--ui);fill:var(--ink)">1982–2001 mean {m1:.0f} mm</text>')
    out.append(f'<line x1="{ml+236}" x2="{ml+258}" y1="12" y2="12" style="stroke:var(--ochre);stroke-width:2.5"/>')
    out.append(f'<text x="{ml+264}" y="16" style="font:600 13px var(--ui);fill:var(--ochre)">2002–2021 mean {m2:.0f} mm</text>')
    for yr in (1982, 1992, 2002, 2012, 2022):
        i = yrs.index(yr)
        out.append(f'<text x="{ml+i*bw+bw/2:.1f}" y="{H-mb+18}" text-anchor="middle" style="font:12px var(--ui);fill:var(--ink-3)">{yr}</text>')
    out.append('</svg>')
    return '\n'.join(out), m1, m2


def build():
    strip, m1, m2 = hero_strip()
    pct = (m2 / m1 - 1) * 100
    body = f"""
<section class="hero"><div class="wrap hero-grid">
<div>
<p class="eyebrow"><b>UC California Climate Action</b> · Seed Grant R02CP7584</p>
<h1>Seeing California's water and crop risks <em>weeks to seasons ahead</em></h1>
<p class="lede">We combine long observational records with AI weather models to answer three practical questions for California's water and agriculture sectors: what has already changed, what can be predicted 2 to 6 weeks out, and how those outlooks reach the people who make decisions.</p>
<div class="hero-meta">
<span><b>Lead</b> UC Irvine, Earth System Science</span>
<span><b>Partners</b> UC Agriculture and Natural Resources · UC Davis · UC Merced · NASA JPL</span>
<span><b>Output</b> 4 peer-reviewed studies · 3 dashboards</span>
</div>
<div class="hero-meta" style="margin-top:22px"><a class="btn solid" href="dashboards/index.html">Open the dashboards</a><a class="btn" href="#studies">Read the four studies</a></div>
</div>
<figure class="strip-card">
<h3>Statewide precipitation has stepped down since the late 1990s</h3>
<p class="sub">California water-year precipitation, 1982–2022 (PRISM observations). The 2002–2021 mean is {abs(pct):.0f}% below 1982–2001.</p>
{strip}
<p class="note" style="margin-top:6px">Values read from Fig. 3b of Shalgumbayeva et al. (2026) [1]. <a href="papers/precipitation-shift.html">About this study</a></p>
</figure>
</div></section>

<section id="studies"><div class="wrap">
<div class="sec-head">
<p class="eyebrow">How the work fits together</p>
<h2>One line of work, from diagnosis to decision</h2>
<p class="lede">Each study answers the question the previous one raises. The first shows that California's precipitation regime has shifted. The second asks how far ahead the main source of 2–6 week predictability can be forecast. The third shows what variability means for orchard crops and tests an in-season forecast. The fourth asks what makes growers and advisors use tools like these.</p>
</div>
<div class="chain">
<article class="study">
<p class="step"><i>1</i>Diagnose</p>
<h3><a href="papers/precipitation-shift.html">Recent shift in California's precipitation distribution</a></h3>
<p class="q">Has the distribution of precipitation shifted, and do climate modes explain it?</p>
<div><p class="figure-num">24% → 17%</p><p class="stat-label">Share of annual precipitation from extreme-wet months, 1982–2001 vs 2002–2021</p></div>
<p class="links"><a href="papers/precipitation-shift.html">Summary</a><a href="dashboards/precipitation.html">Dashboard</a></p>
</article>
<article class="study">
<p class="step"><i>2</i>Predict</p>
<h3><a href="papers/mjo-prediction.html">Deep learning MJO prediction: history and bias correction</a></h3>
<p class="q">How far ahead can AI forecast the Madden–Julian Oscillation, and what actually improves it?</p>
<div><p class="figure-num">40 <small>days</small></p><p class="stat-label">Skillful MJO lead time with the corrected AI foundation model, up from 37</p></div>
<p class="links"><a href="papers/mjo-prediction.html">Summary</a><a href="dashboards/mjo.html">Dashboard</a></p>
</article>
<article class="study">
<p class="step"><i>3</i>Impact</p>
<h3><a href="papers/chill-risk.html">From intermittent to persistent chill insufficiency</a></h3>
<p class="q">When does warming plus variability push orchard winter chill below crop needs?</p>
<div><p class="figure-num">~30%</p><p class="stat-label">Of the past 20 winters had too little chill for pistachio in regions south of 37°N</p></div>
<p class="links"><a href="papers/chill-risk.html">Summary</a><a href="dashboards/chill.html">Dashboard</a></p>
</article>
<article class="study">
<p class="step"><i>4</i>Use</p>
<h3><a href="papers/decision-tools.html">Climate tools without climate consensus</a></h3>
<p class="q">Does belief in climate change decide whether farmers and ranchers use decision tools?</p>
<div><p class="figure-num">p = 0.42</p><p class="stat-label">No link between climate concern and tool use among 383 producers</p></div>
<p class="links"><a href="papers/decision-tools.html">Summary</a></p>
</article>
</div>
</div></section>

<section><div class="wrap two-col">
<div>
<div class="sec-head"><p class="eyebrow">For water and agriculture agencies</p><h2>What the results mean for planning now</h2></div>
<ul class="ledger">
<li><span class="tag">Baselines</span><div><h4>Use a recent ~20-year climatology</h4><p>Mean precipitation and its variability have both declined since the late 1990s. A recent 20-year baseline describes today's hydroclimate better than a fixed 30-year normal, which can move drought triggers, rule curves and allocations. <a href="dashboards/precipitation.html">Compare baselines</a></p></div></li>
<li><span class="tag">Storms</span><div><h4>Plan for fewer large storms</h4><p>Extreme-wet months now supply less of the annual total. That raises the value of carryover storage and readiness to capture recharge when big storms do arrive.</p></div></li>
<li><span class="tag">Climate modes</span><div><h4>Use ENSO, PDO and similar indices for direction, not for wet-year size</h4><p>Climate modes and their interactions reproduce where drying occurs but explain only about 25% of year-to-year swings in wet months.</p></div></li>
<li><span class="tag">Weeks 3–6</span><div><h4>Use MJO outlooks when the signal is strong</h4><p>AI-based MJO forecasts stay skillful through 42 days when they start from a strong MJO, and the 2017 case study tracked the February event 3–4 weeks ahead. <a href="dashboards/mjo.html">Check a forecast</a></p></div></li>
<li><span class="tag">Orchards</span><div><h4>Decide on dormancy treatments with an end-of-January chill check</h4><p>Observed chill through January plus a 1-month ECMWF forecast for February lands within 10% of the season total in 41–42 of 43 years. <a href="dashboards/chill.html">See the risk</a></p></div></li>
</ul>
</div>
<div>
<div class="sec-head"><p class="eyebrow">For funders and program officers</p><h2>Why this is worth investing in</h2></div>
<ul class="ledger">
<li><span class="tag">New benchmark</span><div><h4>State-of-the-art MJO skill from an AI foundation model</h4><p>A lightweight correction model extends skillful MJO prediction from 37 to 40 days, compared with about 30 days for operational systems such as ECMWF. AI models also run orders of magnitude faster than physics models once trained.</p></div></li>
<li><span class="tag">Better methods</span><div><h4>Clear guidance on where gains come from</h4><p>Longer MJO history does not add skill, and much of the improvement credited to bias correction in earlier work reflects dataset mismatch. Effort is better spent on the initial atmospheric state and new training objectives.</p></div></li>
<li><span class="tag">Near-term risk</span><div><h4>Ag impacts are arriving earlier than projections say</h4><p>Rising variability already produces chill shortfalls that CMIP6 models, with about half the observed variability, mostly miss. Mid-century timelines understate the urgency for breeding and orchard planning.</p></div></li>
<li><span class="tag">Adoption</span><div><h4>Tools are adopted for usefulness, not belief</h4><p>Belief in climate change does not predict tool use. Tools that fit existing decisions and reach growers through advisors can serve users across political views.</p></div></li>
<li><span class="tag">Next steps</span><div><h4>Ready to extend</h4><p>Open questions the team is positioned to pursue: how often MJO forecasts produce false alarms for California precipitation, how to separate natural and human drivers of the drying, and how to extend skillful chill outlooks beyond one month.</p></div></li>
</ul>
</div>
</div></section>

<section id="dashboards"><div class="wrap">
<div class="sec-head"><p class="eyebrow">Interactive</p><h2>Dashboards</h2><p class="lede">Each dashboard is built from the published results and the public forecast archive. Every chart states where its numbers come from.</p></div>
<div class="findings three">
<a class="finding" href="dashboards/mjo.html" style="text-decoration:none;color:inherit"><p class="eyebrow">Study 2</p><p class="figure-num" style="font-size:1.35rem">MJO forecast skill</p><p>Skill by lead time and correction method, the history test, seasonality, and a browser for 2,080 FuXi-S2S ensemble forecasts from 2002–2021.</p></a>
<a class="finding" href="dashboards/precipitation.html" style="text-decoration:none;color:inherit"><p class="eyebrow">Study 1</p><p class="figure-num" style="font-size:1.35rem">Precipitation baselines</p><p>Compare a 30-year normal with a recent window, track moving 20-year statistics, and see regional and seasonal losses.</p></a>
<a class="finding" href="dashboards/chill.html" style="text-decoration:none;color:inherit"><p class="eyebrow">Study 3</p><p class="figure-num" style="font-size:1.35rem">Orchard chill risk</p><p>Chill portions against crop thresholds, the effect of variability versus the mean trend, and forecast accuracy by lead time.</p></a>
</div>
</div></section>

<section id="team"><div class="wrap two-col">
<div class="prose">
<p class="eyebrow">Team and funding</p>
<h2 style="font-size:1.6rem">Who did the work</h2>
<p>The project "A fusion outlook product for predicting climate water variation toward efficient decision making" is led by Isabella Velicogna (UC Irvine and NASA Jet Propulsion Laboratory) with Geruo A (UC Irvine). Study authors include Gulnaz Shalgumbayeva and Khalil Virji (UC Irvine), Prakash K. Jha and Tapan B. Pathak (UC Agriculture and Natural Resources, UC Merced), and Natalia Pinzón with colleagues across UC Davis, UC Cooperative Extension and the USDA California Climate Hub.</p>
<p>Funding: University of California Office of the President, California Climate Action Seed Grant R02CP7584. The decision-tools survey was also supported by USDA NIFA (2022-68017-36358, 2021-69012-35916). Computing for the MJO and chill analyses used NSF NCAR Derecho and Casper.</p>
</div>
<div class="prose" id="data">
<p class="eyebrow">Open data and code</p>
<h2 style="font-size:1.6rem">Reproduce the results</h2>
<ul>
<li>MJO models, bias correction and FuXi-S2S RMM forecast indices: <a href="https://github.com/khalilv/mjo-predict">github.com/khalilv/mjo-predict</a></li>
<li>Chill computations: <a href="https://github.com/pkj002/califo_work/tree/main/CommSust">github.com/pkj002/califo_work</a>; processed data: <a href="https://doi.org/10.5281/zenodo.20058559">doi.org/10.5281/zenodo.20058559</a></li>
<li>Precipitation supplementary data: <a href="https://doi.org/10.1088/2515-7620/ae5eda/data1">doi.org/10.1088/2515-7620/ae5eda/data1</a></li>
<li>Observations: <a href="https://prism.oregonstate.edu">PRISM</a>, <a href="https://www.northwestknowledge.net/metdata/data/">GRIDMET</a>, <a href="https://cimis.water.ca.gov">CIMIS</a>; forecasts: <a href="https://huggingface.co/datasets/FudanFuXi/FuXi-S2S">FuXi-S2S archive</a>, <a href="https://cds.climate.copernicus.eu/">ECMWF via Copernicus</a></li>
</ul>
</div>
</div></section>

<section id="references"><div class="wrap">
<div class="sec-head"><p class="eyebrow">References</p><h2>Publications</h2></div>
<ol class="refs">
<li>Shalgumbayeva, G., A, G. &amp; Velicogna, I. (2026). Recent shift in California's precipitation distribution based on observations. <i>Environmental Research Communications</i> 8, 041013. <a href="https://doi.org/10.1088/2515-7620/ae5eda">https://doi.org/10.1088/2515-7620/ae5eda</a></li>
<li>Virji, K., A, G. &amp; Velicogna, I. (2026). On the importance of historical context and bias correction in deep learning MJO prediction models. <i>npj Climate and Atmospheric Science</i> 9, 193. <a href="https://doi.org/10.1038/s41612-026-01459-9">https://doi.org/10.1038/s41612-026-01459-9</a></li>
<li>Jha, P. K., A, G., Pathak, T. B. &amp; Velicogna, I. (2026). From intermittent to persistent chill insufficiency in California's specialty crops. <i>Communications Sustainability</i> 1, 76. <a href="https://doi.org/10.1038/s44458-026-00084-0">https://doi.org/10.1038/s44458-026-00084-0</a></li>
<li>Pinzón, N., Velicogna, I., Roche, L. M., Cooper, M. H., Ikendi, S., Parker, L. E., Koundinya, V., Taku-Forchu, N., A, G. &amp; Pathak, T. B. (2026). Climate tools without climate consensus: weather and climate decision support tools create openings for agricultural adaptation. <i>Climatic Change</i> 179, 226. <a href="https://doi.org/10.1007/s10584-026-04253-x">https://doi.org/10.1007/s10584-026-04253-x</a></li>
</ol>
</div></section>
"""
    return page("Fusion Outlook", "Observations and AI for subseasonal-to-seasonal water and agriculture decisions in California: four UC Climate Action studies and interactive dashboards.", "home", 0, body)
