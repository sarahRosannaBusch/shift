export const level_2 = {
  spawn: { x: 19.5, y: 21, z: 0 },
  shiftButtons: [
    { left: 19, bottom: 26.25, action: 'shift' },
    { left: 19, bottom: 0, action: 'complete' },
  ],
  platforms: [
    // outer box
    { left: -1, top: 0, length: 40 },
    { left: -1, top: 40, length: 40 },
    { left: -1, top: 0, length: 40, angle: Math.PI / 2 },
    { left: 38.75, top: 0, length: 40, angle: Math.PI / 2 },

    // middle platforms
    { left: -1, top: 20, length: 16 },
    { left: 15, top: 20, length: 3, color: '#131313' },
    { left: 18, top: 20, length: 3 }, //player starts here
    { left: 21, top: 20, length: 3, color: '#131313' },
    { left: 24, top: 20, length: 3 },
    { left: 27, top: 20, length: 3, width: 0.1, z: -1.24, },
    { left: 30, top: 20, length: 9 },

    // right steps
    { left: 27, top: 20, length: 1, angle: Math.PI / 2, color: '#131313' },
    { left: 27, top: 21.25, length: 3 },
    { left: 30, top: 21.25, length: 1, angle: Math.PI / 2, color: '#131313' },
    { left: 30, top: 22.5, length: 3 },
    { left: 33, top: 22.5, length: 1, angle: Math.PI / 2, color: '#131313' },
    { left: 33, top: 23.75, length: 3 },
    { left: 36, top: 25, length: 3 },

    // hops to shift button
    { left: 31, top: 26.25, length: 3 },
    { left: 27, top: 26.25, length: 2 },
    { left: 24, top: 26.25, length: 1 },
    { left: 17, top: 26.25, length: 5 }, // shift button's here
    { left: 14, top: 26.25, length: 1 },
    { left: 10, top: 26.25, length: 2 },
    { left: 5, top: 26.25, length: 3 },

    // left steps
    { left: 11.75, top: 20, length: 1, angle: Math.PI / 2, color: '#131313' },
    { left: 9, top: 21.25, length: 3 },
    { left: 8.75, top: 21.25, length: 1, angle: Math.PI / 2, color: '#131313' },
    { left: 6, top: 22.5, length: 3 },
    { left: 5.75, top: 22.5, length: 1, angle: Math.PI / 2, color: '#131313' },
    { left: 3, top: 23.75, length: 3 },
    { left: 2.75, top: 23.75, length: 1, angle: Math.PI / 2, color: '#131313' },
    { left: -1, top: 25, length: 4 },

  ],
};
