# Fusion Outlook — project website

Static website for the UC California Climate Action Seed Grant project
*"A fusion outlook product for predicting climate water variation toward efficient decision making"*
(UCOP R02CP7584, UC Irvine). It summarizes four peer-reviewed studies and hosts three interactive dashboards.

## Pages

| Path | Content |
|---|---|
| `index.html` | Landing page: project summary, how the studies connect, implications for agencies and funders, team, references |
| `papers/precipitation-shift.html` | Study 1 — Shalgumbayeva, A & Velicogna (2026), *Environ. Res. Commun.* 8, 041013 |
| `papers/mjo-prediction.html` | Study 2 — Virji, A & Velicogna (2026), *npj Clim. Atmos. Sci.* 9, 193 |
| `papers/chill-risk.html` | Study 3 — Jha, A, Pathak & Velicogna (2026), *Commun. Sustain.* 1, 76 |
| `papers/decision-tools.html` | Study 4 — Pinzón et al. (2026), *Climatic Change* 179, 226 |
| `dashboards/mjo.html` | MJO skill, history test, seasonality, FuXi-S2S forecast browser |
| `dashboards/precipitation.html` | Baseline comparison, moving windows, regional change, climate-mode predictors |
| `dashboards/chill.html` | Chill vs crop thresholds, variability vs mean shift, forecast accuracy |

No build step is needed to serve the site. Charts use D3 v7 from cdnjs; fonts from Google Fonts.

## Publish with GitHub Pages

1. Create a repository (e.g. `fusion-outlook`) and push the contents of this folder to `main`.
2. In the repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site appears at `https://<user>.github.io/<repo>/` within a minute or two.

The `.nojekyll` file stops GitHub from running Jekyll. To preview locally, run `python3 -m http.server` in this folder and open http://localhost:8000 (the dashboards load JSON with `fetch`, so opening the files directly from disk will not work).

## Data provenance

| File | Source | Method |
|---|---|---|
| `data/mjo/fuxi/*.json` | FuXi-S2S RMM forecast indices published at github.com/khalilv/mjo-predict | Repackaged by year: ensemble mean (`m`, 42×[RMM1, RMM2]) and 51 members (`e`, ×100 integers) |
| `data/mjo/fuxi_stats.json` | Same archive | Mean amplitude and spread by lead, computed over all 2,080 initializations |
| `data/mjo/skill.json` | Study 2, Figs. 1–6 and 8 | Digitized from the published raster figures; reproduces reported horizons and error reductions within 1 percentage point |
| `data/precip.json` | Study 1, Figs. 2e, 3b, 5c–d | Digitized (statewide series ±5 mm, regional bars ±3 mm) |
| `data/chill.json` | Study 3, Figs. 2–3, Supp. Fig. 6, Supp. Table 1 | Digitized series (±0.2 CP); Supp. Table 1 transcribed exactly |

To replace digitized values with the original data, keep the same JSON keys and overwrite the file; the dashboards need no changes.

Figures in `assets/img/` are reproduced from the open-access articles under CC BY 4.0 (cropped and recompressed).

## Edit the pages

Page text lives in `build/` (`p_index.py`, `p_papers.py`, `p_dash.py`; shared header and footer in `common.py`). Edit there and run `python3 build/build.py` to regenerate the HTML. Chart code is in `assets/*.js`, styles in `assets/site.css`.
