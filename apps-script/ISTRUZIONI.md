# Collegare l'area riservata a Google (una volta sola, 10 minuti)

1. Vai su drive.google.com con superetnafood@gmail.com → Nuovo → Fogli Google. Chiamalo "Adotta un limone".
2. Nel foglio: Estensioni → Apps Script. Cancella il codice che trovi e incolla tutto il file Codice.gs.
3. A sinistra: Impostazioni progetto (ingranaggio) → Proprietà script → Aggiungi proprietà
   - Proprietà: MASTER_PASSWORD
   - Valore: la tua password master (almeno 16 caratteri, mai scritta in nessun file)
4. In alto a destra: Esegui il deployment → Nuovo deployment → tipo "App web".
   - Esegui come: Me
   - Chi può accedere: Chiunque
   Premi Esegui il deployment e autorizza (Google avvisa che l'app non è verificata: Avanzate → Vai al progetto).
5. Copia l'indirizzo che finisce con /exec e incollalo in sef-api.js, tra le virgolette di SEF_API_URL = ''.
   Fallo sia in sef-api.js sia in export/sef-api.js, poi carica su GitHub.

Fatto. Le schede Alberi, Foto e Diario si creano da sole nel foglio al primo uso;
le immagini finiscono nella cartella Drive "Super Etna Food – Adotta un limone".
Quando un adottante invia la targhetta ti arriva una mail.

Se modifichi Codice.gs: Esegui il deployment → Gestisci deployment → matita → Versione: Nuova → Esegui il deployment.
L'indirizzo /exec resta lo stesso.

## Aggiornamento ottobre 2026 · accesso con nome utente
Dopo aver incollato il nuovo Codice.gs: Esegui il deployment → Gestisci deployment → matita → Versione: Nuova → Esegui il deployment.
Poi da gestione.html crea le nuove adozioni con nome utente e password.

## Aggiornamento novembre 2026 · sicurezza
Blocco dopo 6 password sbagliate (15 minuti) e dopo 8 password master sbagliate (30 minuti, con mail di avviso).
Testi che iniziano con = + - @ salvati come testo nel foglio. Foto solo JPG/PNG/WebP fino a 4 MB.
Rimossa l'azione «Cancella tutte le adozioni» dal server.

## Aggiornamento novembre 2026 · password cifrate
Le password degli adottanti sono salvate cifrate nel foglio (colonna password = h1$…). Non si possono più leggere.
La chiave di cifratura è nella Proprietà script PEPE, creata da sola: NON cancellarla e NON modificarla, altrimenti nessuno riesce più a entrare.
Le password vecchie vengono cifrate al primo accesso di gestione. Per un adottante che ha perso la password: gestione → «Cambia password» o «Rimanda credenziali» (ne genera una nuova).

## Aggiornamento 9 novembre 2026 · cifratura tolta
Le password nuove si salvano di nuovo in chiaro. Quelle già cifrate (h1$…) funzionano ancora e tornano in chiaro al primo accesso dell'adottante, oppure con «Cambia password» / «Rimanda credenziali». Non cancellare ancora la proprietà PEPE finché nel foglio c'è qualche password che inizia con h1$.

## Aggiornamento 16 novembre 2026 · foto nel certificato dalla gestione
Nuova azione mFotoCert: la pagina di gestione prende la foto dell'albero con la password master, senza bisogno della password dell'adottante.
Dopo aver incollato il nuovo Codice.gs: Esegui il deployment → Gestisci deployment → matita → Versione: Nuova → Esegui il deployment.

## Aggiornamento 18 novembre 2026 · acquisto online con PayPal
Il percorso ora è: pulsante su adotta.html → acquista.html (dati e indirizzo) → area riservata (scelta dell'albero e targhetta) → pagamento con i pulsanti PayPal → mail automatica con nome utente e password.

1. Chiavi PayPal (una volta sola): vai su developer.paypal.com ed entra con il conto PayPal Business di Super Etna Food.
   Apps & Credentials → scheda "Live" → Create App (nome: Sito Super Etna Food, tipo Merchant) → copia Client ID e Secret.
2. Apps Script → Impostazioni progetto → Proprietà script → aggiungi:
   - PAYPAL_CLIENT_ID = il Client ID
   - PAYPAL_SECRET = il Secret (non scriverlo in nessun altro file)
   Per una prova senza soldi veri: usa le chiavi della scheda "Sandbox" e aggiungi PAYPAL_PROVA = si; paghi con un account di prova "Personal" che trovi in Sandbox → Accounts. Quando funziona: rimetti le chiavi Live e cancella PAYPAL_PROVA.
3. Incolla il nuovo Codice.gs → Esegui il deployment → Gestisci deployment → matita → Versione: Nuova → Esegui il deployment. Se Google chiede di nuovo l'autorizzazione, accetta.
4. Carica su GitHub: acquista.html (nuovo), adotta.html, area-riservata.html, gestione.html, sef-api.js.

Da sapere:
- I prezzi veri sono in Codice.gs, nella tabella PREZZI: la pagina li mostra soltanto. Se cambi un prezzo, cambialo anche in acquista.html (FORMULE) e in adotta.html.
- Un albero scelto e non pagato resta prenotato per 6 ore (ORE_PRENOTAZIONE), poi torna libero.
- Nella gestione ogni adozione mostra lo stato del pagamento. «Segna come pagata» serve per i pagamenti arrivati in altro modo o rimasti «da controllare»: manda subito la mail con le credenziali.
- Le adozioni create a mano dalla gestione funzionano come prima. I vecchi link di pagamento PayPal non sono più usati dal sito.

## Aggiornamento 21 novembre 2026 · etichetta della cassetta e conferimenti
Nella gestione, sezione Consegne di ogni albero adottato: «Registra conferimento e stampa etichetta» salva la cassetta nella nuova scheda Conferimenti del foglio (si crea da sola), la segna come consegnata nell'area dell'adottante e stampa l'etichetta 4×8 cm con il QR del sito.
Il gestionale di campo legge questi conferimenti con la password master: Conferimenti → «Collega le adozioni del sito».
Dopo aver incollato il nuovo Codice.gs: Esegui il deployment → Gestisci deployment → matita → Versione: Nuova → Esegui il deployment.
