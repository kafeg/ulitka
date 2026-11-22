// Snail — улитка как актёр. Прятанье в домик втягивает ВСЁ тело под ракушку,
// а не одну голову: иначе улитка выглядит обезглавленной, а не спрятавшейся.
var Snail = (function () {
  const $ = id => document.getElementById(id);
  // У SVG-элементов нет свойства hidden (оно на HTMLElement) — только атрибутом.
  const vis = (n, on) => on ? n.removeAttribute('hidden') : n.setAttribute('hidden', '');
  const SHELL_O = 'translate(-30px,-120px)', SHELL_I = 'translate(30px,120px)';

  let wrap, body, shell, horns, hornPaths, bulbs, asleep, awake, zzzG, fx, mouth;
  let X = 0, curY = 0, out = false, inside = false, onMove = () => {};
  const slow = !matchMedia('(prefers-reduced-motion: no-preference)').matches;

  function init(moveCb) {
    onMove = moveCb || onMove;
    wrap = $('snailWrap'); body = $('bodyG'); shell = $('shell'); horns = $('horns');
    asleep = $('asleep'); awake = $('awake'); zzzG = $('zzz'); fx = $('fx'); mouth = $('mouth');
    hornPaths = [...document.querySelectorAll('.horn')];
    bulbs = [...document.querySelectorAll('.bulb')];
    hornPaths.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    bulbs.forEach(b => { b.style.opacity = 0; });
    shell.style.cursor = 'pointer';
    X = STAGE.SNAIL_X; curY = STAGE.BASE;
    place(X, curY);
  }

  function place(x, y) {
    curY = (y === undefined ? STAGE.BASE : y);
    wrap.setAttribute('transform', `translate(${x.toFixed(1)},${curY.toFixed(1)})`);
    onMove(x);
  }
  function jumpTo(x, y) { X = x; place(X, y); }

  // Покачивание «z z z» анимирует ТОЛЬКО transform: анимация opacity перебивала бы
  // атрибут, и надпись горела бы даже у проснувшейся улитки.
  function zzzBreathe() {
    zzzG.getAnimations().forEach(a => a.cancel());
    zzzG.animate([{ transform: 'translate(-30px,-290px)' }, { transform: 'translate(-30px,-308px)' }],
      { duration: 1800, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
  }

  function knockShake() {
    shell.animate([
      { transform: 'translate(-30px,-120px) rotate(0deg)' },
      { transform: 'translate(-30px,-124px) rotate(-4deg)' },
      { transform: 'translate(-30px,-120px) rotate(3deg)' },
      { transform: 'translate(-30px,-120px) rotate(0deg)' }
    ], { duration: 400, easing: 'ease-out' });
  }

  function ring() {
    const r = U.el(fx, 'circle', { cx: -30, cy: -120, r: 70, fill: 'none', stroke: '#B0491A', 'stroke-width': 6, opacity: .8 });
    r.animate([{ r: 70, opacity: .8 }, { r: 190, opacity: 0 }], { duration: 650, easing: 'ease-out' }).onfinish = () => r.remove();
  }

  function pop(text, color) {
    const t = U.el(fx, 'text', { x: -30, y: -300, 'font-family': 'system-ui,sans-serif', 'font-size': 54,
      'font-weight': 700, fill: color || '#B0491A', 'text-anchor': 'middle', stroke: '#FFFBF0', 'stroke-width': 7, 'paint-order': 'stroke' });
    t.textContent = text;
    t.animate([{ transform: 'translateY(18px) scale(.5)', opacity: 0 },
               { transform: 'translateY(0) scale(1)', opacity: 1, offset: .3 },
               { transform: 'translateY(-34px) scale(1)', opacity: 0 }],
      { duration: 1100, easing: 'ease-out' }).onfinish = () => t.remove();
  }

  function wakeUp(cb) {
    out = true; inside = false;
    vis(asleep, false); vis(awake, true); zzzG.setAttribute('opacity', 0);
    hornPaths.forEach((p, i) => p.animate([{ strokeDashoffset: p.getTotalLength() }, { strokeDashoffset: 0 }],
      { duration: 700, delay: i * 130, easing: 'cubic-bezier(.2,1.4,.5,1)', fill: 'forwards' }));
    bulbs.forEach((b, i) => b.animate([{ opacity: 0, transform: 'scale(.2)' }, { opacity: 1, transform: 'scale(1)' }],
      { duration: 420, delay: 620 + i * 130, easing: 'cubic-bezier(.2,1.6,.5,1)', fill: 'forwards' }));
    setTimeout(() => cb && cb(), 900);
  }

  // Прятаться в домик — не бегство, а способ переждать страшное. Так в книжке.
  function hide(cb) {
    if (inside) { cb && cb(); return; }
    inside = true;
    body.animate([{ transform: `${SHELL_O} scale(1) ${SHELL_I}` }, { transform: `${SHELL_O} scale(.42) ${SHELL_I}` }],
      { duration: 460, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' }).onfinish = () => cb && cb();
  }

  function peek(cb) {
    if (!inside) { cb && cb(); return; }
    inside = false;
    body.animate([{ transform: `${SHELL_O} scale(.42) ${SHELL_I}` }, { transform: `${SHELL_O} scale(1) ${SHELL_I}` }],
      { duration: 560, easing: 'cubic-bezier(.2,1.3,.5,1)', fill: 'forwards' }).onfinish = () => cb && cb();
  }

  function crawlTo(tx, cb) {
    const x0 = X, dist = Math.abs(tx - x0), dur = slow ? 400 : Math.max(700, dist * 5);
    const t0 = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - t0) / dur);
      X = x0 + (tx - x0) * p;
      place(X, STAGE.BASE + (p < 1 ? Math.sin(p * Math.PI * 2 * 9) * 3 : 0));
      if (p < 1) requestAnimationFrame(step); else { X = tx; place(X, STAGE.BASE); cb && cb(); }
    })(performance.now());
  }

  function moveTo(tx, ty, dur, cb) {
    const x0 = X, y0 = curY, t0 = performance.now();
    (function st(now) {
      const p = Math.min(1, (now - t0) / (slow ? 120 : dur));
      const e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      X = x0 + (tx - x0) * e;
      place(X, y0 + (ty - y0) * e);
      if (p < 1) requestAnimationFrame(st); else { X = tx; place(X, ty); cb && cb(); }
    })(performance.now());
  }

  function shiver(on) {
    if (!on) { wrap.getAnimations().forEach(a => a.cancel()); return; }
    wrap.animate([{ transform: `translate(${X - 2},${curY})` }, { transform: `translate(${X + 2},${curY})` }],
      { duration: 95, direction: 'alternate', iterations: Infinity });
  }

  const setMouth = d => mouth.setAttribute('d', d);
  const MOUTH_OK = 'M152,-62 q10,11 22,1', MOUTH_BIG = 'M148,-66 q14,30 30,2', MOUTH_WIDE = 'M144,-60 q18,20 38,-4';

  function chew(cb) {
    let k = 0;
    (function bite() {
      setMouth(k % 2 ? MOUTH_OK : MOUTH_BIG);
      if (++k < 6) setTimeout(bite, 130); else { setMouth(MOUTH_WIDE); setTimeout(() => { setMouth(MOUTH_OK); cb && cb(); }, 260); }
    })();
  }

  function yawn(cb) {
    setMouth(MOUTH_BIG); Sound.yawn();
    setTimeout(() => { setMouth(MOUTH_OK); cb && cb(); }, 900);
  }

  function happy(cb) { setMouth(MOUTH_WIDE); setTimeout(() => { setMouth(MOUTH_OK); cb && cb(); }, 1100); }

  function sleep() {
    out = false; inside = false;
    body.getAnimations().forEach(a => a.cancel());
    body.style.transform = '';
    vis(awake, false); vis(asleep, true); zzzG.setAttribute('opacity', 1);
    zzzBreathe();
    hornPaths.forEach(p => p.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: p.getTotalLength() }],
      { duration: 500, easing: 'ease-in', fill: 'forwards' }));
    bulbs.forEach(b => b.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }));
  }

  function reset() {
    X = STAGE.SNAIL_X; out = false; inside = false;
    [wrap, body, zzzG].forEach(n => n.getAnimations().forEach(a => a.cancel()));
    body.style.transform = '';
    vis(asleep, true); vis(awake, false);
    zzzG.setAttribute('opacity', 1);
    zzzG.setAttribute('transform', 'translate(-30,-290)');
    zzzBreathe();
    setMouth(MOUTH_OK);
    hornPaths.forEach(p => { p.getAnimations().forEach(a => a.cancel()); p.style.strokeDashoffset = p.getTotalLength(); });
    bulbs.forEach(b => { b.getAnimations().forEach(a => a.cancel()); b.style.opacity = 0; });
    U.clear(fx);
    place(X, STAGE.BASE);
  }

  return {
    init, reset, place, jumpTo, moveTo, crawlTo, knockShake, ring, pop,
    wakeUp, hide, peek, shiver, chew, yawn, happy, sleep,
    get x() { return X; }, get out() { return out; }, get fx() { return fx; }
  };
})();
