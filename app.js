'use strict';
/*
 * Govor — offline speech board (AAC).
 * Everything is stored locally on the device (localStorage). No server, no accounts.
 */

const APP_VERSION = '1.3';
const LANGS = ['hr', 'en', 'it', 'de'];

const LANG_META = {
  hr: { flag: '🇭🇷', name: 'Hrvatski', bcp: 'hr-HR' },
  en: { flag: '🇬🇧', name: 'English', bcp: 'en-US' },
  it: { flag: '🇮🇹', name: 'Italiano', bcp: 'it-IT' },
  de: { flag: '🇩🇪', name: 'Deutsch', bcp: 'de-DE' },
};

/* Simulated voice variants: the same system voice with different pitch/rate.
   Used where the OS ships only one real voice (Croatian on iOS). */
const VOICE_PRESETS = {
  hr: [
    { id: 'normal', pitch: 1.0, rateMul: 1.0,
      label: { hr: 'Hrvatski — Normalno', en: 'Croatian — Normal', it: 'Croato — Normale', de: 'Kroatisch — Normal' } },
    { id: 'deep', pitch: 0.72, rateMul: 0.92,
      label: { hr: 'Hrvatski — Dublji glas', en: 'Croatian — Deeper voice', it: 'Croato — Voce più profonda', de: 'Kroatisch — Tiefere Stimme' } },
    { id: 'light', pitch: 1.3, rateMul: 1.08,
      label: { hr: 'Hrvatski — Lakši glas', en: 'Croatian — Lighter voice', it: 'Croato — Voce più chiara', de: 'Kroatisch — Hellere Stimme' } },
  ],
};

