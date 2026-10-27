// Niki fungi app – fő modul
import { SPORA, KERDESEK, JEGYEK, JEGY_NEV, JEGY_ROVID, NEMZETSEGEK, OSZLOPOK, TERMOIDO, HONAPOK, KUSZOB, NEM_LEMEZES } from './data.js';
import { ertekel, rangsor, uresValasz, vanValasz, termoidoSzoveg, szezonban, eletmodSzoveg, aktualisHonap } from './logika.js';
import * as F from './fotok.js';
import { I, pinSvg } from './ikonok.js';

const VERZIO = '1.1';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tarol = {
  get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* privát mód */ } }
};

const A = {
  v: uresValasz(),
  osszecsukva: false,
  jegyekNyitva: false,
  tab: 'hat',
  kereses: '',
  fotMod: 'gal',
  terkepSzuro: null,
  kijelolt: null,
  fotok: [],
  cel: null,
  nezetN: null,
  nezetP: null
};

const spora = k => SPORA.find(s => s.k === k);
const nemzetseg = n => NEMZETSEGEK.find(x => x.n === n);
const nlCsoport = k => NEM_LEMEZES.find(c => c[0] === k) || NEM_LEMEZES[NEM_LEMEZES.length - 1];
const fotokNev = n => A.fotok.filter(f => !f.nemLemezes && f.nev === n);
const fotoSzamok = () => {
  const m = {};
  for (const f of A.fotok) if (!f.nemLemezes) m[f.nev] = (m[f.nev] || 0) + 1;
  return m;
};
const egyedi = l => [...new Set(l)];

