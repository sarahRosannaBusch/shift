import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createPlayer } from './player.js';
import { loadLevel } from '../levels/levelLoader.js';

const FIXED_TIME_STEP = 1 / 60;
const MOVE_FORCE = 5;
const BRAKE_FORCE = 16;
const MAX_SPEED = 3;
const JUMP_IMPULSE = 4.5;
const COYOTE_TIME = 0.25;

export class GameSession {
  constructor({
    scene,
    world,
    controls,
    onLevelComplete,
    onReturnToMenu,
    onViewReset,
    onShiftView,
  }) {
    this.scene = scene;
    this.world = world;
    this.controls = controls;
    this.onLevelComplete = onLevelComplete;
    this.onReturnToMenu = onReturnToMenu;
    this.onViewReset = onViewReset;
    this.onShiftView = onShiftView;
    this.level = undefined;
    this.player = undefined;
    this.isReturning = false;
    this.currentLevelName = undefined;
    this.currentLevelIndex = undefined;
    this.currentLevelOffset = undefined;
    this.resetSimulation();
  }

  get isActive() {
    return Boolean(this.player);
  }

  startLevel(
    levelName,
    levelIndex,
    levelOffset = new THREE.Vector3(),
    selectedLevel,
  ) {
    this.currentLevelName = levelName;
    this.currentLevelIndex = levelIndex;
    this.currentLevelOffset = levelOffset.clone();
    this.level = selectedLevel;
    this.scene.attach(this.level.group);
    this.level.createPhysics(this.world, this.scene);
    this.player = createPlayer({
      scene: this.scene,
      world: this.world,
      position: this.level.spawn,
    });
  }

  update(delta) {
    if (!this.player) return false;
    const frameDelta = Math.min(delta, 0.1);
    this.accumulator += frameDelta;

    while (this.accumulator >= FIXED_TIME_STEP) {
      if (this.isReturning) {
        this.world.step(FIXED_TIME_STEP);
        this.accumulator -= FIXED_TIME_STEP;
        continue;
      }
      if (this.handleRestartRequest()) return false;
      if (this.handleMenuRequest()) return false;

      const jumpedThisStep = this.handleJumpRequest();
      this.applyMovementForces();
      this.world.step(FIXED_TIME_STEP);
      this.accumulator -= FIXED_TIME_STEP;
      if (this.handleLevelCompletion()) return false;
      if (this.level.shiftButtons.some(
        (button) => button.action === 'shift' && button.wasPressed,
      )) {
        this.onShiftView();
      }
      this.updateGroundedState(jumpedThisStep);
    }

    return true;
  }

  handleRestartRequest() {
    if (!this.controls.hasRestartRequest()) return false;

    this.controls.reset();
    this.level.dispose();
    this.removePlayer();
    this.level = loadLevel(this.currentLevelName, {
      scene: this.scene,
      world: this.world,
      offset: this.currentLevelOffset,
    });
    this.player = createPlayer({
      scene: this.scene,
      world: this.world,
      position: this.level.spawn,
    });
    this.resetSimulation();
    this.onViewReset();
    return true;
  }

  handleMenuRequest() {
    if (!this.controls.hasMenuRequest()) return false;

    this.beginReturnToMenu();
    return true;
  }

  handleJumpRequest() {
    if (!this.controls.hasJumpRequest()) return false;

    let jumpedThisStep = false;
    if (this.isGrounded || this.coyoteTimeRemaining > 0) {
      this.player.body.applyImpulse(
        new CANNON.Vec3(0, JUMP_IMPULSE * this.player.body.mass, 0),
      );
      this.isGrounded = false;
      this.coyoteTimeRemaining = 0;
      jumpedThisStep = true;
    }
    this.controls.clearJumpRequest();
    return jumpedThisStep;
  }

  applyMovementForces() {
    const direction = this.controls.getDirection();
    if (direction !== 0) {
      this.player.body.applyForce(
        new CANNON.Vec3(direction * MOVE_FORCE, 0, 0),
        new CANNON.Vec3(0, 0, 0),
      );
    }

    if (
      this.controls.isBraking() &&
      Math.abs(this.player.body.velocity.x) > 0.01
    ) {
      this.player.body.applyForce(
        new CANNON.Vec3(
          -Math.sign(this.player.body.velocity.x) * BRAKE_FORCE,
          0,
          0,
        ),
        new CANNON.Vec3(0, 0, 0),
      );
    }
  }

  handleLevelCompletion() {
    const completed = this.level.shiftButtons.some(
      (button) => button.action === 'complete' && button.wasPressed,
    );
    if (!completed) return false;

    this.onLevelComplete(this.currentLevelIndex);
    this.beginReturnToMenu();
    return true;
  }

  updateGroundedState(jumpedThisStep) {
    this.player.body.velocity.x = THREE.MathUtils.clamp(
      this.player.body.velocity.x,
      -MAX_SPEED,
      MAX_SPEED,
    );
    this.isGrounded = this.world.contacts.some((contact) =>
      contact.bj === this.player.body
        ? contact.ni.y > 0.5
        : contact.bi === this.player.body && contact.ni.y < -0.5
    );
    if (this.isGrounded && !jumpedThisStep) {
      this.coyoteTimeRemaining = COYOTE_TIME;
    } else if (!this.isGrounded) {
      this.coyoteTimeRemaining = Math.max(
        0,
        this.coyoteTimeRemaining - FIXED_TIME_STEP,
      );
    }
  }

  beginReturnToMenu() {
    if (this.isReturning) return;
    this.controls.reset();
    this.isReturning = true;
  }

  finishReturnToMenu() {
    if (!this.isReturning) return;

    this.level.dispose();
    this.removePlayer();
    this.level = undefined;
    this.currentLevelName = undefined;
    this.currentLevelOffset = undefined;
    this.isReturning = false;
    this.resetSimulation();
    this.onViewReset();
    this.onReturnToMenu();
  }

  resetSimulation() {
    this.accumulator = 0;
    this.isGrounded = true;
    this.coyoteTimeRemaining = COYOTE_TIME;
  }

  removePlayer() {
    this.world.removeBody(this.player.body);
    this.player.mesh.removeFromParent();
    this.player.mesh.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    this.player = undefined;
  }
}
