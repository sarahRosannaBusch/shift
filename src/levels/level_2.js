export const level_2 = {
  spawn: { x: 0, y: 0.575, z: 0 },
  shiftButtons: [
    { left: 2.1, bottom: 1.2, action: 'shift' },
    { left: 6.6, bottom: 2.1, action: 'complete' },
  ],
  platforms: [
    // outer box
    { left: -1, top: 0, length: 40 },
    { left: -1, top: 40, length: 40 },
    { left: -1, top: 0, length: 40, angle: Math.PI / 2 },
    { left: 38.75, top: 0, length: 40, angle: Math.PI / 2 },

    // platforms
    { left: 2, top: 1.2, length: 2.5 },
    { left: 5.8, top: 2.1, length: 2.5 },
  ],
};
