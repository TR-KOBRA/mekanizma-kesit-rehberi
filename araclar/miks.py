"""Anlatım, müzik ve dönüm seslerini tek dosyada karıştırır.

    python araclar/miks.py <ses> <muzik> <sure_sn> <cikti.wav> [--tik 1.68 18.08] [--muzik-seviye 0.42]

Müzik anlatım gelince kısılır, son 1,4 saniyede iner. --tik verilen saniyelere kısa bir kapak
sesi koyar. Çıkış -14 LUFS'e getirilir ve tepeler sınırlanır. Sonucu kontrol.py ile ölç.
Bu betik yapay zekâ sesi içindir: kullanıcının kendi kaydında seviye düz kazançla ayarlanır.
"""
import argparse, subprocess, sys

ap = argparse.ArgumentParser()
ap.add_argument("ses")
ap.add_argument("muzik")
ap.add_argument("sure", type=float)
ap.add_argument("cikti")
ap.add_argument("--tik", type=float, nargs="*", default=[])
ap.add_argument("--muzik-seviye", type=float, default=0.42)
a = ap.parse_args()

STEREO = "aresample=48000,aformat=channel_layouts=stereo"
parcalar = [
    f"[0:a]{STEREO},apad=pad_dur=2,asplit=2[v][sc]",
    f"[1:a]{STEREO},atrim=0:{a.sure},volume={a.muzik_seviye},afade=t=in:st=0:d=0.3,afade=t=out:st={a.sure - 1.4}:d=1.4[m]",
    "[m][sc]sidechaincompress=threshold=0.03:ratio=5:attack=20:release=350[md]",
]
girdiler = ["-i", a.ses, "-i", a.muzik]
karisim = ["[v]", "[md]"]
if a.tik:
    girdiler += ["-f", "lavfi", "-i", "anoisesrc=d=0.05:c=white:a=0.9:r=48000"]
    bolum = "".join(f"[k{i}]" for i in range(len(a.tik)))
    parcalar.append(f"[2:a]highpass=f=1800,lowpass=f=7000,afade=t=out:st=0.004:d=0.04,{STEREO},asplit={len(a.tik)}{bolum}" if len(a.tik) > 1
                    else f"[2:a]highpass=f=1800,lowpass=f=7000,afade=t=out:st=0.004:d=0.04,{STEREO}[k0]")
    for i, s in enumerate(a.tik):
        ms = round(s * 1000)
        parcalar.append(f"[k{i}]adelay={ms}|{ms},volume=0.7[t{i}]")
        karisim.append(f"[t{i}]")
parcalar.append(
    f"{''.join(karisim)}amix=inputs={len(karisim)}:normalize=0:duration=longest,atrim=0:{a.sure},"
    "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=192000,alimiter=limit=0.8:attack=2:release=40:level=false,aresample=48000[o]")

r = subprocess.run(["ffmpeg", "-y", "-v", "error", *girdiler, "-filter_complex", ";".join(parcalar), "-map", "[o]", a.cikti])
sys.exit(r.returncode)
