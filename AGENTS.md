# Yapay zekâ için talimat

Bu repoyla video yapan yapay zekâ bu dosyadaki sırayı izler.

**Görüntünün tamamı bu repodaki kit ve anidoodle motoruyla çizilir.** Kendi animasyon kodunu yazma. HTML/CSS animasyonu, Remotion, Manim, After Effects ya da görsel/video üreten model kullanma. Repo dışında bir yöntemle yapılan video örneğe benzemez. Kullanıcıların "videodaki gibi olmadı" demesinin bir numaralı nedeni budur.

## 0. Kurulum

```bash
bash kur.sh
```

- Komut eksik program söylerse (git, node, npm, ffmpeg, python), kullanıcıya hangisini kuracağını söyle. Sistem ayarlarını kendin değiştirme.
- Bitince `cikti/kurulum_testi.png` dosyasına bak ve `onizleme/ornek_kare.png` ile karşılaştır. Aynı değilse dur, farkı kullanıcıya göster.
- Windows dışındaki sistemlerde yazı tipleri biraz farklı görünür (Segoe UI ve Consolas yok, en yakın yazı tipi kullanılır). Bu bilinen bir farktır. Kullanıcıya söyle.

## 1. Önce örneği üret

```bash
bash video.sh kesitornek
```

`cikti/kesitornek_prusya_pafta_tam.mp4` dosyasını kullanıcıya göster. Bu video `onizleme/ornek.gif` ile aynı olmalı. Örnek sessizdir, çünkü repoda ses yoktur.

## 2. Aynı videonun başka kılığı

```bash
python araclar/sec.py --liste
bash video.sh kesitornek --palet okyanus --sekil poster --kompozisyon ikiz
```

Palet, şekil ve kompozisyon adları `kurallar/02-renk.md`, `03-sunum-sekilleri.md` ve `04-kompozisyon.md` içindedir. `kur.py` uyumsuz eşleşmeyi reddeder: osiloskop yalnız koyu, kareli ve patent yalnız açık paletle çalışır.

## 3. Yeni konu

Adımları sırayla yap. Kullanıcı onayı gereken yerde dur.

1. **Konu.** `kurallar/06-konu-ve-metin.md` ölçütüne uyuyor mu bak. Bilgiyi en az iki bağımsız kaynakla doğrula, kaynakları kullanıcıya listele.
2. **Metin.** 50-130 kelime, aynı dosyadaki iskelete göre. **Kullanıcıya onaylat.**
3. **Ses.** Kullanıcının kaydı ya da kullanıcının seçtiği seslendirme servisi. Ücretli servis kullanmadan önce sor. Ses gelmeden sahne zamanlamasına başlama.
4. **Kelime zamanları.** `python araclar/kelimeler.py <ses dosyası>` çalıştır, çıkan `CAP` tablosunu kullan. Zamanları tahmin etme, yoksa altyazı sesten kayar. Yazım hatalarını düzelt.
5. **Kombinasyon.** `python araclar/sec.py "<konu>"`.
6. **Film dosyası.** `bash yeni.sh <ad>` çalıştır. `motor/src/canvas-core/<ad>.ts` içinde **yalnız** şunları değiştir:
   - `jar()` yerine yeni nesnenin kesit çizimi
   - `CAP`, `ANTET`, `DURATION` (son kelime + 1,7 sn, saniye x 30)
   - `ciz()` içindeki sahne aralıkları ve başlık metinleri
7. **Kare kontrolü.** Her sahnenin ortasından kare çek ve bak:
   ```bash
   cd motor && node tools/still.mjs <ad> --frames 30,200,400,600 --scale 0.4 --out out/<ad>/ --sheet out/<ad>.jpg
   ```
   `kurallar/09-kontrol-listesi.md` ile karşılaştır. **Kontak sayfasını kullanıcıya göster.**
8. **Video.**
   ```bash
   bash video.sh <ad> --palet <p> --sekil <s> --kompozisyon <k> --ses <anlatım.wav> --muzik <müzik.mp3> --tik <saniye>
   ```
9. Yayınlanacaksa `python araclar/sec.py "<konu>" --kaydet`.

## Dokunma

- `src/kesitKit.ts`, `ornek/`, `temalar/*.json`. Yeni palet ya da şekil eklemek ayrı iştir (`kurallar/02`, `03`).
- `motor/src/canvas-core/kesitornek.ts`: vitrin onu kullanır. Yeni film için kopyala (`yeni.sh`).
- Renk kodu yazma (`#ff0000` gibi). Her renk paletten rol adıyla gelir: `p.murekkep`, `p.vurgu`, `p.dolgu`.
- Yazı tipini, başlığı, altyazıyı, çerçeveyi elle çizme. Kitteki `baslik`, `altyazi`, `cerceve`, `zemin` kullanılır.
- `Math.random` ve `ctx.filter` yasak. Rastgelelik için `hash(n)`.

## Nesne çizimi

- Nesne `(x, top, s)` alan bir işlevdir, böylece büyüteç ve ikiz kompozisyonu çalışır.
- Dış çizgi `kalem(c, T, t, yol, p.murekkep, kalınlık)`, içindeki madde `doldur(...)` ile çizilir.
- Hareket eden parça `p.vurgu` rengindedir.
- Çizim sırası: `zemin`, nesne, `baslik`, `cerceve`, `altyazi`.
- Ayrıntı: `kurallar/08-yeni-konu.md`.

## Değişmez kurallar

`kurallar/01-degismezler.md`. En sık bozulanlar:

- Altyazı alt banttadır, resmin ortasına yazı konmaz.
- Bir cümle bir sahnedir. Sahne, cümlenin ilk kelimesinde değişir.
- 1,5 saniyeden uzun donmuş kare olmaz.
- Paylaşım açıklaması izleyiciye soru sormaz.
- Başka bir sayfanın logosu ya da adı kullanılmaz.
