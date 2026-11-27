export const level_5 = {

  spawn: { x: 0, y: 35.5, z: 0 },
  shiftButtons: [
    { left: 19, bottom: 9, action: 'shift' },
    { left: 36, bottom: 35, action: 'complete' },
  ],
  platforms: [
    // outer box
    { left: -1, top: 0, length: 40 },
    { left: -1, top: 40, length: 40 },
    { left: -1, top: 0, length: 40, angle: Math.PI / 2 },
    { left: 38.75, top: 0, length: 40, angle: Math.PI / 2 },

    // platforms from top
    { left: -1, top: 35, length: 5 },
    { left: 34, top: 35, length: 5 },

    { left: 27.5, top: 36.25, length: 9, color: '#131313', angle: -Math.PI / 8 },

    { left: -1, top: 33, length: 13 },
    { left: 12, top: 33, length: 17, width: 0.1, z: -1.24 },

    { left: 36, top: 31.25, length: 2.75, color: '#131313' },

    { left: 9, top: 31, length: 6 },
    { left: 15, top: 31, length: 24, width: 0.1, z: -1.24 },

    { left: -1, top: 29, length: 19 },
    { left: 18, top: 29, length: 11, width: 0.1, z: -1.24 },

    { left: 27, top: 27.25, length: 9, color: '#131313', angle: Math.PI / 8 },

    { left: 9, top: 27, length: 12 },
    { left: 21, top: 27, length: 8, width: 0.1, z: -1.24 },

    { left: 23, top: 26.5, length: 2, color: '#131313' },
    { left: 27, top: 25.25, length: 2, color: '#131313' },

    { left: -1, top: 25, length: 25 },
    { left: 24, top: 25, length: 5, width: 0.1, z: -1.24 },

    { left: 31, top: 24.25, length: 2, color: '#131313' },
    { left: 35, top: 23.25, length: 2, color: '#131313' },

    { left: 9, top: 23, length: 18 },
    { left: 27, top: 23, length: 12, width: 0.1, z: -1.24 },

    { left: 31, top: 22.25, length: 2, color: '#131313' },

    { left: -1, top: 21, length: 30 }, //center

    { left: 31, top: 20.25, length: 7.75, color: '#131313' },

    { left: 9, top: 19, length: 9 },
    { left: 18, top: 19, length: 9, width: 0.1, z: -1.24 },
    { left: 27, top: 19, length: 12 },

    { left: 23, top: 18.5, length: 2, color: '#131313' },
    { left: 20, top: 17.25, length: 2, color: '#131313' },

    { left: -1, top: 17, length: 16 },
    { left: 15, top: 17, length: 9, width: 0.1, z: -1.24 },
    { left: 24, top: 17, length: 6 },

    { left: 17, top: 16.25, length: 2, color: '#131313' },

    { left: 9, top: 15, length: 9 },
    { left: 18, top: 15, length: 3, width: 0.1, z: -1.24 },
    { left: 21, top: 15, length: 18 },

    { left: -1, top: 14.25, length: 8, color: '#131313' },

    { left: -1, top: 13, length: 10 },
    { left: 9, top: 13, length: 9, width: 0.1, z: -1.24 },
    { left: 18, top: 13, length: 11 },

    { left: 11, top: 12.25, length: 2, color: '#131313' },

    { left: 9, top: 11, length: 3 },
    { left: 12, top: 11, length: 3, width: 0.1, z: -1.24 },
    { left: 15, top: 11, length: 24 },

    { left: -1, top: 10.25, length: 8, color: '#131313' },

    { left: -1, top: 9, length: 30 },    
    { left: 29, top: 9, length: 9.75, color: '#131313'},
    
    { left: 9, top: 7, length: 30 },
    { left: -1, top: 5, length: 30 },
    { left: 9, top: 3, length: 30 },
  ],
};
