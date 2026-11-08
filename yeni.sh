#!/usr/bin/env bash
# Örnek filmden yeni bir film dosyası açar.
#
#   bash yeni.sh buzdolabi
#
# motor/src/canvas-core/buzdolabi.ts oluşur. İçinde yalnız nesneyi, sahneleri, CAP ve ANTET'i
# değiştir (kurallar/08-yeni-konu.md). Renk, yazı, çerçeve ve altyazı koduna dokunma: onlar kitte.
set -euo pipefail
cd "$(dirname "$0")"
[ -d motor/src/canvas-core ] || { echo "Önce kurulum: bash kur.sh"; exit 1; }
AD="${1:?film adı gerekli, örnek: bash yeni.sh buzdolabi}"
[[ "$AD" =~ ^[a-z][a-z0-9_]*$ ]] || { echo "HATA: film adı küçük ASCII harfle başlasın, boşluk ve Türkçe harf olmasın: $AD"; exit 2; }
case "$AD" in kesitornek|kesitvitrin|kesitkit|kesittemalar|kesitsecim) echo "HATA: bu ad kitin kendi dosyası: $AD"; exit 2 ;; esac
C=motor/src/canvas-core
[ -e "$C/$AD.ts" ] && { echo "HATA: zaten var: $C/$AD.ts (üzerine yazmıyorum)"; exit 1; }
sed -e "s/export const kesitornek: Film/export const $AD: Film/" -e "s/title: \"kesitornek\"/title: \"$AD\"/" "$C/kesitornek.ts" > "$C/$AD.ts"
printf 'import { %s } from "../canvas-core/%s";\nimport { mountFilm } from "./page";\nmountFilm(%s);\n' "$AD" "$AD" "$AD" > "motor/src/hosts/page-$AD.ts"
echo "Açıldı: $C/$AD.ts"
echo "Şimdi değiştir: jar() yerine kendi nesnen, CAP, ANTET, ciz() içindeki sahneler."
echo "Kare kontrolü:  (cd motor && node tools/still.mjs $AD --frames 30,200,400,600 --scale 0.4 --out out/$AD/ --sheet out/$AD.jpg)"
echo "Video:          bash video.sh $AD"
