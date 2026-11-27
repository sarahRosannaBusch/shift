export const level_0 = {  
  spawn: { x: 0, y: 0.575, z: 0 },
  placards: [
    { left: -1, bottom: -1.25, text: '← and → to move' },
    { left: 6.3, bottom: 0, text: '↑ to jump' },
    { left: 13.6, bottom: 3.3, text: '↓ to brake' },
    { left: 23.75, bottom: 5.5, text: 'Shift to 3D', color: '#ffb454' },
    { left: 35.3, bottom: 1, text: 'Complete level!', color: '#b9f27c' },
  ],
  shiftButtons: [
    { left: 24.5, bottom: 3.9, action: 'shift' },
    { left: 36.5, bottom: 0, action: 'complete' },
  ],
  platforms: [
    // outer box
    { left: -1, top: 0, length: 40 },
    { left: -1, top: 40, length: 40 },
    { left: -1, top: 0, length: 40, angle: Math.PI / 2 },
    { left: 38.75, top: 0, length: 40, angle: Math.PI / 2 },

    // platforms
    { left: 10, top: 1.2, length: 2.5 },
    { left: 14.5, top: 2.1, length: 1 },
    { left: 17.6, top: 3, length: 2.5 },
    { left: 22, top: 3.9, length: 6 },
    { left: 30, top: 3.9, length: 5, angle: -Math.PI / 8 },
  ],
};
