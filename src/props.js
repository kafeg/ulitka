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
    // ВАЖНО: без явных x/y/width/height область маски считается от вьюпорта,
    // и предмет в глубине мира пропадает целиком. Задаём её по месту листочка.
    const mask = el(q, 'mask', { id, maskUnits: 'userSpaceOnUse',
      x: x - 120, y: y - 240, width: 480, height: 420 });
    el(mask, 'rect', { x: x - 120, y: y - 240, width: 480, height: 420, fill: '#FFFFFF' });
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

  // Зонтик, которым ребёнок укрывает улитку от дождя.
  // Ладошка в таком размере читалась плохо; зонт понятен сразу и выглядит нарядно.
  function umbrella(g) {
    const q = el(g, 'g', { opacity: 0, 'pointer-events': 'none' });
    const R = 182, SEG = 6, CY = -86;
    el(q, 'path', { d: `M0,${CY} L0,${CY + 150} q0,34 -34,34 q-26,0 -32,-20`, fill: 'none',
      stroke: '#8A5629', 'stroke-width': 13, 'stroke-linecap': 'round' });
    for (let i = 0; i < SEG; i++) {
      const a0 = Math.PI + i * Math.PI / SEG, a1 = Math.PI + (i + 1) * Math.PI / SEG;
      const x0 = Math.cos(a0) * R, y0 = CY + Math.sin(a0) * R;
      const x1 = Math.cos(a1) * R, y1 = CY + Math.sin(a1) * R;
      el(q, 'path', { d: `M0,${CY} L${x0.toFixed(1)},${y0.toFixed(1)} Q${((x0 + x1) / 2 * 1.1).toFixed(1)},${((y0 + y1) / 2 - CY) * 1.1 + CY + 26} ${x1.toFixed(1)},${y1.toFixed(1)} Z`,
        fill: i % 2 ? '#ED5C7A' : '#FFF4E2', stroke: '#B83350', 'stroke-width': 3.5, 'stroke-linejoin': 'round' });
    }
    el(q, 'path', { d: `M0,${CY - 6} L0,${CY - 34}`, stroke: '#8A5629', 'stroke-width': 9, 'stroke-linecap': 'round' });
    el(q, 'circle', { cx: 0, cy: CY - 36, r: 7, fill: '#8A5629' });
    el(q, 'circle', { cx: 0, cy: CY, r: 9, fill: '#B83350' });
    return q;
  }

  // Брызги по куполу: видно, что зонт действительно ловит капли.
  function splash(g, x, y) {
    const a = rnd(-2.6, -0.5);
    for (let i = 0; i < 3; i++) {
      const d = el(g, 'circle', { cx: x, cy: y, r: rnd(3, 6).toFixed(1), fill: '#79C6DE', opacity: .9 });
      const dx = Math.cos(a + rnd(-.5, .5)) * rnd(24, 54), dy = Math.sin(a + rnd(-.5, .5)) * rnd(20, 46);
      d.animate([{ transform: 'translate(0,0)', opacity: .9 },
                 { transform: `translate(${dx.toFixed(0)}px,${dy.toFixed(0)}px)`, opacity: 0 }],
        { duration: 480, easing: 'ease-out' }).onfinish = () => d.remove();
    }
  }

  // Солнце: тёплый ореол, медленно вращающаяся корона из коротких лучей
  // и ТРИ длинных луча до сиденья — те самые, которые ребёнок считает.
  // На конце каждого — светящаяся точка: видно, куда тапать.
  function sun(g) {
    const q = el(g, 'g', { opacity: 0 }), SX = 716, SY = 106, R = 58;
    const A = [2.16, 1.79, 1.37], L = 372;
    const px = (a, r) => SX + Math.cos(a) * r, py = (a, r) => SY + Math.sin(a) * r;

    [[2.5, .10], [2.0, .16], [1.55, .24]].forEach(h =>
      el(q, 'circle', { cx: SX, cy: SY, r: (R * h[0]).toFixed(0), fill: '#FFD83D', opacity: h[1] }));

    const corona = el(q, 'g', {});
    for (let i = 0; i < 18; i++) {
      const a = i * Math.PI * 2 / 18, lg = i % 2 ? 18 : 32;
      el(corona, 'path', { d: `M${px(a, R + 4).toFixed(1)},${py(a, R + 4).toFixed(1)} L${px(a, R + 4 + lg).toFixed(1)},${py(a, R + 4 + lg).toFixed(1)}`,
        stroke: '#FFC94A', 'stroke-width': i % 2 ? 7 : 10, 'stroke-linecap': 'round', opacity: .9 });
    }
    corona.animate([{ transform: `rotate(0deg)` }, { transform: `rotate(360deg)` }],
      { duration: 60000, iterations: Infinity, easing: 'linear', composite: 'replace' });
    corona.style.transformOrigin = `${SX}px ${SY}px`;

    const rays = [], dots = [];
    A.forEach((a, i) => {
      const d = `M${px(a, R + 10).toFixed(1)},${py(a, R + 10).toFixed(1)} L${px(a, L).toFixed(1)},${py(a, L).toFixed(1)}`;
      const g2 = el(q, 'g', { 'data-ray': i });
      el(g2, 'path', { d, stroke: '#FFE7A8', 'stroke-width': 34, 'stroke-linecap': 'round', opacity: .5, class: 'rayWide' });
      el(g2, 'path', { d, stroke: '#FFD055', 'stroke-width': 14, 'stroke-linecap': 'round', opacity: .55, class: 'rayCore' });
      rays.push(g2);
      const t = el(q, 'g', { transform: `translate(${px(a, L).toFixed(1)} ${py(a, L).toFixed(1)})` });
      el(t, 'circle', { r: 30, fill: '#FFD83D', opacity: .28 });
      el(t, 'circle', { r: 19, fill: '#FFF0B8', stroke: '#E0A63A', 'stroke-width': 4 });
      t.animate([{ transform: `translate(${px(a, L).toFixed(1)}px,${py(a, L).toFixed(1)}px) scale(1)` },
                 { transform: `translate(${px(a, L).toFixed(1)}px,${py(a, L).toFixed(1)}px) scale(1.18)` }],
        { duration: 1100, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
      dots.push(t);
    });

    const face = el(q, 'g', {});
    el(face, 'circle', { cx: SX, cy: SY, r: R, fill: '#FFD83D', stroke: '#E0A020', 'stroke-width': 3 });
    el(face, 'circle', { cx: SX - 18, cy: SY - 22, r: R * .42, fill: '#FFE780', opacity: .7 });
    el(face, 'circle', { cx: SX - 19, cy: SY - 8, r: 8, fill: '#3A3023' });
    el(face, 'circle', { cx: SX + 19, cy: SY - 8, r: 8, fill: '#3A3023' });
    el(face, 'circle', { cx: SX - 16, cy: SY - 11, r: 2.6, fill: '#FFFDF8' });
    el(face, 'circle', { cx: SX + 22, cy: SY - 11, r: 2.6, fill: '#FFFDF8' });
    el(face, 'ellipse', { cx: SX - 30, cy: SY + 12, rx: 11, ry: 7, fill: '#F79A8C', opacity: .65 });
    el(face, 'ellipse', { cx: SX + 30, cy: SY + 12, rx: 11, ry: 7, fill: '#F79A8C', opacity: .65 });
    el(face, 'path', { d: `M${SX - 18},${SY + 16} q18,20 36,0`, fill: 'none', stroke: '#3A3023', 'stroke-width': 5, 'stroke-linecap': 'round' });

    function light(i) {
      rays[i].querySelector('.rayWide').animate([{ opacity: .5 }, { opacity: .9 }], { duration: 400, fill: 'forwards' });
      const core = rays[i].querySelector('.rayCore');
      core.setAttribute('stroke', '#FFB82E');
      core.animate([{ opacity: .55, strokeWidth: 14 }, { opacity: 1, strokeWidth: 22 }], { duration: 400, fill: 'forwards' });
      dots[i].getAnimations().forEach(a => a.cancel());
      dots[i].animate([{ opacity: 1, transform: dots[i].getAttribute('transform').replace(/translate\(([^ ]+) ([^)]+)\)/, 'translate($1px,$2px)') + ' scale(1)' },
                       { opacity: 0, transform: dots[i].getAttribute('transform').replace(/translate\(([^ ]+) ([^)]+)\)/, 'translate($1px,$2px)') + ' scale(2.2)' }],
        { duration: 450, easing: 'ease-out', fill: 'forwards' });
    }

    return { node: q, count: 3, light, tapAt: i => ({ x: px(A[i], L), y: py(A[i], L) }) };
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

  return { debris, branch, leaf, antSwarm, clouds, rain, umbrella, splash, sun, sparkle, crumbs };
})();