const idoF = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
const idoTeljes = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
const napHo = ms => { const d = new Date(ms); return String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0'); };
const koord = f => f.lat == null ? 'Nincs helyadat'
  : `${Math.abs(f.lat).toFixed(5)}° ${f.lat >= 0 ? 'É' : 'D'}, ${Math.abs(f.lon).toFixed(5)}° ${f.lon >= 0 ? 'K' : 'Ny'}`;

// ---------- Közös elemek ----------

const pottyok = (s, nagy) => `<span class="pottyok${nagy ? ' nagy' : ''}">${[...s].map(k => `<span style="background:${spora(k).szin}"></span>`).join('')}</span>`;
const tag = (t, st) => `<span class="tag${st === true ? ' ok' : st === false ? ' no' : ''}">${esc(t)}</span>`;
const szezonSor = n => TERMOIDO[n] ? `<div class="szezon">${esc(termoidoSzoveg(n))}${szezonban(n) ? ' · most szezonban' : ''}</div>` : '';
const figy = (t = 'Nemzetség szintű egyezés, nem azonosítás. Fogyasztás előtt gombaszakellenőr!') => `<div class="figy">${I.figy}<span>${esc(t)}</span></div>`;

function kartya(r, pontozott, fotoszam) {
  const x = r.x;
  const ertekelt = pontozott && r.pct != null;
  const c = !ertekelt ? null : r.pct >= 80 ? 'var(--erdo)' : r.pct >= 50 ? 'var(--borostyan)' : 'var(--masod)';
  const gst = r.st.g === false || r.st.b === false ? false : (r.st.g || r.st.b) ? true : undefined;
  return `<div class="kartya" data-a="nyit-n" data-n="${esc(x.n)}">
    <div class="fejsor">${pottyok(x.s)}
      <div style="flex:1;min-width:0"><div class="nev">${esc(x.n)} <span class="latin">${esc(x.la)}</span></div>${szezonSor(x.n)}</div>
      ${fotoszam ? `<span class="fotoszam">${I.foto}${fotoszam}</span>` : ''}
      ${ertekelt ? `<span class="pct" style="color:${c}">${r.pct}%</span>` : ''}
    </div>
    ${ertekelt ? `<div class="csik"><div style="width:${r.pct}%;background:${c}"></div></div>` : ''}
    <div class="cimkek">
      ${tag('Spóra: ' + x.t[0], r.st.s)}${tag('Lemez: ' + x.t[1], r.st.l)}${tag('Kalap: ' + x.t[2])}${tag('Tönk: ' + x.t[3])}
      ${tag('Gallér/bocskor: ' + x.t[4], gst)}${tag(eletmodSzoveg(x.t[5]), r.st.h)}
      ${r.jm.map(k => tag(JEGY_NEV[k], true)).join('')}
    </div>
    ${pontozott && r.bad ? `<div class="ellent">${r.bad} ellentmondó jegy</div>` : ''}
  </div>`;
}

const belyegKep = f => `<button class="belyeg" data-a="nyit-p" data-id="${esc(f.id)}" aria-label="${esc(f.nev)} fotó, ${esc(idoF.format(f.datum))}"><img data-belyeg="${esc(f.id)}" alt=""><small>${napHo(f.datum)}</small></button>`;

async function toltBelyegek(gyoker) {
  for (const img of gyoker.querySelectorAll('img[data-belyeg]')) {
    const u = await F.belyeg(img.dataset.belyeg);
    if (u) img.src = u;
  }
}

// ---------- Üzenetsáv ----------

let uzenetIdo = null;
function uzenet(szoveg, { forog = false, tartos = false } = {}) {
  const u = $('#uzenet');
  clearTimeout(uzenetIdo);
  u.innerHTML = (forog ? '<span class="forog"></span>' : I.pipa) + `<span>${esc(szoveg)}</span>`;
  u.hidden = false;
  if (!tartos) uzenetIdo = setTimeout(() => { u.hidden = true; }, 2800);
}

// ---------- Fülsáv ----------

const FULEK = [['hat', 'Határozás', I.kereses], ['tab', 'Táblázat', I.tabla], ['fot', 'Fotótár', I.foto], ['inf', 'Útmutató', I.info]];

function renderTabbar() {
  const jelez = esedekes();
  $('#tabbar').innerHTML = FULEK.map(([k, n, ik]) =>
    `<button data-a="tab" data-t="${k}" class="${A.tab === k ? 'on' : ''}" aria-current="${A.tab === k ? 'page' : 'false'}"><span class="ikontarto">${ik}${k === 'fot' && jelez ? '<span class="jelzo" aria-label="Mentés esedékes"></span>' : ''}</span><span>${n}</span></button>`).join('');
}

// ---------- Határozás ----------

function kivalasztott() {
  const l = [];
  if (A.v.s) l.push(spora(A.v.s).nev);
  for (const q of KERDESEK) {
    if (!A.v[q.k]) continue;
    const opt = q.opciok.find(o => o[0] === A.v[q.k])[1];
    l.push(q.k === 'g' ? 'Gallér: ' + opt.toLowerCase() : q.k === 'b' ? 'Bocskor: ' + opt.toLowerCase() : opt);
  }
  for (const lista of Object.values(JEGYEK)) for (const [k, r] of lista) if (A.v.j.has(k)) l.push(r);
  return l;
}

function renderPanel() {
  const vv = vanValasz(A.v);
  let h = `<div class="fej"><h1>Határozás</h1>
    <button class="gomb-kicsi" data-a="torles" ${vv ? '' : 'disabled'}>Törlés</button>
    <button class="ikongomb" data-a="osszecsuk" aria-label="${A.osszecsukva ? 'Panel kinyitása' : 'Panel összecsukása'}">${A.osszecsukva ? I.le : I.fel}</button></div>`;
  if (A.osszecsukva) {
    const l = kivalasztott();
    h += `<div style="margin-top:8px">${l.length ? `<div class="chips">${l.map(s => `<button class="ch on" data-a="osszecsuk">${esc(s)}</button>`).join('')}</div>`
      : '<span class="halk">Nincs kiválasztott jellemző</span>'}</div>`;
  } else {
    h += `<p class="lbl" style="margin-top:10px">Spórapor színe</p><div class="sporak">${SPORA.map(s =>
      `<button data-a="spora" data-v="${s.k}" class="${A.v.s === s.k ? 'on' : ''}" aria-pressed="${A.v.s === s.k}" aria-label="Spórapor: ${esc(s.nev)}"><div class="potty" style="background:${s.szin}"></div>${s.rovid}</button>`).join('')}</div>`;
    for (const q of KERDESEK) {
      h += `<div class="sor"><p class="lbl">${q.nev}</p><div class="chips">${q.opciok.map(([k, n]) =>
        `<button class="ch ${A.v[q.k] === k ? 'on' : ''}" data-a="valasz" data-k="${q.k}" data-v="${k}" aria-pressed="${A.v[q.k] === k}">${n}</button>`).join('')}</div></div>`;
    }
    h += `<button class="lenyit" data-a="jegyek"><span>További jegyek${A.v.j.size ? ` <span class="halk">· ${A.v.j.size}</span>` : ''}</span>${A.jegyekNyitva ? I.fel : I.le}</button>`;
    if (A.jegyekNyitva) {
      h += `<div class="jegyek-tarto">${Object.entries(JEGYEK).map(([kat, l]) =>
        `<div class="sor"><p class="lbl">${kat}</p><div class="chips">${l.map(([k, r]) =>
          `<button class="ch ${A.v.j.has(k) ? 'on' : ''}" data-a="jegy" data-v="${k}" aria-pressed="${A.v.j.has(k)}">${r}</button>`).join('')}</div></div>`).join('')}</div>`;
    }
  }
  const p = $('#panel');
  const tarto = p.querySelector('.jegyek-tarto');
  const gorgetes = tarto ? tarto.scrollTop : 0;
  p.innerHTML = h;
  const uj = p.querySelector('.jegyek-tarto');
  if (uj) uj.scrollTop = gorgetes;
}

function renderRangsor() {
  const vv = vanValasz(A.v);
  const sz = fotoSzamok();
  $('#rangsor').innerHTML = `<div class="sorfej"><b>Rangsor</b><span class="halk">${vv ? '28 nemzetség, egyezés szerint' : '28 nemzetség'}</span></div>`
    + rangsor(A.v).map(r => kartya(r, true, sz[r.x.n])).join('');
}

function renderHat() {
  const t = $('#tab-hat');
  if (!t.firstChild) t.innerHTML = '<div class="panel" id="panel"></div><div class="belso" id="rangsor"></div>';
  renderPanel();
  renderRangsor();
}

// ---------- Táblázat ----------

function renderTabLista() {
  const k = A.kereses.trim().toLowerCase();
  const f = NEMZETSEGEK.filter(x => !k || (x.n + ' ' + x.la + ' ' + x.t.join(' ')).toLowerCase().includes(k));
  const sz = fotoSzamok();
  const u = uresValasz();
  $('#tab-lista').innerHTML = SPORA.map(s => {
    const g = f.filter(x => x.s[0] === s.k);
    if (!g.length) return '';
    return `<div class="szakaszcim"><span class="kor" style="background:${s.szin}"></span>Spórapor: ${esc(s.nev)}</div>`
      + g.map(x => kartya(ertekel(x, u), false, sz[x.n])).join('');
  }).join('') || '<p class="ures">Nincs találat</p>';
}

function renderTab() {
  const t = $('#tab-tab');
  if (!t.firstChild) {
    t.innerHTML = `<div class="fejlec" style="flex-direction:column;align-items:stretch;gap:8px;padding-left:0;padding-right:0">
        <h1 style="padding:0 12px">Táblázat</h1>
        <label class="kereso">${I.kereses}<input id="kereses" type="search" placeholder="Név vagy jellemző, pl. lefutó" autocomplete="off" enterkeyhint="search" aria-label="Keresés"></label>
      </div><div class="belso" id="tab-lista"></div>`;
    $('#kereses').addEventListener('input', e => { A.kereses = e.target.value; renderTabLista(); });
  }
  renderTabLista();
}

// ---------- Fotótár ----------

let terkep = null, terkepReteg = null, sajatHelyJel = null;
const terkepDiv = document.createElement('div');
terkepDiv.className = 'terkep';

const tileReteg = () => L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

const pinIkon = (f, kijelolt) => L.divIcon({
  className: 'pin',
  html: pinSvg(f.nemLemezes ? (kijelolt ? '#633806' : '#BA7517') : (kijelolt ? '#173404' : '#3B6D11')),
  iconSize: [30, 38],
  iconAnchor: [15, 38]
});

function terkepInit() {
  if (terkep || typeof L === 'undefined') return;
  terkep = L.map(terkepDiv, { zoomControl: false, attributionControl: true });
  terkep.attributionControl.setPrefix(false);
  tileReteg().addTo(terkep);
  L.control.zoom({ position: 'bottomright', zoomInTitle: 'Nagyítás', zoomOutTitle: 'Kicsinyítés' }).addTo(terkep);
  const Sajat = L.Control.extend({
    onAdd() {
      const b = L.DomUtil.create('button', 'ikongomb');
      b.style.cssText = 'background:var(--blokk);box-shadow:0 1px 4px rgba(0,0,0,.3);width:36px;height:36px';
      b.innerHTML = I.celpont;
      b.title = 'Saját hely';
      b.setAttribute('aria-label', 'Saját hely');
      L.DomEvent.disableClickPropagation(b);
      b.onclick = async () => {
        const p = await F.pozicio(10000);
        if (p.lat == null) { uzenet(p.hiba === 'tiltva' ? 'A helyhozzáférés le van tiltva' : 'A pozíció nem érhető el'); return; }
        if (sajatHelyJel) sajatHelyJel.remove();
        sajatHelyJel = L.circleMarker([p.lat, p.lon], { radius: 7, color: '#fff', weight: 2, fillColor: '#185FA5', fillOpacity: 1 }).addTo(terkep);
        terkep.setView([p.lat, p.lon], Math.max(terkep.getZoom(), 14));
      };
      return b;
    }
  });
  new Sajat({ position: 'topright' }).addTo(terkep);
  terkepReteg = L.layerGroup().addTo(terkep);
}

function terkepFrissit(pontok, igazit) {
  terkepInit();
  if (!terkep) return;
  terkepReteg.clearLayers();
  for (const f of pontok) {
    L.marker([f.lat, f.lon], { icon: pinIkon(f, f.id === A.kijelolt), title: f.nev, keyboard: true })
      .on('click', () => { A.kijelolt = f.id; terkepFrissit(pontok, false); renderTerkepAlja(pontok); })
      .addTo(terkepReteg);
  }
  requestAnimationFrame(() => {
    terkep.invalidateSize();
    if (!igazit) return;
    if (!pontok.length) terkep.setView([47.16, 19.5], 7);
    else if (pontok.length === 1) terkep.setView([pontok[0].lat, pontok[0].lon], 15);
    else terkep.fitBounds(L.latLngBounds(pontok.map(f => [f.lat, f.lon])), { padding: [40, 40], maxZoom: 16 });
  });
}

function renderTerkepAlja(pontok) {
  const el = $('#terkep-alja');
  if (!el) return;
  const sp = pontok.find(f => f.id === A.kijelolt);
  el.innerHTML = !pontok.length ? '<p class="halk" style="margin:8px 4px">Ehhez a szűréshez nincs helyadattal rendelkező fotó.</p>'
    : sp ? `<div class="kartya elonezet" data-a="nyit-p" data-id="${esc(sp.id)}"><img data-belyeg="${esc(sp.id)}" alt="">
        <div style="flex:1;min-width:0"><div class="nev">${esc(sp.nev)}</div><div style="font-size:14px">${idoF.format(sp.datum)}</div><div class="halk">${koord(sp)}</div></div>
        <span style="width:18px;color:var(--halk)">${I.jobbra}</span></div>`
    : '<p class="halk" style="margin:8px 4px">Koppints egy tűre a részletekhez.</p>';
  toltBelyegek(el);
}

function fotoCsoport(nev, fotok) {
  const f0 = fotok[0];
  let fej;
  if (f0.nemLemezes) {
    const [k, cn] = nlCsoport(f0.csoport);
    fej = `<div class="csopfej"><span class="ikonkor">${I[k]}</span><div style="flex:1;min-width:0"><div class="nev" style="font-size:16px;font-weight:600">${esc(nev)}</div><div class="szezon">${esc(cn)} · nem lemezes</div></div><span class="halk">${fotok.length} fotó</span></div>`;
  } else {
    const x = nemzetseg(nev);
    fej = `<button class="csopfej" data-a="nyit-n" data-n="${esc(nev)}">${x ? pottyok(x.s) : ''}<div style="flex:1;min-width:0"><div style="font-size:16px;font-weight:600">${esc(nev)}</div>${szezonSor(nev)}</div><span class="halk">${fotok.length} fotó</span><span class="nyil">${I.jobbra}</span></button>`;
  }
  return `<div class="blk">${fej}<div class="racs">${fotok.map(belyegKep).join('')}</div></div>`;
}

function renderFot() {
  const t = $('#tab-fot');
  const nl = A.fotok.filter(f => f.nemLemezes).length;
  const L1 = egyedi(A.fotok.filter(f => !f.nemLemezes).map(f => f.nev));
  const N1 = egyedi(A.fotok.filter(f => f.nemLemezes).map(f => f.nev));
  let h = `<div class="fejlec"><h1>Fotótár</h1>
      <button class="ikongomb" data-a="mentes-lap" aria-label="Mentés és visszaállítás">${I.mentes}</button>
      <button class="zold-gomb" data-a="nemlemezes">${I.plusz}Nem lemezes</button></div>
    <div class="belso"><div class="halk" style="margin:0 4px">${A.fotok.length} fotó · ${A.fotok.length - nl} lemezes, ${nl} nem lemezes</div>
    ${mentesSav()}
    <div class="szegmens" role="tablist"><button data-a="fot-mod" data-m="gal" class="${A.fotMod === 'gal' ? 'on' : ''}" role="tab" aria-selected="${A.fotMod === 'gal'}">Galéria</button><button data-a="fot-mod" data-m="map" class="${A.fotMod === 'map' ? 'on' : ''}" role="tab" aria-selected="${A.fotMod === 'map'}">Térkép</button></div>
    <div id="fot-tartalom"></div></div>`;
  t.innerHTML = h;
  const c = $('#fot-tartalom');
  if (!A.fotok.length) {
    c.innerHTML = `<div class="blk ures">${I.kamera}Nyiss meg egy nemzetséget, és add hozzá az első fotódat – vagy rögzíts egy nem lemezes gombát a „Nem lemezes” gombbal.</div>`;
    return;
  }
  if (A.fotMod === 'gal') {
    c.innerHTML = (L1.length ? `<div class="szakaszcim">${I.lista}Lemezes nemzetségek</div>` + L1.map(n => fotoCsoport(n, A.fotok.filter(f => !f.nemLemezes && f.nev === n))).join('') : '')
      + (N1.length ? `<div class="szakaszcim">${I.tinorus}Nem lemezes gombák</div>` + N1.map(n => fotoCsoport(n, A.fotok.filter(f => f.nemLemezes && f.nev === n))).join('') : '');
    toltBelyegek(c);
  } else {
    const nevek = [...L1, ...N1];
    if (A.terkepSzuro && !nevek.includes(A.terkepSzuro)) A.terkepSzuro = null;
    const pontok = A.fotok.filter(f => f.lat != null && (!A.terkepSzuro || f.nev === A.terkepSzuro));
    if (!pontok.some(f => f.id === A.kijelolt)) A.kijelolt = null;
    c.innerHTML = `<div class="chips" style="margin-top:10px;flex-wrap:nowrap;overflow-x:auto;padding-bottom:2px">
        <button class="ch ${A.terkepSzuro ? '' : 'on'}" data-a="szuro" data-v="">Összes</button>
        ${nevek.map(n => `<button class="ch ${A.terkepSzuro === n ? 'on' : ''}" data-a="szuro" data-v="${esc(n)}" style="white-space:nowrap">${esc(n)}</button>`).join('')}</div>
      <div id="terkep-hely"></div>
      <div class="jelmagy"><span style="color:#3B6D11">${I.hely}</span>Lemezes <span style="color:#BA7517">${I.hely}</span>Nem lemezes<span style="margin-left:auto">${pontok.length} helyszín</span></div>
      <div id="terkep-alja"></div>`;
    $('#terkep-hely').appendChild(terkepDiv);
    terkepFrissit(pontok, true);
    renderTerkepAlja(pontok);
  }
}

// ---------- Útmutató ----------

const lemezRajz = t => `<svg width="70" height="48" viewBox="0 0 64 44" aria-hidden="true"><path d="M4 10 Q32 -2 60 10 L60 14 L4 14Z" fill="#B4B2A9"/><rect x="28" y="14" width="8" height="28" fill="#D3D1C7"/>${t === 's' ? '<path d="M8 14 L22 26 L24 14Z M56 14 L42 26 L40 14Z" fill="#888780"/>' : t === 't' ? '<path d="M8 14 L28 24 L28 14Z M56 14 L36 24 L36 14Z" fill="#888780"/>' : '<path d="M8 14 L28 32 L28 14Z M56 14 L36 32 L36 14Z" fill="#888780"/>'}</svg>`;

function renderInf() {
  const t = $('#tab-inf');
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  t.innerHTML = `<div class="fejlec"><h1>Útmutató</h1></div><div class="belso">
    ${figy('Csak nemzetség szintű tájékozódásra. Ehetőséget nem állapít meg – fogyasztás előtt gombaszakellenőr!')}
    ${onallo() ? '' : `<div class="blk"><p class="lbl">Telepítés a főképernyőre</p><div style="font-size:14px;line-height:1.5">${ios
      ? 'Safariban koppints a <b>Megosztás</b> gombra (négyzet felfelé mutató nyíllal), majd válaszd a <b>Főképernyőhöz adás</b> lehetőséget.'
      : 'Chrome-ban nyisd meg a <b>⋮</b> menüt, és válaszd az <b>Alkalmazás telepítése</b> vagy <b>Hozzáadás a kezdőképernyőhöz</b> lehetőséget.'}
      A főképernyőről indítva teljes képernyőn fut, offline is működik, és a fotók tartósan megmaradnak.</div></div>`}
    <div class="blk"><p class="lbl">Spóranyomat készítése</p>${['Vágd le a tönköt a kalap alatt.', 'Tedd a kalapot lemezzel lefelé félig fehér, félig fekete papírra.', 'Takard le egy pohárral, és hagyd 4–12 órán át.', 'A lerakódott por színét nappali fényben nézd meg.']
      .map((s, i) => `<div class="lepes"><b>${i + 1}</b><span>${s}</span></div>`).join('')}</div>
    <div class="blk"><p class="lbl">Lemezállás</p><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));text-align:center;font-size:12px">${[['s', 'Szabadon álló'], ['t', 'Tönkhöz nőtt'], ['l', 'Lefutó']].map(([k, n]) => `<div>${lemezRajz(k)}<div>${n}</div></div>`).join('')}</div>
      <p class="halk" style="margin:8px 0 0">Pereszkefog: a lemez a tönk előtt kicsípett, majd fogszerűen rákapcsolódik.</p></div>
    <div class="blk"><p class="lbl">Életmód jelmagyarázat</p>${[['M', 'mikorrhiza (földön, gyökérkapcsoltan)'], ['SZA', 'szaprotróf'], ['F', 'fán'], ['T', 'talajon']].map(([a, b]) => `<div class="kv" style="display:flex;gap:10px"><b style="width:36px;font-weight:600">${a}</b>${b}</div>`).join('')}</div>
    <div class="blk"><p class="lbl">Pontozás</p><div style="font-size:14px;line-height:1.5">Spórapor 4, lemez 3, gallér 3, bocskor 3, termőhely 2 pont. Ellentmondásnál levonás jár, a kiegészítő jegyek csak pluszpontot adnak. A „változatos” jellemzők nem számítanak.</div></div>
    <div class="blk"><p class="lbl">Termőidő forrása</p><div style="font-size:14px;line-height:1.5">GBIF (Global Biodiversity Information Facility): a nemzetség dokumentált magyarországi észleléseinek havi megoszlása. Termőnek számít az a hónap, amelyben az észlelések elérik a csúcshónap legalább ${KUSZOB}%-át. A sötétebb zöld több észlelést jelent. Az őszi csúcsot részben a gombászok gyakoribb őszi terepbejárásai is erősítik.</div></div>
    <div class="blk"><p class="lbl">Fotótár és adatok</p><div style="font-size:14px;line-height:1.5">A fotók, időpontok és GPS-koordináták csak ezen a telefonon, a böngésző saját tárhelyén tárolódnak, nem töltődnek fel sehova. A térkép háttere az OpenStreetMap szervereiről töltődik le (ehhez internet kell). Ha törlöd az appot vagy a böngésző adatait, a fotók is törlődnek – ezért az app emlékeztet, ha mentetlen fotóid vannak. Mentést a Fotótár ${'<span style="display:inline-block;width:15px;vertical-align:-2px">' + I.mentes + '</span>'} gombjával készíthetsz, ott az emlékeztető gyakorisága is állítható.</div></div>
    <p class="nagyon-halk" style="margin:14px 4px 0">Forrás: „Lemezes gombák határozási segédlete” táblázat, 28 nemzetség · Térkép: © OpenStreetMap közreműködők · Leaflet, exifr (MIT) · Niki fungi app ${VERZIO}</p>
  </div>`;
}

// ---------- Nemzetség részletei ----------

function renderN(nev) {
  const x = nemzetseg(nev);
  const el = $('#nezet-n');
  if (!x) { el.innerHTML = '<div class="belso"><p class="ures">Ismeretlen nemzetség</p></div>'; return; }
  A.nezetN = nev;
  const r = ertekel(x, A.v);
  const ps = fotokNev(nev);
  const t = TERMOIDO[nev];
  const most = aktualisHonap();
  const szin = v => v >= 80 ? ['#639922', '#173404'] : v >= 50 ? ['#97C459', '#173404'] : v >= KUSZOB ? ['#C0DD97', '#27500A'] : v > 0 ? ['#EAF3DE', '#3B6D11'] : ['var(--halvany)', 'var(--halk)'];
  el.innerHTML = `<div class="fejlec kicsi"><button class="ikongomb atlatszo" data-a="vissza" aria-label="Vissza">${I.balra}</button><h2>${esc(nev)}</h2>
      <button class="zold-gomb" data-a="foto-hozza" data-n="${esc(nev)}">${I.kamera}Fotó</button></div>
    <div class="belso">
      <div class="blk"><div style="display:flex;align-items:center;gap:12px">${pottyok(x.s, true)}
        <div style="flex:1;min-width:0"><div style="font-size:22px;font-weight:700">${esc(nev)}</div><div class="latin" style="font-size:14px">${esc(x.la)}</div>${szezonSor(nev)}</div>
        ${r.pct != null ? `<span style="font-size:22px;font-weight:700">${r.pct}%</span>` : ''}</div>
        ${t ? `<div class="ho">${HONAPOK.map((m, i) => { const [bg, fg] = szin(t.havi[i]); return `<div class="${i + 1 === most ? 'most' : ''}" style="background:${bg};color:${fg}" title="${m}: ${t.havi[i]}%">${m[0].toUpperCase()}</div>`; }).join('')}</div>
        <div class="nagyon-halk" style="margin-top:6px">Forrás: ${esc(t.forras)} (n=${t.n.toLocaleString('hu-HU')})${t.n < 50 ? ' · kevés adat' : ''}</div>` : ''}
      </div>
      <div class="blk"><div style="display:flex;justify-content:space-between;align-items:center"><p class="lbl" style="margin:0">Saját fotók (${ps.length})</p>
        ${ps.some(f => f.lat != null) ? `<button class="gomb-kicsi" style="border:0;color:var(--erdo);padding:2px 0;display:inline-flex;gap:3px;align-items:center" data-a="terkepen" data-n="${esc(nev)}"><span style="width:15px;display:inline-flex">${I.hely}</span>Térképen</button>` : ''}</div>
        ${ps.length ? `<div class="racs">${ps.map(belyegKep).join('')}</div>` : '<p class="halk" style="margin:6px 0 0;font-size:14px">Még nincs fotód erről a nemzetségről.</p>'}
      </div>
      <div class="blk" style="padding-top:4px;padding-bottom:4px">${OSZLOPOK.map((o, i) => `<div class="kv"><p class="lbl">${o}</p>${esc(i === 5 ? x.t[5] + ' – ' + eletmodSzoveg(x.t[5]) : x.t[i])}</div>`).join('')}</div>
      ${x.j.length ? `<div class="blk"><p class="lbl">Jellemző jegyek</p><div class="cimkek">${x.j.map(k => tag(JEGY_NEV[k], r.jm.includes(k) ? true : undefined)).join('')}</div></div>` : ''}
      ${figy()}
    </div>`;
  toltBelyegek(el);
}

// ---------- Fotó részletei ----------

let kisTerkep = null;

function renderP(id) {
  const f = A.fotok.find(p => p.id === id);
  const el = $('#nezet-p');
  if (kisTerkep) { kisTerkep.remove(); kisTerkep = null; }
  A.nezetP = id;
  if (!f) {
    el.innerHTML = `<div class="fejlec kicsi"><button class="ikongomb atlatszo" data-a="vissza" aria-label="Vissza">${I.balra}</button><h2>Fotó</h2><span style="width:32px"></span></div><div class="belso"><p class="ures">A fotó már nem található.</p></div>`;
    return;
  }
  const [ck, cn] = nlCsoport(f.csoport);
  el.innerHTML = `<div class="fejlec kicsi"><button class="ikongomb atlatszo" data-a="vissza" aria-label="Vissza">${I.balra}</button><h2>${esc(f.nev)}</h2>
      <button class="ikongomb piros" data-a="foto-torol" data-id="${esc(f.id)}" aria-label="Fotó törlése">${I.kuka}</button></div>
    <div class="belso">
      <img class="nagykep" id="nagykep" alt="${esc(f.nev)}">
      <div class="blk" style="padding-top:4px;padding-bottom:4px">
        <div class="kv"><p class="lbl">${f.nemLemezes ? 'Megnevezés · nem lemezes' : 'Nemzetség'}</p>${f.nemLemezes ? `${esc(f.nev)} · ${esc(cn)}`
          : `<button data-a="nyit-n" data-n="${esc(f.nev)}" style="border:0;background:none;padding:0;color:var(--erdo);font-weight:600;display:inline-flex;align-items:center;gap:2px">${esc(f.nev)}<span style="width:16px;display:inline-flex">${I.jobbra}</span></button>`}</div>
        <div class="kv"><p class="lbl">Dátum és idő</p>${esc(idoTeljes.format(f.datum))}</div>
        <div class="kv"><p class="lbl">GPS koordináták</p><span style="user-select:text;-webkit-user-select:text">${koord(f)}</span><div class="halk">${esc(f.helyForras || '')}</div></div>
      </div>
      ${f.lat != null ? `<div class="terkep kicsi" id="kis-terkep"></div>
        <button class="nagy-gomb semleges" style="margin-top:10px;font-size:15px" data-a="kulso-terkep" data-id="${esc(f.id)}">${I.terkep}Megnyitás térképalkalmazásban</button>` : ''}
    </div>`;
  F.kep(f.id).then(u => { const i = $('#nagykep'); if (u && i) i.src = u; });
  if (f.lat != null && typeof L !== 'undefined') {
    requestAnimationFrame(() => {
      const d = $('#kis-terkep');
      if (!d) return;
      kisTerkep = L.map(d, { zoomControl: false, dragging: false, touchZoom: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, tap: false });
      kisTerkep.attributionControl.setPrefix(false);
      tileReteg().addTo(kisTerkep);
      L.marker([f.lat, f.lon], { icon: pinIkon(f, false), interactive: false }).addTo(kisTerkep);
      kisTerkep.setView([f.lat, f.lon], 15);
    });
  }
}

// ---------- Alsó lapok ----------

function lap(html, { bezarhato = true } = {}) {
  const r = $('#retegek');
  r.innerHTML = `<div class="hatter" ${bezarhato ? 'data-a="lap-bezar"' : ''}><div class="also" role="dialog" aria-modal="true">${html}</div></div>`;
  return r.querySelector('.also');
}
const lapBezar = () => { $('#retegek').innerHTML = ''; };

function forrasLap(cel) {
  A.cel = cel;
  lap(`<h3>Fotó hozzáadása – ${esc(cel.nev)}</h3>
    <div class="tartalom"><p class="halk" style="margin:2px 0 0">A fotóhoz a pontos idő és a GPS-pozíció is mentődik.</p>
      <button class="nagy-gomb" data-a="forras" data-f="kamera">${I.kamera}Fotó készítése</button>
      <button class="nagy-gomb masod" data-a="forras" data-f="konyvtar">${I.foto}Választás a fotók közül</button>
      <button class="nagy-gomb semleges" data-a="lap-bezar">Mégse</button></div>`);
}

let nlValasztott = 'tinorus';
function nemLemezesLap() {
  const lapEl = lap(`<h3>Nem lemezes gomba</h3>
    <div class="tartalom"><p class="halk" style="margin:2px 0 0">Csak a fotótárba kerül, a határozó nem értékeli.</p>
      <div><p class="lbl">Megnevezés</p><input class="mezo" id="nl-nev" placeholder="pl. Ízletes vargánya" autocomplete="off" maxlength="60" enterkeyhint="done"><div class="mezohiba" id="nl-hiba" hidden>Adj meg egy nevet</div></div>
      <div><p class="lbl">Csoport</p><div class="chips" id="nl-csop">${NEM_LEMEZES.map(([k, n]) => `<button class="ch ${k === nlValasztott ? 'on' : ''}" data-a="nl-csoport" data-v="${k}">${I[k]}${n}</button>`).join('')}</div></div>
      <button class="nagy-gomb" data-a="nl-forras" data-f="kamera">${I.kamera}Fotó készítése</button>
      <button class="nagy-gomb masod" data-a="nl-forras" data-f="konyvtar">${I.foto}Választás a fotók közül</button>
      <p class="halk" style="margin:4px 0 0">A fotóhoz a pontos idő és a GPS-pozíció is mentődik.</p></div>`);
  const inp = lapEl.querySelector('#nl-nev');
  inp.addEventListener('input', () => { $('#nl-hiba').hidden = true; });
}

function torlesLap(id) {
  lap(`<h3>Biztosan törlöd ezt a fotót?</h3>
    <div class="tartalom"><p class="halk" style="margin:2px 0 0;font-size:14px">A kép és a hozzá tartozó idő- és helyadat végleg törlődik a telefonról.</p>
      <button class="nagy-gomb piros" data-a="torles-ok" data-id="${esc(id)}">${I.kuka}Fotó törlése</button>
      <button class="nagy-gomb semleges" data-a="lap-bezar">Mégse</button></div>`);
}

// ---------- Mentési emlékeztető ----------

const NAP = 86400000;
const EMLEK_OPCIOK = [[3, '3 naponta'], [7, 'Hetente'], [14, '2 hetente'], [30, 'Havonta'], [0, 'Ki']];
const utolsoMentes = () => +(tarol.get('niki-mentes-ido') || 0);
const emlekNap = () => { const v = tarol.get('niki-emlek'); return v == null ? 7 : +v; };
const mentetlen = () => { const u = utolsoMentes(); return A.fotok.filter(f => (f.mentve || 0) > u); };
function esedekes() {
  const l = mentetlen();
  const n = emlekNap();
  if (!l.length || !n) return false;
  const legregebbi = Math.min(...l.map(f => f.mentve || Date.now()));
  return Date.now() - legregebbi >= n * NAP || l.length >= 15;
}
const relativ = ms => {
  if (!ms) return 'még nem volt';
  const d = Math.floor((Date.now() - ms) / NAP);
  return d <= 0 ? 'ma' : d === 1 ? 'tegnap' : `${d} napja`;
};

function mentesSav() {
  const ml = mentetlen();
  if (!A.fotok.length) return '';
  if (!ml.length) {
    return utolsoMentes() ? `<div class="mentes-ok">${I.pipa}Minden fotó mentve · utolsó mentés: ${relativ(utolsoMentes())}</div>` : '';
  }
  return `<div class="mentes-sav${esedekes() ? ' esedekes' : ''}">${esedekes() ? I.figy : I.mentes}
    <div style="flex:1;min-width:0"><b>${ml.length} fotó még nincs mentve</b><div class="kicsi-sor">Utolsó mentés: ${relativ(utolsoMentes())}</div></div>
    <button class="zold-gomb" data-a="mentes-most">Mentés</button></div>`;
}

function emlekLap() {
  const ml = mentetlen();
  lap(`<h3>Ideje menteni</h3>
    <div class="tartalom"><p style="margin:4px 0 0;font-size:15px;line-height:1.45">${ml.length} fotód még nincs mentve (utolsó mentés: ${relativ(utolsoMentes())}). Ha törlöd az appot vagy a böngésző adatait, ezek a fotók elvesznek.</p>
      <div id="mentes-allapot"></div>
      <button class="nagy-gomb" id="export-gomb" data-a="export">${I.letolt}Mentés most</button>
      <button class="nagy-gomb semleges" data-a="lap-bezar">Később</button>
      <p class="halk" style="margin:4px 0 0">Az emlékeztető gyakoriságát a Fotótár ${'<span style="display:inline-block;width:14px;vertical-align:-2px">' + I.mentes + '</span>'} gombjánál állíthatod.</p></div>`);
}

let kesz_mentes = null, kesz_ido = 0;

function mentesKesz() {
  tarol.set('niki-mentes-ido', String(kesz_ido || Date.now()));
  const ki = $('#mentes-allapot');
  if (ki) ki.innerHTML = `<div class="blk" style="background:var(--ok-hatter);color:var(--ok-szoveg);margin:0;font-size:14px;display:flex;gap:8px;align-items:center"><span style="width:18px;display:inline-flex">${I.pipa}</span>Mentés kész – ${esc(kesz_mentes ? kesz_mentes.name : '')}</div>`;
  renderTabbar();
  if ($('#tab-fot').firstChild) renderFot();
}

async function megosztMentes() {
  if (!kesz_mentes) return 'nincs';
  if (navigator.canShare && navigator.canShare({ files: [kesz_mentes] })) {
    try {
      await navigator.share({ files: [kesz_mentes], title: 'Niki fungi mentés' });
      mentesKesz();
      return 'ok';
    } catch (err) {
      return err && err.name === 'AbortError' ? 'megszakitva' : 'gesztus';
    }
  }
  const u = URL.createObjectURL(kesz_mentes);
  const link = document.createElement('a');
  link.href = u; link.download = kesz_mentes.name;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(u), 30000);
  mentesKesz();
  return 'ok';
}

