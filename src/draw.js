// U — процедурная отрисовка. Всё рисуется кодом, растровых ассетов нет.
// Статичные декорации дрожат «по построению» (wob): фильтр feDisplacementMap висит
// только на улитке, иначе пришлось бы фильтровать всю скамейку шириной 3000.
var U = (function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (p, n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const wob = (v, m) => (v + rnd(-(m || 1.6), m || 1.6)).toFixed(1);
  const clear = g => { while (g.firstChild) g.removeChild(g.firstChild); };

  function wood(g, W) {
    for (let x = 182; x < W; x += 250)
      el(g, 'path', { d: `M${x} -700 Q${wob(x, 7)} 320 ${wob(x, 7)} 1340`, fill: 'none', stroke: '#DCCBA8', 'stroke-width': 1.8, opacity: .6 });
    const n = Math.round(W / 3);
    for (let i = 0; i < n; i++) {
      const x = rnd(0, W), y = rnd(-700, 1000), h = rnd(220, 900);
      el(g, 'path', { d: `M${x.toFixed(0)} ${y.toFixed(0)} q${rnd(-5, 5).toFixed(1)} ${(h / 2).toFixed(0)} 0 ${h.toFixed(0)}`,
        fill: 'none', stroke: pick(['#E3D4B4', '#E8DCC2', '#DCCBA8']), 'stroke-width': rnd(.5, 1.4).toFixed(1),
        opacity: rnd(.16, .46).toFixed(2), 'stroke-linecap': 'round' });
    }
    for (let x = 90; x < W; x += rnd(420, 760)) {
      const cy = rnd(-560, 1200), cx = x;
      for (let r = rnd(8, 14); r > 2; r -= 3.4)
        el(g, 'ellipse', { cx, cy, rx: r.toFixed(1), ry: (r * .62).toFixed(1), fill: 'none', stroke: '#D2BE99', 'stroke-width': 1.3, opacity: .75 });
    }
  }

  // Спираль Архимеда + радиальные рёбра роста — ракушка читается как рисунок карандашом.
  function shell(g) {
    const SX = 11, SY = 6;
    for (let i = 0; i < 26; i++) {
      const a = i * Math.PI * 2 / 26 + .26, r0 = 40, r1 = 113, m = (r0 + r1) / 2;
      el(g, 'path', { d: `M${(SX + Math.cos(a) * r0).toFixed(1)} ${(SY + Math.sin(a) * r0).toFixed(1)} Q${(SX + Math.cos(a) * m + Math.cos(a + 1.57) * 8).toFixed(1)} ${(SY + Math.sin(a) * m + Math.sin(a + 1.57) * 8).toFixed(1)} ${(SX + Math.cos(a) * r1).toFixed(1)} ${(SY + Math.sin(a) * r1).toFixed(1)}`,
        fill: 'none', stroke: '#BC5D20', 'stroke-width': 2, opacity: .42, 'stroke-linecap': 'round' });
    }
    let d = 'M' + SX + ' ' + SY;
    for (let t = 0; t <= Math.PI * 2 * 3.25; t += 0.07) {
      const r = 4 + t * 5.05;
      d += ` L${(SX + Math.cos(t - 1.25) * r).toFixed(1)} ${(SY + Math.sin(t - 1.25) * r).toFixed(1)}`;
    }
    el(g, 'path', { d, fill: 'none', stroke: '#8E3A12', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: .92 });
  }

  function speckles(g) {
    for (let i = 0; i < 46; i++)
      el(g, 'circle', { cx: rnd(-176, 168).toFixed(0), cy: rnd(-56, 2).toFixed(0), r: rnd(1.2, 3.6).toFixed(1),
        fill: pick(['#AEEADF', '#4CB4A3', '#FFFFFF']), opacity: rnd(.3, .75).toFixed(2) });
  }

  function trail(g) {
    for (let i = 0; i < 7; i++)
      el(g, 'path', { d: `M${rnd(-200, -130).toFixed(0)} ${rnd(-2, 10).toFixed(0)} q40 ${rnd(-7, 7).toFixed(0)} 80 0 t80 0`,
        fill: 'none', stroke: '#FBFAF6', 'stroke-width': rnd(1.5, 3.6).toFixed(1), opacity: rnd(.4, .9).toFixed(2), 'stroke-linecap': 'round' });
  }

  function daisy(g, x, y, r, n, col, edge, rot) {
    const q = el(g, 'g', {});
    for (let i = 0; i < n; i++)
      el(q, 'ellipse', { cx: wob(x), cy: wob(y - r * .62), rx: (r * .27).toFixed(1), ry: (r * .54).toFixed(1), fill: col,
        stroke: edge, 'stroke-width': 1.4, transform: `rotate(${(rot + i * 360 / n).toFixed(1)} ${x} ${y})` });
    el(q, 'circle', { cx: x, cy: y, r: (r * .3).toFixed(1), fill: '#302924' });
    for (let i = 0; i < 7; i++) {
      const a = rnd(0, 6.28), d = rnd(0, r * .22);
      el(q, 'circle', { cx: (x + Math.cos(a) * d).toFixed(1), cy: (y + Math.sin(a) * d).toFixed(1), r: 1.5, fill: '#FBF6EA', opacity: .85 });
    }
  }

  const bez = (t, a, c, b) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;

  function sprigLav(g, x, y, x2, y2, n) {
    const q = el(g, 'g', {}), cx = (x + x2) / 2, cy = (y + y2) / 2 - 46;
    el(q, 'path', { d: `M${x} ${y} Q${cx} ${cy} ${x2} ${y2}`, fill: 'none', stroke: '#3E6FA8', 'stroke-width': 2.6, 'stroke-linecap': 'round' });
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1), mx = wob(bez(t, x, cx, x2)), my = wob(bez(t, y, cy, y2));
      el(q, 'path', { d: `M${mx} ${my} l-11 -15 M${mx} ${my} l0 -19 M${mx} ${my} l11 -15`,
        fill: 'none', stroke: '#6B4FC4', 'stroke-width': 4.4, 'stroke-linecap': 'round', transform: `rotate(${rnd(-30, 30).toFixed(0)} ${mx} ${my})` });
    }
  }

  function sprigLeaf(g, x, y, x2, y2, n, col) {
    const q = el(g, 'g', {}), cx = (x + x2) / 2, cy = (y + y2) / 2 - 34;
    el(q, 'path', { d: `M${x} ${y} Q${cx} ${cy} ${x2} ${y2}`, fill: 'none', stroke: col, 'stroke-width': 2.4, 'stroke-linecap': 'round' });
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1), mx = bez(t, x, cx, x2), my = bez(t, y, cy, y2), s = i % 2 ? 1 : -1;
      el(q, 'ellipse', { cx: wob(mx), cy: wob(my - 13 * s), rx: 7.5, ry: 14, fill: col,
        transform: `rotate(${(s * 34 + rnd(-10, 10)).toFixed(0)} ${mx.toFixed(1)} ${(my - 13 * s).toFixed(1)})` });
    }
  }

  // Флора раскидана по всей длине скамейки: сверху густо, снизу редко, середина свободна под улитку.
  function flora(g, W) {
    const PINK = ['#ED5C7A', '#F0758D'], GREEN = ['#2F7D3A', '#4D9B3E', '#3E8A3A'];
    for (let x = 0; x < W; x += 500) {
      sprigLav(g, x + 46, 232, x + 312, 96, 6);
      sprigLav(g, x + 290, 60, x + 470, 150, 5);
      sprigLeaf(g, x + 34, 178, x + 250, 214, 7, pick(GREEN));
      sprigLeaf(g, x + 240, 150, x + 470, 56, 7, pick(GREEN));
      daisy(g, x + 166, 124, rnd(34, 46), 6, pick(PINK), '#C33655', rnd(0, 60));
      daisy(g, x + 358, 180, rnd(26, 38), 6, pick(PINK), '#C33655', rnd(0, 60));
      daisy(g, x + 318, 116, 15, 7, '#FFFDF5', '#D9CDB4', rnd(0, 60));
      if (x % 1000 === 0) {
        sprigLeaf(g, x + 120, 500, x + 340, 612, 5, pick(GREEN));
        daisy(g, x + 206, 592, 16, 6, '#6FA8DC', '#3E6FA8', rnd(0, 60));
      }
    }
  }

  function ant(g, x, y, s, rot) {
    const c = '#4A3328', q = el(g, 'g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})` });
    [[-6, -4, -15, -13], [-2, -4, -4, -15], [2, -4, 9, -13], [-6, 4, -15, 13], [-2, 4, -4, 15], [2, 4, 9, 13]].forEach(L =>
      el(q, 'path', { d: `M${L[0]} ${L[1]} Q${(L[0] + L[2]) / 2} ${(L[1] + L[3]) / 2 + 2} ${L[2]} ${L[3]}`,
        fill: 'none', stroke: c, 'stroke-width': 1.7, 'stroke-linecap': 'round' }));
    el(q, 'path', { d: 'M11 -4 Q17 -12 15 -18', fill: 'none', stroke: c, 'stroke-width': 1.5, 'stroke-linecap': 'round' });
    el(q, 'path', { d: 'M12 -1 Q20 -8 23 -14', fill: 'none', stroke: c, 'stroke-width': 1.5, 'stroke-linecap': 'round' });
    el(q, 'ellipse', { cx: -10, cy: 0, rx: 7.5, ry: 5.8, fill: c });
    el(q, 'ellipse', { cx: 0, cy: 0, rx: 4.2, ry: 3.8, fill: c });
    el(q, 'ellipse', { cx: 9, cy: -1, rx: 5.8, ry: 5.2, fill: c });
    return q;
  }

  return { NS, el, rnd, pick, wob, clear, bez, wood, shell, speckles, trail, flora, daisy, sprigLav, sprigLeaf, ant };
})();
