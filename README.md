# Portfolio di Davide Esposito

Restyling statico basato sulla versione di Daniel White salvata nel progetto (25 agosto 2026): fondo avorio, colonna da 560 px, font Geist Mono, cartelle espandibili, microinterazioni e schede inclinate.

I contenuti includono progetti, esperienze, certificazioni e contatti. Proximove ha una pagina locale in `progetti/proximove.html`; gli altri progetti mantengono i collegamenti esterni.

## Anteprima

Aprire PowerShell ed eseguire:

```powershell
cd "C:\Users\davex\Desktop\portfolio"
python -m http.server 4173 --bind 127.0.0.1
```

Aprire http://127.0.0.1:4173. In alternativa, aprire `index.html` direttamente; la copia email è disponibile solo se il browser consente l’accesso agli appunti.

Lasciare aperta la finestra PowerShell durante il test. Per fermare il server premere **Ctrl+C** nella stessa finestra; per riavviarlo eseguire nuovamente il comando `python -m http.server 4173 --bind 127.0.0.1`.

Dopo una modifica ai file basta ricaricare il browser: non serve riavviare il server. Usare **Ctrl+F5** se il browser mostra una versione precedente. Se la porta 4173 è già occupata, il server potrebbe essere ancora attivo: aprire l’indirizzo indicato oppure avviare il comando con la porta `4174` e aprire http://127.0.0.1:4174.

Le cartelle partono chiuse. Lunabeige FM si trova in **Sides**, nella sezione dei progetti.

## File

- `index.html`: contenuti e struttura semantica.
- `styles.css`: stile, layout responsive e preferenze di movimento ridotto.
- `script.js`: orologio Europe/Rome, copia email e finestra animazione.
- `assets/`: font locale, favicon, GIF e sei fotografie PNG originali. `assets/postcards/` contiene miniature WebP e copie da 1800 px per l’overlay. La postcard di Substack è stata rimossa.

Le postcards sono disposte in un ventaglio poco curvo, con lievi variazioni fisse di inclinazione e altezza e una spaziatura più ampia della colonna di testo. Le didascalie compaiono con effetto macchina da scrivere al passaggio del mouse o al focus da tastiera. Foto e GIF aprono lo stesso overlay, con didascalia in alto e chiusura tramite X, Escape o clic sullo sfondo. Senza JavaScript i link delle fotografie aprono il PNG originale. Con movimento ridotto il testo appare subito.

Anche le tre esperienze usano l’apertura e chiusura fluida degli accordion. Le date compaiono soltanto a lato, con mese abbreviato e anno.

Nell’overlay, le frecce minimali sotto l’immagine, ai lati del contatore, e i tasti ← / → scorrono tra tutte e sette le postcards, tornando alla prima dopo l’ultima. Il cambio usa soltanto uno scorrimento laterale simultaneo delle due immagini, sempre opache e senza dissolvenze; con movimento ridotto è immediato. L’area immagine mantiene un’altezza stabile passando da foto verticali a orizzontali o alla GIF. Foto, miniature e titoli delle cartelle non sono selezionabili; le immagini non sono trascinabili. Lunabeige FM usa il badge New con stile e animazione del riferimento di Daniel White.

Le cartelle usano gli SVG `v2-tree__icon-closed` e `v2-tree__icon-open` del riferimento salvato, con transizione di opacità e scala. Apertura e chiusura di cartelle ed esperienze animano l’altezza misurata con Web Animations, senza dipendere da `interpolate-size`; senza JavaScript rimane disponibile il comportamento nativo di `details`. Sides usa un accento viola. Le preferenze di movimento ridotto disattivano le animazioni.

Non occorrono dipendenze, build o servizi esterni per visualizzare la pagina. Le cartelle originali scaricate sono conservate. La pagina usa elementi `details` nativi, focus visibile e dialogo chiudibile con Escape. I contenuti e i link principali funzionano senza JavaScript.

## Pubblicazione

La destinazione prevista è `https://espdav.github.io/`, su GitHub Pages. Per questo indirizzo la repository deve chiamarsi `espdav.github.io`. In Settings → Pages selezionare **Deploy from a branch**, branch **main**, cartella **/ (root)**. Il file `.nojekyll` mantiene la pubblicazione statica senza elaborazione Jekyll.

La distribuzione include `index.html`, `styles.css`, `script.js`, `progetti/` e gli asset utilizzati. Il `.gitignore` esclude copie dei siti di riferimento, verifiche locali e asset inutilizzati. Il sito Framer resta indipendente.

Con Pages configurato, ogni push su `main` aggiorna il sito. Per verificare modifiche prima della pubblicazione, lavorare su un branch e aprire una pull request verso `main`; il merge avvia l'aggiornamento pubblico.


## Font e anteprime aggiornati

Il carattere corrente è Geist Mono, identificato nel CSS di alessiocardelli.com. Il subset latino WOFF2 è servito localmente da `assets/GeistMono-Latin.woff2`, con licenza OFL in `assets/GeistMono-LICENSE.txt`. File di origine: https://www.alessiocardelli.com/_next/static/media/797e433ab948586e-s.p.0r6juujl39pe6.woff2.

Le quattro thumbnail WebP sono precaricate dalla home e decodificate una volta dal JavaScript. Ogni progetto riusa lo stesso elemento immagine; il riquadro contiene una sola thumbnail anche durante il cambio progetto. L'hover copre l'intero link, compresi categoria e spazi vuoti.

I segni +/× degli accordion hanno un'area di 16 px e tratti da 2 px: la geometria mantiene costante la lunghezza dei segmenti durante l'animazione. La freccia del footer è da 22 px su entrambe le pagine. In Proximove la navigazione superiore mostra soltanto “Torna indietro”, diretto alla home.
