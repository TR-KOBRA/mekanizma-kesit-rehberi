import type { Ctx, Env } from "./core";
import type { Film } from "./film";
import { PALETLER, SEKILLER } from "./kesitTemalar";
import { ciz } from "./kesitornek";
import { tema } from "./kesitKit";

// The showcase: one frame per combination, so a single still.mjs call proves every theme.
// Frame order (araclar/vitrin.py reads the same order):
//   every shape x every palette at t = 14.4, then each shape in its own palette at t = 23.2,
//   then the three compositions, then the two lists at the end of the table below.
const P = Object.keys(PALETLER), S = Object.keys(SEKILLER);
type Kare = [string, string, string, number, string?];
const KARELER: Kare[] = [];
S.forEach((s) => P.forEach((p) => KARELER.push([p, s, "tam", 14.4])));
S.forEach((s) => KARELER.push([SEKILLER[s].varsayilan_palet, s, "tam", 23.2]));
KARELER.push(["prusya", "pafta", "tam", 14.4], ["okyanus", "pafta", "buyutec", 14.4], ["kiremit", "atlas", "ikiz", 23.2]);
// every shape through the film's turning points, then every shape in the two other compositions
S.forEach((s) => [1.9, 7.0, 10.6, 17.0, 18.25].forEach((t) => KARELER.push([SEKILLER[s].varsayilan_palet, s, "tam", t])));
S.forEach((s) => { KARELER.push([SEKILLER[s].varsayilan_palet, s, "buyutec", 14.4], [SEKILLER[s].varsayilan_palet, s, "ikiz", 23.2]); });
// the plateless outlined caption, on a dark and a light palette
KARELER.push(["prusya", "pafta", "tam", 14.4, "kontur"], ["eskikagit", "pafta", "tam", 14.4, "kontur"]);

const draw = (ctx: Ctx, f: number, env: Env) => {
  const [p, s, k, t, a] = KARELER[Math.min(f, KARELER.length - 1)];
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  ciz(ctx, tema(p, s, a), k, t);
};

export const kesitvitrin: Film = {
  meta: { title: "kesitvitrin", W: 1080, H: 1920, fps: 30, bpm: 60, durationFrames: KARELER.length, kind: "story" },
  assets: { images: {} },
  shots: [{ id: "film", start: 0, end: KARELER.length, draw }],
};
