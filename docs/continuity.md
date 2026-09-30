# Continuity checkpoint

Updated 2026-09-30. Recheck Git status and HEAD before relying on this file.

The current work adds structured GTA VI Companion navigation, a `/news` page and home news desk, official music announcement instead of synthetic radio, `/buy` outbound links to Rockstar/PlayStation/Xbox, and slower scroll cinema with native trailer audio. Four languages remain supported. Community remains public to read and available to confirmed accounts for posting; Pro tools still require a paid entitlement.

The local preview uses `npx next start -p 3000` after `npm run build`. This working session has an hourly thread heartbeat named `Retomar GTA VI Companion` that should resume only unfinished authorized work. Check whether it already completed before doing anything on a later run.

After the final scene-control edit, `npm test` reported 21 passed / 0 failed, `npm run typecheck` exited 0, and `npm run build` exited 0. Result files are in the parent task workspace under `vd-gta-*-release.txt`. Leave the production preview open after committing and pushing to `main`.

External launch work still depends on the owner's Supabase project, Mollie merchant settings, legal pages and media licensing. Do not present checkout or media rights as cleared. The official-news cards are a dated editorial selection, not a live feed; the Rockstar Newswire link leads to current updates.
