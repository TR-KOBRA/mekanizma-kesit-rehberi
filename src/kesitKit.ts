import type { Ctx } from "./core";
import { PALETLER, SEKILLER } from "./kesitTemalar";

// Mechanism cutaway kit. Everything a film needs that does not depend on its subject: the sheet,
// frame, headline, caption, callouts, gauge, magnifier. Colours and shapes come from the theme
// tables (temalar/*.json), so one film renders in any palette x shape without new drawing code.
// Every function is a pure function of time: no Math.random, no ctx.filter (see the engine contract).

export type Palet = {
  ad: string; koyu: boolean; hissi: string;
  zemin: string; zemin2: string; isik: string; murekkep: string; cizgi: string; vurgu: string;
  dolgu: string; dolgu2: string; dolgu3: string; detay: string; metal: string; conta: string; buhar: string;
  tehlike: string; tamam: string; uyari_zemin: string; uyari_isik: string; yazi_zemin: string; yazi: string; yazi_vurgu: string;
};
export type Sekil = {
  ad: string; uyum: string; varsayilan_palet: string; ne_zaman: string;
  zemin: string; cerceve: string; alan: { ust: number; alt: number };
  baslik: { tip: string; font: string; boyut: number };
  altyazi: { tip: string; font: string; boyut: number; y: number };
  cizgi: { kalinlik: number; titreme: number; parlama: number };
  dolgu: string; not: string;
};
export type Tema = { p: Palet; s: Sekil };
export type Secim = { palet: string; sekil: string; kompozisyon: string; altyazi?: string };
export type Antet = { parca: string; no: string; olcek?: string };
// a caption line: [start, end, words[start, text, accent?]]
export type Satir = [number, number, [number, string, boolean?][]];

export const tema = (palet: string, sekil: string, altyazi?: string): Tema => {
  const p = PALETLER[palet], s = SEKILLER[sekil];
  if (!p) throw new Error(`palet yok: ${palet}`);
  if (!s) throw new Error(`sekil yok: ${sekil}`);
  return { p, s: altyazi ? { ...s, altyazi: { ...s.altyazi, tip: altyazi } } : s };
};

// ---------------------------------------------------------------- timing and small maths
export const cl = (x: number) => Math.max(0, Math.min(1, x));
export const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
export const eo = (x: number) => 1 - Math.pow(1 - x, 3);
export const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const back = (x: number) => { const k = 1.9; return 1 + (k + 1) * Math.pow(x - 1, 3) + k * Math.pow(x - 1, 2); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const ra = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
const yuvarlak = (c: Ctx, x: number, y: number, w: number, h: number, r: number) => { c.beginPath(); (c as any).roundRect(x, y, w, h, r); };

// ---------------------------------------------------------------- the pen: every outline goes through here
// titreme: a second, slightly displaced pass that changes six times a second (hand-drawn boil).
// parlama: phosphor glow. Both are off for the ruled shapes.
export const kalem = (c: Ctx, T: Tema, t: number, yol: () => void, renk: string, en: number) => {
  const { kalinlik, titreme, parlama } = T.s.cizgi;
  c.save(); c.strokeStyle = renk; c.lineWidth = en * kalinlik; c.lineJoin = "round"; c.lineCap = "round";
  if (parlama > 0) { c.shadowColor = renk; c.shadowBlur = parlama; }
  yol(); c.stroke();
  if (titreme > 0) {
    const k = Math.floor(t * 6);
    c.globalAlpha = 0.55; c.translate((hash(k) - 0.5) * titreme * 2.4, (hash(k + 9) - 0.5) * titreme * 2.4); c.rotate((hash(k + 3) - 0.5) * 0.0016);
    yol(); c.stroke();
  }
  c.restore();
};

// ---------------------------------------------------------------- the fill: how the warm subject is coloured
// call inside a clip. yol() traces the filled region, y0..y1 is its vertical extent.
export const doldur = (c: Ctx, T: Tema, yol: () => void, x0: number, x1: number, y0: number, y1: number) => {
  const { p, s } = T;
  c.save(); yol();
  if (s.dolgu === "kademeli") {
    const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, p.dolgu3); g.addColorStop(0.5, p.dolgu); g.addColorStop(1, p.dolgu2);
    c.fillStyle = g; c.fill();
  } else if (s.dolgu === "duz") {
    c.fillStyle = p.dolgu; c.fill(); c.clip();
    c.fillStyle = p.dolgu2; c.fillRect(x0, lerp(y0, y1, 0.72), x1 - x0, y1 - y0);
    c.fillStyle = p.dolgu3; c.fillRect(x0, y0 - 12, x1 - x0, 26);
  } else if (s.dolgu === "tarama") {
    c.fillStyle = ra(p.dolgu, 0.16); c.fill(); c.clip();
    c.strokeStyle = p.dolgu; c.lineWidth = 3.2; c.beginPath();
    for (let x = x0 - (y1 - y0); x < x1; x += 15) { c.moveTo(x, y1); c.lineTo(x + (y1 - y0), y0); }
    c.stroke();
  } else {
    c.fillStyle = ra(p.dolgu, 0.24); c.fill(); c.clip();
    c.fillStyle = p.dolgu;
    let i = 0;
    for (let y = y0; y < y1; y += 15) { i++; for (let x = x0 + (i % 2) * 8; x < x1; x += 16) { c.beginPath(); c.arc(x, y, lerp(1.6, 7.6, (y - y0) / (y1 - y0)), 0, 7); c.fill(); } }
  }
  c.restore();
};