const I18N = {
  hr: {
    urgent: 'Hitno', common: 'Uobičajeno', recent: 'Nedavno',
    settings: 'Postavke', appLanguage: 'Jezik aplikacije',
    rate: 'Brzina govora', volume: 'Glasnoća', voices: 'Glasovi',
    voicesHint: 'Odaberite glas za svaki jezik. „Automatski” koristi instalirani glas za taj jezik.',
    auto: 'Automatski', testVoice: 'Isprobaj glas', sample: 'Ovo je proba glasa.',
    noVoice: 'Glas za {lang} nije instaliran na ovom uređaju. Na iPhoneu: Postavke → Pristupačnost → Izgovoreni sadržaj → Glasovi.',
    edit: 'Uredi fraze', done: 'Gotovo', addPhrase: 'Dodaj frazu',
    newPhrase: 'Nova fraza', editPhrase: 'Uredi frazu',
    phraseText: 'Tekst', phraseLang: 'Jezik fraze', category: 'Kategorija',
    builtinNote: 'Uređujete tekst za jezik: {lang}. Prijevodi na ostale jezike ostaju nepromijenjeni.',
    save: 'Spremi', delete: 'Izbriši', confirmDelete: 'Dodirnite opet za brisanje',
    typePlaceholder: 'Upišite poruku…', speak: 'Izgovori', repeatLast: 'Ponovi zadnju frazu',
    clear: 'Obriši tekst', close: 'Zatvori',
    noTts: 'Ovaj preglednik ne podržava sintezu govora.',
    privacyNote: 'Sve fraze i postavke ostaju na ovom uređaju.',
    langNames: { hr: 'hrvatski', en: 'engleski', it: 'talijanski', de: 'njemački' },
  },
  en: {
    urgent: 'Urgent', common: 'Common', recent: 'Recent',
    settings: 'Settings', appLanguage: 'App language',
    rate: 'Speech rate', volume: 'Volume', voices: 'Voices',
    voicesHint: '"Automatic" uses an installed voice for that language. You can pick a specific one here.',
    auto: 'Automatic', testVoice: 'Test voice', sample: 'This is a voice test.',
    noVoice: 'No {lang} voice is installed on this device. On iPhone: Settings → Accessibility → Spoken Content → Voices.',
    edit: 'Edit phrases', done: 'Done', addPhrase: 'Add phrase',
    newPhrase: 'New phrase', editPhrase: 'Edit phrase',
    phraseText: 'Text', phraseLang: 'Phrase language', category: 'Category',
    builtinNote: 'You are editing the {lang} text. The other languages keep their own text.',
    save: 'Save', delete: 'Delete', confirmDelete: 'Tap again to delete',
    typePlaceholder: 'Type a message…', speak: 'Speak', repeatLast: 'Repeat last phrase',
    clear: 'Clear text', close: 'Close',
    noTts: 'This browser does not support speech synthesis.',
    privacyNote: 'All phrases and settings stay on this device.',
    langNames: { hr: 'Croatian', en: 'English', it: 'Italian', de: 'German' },
  },
  it: {
    urgent: 'Urgente', common: 'Comuni', recent: 'Recenti',
    settings: 'Impostazioni', appLanguage: "Lingua dell'app",
    rate: 'Velocità della voce', volume: 'Volume', voices: 'Voci',
    voicesHint: '"Automatico" usa una voce installata per quella lingua. Qui puoi sceglierne una specifica.',
    auto: 'Automatico', testVoice: 'Prova la voce', sample: 'Questa è una prova della voce.',
    noVoice: 'Nessuna voce per {lang} è installata su questo dispositivo. Su iPhone: Impostazioni → Accessibilità → Contenuti letti ad alta voce → Voci.',
    edit: 'Modifica frasi', done: 'Fatto', addPhrase: 'Aggiungi frase',
    newPhrase: 'Nuova frase', editPhrase: 'Modifica frase',
    phraseText: 'Testo', phraseLang: 'Lingua della frase', category: 'Categoria',
    builtinNote: 'Stai modificando il testo in {lang}. Le altre lingue mantengono il proprio testo.',
    save: 'Salva', delete: 'Elimina', confirmDelete: 'Tocca di nuovo per eliminare',
    typePlaceholder: 'Scrivi un messaggio…', speak: 'Parla', repeatLast: "Ripeti l'ultima frase",
    clear: 'Cancella il testo', close: 'Chiudi',
    noTts: 'Questo browser non supporta la sintesi vocale.',
    privacyNote: 'Tutte le frasi e le impostazioni restano su questo dispositivo.',
    langNames: { hr: 'croato', en: 'inglese', it: 'italiano', de: 'tedesco' },
  },
  de: {
    urgent: 'Dringend', common: 'Häufig', recent: 'Zuletzt',
    settings: 'Einstellungen', appLanguage: 'App-Sprache',
    rate: 'Sprechtempo', volume: 'Lautstärke', voices: 'Stimmen',
    voicesHint: '„Automatisch" verwendet eine installierte Stimme für diese Sprache. Hier kannst du eine bestimmte wählen.',
    auto: 'Automatisch', testVoice: 'Stimme testen', sample: 'Das ist eine Sprechprobe.',
    noVoice: 'Für {lang} ist auf diesem Gerät keine Stimme installiert. iPhone: Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen.',
    edit: 'Sätze bearbeiten', done: 'Fertig', addPhrase: 'Satz hinzufügen',
    newPhrase: 'Neuer Satz', editPhrase: 'Satz bearbeiten',
    phraseText: 'Text', phraseLang: 'Sprache des Satzes', category: 'Kategorie',
    builtinNote: 'Du bearbeitest den Text für: {lang}. Die anderen Sprachen behalten ihren eigenen Text.',
    save: 'Speichern', delete: 'Löschen', confirmDelete: 'Zum Löschen erneut tippen',
    typePlaceholder: 'Nachricht eingeben…', speak: 'Sprechen', repeatLast: 'Letzten Satz wiederholen',
    clear: 'Text löschen', close: 'Schließen',
    noTts: 'Dieser Browser unterstützt keine Sprachausgabe.',
    privacyNote: 'Alle Sätze und Einstellungen bleiben auf diesem Gerät.',
    langNames: { hr: 'Kroatisch', en: 'Englisch', it: 'Italienisch', de: 'Deutsch' },
  },
};

