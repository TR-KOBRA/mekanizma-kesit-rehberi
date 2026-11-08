# 08 · Yeni konu çizmek

Temalar her konuda hazırdır. Her yeni konuda yalnız nesne, sahne sırası ve altyazı zamanları yazılır.

## Adımlar

```bash
bash kur.sh                                   # bir kez
python araclar/sec.py "buzdolabı ışığı"
bash yeni.sh buzdolabi
python araclar/kelimeler.py ses/anlatim.wav   # CAP tablosu
```

`motor/src/canvas-core/buzdolabi.ts` içinde şunları değiştir:

1. `CAP` tablosunu `kelimeler.py` çıktısıyla değiştir. Yazımı düzelt, vurgulanacak kelimelere `true` ekle.
2. `DURATION` değerini son kelimenin bitişi + 1,7 saniye olarak yaz, 30 ile çarp.
3. `ANTET` yazısını konuya göre yaz.
4. `jar` işlevinin yerine yeni nesneyi çiz.
5. `ciz` içindeki sahne aralıklarını cümlelere göre kur.

Sonra:

```bash
cd motor && node tools/still.mjs buzdolabi --frames 30,200,400,600 --scale 0.4 --out out/buzdolabi/ --sheet out/buzdolabi.jpg
cd .. && bash video.sh buzdolabi --palet zumrut --sekil atlas --kompozisyon buyutec --ses ses/anlatim.wav --muzik ses/muzik.mp3
```

`kesitornek.ts` dosyasını değiştirme. Vitrin onu kullanır.

Animasyon Stüdyosu kullanıyorsan `yeni_proje.sh` ile açtığın film klasörüne kiti `python araclar/kur.py <film klasörü>` ile kurabilirsin. Adımlar aynıdır.

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
