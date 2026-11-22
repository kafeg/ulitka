// Загрузка: для ребёнка на экране только картинка, панель взрослого — за ?dev=1.
(function () {
  const $ = id => document.getElementById(id);
  const dev = new URLSearchParams(location.search).has('dev');
  const hint = $('hint');

  Game.init(msg => { if (dev) hint.textContent = msg; });
  Game.start();

  if (!dev) return;
  document.body.classList.add('dev');
  $('skip').onclick = Game.skip;
  $('reset').onclick = Game.start;
  const toggle = (btn, apply) => {
    let on = true;
    btn.onclick = () => { on = !on; btn.classList.toggle('off', !on); apply(on); };
  };
  toggle($('tGrain'), on => { $('grainLayer').style.display = on ? '' : 'none'; });
  toggle($('tPencil'), on => { $('snailWrap').setAttribute('filter', on ? 'url(#pencil)' : 'none'); });
})();
