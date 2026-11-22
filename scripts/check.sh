#!/bin/sh
# Весь гейт проекта: синтаксис JS и наличие обязательных файлов.
set -e
cd "$(dirname "$0")/.."
fail=0
for f in src/*.js; do
  node --check "$f" || fail=1
done
for f in index.html .nojekyll; do
  [ -e "$f" ] || { echo "нет $f"; fail=1; }
done
grep -q 'type="module"' index.html && { echo "ES-модули не грузятся с file:// — используй обычные <script>"; fail=1; } || true
[ "$fail" = 0 ] && echo "ok"
exit $fail
