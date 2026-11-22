// Props — предметы и погода. Размеры заданы от улитки (на экране ~300 единиц):
// предмет взаимодействия не меньше 110, иначе ребёнок его не найдёт.
// Мировые координаты у сора, ветки, муравьёв и листочка; экранные — у дождя, солнца и ладошки.
var Props = (function () {
  const el = U.el, rnd = U.rnd, wob = U.wob, B = () => STAGE.BASE;
  const DROP = 'M0,-34 C7,-18 14,-7 14,2 A14,14 0 1 1 -14,2 C-14,-7 -7,-18 0,-34 Z';

  function cone(g, x) {
    const q = el(g, 'g', { transform: `translate(${x} ${B() - 44})` });
    el(q, 'ellipse', { cx: 0, cy: 0, rx: 44, ry: 50, fill: '#8A5A2E' });
    for (let r = 0; r < 6; r++)
      for (let c = -2; c <= 2; c++)
        el(q, 'ellipse', { cx: wob(c * 19 + (r % 2 ? 9 : 0)), cy: wob(r * 18 - 42), rx: 12.5, ry: 10.5,
          fill: r > 4 ? '#6E4523' : '#A06C38', stroke: '#5C3A1C', 'stroke-width': 1.4 });
    el(q, 'path', { d: 'M34,-40 q32,-10 50,6 M34,-28 q34,4 52,20', fill: 'none', stroke: '#2F7D3A', 'stroke-width': 6, 'stroke-linecap': 'round' });
    return q;
  }

  function pebbles(g, x) {
    const q = el(g, 'g', { transform: `translate(${x} ${B() - 22})` });
    [[0, 0, 28, 21], [40, 14, 19, 14], [-32, 18, 16, 12]].forEach(p =>
      el(q, 'ellipse', { cx: p[0], cy: p[1], rx: p[2], ry: p[3], fill: '#6D6560', stroke: '#4A443F', 'stroke-width': 2 }));
    return q;
  }

  function twig(g, x) {
    const q = el(g, 'g', { transform: `translate(${x} ${B() - 30})` });
    el(q, 'path', { d: 'M-66,26 L28,-22 M-4,0 L14,-54 M28,-22 L82,-10', fill: 'none', stroke: '#7A4A22',
      'stroke-width': 14, 'stroke-linecap': 'round' });
    return q;
  }

  // Каждый предмет в своей обёртке без transform: иначе анимация CSS-трансформом
  // затрёт расстановку и уронит его в начало координат.
  function debris(g, x) {
    return [[cone, x], [pebbles, x + 160], [twig, x + 310]].map(s => {
      const node = el(g, 'g', {});
      const inner = s[0](node, s[1]);
      return { node, x: s[1], y: B() - 34, r: 96 };
    });
  }

  // Ветка поперёк сиденья. Точки пути идут НАД веткой, выше улитки,
  // чтобы задание не перекрывалось самой улиткой.
  function branch(g, x) {
    const q = el(g, 'g', {}), T = STAGE.PARK_B, Bo = STAGE.SEAT_B;
    el(q, 'path', { d: `M${x - 170},${T + 10} C${x - 60},${T + 130} ${x + 30},${B() - 20} ${x + 130},${Bo + 70}`,
      fill: 'none', stroke: '#5B3415', 'stroke-width': 46, 'stroke-linecap': 'round' });
    el(q, 'path', { d: `M${x - 170},${T + 10} C${x - 60},${T + 130} ${x + 30},${B() - 20} ${x + 130},${Bo + 70}`,
      fill: 'none', stroke: '#8A5629', 'stroke-width': 30, 'stroke-linecap': 'round' });
    el(q, 'path', { d: `M${x - 36},${B() - 90} L${x + 130},${B() - 160}`, fill: 'none', stroke: '#6B3F1C', 'stroke-width': 18, 'stroke-linecap': 'round' });
    el(q, 'path', { d: `M${x + 130},${B() - 160} q66,-34 118,6 q-42,56 -118,-6 z`, fill: '#7CC03E', stroke: '#44821F', 'stroke-width': 3 });
    const pts = [[x - 230, B() - 30], [x - 160, B() - 130], [x - 70, B() - 210], [x + 40, B() - 232],
                 [x + 140, B() - 160], [x + 210, B() - 60], [x + 260, B() - 10]];
    return { node: q, pts };
  }

  // Листочек. Укус ВЫРЕЗАЕТСЯ маской, а не закрашивается кружком поверх:
  // закрашенный кружок не совпадал с фоном и торчал за край листа.
  // Кусает улитка слева — с той стороны, где её рот.
  function leaf(g, x) {
    const q = el(g, 'g', {}), y = B() - 20;
    const id = 'lm' + Math.random().toString(36).slice(2, 8);
    const mask = el(q, 'mask', { id, maskUnits: 'userSpaceOnUse' });
    const cover = el(mask, 'rect', { x: x - 80, y: y - 200, width: 400, height: 320, fill: '#FFFFFF' });
    const inner = el(q, 'g', { mask: `url(#${id})` });
    const W = `M${x},${y} C${x + 34},${y - 86} ${x + 140},${y - 118} ${x + 212},${y - 86} C${x + 204},${y + 12} ${x + 108},${y + 50} ${x + 32},${y + 24} C${x + 8},${y + 16} ${x - 6},${y - 2} ${x},${y} Z`;
    el(inner, 'path', { d: W, fill: '#7CC03E', stroke: '#44821F', 'stroke-width': 4 });
    el(inner, 'path', { d: `M${x + 8},${y + 6} C${x + 70},${y - 20} ${x + 146},${y - 56} ${x + 204},${y - 82}`, fill: 'none', stroke: '#44821F', 'stroke-width': 3, 'stroke-linecap': 'round' });
    el(inner, 'path', { d: `M${x + 44},${y - 4} C${x + 54},${y - 28} ${x + 58},${y - 48} ${x + 56},${y - 66} M${x + 86},${y - 22} C${x + 98},${y - 46} ${x + 104},${y - 66} ${x + 103},${y - 82} M${x + 134},${y - 42} C${x + 146},${y - 62} ${x + 154},${y - 82} ${x + 154},${y - 96}`,
      fill: 'none', stroke: '#4E8F25', 'stroke-width': 2, opacity: .7, 'stroke-linecap': 'round' });
    const bites = [[x + 24, y - 2, 36], [x + 54, y - 50, 38], [x + 96, y - 14, 40]];
    let n = 0;
    return {
      node: q,
      bite() {
        if (n >= bites.length) return null;
        const b = bites[n++];
        el(mask, 'circle', { cx: b[0], cy: b[1], r: b[2], fill: '#000000' });
        return b;
      },
      get left() { return bites.length - n; },
      reset() { n = 0; [...mask.querySelectorAll('circle')].forEach(c => c.remove()); }
    };
  }

  // Муравьи только в зоне действия и только крупные: мелкие под улиткой ребёнок не найдёт.
  function antSwarm(g, x0, x1, n) {
    const q = el(g, 'g', {}), list = [];
    for (let i = 0; i < n; i++) {
      const x = x0 + (x1 - x0) * ((i + .5) / n) + rnd(-26, 26);
      const y = B() - 10 + Math.sin(i * 1.7) * 90 - 40;
      const node = el(q, 'g', {});
      U.ant(node, x, y, rnd(1.5, 2.1), rnd(-30, 30).toFixed(0));
      list.push({ node, x, y, r: 110 });
    }
    return { node: q, list };
  }

  function clouds(g) {
    const q = el(g, 'g', {});
    [[160, 46, 1.25], [430, 24, 1.6], [720, 54, 1.35], [950, 30, 1.1]].forEach(c => {
      const w = el(q, 'g', { transform: `translate(${c[0]} ${c[1]}) scale(${c[2]})` });
      [[0, 0, 54], [-52, 14, 38], [52, 16, 42], [-26, -22, 34], [30, -20, 32]].forEach(o =>
        el(w, 'ellipse', { cx: o[0], cy: o[1], rx: o[2], ry: o[2] * .74, fill: '#AFC3CE' }));
      [[0, -6, 48], [-48, 8, 32], [48, 10, 36], [-24, -28, 30], [28, -26, 28]].forEach(o =>
        el(w, 'ellipse', { cx: o[0], cy: o[1], rx: o[2], ry: o[2] * .74, fill: '#C9D8E1' }));
    });
    return q;
  }

  function rain(g) {
    const q = el(g, 'g', {}), drops = [];
    for (let i = 0; i < 24; i++) {
      const x = rnd(0, 1000), s = rnd(.9, 2.1);
      const d = el(q, 'path', { d: DROP, fill: '#79C6DE', opacity: rnd(.5, .9).toFixed(2),
        transform: `translate(${x.toFixed(0)} -60) scale(${s.toFixed(2)})` });
      d.animate([{ transform: `translate(${x.toFixed(0)}px,-60px) scale(${s.toFixed(2)})` },
                 { transform: `translate(${(x + rnd(-30, 30)).toFixed(0)}px,700px) scale(${s.toFixed(2)})` }],
        { duration: rnd(1200, 2400), delay: rnd(0, 2200), iterations: Infinity, easing: 'linear' });
      drops.push(d);
    }
    return { node: q, drops };
  }

  // Раскрытая ладошка, которой ребёнок укрывает улитку от дождя.
  // Четыре пальца и отставленный большой — силуэт должен быть однозначным.
  function palm(g) {
    const q = el(g, 'g', { opacity: 0, 'pointer-events': 'none' });
    const SK = { fill: '#FFE1CC', stroke: '#C2795A', 'stroke-width': 4.5, 'stroke-linejoin': 'round' };
    [[-54, -96, -14], [-20, -112, -5], [16, -110, 5], [50, -94, 15]].forEach(f =>
      el(q, 'rect', Object.assign({ x: f[0], y: f[1], width: 32, height: 104, rx: 16,
        transform: `rotate(${f[2]} ${f[0] + 16} ${f[1] + 90})` }, SK)));
    el(q, 'rect', Object.assign({ x: -116, y: -34, width: 34, height: 74, rx: 17, transform: 'rotate(-42 -99 0)' }, SK));
    el(q, 'rect', Object.assign({ x: -74, y: -34, width: 148, height: 96, rx: 42 }, SK));
    return q;
  }

  // Солнце крупное и в полосе неба; лучи идут в зону действия, где их ничто не закрывает.
  function sun(g) {
    const q = el(g, 'g', { opacity: 0 }), rays = [], SX = 720, SY = 84, R = 62;
    const A = [2.16, 1.79, 1.37], L = 380;
    A.forEach((a, i) => {
      const p = (ang, r) => `${(SX + Math.cos(ang) * r).toFixed(0)},${(SY + Math.sin(ang) * r).toFixed(0)}`;
      rays.push(el(q, 'path', {
        d: `M${p(a - .07, R)} L${p(a - .17, L)} L${p(a + .17, L)} L${p(a + .07, R)} Z`,
        fill: '#FFE07A', opacity: .85, stroke: '#E0A63A', 'stroke-width': 3, 'data-ray': i
      }));
    });
    const face = el(q, 'g', {});
    el(face, 'circle', { cx: SX, cy: SY, r: R, fill: '#FFD83D', stroke: '#E0A020', 'stroke-width': 3 });
    el(face, 'circle', { cx: SX - 20, cy: SY - 9, r: 8, fill: '#3A3023' });
    el(face, 'circle', { cx: SX + 20, cy: SY - 9, r: 8, fill: '#3A3023' });
    el(face, 'ellipse', { cx: SX - 31, cy: SY + 11, rx: 11, ry: 7, fill: '#F79A8C', opacity: .6 });
    el(face, 'ellipse', { cx: SX + 31, cy: SY + 11, rx: 11, ry: 7, fill: '#F79A8C', opacity: .6 });
    el(face, 'path', { d: `M${SX - 19},${SY + 17} q19,20 38,0`, fill: 'none', stroke: '#3A3023', 'stroke-width': 5, 'stroke-linecap': 'round' });
    return { node: q, rays, tapAt: i => ({ x: SX + Math.cos(A[i]) * 260, y: SY + Math.sin(A[i]) * 260 }) };
  }

  function sparkle(g, x, y, n) {
    for (let i = 0; i < (n || 8); i++) {
      const a = rnd(0, 6.28), d = rnd(50, 130);
      const s = el(g, 'circle', { cx: x, cy: y, r: rnd(4, 9).toFixed(1), fill: U.pick(['#FFD83D', '#FFF3C4', '#FFB04C']) });
      s.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 },
                 { transform: `translate(${(Math.cos(a) * d).toFixed(0)}px,${(Math.sin(a) * d - 30).toFixed(0)}px) scale(.2)`, opacity: 0 }],
        { duration: rnd(600, 1000), easing: 'ease-out' }).onfinish = () => s.remove();
    }
  }

  function crumbs(g, x, y) {
    for (let i = 0; i < 7; i++) {
      const c = el(g, 'path', { d: 'M0,0 l7,3 l-2,7 l-7,-3 z', fill: U.pick(['#7CC03E', '#5EA12A', '#9AD05C']),
        transform: `translate(${x} ${y})` });
      const dx = rnd(-90, 90), dy = rnd(30, 90);
      c.animate([{ transform: `translate(${x}px,${y}px) rotate(0deg)`, opacity: 1 },
                 { transform: `translate(${x + dx}px,${y + dy}px) rotate(${rnd(-300, 300).toFixed(0)}deg)`, opacity: 0 }],
        { duration: rnd(500, 900), easing: 'ease-in' }).onfinish = () => c.remove();
    }
  }

  return { debris, branch, leaf, antSwarm, clouds, rain, palm, sun, sparkle, crumbs };
})();
