import { ZZFX, zzfx } from 'zzfx';

let fv = 1; // fx volume
let mv = 1; // music volume
let major = true;

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
  shift() {
    zzfx(10*fv,.05,233,.5,.5,1,1,3.7,0,-381,0,0,0,0,0,.2,0,.55,.5,0,-609); // Shift
  },

  // Music
  get musicVolume() {
    return mv;
  },
  set musicVolume(value) {
    mv = value;
  },

  get major() {
    return major;
  },
  set major(value) {
    major = value;
  },

  tune() {
    let notes = [65.41, 82.41, 98.00, 130.81, 164.81, 196.00, 261.63, 196.00, 164.81, 130.81, 98.00, 82.41];

    let i = 0, key = 0, ascending = true;
    this.tempo = setInterval(() => {
      //console.log(major); // todo: switch to minor with phase shift
      zzfx(mv,0,notes[i],.05,.47,.44,0,1.3,0,0,0,0,0,0,0,0,0,.56,.04,0,0); // Note
      i++;
      if (i >= notes.length) {
        i = 0;
        if (ascending && key < 5) {
          key++;
          notes = transpose(notes, 1);
          if (key === 5) {
            ascending = false;
          }
        } else if (!ascending && key > 0) {
          key--;
          notes = transpose(notes, -1);
          if (key === 0) {
            ascending = true;
          }
        }
      }
    }, 500);

    function transpose(frequencies, semitones) {
      const multiplier = Math.pow(2, semitones / 12);
      return frequencies.map(freq => Number((freq * multiplier).toFixed(2)));
    }
  },

  stopTune() {
    clearInterval(this.tempo);
  }
};
