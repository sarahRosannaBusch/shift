export const level_1 = {
  spawn: { x: 0, y: 0.575, z: 0 },
  shiftButtons: [
    { left: 9, bottom: 0 },
    { left: 14.2, bottom: 3.9 },
  ],
  platforms: [
    // outer box
    { left: -1, top: 0, length: 40 },
    { left: -1, top: 10, length: 40 },
    { left: -1, top: 0, length: 10, angle: Math.PI / 2 },
    { left: 38.75, top: 0, length: 10, angle: Math.PI / 2 },

    // platforms
    { left: 2, top: 1.2, length: 2.5 },
    { left: 5.8, top: 2.1, length: 2.5 },
    { left: 9.6, top: 3, length: 2.5 },
    { left: 13.4, top: 3.9, length: 2.5 },
    { left: 17.2, top: 4.8, length: 2.5 },
    { left: 21, top: 5.7, length: 2.5 },
    { left: 24.8, top: 6.6, length: 2.5 },
    { left: 28.6, top: 7.5, length: 2.5 },
    { left: 32.4, top: 8.4, length: 6.35 },
  ],
};
