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
    let v = fv * Math.random() * 0.5 + 0.25;
    zzfx(v,0,262.63,.28,.1,.9,1,5.9,0,0,0,0,0,.1,0,.1,.1,.35,.12,0,-1017); // Glow
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
    zzfx(fv,.05,156,.22,.51,.49,0,1.9,0,0,0,0,0,.3,0,0,.05,.85,.19,.01,-1208); // Powerup 64 - Mutation 2
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
    const major = [
      // Level 1: 1-octave triad (C-E-G-C)
      [65.41, 82.41, 98.00, 130.81, 98.00, 82.41],

      // Level 4: 1-octave full major scale (C-D-E-F-G-A-B-C)
      [65.41, 73.42, 82.41, 87.31, 98.00, 110.00, 123.47, 130.81, 123.47, 110.00, 98.00, 87.31, 82.41, 73.42],

      // Level 2: 2-octave triad (C-E-G-C-E-G-C)
      [65.41, 82.41, 98.00, 130.81, 164.81, 196.00, 261.63, 196.00, 164.81, 130.81, 98.00, 82.41],

      // Level 3: 1-octave major pentatonic scale (C-D-E-G-A-C)
      [65.41, 73.42, 82.41, 98.00, 110.00, 130.81, 110.00, 98.00, 82.41, 73.42],

      // Level 5: 2-octave major 9th arpeggio (C-E-G-B-D-G-B-D)
      [65.41, 82.41, 98.00, 123.47, 146.83, 196.00, 246.94, 293.66, 246.94, 196.00, 146.83, 123.47, 98.00, 82.41],

      // Level 6: Broken-third wave (C-E-D-F-E-G-F-A-G-B-C)
      [65.41, 82.41, 73.42, 87.31, 82.41, 98.00, 87.31, 110.00, 98.00, 123.47, 130.81, 110.00, 123.47, 98.00, 110.00, 87.31, 98.00, 82.41, 87.31, 73.42],

      // Level 7: 2-octave Lydian/major scale run with octave skips
      [65.41, 130.81, 82.41, 98.00, 110.00, 130.81, 146.83, 164.81, 185.00, 196.00, 220.00, 246.94, 261.63, 246.94, 220.00, 196.00, 185.00, 164.81, 146.83, 130.81, 110.00, 98.00, 82.41, 130.81]
    ];

    const minor = [
      // Level 1: 1-octave minor add9 (your exact L1 pattern: C-Eb-G-D)
      [65.41, 77.78, 98.00, 146.83, 98.00, 77.78],
      
      // Level 4: 1-octave natural minor scale (C-D-Eb-F-G-Ab-Bb-C)
      [65.41, 73.42, 77.78, 87.31, 98.00, 103.83, 116.54, 130.81, 116.54, 103.83, 98.00, 87.31, 77.78, 73.42],


      // Level 2: 2-octave minor add9 (your exact L2 pattern: C-Eb-G-D-Eb-G-D)
      [65.41, 77.78, 98.00, 146.83, 155.56, 196.00, 293.66, 196.00, 155.56, 146.83, 98.00, 77.78],

      // Level 3: 1-octave minor pentatonic scale (C-Eb-F-G-Bb-C)
      [65.41, 77.78, 87.31, 98.00, 116.54, 130.81, 116.54, 98.00, 87.31, 77.78],

      // Level 5: 2-octave minor 9th arpeggio (C-Eb-G-Bb-D-G-Bb-D)
      [65.41, 77.78, 98.00, 116.54, 146.83, 196.00, 233.08, 293.66, 233.08, 196.00, 146.83, 116.54, 98.00, 77.78],

      // Level 6: Broken-third wave in natural minor (C-Eb-D-F-Eb-G-F-Ab-G-Bb-C)
      [65.41, 77.78, 73.42, 87.31, 77.78, 98.00, 87.31, 103.83, 98.00, 116.54, 130.81, 103.83, 116.54, 98.00, 103.83, 87.31, 98.00, 77.78, 87.31, 73.42],

      // Level 7: 2-octave harmonic/melodic minor run with octave skips
      [65.41, 130.81, 77.78, 98.00, 103.83, 130.81, 146.83, 155.56, 174.61, 196.00, 207.65, 246.94, 261.63, 246.94, 207.65, 196.00, 174.61, 155.56, 146.83, 130.81, 103.83, 98.00, 77.78, 130.81]
    ];

    let i = 0, key = 0, ascending = true;
    const lvlIdx = this.levelIdx;

    this.stopTune(); // just in case
    this.tempo = setInterval(() => {
      const baseNotes = this.major ? major[lvlIdx] : minor[lvlIdx];
      const notes = transpose(baseNotes, key);
      //console.log(this.major);

      zzfx(mv,0,notes[i],.05,.47,.44,0,1.3,0,0,0,0,0,0,0,0,0,.56,.04,0,0); // Note
      
      i++;
      if (i >= notes.length) {
        i = 0;
        if (ascending && key < 5) {
          key++;
          if (key === 5) {
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