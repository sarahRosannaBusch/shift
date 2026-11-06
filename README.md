# shift

Three.js game project using Cannon-es for rigid-body physics.

## Getting started

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The game loop is in `src/main.js`, reusable
platform construction is in `src/components/`, and level layouts live in
`src/levels/`. The current scene is `level_0`; add new component modules under
`src/components/` and level modules under `src/levels/`.

Levels are data objects with a `platforms` array, ordered left to right. Ramps
and barriers are platforms too; set `angle` in radians to rotate one. `length`
runs along the platform, `width` runs across it, and `thickness` is vertical.
The `Platform` component defaults to a width of `2.5` and thickness of `0.25`;
override these only when a platform needs different dimensions. The level loader
creates each platform in array order. Add button configurations to a level's
`shiftButtons` array; each uses `left` and `bottom` for the base's bottom-left
corner. Button dimensions and colors are fixed in the `ShiftButton` component.
Button colors can be overridden with the optional `baseColor` and `plungerColor`
properties. The plunger is dynamic, moves vertically when pressed, and slightly
rebounds when released. Once pressed to the bottom, it sets `wasPressed`, which
triggers the camera's transition to the angled view.

## Production build

```sh
npm run build
npm run preview
```
