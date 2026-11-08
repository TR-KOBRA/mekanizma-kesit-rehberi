#!/usr/bin/env bash
# Bir filmi seçilen palet, şekil ve kompozisyonla videoya çevirir.
#
#   bash video.sh <film> [--palet prusya] [--sekil pafta] [--kompozisyon tam] [--altyazi kontur]
#                        [--ses anlatim.wav] [--muzik muzik.mp3] [--tik 1.68 18.08]
#
#   bash video.sh kesitornek                                   # örnek kavanoz filmi, sessiz
#   bash video.sh kesitornek --palet okyanus --sekil poster    # aynı film, başka kılık
#   bash video.sh buzdolabi --ses ses/anlatim.wav --muzik ses/muzik.mp3
#
# Çıktı: cikti/<film>_<palet>_<sekil>_<kompozisyon>.mp4
# --ses verilmezse video sessiz çıkar. Repoda ses ve müzik yoktur: kendin kaydedersin ya da üretirsin.
set -euo pipefail
cd "$(dirname "$0")"
[ -d motor/src/canvas-core ] || { echo "Önce kurulum: bash kur.sh"; exit 1; }
FILM="${1:?film adı gerekli, örnek: bash video.sh kesitornek}"; shift
PALET=prusya; SEKIL=pafta; KOMP=tam; ALTYAZI=""; SES=""; MUZIK=""; TIK=()
while [ $# -gt 0 ]; do
  case "$1" in
    --palet) PALET="$2"; shift 2 ;;
    --sekil) SEKIL="$2"; shift 2 ;;
    --kompozisyon) KOMP="$2"; shift 2 ;;
    --altyazi) ALTYAZI="$2"; shift 2 ;;
    --ses) SES="$2"; shift 2 ;;
    --muzik) MUZIK="$2"; shift 2 ;;
    --tik) shift; while [ $# -gt 0 ] && [[ "$1" != --* ]]; do TIK+=("$1"); shift; done ;;
    *) echo "bilinmeyen seçenek: $1"; exit 2 ;;
  esac
done
[ -f "motor/src/canvas-core/$FILM.ts" ] || { echo "HATA: film yok: motor/src/canvas-core/$FILM.ts (yeni film için: bash yeni.sh <ad>)"; exit 1; }
PY=""; for c in python3 python py; do if command -v "$c" >/dev/null 2>&1 && "$c" -c "import sys" >/dev/null 2>&1; then PY="$c"; break; fi; done

EK=(); [ -n "$ALTYAZI" ] && EK=(--altyazi "$ALTYAZI")
"$PY" araclar/kur.py motor --palet "$PALET" --sekil "$SEKIL" --kompozisyon "$KOMP" "${EK[@]}"
mkdir -p cikti
AD="${FILM}_${PALET}_${SEKIL}_${KOMP}${ALTYAZI:+_$ALTYAZI}"
SESSIZ="$PWD/cikti/${AD}_sessiz.mp4"
echo "Render: yaklaşık 1 dakika / 26 saniyelik film"
(cd motor && node tools/render.mjs "$FILM" --scale 1 --workers 8 --out "$SESSIZ" > ../cikti/render.log 2>&1) || { echo "HATA: render olmadı, ayrıntı cikti/render.log"; exit 1; }

if [ -n "$SES" ]; then
  [ -n "$MUZIK" ] || { echo "HATA: --ses ile birlikte --muzik de ver"; exit 1; }
  SURE="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SESSIZ")"
  "$PY" araclar/miks.py "$SES" "$MUZIK" "$SURE" "cikti/${AD}_miks.wav" ${TIK[@]+--tik "${TIK[@]}"}
  ffmpeg -y -v error -i "$SESSIZ" -i "cikti/${AD}_miks.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest "cikti/${AD}.mp4"
  rm -f "$SESSIZ" "cikti/${AD}_miks.wav"
  echo "Video: cikti/${AD}.mp4"
else
  mv "$SESSIZ" "cikti/${AD}.mp4"
  echo "Video (sessiz): cikti/${AD}.mp4"
fi
