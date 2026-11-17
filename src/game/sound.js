import { ZZFX, zzfx } from 'zzfx';

let fv = 1; // fx volume
let mv = 0.1; // music volume

export const soundfx = {
  // master volume
  get volume() {
    return ZZFX.volume;
  },
  set volume(value) {
    ZZFX.volume = value;
  },

  // Sound effects
  get fxVolume() {
    return fv;
  },
  set fxVolume(value) {
    fv = value;
  },

  glow() {
    zzfx(fv,0,262.63,.28,.1,.9,1,5.9,0,0,0,0,0,.1,0,.1,.1,.35,.12,0,-1017); // Glow
  },
  bump() {
    zzfx(fv,.05,220,0,0,.1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0); // Bump
  },
  jump() {
    zzfx(fv,.05,200,.01,.02,.08,0,1.3,4,171,0,0,0,0,0,0,0,.7,.03,0,-1407); // Jump
  },

  // Music
  get musicVolume() {
    return mv;
  },
  set musicVolume(value) {
    mv = value;
  },

  tune() {
    let tempo = setInterval(() => {
      zzfx(...[mv,0,261.6256,.11,.19,.22,,1.8,,,,,,.2,,.1,,.67,.04]); // Music 5
    }, 1000);
    setTimeout(() => {
      clearInterval(tempo);
    }, 10000);
  }
};
