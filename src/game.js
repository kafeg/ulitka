// Game — семь препятствий подряд и камера, которая едет за улиткой.
// Правило всей игры: проиграть нельзя. Через IDLE_MS появляется рука-подсказка,
// через SOLVE_MS улитка справляется сама, и сцена идёт дальше.
var Game = (function () {
  const $ = id => document.getElementById(id);
  const W = 3000, VIEW = 1000, ANCHOR = 330, IDLE_MS = 8000, SOLVE_MS = 22000;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const dist = (a, b, x, y) => Math.hypot(a - x, b - y);

  let svg, cam, propsG, weatherG, uiG, hand, onHint = () => {};
  let camX = 0, parts = {}, gesture = null, idleT = 0, solveT = 0, step = 0, busy = false;

  // ——— камера и координаты ———
  function follow(x) {
    camX = clamp(x - ANCHOR, 0, W - VIEW);
    cam.setAttribute('transform', `translate(${(-camX).toFixed(1)},0)`);
  }
  const screenX = wx => wx - camX;
  function pt(e) {
    const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const v = p.matrixTransform(svg.getScreenCTM().inverse());
    return { x: v.x, y: v.y, wx: v.x + camX };
  }

  // ——— ожидание жеста ———
  function arm(spec) {
    disarm();
    gesture = spec;
    idleT = setTimeout(() => { const p = spec.hint && spec.hint(); if (p) hand.show(p.x, p.y); }, IDLE_MS);
    solveT = setTimeout(() => { disarm(); spec.solve(); }, SOLVE_MS);
  }
  function progress() {
    clearTimeout(idleT); hand.hide();
    if (gesture) idleT = setTimeout(() => { const p = gesture.hint && gesture.hint(); if (p) hand.show(p.x, p.y); }, IDLE_MS);
  }
  function disarm() { gesture = null; clearTimeout(idleT); clearTimeout(solveT); hand.hide(); }

  function onDown(e) {
    Sound.wake();
    if (!gesture) return;
    const p = pt(e); progress();
    gesture.down && gesture.down(p);
  }
  function onMove(e) {
    if (!gesture || !gesture.move) return;
    if (e.buttons === 0 && e.pointerType === 'mouse') return;
    gesture.move(pt(e));
  }
  function onUp(e) { if (gesture && gesture.up) gesture.up(pt(e)); }

  // ——— готовые жесты ———
  function tapTimes(n, each, done, hint) {
    let k = 0;
    arm({
      hint,
      down() { k++; each(k); if (k >= n) { disarm(); done(); } else progress(); },
      solve() { while (k < n) { k++; each(k); } done(); }
    });
  }

  function sweepAway(items, done, hint) {
    let left = items.length;
    const fling = it => {
      if (it.gone) return;
      it.gone = true; left--;
      Sound.sweep();
      it.node.animate([{ transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
                       { transform: `translate(${U.rnd(-180, 180).toFixed(0)}px,-460px) rotate(${U.rnd(-240, 240).toFixed(0)}deg)`, opacity: 0 }],
        { duration: 650, easing: 'ease-out', fill: 'forwards' });
      if (left <= 0) { disarm(); setTimeout(done, 400); } else progress();
    };
    arm({
      hint,
      move(p) { items.forEach(it => { if (!it.gone && dist(it.x, it.y, p.wx, p.y) < it.r) fling(it); }); },
      down(p) { items.forEach(it => { if (!it.gone && dist(it.x, it.y, p.wx, p.y) < it.r) fling(it); }); },
      solve() { items.forEach((it, i) => setTimeout(() => fling(it), i * 220)); }
    });
  }

  function holdOver(target, ms, done, hint) {
    let t = 0;
    const palm = parts.palm;
    const stop = () => { clearTimeout(t); t = 0; palm.setAttribute('opacity', 0); };
    arm({
      hint,
      down(p) {
        palm.setAttribute('transform', `translate(${p.x} ${p.y})`);
        palm.setAttribute('opacity', 1);
        const tg = target();
        if (dist(tg.x, tg.y, p.x, p.y) > 260) return;
        t = setTimeout(() => { stop(); disarm(); done(); }, ms);
      },
      move(p) {
        palm.setAttribute('transform', `translate(${p.x} ${p.y})`);
        const tg = target();
        if (dist(tg.x, tg.y, p.x, p.y) > 260 && t) stop();
      },
      up() { stop(); },
      solve() { stop(); done(); }
    });
  }

  function dragPath(pts, done, hint) {
    const dots = pts.map((p, i) => U.el(propsG, 'circle',
      { cx: p[0], cy: p[1], r: 15, fill: '#FFFDF8', stroke: '#E8873A', 'stroke-width': 4, opacity: .9, 'data-i': i }));
    let left = pts.length;
    const touch = i => {
      if (dots[i].dataset.on) return;
      dots[i].dataset.on = '1'; left--;
      dots[i].setAttribute('fill', '#7CC03E');
      dots[i].animate([{ transform: 'scale(1)' }, { transform: 'scale(1.6)' }, { transform: 'scale(1)' }],
        { duration: 300, transformOrigin: `${pts[i][0]}px ${pts[i][1]}px` });
      Sound.pop();
      if (left <= 0) { disarm(); dots.forEach(d => d.animate([{ opacity: .9 }, { opacity: 0 }], { duration: 400, fill: 'forwards' })); done(); }
      else progress();
    };
    const check = p => pts.forEach((q, i) => { if (dist(q[0], q[1], p.wx, p.y) < 95) touch(i); });
    arm({ hint, down: check, move: check, solve() { pts.forEach((_, i) => setTimeout(() => touch(i), i * 200)); } });
    return pts;
  }

  // ——— семь препятствий ———
  const AT = { knock: 330, debris: 500, rain: 980, ants: 1340, sun: 1760, branch: 2020, leaf: 2380 };
  const WORLD = { debris: 790, ants: 1420, branch: 2180, leaf: 2520 };

  function say(t) { onHint(t); }
  const headScreen = () => ({ x: screenX(Snail.x) + 150, y: 380 });
  const shellScreen = () => ({ x: screenX(Snail.x) - 30, y: 350 });

  function sKnock(next) {
    say('Постучись в домик: тук-тук-тук.');
    tapTimes(3, k => { Sound.knock(); Snail.knockShake(); Snail.ring(); Snail.pop('ТУК!'); },
      () => Snail.wakeUp(() => { Sound.cheer(); next(); }), shellScreen);
  }

  function sDebris(next) {
    say('Почисти дорожку — смахни пальцем.');
    sweepAway(parts.debris, next, () => ({ x: screenX(parts.debris.find(i => !i.gone).x), y: 440 }));
  }

  function sRain(next) {
    say('Кап-кап-кап. Укрой улитку ладошкой!');
    parts.rain = Props.rain(weatherG);
    weatherG.appendChild(parts.palm);   // ладошка должна быть поверх дождя
    Snail.shiver(true);
    const drip = setInterval(() => Sound.drop(Math.random() * 3), 420);
    holdOver(headScreen, 1600, () => {
      Snail.shiver(false);
      Snail.hide(() => { clearInterval(drip); sCount(next); });
    }, headScreen);
  }

  function sCount(next) {
    say('В домике тепло и сухо. Сосчитай до трёх.');
    const n = parts.rain.drops;
    tapTimes(3, k => {
      Sound.count(k - 1); Snail.pop(['ОДИН', 'ДВА', 'ТРИ'][k - 1], '#2F7D9B');
      n.slice((k - 1) * 9, k * 9).forEach(d => d.animate([{ opacity: .7 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }));
    }, () => {
      parts.rain.node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, fill: 'forwards' }).onfinish = () => parts.rain.node.remove();
      Sound.cheer();
      Snail.peek(next);
    }, () => ({ x: 500, y: 320 }));
  }

  function sAnts(next) {
    say('Муравьи! Прогони их — проведи пальцем.');
    parts.ants = Props.antSwarm(propsG, WORLD.ants, 11);
    Snail.hide(() => {
      sweepAway(parts.ants.list.map(a => ({ node: a.node, x: a.x, y: a.y, r: 110 })),
        () => { Sound.cheer(); Snail.peek(next); },
        () => ({ x: screenX(WORLD.ants), y: 320 }));
    });
  }

  function sSun(next) {
    say('Выглянуло солнце. Посчитай лучи: один, два, три.');
    parts.sun = Props.sun(weatherG);
    parts.sun.node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, fill: 'forwards' });
    let lit = 0;
    const rays = parts.sun.rays;
    const light = i => {
      if (rays[i].dataset.on) return false;
      rays[i].dataset.on = '1'; lit++;
      rays[i].animate([{ opacity: .3 }, { opacity: .95 }], { duration: 350, fill: 'forwards' });
      Sound.shine(lit - 1); Snail.pop(['ОДИН', 'ДВА', 'ТРИ'][lit - 1], '#C8870F');
      return true;
    };
    arm({
      hint: () => { const i = rays.findIndex(r => !r.dataset.on); return { x: 820 + Math.cos(2.25 + i * .26) * 330, y: 120 + Math.sin(2.25 + i * .26) * 330 }; },
      down(p) {
        const i = rays.findIndex(r => !r.dataset.on);
        if (i >= 0 && light(i)) { if (lit >= 3) { disarm(); finish(); } else progress(); }
      },
      solve() { while (lit < 3) light(rays.findIndex(r => !r.dataset.on)); finish(); }
    });
    function finish() {
      Sound.cheer();
      setTimeout(() => Snail.yawn(() => {
        parts.sun.node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, fill: 'forwards' }).onfinish = () => parts.sun.node.remove();
        next();
      }), 500);
    }
  }

  function sBranch(next) {
    say('Ветка! Позови улитку и покажи путь.');
    Snail.hide(() => {
      arm({
        hint: shellScreen,
        down() { disarm(); Snail.pop('УЛИТКА!', '#2F7D3A'); Snail.peek(showPath); },
        solve() { Snail.peek(showPath); }
      });
    });
    function showPath() {
      say('Веди пальцем: вверх-вверх-вверх, вниз-вниз-вниз.');
      dragPath(parts.branch.pts, () => {
        Sound.cheer();
        climb(0);
      }, () => {
        const d = parts.branch.pts.find((_, i) => !document.querySelector(`#props circle[data-i="${i}"]`).dataset.on);
        return d ? { x: screenX(d[0]), y: d[1] } : null;
      });
    }
    // Улитка переползает ветку по тем же точкам, по которым вёл палец.
    function climb(i) {
      const pts = parts.branch.pts;
      if (i >= pts.length) { Snail.jumpTo(pts[pts.length - 1][0] - 150, 470); next(); return; }
      Snail.moveTo(pts[i][0] - 150, pts[i][1] + 10, 430, () => climb(i + 1));
    }
  }

  function sLeaf() {
    say('Вот он, листочек!');
    Sound.munch();
    setTimeout(() => {
      parts.leaf.bite();
      Snail.pop('АМ!', '#4E8F25');
      setTimeout(() => { Snail.sleep(); Sound.cheer(); say('Улитка наелась и уснула. Домик всегда с тобой.'); replay(); }, 900);
    }, 700);
  }

  function replay() {
    arm({ hint: () => ({ x: 500, y: 320 }), down() { reset(); start(); }, solve() {} });
  }

  // ——— последовательность ———
  const SEQ = [
    n => sKnock(n),
    n => Snail.crawlTo(AT.debris, () => sDebris(n)),
    n => Snail.crawlTo(AT.rain, () => sRain(n)),
    n => Snail.crawlTo(AT.ants, () => sAnts(n)),
    n => Snail.crawlTo(AT.sun, () => sSun(n)),
    n => Snail.crawlTo(AT.branch, () => sBranch(n)),
    n => Snail.crawlTo(AT.leaf, () => sLeaf())
  ];

  function next() { if (busy) return; busy = true; setTimeout(() => { busy = false; const f = SEQ[step++]; f && f(next); }, 350); }

  function build() {
    U.clear(propsG); U.clear(weatherG); U.clear($('wood')); U.clear($('flora'));
    U.wood($('wood'), W);
    U.flora($('flora'), W);
    parts = {};
    parts.leaf = Props.leaf(propsG, WORLD.leaf);
    parts.branch = Props.branch(propsG, WORLD.branch);
    parts.debris = Props.debris(propsG, WORLD.debris);
    parts.palm = Props.palm(weatherG);
  }

  function reset() {
    disarm(); step = 0; busy = false;
    build();
    Snail.reset();
    follow(Snail.x);
  }

  function init(hintFn) {
    onHint = hintFn || onHint;
    svg = $('scene'); cam = $('cam'); propsG = $('props'); weatherG = $('weather'); uiG = $('ui');
    weatherG.setAttribute('pointer-events', 'none');
    uiG.setAttribute('pointer-events', 'none');
    hand = Props.hand(uiG);
    U.shell($('shellDetail')); U.speckles($('speckles')); U.trail($('trail'));
    Snail.init(follow);
    svg.addEventListener('pointerdown', onDown);
    svg.addEventListener('pointermove', onMove);
    svg.addEventListener('pointerup', onUp);
    svg.addEventListener('pointercancel', onUp);
  }

  function start() { reset(); next(); }
  function skip() { if (gesture) { const g = gesture; disarm(); g.solve(); } }

  return { init, start, reset, skip };
})();
