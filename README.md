# E-commerce-Gioielleria

E-commerce frontend per gioielleria — catalogo prodotti, carrello, checkout e gestione ordini.

## Stack

| Layer | Tecnologia |
|---|---|
| Framework | Angular 22 (standalone, signals) |
| Styling | Bootstrap 5 + Bootstrap Icons + custom design tokens |
| State | Angular Signals (`signal`, `computed`, `effect`) |
| Forms | Signal-based forms (`@angular/forms/signals`) |
| HTTP | `rxResource()` + `HttpClient` |
| Deploy | Docker + nginx, CI/CD via GitHub Actions |

## Comandi

```bash
npm start          # dev server → http://localhost:4200
npm run build      # build di produzione
npm run watch      # build in watch mode
```

## Deploy

Il deploy avviene automaticamente al push sul branch `main` tramite GitHub Actions (self-hosted runner).

```bash
# build e avvio locale con Docker
docker compose up --build
```

## Struttura route

| Path | Pagina |
|---|---|
| `/` | Home (hero + categorie + prodotti in evidenza) |
| `/products` | Catalogo con filtri per categoria |
| `/products/:id` | Dettaglio prodotto |
| `/carrello` | Carrello |
| `/ordine` | Login / Registrazione |
| `/checkout` | Checkout (richiede auth + carrello non vuoto) |
| `/ordini` | Storico ordini (richiede auth) |
