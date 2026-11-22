// Snail — улитка как актёр: позиция в мире, голова наружу или в домике, ползание.
// Никакой логики сцен здесь нет, ею занимается Game.
var Snail = (function () {
  const $ = id => document.getElementById(id);
  // У SVG-элементов нет свойства hidden (оно живёт на HTMLElement), поэтому только атрибутом.
  const vis = (n, on) => on ? n.removeAttribute('hidden') : n.setAttribute('hidden', '');
  const Y = 470, HO = 'translate(110px,-70px)', HI = 'translate(-110px,70px)';

  let wrap, body, head, shell, horns, hornPaths, bulbs, asleep, awake, zzzG, fx;
  let X = 330, out = false, onMove = () => {};
  const slow = !matchMedia('(prefers-reduced-motion: no-preference)').matches;

  function init(moveCb) {
    onMove = moveCb || onMove;
    wrap = $('snailWrap'); body = $('bodyG'); head = $('head'); shell = $('shell');
    horns = $('horns'); asleep = $('asleep'); awake = $('awake'); zzzG = $('zzz'); fx = $('fx');
    hornPaths = [...document.querySelectorAll('.horn')];
    bulbs = [...document.querySelectorAll('.bulb')];
    hornPaths.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    bulbs.forEach(b => { b.style.opacity = 0; });
    shell.style.cursor = 'pointer';
    place(X, Y);
  }

  let curY = Y;
  function place(x, y) {
    curY = (y === undefined ? Y : y);
    wrap.setAttribute('transform', `translate(${x.toFixed(1)},${curY.toFixed(1)})`);
    onMove(x);
  }

  function knockShake() {
    shell.animate([
      { transform: 'translate(-30px,-120px) rotate(0deg)' },
      { transform: 'translate(-30px,-123px) rotate(-3deg)' },
      { transform: 'translate(-30px,-120px) rotate(2deg)' },
      { transform: 'translate(-30px,-120px) rotate(0deg)' }
    ], { duration: 380, easing: 'ease-out' });
  }

  function ring() {
    const r = U.el(fx, 'circle', { cx: -30, cy: -120, r: 60, fill: 'none', stroke: '#B0491A', 'stroke-width': 5, opacity: .8 });
    r.animate([{ r: 60, opacity: .8 }, { r: 170, opacity: 0 }], { duration: 620, easing: 'ease-out' }).onfinish = () => r.remove();
  }

  function pop(text, color) {
    const t = U.el(fx, 'text', { x: -30, y: -270, 'font-family': 'system-ui,sans-serif', 'font-size': 46,
      'font-weight': 700, fill: color || '#B0491A', 'text-anchor': 'middle' });
    t.textContent = text;
    t.animate([{ transform: 'translateY(16px) scale(.5)', opacity: 0 },
               { transform: 'translateY(0) scale(1)', opacity: 1, offset: .3 },
               { transform: 'translateY(-30px) scale(1)', opacity: 0 }],
      { duration: 1000, easing: 'ease-out' }).onfinish = () => t.remove();
  }

  function wakeUp(cb) {
    out = true;
    vis(asleep, false); vis(awake, true); zzzG.setAttribute('opacity', 0);
    hornPaths.forEach((p, i) => p.animate([{ strokeDashoffset: p.getTotalLength() }, { strokeDashoffset: 0 }],
      { duration: 700, delay: i * 130, easing: 'cubic-bezier(.2,1.4,.5,1)', fill: 'forwards' }));
    bulbs.forEach((b, i) => b.animate([{ opacity: 0, transform: 'scale(.2)' }, { opacity: 1, transform: 'scale(1)' }],
      { duration: 420, delay: 620 + i * 130, easing: 'cubic-bezier(.2,1.6,.5,1)', fill: 'forwards' }));
    setTimeout(() => cb && cb(), 900);
  }

  // Спрятаться в домик — не бегство, а способ переждать страшное. Так в книжке.
  function hide(cb) {
    if (!out) { cb && cb(); return; }
    out = false;
    head.animate([{ transform: `${HO} scale(1) ${HI}`, opacity: 1 },
                  { transform: `${HO} scale(.12) ${HI}`, opacity: 0 }],
      { duration: 420, easing: 'ease-in', fill: 'forwards' }).onfinish = () => cb && cb();
  }

  function peek(cb) {
    if (out) { cb && cb(); return; }
    out = true;
    head.animate([{ transform: `${HO} scale(.12) ${HI}`, opacity: 0 },
                  { transform: `${HO} scale(1) ${HI}`, opacity: 1 }],
      { duration: 520, easing: 'cubic-bezier(.2,1.4,.5,1)', fill: 'forwards' }).onfinish = () => cb && cb();
  }

  function crawlTo(tx, cb) {
    const x0 = X, dist = Math.abs(tx - x0), dur = slow ? 400 : Math.max(700, dist * 7);
    const t0 = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - t0) / dur);
      X = x0 + (tx - x0) * p;
      place(X, Y + (p < 1 ? Math.sin(p * Math.PI * 2 * 7) * 3 : 0));
      body.style.transform = p < 1 ? `scaleX(${(1 + Math.sin(p * Math.PI * 2 * 7) * 0.025).toFixed(3)})` : '';
      if (p < 1) requestAnimationFrame(step); else { X = tx; place(X, Y); cb && cb(); }
    })(performance.now());
  }

  function jumpTo(x, y) { X = x; place(X, y); }

  // Переезд в произвольную точку (ветка): через rAF, а не WAAPI,
  // чтобы камера шла ровно за улиткой и X не расходился с картинкой.
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
    if (!on) { body.getAnimations().forEach(a => a.cancel()); return; }
    body.animate([{ transform: 'translateX(-2px)' }, { transform: 'translateX(2px)' }],
      { duration: 90, direction: 'alternate', iterations: Infinity });
  }

  function yawn(cb) {
    const m = document.getElementById('mouth');
    m.animate([{ d: 'path("M152,-62 q10,11 22,1")' }, { d: 'path("M150,-66 q12,26 26,2")' }, { d: 'path("M152,-62 q10,11 22,1")' }],
      { duration: 1200, easing: 'ease-in-out' });
    Sound.yawn();
    setTimeout(() => cb && cb(), 1200);
  }

  function sleep() {
    out = false;
    vis(awake, false); vis(asleep, true); zzzG.setAttribute('opacity', 1);
    head.getAnimations().forEach(a => a.cancel());
    head.style.transform = ''; head.style.opacity = '';
    hornPaths.forEach(p => p.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: p.getTotalLength() }],
      { duration: 500, easing: 'ease-in', fill: 'forwards' }));
    bulbs.forEach(b => b.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }));
  }

  function reset() {
    X = 330; out = false;
    wrap.getAnimations().forEach(a => a.cancel());
    head.getAnimations().forEach(a => a.cancel());
    head.style.transform = ''; head.style.opacity = '';
    body.style.transform = ''; shiver(false);
    vis(asleep, true); vis(awake, false); zzzG.setAttribute('opacity', 1);
    hornPaths.forEach(p => { p.getAnimations().forEach(a => a.cancel()); p.style.strokeDashoffset = p.getTotalLength(); });
    bulbs.forEach(b => { b.getAnimations().forEach(a => a.cancel()); b.style.opacity = 0; });
    U.clear(fx);
    place(X, Y);
  }

  return {
    init, reset, place, jumpTo, moveTo, knockShake, ring, pop, wakeUp, hide, peek, crawlTo, shiver, yawn, sleep,
    get x() { return X; }, get out() { return out; }, get node() { return wrap; }
  };
})();