// ---------------------------------------------------------------- ground
export const zemin = (c: Ctx, T: Tema, t: number, uyari = false) => {
  const { p, s } = T, ana = uyari ? p.uyari_zemin : p.zemin, isik = uyari ? p.uyari_isik : p.isik;
  const g = c.createRadialGradient(540, 820, 120, 540, 960, 1250);
  g.addColorStop(0, isik); g.addColorStop(0.6, ana); g.addColorStop(1, uyari ? ana : p.zemin2);
  c.fillStyle = s.zemin === "ikiton" || s.zemin === "duz" ? ana : g; c.fillRect(0, 0, 1080, 1920);
  const kay = (t * 5) % 60;
  if (s.zemin === "izgara") {
    c.lineWidth = 1; c.strokeStyle = ra(p.cizgi, 0.1); c.beginPath();
    for (let x = -60 + kay; x < 1140; x += 60) { c.moveTo(x, 0); c.lineTo(x, 1920); }
    for (let y = -60 + kay; y < 1980; y += 60) { c.moveTo(0, y); c.lineTo(1080, y); }
    c.stroke();
    const kay2 = (t * 5) % 300;
    c.lineWidth = 2; c.strokeStyle = ra(p.cizgi, 0.18); c.beginPath();
    for (let x = -300 + kay2; x < 1380; x += 300) { c.moveTo(x, 0); c.lineTo(x, 1920); }
    for (let y = -300 + kay2; y < 2220; y += 300) { c.moveTo(0, y); c.lineTo(1080, y); }
    c.stroke();
  } else if (s.zemin === "kareli") {
    c.lineWidth = 1.5; c.strokeStyle = ra(p.cizgi, 0.22); c.beginPath();
    for (let x = 0; x < 1080; x += 45) { c.moveTo(x, 0); c.lineTo(x, 1920); }
    for (let y = 0; y < 1920; y += 45) { c.moveTo(0, y); c.lineTo(1080, y); }
    c.stroke();
  } else if (s.zemin === "nokta") {
    c.fillStyle = ra(p.cizgi, 0.2);
    for (let x = 30; x < 1080; x += 40) for (let y = 30; y < 1920; y += 40) c.fillRect(x, y, 3, 3);
  } else if (s.zemin === "ikiton") {
    c.fillStyle = p.yazi_zemin; c.fillRect(0, 0, 1080, s.alan.ust - 16); c.fillRect(0, s.alan.alt + 20, 1080, 1920);
    c.fillStyle = uyari ? p.tehlike : p.vurgu; c.fillRect(0, s.alan.ust - 16, 1080, 12); c.fillRect(0, s.alan.alt + 8, 1080, 12);
  } else if (s.zemin === "panel") {
    c.fillStyle = ra(p.murekkep, p.koyu ? 0.06 : 0.04); yuvarlak(c, 44, 44, 992, 1832, 44); c.fill();
  }
};

