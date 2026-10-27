# Niki fungi app 1.1 (webes app)

Lemezes gombák nemzetség szintű határozója saját fotótárral. iPhone-on és Androidon is fut, telepítés nélkül, a böngészőből a főképernyőre téve.

## Közzététel GitHub Pagesen (egyszer kell, számítógépről a legegyszerűbb)

1. Jelentkezz be a github.com oldalon.
2. Jobb felül **+** → **New repository**.
   - Repository name: `niki-fungi`
   - **Public** (a GitHub Pages az ingyenes csomagban csak nyilvános tárolóval működik; csak az app kódja lesz nyilvános, a fotóid nem)
   - Pipáld be: **Add a README file**
   - **Create repository**
3. A tárolóban: **Add file** → **Upload files**.
4. Csomagold ki a zip-et, és a **kicsomagolt mappa tartalmát** (nem magát a mappát) húzd be a böngészőablakba: `index.html`, `sw.js`, `manifest.webmanifest`, `README.md`, valamint a `css`, `js`, `icons`, `vendor` mappák.
   A meglévő README-t nyugodtan felülírhatja.
5. Lent **Commit changes**.
6. **Settings** → bal oldalt **Pages** → *Build and deployment* → Source: **Deploy from a branch**, Branch: **main**, mappa: **/(root)** → **Save**.
7. 1–2 perc múlva fent megjelenik a cím: `https://<felhasználóneved>.github.io/niki-fungi/`

## Telepítés a telefonra

**iPhone:** a címet **Safariban** nyisd meg → **Megosztás** gomb (négyzet felfelé nyíllal) → **Főképernyőhöz adás** → **Hozzáadás**.
**Android:** Chrome-ban nyisd meg → **⋮** menü → **Alkalmazás telepítése** (vagy *Hozzáadás a kezdőképernyőhöz*).

Ezután a „Niki fungi” ikonnal indul, teljes képernyőn, és az első megnyitás után offline is működik (a térkép háttere kivételével).
Az első fotónál a telefon engedélyt kér a helyhozzáféréshez – ezt engedélyezd, hogy a GPS-koordináta is mentődjön.

## Frissítés

Ha új verziót kapsz, ugyanígy töltsd fel a fájlokat (Upload files → felülírja a régieket).
A telefonon az app a következő 1–2 indításkor magától frissül.

## Adatok és adatvédelem

- A fotók, időpontok és GPS-koordináták **csak a telefonon**, a böngésző saját tárhelyén vannak, sehova nem töltődnek fel.
- Ha törlöd az appot vagy a Safari/Chrome webhelyadatait, a fotók is törlődnek → időnként készíts mentést: **Fotótár → adatbázis ikon → Mentés készítése → Mentés a Fájlokba**.
- Visszaállítás: ugyanott **Visszaállítás mentésből** (a meglévő fotók nem duplázódnak). Így telefonok között is átvihető a fotótár.
- A térkép háttere az OpenStreetMap szervereiről töltődik le; ehhez internet kell, és a szerver látja az IP-címet.
- A GitHub Pages az oldal betöltésekor szintén látja az IP-címet.

## Források

- Határozó: „Lemezes gombák határozási segédlete” táblázat (28 nemzetség)
- Termőidő: GBIF – Global Biodiversity Information Facility, magyarországi észlelések havi megoszlása (lekérdezve: 2026-10-25)
- Térkép: © OpenStreetMap közreműködők, Leaflet (BSD-2)
- EXIF-olvasás: exifr (MIT)

Az app nemzetség szintű tájékozódásra szolgál, ehetőséget nem állapít meg. Fogyasztás előtt minden gombát mutass meg gombaszakellenőrnek.
