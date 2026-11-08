import type { Ctx, Env } from "./core";
import type { Film } from "./film";
import { SECIM } from "./kesitSecim";
import { type Satir, type Tema, altyazi, back, baslik, buyut, buyutec, cerceve, doldur, duman, eio, eo, gosterge, hash, kalem, kalkan, lerp, not, ok, patlama, ra, seg, tema, yasak, zemin } from "./kesitKit";

// Worked example: the "tik" of a jar lid. Only the subject lives here (the jar, the scene order and
// the word timings); colours, type, frame and caption all come from the theme, so the same file
// renders in any palette x shape x composition. To make a new film, copy this file and replace
// jar(), CAP, ANTET, DURATION and the scene list. Times are from the voice recording
// (araclar/kelimeler.py prints CAP from it).

const FPS = 30, DURATION = 780;

const CAP: Satir[] = [
  [0.0, 2.95, [[0, "Kavanozu"], [0.54, "açınca"], [0.98, "gelen"], [1.22, "o"], [1.68, "tık", true], [1.94, "sesi"], [2.2, "var"], [2.5, "ya"]]],
  [2.98, 5.8, [[2.98, "Boşuna"], [3.52, "değil,"], [3.9, "o"], [4.28, "bir"], [4.5, "güvenlik", true], [4.94, "testi.", true]]],
  [5.94, 8.05, [[5.94, "Kavanoz"], [6.32, "genelde"], [6.76, "sıcakken", true], [7.26, "kapatılır."]]],
  [8.06, 11.7, [[8.06, "İçi"], [8.56, "soğuyunca"], [9.32, "buhar"], [9.68, "suya"], [10.02, "döner,"], [10.44, "basınç", true], [10.92, "düşer.", true]]],
  [11.8, 14.8, [[11.8, "Dışarıdaki"], [12.38, "hava"], [12.66, "kapağın"], [13.16, "ortasını"], [13.58, "içeri", true], [13.9, "bastırır.", true]]],
  [14.94, 18.0, [[14.94, "Sen"], [15.14, "açınca"], [15.74, "hava"], [16.0, "içeri"], [16.36, "dolar,"], [16.74, "kapak"], [17.2, "fırlar:"]]],
  [18.8, 21.55, [[18.8, "Yani"], [19.1, "açmadan"], [19.62, "önce"], [19.94, "kapağın"], [20.44, "ortası"], [20.76, "kabarıksa", true]]],
  [21.58, 23.3, [[21.58, "vakum"], [21.98, "çoktan"], [22.44, "gitmiştir.", true]]],
  [23.4, 25.6, [[23.4, "O"], [23.54, "kavanozu"], [23.98, "yeme.", true]]],
];
const ANTET = { parca: "KAVANOZ KAPAĞI / KESİT A-A", no: "No. 01" };