// ---------------------------------------------------------------- frame and foot
export const cerceve = (c: Ctx, T: Tema, t: number, antet: Antet, adim = 0, toplam = 0) => {
  const { p, s } = T;
  if (s.cerceve === "pafta") {
    c.strokeStyle = ra(p.murekkep, 0.7); c.lineWidth = 3; c.strokeRect(36, 36, 1008, 1848);
    c.lineWidth = 1.5; c.strokeRect(46, 46, 988, 1828);
    c.strokeStyle = ra(p.murekkep, 0.5); c.beginPath();
    for (let i = 1; i < 12; i++) { const x = 36 + i * 84; c.moveTo(x, 36); c.lineTo(x, 46); c.moveTo(x, 1874); c.lineTo(x, 1884); }
    for (let i = 1; i < 22; i++) { const y = 36 + i * 84; c.moveTo(36, y); c.lineTo(46, y); c.moveTo(1034, y); c.lineTo(1044, y); }
    c.stroke();
    c.strokeStyle = ra(p.murekkep, 0.55); c.lineWidth = 2; c.strokeRect(46, 1760, 988, 114);
    c.beginPath(); c.moveTo(620, 1760); c.lineTo(620, 1874); c.moveTo(830, 1760); c.lineTo(830, 1874); c.stroke();
    c.textBaseline = "alphabetic"; c.textAlign = "left";
    c.fillStyle = p.cizgi; c.font = `600 19px Consolas, monospace`;
    c.fillText("PARÇA", 66, 1792); c.fillText("ÖLÇEK", 640, 1792); c.fillText("PAFTA", 850, 1792);
    c.fillStyle = p.murekkep; c.font = `700 32px Consolas, monospace`;
    c.fillText(antet.parca, 66, 1840); c.fillText(antet.olcek ?? "ŞEMA", 640, 1840); c.fillText(antet.no, 850, 1840);
  } else if (s.cerceve === "defter") {
    c.strokeStyle = ra(p.vurgu, 0.55); c.lineWidth = 3; c.beginPath(); c.moveTo(118, 0); c.lineTo(118, 1920); c.stroke();
    for (let i = 0; i < 6; i++) { const y = 200 + i * 310; c.fillStyle = p.zemin2; c.beginPath(); c.arc(58, y, 22, 0, 7); c.fill(); c.strokeStyle = ra(p.cizgi, 0.5); c.lineWidth = 2; c.stroke(); }
    c.fillStyle = p.cizgi; c.font = `700 30px "Segoe Print", sans-serif`; c.textAlign = "right"; c.textBaseline = "alphabetic"; c.fillText(antet.no, 1020, 1860);
  } else if (s.cerceve === "patent") {
    c.strokeStyle = p.murekkep; c.lineWidth = 2; c.strokeRect(54, 54, 972, 1812);
    c.fillStyle = p.murekkep; c.font = `italic 700 34px Georgia, serif`; c.textAlign = "center"; c.textBaseline = "alphabetic"; c.fillText(antet.parca, 540, 1810);
    c.font = `italic 26px Georgia, serif`; c.fillStyle = p.cizgi; c.fillText(antet.no, 540, 1846);
  } else if (s.cerceve === "hud") {
    c.save(); c.shadowColor = p.vurgu; c.shadowBlur = 10; c.strokeStyle = p.vurgu; c.lineWidth = 5; c.beginPath();
    [[46, 46, 1, 1], [1034, 46, -1, 1], [46, 1874, 1, -1], [1034, 1874, -1, -1]].forEach(([x, y, a, b]) => { c.moveTo(x + a * 90, y); c.lineTo(x, y); c.lineTo(x, y + b * 90); });
    c.stroke(); c.restore();
    c.strokeStyle = ra(p.cizgi, 0.55); c.lineWidth = 2; c.beginPath();
    for (let i = 0; i < 30; i++) { const y = 240 + i * 42, u = i % 5 === 0 ? 24 : 12; c.moveTo(1034, y); c.lineTo(1034 - u, y); }
    c.stroke();
    // the live trace along the foot: never still, so the sheet never looks frozen
    c.save(); c.shadowColor = p.vurgu; c.shadowBlur = 12; c.strokeStyle = p.vurgu; c.lineWidth = 4; c.beginPath();
    for (let x = 80; x <= 1000; x += 6) { const y = 1785 + Math.sin(x * 0.035 + t * 7) * 30 * Math.sin(x * 0.0034 + t * 0.8); if (x === 80) c.moveTo(x, y); else c.lineTo(x, y); }
    c.stroke(); c.restore();
    c.fillStyle = p.cizgi; c.font = `700 26px Consolas, monospace`; c.textAlign = "left"; c.textBaseline = "alphabetic";
    c.fillText(`T+${t.toFixed(1).padStart(4, "0")} SN`, 80, 1858); c.textAlign = "right"; c.fillText(antet.no, 1000, 1858);
  } else if (s.cerceve === "kart") {
    c.strokeStyle = ra(p.cizgi, 0.5); c.lineWidth = 3; yuvarlak(c, 44, 44, 992, 1832, 44); c.stroke();
    if (toplam > 0) {
      const w = 880 / toplam;
      for (let i = 0; i < toplam; i++) {
        yuvarlak(c, 100 + i * w, 1770, w - 14, 18, 9);
        c.fillStyle = i < adim ? p.vurgu : ra(p.cizgi, 0.25); c.fill();
      }
    }
    c.fillStyle = p.cizgi; c.font = `700 26px "Segoe UI", sans-serif`; c.textAlign = "left"; c.textBaseline = "alphabetic"; c.fillText(antet.parca, 100, 1838);
  }
};

