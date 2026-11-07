# Mekanizma Kesit Rehberi

Günlük eşyaların içindeki mekanizmayı kısa dikey videoyla anlatmak için kural dizini ve çalışan kod.

Bir konuyu bir kez çizersin; aynı film 10 palet, 6 sunum şekli ve 3 kompozisyonla, yani **132 uyumlu kombinasyonla** çıkar. Her videonun görünüşü değişir, tarzı değişmez.

![Aynı sahne, on palet](onizleme/paletler.jpg)

![Aynı konu, altı sunum şekli](onizleme/sekiller.jpg)

## Kural dizini

| Dosya | Ne anlatır |
|---|---|
| [01 Değişmezler](kurallar/01-degismezler.md) | Hangi kombinasyon seçilirse seçilsin bozulmayan kurallar |
| [02 Renk](kurallar/02-renk.md) | Renk rolleri, on palet, yeni palet ekleme |
| [03 Sunum şekilleri](kurallar/03-sunum-sekilleri.md) | Altı şekil, hangisi ne zaman, yeni şekil ekleme |
| [04 Kompozisyon](kurallar/04-kompozisyon.md) | Tam, büyüteç, ikiz ve altyazı seçenekleri |
| [05 Seçim ve tekrar](kurallar/05-secim-ve-tekrar.md) | Son videolara benzemeyen kombinasyon nasıl seçilir |
| [06 Konu ve metin](kurallar/06-konu-ve-metin.md) | Konu ölçütü, kanca, metin iskeleti, doğruluk |
| [07 Hareket ve ses](kurallar/07-hareket-ve-ses.md) | Kamera, zamanlama, müzik, ses seviyesi |
| [08 Yeni konu çizmek](kurallar/08-yeni-konu.md) | Kavanoz yerine başka bir nesne koymak |
| [09 Kontrol listesi](kurallar/09-kontrol-listesi.md) | Teslimden önce bakılacaklar |

## Hızlı başlangıç

Kodlar [anidoodle](https://github.com/alexgreensh/anidoodle) motoruyla açılmış bir film klasörüne kurulur. Klasörü `yeni_proje.sh` açar.

```bash
python araclar/sec.py "buzdolabı ışığı" --kaydet
python araclar/kur.py <film_klasoru> --palet zumrut --sekil atlas --kompozisyon buyutec
cd <film_klasoru>
node tools/still.mjs kesitornek --frames 60,300,540 --scale 0.5 --out out/deneme/
node tools/render.mjs kesitornek --scale 1 --workers 8 --out out/sessiz.mp4
```

Bütün kombinasyonları görmek için: [matris](onizleme/matris.jpg), [dönüm anları](onizleme/sahneler.jpg), [kompozisyonlar](onizleme/kompozisyon_matris.jpg).

## Klasörler

| Klasör | İçinde |
|---|---|
| `kurallar/` | Kural dizini |
| `temalar/` | `paletler.json`, `sekiller.json`, `kullanilanlar.json` |
| `src/` | Konudan bağımsız kit: zemin, çerçeve, başlık, altyazı, gösterge, büyüteç |
| `ornek/` | Kavanoz filmi ve bütün kombinasyonları çizen vitrin |
| `araclar/` | Kurulum, seçim, kontrast ölçümü, önizleme |
| `onizleme/` | Üretilmiş görseller |

## Araçlar

| Komut | Ne yapar |
|---|---|
| `python araclar/sec.py "konu"` | Son videolara benzemeyen kombinasyon önerir |
| `python araclar/sec.py --liste` | Kombinasyon sayısını ve geçmişi gösterir |
| `python araclar/kur.py <film>` | Kit ve temaları film klasörüne kurar |
| `python araclar/kontrast.py` | Her paletin okunurluğunu ölçer |
| `python araclar/miks.py <ses> <muzik> <sure> <cikti>` | Anlatım, müzik ve dönüm seslerini karıştırır |
| `python araclar/vitrin.py <kareler> onizleme` | Önizleme görsellerini üretir |

## Lisans

MIT. Kit, anidoodle motorunun içinde çalışır ve motorun tiplerini kullanır; motorun kendi lisansı geçerlidir, motor bu depoda yoktur.