// ---- the subject: a jar in section. dome: -1 pulled in, 0 flat, +1 bulged up. lift: lid off the rim.
type Jar = { x: number; top: number; s: number; dome: number; lift?: number; tilt?: number; head?: string };
const JAM = 0.74;
const lidCurve = (c: Ctx, x0: number, x1: number, y: number, h: number) => {
  const m = (x0 + x1) / 2, w = (x1 - x0) / 2;
  c.lineTo(m - w * 0.62, y); c.quadraticCurveTo(m - w * 0.42, y, m - w * 0.34, y + h * 0.5);
  c.quadraticCurveTo(m, y + h * 1.5, m + w * 0.34, y + h * 0.5); c.quadraticCurveTo(m + w * 0.42, y, m + w * 0.62, y); c.lineTo(x1, y);
};
const body = (c: Ctx, x: number, top: number, s: number) => {
  const nw = 190 * s, bw = 262 * s, sh = 56 * s, H = 640 * s;
  c.beginPath(); c.moveTo(x - nw, top); c.lineTo(x - nw, top + sh);
  c.bezierCurveTo(x - nw, top + sh + 40 * s, x - bw, top + sh + 40 * s, x - bw, top + sh + 110 * s);
  c.lineTo(x - bw, top + H - 56 * s); c.quadraticCurveTo(x - bw, top + H, x - bw + 56 * s, top + H);
  c.lineTo(x + bw - 56 * s, top + H); c.quadraticCurveTo(x + bw, top + H, x + bw, top + H - 56 * s);
  c.lineTo(x + bw, top + sh + 110 * s); c.bezierCurveTo(x + bw, top + sh + 40 * s, x + nw, top + sh + 40 * s, x + nw, top + sh); c.lineTo(x + nw, top);
};
const jar = (c: Ctx, T: Tema, j: Jar, t: number) => {
  const { p, s: sk } = T, { x, top, s } = j, H = 640 * s, nw = 190 * s, lid = j.lift ?? 0;
  // glass interior
  c.save(); body(c, x, top, s); c.closePath(); c.fillStyle = j.head ?? ra(p.cizgi, 0.13); c.fill(); c.clip();
  // the jam, with a slow moving surface
  const ly = top + H * (1 - JAM), x0 = x - 300 * s, x1 = x + 300 * s;
  doldur(c, T, () => {
    c.beginPath(); c.moveTo(x0, top + H + 10);
    for (let i = 0; i <= 24; i++) c.lineTo(x0 + (i / 24) * 600 * s, ly + Math.sin(i * 0.7 + t * 2.1) * 5 * s);
    c.lineTo(x1, top + H + 10); c.closePath();
  }, x0, x1, ly, top + H);
  if (sk.dolgu === "kademeli" || sk.dolgu === "duz") for (let i = 0; i < 46; i++) {
    const px = x + (hash(i) - 0.5) * 500 * s, py = lerp(ly + 26 * s, top + H - 16 * s, hash(i + 90)), big = i % 5 === 0;
    c.fillStyle = big ? ra(p.dolgu2, 0.6) : p.detay; c.beginPath();
    c.ellipse(px, py + Math.sin(t * 1.3 + i) * 2, big ? 26 * s : 5 * s, big ? 19 * s : 3 * s, hash(i + 7) * 3, 0, 7); c.fill();
  }
  c.restore();
  // glass outline and highlight
  kalem(c, T, t, () => body(c, x, top, s), p.murekkep, 7 * s + 1);
  if (sk.dolgu === "kademeli" || sk.dolgu === "duz") { c.strokeStyle = "rgba(255,255,255,0.32)"; c.lineWidth = 15 * s; c.lineCap = "round"; c.beginPath(); c.moveTo(x - 226 * s, top + 215 * s); c.lineTo(x - 226 * s, top + H - 120 * s); c.stroke(); c.lineCap = "butt"; }
  // threads on the neck
  c.strokeStyle = p.cizgi; c.lineWidth = 5 * s;
  for (let i = 0; i < 2; i++) { const y = top + (16 + i * 20) * s; c.beginPath(); c.moveTo(x - nw - 11 * s, y); c.lineTo(x - nw + 6 * s, y + 7 * s); c.moveTo(x + nw + 11 * s, y); c.lineTo(x + nw - 6 * s, y + 7 * s); c.stroke(); }
  // the lid: skirt, seal and the moving centre (negative h lifts the centre, positive pulls it in)
  c.save(); c.translate(x, top - lid); c.rotate(j.tilt ?? 0);
  const lx = nw + 22 * s, ty = -12 * s, h = -j.dome * 34 * s;
  const skirt = () => { c.beginPath(); c.moveTo(-lx, 46 * s); c.lineTo(-lx, ty); lidCurve(c, -lx, lx, ty, h); c.lineTo(lx, 46 * s); c.lineTo(lx - 12 * s, 46 * s); c.lineTo(lx - 12 * s, ty + 12 * s); c.lineTo(-lx + 12 * s, ty + 12 * s); c.lineTo(-lx + 12 * s, 46 * s); c.closePath(); };
  skirt(); c.fillStyle = p.metal; c.fill();
  kalem(c, T, t, skirt, p.murekkep, 4);
  kalem(c, T, t, () => { c.beginPath(); c.moveTo(-lx + 12 * s, ty); lidCurve(c, -lx + 12 * s, lx - 12 * s, ty, h); }, p.vurgu, 11 * s);
  c.fillStyle = p.conta; c.fillRect(-nw - 10 * s, ty + 12 * s, 56 * s, 9 * s); c.fillRect(nw - 46 * s, ty + 12 * s, 56 * s, 9 * s);
  c.restore();
};

const thermometer = (c: Ctx, T: Tema, x: number, y: number, v: number) => {
  const { p } = T; c.save(); c.translate(x, y); c.fillStyle = p.zemin2; c.strokeStyle = p.murekkep; c.lineWidth = 5;
  c.beginPath(); (c as any).roundRect(-20, -170, 40, 280, 20); c.fill(); c.stroke();
  c.fillStyle = p.tehlike; c.fillRect(-9, lerp(80, -140, v), 18, lerp(30, 250, v)); c.beginPath(); c.arc(0, 112, 36, 0, 7); c.fill(); c.stroke(); c.restore();
};

