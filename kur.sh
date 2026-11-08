#!/usr/bin/env bash
# Mekanizma Kesit Rehberi kurulumu. Tek komut:
#
#   bash kur.sh
#
# Ne yapar:
#   1. Gerekenleri kontrol eder: git, node, npm, ffmpeg, python
#   2. anidoodle çizim motorunu test edilmiş sürümüyle motor/ klasörüne indirir
#   3. Motorun paketlerini ve kare çeken tarayıcıyı kurar
#   4. Kiti ve temaları motora kurar, örnek filmden bir deneme karesi çeker
#
# Elinde kurulu bir anidoodle motoru varsa indirmek yerine onu kopyalar:
#   MOTOR=/yol/anidoodle/engine bash kur.sh
set -euo pipefail
cd "$(dirname "$0")"
KOK="$PWD"
ANIDOODLE_URL="https://github.com/alexgreensh/anidoodle.git"
ANIDOODLE_SURUM="f746cbd"   # bu kitin denendiği sürüm (0.9.6); değiştirirsen örnek filmi yeniden kontrol et

eksik=""
for c in git node npm ffmpeg ffprobe; do command -v "$c" >/dev/null 2>&1 || eksik="$eksik $c"; done
PY=""
for c in python3 python py; do if command -v "$c" >/dev/null 2>&1 && "$c" -c "import sys; sys.exit(sys.version_info < (3, 9))" >/dev/null 2>&1; then PY="$c"; break; fi; done
[ -n "$PY" ] || eksik="$eksik python(3.9+)"
if [ -n "$eksik" ]; then echo "Önce bunları kur:$eksik"; exit 1; fi

echo "1/3 Çizim motoru"
if [ -d motor/src/canvas-core ]; then
  echo "  motor/ zaten var, geçildi (yeniden kurmak için motor/ klasörünü sil)"
elif [ -n "${MOTOR:-}" ]; then
  [ -d "$MOTOR/src/canvas-core" ] || { echo "HATA: MOTOR bir anidoodle engine klasörü değil: $MOTOR"; exit 1; }
  cp -r "$MOTOR" motor
  rm -rf motor/out motor/dist; echo "  kopyalandı: $MOTOR"
else
  T="$(mktemp -d)"
  git clone -q "$ANIDOODLE_URL" "$T/anidoodle"
  git -C "$T/anidoodle" checkout -q "$ANIDOODLE_SURUM"
  cp -r "$T/anidoodle/skills/anidoodle/engine" motor
  cp "$T/anidoodle/LICENSE" motor/LICENSE.anidoodle 2>/dev/null || true
  rm -rf "$T"; echo "  indirildi: anidoodle $ANIDOODLE_SURUM"
fi
mkdir -p motor/out cikti

echo "2/3 Paketler ve tarayıcı"
if [ ! -d motor/node_modules ]; then (cd motor && npm install --omit=optional --no-audit --no-fund --silent); fi
(cd motor && npx --no-install playwright-core install chromium >/dev/null)
echo "  hazır"

echo "3/3 Kit ve deneme karesi"
"$PY" araclar/kur.py motor --palet prusya --sekil pafta --kompozisyon tam
(cd motor && node tools/still.mjs kesitornek --frames 520 --scale 0.5 --out ../cikti/kurulum_testi.png >/dev/null)
echo
echo "Kurulum bitti. Deneme karesi: cikti/kurulum_testi.png"
echo "Bu kare onizleme/ornek_kare.png ile aynı görünmeli."
echo "Örnek videonun tamamı:  bash video.sh kesitornek"
