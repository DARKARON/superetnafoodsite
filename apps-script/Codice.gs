// Super Etna Food · Adotta un limone — servizio su Google Apps Script
// Salva alberi, foto e diario in questo Foglio Google e le immagini in una cartella di Drive.
// La password master si imposta in Impostazioni progetto → Proprietà script → MASTER_PASSWORD.

const CARTELLA = 'Super Etna Food – Adotta un limone';
const TAB = {
  Alberi: ['numero','password','adottante','email','formula','inizio','varieta','posizione','impianto','ultimaRaccolta','note','certificato','consegne','stato','nomeProposto','dettoProposto','traduzioneProposta','fotoTarghetta','inviatoIl','motivo','nomePianta','detto','traduzione','approvatoIl','targa','telefono','consegnaPref','utente'],
  Adozioni: ['email','password','adottante','formula','inizio','albero','telefono','consegna','creataIl','sceltaIl','mailInviata','utente'],
  Foto: ['id','numero','data','nota','fileId','src'],
  Diario: ['id','numero','data','tipo','testo','kg']
};
const DATI = ['password','adottante','email','formula','inizio','varieta','posizione','impianto','ultimaRaccolta','note','certificato','consegne','targa','telefono','consegnaPref'];
const ALBERI_ADOTTABILI = 100;
const CARTELLA_FOTO_PIANTE = '1aH70DmThPMvNrok_b-BvNOty8IHYoB8S'; // cartella Drive "foto-piante": file chiamati pianta-NUMERO-AAAA-MM-GG…jpg
const SITO = 'https://www.superetnafood.it/area-riservata.html';

function doGet() { return ContentService.createTextOutput('Super Etna Food: servizio attivo.'); }

function doPost(e) {
  const lock = LockService.getScriptLock();
  let out;
  try {
    const corpo = String(e && e.postData && e.postData.contents || '');
    if (corpo.length > 6000000) throw new Error('Richiesta troppo grande.');
    lock.waitLock(20000); out = { ok: true, dati: esegui(JSON.parse(corpo)) };
  }
  catch (err) { out = { ok: false, errore: String(err && err.message || err) }; }
  finally { try { lock.releaseLock(); } catch (x) {} }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

const pad = n => String(n == null ? '' : n).trim().replace(/^0+/, '').padStart(3, '0');
const oggi = () => Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
const desc = (x, y) => String(y.data).localeCompare(String(x.data));

function foglio(nome) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(nome);
  if (!sh) {
    sh = ss.insertSheet(nome);
    sh.getRange('A:Z').setNumberFormat('@');
    sh.getRange(1, 1, 1, TAB[nome].length).setValues([TAB[nome]]).setFontWeight('bold');
    sh.setFrozenRows(1);
  } else if (sh.getLastColumn() < TAB[nome].length) {
    sh.getRange(1, 1, 1, TAB[nome].length).setValues([TAB[nome]]).setFontWeight('bold');
  }
  return sh;
}
function leggi(nome) {
  const v = foglio(nome).getDataRange().getValues(), h = v[0];
  return v.slice(1).map((r, i) => {
    const o = { _riga: i + 2 };
    h.forEach((k, j) => { let x = r[j]; if (x instanceof Date) x = Utilities.formatDate(x, Session.getScriptTimeZone(), 'yyyy-MM-dd'); o[k] = x == null ? '' : String(x); });
    return o;
  }).filter(o => h.some(k => o[k] !== ''));
}
function scrivi(nome, o) {
  const sh = foglio(nome), h = TAB[nome];
  const riga = h.map(k => sicuro(o[k] == null ? '' : (typeof o[k] === 'object' ? JSON.stringify(o[k]) : String(o[k]))));
  if (o._riga) sh.getRange(o._riga, 1, 1, h.length).setValues([riga]); else sh.appendRow(riga);
}
// Blocca le formule nel foglio: un testo che inizia con = + - @ viene salvato come testo puro.
function sicuro(s) { return /^[=+\-@\t\r]/.test(s) ? "'" + s : s; }
// Tentativi sbagliati: dopo «max» errori la chiave resta bloccata per «minuti».
function bloccato(chiave, max) { return +(CacheService.getScriptCache().get('tent-' + chiave) || 0) >= max; }
function errore(chiave, minuti) { const c = CacheService.getScriptCache(), k = 'tent-' + chiave, n = +(c.get(k) || 0) + 1; c.put(k, String(n), minuti * 60); return n; }
function azzera(chiave) { CacheService.getScriptCache().remove('tent-' + chiave); }
function elimina(nome, id) {
  const r = leggi(nome).find(x => x.id === id);
  if (r) foglio(nome).deleteRow(r._riga);
  return r;
}
function trova(numero) { return leggi('Alberi').find(a => pad(a.numero) === pad(numero)); }

