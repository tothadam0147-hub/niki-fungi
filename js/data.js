// Niki fungi app – határozó adatok
// Forrás: „Lemezes gombák határozási segédlete” táblázat (28 nemzetség).
// Termőidő: GBIF (Global Biodiversity Information Facility) magyarországi észlelések
// havi megoszlása, a csúcshónaphoz viszonyítva (0–100), jan → dec. Lekérdezve: 2026-10-25.

export const SPORA = [
  { k: 'w', nev: 'Fehér', rovid: 'Fehér', szin: '#FFFFFF' },
  { k: 'c', nev: 'Krém / okker', rovid: 'Krém', szin: '#F5E3B8' },
  { k: 'p', nev: 'Rózsaszín', rovid: 'Rózsa', szin: '#EDADAD' },
  { k: 'b', nev: 'Barna', rovid: 'Barna', szin: '#996E45' },
  { k: 'r', nev: 'Rozsda- / dohánybarna', rovid: 'Rozsda', szin: '#B85C24' },
  { k: 'd', nev: 'Sötétbarna / csokoládé', rovid: 'Sötét', szin: '#52301C' },
  { k: 'k', nev: 'Fekete', rovid: 'Fekete', szin: '#151515' }
];

export const KERDESEK = [
  { k: 'l', nev: 'Lemez', opciok: [['s', 'Szabadon álló'], ['t', 'Tönkhöz nőtt'], ['l', 'Lefutó']] },
  { k: 'g', nev: 'Gallér', opciok: [['h', 'Hártyás'], ['k', 'Kortina'], ['z', 'Gallérzóna'], ['n', 'Nincs']] },
  { k: 'b', nev: 'Bocskor', opciok: [['1', 'Van'], ['0', 'Nincs']] },
  { k: 'h', nev: 'Termőhely', opciok: [['fa', 'Fán, tuskón'], ['fo', 'Földön, avarban']] }
];

export const LEMEZ_LEIRAS = {
  s: ['Szabadon álló', 'A lemezek nem érik el a tönköt.'],
  t: ['Tönkhöz nőtt', 'A lemezek a tönkhöz kapcsolódnak.'],
  l: ['Lefutó', 'A lemezek lefutnak a tönkön.']
};

// [kulcs, rövid név (chip), teljes név]
export const JEGYEK = {
  Kalap: [
    ['pettyes', 'Pettyes', 'Burokmaradványok (pettyek) a kalapon'],
    ['bordas', 'Bordás szél', 'Bordás kalapszél'],
    ['pikkK', 'Pikkelyes', 'Pikkelyes kalap'],
    ['nyalK', 'Nyálkás', 'Nyálkás, tapadós kalap'],
    ['higro', 'Higrofán', 'Higrofán (száradva kifakul)'],
    ['bemely', 'Bemélyedő', 'Bemélyedő / tölcséresedő kalap'],
    ['harang', 'Kúpos / harang', 'Kúpos / harang alakú kalap'],
    ['begony', 'Begöngyölt szél', 'Kalapszél fiatalon begöngyölt'],
    ['feltuno', 'Élénk szín', 'Feltűnő, élénk kalapszín'],
    ['hullam', 'Hullámos szél', 'Hullámos kalapszél'],
    ['behas', 'Behasadozó', 'Sugarasan szálas, behasadozó kalap'],
    ['velum', 'Vélummaradvány', 'Hártyamaradvány a kalapszélen']
  ],
  Lemez: [
    ['ritka', 'Ritka', 'Ritka lemezek'],
    ['suru', 'Sűrű', 'Sűrű lemezek'],
    ['pfog', 'Pereszkefog', 'Lemez a tönknél kicsípett (pereszkefog)'],
    ['tejel', 'Tejel', 'Sértésre tejnedvet ereszt'],
    ['torekL', 'Törékeny', 'Törékeny lemezek'],
    ['barnul', 'Barnul', 'Lemez nyomásra barnul'],
    ['elfoly', 'Elfolyósodik', 'Lemezek tintaszerűen elfolyósodnak']
  ],
  'Tönk': [
    ['ureges', 'Üreges', 'Üreges / csöves tönk'],
    ['gumos', 'Gumós tő', 'Gumós tönktő'],
    ['csavar', 'Csavarodott', 'Csavarodott tönk'],
    ['szivos', 'Szívós', 'Szívós, vékony tönk'],
    ['korpas', 'Korpás csúcs', 'Tönkcsúcs korpás / szemcsés'],
    ['pattan', 'Pattanva törik', 'Tönk krétaszerűen, pattanva törik'],
    ['oldalt', 'Oldalt álló', 'Rövid, oldalt álló tönk'],
    ['szalas', 'Szálas', 'Szálas felületű tönk'],
    ['pikkT', 'Pikkelyes tönk', 'Pikkelyes tönk'],
    ['rhizo', 'Gyökérzsinórok', 'Gyökérszerű zsinórok a tönk tövén']
  ],
  'Egyéb': [
    ['csop', 'Csoportos', 'Csoportosan, tövükön összenőve nő'],
    ['sargul', 'Sárgul / vörösödik', 'Sérülésre sárgul vagy vörösödik']
  ]
};

