/* California precipitation shift dashboard */
(async function () {
  const P = await V.json('data/precip.json');
  const YRS = P.annual.years, MM = P.annual.mm;
  const val = (y) => MM[YRS.indexOf(y)];
  const win = (a, b) => YRS.filter((y) => y >= a && y <= b).map(val);
  const sd = (a) => d3.deviation(a);
  const state = { a: [1991, 2020], len: 20, end: 2021, target: 2022, mwin: 20, sort: 'geo' };

  /* ---------------- climatology tool ---------------- */
  const cEl = document.getElementById('clim-chart'); const cTip = V.tip(cEl);
  function bWin() { return [state.end - state.len + 1, state.end]; }
  function rank(v, arr) { return arr.filter((x) => x < v).length / arr.length; }
  function drawClim() {
    const [b0, b1] = bWin(); const A = win(...state.a), B = win(b0, b1);
    const mA = d3.mean(A), mB = d3.mean(B), sA = sd(A), sB = sd(B);
    const W = Math.max(320, cEl.clientWidth), H = Math.round(Math.min(380, Math.max(250, W * 0.42)));
    const m = { t: 16, r: 12, b: 38, l: 50 };
    const svg = V.svg(cEl, W, H).attr('aria-label', 'Statewide water-year precipitation with two reference climatologies');
    const x = d3.scaleBand(YRS, [m.l, W - m.r]).padding(0.18);
    const y = d3.scaleLinear([0, 1150], [H - m.b, m.t]);
    svg.append('g').attr('transform', `translate(${m.l},0)`).call((g) => V.gridY(g, y, W - m.l - m.r));
    const band = (a, b, mu, s, c, lab, row) => {
      const x0 = x(Math.max(a, YRS[0])), x1 = x(Math.min(b, YRS[YRS.length - 1])) + x.bandwidth();
      svg.append('rect').attr('x', x0).attr('width', x1 - x0).attr('y', y(mu + s)).attr('height', y(mu - s) - y(mu + s)).style('fill', c).style('opacity', 0.12);
      svg.append('line').attr('x1', x0).attr('x2', x1).attr('y1', y(mu)).attr('y2', y(mu)).style('stroke', c).style('stroke-width', 2.5);
      svg.append('text').attr('x', x0 + 4).attr('y', y(mu + s) - 6 - row * 13).style('fill', c).style('font-weight', 600).style('font-size', '11px').text(lab);
    };
    YRS.forEach((yr, i) => {
      const inB = yr >= b0 && yr <= b1;
      svg.append('rect').attr('x', x(yr)).attr('width', x.bandwidth()).attr('y', y(MM[i])).attr('height', y(0) - y(MM[i]))
        .attr('rx', Math.min(3, x.bandwidth() / 3))
        .style('fill', yr === state.target ? 'var(--ochre)' : 'var(--neutral-mark)').style('opacity', yr === state.target ? 1 : inB ? 0.55 : 0.3)
        .style('cursor', 'pointer')
        .on('click', () => { state.target = yr; document.getElementById('target-year').value = yr; drawClim(); })
        .on('pointerenter', (ev) => {
          const r = cEl.getBoundingClientRect();
          cTip.show(`<div class="t">Water year ${yr}</div><div class="r"><i>Precipitation</i><b>${MM[i]} mm</b></div><div class="r"><i>vs ${state.a[0]}–${state.a[1]}</i><b>${Math.round(100 * MM[i] / mA)}%</b></div><div class="r"><i>vs ${b0}–${b1}</i><b>${Math.round(100 * MM[i] / mB)}%</b></div><div class="note">Click to select</div>`, ev.clientX - r.left, ev.clientY - r.top);
        }).on('pointerleave', () => cTip.hide());
    });
    band(state.a[0], state.a[1], mA, sA, 'var(--s1)', `Reference A ${state.a[0]}–${state.a[1]}: ${Math.round(mA)} mm`, 1);
    band(b0, b1, mB, sB, 'var(--s2)', `Reference B ${b0}–${b1}: ${Math.round(mB)} mm`, 0);
    const ticks = YRS.filter((y) => y % (W < 560 ? 10 : 5) === 0);
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickValues(ticks).tickSizeOuter(0));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(6).tickSizeOuter(0));
    svg.append('text').attr('transform', `translate(13,${(H - m.b + m.t) / 2}) rotate(-90)`).attr('text-anchor', 'middle').text('Water-year precipitation (mm)');
    // readout
    const t = val(state.target);
    const cls = (p) => p < 0.2 ? ['crit', 'Dry (below 20th pct)'] : p > 0.8 ? ['good', 'Wet (above 80th pct)'] : ['warn', 'Near normal'];
    const rA = rank(t, A), rB = rank(t, B); const [ca, la] = cls(rA), [cb, lb] = cls(rB);
    document.getElementById('clim-readout').innerHTML = `
      <div class="table-wrap"><table class="data"><thead><tr><th>Water year ${state.target}: ${t} mm</th><th>Mean</th><th>SD</th><th>% of mean</th><th>Percentile</th><th>Class</th></tr></thead><tbody>
      <tr><td><span class="swatch" style="background:var(--s1)"></span> A · ${state.a[0]}–${state.a[1]} (${A.length} yr)</td><td>${Math.round(mA)}</td><td>${Math.round(sA)}</td><td>${Math.round(100 * t / mA)}%</td><td>${Math.round(100 * rA)}</td><td><span class="pill ${ca}">${la}</span></td></tr>
      <tr><td><span class="swatch" style="background:var(--s2)"></span> B · ${b0}–${b1} (${B.length} yr)</td><td>${Math.round(mB)}</td><td>${Math.round(sB)}</td><td>${Math.round(100 * t / mB)}%</td><td>${Math.round(100 * rB)}</td><td><span class="pill ${cb}">${lb}</span></td></tr>
      </tbody></table></div>`;
    document.getElementById('b-label').textContent = `${b0}–${b1}`;
  }
  V.seg(document.getElementById('a-seg'), [['1991-2020', '1991–2020 (30-yr normal)'], ['1982-2001', '1982–2001'], ['1982-2022', '1982–2022 (full record)']], '1991-2020', (v) => { state.a = v.split('-').map(Number); drawClim(); });
  const lenEl = document.getElementById('b-len'), endEl = document.getElementById('b-end'), tgEl = document.getElementById('target-year');
  lenEl.addEventListener('input', () => { state.len = +lenEl.value; document.getElementById('b-len-out').textContent = state.len; if (state.end - state.len + 1 < 1982) { state.end = 1981 + state.len; endEl.value = state.end; } drawClim(); });
  endEl.addEventListener('input', () => { state.end = Math.max(+endEl.value, 1981 + state.len); endEl.value = state.end; drawClim(); });
  YRS.slice().reverse().forEach((y) => tgEl.add(new Option(y, y))); tgEl.value = state.target;
  tgEl.addEventListener('change', () => { state.target = +tgEl.value; drawClim(); });

  /* ---------------- moving windows ---------------- */
  const mEl = document.getElementById('moving-chart'); const mTip = V.tip(mEl);
  function drawMoving() {
    const L = state.mwin; const rows = [];
    for (let s = 1982; s + L - 1 <= 2022; s++) { const a = win(s, s + L - 1); rows.push({ s, e: s + L - 1, c: s + (L - 1) / 2, mu: d3.mean(a), sd: sd(a) }); }
    const W = Math.max(300, mEl.clientWidth), H = Math.round(Math.min(330, Math.max(240, W * 0.5)));
    const m = { t: 14, r: 52, b: 38, l: 50 };
    const svg = V.svg(mEl, W, H);
    const x = d3.scaleLinear(d3.extent(rows, (d) => d.c), [m.l, W - m.r]);
    const ph = (H - m.t - m.b - 18) / 2;
    const yM = d3.scaleLinear([d3.min(rows, (d) => d.mu) - 20, d3.max(rows, (d) => d.mu) + 20], [m.t + ph, m.t]);
    const yS = d3.scaleLinear([d3.min(rows, (d) => d.sd) - 15, d3.max(rows, (d) => d.sd) + 15], [H - m.b, H - m.b - ph]);
    [[yM, 'mu', 'Mean (mm)', 'var(--s1)'], [yS, 'sd', 'Std. dev. (mm)', 'var(--s2)']].forEach(([y, k, lab, c]) => {
      svg.append('g').attr('transform', `translate(${m.l},0)`).call((g) => V.gridY(g, y.copy().nice(), W - m.l - m.r));
      svg.append('g').attr('class', 'axis').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(3).tickSizeOuter(0));
      svg.append('path').datum(rows).attr('d', d3.line().x((d) => x(d.c)).y((d) => y(d[k]))).style('fill', 'none').style('stroke', c).style('stroke-width', 2.2);
      const last = rows[rows.length - 1], first = rows[0];
      [first, last].forEach((d) => svg.append('circle').attr('cx', x(d.c)).attr('cy', y(d[k])).attr('r', 4).style('fill', c).style('stroke', 'var(--surface)').style('stroke-width', 2));
      svg.append('text').attr('x', W - m.r + 6).attr('y', y(last[k]) + 4).style('fill', 'var(--ink)').style('font-weight', 600).text(Math.round(last[k]));
      svg.append('text').attr('x', m.l + 6).attr('y', y.range()[1] + 2).style('fill', 'var(--ink-2)').style('font-weight', 600).style('font-size', '11px').text(lab);
    });
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(6).tickFormat(d3.format('d')).tickSizeOuter(0));
    svg.append('text').attr('x', (W + m.l - m.r) / 2).attr('y', H - 5).attr('text-anchor', 'middle').text(`Center year of ${L}-year window`);
    const cross = svg.append('line').style('stroke', 'var(--ink-3)').attr('y1', m.t).attr('y2', H - m.b).style('opacity', 0);
    svg.append('rect').attr('x', m.l).attr('y', m.t).attr('width', W - m.l - m.r).attr('height', H - m.t - m.b).style('fill', 'transparent')
      .on('pointermove', (ev) => {
        const [px] = d3.pointer(ev); const c = x.invert(px); const d = rows.reduce((a, b) => Math.abs(b.c - c) < Math.abs(a.c - c) ? b : a);
        cross.attr('x1', x(d.c)).attr('x2', x(d.c)).style('opacity', 1);
        const r = mEl.getBoundingClientRect();
        mTip.show(`<div class="t">WY ${d.s}–${d.e}</div>${V.row('var(--s1)', 'Mean', Math.round(d.mu) + ' mm')}${V.row('var(--s2)', 'Std. dev.', Math.round(d.sd) + ' mm')}`, ev.clientX - r.left, ev.clientY - r.top);
      }).on('pointerleave', () => { cross.style('opacity', 0); mTip.hide(); });
  }
  V.seg(document.getElementById('mwin-seg'), [['15', '15 yr'], ['20', '20 yr'], ['25', '25 yr'], ['30', '30 yr']], '20', (v) => { state.mwin = +v; drawMoving(); });

  /* ---------------- regional ---------------- */
  const rEl = document.getElementById('region-chart'); const rTip = V.tip(rEl);
  function drawRegion() {
    const R = P.regional; let idx = R.regions.map((_, i) => i);
    if (state.sort === 'mag') idx.sort((a, b) => R.annual[a] - R.annual[b]);
    if (state.sort === 'share') idx.sort((a, b) => (R.wet[b] / R.annual[b]) - (R.wet[a] / R.annual[a]));
    const W = Math.max(300, rEl.clientWidth);
    const rowH = 26, m = { t: 8, r: 56, b: 34, l: Math.min(150, W * 0.36) };
    const H = m.t + m.b + rowH * idx.length;
    const svg = V.svg(rEl, W, H);
    const x = d3.scaleLinear([-150, 0], [m.l, W - m.r]);
    const y = d3.scaleBand(idx.map((i) => R.regions[i]), [m.t, H - m.b]).padding(0.28);
    svg.append('g').attr('class', 'grid').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(5).tickSize(-(H - m.t - m.b)).tickFormat(''));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(5).tickSizeOuter(0));
    svg.append('text').attr('x', (m.l + W - m.r) / 2).attr('y', H - 4).attr('text-anchor', 'middle').text('Change in mean precipitation (mm per water year)');
    idx.forEach((i) => {
      const name = R.regions[i], yy = y(name), bh = y.bandwidth();
      const wet = R.wet[i], dry = R.dry[i];
      svg.append('rect').attr('x', x(wet)).attr('width', x(0) - x(wet) - 1).attr('y', yy).attr('height', bh).style('fill', 'var(--s1)');
      svg.append('rect').attr('x', x(wet + dry)).attr('width', x(wet) - x(wet + dry) - 1).attr('y', yy).attr('height', bh).style('fill', 'var(--s2)');
      svg.append('line').attr('x1', x(R.annual[i])).attr('x2', x(R.annual[i])).attr('y1', yy - 3).attr('y2', yy + bh + 3).style('stroke', 'var(--ink)').style('stroke-width', 2);
      svg.append('text').attr('x', m.l - 8).attr('y', yy + bh / 2 + 4).attr('text-anchor', 'end').style('fill', 'var(--ink)').text(name);
      svg.append('text').attr('x', x(0) + 6).attr('y', yy + bh / 2 + 4).style('fill', 'var(--ink-2)').style('font-variant-numeric', 'tabular-nums').text(R.annual[i]);
      svg.append('rect').attr('x', 0).attr('y', yy - 4).attr('width', W).attr('height', bh + 8).style('fill', 'transparent')
        .on('pointerenter', (ev) => {
          const r = rEl.getBoundingClientRect();
          rTip.show(`<div class="t">${name}</div>${V.row('var(--ink)', 'Water year', R.annual[i] + ' mm')}${V.row('var(--s1)', 'Wet season (Oct–Mar)', wet + ' mm')}${V.row('var(--s2)', 'Dry season (Apr–Sep)', dry + ' mm')}<div class="r"><i>Wet-season share</i><b>${Math.round(100 * wet / R.annual[i])}%</b></div>`, ev.clientX - r.left, ev.clientY - r.top);
        }).on('pointerleave', () => rTip.hide());
    });
    svg.append('line').attr('x1', x(0)).attr('x2', x(0)).attr('y1', m.t).attr('y2', H - m.b).style('stroke', 'var(--ink-3)');
  }
  V.seg(document.getElementById('region-sort'), [['geo', 'Paper order'], ['mag', 'Largest loss'], ['share', 'Wet-season share']], 'geo', (v) => { state.sort = v; drawRegion(); });

  /* ---------------- predictors ---------------- */
  const pEl = document.getElementById('pred-chart'); const pTip = V.tip(pEl);
  const nice = (s) => s.replace(/MJOAmplitude/g, 'MJO amp.').replace(/MJOPhase/g, 'MJO phase').replace(/ENSO_E/g, 'ENSO-E').replace(/ENSO_C/g, 'ENSO-CP').replace(/_x_/g, ' × ');
  let showAll = false;
  function drawPred() {
    const all = P.predictors.predictor.map((p, i) => ({ p, v: P.predictors.pct[i], inter: p.includes('_x_') }));
    const rows = showAll ? all : all.slice(0, 12);
    const W = Math.max(300, pEl.clientWidth), rowH = 22, m = { t: 6, r: 44, b: 32, l: Math.min(170, W * 0.42) };
    const H = m.t + m.b + rowH * rows.length;
    const svg = V.svg(pEl, W, H);
    const x = d3.scaleLinear([0, 18], [m.l, W - m.r]);
    const y = d3.scaleBand(rows.map((d) => d.p), [m.t, H - m.b]).padding(0.25);
    svg.append('g').attr('class', 'grid').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(6).tickSize(-(H - m.t - m.b)).tickFormat(''));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(6).tickFormat((d) => d + '%').tickSizeOuter(0));
    svg.append('line').attr('x1', x(10)).attr('x2', x(10)).attr('y1', m.t).attr('y2', H - m.b).style('stroke', 'var(--ink-3)').style('stroke-dasharray', '3 3');
    rows.forEach((d) => {
      svg.append('rect').attr('x', x(0)).attr('width', x(d.v) - x(0)).attr('y', y(d.p)).attr('height', y.bandwidth()).attr('rx', 2).style('fill', d.inter ? 'var(--s1)' : 'var(--s3)');
      svg.append('text').attr('x', m.l - 8).attr('y', y(d.p) + y.bandwidth() / 2 + 4).attr('text-anchor', 'end').style('fill', 'var(--ink)').text(nice(d.p));
      svg.append('text').attr('x', x(d.v) + 5).attr('y', y(d.p) + y.bandwidth() / 2 + 4).style('fill', 'var(--ink-2)').style('font-variant-numeric', 'tabular-nums').text(d.v.toFixed(1));
    });
    svg.append('text').attr('x', x(10) + 4).attr('y', H - m.b - 6).style('fill', 'var(--ink-3)').style('font-size', '10.5px').text('10% of grid cells');
  }
  document.getElementById('pred-all').addEventListener('change', (e) => { showAll = e.target.checked; drawPred(); });

  const nEl = document.getElementById('npred-chart');
  function drawN() {
    const N = P.npred; const W = Math.max(260, nEl.clientWidth), H = 170, m = { t: 18, r: 10, b: 34, l: 36 };
    const svg = V.svg(nEl, W, H);
    const x = d3.scaleBand(N.n.map(String), [m.l, W - m.r]).padding(0.25); const y = d3.scaleLinear([0, 60], [H - m.b, m.t]);
    svg.append('g').attr('transform', `translate(${m.l},0)`).call((g) => V.gridY(g, y, W - m.l - m.r));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickSizeOuter(0));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(3).tickFormat((d) => d + '%').tickSizeOuter(0));
    N.n.forEach((n, i) => {
      svg.append('rect').attr('x', x(String(n))).attr('width', x.bandwidth()).attr('y', y(N.pct[i])).attr('height', y(0) - y(N.pct[i])).attr('rx', 3).style('fill', n < 4 ? 'var(--s1)' : 'var(--neutral-mark)').style('opacity', n < 4 ? 1 : 0.5);
      svg.append('text').attr('x', x(String(n)) + x.bandwidth() / 2).attr('y', y(N.pct[i]) - 4).attr('text-anchor', 'middle').style('fill', 'var(--ink-2)').text('~' + Math.round(N.pct[i]));
    });
    svg.append('text').attr('x', (W + m.l) / 2).attr('y', H - 4).attr('text-anchor', 'middle').text('Predictors kept per grid-cell model');
  }

  const all = () => { drawClim(); drawMoving(); drawRegion(); drawPred(); drawN(); };
  const map = { 'clim-chart': drawClim, 'moving-chart': drawMoving, 'region-chart': drawRegion, 'pred-chart': drawPred, 'npred-chart': drawN };
  Object.keys(map).forEach((id) => V.onResize(document.getElementById(id), map[id]));
  all();
})().catch((e) => {
  document.querySelectorAll('.chart').forEach((c) => { if (!c.querySelector('svg')) c.innerHTML = `<p class="note">The chart data could not be loaded (${e.message}). Serve the site over http (GitHub Pages or a local server) rather than opening the file directly.</p>`; });
  console.error(e);
});