const DEFAULT_PHRASES = [
  // Urgent
  { id: 'b-suction', cat: 'urgent', t: { hr: 'Trebam aspiraciju', en: 'I need suction', it: 'Ho bisogno di aspirazione', de: 'Ich muss abgesaugt werden' } },
  { id: 'b-breathe', cat: 'urgent', t: { hr: 'Ne mogu dobro disati', en: "I can't breathe well", it: 'Non riesco a respirare bene', de: 'Ich kann nicht gut atmen' } },
  { id: 'b-nurse', cat: 'urgent', t: { hr: 'Pozovite medicinsku sestru', en: 'Please call the nurse', it: "Per favore, chiamate l'infermiera", de: 'Bitte rufen Sie eine Pflegekraft' } },
  { id: 'b-pain', cat: 'urgent', t: { hr: 'Boli me', en: "I'm in pain", it: 'Ho dolore', de: 'Ich habe Schmerzen' } },
  { id: 'b-wrong', cat: 'urgent', t: { hr: 'Nešto nije u redu', en: 'Something is wrong', it: 'Qualcosa non va', de: 'Etwas stimmt nicht' } },
  { id: 'b-emergency', cat: 'urgent', t: { hr: 'Hitno! Trebam pomoć!', en: 'Emergency! I need help!', it: 'Emergenza! Ho bisogno di aiuto!', de: 'Notfall! Ich brauche Hilfe!' } },
  // Common
  { id: 'b-yes', cat: 'common', t: { hr: 'Da', en: 'Yes', it: 'Sì', de: 'Ja' } },
  { id: 'b-no', cat: 'common', t: { hr: 'Ne', en: 'No', it: 'No', de: 'Nein' } },
  { id: 'b-thanks', cat: 'common', t: { hr: 'Hvala', en: 'Thank you', it: 'Grazie', de: 'Danke' } },
  { id: 'b-wait', cat: 'common', t: { hr: 'Pričekajte, molim vas', en: 'Please wait', it: 'Un momento, per favore', de: 'Bitte warten' } },
  { id: 'b-okay', cat: 'common', t: { hr: 'Dobro sam', en: "I'm okay", it: 'Sto bene', de: 'Mir geht es gut' } },
  { id: 'b-turn', cat: 'common', t: { hr: 'Okrenite me, molim vas', en: 'Please reposition me', it: 'Per favore, cambiatemi posizione', de: 'Bitte lagern Sie mich um' } },
  { id: 'b-hot', cat: 'common', t: { hr: 'Vruće mi je', en: "I'm too hot", it: 'Ho troppo caldo', de: 'Mir ist zu heiß' } },
  { id: 'b-cold', cat: 'common', t: { hr: 'Hladno mi je', en: "I'm cold", it: 'Ho freddo', de: 'Mir ist kalt' } },
  { id: 'b-hungry', cat: 'common', t: { hr: 'Gladan sam', en: "I'm hungry", it: 'Ho fame', de: 'Ich habe Hunger' } },
  { id: 'b-thirsty', cat: 'common', t: { hr: 'Žedan sam', en: "I'm thirsty", it: 'Ho sete', de: 'Ich habe Durst' } },
  { id: 'b-bathroom', cat: 'common', t: { hr: 'Moram na WC', en: 'I need the bathroom', it: 'Devo andare in bagno', de: 'Ich muss auf die Toilette' } },
  { id: 'b-repeat', cat: 'common', t: { hr: 'Ponovite, molim vas', en: 'Please repeat that', it: 'Può ripetere, per favore?', de: 'Bitte wiederholen Sie das' } },
  { id: 'b-sleep', cat: 'common', t: { hr: 'Želim spavati', en: 'I want to sleep', it: 'Voglio dormire', de: 'Ich möchte schlafen' } },
  { id: 'b-love', cat: 'common', t: { hr: 'Volim te', en: 'I love you', it: 'Ti voglio bene', de: 'Ich habe dich lieb' } },
  { id: 'b-later', cat: 'common', t: { hr: 'Ne sada, kasnije', en: 'Not now, maybe later', it: 'Non adesso, più tardi', de: 'Nicht jetzt, später' } },
  { id: 'b-pillow', cat: 'common', t: { hr: 'Namjestite mi jastuk, molim vas', en: 'Please adjust my pillow', it: 'Per favore, sistemate il cuscino', de: 'Bitte rücken Sie mein Kissen zurecht' } },
  { id: 'b-bananas', cat: 'common', t: { hr: 'Jedi banane', en: 'Eat bananas', it: 'Mangia le banane', de: 'Iss Bananen' } },
  { id: 'b-scratch', cat: 'common', t: { hr: 'Češkanje, molim', en: 'Please scratch me', it: 'Per favore, grattatemi', de: 'Bitte kratzen Sie mich' } },
  { id: 'b-amen', cat: 'common', t: { hr: 'Amen', en: 'Amen', it: 'Amen', de: 'Amen' } },
];