// ---- the film: one scene per spoken sentence
export const ciz = (c: Ctx, T: Tema, komp: string, t: number) => {
  const { p, s } = T, CX = 540, TOP = s.alan.ust + 300, S = Math.min(1.08, (s.alan.alt - TOP - 20) / 640);
  const zmax = (s.alan.alt - (TOP + 40)) / (S * 640 - 40);   // the most the jar may grow before it touches the caption band
  const J = (o: Partial<Jar> & { dome: number }): Jar => ({ x: CX, top: TOP, s: S, ...o });
  const adim = t < 5.9 ? 0 : t < 8.04 ? 1 : t < 11.74 ? 2 : t < 14.82 ? 3 : t < 18.78 ? 4 : 5;
  c.globalAlpha = 1; c.globalCompositeOperation = "source-over";
  zemin(c, T, t, t >= 18.8);

  // a soft recoil on the two spoken ticks
  const hit = (a: number) => { const u = seg(t, a, a + 0.26); return u > 0 && u < 1 ? Math.sin(u * Math.PI * 5) * (1 - u) * 11 : 0; };
  c.save(); c.translate(0, hit(1.68) + hit(18.08));

  if (t < 5.9) {
    const pop = eio(seg(t, 1.66, 1.82));
    buyut(c, Math.min(lerp(1, 1.1, seg(t, 0, 5.9)), zmax), CX, TOP + 120, () => jar(c, T, J({ dome: lerp(-1, 0.7, pop) }), t));
    baslik(c, T, t, 0, "KAVANOZ KAPAĞI", "O TIK", "BOŞUNA DEĞİL", undefined, adim);
    if (t > 1.68 && t < 3.0) { c.save(); c.globalAlpha = 1 - seg(t, 2.5, 3.0); patlama(c, T, t, 1.68, "TIK!", 118, TOP - 85); c.restore(); }
    if (t > 4.5) kalkan(c, T, 870, TOP + 650, back(seg(t, 4.5, 4.8)));
  } else if (t < 8.04) {
    const down = eio(seg(t, 6.9, 7.75));
    duman(c, T, t, CX, TOP + 80, lerp(TOP - 260, TOP + 40, down), 300, 28, lerp(0.68, 0.32, down));
    jar(c, T, J({ dome: 0.1, lift: lerp(220, 0, down), tilt: lerp(-0.04, 0, down), head: ra(p.tehlike, 0.2) }), t);
    baslik(c, T, t, 5.94, "ADIM 1", "SICAK", "KAPATILIR", p.tehlike, adim);
    thermometer(c, T, 150, TOP + 500, seg(t, 5.94, 6.7));
  } else if (t < 11.74) {
    const u = seg(t, 8.06, 11.74), cond = seg(t, 9.3, 10.4);
    buyut(c, Math.min(lerp(1, 1.08, u), zmax), CX, TOP + 80, () => {
      jar(c, T, J({ dome: lerp(0.1, -0.2, u) }), t);
      c.save(); body(c, CX, TOP, S); c.clip();
      duman(c, T, t, CX, TOP + 170, TOP + 20, 340, 18, 0.6 * (1 - cond), 12);
      c.fillStyle = p.buhar;
      for (let i = 0; i < 30; i++) { const a = seg(cond, hash(i) * 0.65, hash(i) * 0.65 + 0.3); if (a <= 0) continue; const px = CX + (hash(i + 21) - 0.5) * 400, fall = (t * (40 + hash(i) * 70) + hash(i + 2) * 110) % 150; c.beginPath(); c.arc(px, TOP + 28 + fall, 8 * a, 0, 7); c.fill(); }
      c.restore();
    });
    baslik(c, T, t, 8.06, "ADIM 2", "BASINÇ", "DÜŞER", p.koyu ? p.cizgi : p.vurgu, adim);
    gosterge(c, T, t, 872, TOP + 610, 112, lerp(0.85, 0.16, eio(seg(t, 10.3, 11.3))), "BASINÇ");
    not(c, T, t, 9.32, CX - 90, TOP + 90, 400, TOP - 160, "BUHAR → SU", p.koyu ? p.cizgi : p.vurgu);
  } else if (t < 14.82) {
    const press = eio(seg(t, 13.5, 14.15)), u = seg(t, 11.8, 14.82), lens = komp === "buyutec";
    const sahne = () => jar(c, T, J({ dome: lerp(-0.2, -1, press), head: ra(p.koyu ? p.zemin2 : p.murekkep, p.koyu ? 0.55 : 0.2) }), t);
    buyut(c, lens ? 1 : Math.min(lerp(1.08, 1.32, u), zmax), CX, TOP + 40, sahne);
    for (let i = 0; i < 5; i++) { const q = eo(seg(t, 12.3 + i * 0.08, 12.75 + i * 0.08)), bob = Math.sin(t * 6 + i) * 8; c.save(); c.globalAlpha = q; ok(c, CX - 240 + i * 120, lerp(TOP - 240, TOP - 110, q) + bob + press * 22 - Math.abs(i - 2) * 14, 90, i === 2 ? p.vurgu : p.cizgi); c.restore(); }
    if (lens) buyutec(c, T, t, 780, Math.min(TOP + 560, s.alan.alt - 225), 185, CX, TOP - 6, 2.5, eo(seg(t, 13.2, 13.6)), sahne);
    baslik(c, T, t, 11.8, "ADIM 3", "HAVA", "BASTIRIR", undefined, adim);
  } else if (t < 18.78) {
    const open = eio(seg(t, 15.14, 15.7)), inA = seg(t, 15.74, 17.2), pop = eio(seg(t, 18.06, 18.2)), rot = seg(t, 14.94, 15.7);
    const a0 = p.koyu ? 0.55 : 0.2, tint = ra(p.koyu ? p.zemin2 : p.murekkep, lerp(a0, 0.06, inA));
    buyut(c, Math.min(lerp(1.2, 1.04, seg(t, 14.94, 16.2)), zmax), CX, TOP + 80, () => jar(c, T, J({ dome: lerp(-1, 0.75, pop), lift: lerp(0, 16, open), tilt: Math.sin(rot * Math.PI * 3) * 0.012 * (1 - pop), head: tint }), t));
    if (t > 15.6) for (let i = 0; i < 16; i++) { const side = i % 2 ? 1 : -1, ph = (hash(i) + t * 1.5) % 1, px = CX + side * lerp(330, 120, ph), py = TOP - 12 + Math.sin(ph * 3 + i) * 12 + ph * 150; c.save(); c.globalAlpha = Math.sin(ph * Math.PI) * (1 - pop) * seg(t, 15.6, 15.9); c.strokeStyle = p.cizgi; c.lineWidth = 7; c.lineCap = "round"; c.beginPath(); c.moveTo(px + side * 42, py - 8); c.lineTo(px, py); c.stroke(); c.restore(); }
    gosterge(c, T, t, 880, TOP + 620, 92, lerp(0.16, 0.8, eio(inA)), "BASINÇ");
    baslik(c, T, t, 14.94, "AÇILIŞ", "HAVA", "İÇERİ DOLAR", p.koyu ? p.cizgi : p.vurgu, adim);
    if (t > 18.06) patlama(c, T, t, 18.06, "TIK!", 150, TOP - 75);
  } else {
    const wob = 0.95 + Math.sin(t * 5) * 0.06, u = seg(t, 18.8, 26), swell = lerp(-1, wob, eio(seg(t, 20.76, 21.3)));
    if (komp === "ikiz") {
      // two jars side by side: the sound one stays as it is, the other one swells
      const s2 = S * 0.74, t2 = TOP + 130, iy = Math.min(t2 + 640 * s2 - 4, s.alan.alt - 84);
      jar(c, T, { x: 282, top: t2, s: s2, dome: -1 }, t);
      jar(c, T, { x: 798, top: t2, s: s2, dome: swell, head: ra(p.tehlike, 0.14) }, t);
      if (t > 20.0) kalkan(c, T, 282, iy, 0.8 * back(seg(t, 20.0, 20.3)));
      not(c, T, t, 20.8, 798, t2 - 34, 800, TOP - 150, "KABARIK", p.tehlike);
      not(c, T, t, 19.94, 282, t2 - 4, 272, TOP - 150, "SAĞLAM", p.tamam);
      if (t > 22.44) yasak(c, T, 798, iy, 0.8 * back(seg(t, 22.44, 22.7)));
    } else {
      const sahne = () => jar(c, T, J({ dome: swell, head: ra(p.tehlike, 0.14) }), t);
      buyut(c, Math.min(lerp(1, 1.1, u), zmax), CX, TOP + 80, sahne);
      not(c, T, t, 20.8, CX, TOP - 50, 700, TOP - 160, "KABARIK", p.tehlike);
      if (t > 22.44) yasak(c, T, 875, TOP + 680 > s.alan.alt - 100 ? s.alan.alt - 100 : TOP + 680, back(seg(t, 22.44, 22.7)));
    }
    baslik(c, T, t, 18.8, "KONTROL", "KABARIKSA", "YEME", p.tehlike, adim);
  }
  c.restore();
  cerceve(c, T, t, ANTET, adim, 5);
  altyazi(c, T, t, CAP);
  // in from the sheet colour, slow fade at the end
  const fade = Math.max(1 - seg(t, 0, 0.1), seg(t, DURATION / FPS - 0.6, DURATION / FPS));
  if (fade > 0) { c.save(); c.globalAlpha = fade; c.fillStyle = p.zemin2; c.fillRect(0, 0, 1080, 1920); c.restore(); }
};

const T0 = tema(SECIM.palet, SECIM.sekil, SECIM.altyazi);
const draw = (ctx: Ctx, f: number, env: Env) => { ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0); ciz(ctx, T0, SECIM.kompozisyon, f / FPS); };

export const kesitornek: Film = {
  meta: { title: "kesitornek", W: 1080, H: 1920, fps: FPS, bpm: 60, durationFrames: DURATION, kind: "story" },
  assets: { images: {} },
  shots: [{ id: "film", start: 0, end: DURATION, draw }],
};
