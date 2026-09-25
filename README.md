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