/* ---------------- storage ---------------- */

const STORE_KEY = 'govor.v1';

function defaultStore() {
  const nav = (navigator.language || 'hr').slice(0, 2).toLowerCase();
  const lang = LANGS.includes(nav) ? nav : 'hr';
  return {
    uiLang: lang,
    freeLang: lang,
    rate: 1,
    volume: 1,
    voices: { hr: '', en: '', it: '', de: '' }, // chosen voiceURI per language, '' = automatic
    custom: [],        // [{id, cat, lang, text}]
    overrides: {},     // built-in edits: { phraseId: { lang: text } }
    deleted: [],       // deleted built-in phrase ids
    recent: [],        // [{text, lang}] newest first, max 6
  };
}

function loadStore() {
  const d = defaultStore();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return d;
    const s = JSON.parse(raw);
    return { ...d, ...s, voices: { ...d.voices, ...(s.voices || {}) } };
  } catch (e) {
    return d;
  }
}

let store = loadStore();

function saveStore() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* storage blocked/full — keep running */ }
}

function t() { return I18N[store.uiLang]; }

/* ---------------- elements ---------------- */

const $ = (id) => document.getElementById(id);

const elLangBtn = $('btn-lang');
const elEditBtn = $('btn-edit');
const elSettingsBtn = $('btn-settings');
const elLangMenu = $('lang-menu');
const elWarning = $('voice-warning');
const elWarningText = $('voice-warning-text');
const elWarningClose = $('voice-warning-close');
const elSecRecent = $('sec-recent');
const elHRecent = $('h-recent');
const elRecentRow = $('recent-row');
const elHUrgent = $('h-urgent');
const elGridUrgent = $('grid-urgent');
const elHCommon = $('h-common');
const elGridCommon = $('grid-common');
const elStatus = $('speak-status');
const elStatusText = $('speak-status-text');
const elFreeLangs = $('freetext-langs');
const elRepeatBtn = $('btn-repeat');
const elFreeText = $('freetext');
const elClearBtn = $('btn-clear-text');
const elSpeakBtn = $('btn-speak-text');
const elOverlay = $('overlay');
const elSettingsPanel = $('settings-panel');
const elEditorPanel = $('editor-panel');

let editMode = false;
let editing = null; // { item: phrase-or-null, cat, lang, armed }
let bannerTimer = 0;

/* ---------------- speech ---------------- */

const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
let voicesLoaded = false;
let speakToken = 0;
let currentUtterance = null; // held so the utterance isn't garbage-collected mid-speech
let speaking = null;         // { key, text }
const warnedLangs = new Set();

function refreshVoices() {
  if (!synth) return;
  if (synth.getVoices().length) voicesLoaded = true;
  if (!elOverlay.classList.contains('hidden') && !elSettingsPanel.classList.contains('hidden')) {
    renderVoiceRows();
  }
}
if (synth) {
  synth.onvoiceschanged = refreshVoices;
  refreshVoices();
}

function voicesFor(lang) {
  if (!synth) return [];
  return synth.getVoices().filter(
    (v) => (v.lang || '').toLowerCase().replace('_', '-').split('-')[0] === lang
  );
}

function getPreset(lang) {
  const sel = store.voices[lang];
  if (!sel || !sel.startsWith('preset:')) return null;
  return (VOICE_PRESETS[lang] || []).find((p) => 'preset:' + p.id === sel) || null;
}

function pickVoice(lang) {
  const list = voicesFor(lang);
  if (!list.length) return null;
  const saved = store.voices[lang];
  if (saved && !saved.startsWith('preset:')) {
    const m = list.find((v) => v.voiceURI === saved);
    if (m) return m;
  }
  const bcp = LANG_META[lang].bcp.toLowerCase();
  const norm = (v) => (v.lang || '').toLowerCase().replace('_', '-');
  return (
    list.find((v) => norm(v) === bcp && v.default) ||
    list.find((v) => norm(v) === bcp) ||
    list.find((v) => v.default) ||
    list[0]
  );
}

