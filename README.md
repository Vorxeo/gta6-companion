# VI Companion

A colorful, independent fan companion for GTA VI, built with Next.js 15, React 19, TypeScript and CSS 3D transforms.

## Run

Requires Node.js 22.13+ (or a supported newer LTS).

```sh
npm ci
npm run dev
```

## Validate

```sh
npm run typecheck
npm run build
```

Do not run dev and build simultaneously: both use `.next`.

## Features

- Sunset skyline, neon gradients, pointer-reactive 3D cards, floating icons and tags.
- Sticky cinema section: scrolling seeks forward and backward through an official cover-art clip.
- Motion switch, initial OS reduced-motion preference, keyboard-accessible dialogs and responsive layout.
- Personal objectives, completion toggles and a wishlist garage saved locally when storage is available.
- Session planner that divides a chosen duration and saves the plan as a personal objective.

This is a fan project, not an official gameplay database or map. Lists are personal and not synchronized between devices.

## Media attribution

The cover-art animation is from Rockstar Games' official downloadable media at https://www.rockstargames.com/VI/media/videos . Original source: https://media-rockstargames-com.akamaized.net/VI/downloads/videos/GTAVI_Official_Cover_Art_Landscape/GTAVI_Official_Cover_Art_Landscape.mp4 .

The local web excerpt uses seconds 10–27, 1920×1080 H.264, no audio, CRF 19, keyframes every 8 frames and fast-start metadata for responsive seeking. The poster is a frame at second 16. Original art and footage belong to Rockstar Games; no affiliation or endorsement is implied. The original video is linked from the experience.

The skyline is a CSS illustration, not a game screenshot. Motion uses CSS perspective rather than a WebGL engine.

## Multilingual product workspace

The interface supports English, Spanish and Brazilian Portuguese, including accessible labels, empty/error states and the cinema. The browser language selects the initial locale, and the explicit language selection is remembered. User-entered names are never translated; generated session objectives use structured data so their labels follow the selected language.

The redesigned dashboard opens a single responsive workspace with:

- Objectives: categories, search, completion filters, rename, delete and undo.
- Garage: vehicle types, wishlist/owned status, favorites, search, rename and undo.
- Planner: duration presets, exact time allocation, localized saved objectives and a deadline-based start/pause/resume/reset timer. The timer continues across tools while this page is open; it does not run across page reloads.
- Explore: three illustrated inspiration prompts that select a session focus; these are not official game locations.
- Data controls: JSON export and validated restore with replacement confirmation, list size limits and visible storage errors.

The version 2 data reader migrates the previous `{ tasks, cars }` local-storage format. Tests cover migration, backup round trips and rejection, duplicate IDs, allocation totals and translation-key parity. Run `npm test` with Node 22.13+.
