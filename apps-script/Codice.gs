// Super Etna Food · Adotta un limone — servizio su Google Apps Script
// Salva alberi, foto e diario in questo Foglio Google e le immagini in una cartella di Drive.
// La password master si imposta in Impostazioni progetto → Proprietà script → MASTER_PASSWORD.

const CARTELLA = 'Super Etna Food – Adotta un limone';
const TAB = {
  Alberi: ['numero','password','adottante','email','formula','inizio','varieta','posizione','impianto','ultimaRaccolta','note','certificato','consegne','stato','nomeProposto','dettoProposto','traduzioneProposta','fotoTarghetta','inviatoIl','motivo','nomePianta','detto','traduzione','approvatoIl','targa','telefono','consegnaPref','utente'],
  Adozioni: ['email','password','adottante','formula','inizio','albero','telefono','consegna','creataIl','sceltaIl','mailInviata','utente','pacchetto','zona','indirizzo','pagamento','importo','ppOrdine','ppCattura','pagatoIl','prenotatoAlle'],
  Foto: ['id','numero','data','nota','fileId','src'],
  Diario: ['id','numero','data','tipo','testo','kg'],
  Conferimenti: ['id','data','numero','utente','adottante','formula','fioritura','consegnaN','consegneTot','kg','cassette','importo','nota','creatoIl']
};
const DATI = ['password','adottante','email','formula','inizio','varieta','posizione','impianto','ultimaRaccolta','note','certificato','consegne','targa','telefono','consegnaPref'];
const ALBERI_ADOTTABILI = 100;
const CARTELLA_FOTO_PIANTE = '1aH70DmThPMvNrok_b-BvNOty8IHYoB8S'; // cartella Drive "foto-piante": file chiamati pianta-NUMERO-AAAA-MM-GG…jpg
const SITO = 'https://www.superetnafood.it/area-riservata.html';
// Acquisto online: prezzi (in euro) per formula e zona. Il prezzo vero lo decide sempre questo file, mai la pagina.
const PREZZI = {
  bronzo:  { nome: "Il tuo albero sull'Etna", targa: 'bronzo',  italia: 30,  catania: 20 },
  argento: { nome: 'Spedito in Italia',       targa: 'argento', italia: 75,  catania: 40 },
  oro:     { nome: 'Dal fondo alle tue mani', targa: 'oro',     italia: 130, catania: 80 }
};
const ORE_PRENOTAZIONE = 6; // un albero scelto ma non pagato torna libero dopo queste ore

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
// Consegne previste per formula: quante cassette e quanti kg ciascuna (le adozioni fatte a mano usano lo stesso schema).
const PIANO_CONSEGNE = { bronzo: { n: 1, kg: 5 }, argento: { n: 2, kg: 10 }, oro: { n: 3, kg: 20 } };
const FORMULA_PACCHETTO = { "Il tuo albero sull'Etna": 'bronzo', 'Spedito in Italia': 'argento', 'Il raccolto a casa tua': 'argento', 'Una stagione di limoni': 'argento', 'Dal fondo alle tue mani': 'oro' };
function pianoDi(a, ad) { return PIANO_CONSEGNE[(ad && ad.pacchetto) || FORMULA_PACCHETTO[a.formula] || (a.targa && PIANO_CONSEGNE[a.targa] ? a.targa : 'bronzo')]; }
function dataIt(iso) { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '/' + m[2] + '/' + m[1] : String(iso || ''); }
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
  const immagine = b => b && String(b.getContentType() || '').indexOf('image/') === 0 && b.getBytes().length > 1000;
  let b = null;
  // 1) anteprima ridotta di Drive (leggera); vale solo se torna davvero un'immagine
  try { const r = UrlFetchApp.fetch('https://drive.google.com/thumbnail?id=' + fid + '&sz=w1400', { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true, followRedirects: true }); if (r.getResponseCode() === 200) b = r.getBlob(); } catch (e) { b = null; }
  // 2) altrimenti il file originale, se non è enorme
  if (!immagine(b)) { b = null; try { const f = DriveApp.getFileById(fid); if (f.getSize() <= 6000000) b = f.getBlob(); } catch (e) { b = null; } }
  // 3) ultima strada: la miniatura che Drive genera da sé
  if (!immagine(b)) { try { b = DriveApp.getFileById(fid).getThumbnail(); } catch (e) { b = null; } }
  if (!immagine(b)) throw new Error('Foto trovata su Drive ma non leggibile (file ' + fid + ').');
  return 'data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes());
}
function vista(a, conPw, foto, diario, adozioni) {
  const n = pad(a.numero), c = Object.assign({}, a);
  delete c._riga; c.numero = n;
  if (!conPw || cifrata(c.password)) delete c.password;
  try { c.consegne = JSON.parse(a.consegne || '[]'); } catch (e) { c.consegne = []; }
  const pulisci = x => { const y = Object.assign({}, x); delete y._riga; return y; };
  c.foto = (foto || leggi('Foto')).filter(f => pad(f.numero) === n).sort(desc).map(pulisci);
  c.diario = (diario || leggi('Diario')).filter(f => pad(f.numero) === n).sort(desc).map(pulisci);
  if (a.utente) {
    const u = String(a.utente).toLowerCase(), ad = (adozioni || leggi('Adozioni')).find(x => String(x.utente).toLowerCase() === u);
    if (ad) Object.assign(c, statoPagamento(ad));
  }
  return c;
}
// Pagamento online: '' = adozione creata a mano (già a posto), 'attesa' = da pagare, 'verifica' = PayPal lo sta controllando, 'pagato'.
function statoPagamento(ad) {
  const t = ad.pagamento === 'attesa' && ad.prenotatoAlle ? new Date(ad.prenotatoAlle).getTime() + ORE_PRENOTAZIONE * 3600000 : 0;
  return { pagamento: ad.pagamento || '', importo: ad.importo || '', pagatoIl: ad.pagatoIl || '', ppCattura: ad.ppCattura || '', scadenza: t ? new Date(t).toISOString() : '' };
}
function scaduta(ad) { return !!ad && ad.pagamento === 'attesa' && !!ad.albero && !!ad.prenotatoAlle && Date.now() - new Date(ad.prenotatoAlle).getTime() > ORE_PRENOTAZIONE * 3600000; }
// L'albero di questa adozione, solo se è ancora suo (una prenotazione scaduta può essere stata presa da altri).
function alberoDi(ad) {
  if (!ad || !ad.albero) return null;
  const al = trova(ad.albero);
  if (al && String(al.utente || '').toLowerCase() === String(ad.utente).toLowerCase()) return al;
  ad.albero = ''; ad.prenotatoAlle = ''; scrivi('Adozioni', ad);
  return null;
}
// Cosa vede l'adottante appena entra: la scelta dell'albero, oppure il suo albero.
function entrata(ad) {
  const al = alberoDi(ad);
  if (al) return vista(al);
  const lib = liberi(); let gal = [];
  try { gal = galleria().filter(g => lib.indexOf(g.numero) >= 0); } catch (e) {}
  return { daScegliere: true, utente: ad.utente, email: ad.email, adottante: ad.adottante, formula: ad.formula, telefono: ad.telefono, consegna: ad.consegna, daOrdine: !!ad.pagamento, pagamento: ad.pagamento || '', importo: ad.importo || '', liberi: lib, galleria: gal };
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
  const presi = {}, scadute = {};
  leggi('Adozioni').forEach(ad => { if (scaduta(ad)) scadute[String(ad.utente).toLowerCase()] = 1; });
  leggi('Alberi').forEach(a => { if ((a.adottante || a.email || a.password || a.utente) && !(a.utente && scadute[String(a.utente).toLowerCase()])) presi[pad(a.numero)] = 1; });
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
  if (a.utente && String(a.utente).toLowerCase() !== String(ad.utente).toLowerCase()) {
    const vec = adozione(a.utente);
    if (vec && pad(vec.albero) === n) { vec.albero = ''; vec.prenotatoAlle = ''; scrivi('Adozioni', vec); }
    svuotaAlbero(a);
  }
  ['stato','motivo','nomeProposto','dettoProposto','traduzioneProposta','fotoTarghetta','inviatoIl','nomePianta','detto','traduzione','approvatoIl','targa','certificato'].forEach(k => { if (k in a) a[k] = ''; }); a.consegne = [];
  a.numero = n; a.password = ad.password; a.email = ad.email || ''; a.utente = ad.utente; a.formula = ad.formula; a.inizio = ad.inizio || oggi();
  a.adottante = dati.adottante || ad.adottante || ''; a.telefono = dati.telefono || ad.telefono || ''; a.consegnaPref = dati.consegna || ad.consegna || '';
  scrivi('Alberi', a);
  ad.albero = n; ad.adottante = a.adottante; ad.telefono = a.telefono; ad.consegna = a.consegnaPref; ad.sceltaIl = oggi();
  if (ad.pagamento === 'attesa') ad.prenotatoAlle = new Date().toISOString();
  scrivi('Adozioni', ad);
  return a;
}
function vistaAdozione(ad) { return { utente: ad.utente, email: ad.email, adottante: ad.adottante, formula: ad.formula, inizio: ad.inizio, albero: ad.albero ? pad(ad.albero) : '', telefono: ad.telefono, consegna: ad.consegna, creataIl: ad.creataIl, sceltaIl: ad.sceltaIl, mailInviata: ad.mailInviata, password: cifrata(ad.password) ? '' : ad.password, scaduta: scaduta(ad), ...statoPagamento(ad) }; }
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
  const al = alberoDi(ad);
  if (!al) throw new Error("La prenotazione del tuo albero è scaduta: ricarica la pagina e scegline uno.");
  return al;
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

