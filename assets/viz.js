/* Shared chart helpers for the Fusion Outlook dashboards (requires d3 v7). */
(function () {
  const V = {};
  V.base = document.currentScript ? document.currentScript.src.replace(/assets\/viz\.js.*$/, '') : '../';

  V.json = async (path) => {
    const r = await fetch(V.base + path);
    if (!r.ok) throw new Error('Could not load ' + path + ' (' + r.status + ')');
    return r.json();
  };

  V.onResize = (el, fn) => {
    let w = 0, t;
    const ro = new ResizeObserver((entries) => {
      const nw = Math.round(entries[0].contentRect.width);
      if (nw === w || nw === 0) return;
      w = nw; clearTimeout(t); t = setTimeout(() => fn(nw), 60);
    });
    ro.observe(el);
  };

  /* Segmented control: buttons with aria-pressed. */
  V.seg = (el, items, value, onChange) => {
    el.classList.add('seg'); el.setAttribute('role', 'group');
    el.innerHTML = '';
    items.forEach(([v, label]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = label; b.dataset.v = v;
      b.setAttribute('aria-pressed', String(v === value));
      b.addEventListener('click', () => {
        el.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        onChange(v);
      });
      el.appendChild(b);
    });
  };

  /* Tooltip bound to a positioned container. */
  V.tip = (container) => {
    const d = document.createElement('div');
    d.className = 'tip'; d.hidden = true; container.appendChild(d);
    return {
      show(html, x, y) {
        d.innerHTML = html; d.hidden = false;
        const cw = container.clientWidth, tw = d.offsetWidth, th = d.offsetHeight;
        let left = x + 14; if (left + tw > cw) left = Math.max(0, x - tw - 14);
        let top = y - th - 10; if (top < 0) top = y + 14;
        d.style.left = left + 'px'; d.style.top = top + 'px';
      },
      hide() { d.hidden = true; }
    };
  };

  V.row = (color, label, value, dash) =>
    `<div class="r"><i><span class="swatch${dash ? ' dash' : ''}" style="background:${dash ? '' : color}"></span>${label}</i><b>${value}</b></div>`;

  V.svg = (el, w, h) => {
    d3.select(el).selectAll('svg').remove();
    return d3.select(el).append('svg').attr('viewBox', `0 0 ${w} ${h}`).attr('width', w).attr('height', h)
      .attr('role', 'img');
  };

  V.axisStyle = (g) => { g.classed('axis', true); return g; };

  V.gridY = (g, y, w) => {
    g.attr('class', 'grid').call(d3.axisLeft(y).tickSize(-w).tickFormat(''));
  };

  V.fmt = { p0: d3.format('.0f'), p1: d3.format('.1f'), p2: d3.format('.2f'), p3: d3.format('.3f'), pct: d3.format('+.0%'), int: d3.format(',d') };

  V.mean = (a) => d3.mean(a.filter((x) => x != null && !isNaN(x)));

  window.V = V;
})();
