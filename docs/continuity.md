# Continuity checkpoint

Updated 2026-09-30. Recheck Git status and HEAD before relying on this file.

The current work adds structured GTA VI Companion navigation, a `/news` page and home news desk, official music announcement instead of synthetic radio, `/buy` outbound links to Rockstar/PlayStation/Xbox, and slower scroll cinema with native trailer audio. Four languages remain supported. Community remains public to read and available to confirmed accounts for posting; Pro tools still require a paid entitlement.

The 2026-09-30 motion update removes the user-facing motion on/off switch and the stored `vi-motion` preference. Motion is enabled automatically except when the device requests reduced motion. Cards now lift slightly on hover and move only their artwork, keeping copy flat. Hero badges have larger, readable lettering. A CSS Vice City skyline, road, palms and neon sign adds animated depth to the home, pricing, news and buy pages. No extra GTA media asset was added.

The local preview uses `npx next start -p 3000` after `npm run build`. This working session has an hourly thread heartbeat named `Retomar GTA VI Companion` that should resume only unfinished authorized work. Check whether it already completed before doing anything on a later run.

For the motion update, `npm test` reported 21 passed / 0 failed, `npm run typecheck` exited 0 and the final `npm run build` exited 0. Result files are in the parent task workspace under `vd-gta-motion-*.txt`. Leave the production preview open after committing and pushing to `main`.

External launch work still depends on the owner's Supabase project, Mollie merchant settings, legal pages and media licensing. Do not present checkout or media rights as cleared. The official-news cards are a dated editorial selection, not a live feed; the Rockstar Newswire link leads to current updates.
