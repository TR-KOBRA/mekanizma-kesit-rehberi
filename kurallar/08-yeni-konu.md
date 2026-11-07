# 08 · Yeni konu çizmek

Temalar her konuda hazırdır. Her yeni konuda yalnız nesne, sahne sırası ve altyazı zamanları yazılır.

## Adımlar

```bash
bash ~/.claude/skills/animasyon-studyosu/scripts/yeni_proje.sh buzdolabi --tarz blueprint
python araclar/sec.py "buzdolabı ışığı" --kaydet
python araclar/kur.py /c/Users/Lenovo/buzdolabi_anim/film --palet zumrut --sekil atlas --kompozisyon buyutec
cd /c/Users/Lenovo/buzdolabi_anim/film
cp src/canvas-core/kesitornek.ts src/canvas-core/buzdolabi.ts
```

`buzdolabi.ts` içinde şunları değiştir:

1. Sondaki `export const kesitornek` adını `buzdolabi` yap, `meta.title` alanını da değiştir.
2. `CAP` tablosunu kayıttan çıkan kelime zamanlarıyla yaz.
3. `ANTET` yazısını konuya göre yaz.
4. `jar` işlevinin yerine yeni nesneyi çiz.
5. `ciz` içindeki sahneleri cümlelere göre kur.

`kesitornek.ts` dosyasını silme. Vitrin onu kullanır.

## Nesne çizerken

| Yapılacak | Nasıl |
|---|---|
| Dış çizgi | `kalem(c, T, t, yol, p.murekkep, kalınlık)` |
| İçindeki madde | `doldur(c, T, yol, x0, x1, y0, y1)` |
| Hareket eden parça | `p.vurgu` |
| Yapısal parça | `p.metal`, `p.conta` |
| Küçük detay | Yalnız `kademeli` ve `duz` dolguda çiz |

- Nesnenin yolunu ayrı işlev yap, çünkü hem kırpma hem çizgi için gerekir.
- Nesneyi `x`, `top`, `s` değerleriyle çiz. Büyüteç ve ikiz bu sayede çalışır.
- Renk yazma. `#ff0000` gibi bir değer görürsen palete taşı.

## Kitte hazır olanlar

| İşlev | Görev |
|---|---|
| `zemin` | Kâğıt. Son bölümde `uyari = true` verilir |
| `cerceve` | Çerçeve, antet, adım çubuğu |
| `baslik` | Etiket ve iki parçalı başlık |
| `altyazi` | Kelime kelime altyazı |
| `not` | Kendini çizen açıklama çizgisi |
| `gosterge` | İbreli gösterge |
| `ok` | Kuvvet ve akış oku |
| `duman` | Buhar |
| `patlama` | Büyük ses kelimesi ve halkalar |
| `buyutec` | Mercek |
| `kalkan`, `yasak` | Onay ve yasak işareti |
| `buyut` | Kamera yaklaşması |

Çizim sırası: `zemin`, nesne, `baslik`, `cerceve`, `altyazi`.

## Bitince

Yeni nesne en az iki farklı şekilde denenir: biri koyu, biri açık. Tarama dolgulu `patent` ile düz dolgulu `poster`, nesnenin en çok zorlandığı iki şekildir.