export const JEGY_NEV = {};
export const JEGY_ROVID = {};
for (const lista of Object.values(JEGYEK)) {
  for (const [k, r, n] of lista) { JEGY_NEV[k] = n; JEGY_ROVID[k] = r; }
}
export const JEGY_SORREND = Object.values(JEGYEK).flat().map(j => j[0]);

// s: spóra kulcsok, l: lemez, g: gallér, b: bocskor ('1' van / '0' nincs), e: életmód (m/f/t),
// j: kiegészítő jegyek, t: táblázat cellái [spóra, lemez, kalap, tönk, gallér/bocskor, életmód]
export const NEMZETSEGEK = [
  { n: 'Galóca', la: 'Amanita', s: 'w', l: 's', g: 'h', b: '10', e: 'm', j: ['pettyes'],
    t: ['fehér', 'szabadon álló', 'általános burokmaradvány (pettyek)', 'változatos', 'van / előfordul', 'M'] },
  { n: 'Selyemgomba', la: 'Amanita (Vaginatae)', s: 'w', l: 's', g: 'n', b: '1', e: 'm', j: ['pettyes', 'bordas'],
    t: ['fehér', 'szabadon álló', 'széle bordás, általános burok (pettyek)', 'karcsú', 'nincs / van', 'M'] },
  { n: 'Őzlábgomba', la: 'Macrolepiota', s: 'w', l: 's', g: 'h', b: '0', e: 't', j: ['pikkK', 'ureges', 'gumos'],
    t: ['fehér', 'szabadon álló', 'pikkelyes, fiatalon dobverő', 'hengeres, gumós, csöves belül', 'van / nincs', 'SZA, T'] },
  { n: 'Fülőke', la: 'Gymnopus / Collybia', s: 'w', l: 't', g: 'n', b: '0', e: 'ft', j: ['csavar'],
    t: ['fehér', 'tönkhöz nőtt', 'vékony húsú', 'változatos, gyakran csavarodott', 'nincs', 'SZA, F, T'] },
  { n: 'Kígyógomba', la: 'Mycena', s: 'w', l: 't', g: 'n', b: '0', e: 'ft', j: ['bordas', 'harang'],
    t: ['fehér', 'tönkhöz nőtt', 'bordázott szélű, harang alak', 'törékeny, vékony', 'nincs', 'SZA, F, T'] },
  { n: 'Szegfűgomba', la: 'Marasmius', s: 'w', l: 'ts', g: 'n', b: '0', e: 'ft', j: ['higro', 'ritka', 'szivos'],
    t: ['fehér', 'tönkhöz nőtt / szabadon álló, ritka', 'higrofán', 'szívós, vékony', 'nincs', 'SZA'] },
  { n: 'Csigagomba', la: 'Hygrophorus', s: 'w', l: 'l', g: 'n', b: '0', e: 'm', j: ['nyalK', 'ritka', 'korpas'],
    t: ['fehér', 'ritka, többnyire lefutó', 'nyálkás, tapadós', 'gyakran nyálkás, csúcsa szemcsés / korpás', 'nincs', 'M'] },
  { n: 'Tuskógomba', la: 'Armillaria', s: 'w', l: 't', g: 'hn', b: '0', e: 'ft', j: ['pikkK', 'csop'],
    t: ['fehéres', 'tönkhöz nőtt', 'pikkelyes', 'többnyire csoportos, elvékonyodó', 'előfordul, nincs', 'SZA'] },
  { n: 'Laskagomba', la: 'Pleurotus', s: 'w', l: 'l', g: 'n', b: '0', e: 'ft', j: ['oldalt', 'bemely'],
    t: ['fehéres', 'lefutó', 'féloldalas, tölcséresedő', 'rövid, oldalt álló', 'nincs', 'SZA, F, T'] },
  { n: 'Tölcsérgomba', la: 'Clitocybe', s: 'w', l: 'lt', g: 'n', b: '0', e: 't', j: ['bemely'],
    t: ['fehéres', 'lefutó v. tönkhöz nőtt', 'tölcséresedő, néha púpos', 'változatos', 'nincs', 'SZA, T'] },
  { n: 'Pereszke', la: 'Tricholoma', s: 'wp', l: 't', g: 'n', b: '0', e: 'mt', j: ['pfog'],
    t: ['világos (fehéres, halvány rózsás)', 'pereszke fog', 'változatos', 'változatos', 'nincs', 'M / SZA'] },
  { n: 'Tejelőgomba', la: 'Lactarius', s: 'wc', l: 'lt', g: 'n', b: '0', e: 'm', j: ['tejel', 'bemely'],
    t: ['fehér, krém, okker', 'kissé lefutó, TEJEL', 'bemélyedő', 'hengeres', 'nincs', 'M'] },
  { n: 'Galambgomba', la: 'Russula', s: 'wc', l: 't', g: 'n', b: '0', e: 'm', j: ['bemely', 'feltuno', 'pattan', 'torekL'],
    t: ['fehér, krém, okker, sárga', 'tönkhöz nőtt, törékeny', 'bemélyedő, feltűnő színű', 'hengeres, pattanva törik', 'nincs', 'M'] },
  { n: 'Csengettyűgomba', la: 'Pluteus', s: 'p', l: 's', g: 'n', b: '0', e: 'f', j: ['szalas'],
    t: ['rózsaszín', 'szabadon álló', 'változatos', 'gyakran szálas felületű', 'nincs', 'SZA, F'] },
  { n: 'Döggomba', la: 'Entoloma', s: 'p', l: 't', g: 'n', b: '0', e: 'mt', j: [],
    t: ['rózsaszín', 'tönkhöz nőtt', 'változatos', 'változatos', 'nincs', 'M / SZA'] },
  { n: 'Lisztgomba', la: 'Clitopilus', s: 'p', l: 'l', g: 'n', b: '0', e: 'ft', j: ['hullam', 'oldalt'],
    t: ['rózsaszín', 'lefutó', 'széle hullámos', 'oldalt álló, fehéres', 'nincs', 'SZA'] },
  { n: 'Bocskorosgomba', la: 'Volvariella / Volvopluteus', s: 'p', l: 's', g: 'n', b: '1', e: 'ft', j: [],
    t: ['rózsaszín', 'szabadon álló', 'változatos', 'változatos', 'nincs / van', 'SZA, F, T'] },
  { n: 'Fakógomba', la: 'Hebeloma', s: 'b', l: 't', g: 'hn', b: '0', e: 'm', j: ['korpas'],
    t: ['barna', 'tönkhöz nőtt', 'fakó', 'csúcsa korpás', 'előfordul / nincs', 'M'] },
  { n: 'Tőkegomba', la: 'Kuehneromyces', s: 'b', l: 't', g: 'hn', b: '0', e: 'f', j: ['pikkT', 'pikkK'],
    t: ['barna', 'tönkhöz nőtt', 'pikkelyes / tapadós / sima', 'gyakran pikkelyes', 'előfordul / nincs', 'SZA, F'] },
  { n: 'Rétgomba', la: 'Agrocybe', s: 'b', l: 't', g: 'hn', b: '0', e: 'ft', j: ['rhizo'],
    t: ['barna', 'tönkhöz nőtt', 'változatos', 'gyakran rhizomorfa', 'előfordul / nincs', 'SZA'] },
  { n: 'Cölöpgomba', la: 'Paxillus', s: 'b', l: 'l', g: 'n', b: '0', e: 'mft', j: ['begony', 'suru', 'barnul'],
    t: ['barna', 'lefutó, sűrű, barnul', 'széle fiatalon begöngyölt', 'változatos', 'nincs', 'M / SZA'] },
  { n: 'Susulyka', la: 'Inocybe', s: 'r', l: 't', g: 'n', b: '0', e: 'm', j: ['harang', 'behas'],
    t: ['dohánybarna', 'tönkhöz nőtt', 'kúpos / harang alakú, behasadozó', 'változatos', 'nincs', 'M'] },
  { n: 'Pókhálósgomba', la: 'Cortinarius', s: 'r', l: 't', g: 'k', b: '0', e: 'm', j: [],
    t: ['rozsdabarna', 'tönkhöz nőtt', 'száraz vagy nyálkás', 'száraz vagy nyálkás', 'kortina: pókhálószerű részleges burok', 'M'] },
  { n: 'Csiperke', la: 'Agaricus', s: 'd', l: 's', g: 'h', b: '0', e: 't', j: ['sargul'],
    t: ['sötétbarna, csokoládébarna', 'szabadon álló', 'sárgulhat, vörösödhet', 'sárgulhat, vörösödhet', 'van / nincs', 'SZA, T'] },
  { n: 'Porhanyósgomba', la: 'Psathyrella', s: 'd', l: 't', g: 'n', b: '0', e: 'ft', j: ['higro', 'velum', 'ureges'],
    t: ['sötétbarna, csokoládébarna', 'tönkhöz nőtt', 'széle vélum maradványos, higrofán', 'üreges, törékeny', 'nincs', 'SZA, F, T'] },
  { n: 'Tintagomba', la: 'Coprinus / Coprinopsis', s: 'k', l: 's', g: 'n', b: '0', e: 'ft', j: ['harang', 'suru', 'ureges', 'elfoly'],
    t: ['fekete', 'szabadon álló, sűrű', 'harang alakú', 'üreges', 'nincs', 'SZA, F, T'] },
  { n: 'Kénvirággomba', la: 'Hypholoma', s: 'k', l: 't', g: 'n', b: '0', e: 'f', j: ['csop', 'feltuno'],
    t: ['fekete', 'tönkhöz nőtt', 'sárgás, vörös', 'többnyire csoportos', 'nincs', 'SZA, F'] },
  { n: 'Nyálkásgomba', la: 'Gomphidius', s: 'k', l: 'l', g: 'z', b: '0', e: 'm', j: ['nyalK', 'ritka'],
    t: ['fekete', 'lefutó, ritka', 'nyálkás, tapadós', 'hengeres, elvékonyodó', 'gallérzóna', 'M'] }
];