// Mentés elkészítése; utána rögtön felajánlja a megosztást (Fájlok app / felhő).
async function mentesKeszit() {
  if (!A.fotok.length) return;
  const ki = $('#mentes-allapot');
  const eg = $('#export-gomb');
  if (eg) eg.hidden = true;
  if (ki) ki.innerHTML = '<div class="halk" style="display:flex;gap:8px;align-items:center"><span class="forog" style="border-color:var(--vonal);border-top-color:var(--erdo)"></span>Mentés készítése…</div>';
  try {
    kesz_ido = Date.now();
    const blob = await F.exportal(A.fotok);
    const d = new Date();
    const nev = `niki-fungi-mentes-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json`;
    kesz_mentes = new File([blob], nev, { type: 'application/json' });
    const megosztas = !!(navigator.canShare && navigator.canShare({ files: [kesz_mentes] }));
    const gomb = () => {
      const k = $('#mentes-allapot');
      if (k) k.innerHTML = `<div class="blk" style="background:var(--lap);margin:0;font-size:14px">Elkészült: ${esc(nev)} (${(blob.size / 1048576).toFixed(1)} MB)</div>
        <button class="nagy-gomb" style="margin-top:10px" data-a="megoszt">${I.megoszt}${megosztas ? 'Mentés a Fájlokba / felhőbe' : 'Letöltés'}</button>`;
    };
    if (megosztas) {
      const r = await megosztMentes();
      if (r !== 'ok') gomb();
    } else {
      gomb();
    }
  } catch (err) {
    if (ki) ki.innerHTML = `<div class="mezohiba">A mentés nem sikerült: ${esc(err.message || err)}</div>`;
    if (eg) eg.hidden = false;
  }
}

