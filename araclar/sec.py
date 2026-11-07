"""Yeni video için son videolara benzemeyen bir palet + şekil + kompozisyon seçer.

    python araclar/sec.py "buzdolabı ışığı"             # öneri verir, hiçbir şey yazmaz
    python araclar/sec.py "buzdolabı ışığı" --kaydet    # seçimi kullanilanlar.json'a da ekler
    python araclar/sec.py --liste                        # kaç kombinasyon var, hangileri kullanıldı

Tekrar kuralı: son 5 videonun paleti, son 3 videonun şekli, son videonun kompozisyonu yeniden seçilmez.
Aynı konu aynı öneriyi verir: konu adı rastgeleliğin tohumudur.
"""
import argparse, datetime, json, pathlib, random, sys

KOK = pathlib.Path(__file__).resolve().parent.parent
KOMPOZISYONLAR = ("tam", "buyutec", "ikiz")
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

def oku(ad):
    return json.loads((KOK / "temalar" / ad).read_text(encoding="utf-8"))

def uyumlu(palet, sekil):
    u = sekil["uyum"]
    return u == "hepsi" or (u == "koyu") == palet["koyu"]

ap = argparse.ArgumentParser()
ap.add_argument("konu", nargs="?")
ap.add_argument("--kaydet", action="store_true")
ap.add_argument("--liste", action="store_true")
a = ap.parse_args()

paletler, sekiller, gecmis = oku("paletler.json"), oku("sekiller.json"), oku("kullanilanlar.json")
hepsi = [(p, s, k) for s in sekiller for p in paletler if uyumlu(paletler[p], sekiller[s]) for k in KOMPOZISYONLAR]

if a.liste:
    print(f"{len(paletler)} palet, {len(sekiller)} şekil, {len(KOMPOZISYONLAR)} kompozisyon: {len(hepsi)} uyumlu kombinasyon")
    for g in gecmis:
        print(f"  {g['tarih']}  {g['palet']} + {g['sekil']} + {g['kompozisyon']}  ({g['konu']})")
    sys.exit(0)
if not a.konu:
    sys.exit('HATA: konu yaz: python araclar/sec.py "konu adı"')

yasak_p = {g["palet"] for g in gecmis[-5:]}
yasak_s = {g["sekil"] for g in gecmis[-3:]}
yasak_k = {g["kompozisyon"] for g in gecmis[-1:]}
aday = [c for c in hepsi if c[0] not in yasak_p and c[1] not in yasak_s and c[2] not in yasak_k]
if not aday:
    sys.exit("HATA: tekrar kuralına uyan kombinasyon kalmadı. temalar/paletler.json'a yeni palet ekle.")

p, s, k = random.Random(a.konu).choice(aday)
print(f"palet: {p} ({paletler[p]['ad']})")
print(f"şekil: {s} ({sekiller[s]['ad']})")
print(f"kompozisyon: {k}")
print(f"kurulum: python araclar/kur.py <film_klasoru> --palet {p} --sekil {s} --kompozisyon {k}")
if a.kaydet:
    gecmis.append({"konu": a.konu, "tarih": datetime.date.today().isoformat(), "palet": p, "sekil": s, "kompozisyon": k})
    (KOK / "temalar/kullanilanlar.json").write_text(json.dumps(gecmis, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("kaydedildi")