// Foto dell'albero per certificato e immagine social: la restituisce come dataURL, così il browser può disegnarla.
function fotoAlbero(n) {
  const id = s => { const m = String(s || '').match(/id=([\w-]+)/); return m ? m[1] : ''; };
  let fid = '';
  try { const g = galleria().find(x => x.numero === n); if (g) fid = id(g.src); } catch (e) {}
  if (!fid) { const f = leggi('Foto').filter(x => pad(x.numero) === n).sort(desc)[0]; if (f) fid = f.fileId || id(f.src); }
  if (!fid) return null;
  let b;
  try { b = UrlFetchApp.fetch('https://drive.google.com/thumbnail?id=' + fid + '&sz=w1400', { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true }); b = b.getResponseCode() === 200 ? b.getBlob() : null; } catch (e) { b = null; }
  if (!b) { const f = DriveApp.getFileById(fid); if (f.getSize() > 6000000) return null; b = f.getBlob(); }
  return 'data:' + (b.getContentType() || 'image/jpeg') + ';base64,' + Utilities.base64Encode(b.getBytes());
}
function vista(a, conPw, foto, diario) {
  const n = pad(a.numero), c = Object.assign({}, a);
  delete c._riga; c.numero = n;
  if (!conPw || cifrata(c.password)) delete c.password;
  try { c.consegne = JSON.parse(a.consegne || '[]'); } catch (e) { c.consegne = []; }
  const pulisci = x => { const y = Object.assign({}, x); delete y._riga; return y; };
  c.foto = (foto || leggi('Foto')).filter(f => pad(f.numero) === n).sort(desc).map(pulisci);
  c.diario = (diario || leggi('Diario')).filter(f => pad(f.numero) === n).sort(desc).map(pulisci);
  return c;
}
function adozione(u) { const e = String(u || '').trim().toLowerCase(); return e ? leggi('Adozioni').find(x => String(x.utente).toLowerCase() === e) : null; }
const CAMPI_ADOZIONE = ['password','adottante','email','utente','formula','inizio','telefono','consegnaPref','targa','consegne','certificato','stato','motivo','nomeProposto','dettoProposto','traduzioneProposta','fotoTarghetta','inviatoIl','nomePianta','detto','traduzione','approvatoIl'];
function svuotaAlbero(al) { CAMPI_ADOZIONE.forEach(k => { al[k] = k === 'consegne' ? '[]' : ''; }); }
function elencoAdozioni() { return leggi('Adozioni').map(vistaAdozione).sort((x, y) => String(y.creataIl).localeCompare(String(x.creataIl))); }
function nomeUtenteValido(u) {
  u = String(u || '').trim();
  if (!/^[A-Za-z0-9._-]{3,30}$/.test(u)) throw new Error('Nome utente non valido: da 3 a 30 caratteri, solo lettere, numeri, punto, trattino e trattino basso.');
  if (u.toLowerCase() === 'pericle22') throw new Error('Questo nome utente è riservato.');
  return u;
}
function liberi() {
  const presi = {};
  leggi('Alberi').forEach(a => { if (a.adottante || a.email || a.password || a.utente) presi[pad(a.numero)] = 1; });
  const out = [];
  for (let i = 1; i <= ALBERI_ADOTTABILI; i++) if (!presi[pad(i)]) out.push(pad(i));
  return out;
}
function galleria() {
  const cache = CacheService.getScriptCache(), c = cache.get('galleria');
  if (c) return JSON.parse(c);
  const ult = {}, it = DriveApp.getFolderById(CARTELLA_FOTO_PIANTE).getFiles();
  while (it.hasNext()) {
    const f = it.next(); if (String(f.getMimeType()).indexOf('image/') !== 0) continue;
    const m = f.getName().match(/pianta[-_ ]?(\d+)(?:[-_ ](\d{4}-\d{2}-\d{2}))?/i); if (!m) continue;
    const n = pad(m[1]), d = m[2] || Utilities.formatDate(f.getDateCreated(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    if (!ult[n] || d > ult[n].data) ult[n] = { numero: n, data: d, src: 'https://drive.google.com/thumbnail?id=' + f.getId() + '&sz=w1000' };
  }
  const out = Object.keys(ult).sort().map(k => ult[k]);
  try { cache.put('galleria', JSON.stringify(out), 600); } catch (e) {}
  return out;
}
// Password cifrate: HMAC-SHA256 con sale per utente e una chiave segreta (PEPE) nelle Proprietà script.
const CIF = 'h1$';
function pepe() { const P = PropertiesService.getScriptProperties(); let s = P.getProperty('PEPE'); if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); P.setProperty('PEPE', s); } return s; }
function cifraCon(sale, pw) { return CIF + sale + '$' + Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(sale + ':' + String(pw).trim(), pepe())); }
// Cifratura disattivata: le password nuove si salvano in chiaro. Le vecchie cifrate (h1$…) funzionano ancora e tornano in chiaro al primo accesso.
function cifra(pw) { return String(pw || '').trim(); }
function cifrata(s) { return String(s || '').indexOf(CIF) === 0; }
function verifica(salvata, pw) {
  salvata = String(salvata || '').trim(); pw = String(pw || '').trim();
  if (!salvata || !pw) return false;
  if (!cifrata(salvata)) return salvata === pw;
  return cifraCon(salvata.split('$')[1], pw) === salvata;
}
function cifraTutto() {
  leggi('Adozioni').forEach(ad => { if (ad.password && !cifrata(ad.password)) { ad.password = cifra(ad.password); scrivi('Adozioni', ad); } });
  leggi('Alberi').forEach(al => {
    if (!al.password || cifrata(al.password)) return;
    const ad = al.utente ? adozione(al.utente) : null;
    al.password = ad && cifrata(ad.password) ? ad.password : cifra(al.password); scrivi('Alberi', al);
  });
  PropertiesService.getScriptProperties().setProperty('CIFRATE', oggi());
}
function conChiara(lista, u, pw) { const x = lista.find(y => String(y.utente).toLowerCase() === String(u).toLowerCase()); if (x) x.password = pw; return lista; }
function impostaPassword(ad, pw) {
  azzera('u-' + String(ad.utente || '').trim().toLowerCase().slice(0, 40));
  ad.password = cifra(pw); scrivi('Adozioni', ad);
  if (ad.albero) { const al = trova(ad.albero); if (al) { al.password = ad.password; scrivi('Alberi', al); } }
}
function nuovaPassword() {
  const p = ['zagara','verdello','agrume','etna','sciara','zolfo','limone','scorza','fiore','foglia'];
  return p[Math.floor(Math.random() * p.length)] + '-' + (1000 + Math.floor(Math.random() * 9000));
}
function mailCredenziali(ad, pw) {
  MailApp.sendEmail(ad.email, 'Il tuo albero sull\'Etna · credenziali dell\'area riservata',
    'Ciao' + (ad.adottante ? ' ' + ad.adottante : '') + ',\n\ngrazie per aver adottato un limone sull\'Etna' + (ad.formula ? ' con la formula ' + ad.formula : '') + '.\n\n' +
    'Ecco le credenziali della tua area riservata:\nNome utente: ' + ad.utente + '\nPassword: ' + pw + '\n\nEntra qui: ' + SITO + '\n\n' +
    'Scegli il tuo albero tra quelli ancora liberi e inserisci il nome da mettere sulla targhetta. Se entro 7 giorni non l\'hai ancora scelto, te ne assegno uno io: potrai chiedermi di cambiarlo finché la targhetta non è stata incisa.\n\n' +
    'Questa mail vale anche come conferma dell\'adozione. Serve come promemoria e non ha valore fiscale.\n\nAntonio Grasso\nSuper Etna Food · Acireale\nWhatsApp +39 351 528 6188');
  ad.mailInviata = oggi();
}
function assegna(ad, numero, dati) {
  const n = pad(numero);
  if (+n < 1 || +n > ALBERI_ADOTTABILI) throw new Error('Albero non valido.');
  if (liberi().indexOf(n) < 0) throw new Error('Questo albero è appena stato scelto da qualcun altro: scegline un altro.');
  const a = trova(n) || { numero: n, stato: '' };
  ['stato','motivo','nomeProposto','dettoProposto','traduzioneProposta','fotoTarghetta','inviatoIl','nomePianta','detto','traduzione','approvatoIl','targa','certificato'].forEach(k => { if (k in a) a[k] = ''; }); a.consegne = [];
  a.numero = n; a.password = ad.password; a.email = ad.email || ''; a.utente = ad.utente; a.formula = ad.formula; a.inizio = ad.inizio || oggi();
  a.adottante = dati.adottante || ad.adottante || ''; a.telefono = dati.telefono || ad.telefono || ''; a.consegnaPref = dati.consegna || ad.consegna || '';
  scrivi('Alberi', a);
  ad.albero = n; ad.adottante = a.adottante; ad.telefono = a.telefono; ad.consegna = a.consegnaPref; ad.sceltaIl = oggi();
  scrivi('Adozioni', ad);
  return a;
}
function vistaAdozione(ad) { return { utente: ad.utente, email: ad.email, adottante: ad.adottante, formula: ad.formula, inizio: ad.inizio, albero: ad.albero ? pad(ad.albero) : '', telefono: ad.telefono, consegna: ad.consegna, creataIl: ad.creataIl, sceltaIl: ad.sceltaIl, mailInviata: ad.mailInviata, password: cifrata(ad.password) ? '' : ad.password }; }
function credenziali(p) {
  const k = 'u-' + String(p.numero || '').trim().toLowerCase().slice(0, 40);
  if (bloccato(k, 6)) throw new Error('Troppi tentativi sbagliati: riprova tra 15 minuti o scrivimi su WhatsApp.');
  const ad = adozione(p.numero);
  if (!ad || !verifica(ad.password, p.password)) { errore(k, 15); throw new Error('Nome utente o password non corretti.'); }
  azzera(k);
  if (cifrata(ad.password)) impostaPassword(ad, String(p.password).trim());
  return ad;
}
function utente(p) {
  const ad = credenziali(p);
  if (!ad.albero) throw new Error('Prima scegli il tuo albero.');
  return trova(ad.albero);
}
function master(p) {
  if (bloccato('master', 8)) throw new Error('Accesso amministratore bloccato per 30 minuti dopo troppi tentativi.');
  const pw = PropertiesService.getScriptProperties().getProperty('MASTER_PASSWORD');
  if (!pw || p.master !== pw) {
    const n = errore('master', 30);
    if (n === 8) try { MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'ATTENZIONE · tentativi di accesso amministratore', 'Qualcuno ha sbagliato 8 volte la password master del sito. L\'accesso amministratore è bloccato per 30 minuti. Se non eri tu, cambia MASTER_PASSWORD nelle Proprietà script.'); } catch (e) {}
    throw new Error('Password master non corretta.');
  }
}
function salvaImmagine(dataUrl, nome) {
  if (String(dataUrl).length > 5500000) throw new Error('Immagine troppo grande: massimo 4 MB.');
  const m = String(dataUrl).match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+\/=]+)$/);
  if (!m) throw new Error('Immagine non valida: usa una foto JPG, PNG o WebP.');
  m[1] = 'image/' + m[1];
  const it = DriveApp.getFoldersByName(CARTELLA), cart = it.hasNext() ? it.next() : DriveApp.createFolder(CARTELLA);
  const f = cart.createFile(Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], nome));
  f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { fileId: f.getId(), src: 'https://drive.google.com/thumbnail?id=' + f.getId() + '&sz=w1600' };
}

