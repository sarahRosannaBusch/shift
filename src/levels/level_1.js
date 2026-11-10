export const level_1 = {
  spawn: { x: 0, y: 0.575, z: 0 },
  shiftButtons: [
    { left: 2.1, bottom: 1.2, action: 'shift' },
    { left: 3.45, bottom: 1.2, action: 'complete' },
  ],
  platforms: [
    // outer box
    { left: -1, top: 0, length: 40 },
    { left: -1, top: 10, length: 40 },
    { left: -1, top: 0, length: 10, angle: Math.PI / 2 },
    { left: 38.75, top: 0, length: 10, angle: Math.PI / 2 },

    // platforms
    { left: 2, top: 1.2, length: 2.5 },
  ],
};
