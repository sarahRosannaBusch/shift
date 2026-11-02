export const level_0 = {
  spawn: { x: 0, y: 0.575, z: 0 },
  platforms: [
    { left: -2.25, top: 0.125, length: 4.5 },
    { left: 2.95, top: 0.95, length: 2.5 },
    {
      left: 5.45,
      top: 0.95,
      length: Math.hypot(4.1, 1.6),
      angle: Math.atan2(1.6, 4.1),
    },
    { left: 9.55, top: 2.55, length: 2.5 },
    
    // bottom row
    { left: -14.6, top: -3.5, length: 1.5, angle: Math.PI / 2 },
    {
      left: -14.6,
      top: -3.5,
      length: 40,
      markers: { spacing: 2, z: 1.18 },
    },
    { left: 25.15, top: -3.5, length: 1.5, angle: Math.PI / 2 },
  ],
};
