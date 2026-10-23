# Unity Beauty POS

Point-of-sale and order management for Unity Beauty: checkout with barcode scanning (USB scanner or phone camera), inventory, orders, A4 order sheets with a private QR code, and the Tekpe (택배) shipping board. Uzbek (Latin) UI. Next.js 16 on Vercel + Supabase.

- Design spec: `docs/superpowers/specs/2026-10-23-unity-beauty-pos-design.md`
- Phase 1 plan: `docs/superpowers/plans/2026-10-23-unity-beauty-pos-phase1.md`
- Product record and visual direction: `PRODUCT.md`, `.impeccable/surfaces/`

## Local setup

Requires Node 24.

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local`:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys → publishable key |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys → secret key (server only, never commit) |
| `SUPABASE_DB_URL` | Supabase → Connect → Session pooler URI (only for `npm run test:db`) |

```bash
npm run dev
```

## First admin account

Accounts are created only by an admin (there is no self sign-up). Create the first admin from your terminal:

```bash
node scripts/create-admin.mjs
```

Then in Supabase → Authentication → Sign In / Providers, turn **off** "Allow new users to sign up". (Even if it stays on, accounts created outside the admin panel get no access.)

Sign in at `/login` with that admin, open **Akkauntlar**, and create the owner and seller accounts. Admins only manage accounts and settings; selling screens are for owner and seller accounts.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on http://localhost:3000 |
| `npm test` | Unit tests (Vitest) |
| `npm run test:db` | Database tests in rolled-back transactions (needs `SUPABASE_DB_URL`) |
| `npm run e2e` | Playwright smoke test (needs `.env.test.local` with `E2E_SELLER_USER` / `E2E_SELLER_PASS`) |
| `npm run lint` / `npm run build` | Lint / production build |
| `node scripts/prepare-logos.mjs` | Rebuilds `public/brand/*` from `Unity.png` and `Nura.png` |

After `npm run e2e`, remove its test data by running `supabase/e2e-cleanup.sql` in the Supabase SQL editor.

## Database

Migrations live in `supabase/migrations/` and are already applied to the project. Business writes (checkout, cancel, restock, stock adjust, Tekpe status) go through Postgres functions; the browser can only read tables, so stock and orders stay consistent across every device.

## Deploy (GitHub → Vercel)

1. Push this repository to GitHub.
2. In Vercel, **Add New → Project**, import the repository (framework: Next.js).
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`.
4. Deploy. Then in Supabase → Authentication → URL Configuration, set **Site URL** to the Vercel URL.

Phones: open the Vercel URL in Chrome or Safari and use "Add to Home screen". The camera scanner needs HTTPS (Vercel provides it).

## Printing

"Chop etish" opens the browser print dialog with the A4 sheet. The Phase 2 Windows app (.exe) will print silently to the selected printer.
