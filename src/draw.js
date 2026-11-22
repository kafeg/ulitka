// U — процедурная отрисовка декораций. Всё рисуется кодом, растровых ассетов нет.
var U = (function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (p, n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];

  function wood(g) {
    [182, 432, 662, 884].forEach(x =>
      el(g, 'path', { d: `M${x} 0 Q${x + rnd(-7, 7)} 320 ${x + rnd(-7, 7)} 640`, fill: 'none', stroke: '#DCCBA8', 'stroke-width': 1.8, opacity: .6 }));
    for (let i = 0; i < 230; i++) {
      const x = rnd(0, 1000), y = rnd(-120, 400), h = rnd(220, 700);
      el(g, 'path', { d: `M${x.toFixed(0)} ${y.toFixed(0)} q${rnd(-5, 5).toFixed(1)} ${(h / 2).toFixed(0)} 0 ${h.toFixed(0)}`,
        fill: 'none', stroke: pick(['#E3D4B4', '#E8DCC2', '#DCCBA8']), 'stroke-width': rnd(.5, 1.4).toFixed(1),
        opacity: rnd(.16, .46).toFixed(2), 'stroke-linecap': 'round' });
    }
    [[96, 86, 13], [742, 120, 11], [560, 586, 10]].forEach(k => {
      for (let r = k[2]; r > 2; r -= 3.4)
        el(g, 'ellipse', { cx: k[0], cy: k[1], rx: r, ry: r * .62, fill: 'none', stroke: '#D2BE99', 'stroke-width': 1.3, opacity: .75 });
    });
  }

  // Спираль Архимеда + радиальные рёбра роста — так ракушка читается как рисунок карандашом.
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
      el(q, 'ellipse', { cx: x, cy: y - r * .62, rx: (r * .27).toFixed(1), ry: (r * .54).toFixed(1), fill: col,
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
      const t = i / (n + 1), mx = bez(t, x, cx, x2).toFixed(1), my = bez(t, y, cy, y2).toFixed(1);
      el(q, 'path', { d: `M${mx} ${my} l-11 -15 M${mx} ${my} l0 -19 M${mx} ${my} l11 -15`,
        fill: 'none', stroke: '#6B4FC4', 'stroke-width': 4.4, 'stroke-linecap': 'round', transform: `rotate(${rnd(-30, 30).toFixed(0)} ${mx} ${my})` });
    }
  }

  function sprigLeaf(g, x, y, x2, y2, n, col) {
    const q = el(g, 'g', {}), cx = (x + x2) / 2, cy = (y + y2) / 2 - 34;
    el(q, 'path', { d: `M${x} ${y} Q${cx} ${cy} ${x2} ${y2}`, fill: 'none', stroke: col, 'stroke-width': 2.4, 'stroke-linecap': 'round' });
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1), mx = bez(t, x, cx, x2), my = bez(t, y, cy, y2), s = i % 2 ? 1 : -1;
      el(q, 'ellipse', { cx: mx.toFixed(1), cy: (my - 13 * s).toFixed(1), rx: 7.5, ry: 14, fill: col,
        transform: `rotate(${(s * 34 + rnd(-10, 10)).toFixed(0)} ${mx.toFixed(1)} ${(my - 13 * s).toFixed(1)})` });
    }
  }

  function flora(g) {
    sprigLav(g, 46, 232, 312, 96, 6); sprigLav(g, 104, 146, 268, 44, 5); sprigLav(g, 690, 52, 944, 152, 6);
    sprigLeaf(g, 34, 178, 250, 214, 7, '#2F7D3A'); sprigLeaf(g, 118, 54, 312, 168, 6, '#4D9B3E');
    sprigLeaf(g, 640, 150, 896, 56, 7, '#2F7D3A'); sprigLeaf(g, 748, 480, 952, 606, 5, '#3E8A3A');
    daisy(g, 166, 124, 44, 6, '#ED5C7A', '#C33655', 12); daisy(g, 258, 188, 37, 6, '#ED5C7A', '#C33655', 28);
    daisy(g, 92, 92, 30, 6, '#F0758D', '#C33655', 40); daisy(g, 798, 96, 40, 6, '#ED5C7A', '#C33655', 18);
    daisy(g, 886, 180, 30, 6, '#F0758D', '#C33655', 5);
    daisy(g, 318, 116, 15, 7, '#FFFDF5', '#D9CDB4', 0); daisy(g, 58, 262, 13, 7, '#FFFDF5', '#D9CDB4', 20);
    daisy(g, 944, 108, 14, 7, '#FFFDF5', '#D9CDB4', 10);
    daisy(g, 706, 586, 16, 6, '#6FA8DC', '#3E6FA8', 0); daisy(g, 762, 612, 13, 6, '#6FA8DC', '#3E6FA8', 24);
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
  }

  function ants(g) { ant(g, 690, 548, 1.05, 8); ant(g, 628, 596, .85, -14); }

  return { el, rnd, pick, wood, shell, speckles, trail, flora, ants, ant, daisy };
})();