async function mentesLap(azonnal = false) {
  kesz_mentes = null;
  const becsles = await F.tarhely();
  let tartos = false;
  try { tartos = navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted() : false; } catch (e) { /* nem támogatott */ }
  const mb = becsles && becsles.usage != null ? (becsles.usage / 1048576).toFixed(1) + ' MB' : 'ismeretlen';
  lap(`<h3>Mentés és visszaállítás</h3>
    <div class="tartalom">
      <div class="blk" style="background:var(--lap);margin-top:8px;font-size:14px">${A.fotok.length} fotó · foglalt hely: ${mb}<br>
        <span class="halk">${tartos ? 'Tartós tárolás bekapcsolva.' : onallo() ? 'A rendszer szükség esetén törölheti az adatokat – készíts rendszeresen mentést.' : 'Böngészőből futtatva az iOS 7 nap használat nélkül törölheti az adatokat. Tedd fel a főképernyőre, és készíts mentést.'}</span></div>
      <div class="blk" style="background:var(--lap);margin-top:0;font-size:14px">Utolsó mentés: <b>${relativ(utolsoMentes())}</b>${utolsoMentes() ? ` (${esc(idoF.format(utolsoMentes()))})` : ''}<br>
        <span class="halk">${mentetlen().length ? mentetlen().length + ' fotó még nincs mentve' : A.fotok.length ? 'Minden fotó mentve' : 'Még nincs fotó'}</span></div>
      <div><p class="lbl">Emlékeztető, ha van mentetlen fotó</p><div class="chips" id="emlek-chips">${EMLEK_OPCIOK.map(([n, t]) => `<button class="ch ${emlekNap() === n ? 'on' : ''}" data-a="emlek" data-v="${n}">${t}</button>`).join('')}</div></div>
      <div id="mentes-allapot"></div>
      <button class="nagy-gomb" id="export-gomb" data-a="export" ${A.fotok.length ? '' : 'disabled style="opacity:.4"'}>${I.letolt}Mentés készítése</button>
      <button class="nagy-gomb masod" data-a="import">${I.feltolt}Visszaállítás mentésből</button>
      <p class="halk" style="margin:4px 0 0">A mentés egyetlen .json fájl, benne a képekkel, időpontokkal és koordinátákkal. Tedd el a Fájlok appba vagy a felhőbe. Visszaállításkor a már meglévő fotók nem duplázódnak.</p>
      <button class="nagy-gomb semleges" data-a="lap-bezar">Bezárás</button>
    </div>`);
  if (azonnal) mentesKeszit();
}