export const OSZLOPOK = ['Spórapor színe', 'Lemez', 'Kalap', 'Tönk', 'Gallér / bocskor', 'Életmód'];

const HU = 'GBIF, magyarországi észlelések';
export const TERMOIDO = {
  'Galóca': [[0, 0, 0, 0, 14, 57, 27, 25, 37, 100, 17, 2], 952],
  'Selyemgomba': [[1, 0, 0, 0, 1, 10, 30, 78, 100, 50, 10, 2], 15354, 'GBIF, európai észlelések (Amanita vaginata)'],
  'Őzlábgomba': [[0, 0, 0, 1, 5, 10, 5, 11, 54, 100, 36, 6], 441],
  'Fülőke': [[4, 0, 0, 2, 52, 37, 13, 35, 63, 100, 52, 26], 177],
  'Kígyógomba': [[4, 1, 3, 12, 24, 15, 2, 12, 41, 100, 87, 64], 537],
  'Szegfűgomba': [[9, 0, 0, 33, 41, 63, 28, 24, 83, 100, 85, 24], 225],
  'Csigagomba': [[5, 0, 0, 0, 0, 2, 0, 10, 43, 100, 57, 31], 104],
  'Tuskógomba': [[0, 0, 0, 0, 0, 0, 1, 1, 3, 100, 42, 9], 145],
  'Laskagomba': [[28, 17, 37, 21, 15, 30, 10, 12, 13, 66, 100, 42], 478],
  'Tölcsérgomba': [[8, 0, 0, 2, 2, 0, 8, 6, 16, 100, 90, 26], 129],
  'Pereszke': [[3, 0, 1, 3, 5, 2, 0, 5, 19, 100, 62, 23], 192],
  'Tejelőgomba': [[0, 0, 0, 0, 4, 17, 20, 25, 43, 100, 25, 0], 241],
  'Galambgomba': [[1, 0, 1, 0, 11, 85, 100, 68, 66, 62, 16, 2], 449],
  'Csengettyűgomba': [[3, 0, 17, 28, 69, 100, 67, 58, 92, 92, 44, 6], 207],
  'Döggomba': [[7, 14, 25, 57, 89, 36, 4, 32, 43, 100, 61, 29], 139],
  'Lisztgomba': [[0, 0, 0, 8, 15, 15, 8, 15, 46, 100, 31, 8], 32],
  'Bocskorosgomba': [[0, 0, 0, 4, 35, 65, 27, 42, 100, 35, 4, 0], 81],
  'Fakógomba': [[6, 0, 6, 6, 0, 6, 3, 3, 28, 100, 47, 11], 77],
  'Tőkegomba': [[0, 0, 0, 9, 18, 27, 0, 45, 9, 100, 0, 0], 23],
  'Rétgomba': [[0, 0, 6, 34, 100, 23, 3, 6, 26, 6, 17, 0], 77],
  'Cölöpgomba': [[0, 0, 0, 0, 4, 8, 0, 12, 48, 100, 20, 8], 50],
  'Susulyka': [[0, 0, 0, 3, 32, 32, 11, 5, 54, 100, 38, 3], 103],
  'Pókhálósgomba': [[0, 0, 0, 0, 5, 6, 8, 16, 39, 100, 9, 6], 146],
  'Csiperke': [[0, 2, 1, 9, 35, 33, 11, 30, 72, 100, 25, 5], 413],
  'Porhanyósgomba': [[0, 0, 25, 12, 8, 17, 12, 8, 38, 100, 54, 25], 72],
  'Tintagomba': [[1, 0, 14, 35, 14, 6, 0, 2, 22, 100, 35, 8], 328],
  'Kénvirággomba': [[1, 1, 9, 17, 22, 8, 3, 1, 18, 100, 35, 11], 265],
  'Nyálkásgomba': [[0, 0, 0, 0, 0, 14, 0, 0, 43, 100, 57, 0], 15]
};
for (const k of Object.keys(TERMOIDO)) {
  const [havi, n, f] = TERMOIDO[k];
  TERMOIDO[k] = { havi, n, forras: f || HU };
}

export const HONAPOK = ['jan', 'febr', 'márc', 'ápr', 'máj', 'jún', 'júl', 'aug', 'szept', 'okt', 'nov', 'dec'];
export const KUSZOB = 20;

export const NEM_LEMEZES = [
  ['tinorus', 'Tinórus'],
  ['taplo', 'Tapló'],
  ['pofeteg', 'Pöfeteg'],
  ['kucsma', 'Kucsmagomba'],
  ['korall', 'Korallgomba'],
  ['egyeb', 'Egyéb']
];
