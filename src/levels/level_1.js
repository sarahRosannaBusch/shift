export const level_1 = {
  spawn: { x: 0, y: 0.575, z: 0 },
  shiftButtons: [
    { left: 11, bottom: 2.25, action: 'shift' },
    { left: 36, bottom: 0, action: 'complete' },
  ],
  platforms: [
    // outer box
    { left: -1, top: 0, length: 40 },
    { left: -1, top: 40, length: 40 },
    { left: -1, top: 0, length: 40, angle: Math.PI / 2 },
    { left: 38.75, top: 0, length: 40, angle: Math.PI / 2 },

    // 2d platforms

    // walling off complete button
    { left: 34, top: 0, length: 6, angle: Math.PI / 2 },
    { left: 34, top: 6, length: 2, width: 0.1, z: -1.24, angle: Math.PI / 2 },
    { left: 34, top: 8, length: 32, angle: Math.PI / 2 },

    // shift button platform
    { left: 10, top: 2.25, length: 3 }, 

    { left: 15, top: 0, length: 10.45, angle: Math.PI / 8 },
    { left: 24.65, top: 4, length: 9.5 },

    { left: 28, top: 5, length: 4 },

    { left: 0.9, top: 6.05, length: 10, angle: -Math.PI / 8 },

    // 3d platforms
  ],
};
