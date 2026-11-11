const jumpKeys = new Set(['w', ' ', 'arrowup']);
const brakeKeys = new Set(['s', 'arrowdown']);

function normalizeKey(key) {
  return key.toLowerCase();
}

export class GameControls {
  constructor() {
    this.movementKeys = new Set();
    this.jumpRequested = false;
    this.restartRequested = false;
    this.menuRequested = false;

    window.addEventListener('keydown', (event) => {
      const key = normalizeKey(event.key);

      if (
        key === 'a' || key === 'd' ||
        key === 'arrowleft' || key === 'arrowright' ||
        brakeKeys.has(key)
      ) {
        event.preventDefault();
        this.movementKeys.add(key);
      }

      if (jumpKeys.has(key)) {
        event.preventDefault();
        if (!event.repeat) this.jumpRequested = true;
      }

      if (key === 'r') {
        event.preventDefault();
        if (!event.repeat) this.restartRequested = true;
      }

      if (key === 't') {
        event.preventDefault();
        if (!event.repeat) this.menuRequested = true;
      }
    });

    window.addEventListener('keyup', (event) => {
      this.movementKeys.delete(normalizeKey(event.key));
    });

    window.addEventListener('blur', () => {
      this.movementKeys.clear();
      this.jumpRequested = false;
      this.restartRequested = false;
      this.menuRequested = false;
    });
  }

  getDirection() {
    return Number(this.movementKeys.has('d') || this.movementKeys.has('arrowright')) -
      Number(this.movementKeys.has('a') || this.movementKeys.has('arrowleft'));
  }

  isBraking() {
    return this.movementKeys.has('s') || this.movementKeys.has('arrowdown');
  }

  hasJumpRequest() {
    return this.jumpRequested;
  }

  clearJumpRequest() {
    this.jumpRequested = false;
  }

  hasRestartRequest() {
    return this.restartRequested;
  }

  clearRestartRequest() {
    this.restartRequested = false;
  }

  hasMenuRequest() {
    return this.menuRequested;
  }

  reset() {
    this.movementKeys.clear();
    this.jumpRequested = false;
    this.restartRequested = false;
    this.menuRequested = false;
  }
}
