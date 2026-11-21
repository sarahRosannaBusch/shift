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

    // walling off complete button
    { left: 34, top: 0, length: 1, angle: Math.PI / 2, color: '#131313' },
    { left: 34, top: 1, length: 5, angle: Math.PI / 2 },
    { left: 34, top: 6, length: 2, width: 0.1, z: -1.24, angle: Math.PI / 2 },
    { left: 34, top: 8, length: 32, angle: Math.PI / 2 },


    // 2d platforms
    { left: 15, top: 1.25, length: 7, angle: Math.PI / 8 },
    { left: 25, top: 4, length: 9 },

    { left: 30, top: 5.25, length: 2 },
    { left: 26, top: 6.25, length: 2 },
    { left: 22, top: 7.25, length: 2 },
    { left: 18, top: 8.25, length: 2 },
    { left: 13, top: 7.25, length: 2 },
    { left: 8, top: 6.25, length: 2 },

    { left: 0.9, top: 6.05, length: 10, angle: -Math.PI / 8 },
    
    // shift button platform
    { left: 10, top: 2.25, length: 3 }, 

    // 3d platform
    { left: 33, top: 6, length: 1, color: '#131313' },
    { left: 35.5, top: 2.25, length: 2, color: '#131313' },
  ],
};
