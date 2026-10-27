// Fotótár: IndexedDB tárolás, képfeldolgozás, GPS, EXIF, mentés/visszaállítás.
// Minden adat a telefonon, a böngésző saját tárhelyén marad.

const DB_NEV = 'niki-fungi';
const DB_VERZIO = 1;
let dbIgeret = null;

function db() {
  if (!dbIgeret) {
    dbIgeret = new Promise((ok, hiba) => {
      const r = indexedDB.open(DB_NEV, DB_VERZIO);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('kep')) d.createObjectStore('kep');
        if (!d.objectStoreNames.contains('belyeg')) d.createObjectStore('belyeg');
      };
      r.onsuccess = () => ok(r.result);
      r.onerror = () => hiba(r.error);
    });
  }
  return dbIgeret;
}

const tr = async (tarak, mod, fn) => {
  const d = await db();
  return new Promise((ok, hiba) => {
    const t = d.transaction(tarak, mod);
    let eredmeny;
    Promise.resolve(fn(t)).then(e => { eredmeny = e; });
    t.oncomplete = () => ok(eredmeny);
    t.onerror = () => hiba(t.error);
    t.onabort = () => hiba(t.error || new Error('Megszakított tranzakció'));
  });
};

const kerest = r => new Promise((ok, hiba) => { r.onsuccess = () => ok(r.result); r.onerror = () => hiba(r.error); });

export async function osszesMeta() {
  return tr(['meta'], 'readonly', t => kerest(t.objectStore('meta').getAll()))
    .then(l => (l || []).sort((a, b) => b.datum - a.datum));
}

export async function ment(meta, kep, belyeg) {
  await tr(['meta', 'kep', 'belyeg'], 'readwrite', t => {
    t.objectStore('meta').put(meta);
    t.objectStore('kep').put(kep, meta.id);
    t.objectStore('belyeg').put(belyeg, meta.id);
  });
}

export async function torol(id) {
  await tr(['meta', 'kep', 'belyeg'], 'readwrite', t => {
    t.objectStore('meta').delete(id);
    t.objectStore('kep').delete(id);
    t.objectStore('belyeg').delete(id);
  });
  for (const tar of [belyegUrl, kepUrl]) {
    const u = tar.get(id);
    if (u) { URL.revokeObjectURL(u); tar.delete(id); }
  }
}

const belyegUrl = new Map();
const kepUrl = new Map();

async function blobUrl(tarNev, gyorsitotar, id) {
  if (gyorsitotar.has(id)) return gyorsitotar.get(id);
  const blob = await tr([tarNev], 'readonly', t => kerest(t.objectStore(tarNev).get(id)));
  if (!blob) return null;
  const u = URL.createObjectURL(blob);
  gyorsitotar.set(id, u);
  return u;
}

export const belyeg = id => blobUrl('belyeg', belyegUrl, id);
export const kep = id => blobUrl('kep', kepUrl, id);

// ---- Képfeldolgozás ----

function betoltKep(file) {
  return new Promise((ok, hiba) => {
    const u = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => ok({ img, u });
    img.onerror = () => { URL.revokeObjectURL(u); hiba(new Error('A képet nem sikerült megnyitni')); };
    img.src = u;
  });
}

function canvasBlob(img, maxOldal, minoseg) {
  const w0 = img.naturalWidth, h0 = img.naturalHeight;
  const a = Math.min(1, maxOldal / Math.max(w0, h0));
  const w = Math.max(1, Math.round(w0 * a)), h = Math.max(1, Math.round(h0 * a));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  // A modern böngészők az EXIF tájolást már az <img> rajzolásakor alkalmazzák.
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise((ok, hiba) => c.toBlob(b => b ? ok(b) : hiba(new Error('Kódolási hiba')), 'image/jpeg', minoseg));
}

