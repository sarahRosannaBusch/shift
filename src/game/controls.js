function normalizeKey(key) {
  return key.toLowerCase();
}

export class GameControls {
  constructor({ isDev = false } = {}) {
    this.isDev = isDev;
    this.movementKeys = new Set();
    this.jumpRequested = false;
    this.restartRequested = false;
    this.menuRequested = false;
    this.devViewToggleRequested = false;
    this.enterRequested = false;

    window.addEventListener('keydown', (event) => this.handleKeyDown(event));
    window.addEventListener('keyup', (event) => this.handleKeyUp(event));
    window.addEventListener('blur', () => this.reset());
  }

  handleKeyDown(event) {
    const key = normalizeKey(event.key);

    switch (key) {
      case 'a':
      case 'd':
      case 'arrowleft':
      case 'arrowright':
      case 's':
      case 'arrowdown':
        event.preventDefault();
        this.movementKeys.add(key);
        break;
      case 'w':
      case ' ':
      case 'arrowup':
        event.preventDefault();
        if (!event.repeat) this.jumpRequested = true;
        break;
      case 'r':
        event.preventDefault();
        if (!event.repeat) this.restartRequested = true;
        break;
      case 't':
        event.preventDefault();
        if (!event.repeat) this.menuRequested = true;
        break;
      case 'enter':
        event.preventDefault();
        if (!event.repeat) this.enterRequested = true;
        break;
      case 'shift':
        if (this.isDev && !event.repeat) {
          this.devViewToggleRequested = true;
        }
        break;
      default:
        break;
    }
  }

  handleKeyUp(event) {
    this.movementKeys.delete(normalizeKey(event.key));
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

  hasEnterRequest() {
    return this.enterRequested;
  }

  clearEnterRequest() {
    this.enterRequested = false;
  }

  hasDevViewToggleRequest() {
    return this.devViewToggleRequested;
  }

  clearDevViewToggleRequest() {
    this.devViewToggleRequested = false;
  }

  reset() {
    this.movementKeys.clear();
    this.jumpRequested = false;
    this.restartRequested = false;
    this.menuRequested = false;
    this.devViewToggleRequested = false;
    this.enterRequested = false;
  }
}
