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

  play(soundName, lvlIdx) {
    this.levelIdx = lvlIdx;
    if (navigator.userActivation.hasBeenActive && this[soundName]) {
      this[soundName]();
    }
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
  powerup() {
    zzfx(fv,.05,303,.08,.15,.15,2,1,-7,0,-63,.09,0,0,0,0,.18,.54,.2,0,-754); // Powerup 15 - Mutation 2  
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
    const major = [65.41, 82.41, 98.00, 130.81, 164.81, 196.00, 261.63, 196.00, 164.81, 130.81, 98.00, 82.41];
    const minor = [65.41, 77.78, 98.00, 146.83, 155.56, 196.00, 293.66, 196.00, 155.56, 146.83, 98.00, 77.78];

    let i = 0, key = 0, ascending = true;

    this.stopTune(); // just in case
    this.tempo = setInterval(() => {
      const baseNotes = this.major ? major : minor;
      const notes = transpose(baseNotes, key);
      //console.log(this.major);

      zzfx(mv,0,notes[i],.05,.47,.44,0,1.3,0,0,0,0,0,0,0,0,0,.56,.04,0,0); // Note
      
      i++;
      if (i >= notes.length) {
        i = 0;
        if (ascending && key < 12) {
          key++;
          if (key === 12) {
            ascending = false;
          }
        } else if (!ascending && key > 0) {
          key--;
          if (key === 0) {
            ascending = true;
          }
        }
      }
    }, 400 - this.levelIdx * 20);

    function transpose(frequencies, semitones) {
      const multiplier = Math.pow(2, semitones / 12);
      return frequencies.map(freq => Number((freq * multiplier).toFixed(2)));
    }
  },

  stopTune() {
    clearInterval(this.tempo);
    this.tempo = null;
  }
};