// ---------- Acquisto online con PayPal ----------
// Proprietà script: PAYPAL_CLIENT_ID e PAYPAL_SECRET (app REST di PayPal Business). PAYPAL_PROVA = si per i pagamenti di prova (sandbox).
function ppConf() {
  const P = PropertiesService.getScriptProperties(), id = P.getProperty('PAYPAL_CLIENT_ID'), sec = P.getProperty('PAYPAL_SECRET');
  if (!id || !sec) throw new Error('Il pagamento online non è ancora attivo: scrivimi su WhatsApp al 351 528 6188.');
  const prova = String(P.getProperty('PAYPAL_PROVA') || '').trim().toLowerCase() === 'si';
  return { id: id.trim(), sec: sec.trim(), prova: prova, base: prova ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com' };
}
function ppToken(c) {
  const cache = CacheService.getScriptCache(), k = 'pp-token-' + (c.prova ? 'prova' : 'vero'), t = cache.get(k);
  if (t) return t;
  const r = UrlFetchApp.fetch(c.base + '/v1/oauth2/token', { method: 'post', headers: { Authorization: 'Basic ' + Utilities.base64Encode(c.id + ':' + c.sec) }, payload: { grant_type: 'client_credentials' }, muteHttpExceptions: true });
  let j = {}; try { j = JSON.parse(r.getContentText() || '{}'); } catch (e) {}
  if (r.getResponseCode() !== 200 || !j.access_token) throw new Error('PayPal non accetta le chiavi del sito: controlla PAYPAL_CLIENT_ID e PAYPAL_SECRET (e PAYPAL_PROVA).');
  cache.put(k, j.access_token, Math.max(60, Math.min(21600, (+j.expires_in || 3600) - 120)));
  return j.access_token;
}
function ppApi(metodo, percorso, corpo, intestazioni) {
  const c = ppConf();
  const opz = { method: metodo, contentType: 'application/json', headers: Object.assign({ Authorization: 'Bearer ' + ppToken(c) }, intestazioni || {}), muteHttpExceptions: true };
  if (corpo) opz.payload = JSON.stringify(corpo);
  const r = UrlFetchApp.fetch(c.base + percorso, opz);
  let j = {}; try { j = JSON.parse(r.getContentText() || '{}'); } catch (e) {}
  return { code: r.getResponseCode(), j: j };
}
function ppRif(r) { return ' (rif. PayPal ' + ((r && r.j && r.j.debug_id) || (r && r.code) || '?') + ')'; }
const euro = v => (+v || 0).toFixed(2).replace('.', ',') + ' €';
function nomeUtenteDa(nome) {
  let b = String(nome || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]+/g, ' ').trim().split(' ')[0] || '';
  b = b.slice(0, 12); if (b.length < 3) b = 'limone';
  for (let i = 0; i < 30; i++) { const u = b + '-' + (100 + Math.floor(Math.random() * 900)); if (!adozione(u)) return u; }
  return 'limone-' + Date.now().toString(36);
}
function mailPagata(ad, pw, albero) {
  MailApp.sendEmail(ad.email, "Adozione confermata · le credenziali della tua area riservata",
    'Ciao' + (ad.adottante ? ' ' + ad.adottante : '') + ',\n\n' +
    'il pagamento di ' + euro(ad.importo) + ' è arrivato: grazie! ' +
    (albero ? "L'albero n. " + albero + " del limoneto di Acireale è tuo per un anno." : "Il tuo albero non è più prenotato: entra nell'area riservata e scegline uno tra quelli liberi.") + '\n\n' +
    "Ecco le credenziali per rientrare nell'area riservata quando vuoi:\nNome utente: " + ad.utente + '\nPassword: ' + pw + '\n\nEntra qui: ' + SITO + '\n\n' +
    "Lì scegli il nome e il detto della targhetta (se non l'hai già fatto), scarichi il certificato e segui la pianta durante l'anno.\n\n" +
    'Formula: ' + (ad.formula || '—') + '\nConsegna: ' + (ad.consegna || '—') + '\n\n' +
    "Questa mail vale come conferma dell'adozione. Serve come promemoria e non ha valore fiscale.\n\nAntonio Grasso\nSuper Etna Food · Acireale\nWhatsApp +39 351 528 6188");
  ad.mailInviata = oggi();
}
function avvisaMe(oggetto, testo) { try { MailApp.sendEmail(Session.getEffectiveUser().getEmail(), oggetto, testo); } catch (e) {} }
function riepilogo(ad) {
  return 'Adottante: ' + (ad.adottante || '—') + '\nNome utente: ' + ad.utente + '\nMail: ' + (ad.email || '—') + '\nTelefono: ' + (ad.telefono || '—') +
    '\nFormula: ' + (ad.formula || '—') + ' · ' + euro(ad.importo) + '\nConsegna: ' + (ad.consegna || '—') + '\nAlbero: ' + (ad.albero ? 'n. ' + pad(ad.albero) : 'da scegliere') +
    '\nPayPal: ordine ' + (ad.ppOrdine || '—') + ' · transazione ' + (ad.ppCattura || '—');
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
    case 'versione': return 'conferimenti-2026-11-21';

    // ----- cassette consegnate agli adottanti: registro conferimenti (letto anche dal gestionale di campo) -----
    case 'mConferimento': {
      a = trova(n);
      if (!a || !(a.adottante || a.utente)) throw new Error("Quest'albero non risulta adottato.");
      const kg = Math.round((parseFloat(String(p.kg || '').replace(',', '.')) || 0) * 10) / 10;
      if (!(kg > 0) || kg > 200) throw new Error('Scrivi quanti kg ci sono nella cassetta.');
      const data = /^\d{4}-\d{2}-\d{2}$/.test(String(p.data || '')) ? p.data : oggi();
      const ad = a.utente ? adozione(a.utente) : null, piano = pianoDi(a, ad);
      const fatti = leggi('Conferimenti').filter(x => pad(x.numero) === n).length;
      const tot = (ad && +ad.importo) || 0;
      const r = { id: Utilities.getUuid(), data: data, numero: n, utente: a.utente || '', adottante: a.adottante || (ad && ad.adottante) || '', formula: a.formula || '',
        fioritura: String(p.fioritura || '').slice(0, 30), consegnaN: String(fatti + 1), consegneTot: String(Math.max(piano.n, fatti + 1)), kg: String(kg),
        cassette: String(Math.max(1, Math.min(20, parseInt(p.cassette, 10) || 1))), importo: tot ? (tot / piano.n).toFixed(2) : '0', nota: String(p.nota || '').slice(0, 200), creatoIl: new Date().toISOString() };
      scrivi('Conferimenti', r);
      let cons = []; try { cons = JSON.parse(a.consegne || '[]'); } catch (e) { cons = []; }
      const voce = { quando: dataIt(data), cosa: (r.fioritura ? r.fioritura + ', ' : '') + String(kg).replace('.', ',') + ' kg', stato: 'Consegnata', conf: r.id };
      const k = cons.findIndex(c => !c.conf && !/consegnat/i.test(c.stato || ''));
      if (k >= 0) cons[k] = Object.assign({}, cons[k], voce); else cons.push(voce);
      a.consegne = cons; scrivi('Alberi', a);
      const v = vista(trova(n), true); v.ultimoConferimento = r; return v;
    }
    case 'mConferimenti': {
      const solo = p.numero != null && p.numero !== '' ? n : '';
      return leggi('Conferimenti').filter(x => !solo || pad(x.numero) === solo).sort(desc)
        .map(x => ({ id: x.id, data: x.data, numero: pad(x.numero), adottante: x.adottante, formula: x.formula, fioritura: x.fioritura, consegnaN: +x.consegnaN || 1, consegneTot: +x.consegneTot || 1, kg: +x.kg || 0, cassette: +x.cassette || 1, importo: +x.importo || 0, nota: x.nota }));
    }
    case 'mEliminaConferimento': {
      const r = elimina('Conferimenti', p.id); if (!r) throw new Error('Conferimento non trovato.');
      a = trova(r.numero);
      if (a) { let cons = []; try { cons = JSON.parse(a.consegne || '[]'); } catch (e) {} a.consegne = cons.filter(c => c.conf !== r.id); scrivi('Alberi', a); }
      return vista(trova(r.numero) || { numero: pad(r.numero) }, true);
    }
    case 'disponibili': { const lb = liberi(); return { liberi: Math.min(ALBERI_ADOTTABILI, lb.length + (lb.indexOf('001') < 0 ? 1 : 0)), totale: ALBERI_ADOTTABILI }; } // l'albero 001 è l'esempio: non conta
    case 'accedi': return entrata(credenziali(p));
    case 'fotoCert': {
      const ad = credenziali(p);
      const al = alberoDi(ad);
      if (!al) throw new Error('Scegli prima il tuo albero.');
      return fotoAlbero(pad(al.numero));
    }
    case 'scegli': {
      const ad = credenziali(p);
      if (alberoDi(ad)) throw new Error('Hai già scelto il tuo albero: il n. ' + pad(ad.albero) + '.');
      const nome = String(p.adottante || ad.adottante || '').trim(), tel = String(p.telefono || ad.telefono || '').trim();
      if (!nome) throw new Error('Scrivi il tuo nome e cognome.');
      if (!tel) throw new Error('Scrivi il tuo numero di telefono.');
      a = assegna(ad, p.albero, { adottante: nome.slice(0, 60), telefono: tel.slice(0, 30), consegna: String(p.consegna || ad.consegna || '').slice(0, 300) });
      if (ad.pagamento !== 'attesa') avvisaMe('Albero scelto · n. ' + pad(a.numero),
        a.adottante + ' (utente ' + a.utente + ', tel. ' + a.telefono + ") ha scelto l'albero n. " + pad(a.numero) + ' con la formula ' + (a.formula || '—') + '.\nConsegna: ' + (a.consegnaPref || '—'));
      return vista(a);
    }

    // ----- acquisto online: dati → albero → PayPal → mail con le credenziali -----
    case 'ppConfig': {
      const P = PropertiesService.getScriptProperties(), id = P.getProperty('PAYPAL_CLIENT_ID');
      return { clientId: id && P.getProperty('PAYPAL_SECRET') ? id.trim() : '', prova: String(P.getProperty('PAYPAL_PROVA') || '').trim().toLowerCase() === 'si' };
    }
    case 'ordine': {
      if (String(p.sito || '')) throw new Error('Richiesta non valida.');
      const cache = CacheService.getScriptCache(), quanti = +(cache.get('ordini-ora') || 0);
      if (quanti >= 40) throw new Error("In questo momento arrivano troppe richieste: riprova tra un'ora o scrivimi su WhatsApp.");
      const pk = PREZZI[p.pacchetto]; if (!pk) throw new Error('Scegli una formula.');
      const zona = p.zona === 'catania' ? 'catania' : 'italia';
      const t = (k, max) => String(p[k] || '').replace(/\s+/g, ' ').trim().slice(0, max);
      const nome = t('adottante', 60), email = t('email', 120).toLowerCase(), tel = t('telefono', 30);
      if (nome.length < 3) throw new Error('Scrivi nome e cognome.');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Controlla la mail: è lì che ti arrivano nome utente e password.');
      if (tel.replace(/\D/g, '').length < 6) throw new Error('Scrivi un numero di telefono valido.');
      let consegna, indirizzo;
      if (zona === 'italia') {
        const via = t('via', 120), cap = t('cap', 5), citta = t('citta', 60), prov = t('provincia', 2).toUpperCase(), presso = t('presso', 120);
        if (!via || !/^\d{5}$/.test(cap) || !citta) throw new Error("Completa l'indirizzo di spedizione: via e numero, CAP di 5 cifre e città.");
        indirizzo = via + ', ' + cap + ' ' + citta + (prov ? ' (' + prov + ')' : '') + (presso ? ' · ' + presso : '');
        consegna = 'Spedizione a casa, in tutta Italia — ' + indirizzo;
      } else {
        const note = t('note', 200);
        indirizzo = note; consegna = (p.luogo === 'Acireale' ? 'Consegna a mano ad Acireale' : 'Consegna a mano a Catania') + (note ? ' — ' + note : '');
      }
      const u = nomeUtenteDa(nome), pw = nuovaPassword();
      scrivi('Adozioni', { utente: u, email: email, password: cifra(pw), adottante: nome, formula: pk.nome, inizio: oggi(), albero: '', creataIl: oggi(), telefono: tel, consegna: consegna,
        pacchetto: p.pacchetto, zona: zona, indirizzo: indirizzo, pagamento: 'attesa', importo: String(pk[zona]) });
      cache.put('ordini-ora', String(quanti + 1), 3600);
      return { utente: u, password: pw };
    }
    case 'ppCrea': {
      const ad = credenziali(p);
      if (ad.pagamento !== 'attesa') throw new Error(ad.pagamento === 'pagato' ? 'Questa adozione è già pagata.' : 'Per questa adozione il pagamento online non serve.');
      if (!ad.albero) throw new Error('Scegli prima il tuo albero.');
      if (!alberoDi(ad)) throw new Error("La prenotazione dell'albero è scaduta e l'ha scelto qualcun altro: ricarica la pagina e scegline un altro.");
      if (scaduta(ad)) ad.prenotatoAlle = new Date().toISOString();
      const importo = (+ad.importo || 0).toFixed(2);
      if (!(+importo > 0)) throw new Error('Importo non valido: scrivimi su WhatsApp.');
      const r = ppApi('post', '/v2/checkout/orders', { intent: 'CAPTURE',
        purchase_units: [{ reference_id: 'albero-' + pad(ad.albero), custom_id: ad.utente, description: ('Adotta un limone · ' + ad.formula + ' · albero n. ' + pad(ad.albero)).slice(0, 127), amount: { currency_code: 'EUR', value: importo } }],
        application_context: { brand_name: 'Super Etna Food', locale: 'it-IT', shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW' } });
      if (r.code >= 300 || !r.j.id) throw new Error("PayPal non ha accettato l'ordine: riprova tra poco." + ppRif(r));
      ad.ppOrdine = r.j.id; scrivi('Adozioni', ad);
      return { id: r.j.id };
    }
    case 'ppCattura': {
      const ad = credenziali(p);
      if (ad.pagamento === 'pagato') return entrata(ad);
      const id = String(p.ordine || '');
      if (!id || id !== ad.ppOrdine) throw new Error('Ordine PayPal non riconosciuto: scrivimi su WhatsApp e controllo io.');
      let r = ppApi('post', '/v2/checkout/orders/' + encodeURIComponent(id) + '/capture', null, { 'PayPal-Request-Id': 'cattura-' + id });
      if (r.code >= 300 || r.j.status !== 'COMPLETED') r = ppApi('get', '/v2/checkout/orders/' + encodeURIComponent(id));
      const pu = (r.j.purchase_units || [])[0] || {}, cap = ((pu.payments || {}).captures || [])[0] || {};
      if (r.code >= 300 || !cap.id) throw new Error('Il pagamento non risulta completato su PayPal. Se ti è stato addebitato, scrivimi su WhatsApp.' + ppRif(r));
      ad.ppCattura = cap.id;
      const importo = (+ad.importo || 0).toFixed(2);
      if (pu.custom_id !== ad.utente || !cap.amount || cap.amount.currency_code !== 'EUR' || cap.amount.value !== importo) {
        ad.pagamento = 'verifica'; scrivi('Adozioni', ad);
        avvisaMe('DA CONTROLLARE · pagamento PayPal diverso dall\'ordine', 'Importo atteso ' + importo + ' EUR, arrivato ' + JSON.stringify(cap.amount || {}) + '.\n\n' + riepilogo(ad));
        throw new Error('Il pagamento è arrivato ma non corrisponde all\'ordine: lo controllo io e ti scrivo al più presto.');
      }
      const mio = alberoDi(ad);
      ad.prenotatoAlle = '';
      if (cap.status === 'COMPLETED') {
        ad.pagamento = 'pagato'; ad.pagatoIl = oggi();
        try { mailPagata(ad, String(p.password || '').trim(), mio ? pad(mio.numero) : ''); } catch (e) { avvisaMe('ATTENZIONE · mail delle credenziali non partita', String(e) + '\n\n' + riepilogo(ad)); }
        scrivi('Adozioni', ad);
        avvisaMe('Adozione pagata · ' + (mio ? 'albero n. ' + pad(mio.numero) : 'albero da scegliere') + ' · ' + euro(ad.importo), riepilogo(ad));
      } else {
        ad.pagamento = 'verifica'; scrivi('Adozioni', ad);
        avvisaMe('Pagamento PayPal in verifica · ' + ad.utente, 'PayPal ha messo il pagamento in stato ' + cap.status + '. Quando risulta completato, apri la gestione e premi «Segna come pagata»: partono le credenziali.\n\n' + riepilogo(ad));
      }
      return entrata(ad);
    }
    case 'mSegnaPagata': {
      const ad = adozione(p.utente); if (!ad) throw new Error('Adozione non trovata.');
      ad.pagamento = 'pagato'; ad.pagatoIl = oggi(); ad.prenotatoAlle = ''; if (!ad.ppCattura) ad.ppCattura = 'manuale';
      let pw = String(ad.password || '').trim();
      if (cifrata(pw)) { pw = nuovaPassword(); impostaPassword(ad, pw); }
      if (ad.email) mailPagata(ad, pw, ad.albero ? pad(ad.albero) : '');
      scrivi('Adozioni', ad);
      return conChiara(elencoAdozioni(), ad.utente, pw);
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
          'Albero: n. ' + pad(a.numero) + ((adozione(a.utente) || {}).pagamento === 'attesa' ? '  (ADOZIONE NON ANCORA PAGATA)' : '') + '\nFormula: ' + (a.formula || '—') + '\nAdottante: ' + (a.adottante || '—') + '\nNome utente: ' + (a.utente || '—') + '\nMail: ' + (a.email || '—') + '\nTelefono: ' + (a.telefono || '—') + '\n\n' +
          'Nome della pianta: ' + nome + '\nDetto: ' + (a.dettoProposto || '—') + '\nTraduzione: ' + (a.traduzioneProposta || '—') + '\nFoto: ' + (a.fotoTarghetta ? 'in allegato (anche qui: ' + a.fotoTarghetta + ')' : 'nessuna') + '\n\n' +
          'Per approvarla o respingerla apri la pagina di gestione: https://www.superetnafood.it/gestione.html', opz);
      } catch (e) {}
      return vista(a);
    }

    case 'mElenco': {
      const foto = leggi('Foto'), diario = leggi('Diario'), ads = leggi('Adozioni');
      return leggi('Alberi').sort((x, y) => pad(x.numero).localeCompare(pad(y.numero))).map(x => vista(x, true, foto, diario, ads));
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
