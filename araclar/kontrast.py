"""Her paletin okunurluğunu ölçer (WCAG kontrast oranı). Yeni palet eklerken çalıştır.

    python araclar/kontrast.py

Yazı için en az 4.5, büyük başlık ve işaret için en az 3. Bir eşik tutmazsa çıkış kodu 1 olur.
"""
import json, pathlib, sys

KOK = pathlib.Path(__file__).resolve().parent.parent
sys.stdout.reconfigure(encoding="utf-8")
GEREKEN = ["zemin", "zemin2", "isik", "murekkep", "cizgi", "vurgu", "dolgu", "dolgu2", "dolgu3", "detay", "metal",
           "conta", "buhar", "tehlike", "tamam", "uyari_zemin", "uyari_isik", "yazi_zemin", "yazi", "yazi_vurgu"]
# (ön renk, arka renk, en az oran, ne için)
KURALLAR = [
    ("murekkep", "zemin", 4.5, "ana çizgi ve başlık"),
    ("murekkep", "uyari_zemin", 4.5, "uyarı sahnesinde başlık"),
    ("cizgi", "zemin", 3.0, "ince çizgi ve etiket"),
    ("vurgu", "zemin", 3.0, "vurgulu başlık kelimesi"),
    ("tehlike", "uyari_zemin", 3.0, "uyarı kelimesi"),
    ("tamam", "zemin", 3.0, "onay işareti"),
    ("yazi", "yazi_zemin", 4.5, "altyazı"),
    ("yazi_vurgu", "yazi_zemin", 3.0, "altyazı vurgusu"),
    ("dolgu", "zemin", 1.6, "nesne zeminden ayrılıyor mu"),
    ("murekkep", "isik", 4.5, "açık paletin altyazı plakası"),
    ("vurgu", "isik", 3.0, "açık paletin altyazı vurgusu"),
]

def parlaklik(h):
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
    f = lambda v: v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)

def oran(a, b):
    x, y = sorted((parlaklik(a), parlaklik(b)), reverse=True)
    return (x + 0.05) / (y + 0.05)

paletler = json.loads((KOK / "temalar/paletler.json").read_text(encoding="utf-8"))
hata = 0
for ad, p in paletler.items():
    eksik = [k for k in GEREKEN if k not in p]
    if eksik:
        print(f"HATA {ad}: eksik renk: {', '.join(eksik)}"); hata += 1; continue
    kurallar = [k for k in KURALLAR if not (p["koyu"] and k[1] == "isik")]
    kotu = [(on, ar, en, ne, oran(p[on], p[ar])) for on, ar, en, ne in kurallar if oran(p[on], p[ar]) < en]
    for on, ar, en, ne, o in kotu:
        print(f"HATA {ad}: {ne}: {on} / {ar} = {o:.2f} (en az {en})"); hata += 1
    if not kotu:
        en_dusuk = min(oran(p[on], p[ar]) / en for on, ar, en, _ in kurallar)
        print(f"tamam {ad:10s} en dar pay x{en_dusuk:.2f}")
print(f"\n{len(paletler)} palet, {hata} hata")
sys.exit(1 if hata else 0)