function speak(text, lang, key, opts = {}) {
  text = String(text || '').trim();
  if (!text) return;
  if (!synth) { showBanner(t().noTts); return; }

  const token = ++speakToken;
  synth.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = LANG_META[lang].bcp;
  const voice = pickVoice(lang);
  if (voice) {
    u.voice = voice;
  } else if (voicesLoaded && !warnedLangs.has(lang)) {
    warnedLangs.add(lang);
    showBanner(t().noVoice.replace('{lang}', t().langNames[lang]));
  }
  const preset = getPreset(lang);
  u.rate = store.rate * (preset ? preset.rateMul : 1);
  u.pitch = preset ? preset.pitch : 1;
  u.volume = store.volume;

  let finished = false;
  let watchdog = 0;
  function done() {
    if (finished) return;
    finished = true;
    clearInterval(watchdog);
    if (token === speakToken) setSpeaking(null);
  }
  u.onend = done;
  u.onerror = done;
  // Safety net: some engines never fire onend (or onerror) reliably.
  let ticks = 0;
  watchdog = setInterval(() => {
    if (token !== speakToken) { clearInterval(watchdog); return; }
    ticks++;
    if ((ticks > 3 && !synth.speaking && !synth.pending) || ticks > 360) done();
  }, 500);

  currentUtterance = u;
  setSpeaking({ key, text });
  synth.speak(u);
  synth.resume(); // iOS: nudges a queue that got stuck in "paused"
  if (!opts.skipRecent) addRecent(text, lang);
}

function setSpeaking(s) {
  speaking = s;
  elStatusText.textContent = s ? s.text : '';
  elStatus.classList.toggle('active', !!s);
  applySpeakingClasses();
}

function applySpeakingClasses() {
  document.querySelectorAll('.speaking').forEach((n) => n.classList.remove('speaking'));
  if (!speaking) return;
  document.querySelectorAll('[data-key]').forEach((n) => {
    if (n.dataset.key === speaking.key) n.classList.add('speaking');
  });
}

function addRecent(text, lang) {
  store.recent = [
    { text, lang },
    ...store.recent.filter((r) => !(r.text === text && r.lang === lang)),
  ].slice(0, 20);
  saveStore();
  renderRecent();
}

function showBanner(msg) {
  elWarningText.textContent = msg;
  elWarning.classList.remove('hidden');
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => elWarning.classList.add('hidden'), 12000);
}

/* ---------------- phrase data ---------------- */

function phrasesFor(cat) {
  const out = [];
  for (const p of DEFAULT_PHRASES) {
    if (p.cat !== cat || store.deleted.includes(p.id)) continue;
    const ov = store.overrides[p.id];
    out.push({
      id: p.id, cat, builtin: true,
      text: (ov && ov[store.uiLang]) || p.t[store.uiLang],
      lang: store.uiLang,
    });
  }
  for (const c of store.custom) {
    if (c.cat === cat) out.push({ id: c.id, cat, builtin: false, text: c.text, lang: c.lang });
  }
  return out;
}

function newId() {
  return 'c-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

/* ---------------- rendering ---------------- */

function renderChrome() {
  const tr = t();
  document.documentElement.lang = store.uiLang;
  elLangBtn.textContent = LANG_META[store.uiLang].flag + ' ' + store.uiLang.toUpperCase();
  elLangBtn.setAttribute('aria-label', tr.appLanguage);
  elEditBtn.textContent = editMode ? '✓ ' + tr.done : '✏️';
  elEditBtn.setAttribute('aria-label', tr.edit);
  elEditBtn.classList.toggle('on', editMode);
  elSettingsBtn.setAttribute('aria-label', tr.settings);
  elWarningClose.setAttribute('aria-label', tr.close);
  elHRecent.textContent = tr.recent;
  elHUrgent.textContent = tr.urgent;
  elHCommon.textContent = tr.common;
  elFreeText.placeholder = tr.typePlaceholder;
  elSpeakBtn.textContent = tr.speak;
  elRepeatBtn.setAttribute('aria-label', tr.repeatLast);
  elRepeatBtn.title = tr.repeatLast;
  elClearBtn.setAttribute('aria-label', tr.clear);
  renderLangMenu();
}

function renderLangMenu() {
  elLangMenu.textContent = '';
  for (const l of LANGS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'menu-item';
    const flag = document.createElement('span');
    flag.className = 'flag';
    flag.textContent = LANG_META[l].flag;
    const name = document.createElement('span');
    name.textContent = LANG_META[l].name;
    b.append(flag, name);
    if (l === store.uiLang) {
      const check = document.createElement('span');
      check.className = 'check';
      check.textContent = '✓';
      b.append(check);
    }
    b.addEventListener('click', () => {
      elLangMenu.classList.add('hidden');
      setUiLang(l);
    });
    elLangMenu.append(b);
  }
}

function makePhraseButton(item) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'phrase' + (item.cat === 'urgent' ? ' urgent' : '') + (editMode ? ' editable' : '');
  b.dataset.key = 'p:' + item.id;
  if (!item.builtin) {
    const badge = document.createElement('span');
    badge.className = 'langbadge';
    badge.textContent = LANG_META[item.lang].flag;
    b.append(badge);
  }
  if (editMode) {
    const badge = document.createElement('span');
    badge.className = 'editbadge';
    badge.textContent = '✏️';
    b.append(badge);
  }
  const txt = document.createElement('span');
  txt.className = 'phrase-text';
  txt.textContent = item.text;
  b.append(txt);
  b.addEventListener('click', () => {
    if (editMode) openEditor(item);
    else speak(item.text, item.lang, 'p:' + item.id);
  });
  return b;
}