function figyelmeztetes() {
  const d = document.createElement('div');
  d.className = 'teljes';
  d.id = 'figyelmeztetes';
  d.innerHTML = `<div class="doboz"><svg class="nagyikon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1.67c.955 0 1.845.467 2.39 1.247l.105.16l8.114 13.548a2.914 2.914 0 0 1-2.307 4.363l-.195.008H3.882a2.914 2.914 0 0 1-2.582-4.2l.099-.185l8.11-13.538A2.914 2.914 0 0 1 12 1.67zM12.01 15l-.127.007a1 1 0 0 0 0 1.986L12 17l.127-.007a1 1 0 0 0 0-1.986L12.01 15zM12 8a1 1 0 0 0-.993.883L11 9v4l.007.117a1 1 0 0 0 1.986 0L13 13V9l-.007-.117A1 1 0 0 0 12 8z"/></svg>
    <h1>Fontos</h1>
    <p>A Niki fungi app egy lemezes gomba határozó táblázat alapján <b>nemzetséget</b> valószínűsít.</p>
    <p><b>Nem dönti el, hogy egy gomba ehető-e.</b> Szinte minden nemzetségben vannak mérges, sőt halálosan mérges fajok, és sok ehető gombának van mérges hasonmása.</p>
    <p>Fogyasztás előtt minden gombát mutass meg vizsgázott <b>gombaszakellenőrnek</b>.</p>
    <button class="nagy-gomb" style="margin-top:20px" data-a="figy-ok">Megértettem</button></div>`;
  document.body.appendChild(d);
}

