export const level_1 = {
  spawn: { x: 0, y: 0.575, z: 0 },
  shiftButtons: [
    { left: 20, bottom: 29.25, action: 'shift' },
    { left: 20, bottom: 9.25, action: 'complete' },
  ],
  platforms: [
    // outer box
    { left: -1, top: 0, length: 40 },
    { left: -1, top: 40, length: 40 },
    { left: -1, top: 0, length: 40, angle: Math.PI / 2 },
    { left: 38.75, top: 0, length: 40, angle: Math.PI / 2 },

    // 2d platforms
    { left: 2, top: 1.25, length: 2 }, 
    { left: -1, top: 2.25, length: 2 },
    { left: 2, top: 3.25, length: 2 },
    { left: -1, top: 4.25, length: 2 },
    { left: 2, top: 5.25, length: 2 },
    { left: -1, top: 6.25, length: 2 },
    { left: 2, top: 7.25, length: 2 },
    { left: -1, top: 8.25, length: 2 },
    { left: 2, top: 9.25, length: 20 },

    // 3d platforms
    { left: 15, top: 9.25, length: 10 }, // button base
    { left: 15, top: 9.25, length: 10, angle: Math.PI / 2, color: '#131313' },
    { left: 25, top: 9.25, length: 10, angle: Math.PI / 2, color: '#131313' },
    { left: 15, top: 19.25, length: 10, color: '#131313' },
  ],
};
