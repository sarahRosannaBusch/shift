export const level_0 = {
  spawn: { x: 0, y: 0.575, z: 0 },
  shiftButtons: [
    { left: 36, bottom: 9.25, action: 'shift' },
    { left: 1, bottom: 17.25, action: 'complete' },
  ],
  platforms: [
    // outer box
    { left: -1, top: 0, length: 40 },
    { left: -1, top: 40, length: 40 },
    { left: -1, top: 0, length: 40, angle: Math.PI / 2 },
    { left: 38.75, top: 0, length: 40, angle: Math.PI / 2 },

    // 2d platforms
    { left: 2, top: 1.25, length: 2},
    { left: 6, top: 2.25, length: 2 },
    { left: 10, top: 3.25, length: 2 },
    { left: 14, top: 4.25, length: 2 },
    { left: 18, top: 5.25, length: 2 },
    { left: 22, top: 6.25, length: 2 },
    { left: 26, top: 7.25, length: 2 },
    { left: 30, top: 8.25, length: 2 },
    { left: 34, top: 9.25, length: 5 },

    // 3d platforms
    { left: 30, top: 10.25, length: 2, color: '#131313' },
    { left: 26, top: 11.25, length: 2, color: '#131313' },
    { left: 22, top: 12.25, length: 2, color: '#131313' },
    { left: 18, top: 13.25, length: 2, color: '#131313' },
    { left: 14, top: 14.25, length: 2, color: '#131313' },
    { left: 10, top: 15.25, length: 2, color: '#131313' },
    { left: 6, top: 16.25, length: 2, color: '#131313' },

    { left: -1, top: 17.25, length: 5 },    

  ],
};
