// Props — предметы препятствий и погода. Мировые координаты у сора, ветки, муравьёв и листочка;
// экранные — у дождя, солнца и подсказки (они не должны уезжать вместе с камерой).
var Props = (function () {
  const el = U.el, rnd = U.rnd, wob = U.wob;
  const DROP = 'M0,-30 C6,-16 12,-6 12,2 A12,12 0 1 1 -12,2 C-12,-6 -6,-16 0,-30 Z';

  function cone(g, x, y) {
    const q = el(g, 'g', { transform: `translate(${x} ${y})` });
    el(q, 'ellipse', { cx: 0, cy: 0, rx: 30, ry: 34, fill: '#8A5A2E' });
    for (let r = 0; r < 5; r++)
      for (let c = -2; c <= 2; c++)
        el(q, 'ellipse', { cx: wob(c * 13 + (r % 2 ? 6 : 0)), cy: wob(r * 13 - 26), rx: 8.5, ry: 7,
          fill: r > 3 ? '#6E4523' : '#A06C38', stroke: '#5C3A1C', 'stroke-width': 1 });
    el(q, 'path', { d: 'M24,-26 q22,-6 34,4 M24,-18 q24,2 36,14', fill: 'none', stroke: '#2F7D3A', 'stroke-width': 4, 'stroke-linecap': 'round' });
    return q;
  }

  function pebbles(g, x, y) {
    const q = el(g, 'g', { transform: `translate(${x} ${y})` });
    [[0, 0, 17, 13], [26, 9, 12, 9], [-20, 12, 10, 8]].forEach(p =>
      el(q, 'ellipse', { cx: p[0], cy: p[1], rx: p[2], ry: p[3], fill: '#6D6560', stroke: '#4A443F', 'stroke-width': 1.4 }));
    return q;
  }

  function twig(g, x, y) {
    const q = el(g, 'g', { transform: `translate(${x} ${y})` });
    el(q, 'path', { d: 'M-44,16 L18,-14 M-2,0 L10,-34 M18,-14 L52,-6', fill: 'none', stroke: '#7A4A22',
      'stroke-width': 9, 'stroke-linecap': 'round' });
    return q;
  }

  // Сор на дорожке: три предмета, каждый смахивается пальцем.
  // Каждый лежит в своей обёртке без transform: анимация CSS-трансформом
  // затёрла бы атрибут transform и уронила предмет в начало координат.
  function debris(g, x) {
    const spec = [[cone, x, 420], [pebbles, x + 110, 462], [twig, x + 212, 440]];
    return spec.map(s => {
      const node = el(g, 'g', {});
      s[0](node, s[1], s[2]);
      return { node, x: s[1], y: s[2], r: 78 };
    });
  }

  // Ветка поперёк скамейки + путь через неё: вверх-вверх-вверх, вниз-вниз-вниз.
  function branch(g, x) {
    const q = el(g, 'g', {});
    el(q, 'path', { d: `M${x - 150},90 C${x - 40},190 ${x + 40},330 ${x + 120},560`, fill: 'none',
      stroke: '#6B3F1C', 'stroke-width': 30, 'stroke-linecap': 'round' });
    el(q, 'path', { d: `M${x - 150},90 C${x - 40},190 ${x + 40},330 ${x + 120},560`, fill: 'none',
      stroke: '#8A5629', 'stroke-width': 20, 'stroke-linecap': 'round' });
    el(q, 'path', { d: `M${x - 10},250 L${x + 120},196`, fill: 'none', stroke: '#6B3F1C', 'stroke-width': 13, 'stroke-linecap': 'round' });
    el(q, 'path', { d: `M${x + 36},336 L${x - 86},392`, fill: 'none', stroke: '#6B3F1C', 'stroke-width': 11, 'stroke-linecap': 'round' });
    el(q, 'path', { d: `M${x + 120},196 q52,-26 92,4 q-32,44 -92,-4 z`, fill: '#7CC03E', stroke: '#44821F', 'stroke-width': 2.4 });
    // Шесть точек пути: три вверх по ветке, три вниз.
    const pts = [[x - 120, 470], [x - 70, 360], [x - 20, 250], [x + 30, 180], [x + 80, 280], [x + 130, 400], [x + 180, 470]];
    return { node: q, pts };
  }

  function leaf(g, x) {
    const q = el(g, 'g', {});
    const WHOLE = `M${x},58 C${x + 24},0 ${x + 96},-22 ${x + 146},0 C${x + 140},68 ${x + 74},108 ${x + 22},90 C${x + 6},84 ${x - 4},72 ${x},58 Z`;
    const BITTEN = `M${x},58 C${x + 24},0 ${x + 96},-22 ${x + 146},0 C${x + 142},30 ${x + 126},54 ${x + 104},70 C${x + 100},46 ${x + 84},36 ${x + 66},42 C${x + 50},48 ${x + 44},68 ${x + 50},86 C${x + 40},92 ${x + 30},93 ${x + 22},90 C${x + 6},84 ${x - 4},72 ${x},58 Z`;
    const body = el(q, 'path', { d: WHOLE, fill: '#7CC03E', stroke: '#44821F', 'stroke-width': 3, transform: 'translate(0,420)' });
    el(q, 'path', { d: `M${x + 6},62 C${x + 48},46 ${x + 100},22 ${x + 140},4`, fill: 'none', stroke: '#44821F',
      'stroke-width': 2.4, 'stroke-linecap': 'round', transform: 'translate(0,420)' });
    el(q, 'path', { d: `M${x + 28},58 C${x + 34},42 ${x + 36},28 ${x + 34},16 M${x + 56},46 C${x + 64},30 ${x + 68},16 ${x + 67},4`,
      fill: 'none', stroke: '#4E8F25', 'stroke-width': 1.6, opacity: .75, 'stroke-linecap': 'round', transform: 'translate(0,420)' });
    return { node: q, bite: () => body.setAttribute('d', BITTEN), reset: () => body.setAttribute('d', WHOLE) };
  }

  // Муравьи окружают улитку: сходятся к центру, потом разбегаются.
  function antSwarm(g, cx, n) {
    const q = el(g, 'g', {}), list = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd(-.2, .2), d = rnd(150, 330);
      const x = cx + Math.cos(a) * d * 1.5, y = 320 + Math.sin(a) * d * .55;
      const node = el(q, 'g', {});
      U.ant(node, x, y, rnd(.8, 1.2), (Math.atan2(320 - y, cx - x) * 180 / Math.PI).toFixed(0));
      list.push({ node, x, y, a });
    }
    return { node: q, list };
  }

  function rain(g) {
    const q = el(g, 'g', {}), drops = [];
    for (let i = 0; i < 26; i++) {
      const x = rnd(0, 1000), s = rnd(.7, 1.9);
      const d = el(q, 'path', { d: DROP, fill: '#79C6DE', opacity: rnd(.45, .85).toFixed(2),
        transform: `translate(${x.toFixed(0)} -60) scale(${s.toFixed(2)})` });
      d.animate([{ transform: `translate(${x.toFixed(0)}px,-60px) scale(${s.toFixed(2)})` },
                 { transform: `translate(${(x + rnd(-40, 40)).toFixed(0)}px,700px) scale(${s.toFixed(2)})` }],
        { duration: rnd(1100, 2300), delay: rnd(0, 2000), iterations: Infinity, easing: 'linear' });
      drops.push(d);
    }
    return { node: q, drops };
  }

  // Ладошка, которой ребёнок укрывает улитку: следует за пальцем.
  function palm(g) {
    const q = el(g, 'g', { opacity: 0, 'pointer-events': 'none' });
    el(q, 'path', { d: 'M-70,20 q-14,-34 2,-44 q12,-6 18,10 l6,-34 q6,-16 20,-12 q12,4 10,20 l4,-30 q4,-16 18,-13 q14,3 12,19 l-2,28 l10,-18 q10,-14 21,-5 q10,8 2,22 l-26,52 q-14,26 -44,26 q-34,0 -51,-21 z',
      fill: '#FFD9C4', stroke: '#C98B6A', 'stroke-width': 3, opacity: .92 });
    return q;
  }

  function sun(g) {
    const q = el(g, 'g', { opacity: 0 }), rays = [];
    [[700, 90, 70], [800, 60, 52], [890, 100, 44], [620, 130, 40]].forEach(c => {
      const w = el(q, 'g', {});
      [[0, 0, 1], [-.7, .2, .72], [.7, .2, .72], [-.3, -.35, .6], [.4, -.3, .6]].forEach(o =>
        el(w, 'circle', { cx: c[0] + o[0] * c[2], cy: c[1] + o[1] * c[2], r: (c[2] * o[2]).toFixed(0), fill: '#FFFDF8', opacity: .95 }));
    });
    for (let i = 0; i < 3; i++) {
      const a = 2.25 + i * 0.26;
      rays.push(el(q, 'path', {
        d: `M${(820 + Math.cos(a - .05) * 60).toFixed(0)},${(120 + Math.sin(a - .05) * 60).toFixed(0)} L${(820 + Math.cos(a) * 760).toFixed(0)},${(120 + Math.sin(a) * 760).toFixed(0)} L${(820 + Math.cos(a + .05) * 60).toFixed(0)},${(120 + Math.sin(a + .05) * 60).toFixed(0)} Z`,
        fill: '#FFE79A', opacity: .3, 'data-ray': i }));
    }
    const face = el(q, 'g', {});
    el(face, 'circle', { cx: 820, cy: 120, r: 58, fill: '#FFD83D' });
    el(face, 'circle', { cx: 802, cy: 112, r: 7, fill: '#3A3023' });
    el(face, 'circle', { cx: 840, cy: 112, r: 7, fill: '#3A3023' });
    el(face, 'path', { d: 'M804,136 q16,16 32,0', fill: 'none', stroke: '#3A3023', 'stroke-width': 4, 'stroke-linecap': 'round' });
    return { node: q, rays };
  }

  // Рука-подсказка: появляется, если ребёнок не трогает экран 8 секунд.
  function hand(g) {
    const q = el(g, 'g', { opacity: 0, 'pointer-events': 'none' });
    el(q, 'circle', { r: 30, fill: '#FFFFFF', opacity: .55 });
    el(q, 'circle', { r: 14, fill: '#FF8A4C', stroke: '#FFFFFF', 'stroke-width': 4 });
    return {
      node: q,
      show(x, y) {
        q.setAttribute('transform', `translate(${x} ${y})`);
        q.animate([{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1)' }],
          { duration: 300, fill: 'forwards' });
        q.getAnimations().length < 2 && q.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }],
          { duration: 1100, iterations: Infinity, composite: 'add' });
      },
      hide() { q.getAnimations().forEach(a => a.cancel()); q.setAttribute('opacity', 0); }
    };
  }

  return { debris, branch, leaf, antSwarm, rain, palm, sun, hand };
})();
