"""Temayı bir film projesine kurar.

    python araclar/kur.py <film_klasoru> --palet prusya --sekil pafta --kompozisyon tam [--altyazi kontur]

<film_klasoru>: yeni_proje.sh'in açtığı film/ klasörü. Kit, örnek film ve vitrin kopyalanır;
JSON tablolarından kesitTemalar.ts, seçimden kesitSecim.ts yazılır. Var olan kendi filmine dokunmaz.
"""
import argparse, json, pathlib, shutil, sys

KOK = pathlib.Path(__file__).resolve().parent.parent
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")
KOMPOZISYONLAR = ("tam", "buyutec", "ikiz")

def uyumlu(palet, sekil):
    u = sekil["uyum"]
    return u == "hepsi" or (u == "koyu") == palet["koyu"]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("film")
    ap.add_argument("--palet", default="prusya")
    ap.add_argument("--sekil", default="pafta")
    ap.add_argument("--kompozisyon", default="tam", choices=KOMPOZISYONLAR)
    ap.add_argument("--altyazi", choices=("kontur",), help="şeklin altyazısı yerine kutusuz konturlu yazı")
    a = ap.parse_args()

    film = pathlib.Path(a.film)
    cc = film / "src" / "canvas-core"
    if not cc.is_dir():
        sys.exit(f"HATA: film klasörü değil: {film}")
    paletler = json.loads((KOK / "temalar/paletler.json").read_text(encoding="utf-8"))
    sekiller = json.loads((KOK / "temalar/sekiller.json").read_text(encoding="utf-8"))
    if a.palet not in paletler:
        sys.exit(f"HATA: palet yok: {a.palet}. Seçenekler: {', '.join(paletler)}")
    if a.sekil not in sekiller:
        sys.exit(f"HATA: şekil yok: {a.sekil}. Seçenekler: {', '.join(sekiller)}")
    if not uyumlu(paletler[a.palet], sekiller[a.sekil]):
        sys.exit(f"HATA: {a.sekil} şekli {a.palet} paletiyle çalışmaz (uyum: {sekiller[a.sekil]['uyum']}).")

    shutil.copy(KOK / "src/kesitKit.ts", cc)
    for ad in ("kesitornek", "kesitvitrin"):
        shutil.copy(KOK / f"ornek/{ad}.ts", cc)
        (film / "src/hosts" / f"page-{ad}.ts").write_text(
            f'import {{ {ad} }} from "../canvas-core/{ad}";\nimport {{ mountFilm }} from "./page";\nmountFilm({ad});\n', encoding="utf-8")
    (cc / "kesitTemalar.ts").write_text(
        "// Üretilmiş dosya: temalar/*.json'dan araclar/kur.py yazar. Elle değiştirme.\n"
        'import type { Palet, Sekil } from "./kesitKit";\n'
        f"export const PALETLER: Record<string, Palet> = {json.dumps(paletler, ensure_ascii=False, indent=1)};\n"
        f"export const SEKILLER: Record<string, Sekil> = {json.dumps(sekiller, ensure_ascii=False, indent=1)};\n", encoding="utf-8")
    secim = {"palet": a.palet, "sekil": a.sekil, "kompozisyon": a.kompozisyon}
    if a.altyazi:
        secim["altyazi"] = a.altyazi
    (cc / "kesitSecim.ts").write_text(
        'import type { Secim } from "./kesitKit";\n'
        f"export const SECIM: Secim = {json.dumps(secim, ensure_ascii=False)};\n", encoding="utf-8")
    print(f"kuruldu: {film}  ({a.palet} + {a.sekil} + {a.kompozisyon})")

main()