// ---------------------------------------------------------------- headline: tag above, two parts, the second in colour
const sigdir = (c: Ctx, en: number, yazi: string) => { const w = c.measureText(yazi).width; return w > en ? en / w : 1; };
export const baslik = (c: Ctx, T: Tema, t: number, t0: number, etiket: string, a: string, b: string, renk?: string, adim = 0) => {
  const { p, s } = T, B = s.baslik, pop = back(seg(t, t0, t0 + 0.28)), q = seg(t, t0, t0 + 0.2), vurgu = renk ?? p.vurgu;
  c.save(); c.globalAlpha = q; c.textBaseline = "alphabetic"; c.lineJoin = "round";
  const f = (w: number, boyut = B.boyut) => `${w} ${boyut}px ${B.font}`;

  if (B.tip === "blok") {
    c.fillStyle = vurgu; c.beginPath(); c.arc(92, 127, 9, 0, 7); c.fill();
    c.fillStyle = p.cizgi; c.font = `700 32px Consolas, monospace`; c.textAlign = "left"; c.fillText(etiket, 114, 138);
    c.translate(84, 245); c.scale(lerp(0.86, 1, pop), lerp(0.86, 1, pop));
    c.font = f(900); const w = c.measureText(a + " ").width, k = sigdir(c, 912, a + " " + b); c.scale(k, k);
    c.lineWidth = 12; c.strokeStyle = p.koyu ? p.zemin2 : p.isik; c.strokeText(a, 0, 0); c.strokeText(b, w, 0);
    c.fillStyle = p.murekkep; c.fillText(a, 0, 0); c.fillStyle = vurgu; c.fillText(b, w, 0);
  } else if (B.tip === "marker") {
    c.fillStyle = p.cizgi; c.font = `700 32px ${B.font}`; c.textAlign = "left"; c.fillText(etiket, 150, 130);
    c.translate(150, 240); c.rotate(-0.014); c.scale(lerp(0.9, 1, pop), lerp(0.9, 1, pop));
    c.font = f(700); const w = c.measureText(a + " ").width, k = sigdir(c, 850, a + " " + b); c.scale(k, k);
    const bw = c.measureText(b).width;
    c.fillStyle = ra(vurgu, 0.32); c.fillRect(w - 12, -B.boyut * 0.82, (bw + 24) * seg(t, t0 + 0.1, t0 + 0.45), B.boyut * 1.02);
    c.fillStyle = p.murekkep; c.fillText(a, 0, 0); c.fillText(b, w, 0);
  } else if (B.tip === "serif") {
    c.textAlign = "center"; c.fillStyle = p.cizgi; c.font = `italic 34px ${B.font}`; c.fillText(etiket, 540, 138);
    c.font = f(700); const yazi = a + " " + b, k = sigdir(c, 880, yazi); c.translate(540, 240); c.scale(k, k);
    const tw = c.measureText(yazi).width, aw = c.measureText(a + " ").width;
    c.textAlign = "left"; c.fillStyle = p.murekkep; c.fillText(a, -tw / 2, 0); c.fillStyle = vurgu; c.fillText(b, -tw / 2 + aw, 0);
    c.strokeStyle = p.murekkep; c.lineWidth = 2; const e = (tw / 2) * eo(seg(t, t0, t0 + 0.4)); c.beginPath(); c.moveTo(-e, 32); c.lineTo(e, 32); c.stroke();
  } else if (B.tip === "afis") {
    c.fillStyle = p.yazi; c.font = `700 30px Consolas, monospace`; c.textAlign = "left"; c.fillText(etiket, 64, 76);
    const satir = (yazi: string, y: number, col: string, gecik: number) => {
      const u = back(seg(t, t0 + gecik, t0 + gecik + 0.26));
      c.save(); c.translate(60, y); c.scale(lerp(0.9, 1, u), lerp(0.9, 1, u)); c.font = f(400); const k = sigdir(c, 960, yazi); c.scale(k, k); c.textAlign = "left"; c.fillStyle = col; c.fillText(yazi, 0, 0); c.restore();
    };
    satir(a, 232, p.yazi, 0); satir(b, 396, p.yazi_vurgu, 0.08);
  } else if (B.tip === "terminal") {
    c.shadowColor = vurgu; c.shadowBlur = 14;
    c.fillStyle = p.cizgi; c.font = `700 30px ${B.font}`; c.textAlign = "left"; c.fillText(`// ${etiket}`, 96, 138);
    const hepsi = a + " " + b, n = Math.ceil(hepsi.length * seg(t, t0, t0 + 0.45)), g = hepsi.slice(0, n);
    c.font = f(700); const k = sigdir(c, 880, "> " + hepsi); c.translate(96, 240); c.scale(k, k);
    const w0 = c.measureText("> ").width, wa = c.measureText(a + " ").width;
    c.fillStyle = vurgu; c.fillText(">", 0, 0);
    c.fillStyle = p.murekkep; c.fillText(g.slice(0, a.length), w0, 0);
    if (n > a.length + 1) { c.fillStyle = vurgu; c.fillText(g.slice(a.length + 1), w0 + wa, 0); }
    if (Math.floor(t * 3) % 2 === 0) { c.fillStyle = vurgu; c.fillRect(w0 + c.measureText(g).width + 10, -B.boyut * 0.72, 22, B.boyut * 0.76); }
  } else {
    // rozet: the step number in a coin, title beside it
    const u = back(seg(t, t0, t0 + 0.3));
    c.save(); c.translate(150, 190); c.scale(u, u); c.fillStyle = vurgu; c.beginPath(); c.arc(0, 0, 62, 0, 7); c.fill();
    c.fillStyle = p.zemin2; c.font = `900 70px ${B.font}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(adim > 0 ? String(adim) : "?", 0, 4); c.restore();
    c.fillStyle = p.cizgi; c.font = `700 30px "Segoe UI", sans-serif`; c.textAlign = "left"; c.textBaseline = "alphabetic"; c.fillText(etiket, 238, 142);
    c.font = f(900); const w = c.measureText(a + " ").width, k = sigdir(c, 750, a + " " + b); c.translate(236, 234); c.scale(k, k);
    c.fillStyle = p.murekkep; c.fillText(a, 0, 0); c.fillStyle = vurgu; c.fillText(b, w, 0);
  }
  c.restore();
};

// ---------------------------------------------------------------- caption: lower band, word by word, always readable
export const altyazi = (c: Ctx, T: Tema, t: number, satirlar: Satir[]) => {
  const L = satirlar.find((l) => t >= l[0] && t < l[1]); if (!L) return;
  const { p, s } = T, A = s.altyazi, a = seg(t, L[0], L[0] + 0.1) * (1 - seg(t, L[1] - 0.08, L[1]));
  c.save(); c.globalAlpha = a; c.textBaseline = "middle"; c.textAlign = "left";
  const kalin = A.tip === "sade" ? 700 : A.tip === "kagit" ? 700 : 800;
  c.font = `${kalin} ${A.boyut}px ${A.font}`;
  const sinir = A.tip === "serit" ? 940 : 790, sp = c.measureText(" ").width;
  const rows: { w: string; s: number; acc?: boolean; x: number }[][] = [[]]; let x = 0;
  L[2].forEach(([st, w, acc]) => { const ww = c.measureText(w).width; if (x + ww > sinir) { rows.push([]); x = 0; } rows[rows.length - 1].push({ w, s: st, acc, x }); x += ww + sp; });
  const lh = A.boyut * 1.3, widths = rows.map((r) => { const l = r[r.length - 1]; return l.x + c.measureText(l.w).width; }), W = Math.max(...widths);
  const top = A.y - (rows.length * lh) / 2;
  // a caption plate is always the light one: dark plates were rejected, so light palettes use their own paper
  const plaka = p.koyu ? p.yazi_zemin : p.isik;
  let renk = p.yazi, acc = p.yazi_vurgu;
  if ((A.tip === "kutu" || A.tip === "hap") && !p.koyu) { renk = p.murekkep; acc = p.vurgu; }
  if (A.tip === "kontur") { renk = p.murekkep; acc = p.vurgu; }
  if (A.tip === "kutu") { c.fillStyle = plaka; yuvarlak(c, 540 - W / 2 - 36, top - 16, W + 72, rows.length * lh + 32, 16); c.fill(); c.strokeStyle = p.zemin; c.lineWidth = 3; c.stroke(); }
  else if (A.tip === "hap") { c.fillStyle = plaka; yuvarlak(c, 540 - W / 2 - 52, top - 20, W + 104, rows.length * lh + 40, Math.min(58, (rows.length * lh + 40) / 2)); c.fill(); }
  else if (A.tip === "kagit") {
    c.save(); c.translate(540, A.y); c.rotate(-0.008); c.fillStyle = p.isik; c.strokeStyle = ra(p.cizgi, 0.45); c.lineWidth = 2;
    c.fillRect(-W / 2 - 36, -(rows.length * lh) / 2 - 18, W + 72, rows.length * lh + 36); c.strokeRect(-W / 2 - 36, -(rows.length * lh) / 2 - 18, W + 72, rows.length * lh + 36);
    c.fillStyle = ra(p.vurgu, 0.4); c.fillRect(-70, -(rows.length * lh) / 2 - 36, 140, 34); c.restore();
    renk = p.murekkep; acc = p.vurgu;
  } else if (A.tip === "sade") {
    c.strokeStyle = p.murekkep; c.lineWidth = 1.5; c.beginPath(); c.moveTo(540 - W / 2, top - 14); c.lineTo(540 + W / 2, top - 14); c.moveTo(540 - W / 2, top + rows.length * lh + 14); c.lineTo(540 + W / 2, top + rows.length * lh + 14); c.stroke();
    renk = p.murekkep; acc = p.vurgu;
  } else if (A.tip === "terminal") {
    c.fillStyle = ra(p.zemin2, 0.94); c.strokeStyle = p.vurgu; c.lineWidth = 3; c.fillRect(540 - W / 2 - 34, top - 16, W + 68, rows.length * lh + 32); c.strokeRect(540 - W / 2 - 34, top - 16, W + 68, rows.length * lh + 32);
    renk = p.murekkep; acc = p.vurgu;
  }
  rows.forEach((r, i) => r.forEach((o) => {
    const on = t >= o.s, col = o.acc ? acc : renk;
    const x = 540 - widths[i] / 2 + o.x, y = top + lh * (i + 0.5);
    if (A.tip === "kontur") {
      // no plate: a thick outline carries the word over any picture
      c.save(); c.globalAlpha = a * (on ? 1 : 0.5); c.lineJoin = "round"; c.lineWidth = 12; c.strokeStyle = p.koyu ? p.zemin2 : p.isik; c.strokeText(o.w, x, y); c.fillStyle = col; c.fillText(o.w, x, y); c.restore();
      return;
    }
    c.fillStyle = on ? col : ra(renk, A.tip === "kagit" ? 0.35 : 0.3);
    c.fillText(o.w, x, y);
  }));
  c.restore();
};

// ---------------------------------------------------------------- callout with a leader that draws itself
export const not = (c: Ctx, T: Tema, t: number, t0: number, x: number, y: number, tx: number, ty: number, yazi: string, renk?: string) => {
  const u = eo(seg(t, t0, t0 + 0.3)); if (u <= 0) return;
  const { p, s } = T, col = renk ?? p.vurgu;
  c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 3;
  c.beginPath(); c.arc(x, y, 7, 0, 7); c.fill();
  c.beginPath(); c.moveTo(x, y); c.lineTo(lerp(x, tx, u), lerp(y, ty, u)); c.stroke();
  if (u > 0.6) {
    c.globalAlpha = seg(u, 0.6, 1); c.font = `700 36px ${s.not === "sade" ? s.altyazi.font : "Consolas, monospace"}`; c.textBaseline = "middle"; c.textAlign = "left";
    const w = c.measureText(yazi).width, bx = tx < x ? tx - w - 28 : tx;
    if (s.not === "kutu") { c.fillStyle = p.zemin2; yuvarlak(c, bx, ty - 30, w + 28, 60, 8); c.fill(); c.lineWidth = 2.5; c.stroke(); }
    c.fillStyle = col; c.fillText(yazi, bx + 14, ty + 1);
  }
  c.restore();
};

// ---------------------------------------------------------------- reusable instruments
export const gosterge = (c: Ctx, T: Tema, t: number, x: number, y: number, r: number, v: number, etiket: string) => {
  const { p } = T;
  c.save(); c.fillStyle = p.zemin2; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  kalem(c, T, t, () => { c.beginPath(); c.arc(x, y, r, 0, 7); }, p.murekkep, 6);
  c.strokeStyle = p.cizgi; c.lineWidth = 3;
  for (let i = 0; i <= 10; i++) { const a = Math.PI * (0.75 + 1.5 * (i / 10)); c.beginPath(); c.moveTo(x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78); c.lineTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9); c.stroke(); }
  const a = Math.PI * (0.75 + 1.5 * v); c.strokeStyle = p.tehlike; c.lineWidth = 8; c.lineCap = "round"; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * r * 0.72, y + Math.sin(a) * r * 0.72); c.stroke();
  c.fillStyle = p.murekkep; c.beginPath(); c.arc(x, y, 11, 0, 7); c.fill();
  c.font = `700 25px Consolas, monospace`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = p.cizgi; c.fillText(etiket, x, y + r * 0.52); c.restore();
};
export const ok = (c: Ctx, x: number, y: number, boy: number, renk: string, en = 15) => {
  c.save(); c.translate(x, y); c.fillStyle = renk; c.strokeStyle = renk; c.lineWidth = en; c.lineCap = "round";
  c.beginPath(); c.moveTo(0, -boy); c.lineTo(0, -18); c.stroke();
  c.beginPath(); c.moveTo(0, 16); c.lineTo(-en * 1.9, -28); c.lineTo(en * 1.9, -28); c.closePath(); c.fill(); c.restore();
};
export const duman = (c: Ctx, T: Tema, t: number, x: number, y0: number, y1: number, en: number, adet: number, alfa: number, tohum = 0) => {
  c.save(); c.fillStyle = T.p.buhar;
  for (let i = 0; i < adet; i++) {
    const ph = (hash(i + tohum) + t * (0.28 + hash(i + 40) * 0.25)) % 1, sal = Math.sin(t * 2 + i) * 18;
    c.globalAlpha = alfa * Math.sin(ph * Math.PI); c.beginPath(); c.arc(x + (hash(i + 3 + tohum) - 0.5) * en + sal, lerp(y0, y1, ph), 9 + hash(i + 8) * 16, 0, 7); c.fill();
  }
  c.restore();
};
// the big sound word, with rings that leave it. Use it on a spoken sound, never as decoration.
export const patlama = (c: Ctx, T: Tema, t: number, t0: number, yazi: string, boyut: number, y: number) => {
  const { p, s } = T, u = seg(t, t0, t0 + 0.5), q = back(seg(t, t0, t0 + 0.2));
  c.save(); c.translate(540, y); c.scale(q, q); c.font = `900 ${boyut}px ${s.baslik.font}`; c.textAlign = "center"; c.textBaseline = "alphabetic"; c.lineJoin = "round";
  c.lineWidth = boyut / 8; c.strokeStyle = p.koyu ? p.zemin2 : p.isik; c.strokeText(yazi, 0, 0); c.fillStyle = p.vurgu; c.fillText(yazi, 0, 0); c.restore();
  c.save(); c.strokeStyle = p.vurgu; c.lineWidth = 7; c.globalAlpha = 1 - u;
  for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(540, y + 120, 100 + u * 240 + i * 46, Math.PI * 1.12, Math.PI * 1.88); c.stroke(); }
  c.restore();
};
// the magnifier: draws fn again, enlarged, inside a lens at (x, y), centred on (ox, oy)
export const buyutec = (c: Ctx, T: Tema, t: number, x: number, y: number, r: number, ox: number, oy: number, z: number, u: number, fn: () => void) => {
  if (u <= 0) return;
  const { p } = T;
  c.save(); c.globalAlpha = cl(u * 1.6);
  c.strokeStyle = p.vurgu; c.lineWidth = 3; c.setLineDash([12, 10]); c.beginPath(); c.moveTo(ox, oy); c.lineTo(lerp(ox, x, 0.86), lerp(oy, y, 0.86)); c.stroke(); c.setLineDash([]);
  c.save(); c.translate(x, y); c.scale(back(u), back(u)); c.translate(-x, -y);
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = p.zemin2; c.fill(); c.clip();
  c.translate(x, y); c.scale(z, z); c.translate(-ox, -oy); fn(); c.restore();
  kalem(c, T, t, () => { c.beginPath(); c.arc(x, y, r, 0, 7); }, p.vurgu, 11);
  c.strokeStyle = p.vurgu; c.lineWidth = 24; c.lineCap = "round"; c.beginPath(); c.moveTo(x + r * 0.72, y + r * 0.72); c.lineTo(x + r * 1.12, y + r * 1.12); c.stroke();
  c.restore(); c.restore();
};
export const kalkan = (c: Ctx, T: Tema, x: number, y: number, u: number) => {
  const { p } = T; c.save(); c.translate(x, y); c.scale(u, u); c.fillStyle = p.tamam; c.strokeStyle = p.zemin2; c.lineWidth = 8;
  c.beginPath(); c.moveTo(0, -84); c.lineTo(72, -56); c.lineTo(72, 10); c.quadraticCurveTo(66, 66, 0, 92); c.quadraticCurveTo(-66, 66, -72, 10); c.lineTo(-72, -56); c.closePath(); c.fill(); c.stroke();
  c.lineWidth = 15; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); c.moveTo(-32, 4); c.lineTo(-7, 30); c.lineTo(36, -24); c.stroke(); c.restore();
};
export const yasak = (c: Ctx, T: Tema, x: number, y: number, u: number) => {
  const { p } = T; c.save(); c.translate(x, y); c.scale(u, u); c.strokeStyle = p.tehlike; c.lineWidth = 19; c.fillStyle = ra(p.tehlike, 0.14);
  c.beginPath(); c.arc(0, 0, 92, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-65, -65); c.lineTo(65, 65); c.stroke(); c.restore();
};
export const buyut = (c: Ctx, z: number, px: number, py: number, fn: () => void) => { c.save(); c.translate(px, py); c.scale(z, z); c.translate(-px, -py); fn(); c.restore(); };