function esegui(p) {
  if (String(p.azione).charAt(0) === 'm') master(p);
  const n = p.numero != null ? pad(p.numero) : (p.albero ? pad(p.albero.numero) : '');
  let a;
  switch (p.azione) {
    case 'liberiFoto': { const lib = liberi(); let gal = []; try { gal = galleria(); } catch (e) {} return { liberi: lib, galleria: gal }; }
    case 'cambia': {
      const vecchio = utente(p);
      if (vecchio.stato === 'inviato' || vecchio.stato === 'approvato') throw new Error('La targhetta è già stata inviata: per cambiare albero scrivimi su WhatsApp.');
      const nn = pad(p.nuovo);
      if (+nn < 1 || +nn > ALBERI_ADOTTABILI) throw new Error('Albero non valido.');
      if (liberi().indexOf(nn) < 0) throw new Error('Questo albero è appena stato scelto da qualcun altro: scegline un altro.');
      const nuovo = trova(nn) || { numero: nn, stato: '' };
      ['password','adottante','email','utente','formula','inizio','telefono','consegnaPref','targa','consegne','certificato','stato','motivo','nomeProposto','dettoProposto','traduzioneProposta','fotoTarghetta','inviatoIl'].forEach(k => { nuovo[k] = vecchio[k] || ''; vecchio[k] = ''; });
      nuovo.numero = nn; scrivi('Alberi', vecchio); scrivi('Alberi', nuovo);
      const ad = nuovo.utente ? adozione(nuovo.utente) : null;
      if (ad) { ad.albero = nn; scrivi('Adozioni', ad); }
      try { MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'Cambio albero · da n. ' + pad(vecchio.numero) + ' a n. ' + nn, (nuovo.adottante || 'Un adottante') + ' (' + (nuovo.utente || '—') + ') è passato dall\'albero n. ' + pad(vecchio.numero) + ' al n. ' + nn + '.'); } catch (e) {}
      return vista(trova(nn));
    }
    case 'versione': return 'senza-cifratura-2026-11-09';
    case 'disponibili': { const lb = liberi(); return { liberi: Math.min(ALBERI_ADOTTABILI, lb.length + (lb.indexOf('001') < 0 ? 1 : 0)), totale: ALBERI_ADOTTABILI }; } // l'albero 001 è l'esempio: non conta
    case 'accedi': {
      const ad = credenziali(p);
      if (!ad.albero) { const lib = liberi(); let gal = []; try { gal = galleria().filter(g => lib.indexOf(g.numero) >= 0); } catch (e) {} return { daScegliere: true, utente: ad.utente, email: ad.email, adottante: ad.adottante, formula: ad.formula, telefono: ad.telefono, consegna: ad.consegna, liberi: lib, galleria: gal }; }
      return vista(trova(ad.albero));
    }
    case 'fotoCert': {
      const ad = credenziali(p);
      if (!ad.albero) throw new Error('Scegli prima il tuo albero.');
      return fotoAlbero(pad(ad.albero));
    }
    case 'scegli': {
      const ad = credenziali(p);
      if (ad.albero) throw new Error('Hai già scelto il tuo albero: il n. ' + pad(ad.albero) + '.');
      if (!String(p.adottante || '').trim()) throw new Error('Scrivi il tuo nome e cognome.');
      if (!String(p.telefono || '').trim()) throw new Error('Scrivi il tuo numero di telefono.');
      a = assegna(ad, p.albero, { adottante: String(p.adottante).trim().slice(0, 60), telefono: String(p.telefono).trim().slice(0, 30), consegna: String(p.consegna || '').slice(0, 300) });
      try {
        MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'Albero scelto · n. ' + pad(a.numero),
          a.adottante + ' (utente ' + a.utente + ', tel. ' + a.telefono + ') ha scelto l\'albero n. ' + pad(a.numero) + ' con la formula ' + (a.formula || '—') + '.\nConsegna: ' + (a.consegnaPref || '—'));
      } catch (e) {}
      return vista(a);
    }
    case 'mFotoCert': return fotoAlbero(n);
    case 'mAdozioni': return elencoAdozioni();
    case 'mNuovaAdozione': {
      const u = nomeUtenteValido(p.utente);
      if (adozione(u)) throw new Error('Il nome utente ' + u + ' è già usato: scegline un altro.');
      const email = String(p.email || '').trim().toLowerCase();
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Mail non valida.');
      const pw = String(p.password || '').trim() || nuovaPassword();
      if (pw.length < 6) throw new Error('La password deve avere almeno 6 caratteri.');
      const ad = { utente: u, email: email, password: cifra(pw), adottante: String(p.adottante || '').trim(), formula: p.formula || '', inizio: p.inizio || oggi(), albero: '', creataIl: oggi() };
      if (p.invia && email) mailCredenziali(ad, pw);
      scrivi('Adozioni', ad);
      return conChiara(elencoAdozioni(), u, pw);
    }
    case 'mCredenziali': {
      const ad = adozione(p.utente); if (!ad) throw new Error('Adozione non trovata.');
      const pw = String(p.password || '').trim();
      if (pw.length < 6) throw new Error('La password deve avere almeno 6 caratteri.');
      impostaPassword(ad, pw);
      return conChiara(elencoAdozioni(), ad.utente, pw);
    }
    case 'mInviaCredenziali': {
      const ad = adozione(p.utente); if (!ad) throw new Error('Adozione non trovata.');
      if (!ad.email) throw new Error('Per questa adozione non c\'è una mail: manda le credenziali su WhatsApp.');
      const vecchia = cifrata(ad.password), pw = vecchia ? nuovaPassword() : String(ad.password).trim();
      mailCredenziali(ad, pw); if (vecchia) impostaPassword(ad, pw); else scrivi('Adozioni', ad);
      return conChiara(elencoAdozioni(), ad.utente, pw);
    }
    case 'mAssegna': {
      const ad = adozione(p.utente); if (!ad) throw new Error('Adozione non trovata.');
      if (ad.albero) throw new Error('Questa adozione ha già l\'albero n. ' + pad(ad.albero) + '.');
      assegna(ad, p.albero, {});
      return elencoAdozioni();
    }
    case 'mEliminaAdozione': {
      const ad = adozione(p.utente); if (!ad) throw new Error('Adozione non trovata.');
      if (ad.albero) { const al = trova(ad.albero); if (al) { svuotaAlbero(al); scrivi('Alberi', al); } }
      foglio('Adozioni').deleteRow(adozione(p.utente)._riga);
      return elencoAdozioni();
    }

    case 'proponi': {
      a = utente(p);
      if (a.stato === 'inviato' || a.stato === 'approvato') throw new Error('La targhetta è già stata inviata.');
      const nome = String(p.nome || '').trim().slice(0, 32);
      if (!nome) throw new Error('Scrivi il nome della pianta.');
      a.nomeProposto = nome;
      a.dettoProposto = String(p.detto || '').slice(0, 80);
      a.traduzioneProposta = String(p.traduzione || '').slice(0, 100);
      a.fotoTarghetta = p.foto ? salvaImmagine(p.foto, 'targhetta-' + pad(a.numero) + '.jpg').src : '';
      a.stato = 'inviato'; a.inviatoIl = oggi(); a.motivo = '';
      scrivi('Alberi', a);
      try {
        const opz = {};
        const fm = p.foto ? String(p.foto).match(/^data:(image\/[\w+.-]+);base64,(.+)$/) : null;
        if (fm) opz.attachments = [Utilities.newBlob(Utilities.base64Decode(fm[2]), fm[1], 'targhetta-' + pad(a.numero) + '.jpg')];
        MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'Targhetta da approvare · albero n. ' + pad(a.numero) + ' · ' + nome,
          'Nuova scelta per la targhetta.\n\n' +
          'Albero: n. ' + pad(a.numero) + '\nFormula: ' + (a.formula || '—') + '\nAdottante: ' + (a.adottante || '—') + '\nNome utente: ' + (a.utente || '—') + '\nMail: ' + (a.email || '—') + '\nTelefono: ' + (a.telefono || '—') + '\n\n' +
          'Nome della pianta: ' + nome + '\nDetto: ' + (a.dettoProposto || '—') + '\nTraduzione: ' + (a.traduzioneProposta || '—') + '\nFoto: ' + (a.fotoTarghetta ? 'in allegato (anche qui: ' + a.fotoTarghetta + ')' : 'nessuna') + '\n\n' +
          'Per approvarla o respingerla apri la pagina di gestione: https://www.superetnafood.it/gestione.html', opz);
      } catch (e) {}
      return vista(a);
    }

    case 'mElenco': {
      const foto = leggi('Foto'), diario = leggi('Diario');
      return leggi('Alberi').sort((x, y) => pad(x.numero).localeCompare(pad(y.numero))).map(x => vista(x, true, foto, diario));
    }
    case 'mSalva':
    {
      a = trova(n) || { numero: n, stato: '' };
      DATI.forEach(k => { if (k !== 'password' && p.albero[k] !== undefined) a[k] = p.albero[k]; });
      const npw = String(p.albero.password || '').trim();
      if (npw) {
        if (npw.length < 6) throw new Error('La password deve avere almeno 6 caratteri.');
        a.password = cifra(npw);
        if (a.utente) { const ad = adozione(a.utente); if (ad) { ad.password = a.password; scrivi('Adozioni', ad); } }
      }
      a.numero = n; scrivi('Alberi', a);
      return vista(a, true);
    }
    case 'mFoto': {
      const img = salvaImmagine(p.foto, 'albero-' + n + '-' + Date.now() + '.jpg');
      scrivi('Foto', { id: Utilities.getUuid(), numero: n, data: p.data || oggi(), nota: p.nota || '', fileId: img.fileId, src: img.src });
      break;
    }
    case 'mEliminaFoto': {
      const r = elimina('Foto', p.id);
      if (r && r.fileId) try { DriveApp.getFileById(r.fileId).setTrashed(true); } catch (e) {}
      break;
    }
    case 'mDiario': scrivi('Diario', { id: Utilities.getUuid(), numero: n, data: p.data || oggi(), tipo: p.tipo || 'Nota', testo: p.testo || '', kg: p.kg || '' }); break;
    case 'mEliminaDiario': elimina('Diario', p.id); break;
    case 'mApprova':
      a = trova(n); if (!a) throw new Error('Albero non trovato.');
      a.nomePianta = a.nomeProposto; a.detto = a.dettoProposto; a.traduzione = a.traduzioneProposta;
      a.stato = 'approvato'; a.approvatoIl = oggi(); scrivi('Alberi', a); break;
    case 'mRespingi':
      a = trova(n); if (!a) throw new Error('Albero non trovato.');
      a.stato = 'respinto'; a.motivo = p.motivo || ''; scrivi('Alberi', a); break;
    case 'mRiapri':
      a = trova(n); if (!a) throw new Error('Albero non trovato.');
      a.stato = ''; a.motivo = ''; scrivi('Alberi', a); break;
    default: throw new Error('Azione sconosciuta.');
  }
  return vista(trova(n) || { numero: n }, true);
}
