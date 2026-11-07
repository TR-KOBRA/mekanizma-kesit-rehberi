# 05 · Seçim ve tekrar

Seri günlük çıkarsa görüntü çabuk bıkkınlık yapar. Bu yüzden kombinasyon elle değil, geçmişe bakılarak seçilir.

## Tekrar kuralı

| Ne | Kaç video boyunca tekrar edilmez |
|---|---|
| Palet | Son 5 video |
| Şekil | Son 3 video |
| Kompozisyon | Son video |
| Müzik | Hiç. Her videoya yeni müzik |

## Sıra

1. Konuyu belirle.
2. `python araclar/sec.py "konu adı"` ile öneri al. Bu komut hiçbir şey yazmaz.
3. Öneri konuya uymuyorsa [02 Renk](02-renk.md) ve [03 Sunum şekilleri](03-sunum-sekilleri.md) tablolarından elle seç. Tekrar kuralı yine geçerlidir.
4. Karar verince `--kaydet` ile geçmişe yaz. Elle seçtiysen `temalar/kullanilanlar.json` dosyasına satır ekle.
5. Geçmişe yalnız yayınlanacak videoyu yaz. Denemeler yazılmaz.

## Toplam

`python araclar/sec.py --liste` kombinasyon sayısını ve geçmişi gösterir. Şu anda 10 palet, 6 şekil ve 3 kompozisyondan 132 uyumlu kombinasyon çıkıyor. Koyu palet isteyen `osiloskop` ile açık palet isteyen `kareli` ve `patent` sayıyı 180'den 132'ye indirir.

## Seri kimliği

Kombinasyon değişse de izleyici seriyi şunlardan tanır:

- Kesit çizimi ve tek nesne
- Üstte iki parçalı başlık
- Altta kelime kelime altyazı
- Aynı anlatım iskeleti ([06 Konu ve metin](06-konu-ve-metin.md))
- Aynı ses
