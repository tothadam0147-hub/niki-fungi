// Pontozás és termőidő-szöveg
import { NEMZETSEGEK, TERMOIDO, HONAPOK, KUSZOB, JEGY_SORREND } from './data.js';

// Súlyok: spórapor 4, lemez 3, gallér 3, bocskor 3, termőhely 2, kiegészítő jegy 2 (csak pozitív)
export function ertekel(x, v) {
  let p = 0, m = 0;
  const st = {};
  const q = (k, w, ok, egyertelmu) => {
    m += w;
    p += ok ? (egyertelmu ? w : w - 1) : -w;
    st[k] = ok;
  };
  if (v.s) q('s', 4, x.s.includes(v.s), true);
  if (v.l) q('l', 3, x.l.includes(v.l), x.l.length === 1);
  if (v.g) q('g', 3, x.g.includes(v.g), x.g.length === 1);
  if (v.b) q('b', 3, x.b.includes(v.b), x.b.length === 1);
  if (v.h) q('h', 2, v.h === 'fa' ? x.e.includes('f') : /[mt]/.test(x.e), true);
  const jm = [];
  for (const k of JEGY_SORREND) {
    if (!v.j.has(k)) continue;
    m += 2;
    if (x.j.includes(k)) { p += 2; jm.push(k); }
  }
  const bad = Object.values(st).filter(z => z === false).length;
  return { x, p, m, st, jm, bad, pct: m ? Math.round(Math.max(0, p) / m * 100) : null };
}

export const uresValasz = () => ({ s: null, l: null, g: null, b: null, h: null, j: new Set() });

export const vanValasz = v => !!(v.s || v.l || v.g || v.b || v.h || v.j.size);

export function rangsor(v) {
  const r = NEMZETSEGEK.map(x => ertekel(x, v));
  if (!vanValasz(v)) return r;
  return r.sort((a, b) => b.p - a.p || a.bad - b.bad || a.x.n.localeCompare(b.x.n, 'hu'));
}

export const aktualisHonap = () => new Date().getMonth() + 1;

export function termoidoSzoveg(nev) {
  const t = TERMOIDO[nev];
  if (!t) return '';
  const be = t.havi.map(x => x >= KUSZOB);
  if (be.every(Boolean)) return 'Terem: egész évben';
  let g = [], i = 0;
  while (i < 12) {
    if (be[i]) { let j = i; while (j < 11 && be[j + 1]) j++; g.push([i, j]); i = j + 1; } else i++;
  }
  if (g.length > 1 && g[0][0] === 0 && g[g.length - 1][1] === 11) {
    const l = g.pop();
    g[0] = [l[0], g[0][1]];
  }
  const csucs = t.havi.indexOf(Math.max(...t.havi));
  return 'Terem: ' + g.map(([a, b]) => a === b ? HONAPOK[a] : HONAPOK[a] + '–' + HONAPOK[b]).join(', ') + ' · csúcs: ' + HONAPOK[csucs];
}

export const szezonban = nev => {
  const t = TERMOIDO[nev];
  return !!t && t.havi[aktualisHonap() - 1] >= KUSZOB;
};

export function eletmodSzoveg(kod) {
  const r = [];
  if (kod.includes('M')) r.push('mikorrhiza');
  if (kod.includes('SZA')) {
    const hol = [];
    if (kod.includes('F')) hol.push('fán');
    if (kod.includes(', T')) hol.push('talajon');
    r.push('szaprotróf' + (hol.length ? ' (' + hol.join(', ') + ')' : ''));
  }
  return r.join(' / ');
}
