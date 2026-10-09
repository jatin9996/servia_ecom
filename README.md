# Seravia

Doctor-owned skincare commerce for Indian skin. Storefront, admin desk, Postgres, and a Razorpay-style checkout.

## Stack

- **Next.js** storefront and admin (App Router)
- **Node.js** route handlers for auth, catalog writes, checkout and payments
- **PostgreSQL** via Prisma
- **Razorpay** for live UPI, cards, netbanking and wallets
- **Seravia Pay sandbox** when Razorpay keys are empty, so the full order flow still runs

## Run

```bash
npm install
npm run db:up
npm run db:setup
npm run dev
```

Postgres is published on port **5433** so it does not clash with a local Postgres already using 5432.

Shop: http://localhost:3000  
Admin: http://localhost:3000/admin

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@seravia.life | Seravia#Admin1 |
| Customer | mira@seravia.life | Seravia#Care1 |

Mira’s account has Seravia Points and past orders. Codes: `WELCOME10`, `CLINIC200`, `SPF50`.

## Live payments

Set these in `.env`, then restart:

```
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

Use Razorpay test keys first. Checkout opens Razorpay Checkout (UPI, cards, netbanking, wallets). The server verifies the payment signature before an order is marked paid. Without keys, Seravia Pay sandbox confirms the order locally and never charges a card.
