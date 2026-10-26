# Roadwise

A Next.js app for practising Indian road signs and driving rules.

- 97 local sign illustrations (mandatory, cautionary and informatory).
- 172 reviewed road-rule questions; 269 practice questions in total.
- Mixed, signs-only, rules-only and retry-mistakes tests (10 / 20 / 40 questions).
- Untimed tests, keyboard shortcuts, automatic local draft recovery.
- Server-side grading, answer review, private browser-linked history in Lawn's Supabase database.
- Responsive dark interface, searchable sign library and expandable rules library.

## Run

```sh
npm ci
# Configure .env.local using .env.example. Never commit credentials.
npm run dev
```

Open http://localhost:3100. `npm run build` builds production; `npm start` serves it.

## Data and storage

Lawn Supabase project: `rqdkxgtoccuvuxqkyxzf`. Existing Lawn tables are untouched.

- `roadwise_questions`: the imported question bank, read-only to the application.
- `roadwise_attempts`: immutable completed test snapshots, scores and elapsed time.
- Session: random UUID in an HttpOnly, SameSite cookie. Results are linked to this browser, without login. Cookies must be retained to access previous results; this does not sync history across devices.
- Attempt requests include the browser's session ID in the `x-roadwise-session` header. The application uses `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`; no Lawn write secret is sent.
- Apply `supabase/migrations/20261026170000_roadwise_session_policy.sql` to existing databases to remove the original Lawn ownership requirement. Row-level security still requires the session header to match the attempt's session ID; a missing or different session cannot access the attempt. Treat session IDs as private bearer credentials.
- Correct answers and scoring come from the stored bank. Re-submitting a completed attempt returns the original saved result.

The app reads its checked-in snapshot for learning pages and the seeded database for tests. It never scrapes Parivahan or transport websites at runtime. Sign images are served locally.

Schema: `supabase/migrations/20261023071202_roadwise_schema.sql`. Reproducible bank seed: `data/seed.sql`.

## Sources and review

Imported 23 October 2026:

1. [Maharashtra Motor Vehicles Department sign catalogue](https://transport.maharashtra.gov.in/1308/Road-Signs): all 97 listed sign illustrations. `data/signs.json` records their original asset URLs.
2. [Parivahan English learner question bank](https://parivahan.gov.in/sites/default/files/DownloadForm/STALL_QB_ENGLISH_NEW.pdf): source PDF in `data/question-bank.pdf`; 172 selected rules questions. Each stored question retains its question number, PDF page and source URL.

This is an independent practice tool, not an official RTO examination or an exhaustive statement of Indian law. State test formats differ. Old penalty amounts, location-specific numeric speed limits and ambiguous or questionable answer keys were excluded. A few sign captions were clarified after visually checking the illustrations (including the railway crossing distance markers). Duplicate sign variants in the catalogue are retained. No official pass mark is implied.

To refresh deliberately (not automatically), fetch the official HTML/PDF, run `scripts/import-bank.py`, `scripts/curate-bank.py`, then `scripts/import-signs.py` (Python with PyMuPDF required). Review the resulting bank before applying a new seed. Import scripts are developer tools and are never shipped as runtime jobs.

## Checks

```sh
npm test
npm run typecheck
npm run build
# Against a running local server; creates test sessions in Roadwise's tables only:
node scripts/verify-api.mjs
```

API checks cover trusted grading, invalid choices, replay protection, skipped answers, mistakes mode, history, cross-session access and anonymous direct database access. Test session IDs are printed so their generated rows can be removed.
