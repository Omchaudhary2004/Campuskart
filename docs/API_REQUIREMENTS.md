# External APIs & credentials — CampusKart

Configure these for full production behavior. Local development works with PostgreSQL + simulated wallet top-ups.

## PostgreSQL

- **DATABASE_URL** — connection string (e.g. `postgresql://user:pass@localhost:5432/campuskart`).

## JWT & CORS

- **JWT_SECRET** — long random string for signing tokens.
- **FRONTEND_ORIGIN** — e.g. `http://localhost:5173` or your deployed SPA URL.

## Paytm (escrow funding & payouts)

- **PAYTM_MERCHANT_ID**, **PAYTM_MERCHANT_KEY**, **PAYTM_WEBSITE**, **PAYTM_INDUSTRY_TYPE**, **PAYTM_CHANNEL_ID** (usually `WEB`).
- **PAYTM_CALLBACK_URL** — server URL Paytm posts to after payment.
- **PAYTM_ENVIRONMENT** — `staging` or `production`.
- **APIs to integrate** (per Paytm for Business docs): Initiate Transaction / payment form or JS Checkout, transaction status, and (for settlements) payout/disbursement APIs as per your KYC tier. Replace `POST /api/wallet/paytm/simulate-confirm` with verified callback handling + checksum validation.

## CometChat (1:1 chat after bid acceptance)

- **Backend:** `COMETCHAT_APP_ID`, `COMETCHAT_REGION`, `COMETCHAT_REST_API_KEY` (server-only).
- **Frontend:** `VITE_COMETCHAT_APP_ID`, `VITE_COMETCHAT_REGION` (public).
- **APIs used:** CometChat REST — create/get user, generate auth token (`/v3/users/{uid}/auth_tokens`). See [CometChat REST docs](https://www.cometchat.com/docs).

## Web3Forms (Contact page)

- **VITE_WEB3FORMS_ACCESS_KEY** in `frontend/.env`.
- In the Web3Forms dashboard, set the notification email to **campuskartindia@gmail.com**.

## Discord (Community floating button)

- **VITE_DISCORD_INVITE** — public invite URL to your CampusKart Discord server.
- **DISCORD_INVITE_URL** (optional) in backend if you need server-side redirects.

## Email (optional outbound)

- For server-driven mail, configure SMTP (e.g. Gmail app password for **campuskartindia@gmail.com**) and extend the backend; not required for core marketplace flows.

## Google / Unsplash / Picsum (images)

- No API keys required for the demo image URLs used; replace with your own CDN or storage (S3, Cloudinary) for production.
