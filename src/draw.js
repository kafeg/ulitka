// U — рисование сцены. Декорации КОМПОНУЮТСЯ по таблицам, а не рассыпаются случайным циклом:
// случайная расстановка и была причиной ощущения обоев.
var U = (function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (p, n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const wob = (v, m) => (v + rnd(-(m || 1.6), m || 1.6)).toFixed(1);
  const clear = g => { while (g.firstChild) g.removeChild(g.firstChild); };
  const bez = (t, a, c, b) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;

  // Парк за спинкой: небо, кусты, трава. Нужен, чтобы была глубина.
  function park(g, W) {
    const C = STAGE.C, B = STAGE.PARK_B;
    el(g, 'rect', { x: 0, y: -700, width: W, height: 700 + B, fill: C.sky });
    for (let x = -60; x < W + 120; x += 170)
      el(g, 'ellipse', { cx: wob(x, 26), cy: B - rnd(4, 16), rx: rnd(74, 116).toFixed(0), ry: rnd(40, 64).toFixed(0), fill: C.parkDeep, opacity: .5 });
    for (let x = -60; x < W + 120; x += 120)
      el(g, 'ellipse', { cx: wob(x, 22), cy: B - rnd(0, 8), rx: rnd(56, 84).toFixed(0), ry: rnd(26, 44).toFixed(0), fill: C.park });
    el(g, 'rect', { x: 0, y: B - 12, width: W, height: 12, fill: C.park });
    for (let x = 0; x < W; x += 13)
      el(g, 'path', { d: `M${x.toFixed(0)} ${B} q${rnd(-3, 3).toFixed(1)} -8 ${rnd(-4, 4).toFixed(1)} -${rnd(9, 19).toFixed(0)}`,
        fill: 'none', stroke: pick(['#8FBD6A', '#A8CC86', '#7FAE5C']), 'stroke-width': 2, 'stroke-linecap': 'round', opacity: .9 });
  }

  function grain(g, x0, W, y, h, col) {
    for (let x = x0; x < W; x += rnd(130, 260)) {
      const len = rnd(220, 540), yy = y + rnd(6, h - 8);
      el(g, 'path', { d: `M${x.toFixed(0)} ${yy.toFixed(0)} q${(len / 2).toFixed(0)} ${rnd(-4, 4).toFixed(1)} ${len.toFixed(0)} 0`,
        fill: 'none', stroke: col, 'stroke-width': rnd(.7, 1.6).toFixed(1), opacity: rnd(.16, .34).toFixed(2), 'stroke-linecap': 'round' });
    }
  }

  // Скамейка: спинка, просвет, сиденье, торец, опоры и земля под ней.
  // Просвет между спинкой и сиденьем плюс опоры, уходящие в траву, —
  // то, без чего ровные доски в лоб читаются как забор.
  function bench(g, W) {
    const C = STAGE.C, P = STAGE.PARK_B, K = STAGE.BACK_B, ST = STAGE.SEAT_T, S = STAGE.SEAT_B, E = STAGE.EDGE_B;

    // Земля под скамейкой — рисуем первой, её видно и в просвете, и внизу.
    el(g, 'rect', { x: 0, y: P, width: W, height: 1340 - P, fill: C.ground });
    el(g, 'rect', { x: 0, y: E + 46, width: W, height: 1340 - E - 46, fill: C.groundDeep, opacity: .5 });

    // Опоры: задняя стойка и передняя ножка, через равные промежутки.
    for (let x = 180; x < W; x += 1120) {
      el(g, 'rect', { x, y: P + 6, width: 28, height: E + 110 - P, fill: C.post });
      el(g, 'rect', { x, y: P + 6, width: 7, height: E + 110 - P, fill: '#C9A271', opacity: .7 });
      el(g, 'path', { d: `M${x + 150} ${S} l26 0 l16 118 l-26 0 z`, fill: C.post });
    }
    el(g, 'rect', { x: 0, y: E + 96, width: W, height: 26, fill: '#3F4A2C', opacity: .25 });

    // Спинка: две рейки, между ними видно парк.
    [[P + 4, 46], [P + 64, 48]].forEach(b => {
      el(g, 'rect', { x: 0, y: b[0], width: W, height: b[1], fill: C.back });
      el(g, 'rect', { x: 0, y: b[0], width: W, height: 3, fill: '#F3EAD6', opacity: .7 });
      el(g, 'rect', { x: 0, y: b[0] + b[1] - 4, width: W, height: 4, fill: C.seam, opacity: .5 });
      grain(g, -200, W, b[0], b[1], C.seam);
    });

    // Сиденье: дальние рейки тоньше и темнее — это и даёт ощущение плоскости, а не стены.
    const H = [68, 80, 90];
    let y = ST;
    H.forEach((h, i) => {
      el(g, 'rect', { x: 0, y, width: W, height: h, fill: i % 2 ? C.seatAlt : C.seat });
      el(g, 'rect', { x: 0, y, width: W, height: 4, fill: '#FDF7E9', opacity: .9 });
      el(g, 'rect', { x: 0, y: y + h - 5, width: W, height: 5, fill: C.seam, opacity: .4 });
      if (i < 2) el(g, 'rect', { x: 0, y, width: W, height: h, fill: '#8A7352', opacity: (2 - i) * .05 });
      grain(g, -200, W, y, h, C.seam);
      for (let x = rnd(400, 900); x < W; x += rnd(1100, 1800))
        for (let r = rnd(9, 14); r > 2; r -= 3.6)
          el(g, 'ellipse', { cx: x.toFixed(0), cy: (y + h / 2).toFixed(0), rx: (r * .6).toFixed(1), ry: r.toFixed(1),
            fill: 'none', stroke: C.edge, 'stroke-width': 1.3, opacity: .5 });
      y += h + 2;
    });
    el(g, 'rect', { x: 0, y: ST, width: W, height: 7, fill: C.gapDark, opacity: .55 });

    for (let x = 620; x < W; x += 1240) {
      el(g, 'line', { x1: x, y1: ST, x2: x, y2: S, stroke: '#8A7352', 'stroke-width': 4, opacity: .45 });
      el(g, 'line', { x1: x + 3, y1: ST, x2: x + 3, y2: S, stroke: '#FDF7E9', 'stroke-width': 2, opacity: .5 });
    }

    // Торец сиденья и тень от него на землю.
    el(g, 'rect', { x: 0, y: S, width: W, height: E - S, fill: C.front });
    el(g, 'rect', { x: 0, y: S, width: W, height: 4, fill: '#FDF7E9', opacity: .55 });
    grain(g, -200, W, S + 6, E - S - 8, '#8A7352');
    el(g, 'rect', { x: 0, y: E, width: W, height: 30, fill: '#3F4A2C', opacity: .35 });
  }

  function daisy(g, x, y, r, n, col, edge, rot) {
    const q = el(g, 'g', {});
    for (let i = 0; i < n; i++)
      el(q, 'ellipse', { cx: wob(x), cy: wob(y - r * .62), rx: (r * .27).toFixed(1), ry: (r * .54).toFixed(1), fill: col,
        stroke: edge, 'stroke-width': 1.4, transform: `rotate(${(rot + i * 360 / n).toFixed(1)} ${x} ${y})` });
    el(q, 'circle', { cx: x, cy: y, r: (r * .3).toFixed(1), fill: '#302924' });
    for (let i = 0; i < 6; i++) {
      const a = rnd(0, 6.28), d = rnd(0, r * .22);
      el(q, 'circle', { cx: (x + Math.cos(a) * d).toFixed(1), cy: (y + Math.sin(a) * d).toFixed(1), r: 1.5, fill: '#FBF6EA', opacity: .85 });
    }
    return q;
  }

  function sprigLav(g, x, y, x2, y2, n) {
    const q = el(g, 'g', {}), cx = (x + x2) / 2, cy = (y + y2) / 2 - 46;
    el(q, 'path', { d: `M${x} ${y} Q${cx} ${cy} ${x2} ${y2}`, fill: 'none', stroke: '#3E6FA8', 'stroke-width': 2.6, 'stroke-linecap': 'round' });
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1), mx = wob(bez(t, x, cx, x2)), my = wob(bez(t, y, cy, y2));
      el(q, 'path', { d: `M${mx} ${my} l-11 -15 M${mx} ${my} l0 -19 M${mx} ${my} l11 -15`,
        fill: 'none', stroke: '#6B4FC4', 'stroke-width': 4.4, 'stroke-linecap': 'round', transform: `rotate(${rnd(-30, 30).toFixed(0)} ${mx} ${my})` });
    }
    return q;
  }

  function sprigLeaf(g, x, y, x2, y2, n, col) {
    const q = el(g, 'g', {}), cx = (x + x2) / 2, cy = (y + y2) / 2 - 34;
    el(q, 'path', { d: `M${x} ${y} Q${cx} ${cy} ${x2} ${y2}`, fill: 'none', stroke: col, 'stroke-width': 2.4, 'stroke-linecap': 'round' });
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1), mx = bez(t, x, cx, x2), my = bez(t, y, cy, y2), s = i % 2 ? 1 : -1;
      el(q, 'ellipse', { cx: wob(mx), cy: wob(my - 13 * s), rx: 7.5, ry: 14, fill: col,
        transform: `rotate(${(s * 34 + rnd(-10, 10)).toFixed(0)} ${mx.toFixed(1)} ${(my - 13 * s).toFixed(1)})` });
    }
    return q;
  }

  // Цветы свешиваются из-за дальнего края скамейки, а не висят в воздухе посреди доски.
  // Композиция задана таблицей: четыре разных куста, которые чередуются вдоль мира.
  const BUSH = [
    b => { sprigLav(b, 10, 120, 210, 24, 5); sprigLeaf(b, -20, 60, 180, 150, 5, '#2F7D3A'); daisy(b, 118, 96, 38, 6, '#ED5C7A', '#C33655', 14); },
    b => { sprigLeaf(b, 0, 40, 196, 128, 6, '#4D9B3E'); daisy(b, 64, 72, 30, 6, '#F0758D', '#C33655', 40); daisy(b, 150, 112, 20, 7, '#FFFDF5', '#D9CDB4', 0); },
    b => { sprigLav(b, -10, 70, 180, 132, 5); daisy(b, 96, 118, 42, 6, '#ED5C7A', '#C33655', 26); },
    b => { sprigLeaf(b, 10, 128, 200, 36, 5, '#2F7D3A'); sprigLav(b, 60, 150, 220, 70, 4); daisy(b, 150, 86, 26, 6, '#F0758D', '#C33655', 8); }
  ];

  function flora(g, W) {
    let i = 0;
    for (let x = -40; x < W; x += 236, i++) {
      const b = el(g, 'g', { transform: `translate(${x} ${STAGE.PARK_B - 118})` });
      BUSH[i % BUSH.length](b);
    }
    // Редкие травинки на самом сиденье — чтобы передний план не был пустым.
    for (let x = 60; x < W; x += 330)
      sprigLeaf(g, x, STAGE.SEAT_B - 22, x + 120, STAGE.SEAT_B - 8, 4, '#4D9B3E');
  }

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

  return { NS, el, rnd, pick, wob, clear, bez, park, bench, flora, daisy, sprigLav, sprigLeaf, shell, speckles, trail, ant };
})();