const onallo = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

// ---------- Fotó mentése ----------

async function mentFoto(file, cel, forras) {
  uzenet('Fotó mentése, pozíció lekérése…', { forog: true, tartos: true });
  try {
    const exif = await F.exifAdat(file);
    let lat = exif.lat, lon = exif.lon, pontossag = null, helyForras;
    if (lat != null) {
      helyForras = 'A fotó helyadataiból (EXIF)';
    } else {
      const p = await F.pozicio();
      if (p.lat != null) {
        lat = p.lat; lon = p.lon; pontossag = p.pont;
        helyForras = forras === 'kamera'
          ? `Telefon GPS (±${Math.round(p.pont)} m)`
          : `Telefon GPS a mentéskor (±${Math.round(p.pont)} m) – a fotó nem tartalmazott helyet`;
      } else {
        helyForras = p.hiba === 'tiltva' ? 'Nem érhető el – a helyhozzáférés le van tiltva' : 'Nem érhető el';
      }
    }
    const datum = exif.datum || Date.now();
    const { nagy, kicsi } = await F.feldolgoz(file);
    const meta = { id: F.ujId(), nev: cel.nev, nemLemezes: !!cel.nemLemezes, csoport: cel.csoport || null, datum, lat, lon, pontossag, helyForras, mentve: Date.now() };
    await F.ment(meta, nagy, kicsi);
    A.fotok.push(meta);
    A.fotok.sort((a, b) => b.datum - a.datum);
    F.tartosTarolas();
    frissitMinden();
    uzenet(`Mentve · ${cel.nev} · ${idoF.format(datum)}${lat == null ? ' · hely nélkül' : ''}`);
  } catch (e) {
    console.error(e);
    uzenet('A fotót nem sikerült menteni: ' + (e && e.message ? e.message : 'ismeretlen hiba'));
  }
}

