export const level_5 = {
  spawn: { x: 0, y: 0.575, z: 0 },
  shiftButtons: [
    { left: 2.1, bottom: 1.2, action: 'shift' },
    { left: 18, bottom: 4.8, action: 'complete' },
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
  ],
};
