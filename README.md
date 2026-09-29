# VI Companion / After Dark

An independent, multilingual GTA VI fan companion, built with Next.js 15, React 19, TypeScript and CSS 3D motion. The GitHub experience combines its scroll-controlled cinematic scene and personal planning tools with original After Dark-inspired radio, an arcade game, a field guide and a community evidence board.

## Run and validate

Use Node.js 22.13+ (or a newer supported LTS).

```sh
npm ci
npm run dev
```

```sh
npm test
npm run typecheck
npm run build
```

Do not run dev and build simultaneously: both use `.next`.

## Accounts, Pro access and Mollie

The landing page, cinematic scene, guide, pricing and reading the community are public. The personal workspace, Arcade, Creator Lab and community publishing require a confirmed account **and a paid, unexpired Mollie entitlement**. Locked pages show blurred previews and link to `/pricing`. Votes and reports require a confirmed account but remain free. EUR and USD use card checkout when enabled. BRL is prepared for PayPal recurring and remains disabled until `MOLLIE_BRL_ENABLED=true` after merchant-profile verification. Prices and renewal terms are shown before checkout.

1. Create a Supabase project and copy `.env.example` to `.env.local`. Set its project URL, publishable key and exact site origin. Never expose the service-role key or Mollie API key through `NEXT_PUBLIC_*`.
2. Apply all five SQL migrations in timestamp order. The final migration changes the community insert RLS policy, so a direct Supabase insert cannot bypass the Pro gate. Verify the migration on a staging Postgres project first.
3. In Supabase Auth URL configuration, set the Site URL to your deployed origin and allow `https://your-origin/auth/callback` and `https://your-origin/auth/confirm` as redirects. Configure email delivery and test signup, confirmation, reset and sign-in.
4. Set `SUPABASE_SERVICE_ROLE_KEY`, a Mollie **test** API key and a random `MOLLIE_WEBHOOK_SECRET` of at least 32 characters. Set `MOLLIE_WEBHOOK_BASE_URL` to a public HTTPS origin reachable by Mollie (a tunnel is needed for local testing). Point `MOLLIE_TERMS_URL` and `MOLLIE_PRIVACY_URL` to real HTTPS pages describing the subscription, cancellation and data handling. Enable credit cards and EUR/USD in the Mollie profile. For BRL, enable PayPal recurring, apply the BRL checkout migration, verify both first and recurring BRL PayPal methods in the live profile, then set `MOLLIE_BRL_ENABLED=true`. The server checks method availability again before creating a payment.
5. Run an end-to-end test payment, webhook, return, renewal, cancellation and refund/chargeback against the staging database. Then set `BILLING_ENABLED=true` to open new checkouts. Existing webhook processing and cancellation continue when this flag is false. Switch to a Mollie live key only after the live profile, legal pages and deployment have been reviewed.

The checkout creates a Mollie customer and first card payment. A signed-in user gets Pro only after the server fetches a paid payment from Mollie and checks customer, amount, currency and checkout ID. A recurring subscription is then created for the next billing period; return visits and webhooks retry provisioning idempotently. The webhook URL contains a secret, and its payment ID is always verified against Mollie's API. The Billing page lets the owner cancel renewal while retaining access through the paid period. Refunds or chargebacks of the latest payment revoke access. Server actions and community RLS enforce the gate; the blurred cards are only presentation.

Do not enable checkout without a public HTTPS webhook, working database migrations and valid legal pages. This repository does not contain live keys or a configured Mollie account; local checks cannot prove real payments or database policies.

Personal tracker, planner, garage and arcade data live in browser storage namespaced by authenticated user ID, not in Supabase. They are not synced across devices. The workspace offers JSON export and restore; export existing anonymous data before moving to an account. The community board is shared through Supabase, with post limits, voting, reporting and automatic hiding after three reports. Moderation still needs an operator workflow before a broad public launch. Spoiler posts require an account to read, with an explicit reveal screen.

## Experience

- English, Spanish and Brazilian Portuguese copy, remembered language selection, keyboard access and reduced-motion preference.
- Colorful skyline, lighting presets, reactive 3D cards and tags, and a full-bleed scroll-scrubbed official trailer excerpt. There is no video player chrome. Sound is opt-in, tied to scrolling, and pauses when the scene is idle or offscreen.
- Original Web Audio Coast Radio with two generated stations; switching between radio and scene sound prevents competing audio.
- Pro workspace: objectives, garage, planner, timer, search, filters, undo, export and validated restore.
- Pro arcade: original 2D delivery game with keyboard/touch controls and a per-device best score.
- Pro Creator Lab: an original, interactive crew-scenario simulator with route, pressure and team controls; its scores are fictional and a scenario can be saved on this device.
- Public field guide: six research questions and original prototype ideas, clearly separated from confirmed GTA VI facts.
- Community board: observations, theories and crews with source links/timestamps, languages, spoiler labels, votes and reports. Source evidence is required for observations and theories.
- `/pricing` shows Explorer and Pro prices in BRL, USD and EUR. BRL uses PayPal recurring only after explicit activation and profile verification; EUR/USD use cards. All checkout stays disabled until secure Mollie configuration is complete.

## Media and independence

The scene uses a 12-second excerpt (00:12–00:24) from [Rockstar Games' official GTA VI Trailer 2](https://www.rockstargames.com/VI/media/videos). The 1920×864 H.264 copy is optimized for bidirectional seeking, and the matching `.m4a` audio excerpt plays only after an explicit gesture. The poster is its first frame. Motion off uses the poster without fetching the video. Original footage belongs to Rockstar Games; this fan project is not affiliated with or endorsed by Rockstar Games.

**Commercial launch review:** [Rockstar/Take-Two's published policy](https://support.rockstargames.com/articles/7bNaeoMFTV0iUDGhStTXvz/policy-on-posting-copyrighted-rockstar-games-material) describes use of their footage to promote a product or service as commercial and directs licensing requests to `copyright@take2games.com`. The existing trailer excerpt, audio and poster should be licensed or replaced with original assets before enabling paid subscriptions. This repository does not assert permission to use them commercially.

The skyline is a CSS illustration. Card motion uses CSS perspective, not a WebGL engine. The arcade and synthesized radio are original companion experiences, not GTA VI gameplay or soundtrack.

The proposed full 3D character-and-supercar game is specified in [docs/3d-game-brief.md](docs/3d-game-brief.md). It is a future production phase, not a current product feature.
