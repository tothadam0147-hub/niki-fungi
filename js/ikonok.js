// Vonalas ikonok (Tabler stílusban), helyben, hogy offline is működjenek.
const s = belso => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${belso}</svg>`;

export const I = {
  kereses: s('<circle cx="10" cy="10" r="7"/><path d="M21 21l-6-6"/>'),
  tabla: s('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M10 4v16"/>'),
  foto: s('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>'),
  info: s('<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/>'),
  kamera: s('<path d="M5 7h1a2 2 0 0 0 2-2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2"/><circle cx="12" cy="13" r="3"/>'),
  plusz: s('<path d="M12 5v14M5 12h14"/>'),
  balra: s('<path d="M15 6l-6 6 6 6"/>'),
  jobbra: s('<path d="M9 6l6 6-6 6"/>'),
  le: s('<path d="M6 9l6 6 6-6"/>'),
  fel: s('<path d="M6 15l6-6 6 6"/>'),
  kuka: s('<path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>'),
  hely: s('<circle cx="12" cy="11" r="3"/><path d="M17.657 16.657L13.414 20.9a2 2 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"/>'),
  terkep: s('<path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7M9 4v13M15 7v13"/>'),
  figy: s('<path d="M12 9v4M12 17h.01"/><path d="M10.363 3.591L2.257 17.125a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636-2.87L13.637 3.59a1.914 1.914 0 0 0-3.274 0z"/>'),
  pipa: s('<circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/>'),
  letolt: s('<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12"/>'),
  feltolt: s('<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 9l5-5 5 5M12 4v12"/>'),
  mentes: s('<path d="M4 6c0 1.657 3.582 3 8 3s8-1.343 8-3s-3.582-3-8-3s-8 1.343-8 3"/><path d="M4 6v6c0 1.657 3.582 3 8 3s8-1.343 8-3V6"/><path d="M4 12v6c0 1.657 3.582 3 8 3s8-1.343 8-3v-6"/>'),
  megoszt: s('<path d="M8 9h-1a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1M12 14V3M9 6l3-3 3 3"/>'),
  celpont: s('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="7"/>'),
  lista: s('<path d="M9 6h11M9 12h11M9 18h11M5 6v.01M5 12v.01M5 18v.01"/>'),
  // nem lemezes csoportok
  tinorus: s('<circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1"/><circle cx="14" cy="9" r="1"/><circle cx="12" cy="14" r="1"/><circle cx="16" cy="14" r="1"/><circle cx="8" cy="15" r="1"/>'),
  taplo: s('<path d="M12 4L4 8l8 4 8-4-8-4M4 12l8 4 8-4M4 16l8 4 8-4"/>'),
  pofeteg: s('<path d="M5 15a7 7 0 1 1 14 0c0 2.5-3 4-7 4s-7-1.5-7-4z"/><path d="M10 9h.01M14 11h.01M11 13h.01"/>'),
  kucsma: s('<path d="M12 3c3.5 0 5.5 3.5 5.5 8s-2 6-5.5 6-5.5-1.5-5.5-6 2-8 5.5-8z"/><path d="M12 17v4M8.5 8.5l7 0M7 12h10M9 6v9M15 6v9"/>'),
  korall: s('<path d="M12 21v-9M12 12l-4-4M12 12l4-4M8 8V4M16 8V4M12 16l-3-3M12 16l3-3M6 6l2 2M18 6l-2 2"/>'),
  egyeb: s('<path d="M5 12h.01M12 12h.01M19 12h.01"/>')
};

export const pinSvg = szin => `<svg viewBox="0 0 32 40" aria-hidden="true"><path fill="#fff" d="M16 0C7.2 0 0 7.2 0 16c0 11.5 16 24 16 24s16-12.5 16-24C32 7.2 24.8 0 16 0z"/><path fill="${szin}" d="M16 2C8.3 2 2 8.3 2 16c0 9.8 14 21.4 14 21.4S30 25.8 30 16C30 8.3 23.7 2 16 2z"/><circle fill="#fff" cx="16" cy="16" r="5"/></svg>`;
