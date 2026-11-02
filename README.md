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
creates each platform in array order.

## Production build

```sh
npm run build
npm run preview
```
