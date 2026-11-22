// Hint — показывает ребёнку, что делать. Без текста: рука в нижней полосе
// проигрывает нужный жест с первой секунды сцены, а через паузу такая же рука
// появляется прямо на предмете. В книжке эту роль играл текст, который читает взрослый.
var Hint = (function () {
  const el = U.el;
  const CX = 500, CY = 580, CARD = { x: 288, y: 518, w: 424, h: 112 };
  let card, stageG, ghost, live = [];

  // Рука: начало координат — кончик пальца, чтобы ставить её прямо на цель.
  // Указательный палец идёт от ЛЕВОГО края кулака, большой отставлен в сторону.
  // ВАЖНО: палец ровно по центру кулака читается как неприличный жест — так нельзя.
  function handGlyph(p, s) {
    const g = el(p, 'g', { transform: `scale(${s || 1})` });
    const SK = { fill: '#FFE1CC', stroke: '#C2795A', 'stroke-width': 3.4, 'stroke-linejoin': 'round' };
    el(g, 'rect', Object.assign({ x: -10, y: 0, width: 20, height: 54, rx: 10 }, SK));
    el(g, 'rect', Object.assign({ x: -31, y: 44, width: 18, height: 32, rx: 9, transform: 'rotate(-26 -22 60)' }, SK));
    el(g, 'rect', Object.assign({ x: -12, y: 38, width: 58, height: 50, rx: 23 }, SK));
    el(g, 'path', { d: 'M18,48 q12,-5 22,2 M20,64 q12,-5 22,2', fill: 'none', stroke: '#C2795A',
      'stroke-width': 2.2, 'stroke-linecap': 'round', opacity: .55 });
    return g;
  }

  function init(ui) {
    const c = el(ui, 'g', { id: 'hintCard', opacity: 0 });
    el(c, 'rect', { x: CARD.x, y: CARD.y, width: CARD.w, height: CARD.h, rx: 20,
      fill: '#FFFBF0', opacity: .97, stroke: '#A8884E', 'stroke-width': 3 });
    stageG = el(c, 'g', {});
    card = c;
    ghost = el(ui, 'g', { id: 'hintGhost', opacity: 0 });
  }

  function stop() { live.forEach(a => a.cancel()); live = []; U.clear(stageG); }

  const A = (node, frames, opts) => { const a = node.animate(frames, opts); live.push(a); return a; };

  function ripple(x, y, delay) {
    const r = el(stageG, 'circle', { cx: x, cy: y, r: 10, fill: 'none', stroke: '#E8873A', 'stroke-width': 3, opacity: 0 });
    A(r, [{ r: 10, opacity: 0 }, { r: 12, opacity: .9, offset: .05 }, { r: 34, opacity: 0 }],
      { duration: 2400, delay, iterations: Infinity, easing: 'ease-out' });
  }

  // kind: tap3 | tap | sweep | hold | path
  function show(kind) {
    stop();
    card.animate([{ opacity: card.getAttribute('opacity') || 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' });
    card.setAttribute('opacity', 1);

    if (kind === 'tap3' || kind === 'tap') {
      const n = kind === 'tap3' ? 3 : 1;
      const h = el(stageG, 'g', { transform: `translate(${CX} ${CY - 34})` });
      handGlyph(h, .9);
      const frames = [{ transform: `translate(${CX}px,${CY - 34}px)` }];
      for (let i = 0; i < n; i++) {
        frames.push({ transform: `translate(${CX}px,${CY - 14}px)`, offset: (i * 2 + 1) / (n * 2 + 2) });
        frames.push({ transform: `translate(${CX}px,${CY - 34}px)`, offset: (i * 2 + 2) / (n * 2 + 2) });
        ripple(CX, CY - 38, (i * 2 + 1) / (n * 2 + 2) * 2400);
      }
      frames.push({ transform: `translate(${CX}px,${CY - 34}px)` });
      A(h, frames, { duration: 2400, iterations: Infinity, easing: 'ease-in-out' });
    }

    if (kind === 'sweep') {
      const h = el(stageG, 'g', {});
      handGlyph(h, .92);
      const tr = el(stageG, 'path', { d: `M${CX - 96} ${CY + 6} Q${CX} ${CY - 14} ${CX + 96} ${CY + 6}`,
        fill: 'none', stroke: '#E8873A', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: .5, 'stroke-dasharray': 230, 'stroke-dashoffset': 230 });
      A(tr, [{ strokeDashoffset: 230, opacity: .6 }, { strokeDashoffset: 0, opacity: .6, offset: .7 }, { strokeDashoffset: 0, opacity: 0 }],
        { duration: 1900, iterations: Infinity });
      A(h, [{ transform: `translate(${CX - 96}px,${CY - 14}px) rotate(-14deg)` },
            { transform: `translate(${CX}px,${CY - 32}px) rotate(0deg)`, offset: .35 },
            { transform: `translate(${CX + 96}px,${CY - 14}px) rotate(14deg)`, offset: .7 },
            { transform: `translate(${CX + 96}px,${CY - 14}px) rotate(14deg)`, opacity: 0 }],
        { duration: 1900, iterations: Infinity, easing: 'ease-in-out' });
    }

    if (kind === 'hold') {
      const ring = el(stageG, 'circle', { cx: CX, cy: CY - 6, r: 30, fill: 'none', stroke: '#E6D9BE', 'stroke-width': 6 });
      const fill = el(stageG, 'circle', { cx: CX, cy: CY - 6, r: 30, fill: 'none', stroke: '#E8873A', 'stroke-width': 6,
        'stroke-linecap': 'round', 'stroke-dasharray': 189, 'stroke-dashoffset': 189, transform: `rotate(-90 ${CX} ${CY - 6})` });
      A(fill, [{ strokeDashoffset: 189 }, { strokeDashoffset: 0, offset: .75 }, { strokeDashoffset: 0 }],
        { duration: 2600, iterations: Infinity });
      const h = el(stageG, 'g', { transform: `translate(${CX} ${CY - 10})` });
      handGlyph(h, .92);
      A(h, [{ transform: `translate(${CX}px,${CY - 34}px)` }, { transform: `translate(${CX}px,${CY - 14}px)`, offset: .12 },
            { transform: `translate(${CX}px,${CY - 14}px)` }], { duration: 2600, iterations: Infinity, easing: 'ease-out' });
    }

    if (kind === 'path') {
      const P = [[CX - 100, CY + 24], [CX - 58, CY - 6], [CX - 16, CY - 34], [CX + 26, CY - 6], [CX + 68, CY + 20], [CX + 104, CY + 28]];
      const d = 'M' + P.map(p => p.join(' ')).join(' L');
      el(stageG, 'path', { d, fill: 'none', stroke: '#E6D9BE', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      const lit = el(stageG, 'path', { d, fill: 'none', stroke: '#E8873A', 'stroke-width': 7, 'stroke-linecap': 'round',
        'stroke-linejoin': 'round', 'stroke-dasharray': 400, 'stroke-dashoffset': 400 });
      A(lit, [{ strokeDashoffset: 400 }, { strokeDashoffset: 0, offset: .75 }, { strokeDashoffset: 0, opacity: 1, offset: .9 }, { strokeDashoffset: 0, opacity: 0 }],
        { duration: 2600, iterations: Infinity });
      const h = el(stageG, 'g', {});
      handGlyph(h, .8);
      A(h, P.map((p, i) => ({ transform: `translate(${p[0]}px,${p[1]}px)`, offset: Math.min(1, i / (P.length - 1) * .8) }))
           .concat([{ transform: `translate(${P[P.length - 1][0]}px,${P[P.length - 1][1]}px)`, opacity: 0 }]),
        { duration: 2600, iterations: Infinity, easing: 'ease-in-out' });
    }
  }

  function hide() {
    stop();
    card.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'forwards' });
    card.setAttribute('opacity', 0);
    ghostOff();
  }

  // Та же рука, но прямо на предмете: появляется, если ребёнок долго не трогает экран.
  function ghostAt(x, y) {
    U.clear(ghost);
    const g = el(ghost, 'g', { transform: `translate(${x} ${y})` });
    el(g, 'circle', { r: 34, fill: '#FFFFFF', opacity: .45 });
    handGlyph(g, 1);
    ghost.setAttribute('opacity', 1);
    g.animate([{ transform: `translate(${x}px,${y}px) scale(1)` },
               { transform: `translate(${x}px,${y}px) scale(1.18)`, offset: .5 },
               { transform: `translate(${x}px,${y}px) scale(1)` }],
      { duration: 1200, iterations: Infinity, easing: 'ease-in-out' });
  }

  function ghostOff() { U.clear(ghost); ghost.setAttribute('opacity', 0); }

  return { init, show, hide, ghostAt, ghostOff };
})();
