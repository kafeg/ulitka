// Game — семь препятствий подряд, камера и жесты.
// Главное правило разметки: улитка всегда в своей зоне, препятствие всегда в зоне действия,
// между ними гарантированный зазор. Поэтому мировые координаты предметов считаются
// ОТ точки остановки улитки, а не задаются вручную.
var Game = (function () {
  const $ = id => document.getElementById(id);
  const IDLE_MS = 7000, SOLVE_MS = 24000;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const dist = (a, b, x, y) => Math.hypot(a - x, b - y);

  // Где улитка останавливается у каждой сцены и на сколько дальше стоит предмет.
  const STOP = { knock: 300, debris: 900, rain: 1500, ants: 2100, sun: 2700, branch: 3300, leaf: 4300 };
  const OFF = { debris: 260, ants0: 280, ants1: 700, branch: 480, leaf: 120 };
  const W = 5300;

  let svg, cam, propsG, weatherG, uiG, onHint = () => {};
  let camX = 0, parts = {}, gesture = null, idleT = 0, solveT = 0, step = 0, busy = false;

  function follow(x) {
    camX = clamp(x - STAGE.SNAIL_X, 0, W - STAGE.VIEW);
    cam.setAttribute('transform', `translate(${(-camX).toFixed(1)},0)`);
  }
  const sx = wx => wx - camX;
  function pt(e) {
    const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const v = p.matrixTransform(svg.getScreenCTM().inverse());
    return { x: v.x, y: v.y, wx: v.x + camX };
  }

  // ——— ожидание жеста ———
  function arm(spec) {
    disarm();
    gesture = spec;
    if (spec.kind) Hint.show(spec.kind);
    idleT = setTimeout(ghost, IDLE_MS);
    solveT = setTimeout(() => { disarm(); spec.solve(); }, SOLVE_MS);
  }
  function ghost() { const p = gesture && gesture.hint && gesture.hint(); if (p) Hint.ghostAt(p.x, p.y); }
  function progress() { clearTimeout(idleT); Hint.ghostOff(); if (gesture) idleT = setTimeout(ghost, IDLE_MS); }
  function disarm() { gesture = null; clearTimeout(idleT); clearTimeout(solveT); Hint.hide(); }

  function onDown(e) { Sound.wake(); if (!gesture) return; const p = pt(e); progress(); gesture.down && gesture.down(p); }
  function onMove(e) {
    if (!gesture || !gesture.move) return;
    if (e.buttons === 0 && e.pointerType === 'mouse') return;
    gesture.move(pt(e));
  }
  function onUp(e) { if (gesture && gesture.up) gesture.up(pt(e)); }

  // ——— готовые жесты ———
  function tapTimes(n, each, done, hint, kind) {
    let k = 0;
    arm({
      kind: kind || (n > 1 ? 'tap3' : 'tap'), hint,
      down() { k++; each(k); if (k >= n) { disarm(); done(); } else progress(); },
      solve() { const run = i => { each(i); if (i < n) setTimeout(() => run(i + 1), 600); else done(); }; run(1); }
    });
  }

  function sweepAway(items, done, hint) {
    let left = items.length;
    const fling = it => {
      if (it.gone) return;
      it.gone = true; left--;
      Sound.sweep();
      Props.sparkle(propsG, it.x, it.y, 5);
      const dx = U.rnd(-130, 150).toFixed(0), rot = U.rnd(-200, 200).toFixed(0);
      it.node.animate([
        { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
        { transform: 'translate(0,-26px) rotate(0deg) scale(1.16)', opacity: 1, offset: .16 },
        { transform: `translate(${dx}px,-420px) rotate(${rot}deg) scale(.65)`, opacity: 0 }],
        { duration: 1250, easing: 'cubic-bezier(.16,.72,.36,1)', fill: 'forwards' });
      if (left <= 0) { disarm(); setTimeout(done, 1000); } else progress();
    };
    const hit = p => items.forEach(it => { if (!it.gone && dist(it.x, it.y, p.wx, p.y) < it.r) fling(it); });
    arm({ kind: 'sweep', hint, move: hit, down: hit, solve() { items.forEach((it, i) => setTimeout(() => fling(it), i * 430)); } });
  }

  function holdOver(target, ms, done, hint) {
    let t = 0, sp = 0, last = null;
    const um = parts.umbrella;
    const stop = () => { clearTimeout(t); clearInterval(sp); t = 0; sp = 0; um.setAttribute('opacity', 0); };
    const near = p => dist(target().x, target().y, p.x, p.y) < 300;
    const put = p => { last = p; um.setAttribute('transform', `translate(${p.x} ${p.y})`); };
    arm({
      kind: 'hold', hint,
      down(p) {
        put(p); um.setAttribute('opacity', 1);
        if (!near(p)) return;
        t = setTimeout(() => { stop(); disarm(); done(); }, ms);
        sp = setInterval(() => {
          const a = U.rnd(-2.7, -0.45);
          Props.splash(weatherG, last.x + Math.cos(a) * 128, last.y - 56 + Math.sin(a) * 128);
        }, 230);
      },
      move(p) { put(p); if (!near(p) && t) stop(); },
      up: stop,
      solve() { stop(); done(); }
    });
  }

  function dragPath(pts, done, hint) {
    const line = U.el(propsG, 'path', {
      d: 'M' + pts.map(p => p.join(' ')).join(' L'), fill: 'none', stroke: '#FFFBF0',
      'stroke-width': 16, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: .75
    });
    const dots = pts.map((p, i) => U.el(propsG, 'circle',
      { cx: p[0], cy: p[1], r: 24, fill: '#FFFBF0', stroke: '#E8873A', 'stroke-width': 6, 'data-i': i }));
    let left = pts.length;
    const touch = i => {
      if (dots[i].dataset.on) return;
      dots[i].dataset.on = '1'; left--;
      dots[i].setAttribute('fill', '#7CC03E');
      dots[i].animate([{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }, { transform: 'scale(1)' }],
        { duration: 300, transformOrigin: `${pts[i][0]}px ${pts[i][1]}px` });
      Sound.pop();
      if (left <= 0) {
        disarm();
        [line, ...dots].forEach(d => d.animate([{ opacity: .8 }, { opacity: 0 }], { duration: 400, fill: 'forwards' }));
        done();
      } else progress();
    };
    const hit = p => pts.forEach((q, i) => { if (dist(q[0], q[1], p.wx, p.y) < 105) touch(i); });
    arm({
      kind: 'path', hint, down: hit, move: hit,
      solve() { pts.forEach((_, i) => setTimeout(() => touch(i), i * 220)); }
    });
  }

  // ——— сцены ———
  function say(t) { onHint(t); }
  const shellScreen = () => ({ x: sx(Snail.x) - 30 * STAGE.SNAIL_S, y: STAGE.BASE - 120 * STAGE.SNAIL_S });
  const headScreen = () => ({ x: sx(Snail.x) + 150 * STAGE.SNAIL_S, y: STAGE.BASE - 92 * STAGE.SNAIL_S });

  function sKnock(next) {
    say('Постучись в домик: тук-тук-тук.');
    tapTimes(3, () => { Sound.knock(); Snail.knockShake(); Snail.ring(); Snail.pop('ТУК!'); },
      () => Snail.wakeUp(() => { Sound.cheer(); Props.sparkle(propsG, Snail.x, STAGE.BASE - 200, 10); next(); }), shellScreen);
  }

  function sDebris(next) {
    say('Почисти дорожку — смахни пальцем.');
    sweepAway(parts.debris, () => { Sound.cheer(); next(); },
      () => { const i = parts.debris.find(d => !d.gone); return i ? { x: sx(i.x), y: i.y } : null; });
  }

  function sRain(next) {
    say('Кап-кап-кап. Укрой улитку ладошкой!');
    parts.clouds = Props.clouds(weatherG);
    parts.clouds.animate([{ opacity: 0, transform: 'translateY(-40px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 900, fill: 'forwards' });
    setTimeout(() => {
      parts.rain = Props.rain(weatherG);
      weatherG.appendChild(parts.umbrella);   // зонт должен быть поверх дождя
      Snail.shiver(true);
      const drip = setInterval(() => Sound.drop(Math.random() * 3), 430);
      holdOver(headScreen, 1500, () => {
        Snail.shiver(false);
        Snail.hide(() => { clearInterval(drip); sCount(next); });
      }, headScreen);
    }, 700);
  }

  function sCount(next) {
    say('В домике тепло и сухо. Сосчитай до трёх.');
    const d = parts.rain.drops;
    tapTimes(3, k => {
      Sound.count(k - 1); Snail.pop(['ОДИН', 'ДВА', 'ТРИ'][k - 1], '#2F7D9B');
      d.slice((k - 1) * 8, k * 8).forEach(x => x.animate([{ opacity: .8 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }));
    }, () => {
      [parts.rain.node, parts.clouds].forEach(n => n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, fill: 'forwards' }).onfinish = () => n.remove());
      Sound.cheer();
      Snail.peek(next);
    }, () => ({ x: 500, y: 330 }));
  }

  function sAnts(next) {
    say('Муравьи! Прогони их — проведи пальцем.');
    const x0 = Snail.x + OFF.ants0, x1 = Snail.x + OFF.ants1;
    parts.ants = Props.antSwarm(propsG, x0, x1, 9);
    Snail.hide(() => {
      sweepAway(parts.ants.list, () => { Sound.cheer(); Snail.peek(next); },
        () => { const a = parts.ants.list.find(i => !i.gone); return a ? { x: sx(a.x), y: a.y } : null; });
    });
  }

  function sSun(next) {
    say('Выглянуло солнце. Посчитай лучи: один, два, три.');
    parts.sun = Props.sun(weatherG);
    parts.sun.node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, fill: 'forwards' });
    let lit = 0;
    const light = () => {
      if (lit >= 3) return;
      parts.sun.light(lit);
      const t = parts.sun.tapAt(lit);
      Props.sparkle(weatherG, t.x, t.y, 9);
      Sound.shine(lit); Snail.pop(['ОДИН', 'ДВА', 'ТРИ'][lit], '#C8870F');
      lit++;
    };
    arm({
      kind: 'tap3',
      hint: () => lit < 3 ? parts.sun.tapAt(lit) : null,
      down() { light(); if (lit >= 3) { disarm(); finish(); } else progress(); },
      solve() { const run = () => { light(); if (lit < 3) setTimeout(run, 750); else finish(); }; run(); }
    });
    function finish() {
      Sound.cheer();
      setTimeout(() => Snail.yawn(() => {
        parts.sun.node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, fill: 'forwards' }).onfinish = () => parts.sun.node.remove();
        next();
      }), 400);
    }
  }

  function sBranch(next) {
    say('Ветка! Позови улитку.');
    parts.branch = Props.branch(propsG, Snail.x + OFF.branch);
    Snail.hide(() => {
      arm({
        kind: 'tap', hint: shellScreen,
        down() { disarm(); Snail.pop('УЛИТКА!', '#2F7D3A'); Snail.peek(showPath); },
        solve() { Snail.peek(showPath); }
      });
    });
    function showPath() {
      say('Веди пальцем: вверх-вверх-вверх, вниз-вниз-вниз.');
      dragPath(parts.branch.pts, () => { Sound.cheer(); climb(0); },
        () => { const d = parts.branch.pts.find((_, i) => !propsG.querySelector(`circle[data-i="${i}"]`).dataset.on);
                return d ? { x: sx(d[0]), y: d[1] } : null; });
    }
    function climb(i) {
      const pts = parts.branch.pts;
      if (i >= pts.length) { Snail.jumpTo(pts[pts.length - 1][0], STAGE.BASE); next(); return; }
      Snail.moveTo(pts[i][0], pts[i][1] + 26, 420, () => climb(i + 1));
    }
  }

  // Финал: три укуса, каждый по тапу ребёнка — не ролик, а действие.
  function sLeaf() {
    say('Вот он, листочек! Угости улитку.');
    tapTimes(3, () => {
      const b = parts.leaf.bite();
      Sound.munch(); Snail.chew();
      if (b) Props.crumbs(propsG, b[0], b[1]);
      Snail.pop('АМ!', '#4E8F25');
    }, () => {
      Sound.cheer();
      Props.sparkle(propsG, Snail.x + 120, STAGE.BASE - 180, 14);
      Snail.happy(() => setTimeout(() => {
        Snail.sleep();
        say('Улитка наелась и уснула. Домик всегда с тобой.');
        arm({ kind: 'tap', hint: shellScreen, down() { start(); }, solve() {} });
      }, 700));
    }, () => ({ x: sx(Snail.x + OFF.leaf + 110), y: STAGE.BASE - 40 }));
  }

  const SEQ = [
    n => sKnock(n),
    n => Snail.crawlTo(STOP.debris, () => sDebris(n)),
    n => Snail.crawlTo(STOP.rain, () => sRain(n)),
    n => Snail.crawlTo(STOP.ants, () => sAnts(n)),
    n => Snail.crawlTo(STOP.sun, () => sSun(n)),
    n => Snail.crawlTo(STOP.branch, () => sBranch(n)),
    () => Snail.crawlTo(STOP.leaf, () => sLeaf())
  ];

  function next() {
    if (busy) return;
    busy = true;
    setTimeout(() => { busy = false; const f = SEQ[step++]; f && f(next); }, 320);
  }

  function build() {
    [propsG, weatherG, $('park'), $('bench'), $('flora')].forEach(U.clear);
    U.park($('park'), W);
    U.bench($('bench'), W);
    U.flora($('flora'), W);
    parts = {};
    parts.leaf = Props.leaf(propsG, STOP.leaf + OFF.leaf);
    parts.debris = Props.debris(propsG, STOP.debris + OFF.debris);
    parts.umbrella = Props.umbrella(weatherG);
  }

  function reset() { disarm(); step = 0; busy = false; build(); Snail.reset(); follow(Snail.x); }

  function init(hintFn) {
    onHint = hintFn || onHint;
    svg = $('scene'); cam = $('cam'); propsG = $('props'); weatherG = $('weather'); uiG = $('ui');
    weatherG.setAttribute('pointer-events', 'none');
    uiG.setAttribute('pointer-events', 'none');
    Hint.init(uiG);
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
