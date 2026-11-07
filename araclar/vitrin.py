"""Vitrin karelerinden Türkçe etiketli önizleme görselleri yapar.

    cd <film_klasoru>
    node tools/still.mjs kesitvitrin --frames 0-<son>:1 --scale 0.4 --out out/vitrin/
    python <repo>/araclar/vitrin.py out/vitrin <repo>/onizleme

Kare sırası ornek/kesitvitrin.ts ile aynıdır. Uyumsuz palet + şekil hücreleri matriste boş kalır.
"""
import json, pathlib, sys
from PIL import Image, ImageDraw, ImageFont

KOK = pathlib.Path(__file__).resolve().parent.parent
kare_dir, cikti = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
cikti.mkdir(parents=True, exist_ok=True)
paletler = json.loads((KOK / "temalar/paletler.json").read_text(encoding="utf-8"))
sekiller = json.loads((KOK / "temalar/sekiller.json").read_text(encoding="utf-8"))
P, S = list(paletler), list(sekiller)
FONT = "C:/Windows/Fonts/segoeuib.ttf"

def kare(i):
    return Image.open(kare_dir / f"kesitvitrin-{i}.png").convert("RGB")

def uyumlu(p, s):
    u = sekiller[s]["uyum"]
    return u == "hepsi" or (u == "koyu") == paletler[p]["koyu"]

def izgara(hucreler, sutun, en, ad, baslik, yazi=25):
    """hucreler: (görsel ya da None, etiket) listesi"""
    boy = int(en * 16 / 9); bosluk = 18; ust = 40; et = 52
    f = ImageFont.truetype(FONT, yazi); fb = ImageFont.truetype(FONT, 36)
    satir = (len(hucreler) + sutun - 1) // sutun
    W = bosluk + sutun * (en + bosluk); H = ust + 54 + satir * (boy + et + bosluk)
    tuval = Image.new("RGB", (W, H), "#f4f2ec"); d = ImageDraw.Draw(tuval)
    d.text((bosluk, 18), baslik, font=fb, fill="#16202c")
    for i, (g, etiket) in enumerate(hucreler):
        x = bosluk + (i % sutun) * (en + bosluk); y = ust + 54 + (i // sutun) * (boy + et + bosluk)
        if g is None:
            d.rectangle((x, y, x + en, y + boy), outline="#c9c5ba", width=2)
        else:
            tuval.paste(g.resize((en, boy), Image.LANCZOS), (x, y))
        d.text((x + 2, y + boy + 8), etiket, font=f, fill="#16202c")
    tuval.save(cikti / ad, quality=88)
    print(cikti / ad, tuval.size)

n = len(P) * len(S)
izgara([(kare(j), paletler[p]["ad"]) for j, p in enumerate(P)], 5, 300, "paletler.jpg", "Aynı sahne, on palet")
izgara([(kare(n + i), sekiller[s]["ad"]) for i, s in enumerate(S)], 3, 340, "sekiller.jpg", "Aynı konu, altı sunum şekli")
izgara([(kare(n + len(S) + i), e) for i, e in enumerate(["tam", "buyutec", "ikiz"])], 3, 340, "kompozisyonlar.jpg", "Üç kompozisyon")
hucre = []
for i, s in enumerate(S):
    for j, p in enumerate(P):
        hucre.append((kare(i * len(P) + j) if uyumlu(p, s) else None, f"{s} / {p}"))
izgara(hucre, len(P), 210, "matris.jpg", "Bütün palet ve şekil eşleşmeleri", yazi=17)

# every shape through the film's turning points, then the other two compositions in every shape
b = n + len(S) + 3
ANLAR = ["kanca", "sıcak", "soğuma", "açılış", "tık"]
izgara([(kare(b + i * 5 + j), f"{s} / {a}") for i, s in enumerate(S) for j, a in enumerate(ANLAR)], 5, 240, "sahneler.jpg", "Her şekil filmin dönüm anlarında", yazi=20)
b += len(S) * 5
izgara([(kare(b + i * 2 + j), f"{s} / {k}") for i, s in enumerate(S) for j, k in enumerate(["buyutec", "ikiz"])], 6, 240, "kompozisyon_matris.jpg", "Her şekilde büyüteç ve ikiz", yazi=20)
b += len(S) * 2
izgara([(kare(b), "koyu palet"), (kare(b + 1), "açık palet")], 2, 340, "altyazi_kontur.jpg", "Kutusuz konturlu altyazı")