function renderGrid(cat) {
  const grid = cat === 'urgent' ? elGridUrgent : elGridCommon;
  grid.textContent = '';
  for (const item of phrasesFor(cat)) grid.append(makePhraseButton(item));
  if (editMode) {
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'phrase add-tile';
    add.textContent = '＋ ' + t().addPhrase;
    add.addEventListener('click', () => openEditor(null, cat));
    grid.append(add);
  }
}

function renderRecent() {
  elSecRecent.classList.toggle('hidden', editMode || store.recent.length === 0);
  elRecentRow.textContent = '';
  for (const r of store.recent) {
    const key = 't:' + r.lang + ':' + r.text;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'recentchip';
    b.dataset.key = key;
    const flag = document.createElement('span');
    flag.className = 'flag';
    flag.textContent = LANG_META[r.lang].flag;
    const txt = document.createElement('span');
    txt.className = 'txt';
    txt.textContent = r.text;
    b.append(flag, txt);
    b.addEventListener('click', () => speak(r.text, r.lang, key));
    elRecentRow.append(b);
  }
  applySpeakingClasses();
}

function renderFreeChips() {
  elFreeLangs.textContent = '';
  for (const l of LANGS) {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'chip' + (l === store.freeLang ? ' on' : '');
    c.textContent = LANG_META[l].flag + ' ' + l.toUpperCase();
    c.setAttribute('aria-label', LANG_META[l].name);
    c.addEventListener('click', () => {
      store.freeLang = l;
      saveStore();
      renderFreeChips();
    });
    elFreeLangs.append(c);
  }
}

function renderMain() {
  renderRecent();
  renderGrid('urgent');
  renderGrid('common');
  applySpeakingClasses();
}

function renderAll() {
  renderChrome();
  renderMain();
  renderFreeChips();
  if (!elOverlay.classList.contains('hidden') && !elSettingsPanel.classList.contains('hidden')) {
    renderSettings();
  }
}

function setUiLang(l) {
  store.uiLang = l;
  store.freeLang = l; // sensible default; still switchable per message
  saveStore();
  renderAll();
}

/* ---------------- settings panel ---------------- */

function renderSettings() {
  const tr = t();
  $('s-title').textContent = tr.settings;
  $('s-lang-label').textContent = tr.appLanguage;
  $('s-rate-label').textContent = tr.rate;
  $('s-vol-label').textContent = tr.volume;
  $('s-voices-title').textContent = tr.voices;
  $('s-voices-hint').textContent = tr.voicesHint;
  $('s-version').textContent = 'Govor ' + APP_VERSION + ' · ' + tr.privacyNote;
  $('btn-settings-close').setAttribute('aria-label', tr.close);

  const grid = $('s-lang-grid');
  grid.textContent = '';
  for (const l of LANGS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'langbig' + (l === store.uiLang ? ' on' : '');
    const flag = document.createElement('span');
    flag.className = 'flag';
    flag.textContent = LANG_META[l].flag;
    const name = document.createElement('span');
    name.textContent = LANG_META[l].name;
    b.append(flag, name);
    b.addEventListener('click', () => setUiLang(l));
    grid.append(b);
  }

  $('rate').value = store.rate;
  $('rate-val').textContent = store.rate.toFixed(2) + '×';
  $('volume').value = store.volume;
  $('vol-val').textContent = Math.round(store.volume * 100) + '%';
  renderVoiceRows();
}