function frissitMinden() {
  renderTabbar();
  renderRangsor();
  if ($('#tab-tab').firstChild) renderTabLista();
  if (A.tab === 'fot' || $('#tab-fot').firstChild) renderFot();
  if (!$('#nezet-n').hidden && A.nezetN) renderN(A.nezetN);
}

for (const [sel, forras] of [['#in-kamera', 'kamera'], ['#in-konyvtar', 'konyvtar']]) {
  $(sel).addEventListener('change', e => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (file && A.cel) mentFoto(file, A.cel, forras);
  });
}

$('#in-mentes').addEventListener('change', async e => {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file) return;
  uzenet('Visszaállítás…', { forog: true, tartos: true });
  try {
    const { uj, kihagyott } = await F.importal(file, new Set(A.fotok.map(f => f.id)));
    A.fotok = await F.osszesMeta();
    frissitMinden();
    lapBezar();
    uzenet(`Visszaállítva: ${uj} fotó${kihagyott ? ` (${kihagyott} már megvolt)` : ''}`);
  } catch (err) {
    uzenet('A visszaállítás nem sikerült: ' + (err && err.message ? err.message : 'hibás fájl'));
  }
});

// ---------- Navigáció ----------

function utvonal() {
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const [a, ...b] = h.split('/');
  return { a: a || 'hat', b: b.join('/') };
}

