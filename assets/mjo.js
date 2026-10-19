/* MJO prediction dashboard */
(async function () {
  const S = await V.json('data/mjo/skill.json');
  const STATS = await V.json('data/mjo/fuxi_stats.json');
  const IDX = (await V.json('data/mjo/fuxi/index.json')).dates;
  const LEADS = d3.range(1, 43);
  const METHODS = [
    { k: 'fuxi', label: 'FuXi-S2S (uncorrected)', color: 'var(--neutral-mark)', dash: '5 4' },
    { k: 'mean', label: 'Mean bias correction', color: 'var(--s3)' },
    { k: 'mvlr', label: 'MVLR correction', color: 'var(--s2)' },
    { k: 'lstm', label: 'LSTM correction', color: 'var(--s1)' }
  ];
  const state = { metric: 'bcor', subset: 'all', show: { fuxi: true, mean: true, mvlr: true, lstm: true }, bias: 'amp_bias' };

  /* ---------------- skill vs lead ---------------- */
  const skillEl = document.getElementById('skill-chart');
  const skillTip = V.tip(skillEl);
  function horizon(v) { const i = v.findIndex((x) => x < 0.5); return i === -1 ? 42 : i; }
  function weekMean(v, a, b) { return d3.mean(v.slice(a - 1, b)); }

  function drawSkill() {
    const key = state.subset + '_' + state.metric;
    const C = S.curves[key];
    const W = Math.max(320, skillEl.clientWidth), H = Math.round(Math.min(420, Math.max(260, W * 0.5)));
    const m = { t: 14, r: 16, b: 40, l: 46 };
    const svg = V.svg(skillEl, W, H);
    svg.attr('aria-label', 'Forecast skill versus lead time');
    const x = d3.scaleLinear([1, 42], [m.l, W - m.r]);
    const isB = state.metric === 'bcor';
    const y = isB ? d3.scaleLinear([0.3, 1], [H - m.b, m.t]) : d3.scaleLinear([0, 2], [H - m.b, m.t]);
    // week bands
    [[1, 14, 'Weeks 1–2'], [15, 28, 'Weeks 3–4'], [29, 42, 'Weeks 5–6']].forEach(([a, b, lab], i) => {
      svg.append('rect').attr('x', x(a - 0.5)).attr('y', m.t).attr('width', x(b + 0.5) - x(a - 0.5)).attr('height', H - m.b - m.t)
        .style('fill', i % 2 ? 'var(--surface-2)' : 'transparent').style('opacity', 0.7);
      svg.append('text').attr('x', (x(a - 0.5) + x(b + 0.5)) / 2).attr('y', m.t + 12).attr('text-anchor', 'middle')
        .style('fill', 'var(--ink-3)').style('font-size', '10.5px').text(lab);
    });
    svg.append('g').attr('transform', `translate(${m.l},0)`).call((g) => V.gridY(g, y, W - m.l - m.r));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickValues([1, 7, 14, 21, 28, 35, 42]).tickSizeOuter(0));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(isB ? 7 : 8).tickSizeOuter(0));
    svg.append('text').attr('x', (W + m.l) / 2).attr('y', H - 6).attr('text-anchor', 'middle').text('Lead time (days)');
    svg.append('text').attr('transform', `translate(12,${(H - m.b + m.t) / 2}) rotate(-90)`).attr('text-anchor', 'middle')
      .text(isB ? 'Bivariate correlation (BCOR)' : 'Bivariate MSE (BMSE)');
    if (isB) {
      svg.append('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y(0.5)).attr('y2', y(0.5))
        .style('stroke', 'var(--ink-3)').style('stroke-dasharray', '2 3');
      svg.append('text').attr('x', m.l + 6).attr('y', y(0.5) + 14).style('fill', 'var(--ink-3)').style('font-size', '10.5px').text('Skill threshold 0.5');
    }
    const line = d3.line().x((d) => x(d.l)).y((d) => y(d.v));
    METHODS.forEach((M) => {
      if (!state.show[M.k] || !C[M.k]) return;
      const v = C[M.k].v, sig = C[M.k].sig;
      const pts = LEADS.map((l, i) => ({ l, v: v[i], s: M.k === 'fuxi' ? true : sig[i] !== false }));
      // draw significant and non-significant as separate passes
      svg.append('path').datum(pts).attr('d', line).style('fill', 'none').style('stroke', M.color)
        .style('stroke-width', 2).style('stroke-dasharray', M.dash || null).style('opacity', 0.35);
      const segs = []; let run = [];
      for (let i = 0; i < pts.length; i++) {
        if (pts[i].s) { run.push(pts[i]); } else { if (run.length > 1) segs.push(run); run = []; }
      }
      if (run.length > 1) segs.push(run);
      segs.forEach((sg) => svg.append('path').datum(sg).attr('d', line).style('fill', 'none').style('stroke', M.color)
        .style('stroke-width', 2.2).style('stroke-dasharray', M.dash || null).style('stroke-linejoin', 'round'));
    });
    // hover
    const cross = svg.append('line').style('stroke', 'var(--ink-3)').style('stroke-width', 1).attr('y1', m.t).attr('y2', H - m.b).style('opacity', 0);
    svg.append('rect').attr('x', m.l).attr('y', m.t).attr('width', W - m.l - m.r).attr('height', H - m.t - m.b).style('fill', 'transparent')
      .on('pointermove', (ev) => {
        const [px] = d3.pointer(ev); const l = Math.max(1, Math.min(42, Math.round(x.invert(px))));
        cross.attr('x1', x(l)).attr('x2', x(l)).style('opacity', 1);
        let html = `<div class="t">Lead ${l} day${l > 1 ? 's' : ''}</div>`;
        METHODS.forEach((M) => { if (state.show[M.k] && C[M.k]) { const s = M.k !== 'fuxi' && C[M.k].sig[l - 1] === false ? ' <span class="muted">(n.s.)</span>' : ''; html += V.row(M.color, M.label.replace(' correction', ''), V.fmt.p3(C[M.k].v[l - 1]) + s, !!M.dash); } });
        const r = skillEl.getBoundingClientRect(); skillTip.show(html, ev.clientX - r.left, ev.clientY - r.top);
      })
      .on('pointerleave', () => { cross.style('opacity', 0); skillTip.hide(); });
    drawReadout(C);
  }

  function drawReadout(C) {
    const el = document.getElementById('skill-readout');
    const sub = { all: 'all forecasts', high: 'high-amplitude forecasts (FuXi-S2S amplitude ≥ 1)', low: 'low-amplitude forecasts (amplitude < 1)', bom: 'all forecasts, verified against Bureau of Meteorology RMM' }[state.subset];
    if (state.metric === 'bcor') {
      const rows = METHODS.map((M) => {
        const h = horizon(C[M.k].v); const txt = h >= 42 ? '≥ 42' : String(h);
        return `<tr><td><span class="swatch${M.dash ? ' dash' : ''}" style="background:${M.dash ? '' : M.color}"></span> ${M.label}</td><td>${txt}</td></tr>`;
      }).join('');
      el.innerHTML = `<p class="note">Skillful horizon = last lead day with BCOR ≥ 0.5, for ${sub}.</p>
        <div class="table-wrap"><table class="data"><thead><tr><th>Method</th><th>Skillful days</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    } else {
      const f = C.fuxi.v;
      const cell = (M, a, b) => {
        if (M.k === 'fuxi') return V.fmt.p2(weekMean(f, a, b));
        if (a === 1 && state.subset !== 'bom') return '<span class="muted">negligible</span>';
        const ch = weekMean(C[M.k].v, a, b) / weekMean(f, a, b) - 1;
        return (ch <= 0 ? '−' : '+') + Math.abs(ch * 100).toFixed(0) + '%';
      };
      const rows = METHODS.map((M) => `<tr><td><span class="swatch${M.dash ? ' dash' : ''}" style="background:${M.dash ? '' : M.color}"></span> ${M.label}</td><td>${cell(M, 1, 14)}</td><td>${cell(M, 15, 28)}</td><td>${cell(M, 29, 42)}</td></tr>`).join('');
      el.innerHTML = `<p class="note">FuXi-S2S row: mean BMSE. Correction rows: change in mean BMSE relative to FuXi-S2S, for ${sub}.</p>
        <div class="table-wrap"><table class="data"><thead><tr><th>Method</th><th>Wk 1–2</th><th>Wk 3–4</th><th>Wk 5–6</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    }
  }

  V.seg(document.getElementById('metric-seg'), [['bcor', 'Correlation'], ['bmse', 'Error (BMSE)']], 'bcor', (v) => { state.metric = v; drawSkill(); });
  V.seg(document.getElementById('subset-seg'), [['all', 'All'], ['high', 'Strong MJO'], ['low', 'Weak MJO'], ['bom', 'vs BoM indices']], 'all', (v) => { state.subset = v; drawSkill(); });
  const lg = document.getElementById('method-toggles');
  METHODS.forEach((M) => {
    const lab = document.createElement('label'); lab.className = 'toggle';
    lab.innerHTML = `<input type="checkbox" id="show-${M.k}" checked> <span class="swatch${M.dash ? ' dash' : ''}" style="background:${M.dash ? '' : M.color}"></span>${M.label}`;
    lab.querySelector('input').addEventListener('change', (e) => { state.show[M.k] = e.target.checked; drawSkill(); });
    lg.appendChild(lab);
  });

  /* ---------------- bias ---------------- */
  const biasEl = document.getElementById('bias-chart'); const biasTip = V.tip(biasEl);
  function drawBias() {
    const C = S.curves[state.bias];
    const W = Math.max(300, biasEl.clientWidth), H = Math.round(Math.min(320, Math.max(220, W * 0.55)));
    const m = { t: 12, r: 14, b: 40, l: 46 };
    const svg = V.svg(biasEl, W, H);
    const x = d3.scaleLinear([1, 42], [m.l, W - m.r]);
    const ext = state.bias === 'amp_bias' ? [-0.7, 0.1] : [-0.35, 0.15];
    const y = d3.scaleLinear(ext, [H - m.b, m.t]);
    svg.append('g').attr('transform', `translate(${m.l},0)`).call((g) => V.gridY(g, y, W - m.l - m.r));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickValues([1, 7, 14, 21, 28, 35, 42]).tickSizeOuter(0));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(6).tickSizeOuter(0));
    svg.append('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y(0)).attr('y2', y(0)).style('stroke', 'var(--ink-3)');
    svg.append('text').attr('x', (W + m.l) / 2).attr('y', H - 6).attr('text-anchor', 'middle').text('Lead time (days)');
    svg.append('text').attr('transform', `translate(12,${(H - m.b + m.t) / 2}) rotate(-90)`).attr('text-anchor', 'middle').text(state.bias === 'amp_bias' ? 'Amplitude bias' : 'Phase bias (rad)');
    const line = d3.line().x((d, i) => x(i + 1)).y((d) => y(d));
    METHODS.forEach((M) => svg.append('path').datum(C[M.k].v).attr('d', line).style('fill', 'none').style('stroke', M.color).style('stroke-width', 2).style('stroke-dasharray', M.dash || null));
    const cross = svg.append('line').style('stroke', 'var(--ink-3)').attr('y1', m.t).attr('y2', H - m.b).style('opacity', 0);
    svg.append('rect').attr('x', m.l).attr('y', m.t).attr('width', W - m.l - m.r).attr('height', H - m.t - m.b).style('fill', 'transparent')
      .on('pointermove', (ev) => {
        const [px] = d3.pointer(ev); const l = Math.max(1, Math.min(42, Math.round(x.invert(px))));
        cross.attr('x1', x(l)).attr('x2', x(l)).style('opacity', 1);
        let html = `<div class="t">Lead ${l} days</div>`;
        METHODS.forEach((M) => { html += V.row(M.color, M.label.replace(' correction', ''), V.fmt.p3(C[M.k].v[l - 1]), !!M.dash); });
        const r = biasEl.getBoundingClientRect(); biasTip.show(html, ev.clientX - r.left, ev.clientY - r.top);
      }).on('pointerleave', () => { cross.style('opacity', 0); biasTip.hide(); });
  }
  V.seg(document.getElementById('bias-seg'), [['amp_bias', 'Amplitude'], ['phase_bias', 'Phase']], 'amp_bias', (v) => { state.bias = v; drawBias(); });

  /* ---------------- lookback ---------------- */
  const lbEl = document.getElementById('lookback-chart'); const lbTip = V.tip(lbEl);
  function drawLookback() {
    const LB = S.lookback; const cats = LB.lookbacks;
    const W = Math.max(300, lbEl.clientWidth), H = Math.round(Math.min(330, Math.max(240, W * 0.6)));
    const m = { t: 14, r: 14, b: 44, l: 44 };
    const svg = V.svg(lbEl, W, H);
    const x = d3.scalePoint(cats, [m.l + 14, W - m.r - 14]);
    const y = d3.scaleLinear([0, 45], [H - m.b, m.t]);
    svg.append('g').attr('transform', `translate(${m.l},0)`).call((g) => V.gridY(g, y, W - m.l - m.r));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickSizeOuter(0));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).tickValues([0, 10, 20, 30, 40]).tickSizeOuter(0));
    svg.append('text').attr('x', (W + m.l) / 2).attr('y', H - 8).attr('text-anchor', 'middle').text('Days of MJO history given to the model (lookback L)');
    svg.append('text').attr('transform', `translate(12,${(H - m.b + m.t) / 2}) rotate(-90)`).attr('text-anchor', 'middle').text('Skillful days (BCOR ≥ 0.5)');
    svg.append('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y(LB.fuxi)).attr('y2', y(LB.fuxi)).style('stroke', 'var(--neutral-mark)').style('stroke-dasharray', '5 4');
    svg.append('text').attr('x', (x('90') + x('180')) / 2).attr('y', y(LB.fuxi) + 15).attr('text-anchor', 'middle').style('font-size', '10.5px').style('fill', 'var(--ink-2)').text('FuXi-S2S alone: 37 days');
    const series = [
      { k: 'TFT', g: 'history_only', c: 'var(--s1)', fill: false, dx: -6, lab: 'TFT, history only' },
      { k: 'TSMixer', g: 'history_only', c: 'var(--s2)', fill: false, dx: 6, lab: 'TSMixer, history only' },
      { k: 'TFT', g: 'fusion', c: 'var(--s1)', fill: true, dx: -6, lab: 'TFT, history + FuXi-S2S' },
      { k: 'TSMixer', g: 'fusion', c: 'var(--s2)', fill: true, dx: 6, lab: 'TSMixer, history + FuXi-S2S' }
    ];
    series.forEach((s) => {
      const vals = LB[s.g][s.k];
      const cens = s.g === 'fusion' && LB.fusion_censored[s.k];
      vals.forEach((v, i) => {
        const cx = x(cats[i]) + s.dx, cy = y(v);
        const node = cens && cens[i]
          ? svg.append('path').attr('d', d3.symbol(d3.symbolTriangle, 70)()).attr('transform', `translate(${cx},${cy})`)
          : svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 5);
        node.style('fill', s.fill ? s.c : 'var(--surface)').style('stroke', s.c).style('stroke-width', 2);
        svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 11).style('fill', 'transparent')
          .on('pointerenter', (ev) => {
            const r = lbEl.getBoundingClientRect();
            lbTip.show(`<div class="t">${s.lab}</div><div class="r"><i>Lookback</i><b>${cats[i] === '∅' ? 'none' : cats[i] + ' d'}</b></div><div class="r"><i>Skillful days</i><b>${cens && cens[i] ? '≥ 42' : v === 0 ? 'none' : v}</b></div>`, ev.clientX - r.left, ev.clientY - r.top);
          }).on('pointerleave', () => lbTip.hide());
      });
    });
  }

  /* ---------------- seasonality ---------------- */
  const seEl = document.getElementById('season-chart'); const seTip = V.tip(seEl);
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function drawSeason() {
    const G = S.season_bins; // [month][lead] lower bin edge
    const W = Math.max(300, seEl.clientWidth), H = Math.round(Math.min(380, Math.max(240, W * 0.55)));
    const m = { t: 10, r: 14, b: 36, l: 44 };
    const svg = V.svg(seEl, W, H);
    const x = d3.scaleBand(MON, [m.l, W - m.r]).padding(0.04);
    const y = d3.scaleBand(LEADS.slice().reverse(), [m.t, H - m.b]).padding(0);
    // diverging around the 0.5 skill threshold: warm below, blue above
    const BIN = { 0.1: '#e9a25a', 0.2: '#efb578', 0.3: '#f3c896', 0.4: '#f8dfc0', 0.5: '#cde2fb', 0.6: '#9ec5f4', 0.7: '#5598e7', 0.8: '#2a78d6', 0.9: '#184f95' };
    const col = (v) => BIN[(Math.round((v - 0.05) * 10) / 10).toFixed(1) * 1] || '#184f95';
    G.forEach((row, mi) => row.forEach((v, li) => {
      svg.append('rect').attr('x', x(MON[mi])).attr('y', y(li + 1)).attr('width', x.bandwidth()).attr('height', y.bandwidth() + 0.5)
        .style('fill', col(v + 0.05)).attr('shape-rendering', 'crispEdges')
        .on('pointerenter', (ev) => { const r = seEl.getBoundingClientRect(); seTip.show(`<div class="t">${MON[mi]} start · lead ${li + 1} d</div><div class="r"><i>BCOR band</i><b>${v.toFixed(1)}–${(v + 0.1).toFixed(1)}</b></div>`, ev.clientX - r.left, ev.clientY - r.top); })
        .on('pointerleave', () => seTip.hide());
    }));
    // 0.5 horizon step line
    const hz = G.map((row) => { const i = row.findIndex((v) => v < 0.5); return i === -1 ? 42 : i; });
    hz.forEach((h, mi) => {
      if (h >= 42) return;
      svg.append('line').attr('x1', x(MON[mi])).attr('x2', x(MON[mi]) + x.bandwidth()).attr('y1', y(h) + y.bandwidth()).attr('y2', y(h) + y.bandwidth())
        .style('stroke', 'var(--ochre)').style('stroke-width', 2.5);
      svg.append('text').attr('x', x(MON[mi]) + x.bandwidth() / 2).attr('y', y(h) + y.bandwidth() + 14).attr('text-anchor', 'middle').style('fill', 'var(--ink)').style('stroke', 'var(--surface)').style('stroke-width', 3).style('paint-order', 'stroke').style('font-weight', 600).style('font-size', '10.5px').text(h + ' d');
    });
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickSizeOuter(0));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).tickValues([1, 7, 14, 21, 28, 35, 42]).tickSizeOuter(0));
    svg.append('text').attr('transform', `translate(12,${(H - m.b + m.t) / 2}) rotate(-90)`).attr('text-anchor', 'middle').text('Lead time (days)');
    svg.append('text').attr('x', (W + m.l) / 2).attr('y', H - 4).attr('text-anchor', 'middle').text('Forecast initialization month');
    // legend
    const lgEl = document.getElementById('season-legend');
    lgEl.innerHTML = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((v) => `<span><span class="swatch" style="width:18px;height:10px;background:${col(v + 0.05)}"></span>${v.toFixed(1)}</span>`).join('') +
      '<span><span class="swatch" style="width:18px;background:var(--ochre)"></span>BCOR falls below 0.5</span>';
  }

  /* ---------------- archive explorer ---------------- */
  const yearSel = document.getElementById('init-year'), dateSel = document.getElementById('init-date');
  const years = [...new Set(IDX.map((d) => d.slice(0, 4)))];
  years.forEach((y) => yearSel.add(new Option(y, y)));
  const cache = {};
  async function loadYear(y) { if (!cache[y]) cache[y] = await V.json(`data/mjo/fuxi/${y}.json`); return cache[y]; }
  function fillDates(y, pick) {
    dateSel.innerHTML = '';
    IDX.filter((d) => d.startsWith(y)).forEach((d) => dateSel.add(new Option(d, d)));
    if (pick) dateSel.value = pick;
  }
  const phEl = document.getElementById('phase-chart'), amEl = document.getElementById('amp-chart');
  const phTip = V.tip(phEl), amTip = V.tip(amEl);
  let cur = null;
  const phaseOf = (r1, r2) => { const a = Math.atan2(r2, r1) * 180 / Math.PI; return Math.min(8, Math.floor((a + 180) / 45) + 1); };
  const addDays = (d, n) => { const t = new Date(d + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };

  async function showDate(d) {
    const yr = d.slice(0, 4); const Y = await loadYear(yr); const F = Y[d];
    const members = F.e.map((flat) => d3.range(42).map((i) => [flat[2 * i] / 100, flat[2 * i + 1] / 100]));
    cur = { d, mean: F.m, members };
    drawPhase(); drawAmp(); drawExplorerReadout();
  }

  function drawPhase() {
    if (!cur) return;
    const W = Math.max(280, Math.min(phEl.clientWidth, 520)), H = W;
    const m = 34; const svg = V.svg(phEl, W, H);
    svg.attr('aria-label', 'RMM phase-space trajectory');
    const lim = Math.max(3, Math.ceil(d3.max(cur.members.flat(), (p) => Math.max(Math.abs(p[0]), Math.abs(p[1]))) * 2) / 2);
    const s = d3.scaleLinear([-lim, lim], [m, W - m]); const sy = d3.scaleLinear([-lim, lim], [H - m, m]);
    const g = svg.append('g');
    // sector lines and unit circle
    [[-lim, -lim, lim, lim], [-lim, lim, lim, -lim], [-lim, 0, lim, 0], [0, -lim, 0, lim]].forEach(([a, b, c, e], i) =>
      g.append('line').attr('x1', s(a)).attr('y1', sy(b)).attr('x2', s(c)).attr('y2', sy(e)).style('stroke', 'var(--rule)').style('stroke-width', 1));
    g.append('circle').attr('cx', s(0)).attr('cy', sy(0)).attr('r', s(1) - s(0)).style('fill', 'var(--surface-2)').style('stroke', 'var(--rule-strong)');
    g.append('rect').attr('x', m).attr('y', m).attr('width', W - 2 * m).attr('height', H - 2 * m).style('fill', 'none').style('stroke', 'var(--rule-strong)');
    // phase labels
    for (let p = 1; p <= 8; p++) {
      const ang = (-180 + 45 * (p - 1) + 22.5) * Math.PI / 180, rr = lim * 0.9;
      g.append('text').attr('x', s(rr * Math.cos(ang))).attr('y', sy(rr * Math.sin(ang)) + 4).attr('text-anchor', 'middle').style('fill', 'var(--ink-3)').style('font-size', '11px').text('P' + p);
    }
    const reg = [['Western Pacific', 0, lim * 0.97, 0], ['Indian Ocean', 0, -lim * 0.97, 0], ['W. Hem. & Africa', -lim * 0.97, 0, -90], ['Maritime Continent', lim * 0.97, 0, 90]];
    reg.forEach(([t, a, b, rot]) => g.append('text').attr('transform', `translate(${s(a)},${sy(b) + (rot ? 0 : (b > 0 ? 12 : -4))}) rotate(${rot})`).attr('text-anchor', 'middle').style('fill', 'var(--ink-3)').style('font-size', '10.5px').text(t));
    svg.append('text').attr('x', W / 2).attr('y', H - 8).attr('text-anchor', 'middle').text('RMM1');
    svg.append('text').attr('transform', `translate(12,${H / 2}) rotate(-90)`).attr('text-anchor', 'middle').text('RMM2');
    const line = d3.line().x((p) => s(p[0])).y((p) => sy(p[1])).curve(d3.curveCatmullRom.alpha(0.5));
    const showMem = document.getElementById('show-members').checked;
    if (showMem) cur.members.forEach((mm) => svg.append('path').datum(mm).attr('d', line).style('fill', 'none').style('stroke', 'var(--ink-3)').style('stroke-width', 1).style('opacity', 0.22));
    svg.append('path').datum(cur.mean).attr('d', line).style('fill', 'none').style('stroke', 'var(--surface)').style('stroke-width', 5);
    svg.append('path').datum(cur.mean).attr('d', line).style('fill', 'none').style('stroke', 'var(--s1)').style('stroke-width', 2.5);
    cur.mean.forEach((p, i) => {
      if (i % 5 !== 0 && i !== 41) return;
      svg.append('circle').attr('cx', s(p[0])).attr('cy', sy(p[1])).attr('r', i === 0 ? 6 : 4).style('fill', i === 0 ? 'var(--s1)' : 'var(--surface)').style('stroke', 'var(--s1)').style('stroke-width', 2);
      if (i === 0 || i === 41) svg.append('text').attr('x', s(p[0]) + 8).attr('y', sy(p[1]) - 8).style('fill', 'var(--ink)').style('font-weight', 600).text(i === 0 ? 'day 1' : 'day 42');
    });
    svg.append('rect').attr('x', m).attr('y', m).attr('width', W - 2 * m).attr('height', H - 2 * m).style('fill', 'transparent')
      .on('pointermove', (ev) => {
        const [px, py] = d3.pointer(ev);
        let best = 0, bd = 1e9; cur.mean.forEach((p, i) => { const dd = (s(p[0]) - px) ** 2 + (sy(p[1]) - py) ** 2; if (dd < bd) { bd = dd; best = i; } });
        if (bd > 900) { phTip.hide(); return; }
        const p = cur.mean[best];
        const r = phEl.getBoundingClientRect();
        phTip.show(`<div class="t">Lead ${best + 1} d · ${addDays(cur.d, best + 1)}</div><div class="r"><i>Phase</i><b>${phaseOf(p[0], p[1])}</b></div><div class="r"><i>Amplitude (ens. mean)</i><b>${V.fmt.p2(Math.hypot(p[0], p[1]))}</b></div>`, ev.clientX - r.left, ev.clientY - r.top);
      }).on('pointerleave', () => phTip.hide());
  }

  function drawAmp() {
    if (!cur) return;
    const W = Math.max(280, amEl.clientWidth), H = Math.round(Math.min(300, Math.max(210, W * 0.6)));
    const m = { t: 12, r: 14, b: 40, l: 42 };
    const svg = V.svg(amEl, W, H);
    const amps = d3.range(42).map((i) => cur.members.map((mm) => Math.hypot(mm[i][0], mm[i][1])).sort(d3.ascending));
    const q = (a, p) => d3.quantileSorted(a, p);
    const x = d3.scaleLinear([1, 42], [m.l, W - m.r]);
    const y = d3.scaleLinear([0, Math.max(2.5, d3.max(amps, (a) => q(a, 0.9)) * 1.08)], [H - m.b, m.t]);
    svg.append('g').attr('transform', `translate(${m.l},0)`).call((g) => V.gridY(g, y, W - m.l - m.r));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickValues([1, 7, 14, 21, 28, 35, 42]).tickSizeOuter(0));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5).tickSizeOuter(0));
    svg.append('text').attr('x', (W + m.l) / 2).attr('y', H - 6).attr('text-anchor', 'middle').text('Lead time (days)');
    svg.append('text').attr('transform', `translate(12,${(H - m.b + m.t) / 2}) rotate(-90)`).attr('text-anchor', 'middle').text('MJO amplitude');
    svg.append('path').datum(amps).attr('d', d3.area().x((d, i) => x(i + 1)).y0((a) => y(q(a, 0.1))).y1((a) => y(q(a, 0.9)))).style('fill', 'var(--s1)').style('opacity', 0.16);
    svg.append('path').datum(amps).attr('d', d3.line().x((d, i) => x(i + 1)).y((a) => y(q(a, 0.5)))).style('fill', 'none').style('stroke', 'var(--s1)').style('stroke-width', 1.5).style('stroke-dasharray', '2 3');
    svg.append('path').datum(cur.mean).attr('d', d3.line().x((d, i) => x(i + 1)).y((p) => y(Math.hypot(p[0], p[1])))).style('fill', 'none').style('stroke', 'var(--s1)').style('stroke-width', 2.5);
    svg.append('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y(1)).attr('y2', y(1)).style('stroke', 'var(--ochre)').style('stroke-dasharray', '4 3');
    svg.append('text').attr('x', m.l + 6).attr('y', y(1) + 14).style('fill', 'var(--ochre)').style('font-size', '10.5px').text('Strong-MJO threshold (1.0)');
    const cross = svg.append('line').style('stroke', 'var(--ink-3)').attr('y1', m.t).attr('y2', H - m.b).style('opacity', 0);
    svg.append('rect').attr('x', m.l).attr('y', m.t).attr('width', W - m.l - m.r).attr('height', H - m.t - m.b).style('fill', 'transparent')
      .on('pointermove', (ev) => {
        const [px] = d3.pointer(ev); const l = Math.max(1, Math.min(42, Math.round(x.invert(px)))); const a = amps[l - 1];
        cross.attr('x1', x(l)).attr('x2', x(l)).style('opacity', 1);
        const r = amEl.getBoundingClientRect();
        amTip.show(`<div class="t">Lead ${l} d · ${addDays(cur.d, l)}</div>
          <div class="r"><i>Ensemble-mean amplitude</i><b>${V.fmt.p2(Math.hypot(...cur.mean[l - 1]))}</b></div>
          <div class="r"><i>Member median</i><b>${V.fmt.p2(q(a, 0.5))}</b></div>
          <div class="r"><i>Members 10–90%</i><b>${V.fmt.p2(q(a, 0.1))}–${V.fmt.p2(q(a, 0.9))}</b></div>
          <div class="r"><i>Members ≥ 1.0</i><b>${Math.round(100 * a.filter((v) => v >= 1).length / a.length)}%</b></div>`, ev.clientX - r.left, ev.clientY - r.top);
      }).on('pointerleave', () => { cross.style('opacity', 0); amTip.hide(); });
  }

  function drawExplorerReadout() {
    const el = document.getElementById('explorer-readout');
    const p0 = cur.mean[0]; const a0 = Math.hypot(...p0);
    const below = cur.mean.findIndex((p) => Math.hypot(...p) < 1);
    const frac = (i) => Math.round(100 * cur.members.filter((mm) => Math.hypot(...mm[i]) >= 1).length / cur.members.length);
    const strong = a0 >= 1;
    el.innerHTML = `
      <div><span class="pill ${strong ? 'good' : 'warn'}">${strong ? 'Strong MJO at start' : 'Weak MJO at start'}</span></div>
      <p>Initialized <strong>${cur.d}</strong>. Day-1 forecast: phase <strong>${phaseOf(...p0)}</strong>, amplitude <strong>${V.fmt.p2(a0)}</strong>.</p>
      <p>Ensemble-mean amplitude ${below === -1 ? 'stays at or above 1.0 through day 42' : below === 0 ? 'starts below 1.0' : `falls below 1.0 on day <strong>${below + 1}</strong>`}. Members with amplitude ≥ 1.0: <strong>${frac(13)}%</strong> on day 14, <strong>${frac(27)}%</strong> on day 28, <strong>${frac(41)}%</strong> on day 42.</p>
      <p class="note">${strong ? 'In the paper, forecasts that start with a strong MJO remained skillful through the full 42-day horizon.' : 'In the paper, forecasts predicting a weak MJO were skillful to about 24 days; treat weeks 4–6 with caution.'}</p>`;
  }

  yearSel.addEventListener('change', () => { fillDates(yearSel.value); showDate(dateSel.value); });
  dateSel.addEventListener('change', () => showDate(dateSel.value));
  document.getElementById('show-members').addEventListener('change', drawPhase);
  document.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => {
    const d = b.dataset.preset; yearSel.value = d.slice(0, 4); fillDates(d.slice(0, 4), d); showDate(d);
  }));

  /* ---------------- damping diagnostic ---------------- */
  const dpEl = document.getElementById('damp-chart'); const dpTip = V.tip(dpEl);
  function drawDamp() {
    const W = Math.max(300, dpEl.clientWidth), H = Math.round(Math.min(300, Math.max(210, W * 0.55)));
    const m = { t: 12, r: 14, b: 40, l: 44 };
    const svg = V.svg(dpEl, W, H);
    const x = d3.scaleLinear([1, 42], [m.l, W - m.r]); const y = d3.scaleLinear([0.8, 1.9], [H - m.b, m.t]);
    svg.append('g').attr('transform', `translate(${m.l},0)`).call((g) => V.gridY(g, y, W - m.l - m.r));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickValues([1, 7, 14, 21, 28, 35, 42]).tickSizeOuter(0));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5).tickSizeOuter(0));
    svg.append('text').attr('x', (W + m.l) / 2).attr('y', H - 6).attr('text-anchor', 'middle').text('Lead time (days)');
    svg.append('text').attr('transform', `translate(12,${(H - m.b + m.t) / 2}) rotate(-90)`).attr('text-anchor', 'middle').text('Mean MJO amplitude');
    const ser = [
      ['amp_member_strong', 'Members, strong-MJO starts', 'var(--s2)', null], ['amp_ensmean_strong', 'Ensemble mean, strong-MJO starts', 'var(--s2)', '5 4'],
      ['amp_member_all', 'Members, all starts', 'var(--s1)', null], ['amp_ensmean_all', 'Ensemble mean, all starts', 'var(--s1)', '5 4']];
    const line = d3.line().x((d, i) => x(i + 1)).y((d) => y(d));
    ser.forEach(([k, , c, da]) => svg.append('path').datum(STATS[k]).attr('d', line).style('fill', 'none').style('stroke', c).style('stroke-width', 2.2).style('stroke-dasharray', da));
    document.getElementById('damp-legend').innerHTML = ser.map(([, l, c, da]) => `<span><span class="swatch" style="background:${da ? `repeating-linear-gradient(90deg, ${c} 0 4px, transparent 4px 7px)` : c}"></span>${l}</span>`).join('');
    const cross = svg.append('line').style('stroke', 'var(--ink-3)').attr('y1', m.t).attr('y2', H - m.b).style('opacity', 0);
    svg.append('rect').attr('x', m.l).attr('y', m.t).attr('width', W - m.l - m.r).attr('height', H - m.t - m.b).style('fill', 'transparent')
      .on('pointermove', (ev) => {
        const [px] = d3.pointer(ev); const l = Math.max(1, Math.min(42, Math.round(x.invert(px))));
        cross.attr('x1', x(l)).attr('x2', x(l)).style('opacity', 1);
        const r = dpEl.getBoundingClientRect();
        dpTip.show(`<div class="t">Lead ${l} days</div>` + ser.map(([k, lab, c]) => V.row(c, lab, V.fmt.p2(STATS[k][l - 1]))).join(''), ev.clientX - r.left, ev.clientY - r.top);
      }).on('pointerleave', () => { cross.style('opacity', 0); dpTip.hide(); });
  }

  /* ---------------- boot ---------------- */
  const all = () => { drawSkill(); drawBias(); drawLookback(); drawSeason(); drawPhase(); drawAmp(); drawDamp(); };
  [skillEl, biasEl, lbEl, seEl, phEl, amEl, dpEl].forEach((el) => V.onResize(el, () => {
    ({ 'skill-chart': drawSkill, 'bias-chart': drawBias, 'lookback-chart': drawLookback, 'season-chart': drawSeason, 'phase-chart': drawPhase, 'amp-chart': drawAmp, 'damp-chart': drawDamp })[el.id]();
  }));
  const start = '2017-01-31';
  yearSel.value = '2017'; fillDates('2017', start);
  await showDate(start);
  all();
})().catch((e) => {
  document.querySelectorAll('.chart').forEach((c) => { if (!c.querySelector('svg')) c.innerHTML = `<p class="note">The chart data could not be loaded (${e.message}). Serve the site over http (GitHub Pages or a local server) rather than opening the file directly.</p>`; });
  console.error(e);
});
