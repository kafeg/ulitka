// Snail — состояние улитки: спит -> стук -> проснулась -> три отрезка пути -> листочек.
// Проиграть нельзя: любое действие либо продвигает, либо ничего не делает.
var Snail = (function () {
  const $ = id => document.getElementById(id);
  const KNOCKS_TO_WAKE = 3, STEPS = 3, STEP_PX = 100, START_X = 330, START_Y = 480;

  let wrap, fx, horns, hornPaths, bulbs, asleep, awake, shell, leaf, zzz;
  let knocks = 0, isAwake = false, step = 0, moving = false, onHint = () => {};
  const motionOK = matchMedia('(prefers-reduced-motion: no-preference)').matches;

  const LEAF_WHOLE = 'M812,528 C836,470 908,448 958,470 C952,538 886,578 834,560 C818,554 808,542 812,528 Z';
  const LEAF_BITTEN = 'M812,528 C836,470 908,448 958,470 C954,500 938,524 916,540 C912,516 896,506 878,512 C862,518 856,538 862,556 C852,562 842,563 834,560 C818,554 808,542 812,528 Z';
  const NEAR = ['Листочек ещё так далеко…', 'Листочек стал ближе.', 'Листочек уже совсем близко!'];

  function init(hintFn) {
    onHint = hintFn || onHint;
    wrap = $('snailWrap'); fx = $('fx'); horns = $('horns'); shell = $('shell');
    asleep = $('asleep'); awake = $('awake'); leaf = $('leafShape'); zzz = $('zzz');
    hornPaths = [...document.querySelectorAll('.horn')];
    bulbs = [...document.querySelectorAll('.bulb')];
    hornPaths.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    bulbs.forEach(b => { b.style.opacity = 0; });
    shell.style.cursor = 'pointer';
    shell.addEventListener('pointerdown', knock);
    reset();
  }

  function bump() {
    shell.animate([
      { transform: 'translate(-30px,-120px) rotate(0deg)' },
      { transform: 'translate(-30px,-123px) rotate(-3deg)' },
      { transform: 'translate(-30px,-120px) rotate(2deg)' },
      { transform: 'translate(-30px,-120px) rotate(0deg)' }
    ], { duration: 380, easing: 'ease-out' });
  }

  function knock() {
    bump();
    if (isAwake) return;
    knocks++;
    const ring = U.el(fx, 'circle', { cx: -30, cy: -120, r: 60, fill: 'none', stroke: '#B0491A', 'stroke-width': 5, opacity: .8 });
    ring.animate([{ r: 60, opacity: .8 }, { r: 170, opacity: 0 }], { duration: 620, easing: 'ease-out' }).onfinish = () => ring.remove();
    const t = U.el(fx, 'text', { x: -36 + knocks * 14, y: -262, 'font-family': 'system-ui,sans-serif',
      'font-size': 40, 'font-weight': 700, fill: '#B0491A', 'text-anchor': 'middle' });
    t.textContent = 'ТУК!';
    t.animate([
      { transform: 'translateY(14px) scale(.6)', opacity: 0 },
      { transform: 'translateY(0) scale(1)', opacity: 1, offset: .3 },
      { transform: 'translateY(-26px) scale(1)', opacity: 0 }
    ], { duration: 900, easing: 'ease-out' }).onfinish = () => t.remove();
    onHint(knocks < KNOCKS_TO_WAKE ? 'Ещё ' + (KNOCKS_TO_WAKE - knocks) + '…' : '');
    if (knocks >= KNOCKS_TO_WAKE) wake();
  }

  function wake() {
    isAwake = true;
    asleep.hidden = true; awake.hidden = false;
    hornPaths.forEach((p, i) => p.animate([{ strokeDashoffset: p.getTotalLength() }, { strokeDashoffset: 0 }],
      { duration: 700, delay: i * 130, easing: 'cubic-bezier(.2,1.4,.5,1)', fill: 'forwards' }));
    bulbs.forEach((b, i) => b.animate([{ opacity: 0, transform: 'scale(.2)' }, { opacity: 1, transform: 'scale(1)' }],
      { duration: 420, delay: 620 + i * 130, easing: 'cubic-bezier(.2,1.6,.5,1)', fill: 'forwards' }));
    onHint('Проснулась и хочет кушать.');
  }

  function crawl() {
    if (!isAwake || moving || step >= STEPS) return;
    moving = true; step++;
    const from = START_X + (step - 1) * STEP_PX, to = START_X + step * STEP_PX, k = [];
    for (let i = 0; i <= 8; i++)
      k.push({ transform: `translate(${(from + (to - from) * i / 8).toFixed(1)}px, ${i % 2 ? -4 : 0}px)` });
    wrap.animate(k, { duration: motionOK ? 1700 : 300, easing: 'linear', fill: 'forwards' }).onfinish = () => {
      moving = false;
      if (step < STEPS) onHint(NEAR[step - 1]); else eat();
    };
  }

  function eat() {
    leaf.setAttribute('d', LEAF_BITTEN);
    awake.hidden = true; asleep.hidden = false;
    zzz.setAttribute('opacity', '1');
    hornPaths.forEach(p => p.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: p.getTotalLength() }],
      { duration: 500, easing: 'ease-in', fill: 'forwards' }));
    bulbs.forEach(b => b.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }));
    onHint('Улитка наелась и уснула. Домик всегда с тобой.');
  }

  function reset() {
    knocks = 0; isAwake = false; step = 0; moving = false;
    wrap.getAnimations().forEach(a => a.cancel());
    wrap.setAttribute('transform', `translate(${START_X},${START_Y})`);
    asleep.hidden = false; awake.hidden = true;
    zzz.setAttribute('opacity', '1');
    hornPaths.forEach(p => { p.getAnimations().forEach(a => a.cancel()); p.style.strokeDashoffset = p.getTotalLength(); });
    bulbs.forEach(b => { b.getAnimations().forEach(a => a.cancel()); b.style.opacity = 0; });
    leaf.setAttribute('d', LEAF_WHOLE);
    onHint('Постучись в домик.');
  }

  return { init, knock, crawl, reset };
})();
