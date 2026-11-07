# 09 · Kontrol listesi

Bir madde bile kalmışsa video teslim edilmez.

## Bilgi

- [ ] Her bilgi en az iki kaynaktan kontrol edildi
- [ ] Sağlık, gıda ya da güvenlik konusunda resmî kaynak var
- [ ] Kaynaklar açıklamaya yazıldı
- [ ] Altyazı yazımı doğru

## Görüntü

- [ ] Nesne ilk bakışta tanınıyor
- [ ] Hareket eden parça belli
- [ ] Altyazı nesnenin üstüne binmiyor
- [ ] Yazı okunmadan sahne geçmiyor
- [ ] Taşan ya da kesilen öğe yok
- [ ] Yanlış anlaşılacak sembol yok
- [ ] Doğru sayfanın logosu var, başka logo yok

## Çeşitlilik

- [ ] Palet son 5 videoda kullanılmadı
- [ ] Şekil son 3 videoda kullanılmadı
- [ ] Kompozisyon son videoda kullanılmadı
- [ ] Müzik yeni
- [ ] Seçim `kullanilanlar.json` dosyasına yazıldı

## Teknik

Şu komut temiz bitmeli:

```bash
python tools/kontrol.py out/final.mp4 --film src/canvas-core/<ad>.ts --max 89
```

- [ ] 1080x1920, 30 kare/sn
- [ ] -14 LUFS, gerçek tepe en fazla -1 dBTP
- [ ] Siyah kare yok
- [ ] Donmuş görüntü yok
- [ ] Kontrol sayfasına gözle bakıldı
- [ ] Ses kulakla dinlendi

## Paylaşım

- [ ] Açıklama soruyla bitmiyor
- [ ] Reels kapağı videodan kare alınmadan ayrı çizildi
- [ ] Yayınlamak için onay alındı