function renderVoiceRows() {
  const rows = $('voice-rows');
  rows.textContent = '';
  for (const l of LANGS) {
    const row = document.createElement('div');
    row.className = 'voice-row';

    const label = document.createElement('span');
    label.className = 'vlabel';
    label.textContent = LANG_META[l].flag + ' ' + LANG_META[l].name;

    const sel = document.createElement('select');
    sel.setAttribute('aria-label', LANG_META[l].name);
    const auto = document.createElement('option');
    auto.value = '';
    auto.textContent = t().auto;
    sel.append(auto);
    if ((VOICE_PRESETS[l] || []).length && voicesFor(l).length) {
      for (const p of VOICE_PRESETS[l]) {
        const o = document.createElement('option');
        o.value = 'preset:' + p.id;
        o.textContent = p.label[store.uiLang];
        sel.append(o);
      }
    }
    for (const v of voicesFor(l)) {
      const o = document.createElement('option');
      o.value = v.voiceURI;
      o.textContent = v.name + ' (' + v.lang + ')';
      sel.append(o);
    }
    sel.value = store.voices[l] && [...sel.options].some((o) => o.value === store.voices[l])
      ? store.voices[l] : '';
    sel.addEventListener('change', () => {
      store.voices[l] = sel.value;
      saveStore();
    });

    const test = document.createElement('button');
    test.type = 'button';
    test.className = 'iconbtn vtest';
    test.textContent = '▶';
    test.setAttribute('aria-label', t().testVoice);
    test.addEventListener('click', () => speak(I18N[l].sample, l, 'test:' + l, { skipRecent: true }));

    row.append(label, sel, test);
    rows.append(row);
  }
}

/* ---------------- phrase editor ---------------- */

function openEditor(item, presetCat) {
  editing = {
    item: item || null,
    cat: item ? item.cat : (presetCat || 'common'),
    lang: item && !item.builtin ? item.lang : store.uiLang,
    armed: false,
  };
  const tr = t();
  $('e-title').textContent = item ? tr.editPhrase : tr.newPhrase;
  $('e-text-label').textContent = tr.phraseText;
  $('e-lang-label').textContent = tr.phraseLang;
  $('e-cat-label').textContent = tr.category;
  $('btn-editor-close').setAttribute('aria-label', tr.close);
  $('e-text').value = item ? item.text : '';

  const isBuiltin = !!(item && item.builtin);
  $('e-lang-block').classList.toggle('hidden', isBuiltin);
  $('e-cat-block').classList.toggle('hidden', isBuiltin);
  const note = $('e-note');
  note.classList.toggle('hidden', !isBuiltin);
  if (isBuiltin) note.textContent = tr.builtinNote.replace('{lang}', tr.langNames[store.uiLang]);

  const del = $('e-delete');
  del.classList.toggle('hidden', !item);
  del.classList.remove('armed');
  del.textContent = tr.delete;
  $('e-save').textContent = tr.save;

  renderEditorChips();
  openPanel('editor');
}

function renderEditorChips() {
  const langChips = $('e-lang-chips');
  langChips.textContent = '';
  for (const l of LANGS) {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'chip' + (l === editing.lang ? ' on' : '');
    c.textContent = LANG_META[l].flag + ' ' + LANG_META[l].name;
    c.addEventListener('click', () => { editing.lang = l; renderEditorChips(); });
    langChips.append(c);
  }
  const catChips = $('e-cat-chips');
  catChips.textContent = '';
  for (const cat of ['urgent', 'common']) {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'chip' + (cat === editing.cat ? ' on' : '');
    c.textContent = t()[cat];
    c.addEventListener('click', () => { editing.cat = cat; renderEditorChips(); });
    catChips.append(c);
  }
}

