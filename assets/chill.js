/* Chill portion risk dashboard */
(async function () {
  const C = await V.json('data/chill.json');
  const CROPS = [['pistachio', 'Pistachio'], ['walnut', 'Walnut'], ['cherry', 'Cherry'], ['plum', 'Plum']];
  const NAME = Object.fromEntries(CROPS);
  const REPORTED = { pistachio: [3, 6], walnut: [0, 0], cherry: [0, 1], plum: [2, 5] };
  const state = { crop: 'pistachio', thr: 58, accTol: 10, accLevel: 'region' };

  function cropData() { return C.series[state.crop]; }
  const below = (yrs, v, a, b, t) => yrs.reduce((n, y, i) => n + (y >= a && y <= b && v[i] < t ? 1 : 0), 0);

  /* ---------------- time series ---------------- */
  const tsEl = document.getElementById('ts-chart'); const tsTip = V.tip(tsEl);
  function drawTS() {
    const D = cropData(); const T = C.thresholds[state.crop];
    const W = Math.max(320, tsEl.clientWidth), H = Math.round(Math.min(400, Math.max(260, W * 0.45)));
    const m = { t: 14, r: 14, b: 38, l: 46 };
    const svg = V.svg(tsEl, W, H).attr('aria-label', `${NAME[state.crop]} winter chill portions`);
    const x = d3.scaleLinear([1978.5, 2040.5], [m.l, W - m.r]); const y = d3.scaleLinear([28, 78], [H - m.b, m.t]);
    svg.append('rect').attr('x', x(1978.5)).attr('width', x(2040.5) - x(1978.5)).attr('y', y(T.range[1])).attr('height', y(T.range[0]) - y(T.range[1])).style('fill', 'var(--surface-2)');
    svg.append('text').attr('x', W - m.r - 6).attr('y', y(T.range[0]) - 6).attr('text-anchor', 'end').style('fill', 'var(--ink-3)').style('font-size', '10.5px').text(`Cultivar requirement range ${T.range[0]}–${T.range[1]} CP`);
    svg.append('g').attr('transform', `translate(${m.l},0)`).call((g) => V.gridY(g, y, W - m.l - m.r));
    svg.append('rect').attr('x', x(2014.5)).attr('width', x(2040.5) - x(2014.5)).attr('y', m.t).attr('height', H - m.b - m.t).style('fill', 'var(--accent-wash)').style('opacity', 0.45);
    svg.append('text').attr('x', x(2027.5)).attr('y', m.t + 12).attr('text-anchor', 'middle').style('fill', 'var(--ink-3)').style('font-size', '10.5px').text('SSP5-8.5 projection');
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickValues([1980, 1990, 2000, 2010, 2020, 2030, 2040]).tickFormat(d3.format('d')).tickSizeOuter(0));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(6).tickSizeOuter(0));
    svg.append('text').attr('transform', `translate(12,${(H - m.b + m.t) / 2}) rotate(-90)`).attr('text-anchor', 'middle').text('Nov–Feb chill portions (CP)');
    const ln = (k) => D[k].years.map((yr, i) => [yr, D[k].cp[i]]);
    const line = d3.line().x((d) => x(d[0])).y((d) => y(d[1]));
    svg.append('path').datum(ln('cmip_hist')).attr('d', line).style('fill', 'none').style('stroke', 'var(--neutral-mark)').style('stroke-width', 1.6).style('stroke-dasharray', '4 3');
    svg.append('path').datum(ln('cmip_future')).attr('d', line).style('fill', 'none').style('stroke', 'var(--s2)').style('stroke-width', 1.8);
    svg.append('path').datum(ln('obs')).attr('d', line).style('fill', 'none').style('stroke', 'var(--s1)').style('stroke-width', 2.2);
    // threshold
    svg.append('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y(state.thr)).attr('y2', y(state.thr)).style('stroke', 'var(--ochre)').style('stroke-width', 2).style('stroke-dasharray', '6 4');
    ln('obs').forEach(([yr, v]) => {
      const low = v < state.thr;
      svg.append('circle').attr('cx', x(yr)).attr('cy', y(v)).attr('r', low ? 4.5 : 2.6).style('fill', low ? 'var(--ochre)' : 'var(--s1)').style('stroke', 'var(--surface)').style('stroke-width', 1.5);
    });
    ln('cmip_future').forEach(([yr, v]) => { if (v < state.thr) svg.append('circle').attr('cx', x(yr)).attr('cy', y(v)).attr('r', 3.2).style('fill', 'var(--surface)').style('stroke', 'var(--ochre)').style('stroke-width', 1.5); });
    const cross = svg.append('line').style('stroke', 'var(--ink-3)').attr('y1', m.t).attr('y2', H - m.b).style('opacity', 0);
    svg.append('rect').attr('x', m.l).attr('y', m.t).attr('width', W - m.l - m.r).attr('height', H - m.t - m.b).style('fill', 'transparent')
      .on('pointermove', (ev) => {
        const [px] = d3.pointer(ev); const yr = Math.round(x.invert(px)); if (yr < 1979 || yr > 2040) return;
        cross.attr('x1', x(yr)).attr('x2', x(yr)).style('opacity', 1);
        const g = (k) => { const i = D[k].years.indexOf(yr); return i < 0 ? null : D[k].cp[i]; };
        let html = `<div class="t">Winter ${yr}</div>`;
        if (g('obs') != null) html += V.row('var(--s1)', 'Observed (GRIDMET)', V.fmt.p1(g('obs')));
        if (g('cmip_hist') != null) html += V.row('var(--neutral-mark)', 'CMIP6 historical', V.fmt.p1(g('cmip_hist')), true);
        if (g('cmip_future') != null) html += V.row('var(--s2)', 'CMIP6 SSP5-8.5', V.fmt.p1(g('cmip_future')));
        const r = tsEl.getBoundingClientRect(); tsTip.show(html, ev.clientX - r.left, ev.clientY - r.top);
      }).on('pointerleave', () => { cross.style('opacity', 0); tsTip.hide(); });
    drawTSReadout();
  }

  function drawTSReadout() {
    const D = cropData(), t = state.thr;
    const o = D.obs, h = D.cmip_hist, f = D.cmip_future;
    const e = below(o.years, o.cp, 1979, 1998, t), l = below(o.years, o.cp, 2004, 2023, t);
    const oh = below(o.years, o.cp, 1981, 2014, t), hh = below(h.years, h.cp, 1981, 2014, t), ff = below(f.years, f.cp, 2015, 2040, t);
    const isMed = t === C.thresholds[state.crop].median;
    document.getElementById('ts-readout').innerHTML = `
      <div class="table-wrap"><table class="data"><thead><tr><th>Years below ${t} CP</th><th>Count</th></tr></thead><tbody>
      <tr><td>Observed, 1979–1998</td><td>${e} of 20</td></tr>
      <tr><td>Observed, 2004–2023</td><td>${l} of 20</td></tr>
      <tr><td>Observed vs CMIP6 historical, 1981–2014</td><td>${oh} vs ${hh}</td></tr>
      <tr><td>CMIP6 SSP5-8.5, 2015–2040</td><td>${ff} of 26</td></tr></tbody></table></div>
      <p class="note">${isMed ? `Paper-reported counts at the median threshold, computed from the gridded data: <b>${REPORTED[state.crop][0]} → ${REPORTED[state.crop][1]}</b> years. ` : ''}Counts here come from the regional series as plotted in the paper's Fig. 2 and can differ by a year or two where values sit within a fraction of a CP of the threshold.</p>`;
  }

  /* ---------------- distribution: variability vs mean shift ---------------- */
  const dEl = document.getElementById('dist-chart'); const dTip = V.tip(dEl);
  function drawDist() {
    const o = cropData().obs, t = state.thr;
    const E = o.years.map((y, i) => [y, o.cp[i]]).filter(([y]) => y <= 1998).map((d) => d[1]);
    const L = o.years.map((y, i) => [y, o.cp[i]]).filter(([y]) => y >= 2004).map((d) => d[1]);
    const shift = d3.mean(L) - d3.mean(E); const S = E.map((v) => v + shift);
    const rows = [['1979–1998 observed', E, 'var(--neutral-mark)'], ['1979–1998 + mean shift only', S, 'var(--ink-3)'], ['2004–2023 observed', L, 'var(--s1)']];
    const W = Math.max(300, dEl.clientWidth), rowH = 62, m = { t: 8, r: 16, b: 34, l: Math.min(190, W * 0.4) };
    const H = m.t + m.b + rowH * rows.length;
    const svg = V.svg(dEl, W, H);
    const x = d3.scaleLinear([40, 78], [m.l, W - m.r]);
    svg.append('g').attr('class', 'grid').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(6).tickSize(-(H - m.t - m.b)).tickFormat(''));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(6).tickSizeOuter(0));
    svg.append('text').attr('x', (m.l + W - m.r) / 2).attr('y', H - 4).attr('text-anchor', 'middle').text('Nov–Feb chill portions (CP)');
    svg.append('rect').attr('x', m.l).attr('width', x(t) - m.l).attr('y', m.t).attr('height', H - m.t - m.b).style('fill', 'var(--ochre-wash)');
    svg.append('line').attr('x1', x(t)).attr('x2', x(t)).attr('y1', m.t).attr('y2', H - m.b).style('stroke', 'var(--ochre)').style('stroke-width', 2).style('stroke-dasharray', '6 4');
    const out = [];
    rows.forEach(([lab, arr, c], ri) => {
      const cy = m.t + rowH * ri + rowH / 2; const n = arr.filter((v) => v < t).length;
      out.push([lab, n, arr.length, d3.mean(arr), d3.deviation(arr)]);
      // beeswarm-ish jitter by sorted rank
      const sorted = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
      sorted.forEach((d, k) => {
        const jit = ((k % 3) - 1) * 8;
        svg.append('circle').attr('cx', x(Math.max(40, d.v))).attr('cy', cy + jit).attr('r', 4).style('fill', d.v < t ? 'var(--ochre)' : c).style('stroke', 'var(--surface)').style('stroke-width', 1.5)
          .style('opacity', ri === 1 ? 0.75 : 1);
      });
      svg.append('line').attr('x1', x(d3.mean(arr))).attr('x2', x(d3.mean(arr))).attr('y1', cy - 18).attr('y2', cy + 18).style('stroke', 'var(--ink)').style('stroke-width', 2);
      svg.append('text').attr('x', m.l - 10).attr('y', cy - 2).attr('text-anchor', 'end').style('fill', 'var(--ink)').style('font-weight', 600).text(lab);
      svg.append('text').attr('x', m.l - 10).attr('y', cy + 13).attr('text-anchor', 'end').style('fill', 'var(--ink-2)').text(`${n} of ${arr.length} below · SD ${V.fmt.p1(d3.deviation(arr))}`);
      svg.append('rect').attr('x', 0).attr('y', cy - rowH / 2).attr('width', W).attr('height', rowH).style('fill', 'transparent')
        .on('pointerenter', (ev) => { const r = dEl.getBoundingClientRect(); dTip.show(`<div class="t">${lab}</div><div class="r"><i>Mean</i><b>${V.fmt.p1(d3.mean(arr))} CP</b></div><div class="r"><i>Std. dev.</i><b>${V.fmt.p1(d3.deviation(arr))} CP</b></div><div class="r"><i>Years below ${t}</i><b>${n}</b></div>`, ev.clientX - r.left, ev.clientY - r.top); })
        .on('pointerleave', () => dTip.hide());
    });
    const [e, s, l] = out;
    document.getElementById('dist-readout').innerHTML = `<p>At ${t} CP: <strong>${e[1]}</strong> winters below in 1979–1998, <strong>${s[1]}</strong> if that period only shifted by the mean change (${V.fmt.p1(shift)} CP), and <strong>${l[1]}</strong> observed in 2004–2023.</p>`;
    drawCDF(E, S, L, t);
  }

  const cdfEl = document.getElementById('cdf-chart'); const cdfTip = V.tip(cdfEl);
  function drawCDF(E, S, L, t) {
    const W = Math.max(300, cdfEl.clientWidth), H = Math.round(Math.min(240, Math.max(180, W * 0.42)));
    const m = { t: 10, r: 14, b: 36, l: 40 };
    const svg = V.svg(cdfEl, W, H);
    const xs = d3.range(44, 70.01, 0.25);
    const x = d3.scaleLinear([44, 70], [m.l, W - m.r]); const y = d3.scaleLinear([0, 12], [H - m.b, m.t]);
    svg.append('g').attr('transform', `translate(${m.l},0)`).call((g) => V.gridY(g, y, W - m.l - m.r));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(6).tickSizeOuter(0));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickSizeOuter(0));
    svg.append('text').attr('x', (W + m.l) / 2).attr('y', H - 4).attr('text-anchor', 'middle').text('Threshold (CP)');
    svg.append('text').attr('transform', `translate(11,${(H - m.b + m.t) / 2}) rotate(-90)`).attr('text-anchor', 'middle').text('Winters below');
    const cnt = (arr, v) => arr.filter((a) => a < v).length;
    const ser = [[E, 'var(--neutral-mark)', '1979–1998', null], [S, 'var(--ink-3)', 'Mean shift only', '4 3'], [L, 'var(--s1)', '2004–2023', null]];
    ser.forEach(([arr, c, , da]) => svg.append('path').datum(xs).attr('d', d3.line().curve(d3.curveStepAfter).x((v) => x(v)).y((v) => y(Math.min(12, cnt(arr, v))))).style('fill', 'none').style('stroke', c).style('stroke-width', 2).style('stroke-dasharray', da));
    svg.append('line').attr('x1', x(t)).attr('x2', x(t)).attr('y1', m.t).attr('y2', H - m.b).style('stroke', 'var(--ochre)').style('stroke-width', 2).style('stroke-dasharray', '6 4');
    const cross = svg.append('line').style('stroke', 'var(--ink-3)').attr('y1', m.t).attr('y2', H - m.b).style('opacity', 0);
    svg.append('rect').attr('x', m.l).attr('y', m.t).attr('width', W - m.l - m.r).attr('height', H - m.t - m.b).style('fill', 'transparent')
      .on('pointermove', (ev) => {
        const [px] = d3.pointer(ev); const v = Math.round(x.invert(px) * 2) / 2;
        cross.attr('x1', x(v)).attr('x2', x(v)).style('opacity', 1);
        const r = cdfEl.getBoundingClientRect();
        cdfTip.show(`<div class="t">Below ${v} CP</div>` + ser.map(([arr, c, lab, da]) => V.row(da ? '' : c, lab, cnt(arr, v), !!da)).join(''), ev.clientX - r.left, ev.clientY - r.top);
      }).on('pointerleave', () => { cross.style('opacity', 0); cdfTip.hide(); });
  }

  /* ---------------- rolling SD ---------------- */
  const sdEl = document.getElementById('sd-chart'); const sdTip = V.tip(sdEl);
  const CC = { walnut: 'var(--s1)', pistachio: 'var(--s2)', cherry: 'var(--s3)', plum: 'var(--s4)' };
  function drawSD() {
    const R = C.rolling_sd; const W = Math.max(300, sdEl.clientWidth), H = Math.round(Math.min(300, Math.max(210, W * 0.5)));
    const m = { t: 12, r: 14, b: 36, l: 40 };
    const svg = V.svg(sdEl, W, H);
    const x = d3.scaleLinear([1990, 2025], [m.l, W - m.r]); const y = d3.scaleLinear([3, 9], [H - m.b, m.t]);
    svg.append('g').attr('transform', `translate(${m.l},0)`).call((g) => V.gridY(g, y, W - m.l - m.r));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(7).tickFormat(d3.format('d')).tickSizeOuter(0));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(6).tickSizeOuter(0));
    svg.append('text').attr('transform', `translate(11,${(H - m.b + m.t) / 2}) rotate(-90)`).attr('text-anchor', 'middle').text('10-yr rolling SD (CP)');
    svg.append('line').attr('x1', x(1998)).attr('x2', x(1998)).attr('y1', m.t).attr('y2', H - m.b).style('stroke', 'var(--ink-3)').style('stroke-dasharray', '3 3');
    svg.append('text').attr('x', x(1998) + 5).attr('y', m.t + 11).style('fill', 'var(--ink-3)').style('font-size', '10.5px').text('~1998 regime change');
    CROPS.forEach(([k]) => svg.append('path').datum(R[k]).attr('d', d3.line().x((d, i) => x(R.years[i])).y((d) => y(d))).style('fill', 'none').style('stroke', CC[k]).style('stroke-width', k === state.crop ? 2.8 : 1.6).style('opacity', k === state.crop ? 1 : 0.7));
    document.getElementById('sd-legend').innerHTML = CROPS.map(([k, n]) => `<span><span class="swatch" style="background:${CC[k]}"></span>${n}</span>`).join('');
    const cross = svg.append('line').style('stroke', 'var(--ink-3)').attr('y1', m.t).attr('y2', H - m.b).style('opacity', 0);
    svg.append('rect').attr('x', m.l).attr('y', m.t).attr('width', W - m.l - m.r).attr('height', H - m.t - m.b).style('fill', 'transparent')
      .on('pointermove', (ev) => {
        const [px] = d3.pointer(ev); const yr = Math.max(1990, Math.min(2025, Math.round(x.invert(px)))); const i = R.years.indexOf(yr);
        cross.attr('x1', x(yr)).attr('x2', x(yr)).style('opacity', 1);
        const r = sdEl.getBoundingClientRect();
        sdTip.show(`<div class="t">${yr}</div>` + CROPS.map(([k, n]) => V.row(CC[k], n, V.fmt.p2(R[k][i]))).join(''), ev.clientX - r.left, ev.clientY - r.top);
      }).on('pointerleave', () => { cross.style('opacity', 0); sdTip.hide(); });
  }

  /* ---------------- forecast accuracy ---------------- */
  const aEl = document.getElementById('acc-chart'); const aTip = V.tip(aEl);
  function drawAcc() {
    const rows = C.supp_table1.filter((r) => r[2] === state.accTol);
    const W = Math.max(300, aEl.clientWidth), H = Math.round(Math.min(280, Math.max(200, W * 0.5)));
    const m = { t: 16, r: 10, b: 40, l: 42 };
    const svg = V.svg(aEl, W, H);
    const leads = ['1', '2', '3', '4'];
    const x0 = d3.scaleBand(leads, [m.l, W - m.r]).padding(0.25); const x1 = d3.scaleBand(['MD', 'MM'], [0, x0.bandwidth()]).padding(0.12);
    const y = d3.scaleLinear([0, 100], [H - m.b, m.t]);
    svg.append('g').attr('transform', `translate(${m.l},0)`).call((g) => V.gridY(g, y, W - m.l - m.r));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x0).tickFormat((d) => d + (d === '1' ? ' month' : ' months')).tickSizeOuter(0));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5).tickFormat((d) => d + '%').tickSizeOuter(0));
    svg.append('text').attr('x', (W + m.l) / 2).attr('y', H - 4).attr('text-anchor', 'middle').text('Forecast lead before the end of February');
    rows.forEach((r) => {
      const [mod, lead, tol, yrs, reg, grid] = r; const v = state.accLevel === 'region' ? reg : grid;
      const xx = x0(String(lead)) + x1(mod);
      svg.append('rect').attr('x', xx).attr('width', x1.bandwidth()).attr('y', y(v)).attr('height', y(0) - y(v)).attr('rx', 3).style('fill', mod === 'MD' ? 'var(--s1)' : 'var(--s3)')
        .on('pointerenter', (ev) => { const rr = aEl.getBoundingClientRect(); aTip.show(`<div class="t">${mod === 'MD' ? 'Daily forecasts' : 'Monthly-mean forecasts'} · ${lead}-month lead</div><div class="r"><i>Years within ±${tol}%</i><b>${yrs} of 43</b></div><div class="r"><i>Region-level</i><b>${reg}%</b></div><div class="r"><i>Grid-level</i><b>${grid}%</b></div>`, ev.clientX - rr.left, ev.clientY - rr.top); })
        .on('pointerleave', () => aTip.hide());
      svg.append('text').attr('x', xx + x1.bandwidth() / 2).attr('y', y(v) - 4).attr('text-anchor', 'middle').style('fill', 'var(--ink-2)').style('font-size', '10.5px').text(v);
    });
  }
  V.seg(document.getElementById('acc-tol'), [['10', 'Within ±10%'], ['5', 'Within ±5%']], '10', (v) => { state.accTol = +v; drawAcc(); });
  V.seg(document.getElementById('acc-level'), [['region', 'Regional total'], ['grid', '4 km grid cells']], 'region', (v) => { state.accLevel = v; drawAcc(); });

  const fEl = document.getElementById('fc-chart'); const fTip = V.tip(fEl);
  function drawFC() {
    const F = C.forecast; const W = Math.max(300, fEl.clientWidth), H = Math.round(Math.min(300, Math.max(210, W * 0.5)));
    const m = { t: 12, r: 14, b: 36, l: 40 };
    const svg = V.svg(fEl, W, H);
    const x = d3.scaleLinear([1981, 2023], [m.l, W - m.r]); const y = d3.scaleLinear([42, 80], [H - m.b, m.t]);
    svg.append('g').attr('transform', `translate(${m.l},0)`).call((g) => V.gridY(g, y, W - m.l - m.r));
    svg.append('path').datum(F.obs).attr('d', d3.area().x((d, i) => x(F.years[i])).y0((d) => y(d * 0.9)).y1((d) => y(d * 1.1))).style('fill', 'var(--neutral-mark)').style('opacity', 0.1);
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('d')).tickSizeOuter(0));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5).tickSizeOuter(0));
    svg.append('text').attr('transform', `translate(11,${(H - m.b + m.t) / 2}) rotate(-90)`).attr('text-anchor', 'middle').text('Nov–Feb chill portions');
    const L = (k) => d3.line().x((d, i) => x(F.years[i])).y((d) => y(d))(F[k]);
    svg.append('path').attr('d', L('obs')).style('fill', 'none').style('stroke', 'var(--neutral-mark)').style('stroke-width', 2).style('stroke-dasharray', '5 3');
    svg.append('path').attr('d', L('md')).style('fill', 'none').style('stroke', 'var(--s1)').style('stroke-width', 2);
    svg.append('path').attr('d', L('mm')).style('fill', 'none').style('stroke', 'var(--s3)').style('stroke-width', 1.6);
    const cross = svg.append('line').style('stroke', 'var(--ink-3)').attr('y1', m.t).attr('y2', H - m.b).style('opacity', 0);
    svg.append('rect').attr('x', m.l).attr('y', m.t).attr('width', W - m.l - m.r).attr('height', H - m.t - m.b).style('fill', 'transparent')
      .on('pointermove', (ev) => {
        const [px] = d3.pointer(ev); const yr = Math.max(1981, Math.min(2023, Math.round(x.invert(px)))); const i = F.years.indexOf(yr);
        cross.attr('x1', x(yr)).attr('x2', x(yr)).style('opacity', 1);
        const err = (k) => ((F[k][i] / F.obs[i] - 1) * 100).toFixed(0);
        const r = fEl.getBoundingClientRect();
        fTip.show(`<div class="t">Winter ${yr}</div>${V.row('', 'Observed', V.fmt.p1(F.obs[i]), true)}${V.row('var(--s1)', 'NDJ obs + Feb daily fcst', V.fmt.p1(F.md[i]) + ` (${err('md')}%)`)}${V.row('var(--s3)', 'NDJ obs + Feb monthly fcst', V.fmt.p1(F.mm[i]) + ` (${err('mm')}%)`)}`, ev.clientX - r.left, ev.clientY - r.top);
      }).on('pointerleave', () => { cross.style('opacity', 0); fTip.hide(); });
  }

  /* ---------------- controls & boot ---------------- */
  const thrEl = document.getElementById('thr');
  function setCrop(c) {
    state.crop = c; const T = C.thresholds[c]; state.thr = T.median;
    thrEl.min = 40; thrEl.max = 70; thrEl.step = 0.5; thrEl.value = T.median;
    document.getElementById('thr-out').textContent = T.median;
    document.querySelectorAll('[data-crop-name]').forEach((e) => { e.textContent = NAME[c]; });
    drawTS(); drawDist(); drawSD();
  }
  thrEl.addEventListener('input', () => { state.thr = +thrEl.value; document.getElementById('thr-out').textContent = state.thr; drawTS(); drawDist(); });
  document.getElementById('thr-reset').addEventListener('click', () => { const T = C.thresholds[state.crop]; state.thr = T.median; thrEl.value = T.median; document.getElementById('thr-out').textContent = T.median; drawTS(); drawDist(); });
  V.seg(document.getElementById('crop-seg'), CROPS, 'pistachio', setCrop);
  const map = { 'ts-chart': drawTS, 'dist-chart': drawDist, 'cdf-chart': drawDist, 'sd-chart': drawSD, 'acc-chart': drawAcc, 'fc-chart': drawFC };
  Object.keys(map).forEach((id) => V.onResize(document.getElementById(id), map[id]));
  setCrop('pistachio'); drawAcc(); drawFC();
})().catch((e) => {
  document.querySelectorAll('.chart').forEach((c) => { if (!c.querySelector('svg')) c.innerHTML = `<p class="note">The chart data could not be loaded (${e.message}). Serve the site over http (GitHub Pages or a local server) rather than opening the file directly.</p>`; });
  console.error(e);
});
