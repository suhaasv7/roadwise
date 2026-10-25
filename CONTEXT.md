# Roadwise — project context

Created 23 October 2026. Local checkout: `~/Documents/personal/roadwise`.
Private repository: https://github.com/suhaasv7/roadwise, branch `main`.

## User direction

- Build with actual Next.js.
- Practice tests for Indian road signs and driving rules.
- Fetch source material once and store it; no live scraping during use.
- Reuse Lawn's database for the bank and test results.
- **Deployment deferred explicitly.** Build and push only for now.
- On any later browser/deployment work, use the user's **personal Chrome profile, not the work profile**. Verify the selected profile before accessing accounts. The earlier browser selection was not confirmed to be the personal profile.
- Candidate domain `roadwise.sv7.space` was unused in Cloudflare when checked. No DNS records were added and no Vercel project or deployment was created.

## Implementation

Next.js 16.4.1 / React 19 / TypeScript, App Router. `src/components/App.tsx` owns the practice interface. API handlers grade and save tests server-side. `README.md` has the source provenance, limitations and run commands.

Question bank: 269 questions = 97 sign illustrations from Maharashtra Transport + 172 reviewed rules from the official Parivahan question bank. The static learning snapshot is checked in; tests read the same seeded bank from Supabase. Outdated fines, state-specific numerical speed limits and questionable answer keys were excluded.

Supabase project Lawn: `rqdkxgtoccuvuxqkyxzf`. The schema migration has been applied and `data/seed.sql` loaded. New tables only: `roadwise_questions`, `roadwise_attempts`; Lawn's existing tables are unchanged. Local `.env.local` is ignored and contains the existing server-side Lawn credentials. No service-role key or client-exposed credentials are used.

RLS on attempts requires both Lawn's server credential and the matching random browser session ID. History uses an HttpOnly cookie and does not sync between browsers. Completed results are idempotent snapshots. Unfinished choices are kept in localStorage; the user can resume or discard a draft.

## Verified

- Production build and TypeScript check passed.
- Four unit/data validation tests passed.
- Live API checks against isolated test sessions: starting tests, server grading, skipped/invalid answers, repeat submission, history, retry mistakes, cross-session denial and direct REST RLS.
- All generated test rows were removed afterwards.
- Chrome: start test, choose answers, leave/reload/resume, finish/save, answer review, searchable signs. All 97 sign assets decode successfully.
- Mobile CSS exists, but the available browser viewport override had no effect; a real narrow-viewport check remains for a later session.

## Later deployment

Use the personal Chrome profile, create a separate Vercel project, connect this GitHub repo and set the three server-side environment variables from `.env.example`. Keep the Lawn secret server-only. Add the domain on Vercel first, then use its exact returned CNAME target in Cloudflare. Do not copy Lawn/Fits DNS targets or change unrelated DNS records.

## Favicon update — 25 October 2026

Added App Router icon.svg, a multi-resolution favicon.ico and a 180px Apple touch icon. All use the existing charcoal/sage slanted-road brand mark. Next.js file metadata adds the icon links automatically. Production build passed.
