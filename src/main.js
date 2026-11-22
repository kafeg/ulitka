// Сборка сцены и панель разработчика (?dev=1). Для ребёнка на экране только картинка.
(function () {
  const $ = id => document.getElementById(id);
  U.wood($('wood'));
  U.shell($('shellDetail'));
  U.speckles($('speckles'));
  U.trail($('trail'));
  U.flora($('flora'));
  U.ants($('ants'));

  const dev = new URLSearchParams(location.search).has('dev');
  const hint = $('hint');
  Snail.init(msg => { if (dev) hint.textContent = msg; });

  if (!dev) return;
  document.body.classList.add('dev');
  $('knock').onclick = Snail.knock;
  $('crawl').onclick = Snail.crawl;
  $('reset').onclick = Snail.reset;
  const toggle = (btn, apply) => {
    let on = true;
    btn.onclick = () => { on = !on; btn.classList.toggle('off', !on); apply(on); };
  };
  toggle($('tGrain'), on => { $('grainLayer').style.display = on ? '' : 'none'; });
  toggle($('tPencil'), on => { $('art').setAttribute('filter', on ? 'url(#pencil)' : 'none'); });
})();