function mutatTab(t) {
  A.tab = t;
  for (const s of document.querySelectorAll('.tab')) s.hidden = s.dataset.tab !== t;
  if (t === 'tab') renderTab();
  if (t === 'fot') renderFot();
  if (t === 'inf' && !$('#tab-inf').firstChild) renderInf();
  renderTabbar();
}

function navigal() {
  const { a, b } = utvonal();
  if (a === 'n') {
    $('#nezet-p').hidden = true;
    if (kisTerkep) { kisTerkep.remove(); kisTerkep = null; }
    renderN(b);
    $('#nezet-n').hidden = false;
    $('#nezet-n').scrollTop = 0;
  } else if (a === 'p') {
    renderP(b);
    $('#nezet-p').hidden = false;
    $('#nezet-p').scrollTop = 0;
  } else {
    $('#nezet-n').hidden = true;
    $('#nezet-p').hidden = true;
    if (kisTerkep) { kisTerkep.remove(); kisTerkep = null; }
    A.nezetN = null;
    A.nezetP = null;
    mutatTab(['hat', 'tab', 'fot', 'inf'].includes(a) ? a : 'hat');
    return;
  }
  renderTabbar();
}

function megy(hash) {
  history.pushState({ belso: true }, '', hash);
  navigal();
}

function vissza() {
  if (history.state && history.state.belso) history.back();
  else { history.replaceState(null, '', '#/' + A.tab); navigal(); }
}

window.addEventListener('popstate', navigal);

// ---------- Események ----------

document.addEventListener('click', async e => {
  const el = e.target.closest('[data-a]');
  if (!el) return;
  const a = el.dataset.a;
  if (a === 'lap-bezar' && e.target !== el && el.classList.contains('hatter')) return;

  switch (a) {
    case 'tab': {
      lapBezar();
      if (A.tab === el.dataset.t && $('#nezet-n').hidden && $('#nezet-p').hidden) {
        const s = $('#tab-' + A.tab);
        s.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      history.replaceState(null, '', '#/' + el.dataset.t);
      navigal();
      break;
    }
    case 'spora': A.v.s = A.v.s === el.dataset.v ? null : el.dataset.v; renderPanel(); renderRangsor(); break;
    case 'valasz': { const k = el.dataset.k; A.v[k] = A.v[k] === el.dataset.v ? null : el.dataset.v; renderPanel(); renderRangsor(); break; }
    case 'jegy': { const k = el.dataset.v; A.v.j.has(k) ? A.v.j.delete(k) : A.v.j.add(k); renderPanel(); renderRangsor(); break; }
    case 'torles': A.v = uresValasz(); renderPanel(); renderRangsor(); break;
    case 'osszecsuk': A.osszecsukva = !A.osszecsukva; renderPanel(); break;
    case 'jegyek': A.jegyekNyitva = !A.jegyekNyitva; renderPanel(); break;
    case 'nyit-n': megy('#/n/' + encodeURIComponent(el.dataset.n)); break;
    case 'nyit-p': megy('#/p/' + encodeURIComponent(el.dataset.id)); break;
    case 'vissza': vissza(); break;
    case 'foto-hozza': forrasLap({ nev: el.dataset.n, nemLemezes: false, csoport: null }); break;
    case 'forras':
      lapBezar();
      $(el.dataset.f === 'kamera' ? '#in-kamera' : '#in-konyvtar').click();
      break;
    case 'nemlemezes': nemLemezesLap(); break;
    case 'nl-csoport':
      nlValasztott = el.dataset.v;
      for (const b of document.querySelectorAll('#nl-csop .ch')) b.classList.toggle('on', b.dataset.v === nlValasztott);
      break;
    case 'nl-forras': {
      const inp = $('#nl-nev');
      const nev = inp.value.trim().replace(/\s+/g, ' ');
      if (!nev) { $('#nl-hiba').hidden = false; inp.focus(); return; }
      A.cel = { nev, nemLemezes: true, csoport: nlValasztott };
      A.fotMod = 'gal';
      lapBezar();
      $(el.dataset.f === 'kamera' ? '#in-kamera' : '#in-konyvtar').click();
      break;
    }
    case 'fot-mod': A.fotMod = el.dataset.m; A.kijelolt = null; renderFot(); break;
    case 'szuro': A.terkepSzuro = el.dataset.v || null; A.kijelolt = null; renderFot(); break;
    case 'terkepen':
      A.terkepSzuro = el.dataset.n; A.fotMod = 'map'; A.kijelolt = null;
      history.replaceState(null, '', '#/fot');
      navigal();
      break;
    case 'foto-torol': torlesLap(el.dataset.id); break;
    case 'torles-ok': {
      const id = el.dataset.id;
      lapBezar();
      await F.torol(id);
      A.fotok = A.fotok.filter(f => f.id !== id);
      vissza();
      frissitMinden();
      uzenet('Fotó törölve');
      break;
    }
    case 'kulso-terkep': {
      const f = A.fotok.find(p => p.id === el.dataset.id);
      if (!f) return;
      const apple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
      const url = apple
        ? `https://maps.apple.com/?ll=${f.lat},${f.lon}&q=${encodeURIComponent(f.nev)}`
        : `geo:${f.lat},${f.lon}?q=${f.lat},${f.lon}(${encodeURIComponent(f.nev)})`;
      window.location.href = url;
      break;
    }
    case 'mentes-lap': mentesLap(); break;
    case 'export': mentesKeszit(); break;
    case 'mentes-most': mentesLap(true); break;
    case 'megoszt': megosztMentes(); break;
    case 'emlek':
      tarol.set('niki-emlek', el.dataset.v);
      for (const b of document.querySelectorAll('#emlek-chips .ch')) b.classList.toggle('on', b.dataset.v === el.dataset.v);
      renderTabbar();
      if ($('#tab-fot').firstChild) renderFot();
      break;
    case 'import': $('#in-mentes').click(); break;
    case 'figy-ok':
      tarol.set('niki-figy', '1');
      $('#figyelmeztetes')?.remove();
      break;
    case 'lap-bezar': lapBezar(); break;
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#retegek').firstChild) lapBezar();
  if (e.key === 'Enter' && e.target.id === 'nl-nev') e.target.blur();
});

// ---------- Indítás ----------

async function indit() {
  renderTabbar();
  renderHat();
  try { A.fotok = await F.osszesMeta(); } catch (e) { console.error(e); A.fotok = []; }
  navigal();
  renderRangsor();
  if (!tarol.get('niki-figy')) figyelmeztetes();
  else if (esedekes() && Date.now() - +(tarol.get('niki-emlek-mutatva') || 0) > NAP) {
    tarol.set('niki-emlek-mutatva', String(Date.now()));
    emlekLap();
  }
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* offline mód nem érhető el */ });
  }
}

indit();