export async function feldolgoz(file) {
  const { img, u } = await betoltKep(file);
  try {
    const nagy = await canvasBlob(img, 2000, 0.85);
    const kicsi = await canvasBlob(img, 480, 0.8);
    return { nagy, kicsi };
  } finally {
    URL.revokeObjectURL(u);
  }
}

export async function exifAdat(file) {
  const eredmeny = { datum: null, lat: null, lon: null };
  if (typeof window.exifr === 'undefined') return eredmeny;
  let puffer;
  try { puffer = await file.arrayBuffer(); } catch (e) { return eredmeny; }
  try {
    const gps = await window.exifr.gps(puffer);
    if (gps && isFinite(gps.latitude) && isFinite(gps.longitude) && !(gps.latitude === 0 && gps.longitude === 0)) {
      eredmeny.lat = gps.latitude;
      eredmeny.lon = gps.longitude;
    }
  } catch (e) { /* nincs GPS */ }
  try {
    const t = await window.exifr.parse(puffer, { tiff: true, exif: true, gps: false, ifd1: false, interop: false, xmp: false, icc: false, iptc: false, jfif: false, ihdr: false });
    const d = t && (t.DateTimeOriginal || t.CreateDate);
    if (d instanceof Date && !isNaN(d)) eredmeny.datum = d.getTime();
  } catch (e) { /* nincs EXIF */ }
  return eredmeny;
}

export function pozicio(idokorlat = 15000) {
  return new Promise(ok => {
    if (!('geolocation' in navigator)) return ok({ hiba: 'nincs' });
    navigator.geolocation.getCurrentPosition(
      p => ok({ lat: p.coords.latitude, lon: p.coords.longitude, pont: p.coords.accuracy }),
      e => ok({ hiba: e.code === 1 ? 'tiltva' : 'nem' }),
      { enableHighAccuracy: true, timeout: idokorlat, maximumAge: 60000 }
    );
  });
}

export const ujId = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

export async function tartosTarolas() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      if (await navigator.storage.persisted()) return true;
      return await navigator.storage.persist();
    }
  } catch (e) { /* nem támogatott */ }
  return false;
}

export async function tarhely() {
  try {
    if (navigator.storage && navigator.storage.estimate) return await navigator.storage.estimate();
  } catch (e) { /* nem támogatott */ }
  return null;
}

// ---- Mentés / visszaállítás ----

const blobDataUrl = b => new Promise((ok, hiba) => {
  const r = new FileReader();
  r.onload = () => ok(r.result);
  r.onerror = () => hiba(r.error);
  r.readAsDataURL(b);
});

async function dataUrlBlob(s) {
  const r = await fetch(s);
  return r.blob();
}

export async function exportal(metaLista) {
  const fotok = [];
  for (const m of metaLista) {
    const [k, b] = await tr(['kep', 'belyeg'], 'readonly', t => Promise.all([
      kerest(t.objectStore('kep').get(m.id)),
      kerest(t.objectStore('belyeg').get(m.id))
    ]));
    if (!k) continue;
    fotok.push({ ...m, kep: await blobDataUrl(k), belyeg: b ? await blobDataUrl(b) : null });
  }
  const json = JSON.stringify({ app: 'niki-fungi', verzio: 1, keszult: new Date().toISOString(), fotok });
  return new Blob([json], { type: 'application/json' });
}

export async function importal(file, meglevoIdk) {
  const adat = JSON.parse(await file.text());
  if (!adat || adat.app !== 'niki-fungi' || !Array.isArray(adat.fotok)) throw new Error('Ez nem Niki fungi mentés.');
  let uj = 0, kihagyott = 0;
  for (const f of adat.fotok) {
    if (!f.id || !f.kep || meglevoIdk.has(f.id)) { kihagyott++; continue; }
    const k = await dataUrlBlob(f.kep);
    const b = f.belyeg ? await dataUrlBlob(f.belyeg) : k;
    const { kep: _k, belyeg: _b, ...meta } = f;
    await ment(meta, k, b);
    uj++;
  }
  return { uj, kihagyott };
}
