"""Seslendirmeden altyazı tablosu (CAP) çıkarır: her kelimenin başladığı saniye.

    pip install faster-whisper
    python araclar/kelimeler.py ses/anlatim.wav > cap.txt

Çıktıyı filmdeki CAP tablosuna yapıştır. Cümle sonu (. ! ? :) yeni satır açar. Vurgulanacak
kelimelerin sonuna elle `, true` ekle (satır başına en fazla iki). Yazımı mutlaka kontrol et:
model özel adları ve sayıları yanlış duyabilir.
"""
import sys

try:
    from faster_whisper import WhisperModel
except ImportError:
    sys.exit("HATA: önce kur: pip install faster-whisper")

sys.stdout.reconfigure(encoding="utf-8")
if len(sys.argv) < 2:
    sys.exit("kullanım: python araclar/kelimeler.py <ses dosyası> [model: small|medium]")
model = WhisperModel(sys.argv[2] if len(sys.argv) > 2 else "medium", device="cpu", compute_type="int8")
parcalar, _ = model.transcribe(sys.argv[1], language="tr", word_timestamps=True, vad_filter=False)
kelimeler = [(w.start, w.end, w.word.strip()) for p in parcalar for w in p.words if w.word.strip()]
if not kelimeler:
    sys.exit("HATA: seste kelime bulunamadı")

satirlar, simdiki = [], []
for k in kelimeler:
    simdiki.append(k)
    if k[2][-1] in ".!?:" or len(simdiki) >= 9:
        satirlar.append(simdiki); simdiki = []
if simdiki:
    satirlar.append(simdiki)

print("const CAP: Satir[] = [")
for i, s in enumerate(satirlar):
    bas = s[0][0]
    son = satirlar[i + 1][0][0] - 0.02 if i + 1 < len(satirlar) else s[-1][1] + 1.2
    ic = ", ".join(f'[{w[0]:.2f}, "{w[2]}"]' for w in s)
    print(f"  [{bas:.2f}, {son:.2f}, [{ic}]],")
print("];")
print(f"// süre: {kelimeler[-1][1]:.2f} sn. Filmin DURATION değerini (son kelime + 1,7 sn) x 30 yap.", file=sys.stderr)
