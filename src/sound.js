// Sound — весь звук синтезируется в WebAudio, звуковых файлов в репозитории нет.
// Ноты из пентатоники: случайные нажатия всё равно звучат приятно.
var Sound = (function () {
  const PENTA = [392, 440, 523.25, 587.33, 659.25, 783.99, 880];
  let ctx = null, muted = false;

  function wake() {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (C) ctx = new C(); }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function env(node, vol, dur, t0) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    node.connect(g); g.connect(ctx.destination);
    return g;
  }

  function tone(freq, dur, type, vol, delay, slideTo) {
    if (!wake() || muted) return;
    const t0 = ctx.currentTime + (delay || 0), o = ctx.createOscillator();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    env(o, vol || 0.18, dur, t0);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  function noise(dur, vol, cut, delay, sweepTo) {
    if (!wake() || muted) return;
    const t0 = ctx.currentTime + (delay || 0), n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.setValueAtTime(cut, t0);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur);
    src.connect(f); env(f, vol, dur, t0);
    src.start(t0); src.stop(t0 + dur + 0.05);
  }

  return {
    wake, mute: v => { muted = v; },
    knock() { tone(150, 0.14, 'sine', 0.3, 0, 90); noise(0.09, 0.14, 1600); },
    sweep() { noise(0.32, 0.12, 700, 0, 4200); },
    blow() { noise(0.7, 0.16, 400, 0, 2600); },
    drop(i) { tone(820 + (i % 3) * 110, 0.1, 'sine', 0.12, 0, 380); },
    count(i) { tone(PENTA[Math.min(i, 2) + 2], 0.3, 'triangle', 0.2, 0); },
    shine(i) { tone(PENTA[i + 3], 0.5, 'sine', 0.16, 0); tone(PENTA[i + 3] * 2, 0.4, 'sine', 0.06, 0.02); },
    cheer() { [0, 2, 4, 6].forEach((n, i) => tone(PENTA[n], 0.45, 'triangle', 0.15, i * 0.09)); },
    munch() { noise(0.13, 0.2, 900, 0); noise(0.13, 0.2, 760, 0.22); noise(0.15, 0.18, 640, 0.46); },
    yawn() { tone(300, 0.75, 'sine', 0.13, 0, 170); },
    pop() { tone(620, 0.12, 'sine', 0.14, 0, 1100); }
  };
})();
