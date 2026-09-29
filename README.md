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

## Configure accounts and community

The public landing page, pricing, guide and read-only community are available without an account. The tracker, garage, planner, arcade and community posting require a confirmed account. Basic member access is free by default. The Pro offer is a pricing preview: there is no checkout or automatic subscription creation.

1. Create a Supabase project and copy `.env.example` to `.env.local`. Set its project URL, publishable key and the exact site origin. Never place a service-role key in `NEXT_PUBLIC_*` variables.
2. Run `supabase/migrations/202609260001_subscriptions.sql` and `supabase/migrations/202609260002_community.sql` in the project's SQL editor.
3. In Supabase Auth URL configuration, set the Site URL to your deployed origin. Allow `https://your-origin/auth/callback` and `https://your-origin/auth/confirm` as redirect URLs (and their localhost equivalents for development). Configure email delivery and verify the signup, reset and confirmation templates.
4. Restart the Next.js server. Until these values and migrations exist, account forms are disabled and the community displays an honest unavailable state; the public site still works.

`WORKSPACE_ACCESS=subscription` is an optional deployment setting that gates member tools and posting on a valid `subscriptions` row. Keep the default `account` until a trusted payment webhook, subscription lifecycle, cancellation flow and billing terms are implemented. Only a trusted backend should write entitlements; the client cannot grant itself paid access. There is currently no payment integration.

Personal tracker, planner, garage and arcade data live in browser storage namespaced by authenticated user ID, not in Supabase. They are not synced across devices. The workspace offers JSON export and restore; export existing anonymous data before moving to an account. The community board is shared through Supabase, with post limits, voting, reporting and automatic hiding after three reports. Moderation still needs an operator workflow before a broad public launch. Spoiler posts require an account to read, with an explicit reveal screen.

## Experience

- English, Spanish and Brazilian Portuguese copy, remembered language selection, keyboard access and reduced-motion preference.
- Colorful skyline, lighting presets, reactive 3D cards and tags, and a full-bleed scroll-scrubbed official trailer excerpt. There is no video player chrome. Sound is opt-in, tied to scrolling, and pauses when the scene is idle or offscreen.
- Original Web Audio Coast Radio with two generated stations; switching between radio and scene sound prevents competing audio.
- Member workspace: objectives, garage, planner, timer, search, filters, undo, export and validated restore.
- Member arcade: original 2D delivery game with keyboard/touch controls and a per-device best score.
- Member Creator Lab: an original, interactive crew-scenario simulator with route, pressure and team controls; its scores are fictional and a scenario can be saved on this device.
- Public field guide: six research questions and original prototype ideas, clearly separated from confirmed GTA VI facts.
- Community board: observations, theories and crews with source links/timestamps, languages, spoiler labels, votes and reports. Source evidence is required for observations and theories.
- `/pricing` shows proposed Explorer and Pro prices in BRL, USD and EUR. These are hypotheses, not live billing.

## Media and independence

The scene uses a 12-second excerpt (00:12–00:24) from [Rockstar Games' official GTA VI Trailer 2](https://www.rockstargames.com/VI/media/videos). The 1920×864 H.264 copy is optimized for bidirectional seeking, and the matching `.m4a` audio excerpt plays only after an explicit gesture. The poster is its first frame. Motion off uses the poster without fetching the video. Original footage belongs to Rockstar Games; this fan project is not affiliated with or endorsed by Rockstar Games.

The skyline is a CSS illustration. Card motion uses CSS perspective, not a WebGL engine. The arcade and synthesized radio are original companion experiences, not GTA VI gameplay or soundtrack.
