# 07 · Hareket ve ses

## Zamanlama

- Önce ses gelir, sahneler kelime zamanlarına göre kurulur.
- Sahne cümlenin ilk kelimesinde değişir.
- Mekanizmanın hareketi, onu anlatan kelimenin üstüne oturur. Örnekte kapak "içeri" kelimesinde çöker, "tık" kelimesinde fırlar.
- Yazı okunmadan sahne geçmez.

## Kamera

- Kamera sabit hızla, yavaşça yaklaşır.
- Sahne başına tek hareket yeterlidir.
- Nesne altyazı bandına değecek kadar büyümez.

## Küçük hareketler

Her sahnede en az biri sürer: maddenin yüzeyi, kayan ızgara, buhar, ibre, canlı sinyal.

| Öğe | Davranış |
|---|---|
| Başlık | 0,28 saniyede hafif taşarak yerine oturur |
| Not çizgisi | 0,3 saniyede kendini çizer |
| Ses kelimesi | 0,2 saniyede büyür, halkalar yarım saniyede dağılır |
| Sarsıntı | Yalnız dönüm sesinde, 11 pikselden az, 0,26 saniye |
| İşaretler | Kelimeyle birlikte taşarak gelir |

## Yapılmayacaklar

- Flaş, whoosh ve hız rampası
- Sahne aralarında siyah kart
- Sahne ortasında renk değişimi. Uyarı zemini yalnız son bölümde, kesmeyle gelir
- Şekle ait olmayan efekt: afişte parlama, patentte titreme gibi

## Çizim sözleşmesi

- Her kare yalnız zamanın sonucudur. `Math.random` yok, `hash` kullanılır.
- `ctx.filter` yok. Parlama için kitteki `kalem` kullanılır.
- Renk elle yazılmaz, her renk paletten gelir.

## Ses

| Ölçü | Değer |
|---|---|
| Toplam ses yüksekliği | -14 LUFS |
| Gerçek tepe | En fazla -1 dBTP |
| Anlatım | Hep önde, net |
| Müzik | Anlatım gelince otomatik kısılır |
| Son | Müzik 1,4 saniyede iner |

Bu değerleri `araclar/miks.py` uygular:

```bash
python araclar/miks.py kayit/ham.wav ses/muzik/parca.mp3 26 ses/miks.wav --tik 1.68 18.08
```

- Her videoya yeni müzik üretilir ya da bulunur. Kodla sentezlenmiş müzik kullanılmaz.
- Müzik enstrümantal olur.
- Ses efekti az kullanılır: yalnız dönüm anı ve küçük vuruşlar.
- Kullanıcının kendi sesi kullanılıyorsa sese dokunulmaz, yalnız seviye düz kazançla ayarlanır.
- Yapay zekâ sesi ve müzik kredi harcar. Üretmeden önce onay alınır.