function saveEditor() {
  if (!editing) return;
  const text = $('e-text').value.trim();
  if (!text) return;
  const item = editing.item;
  if (!item) {
    store.custom.push({ id: newId(), cat: editing.cat, lang: editing.lang, text });
  } else if (item.builtin) {
    if (!store.overrides[item.id]) store.overrides[item.id] = {};
    store.overrides[item.id][store.uiLang] = text;
  } else {
    const c = store.custom.find((x) => x.id === item.id);
    if (c) { c.text = text; c.lang = editing.lang; c.cat = editing.cat; }
  }
  saveStore();
  closeOverlay();
  renderMain();
}

function deleteFromEditor() {
  if (!editing || !editing.item) return;
  const del = $('e-delete');
  if (!editing.armed) {
    editing.armed = true;
    del.classList.add('armed');
    del.textContent = t().confirmDelete;
    setTimeout(() => {
      if (editing) {
        editing.armed = false;
        del.classList.remove('armed');
        del.textContent = t().delete;
      }
    }, 3000);
    return;
  }
  const item = editing.item;
  if (item.builtin) {
    if (!store.deleted.includes(item.id)) store.deleted.push(item.id);
  } else {
    store.custom = store.custom.filter((x) => x.id !== item.id);
  }
  saveStore();
  closeOverlay();
  renderMain();
}

/* ---------------- overlay ---------------- */

function openPanel(which) {
  elOverlay.classList.remove('hidden');
  elSettingsPanel.classList.toggle('hidden', which !== 'settings');
  elEditorPanel.classList.toggle('hidden', which !== 'editor');
  if (which === 'settings') renderSettings();
}

function closeOverlay() {
  elOverlay.classList.add('hidden');
  elSettingsPanel.classList.add('hidden');
  elEditorPanel.classList.add('hidden');
  editing = null;
}

/* ---------------- events ---------------- */

elLangBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  elLangMenu.classList.toggle('hidden');
});
document.addEventListener('click', (e) => {
  if (!elLangMenu.classList.contains('hidden') && !elLangMenu.contains(e.target)) {
    elLangMenu.classList.add('hidden');
  }
});

elEditBtn.addEventListener('click', () => {
  editMode = !editMode;
  renderChrome();
  renderMain();
});

elSettingsBtn.addEventListener('click', () => openPanel('settings'));
$('btn-settings-close').addEventListener('click', closeOverlay);
$('btn-editor-close').addEventListener('click', closeOverlay);
elOverlay.addEventListener('click', (e) => { if (e.target === elOverlay) closeOverlay(); });
elWarningClose.addEventListener('click', () => elWarning.classList.add('hidden'));

$('rate').addEventListener('input', (e) => {
  store.rate = parseFloat(e.target.value);
  $('rate-val').textContent = store.rate.toFixed(2) + '×';
});
$('rate').addEventListener('change', () => {
  saveStore();
  speak(t().sample, store.uiLang, 'test:rate', { skipRecent: true });
});
$('volume').addEventListener('input', (e) => {
  store.volume = parseFloat(e.target.value);
  $('vol-val').textContent = Math.round(store.volume * 100) + '%';
});
$('volume').addEventListener('change', () => {
  saveStore();
  speak(t().sample, store.uiLang, 'test:volume', { skipRecent: true });
});

$('e-save').addEventListener('click', saveEditor);
$('e-delete').addEventListener('click', deleteFromEditor);

function speakFreeText() {
  const text = elFreeText.value.trim();
  if (!text) return;
  speak(text, store.freeLang, 't:' + store.freeLang + ':' + text);
}
elSpeakBtn.addEventListener('click', speakFreeText);
elFreeText.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); speakFreeText(); }
});
elClearBtn.addEventListener('click', () => {
  elFreeText.value = '';
  elFreeText.focus();
});
elRepeatBtn.addEventListener('click', () => {
  const r = store.recent[0];
  if (r) speak(r.text, r.lang, 't:' + r.lang + ':' + r.text);
});

/* ---------------- init ---------------- */

renderAll();

if ('serviceWorker' in navigator) {
  // A new service worker taking over means new app files are cached and ready.
  // Reload once so the update shows on this visit rather than the next one.
  // hadController distinguishes an update from the very first install.
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    if (synth && (synth.speaking || synth.pending)) return; // never cut off speech
    reloading = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
      .then((reg) => {
        reg.update().catch(() => {});
        // Catch updates published while the app sits open at the bedside.
        setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
      })
      .catch(() => { /* offline-first still works without SW on http */ });
  });
}
