import * as THREE from 'three';
import { createLevel } from '../levels/levelLoader.js';

const CONSTELLATION_POINTS = [
  new THREE.Vector3(0, 1.125, 0),
  new THREE.Vector3(-1.125, 0, 0),
  new THREE.Vector3(-0.6, 0, 0),
  new THREE.Vector3(-0.6, -1.2, 0),
  new THREE.Vector3(0.6, -1.2, 0),
  new THREE.Vector3(0.6, 0, 0),
  new THREE.Vector3(1.125, 0, 0),
];
const LINE_DRAW_DURATION = 0.6;
const SELECTION_GLOW_PERIOD = 1.8;
const LEVEL_SELECTOR_DEPTH = 0.1;
const LEVEL_SELECTOR_SIZE = 5;
const LEVEL_APPROACH_DURATION = 2.35;
const PLAYER_FOCUS_DURATION = 1.8;
const LEVEL_SELECTOR_BOUNDS = new THREE.Vector3(40, 40.25, 2.75);

export class LevelSelection {
  constructor({ scene, camera, domElement, onSelect, onReturnComplete }) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.onSelect = onSelect;
    this.onReturnComplete = onReturnComplete;
    this.unlockedLevelIndex = 0;
    this.selectedLevelIndex = 0;
    this.hoveredLevelIndex = undefined;
    this.drawingLineIndex = -1;
    this.drawingLineElapsed = 0;
    this.glowElapsed = 0;
    this.isGlowActive = true;
    this.isVisible = true;

    this.group = new THREE.Group();
    this.linePositions = this.createConstellationLines();
    this.selectionGlow = this.createSelectionGlow();
    this.levelStars = this.createLevelStars();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.handlePointerMove = (event) => this.updateCursor(event);
    this.handlePointerLeave = () => this.clearHover();
    this.handleClick = (event) => this.selectLevel(event);
    this.domElement.addEventListener('pointermove', this.handlePointerMove);
    this.domElement.addEventListener('pointerleave', this.handlePointerLeave);
    this.domElement.addEventListener('click', this.handleClick);
    this.scene.add(this.group);
  }

  get isTransitioning() {
    return Boolean(this.levelTransition);
  }

  createConstellationLines() {
    const positions = [];
    for (let i = 0; i < CONSTELLATION_POINTS.length; i += 1) {
      const start = CONSTELLATION_POINTS[i];
      const end = CONSTELLATION_POINTS[(i + 1) % CONSTELLATION_POINTS.length];
      positions.push(...start.toArray(), ...end.toArray());
    }

    const geometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(positions);
    const material = new THREE.LineBasicMaterial({
      color: '#806fd8',
      transparent: true,
      opacity: 0.75,
    });
    const lines = new THREE.LineSegments(
      geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(linePositions, 3),
      ),
      material,
    );
    lines.geometry.setDrawRange(0, 0);
    this.group.add(lines);
    this.lines = lines;
    return linePositions;
  }

  createSelectionGlow() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([0, 0, 0], 3),
    );
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color('#806fd8') },
        opacity: { value: 0.4 },
        pointSize: { value: 32 },
      },
      vertexShader: `
        uniform float pointSize;
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = pointSize;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float opacity;
        void main() {
          float distanceToCenter = length(gl_PointCoord - vec2(0.5));
          float falloff = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
          gl_FragColor = vec4(color, falloff * opacity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Points(geometry, material);
    this.moveGlowToSelectedLevel(glow);
    this.group.add(glow);
    return glow;
  }

  createSelectedLevel(index) {
    const level = createLevel(`level_${index}`, this.group);
    const levelGroup = level.group;
    const completeButton = level.shiftButtons.find(
      (button) => button.action === 'complete',
    );
    if (!completeButton) {
      level.dispose();
      throw new Error(`Level ${index} has no complete button`);
    }
    const position = CONSTELLATION_POINTS[index];
    levelGroup.updateWorldMatrix(true, true);

    const bounds = new THREE.Box3().setFromObject(levelGroup);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const viewHeight = (this.camera.top - this.camera.bottom) / this.camera.zoom;
    const canvasHeight = this.domElement.height || this.domElement.clientHeight;
    const scale =
      (LEVEL_SELECTOR_SIZE * viewHeight) /
      (canvasHeight * Math.max(size.x, size.y));
    levelGroup.userData.levelName = `level_${index}`;
    levelGroup.userData.levelIndex = index;
    levelGroup.userData.selectorCenter = position.clone();
    levelGroup.userData.selectorCenter.z += LEVEL_SELECTOR_DEPTH;
    levelGroup.userData.levelOffset = levelGroup.userData.selectorCenter
      .clone()
      .sub(center);
    levelGroup.userData.spawnLocal = level.spawnLocal.clone();
    levelGroup.userData.selectorScale = scale;
    levelGroup.scale.setScalar(scale);
    levelGroup.position.set(
      position.x - center.x * scale,
      position.y - center.y * scale,
      position.z + LEVEL_SELECTOR_DEPTH - center.z * scale,
    );
    return { level, levelGroup, completeButton };
  }

  createLevelStars() {
    const viewHeight = (this.camera.top - this.camera.bottom) / this.camera.zoom;
    const canvasHeight = this.domElement.height || this.domElement.clientHeight;
    const selectorScale =
      (LEVEL_SELECTOR_SIZE * viewHeight) /
      (canvasHeight * Math.max(LEVEL_SELECTOR_BOUNDS.x, LEVEL_SELECTOR_BOUNDS.y));
    const levelRadius = LEVEL_SELECTOR_BOUNDS.length() / 2;
    return CONSTELLATION_POINTS.map((position, index) => {
      const geometry = new THREE.SphereGeometry(
        levelRadius * selectorScale * 1.5,
        24,
        16,
      );
      const material = new THREE.MeshBasicMaterial({
        color: '#ffffff',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1,
        depthWrite: false,
      });
      const star = new THREE.Mesh(geometry, material);
      star.position.copy(position);
      star.position.z += LEVEL_SELECTOR_DEPTH;
      star.userData.levelName = `level_${index}`;
      star.userData.levelIndex = index;
      this.group.add(star);
      return star;
    });
  }

  updateCursor(event) {
    if (!this.isVisible) {
      this.clearHover();
      return;
    }
    this.updatePointer(event);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hoveredStar = this.raycaster.intersectObjects(this.levelStars)
      .find(({ object }) => object.userData.levelIndex <= this.unlockedLevelIndex);
    const hoveredLevelIndex = hoveredStar?.object.userData.levelIndex;
    if (hoveredLevelIndex !== this.hoveredLevelIndex) {
      this.hoveredLevelIndex = hoveredLevelIndex;
      this.moveGlowToSelectedLevel();
    }
    this.domElement.style.cursor = hoveredStar ? 'pointer' : '';
  }

  selectLevel(event) {
    if (!this.isVisible) return;

    this.updatePointer(event);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const clickedStar = this.raycaster.intersectObjects(this.levelStars)
      .find(({ object }) => object.userData.levelIndex <= this.unlockedLevelIndex);
    if (!clickedStar) return;

    this.enterLevel(clickedStar.object.userData.levelIndex);
  }

  enterSelectedLevel() {
    if (!this.isVisible) return false;
    return this.enterLevel(
      this.hoveredLevelIndex ?? this.selectedLevelIndex,
    );
  }

  enterLevel(levelIndex) {
    const selectedStar = this.levelStars[levelIndex];
    if (!this.isVisible || !selectedStar || levelIndex > this.unlockedLevelIndex) {
      return false;
    }
    this.beginLevelTransition(levelIndex);
    return true;
  }

  beginLevelTransition(levelIndex) {
    const { level, levelGroup, completeButton } =
      this.createSelectedLevel(levelIndex);
    this.isVisible = false;
    this.selectedLevelIndex = levelIndex;
    this.selectionGlow.visible = false;
    this.clearHover();
    this.levelTransition = {
      direction: 'in',
      elapsed: 0,
      levelIndex,
      selectedLevel: level,
      levelGroup,
      completeButton,
      startCameraPosition: this.camera.position.clone(),
      playerPosition: levelGroup.userData.spawnLocal.clone()
        .add(levelGroup.userData.levelOffset),
      levelStarted: false,
    };
  }

  beginReturnTransition(player, selectedLevel, gameCamera) {
    const playerPosition = player.mesh.getWorldPosition(new THREE.Vector3());
    this.camera.position.copy(gameCamera.position);
    this.camera.quaternion.copy(gameCamera.quaternion);
    this.camera.updateMatrixWorld();

    const levelGroup = selectedLevel.group;
    this.group.attach(levelGroup);
    selectedLevel.shiftButtons.forEach((button) => {
      levelGroup.attach(button.plungerMesh);
    });
    this.group.attach(player.mesh);

    this.levelTransition = {
      direction: 'out',
      elapsed: 0,
      selectorCenter: this.activeLevelSelectorCenter,
      startGroupScale: this.group.scale.x,
      playerMesh: player.mesh,
      cameraOffset: this.camera.position.clone().sub(playerPosition),
      endCameraPosition: this.activeLevelStartCameraPosition.clone(),
      endCameraTarget: this.activeLevelStartCameraPosition.clone()
        .add(new THREE.Vector3(0, 0, -6)),
    };
    this.isVisible = false;
  }

  clearHover() {
    if (this.hoveredLevelIndex !== undefined) {
      this.hoveredLevelIndex = undefined;
      this.moveGlowToSelectedLevel();
    }
    this.domElement.style.cursor = '';
  }

  updatePointer(event) {
    const bounds = this.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    this.pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
  }

  update(delta) {
    if (this.levelTransition) {
      this.updateLevelTransition(delta);
      return;
    }

    this.updateGlowPulse(delta);
    if (this.drawingLineIndex < 0) return;

    this.drawingLineElapsed = Math.min(
      this.drawingLineElapsed + Math.min(delta, 0.1),
      LINE_DRAW_DURATION,
    );
    const progress = this.drawingLineElapsed / LINE_DRAW_DURATION;
    const start = CONSTELLATION_POINTS[this.drawingLineIndex];
    const end = CONSTELLATION_POINTS[
      (this.drawingLineIndex + 1) % CONSTELLATION_POINTS.length
    ];
    const endpoint = start.clone().lerp(end, progress);
    const endpointOffset = this.drawingLineIndex * 6 + 3;
    this.linePositions[endpointOffset] = endpoint.x;
    this.linePositions[endpointOffset + 1] = endpoint.y;
    this.linePositions[endpointOffset + 2] = endpoint.z;
    this.lines.geometry.attributes.position.needsUpdate = true;
    if (progress === 1) this.drawingLineIndex = -1;
  }

  updateLevelTransition(delta) {
    const transition = this.levelTransition;
    if (transition.direction === 'out') {
      this.updateReturnTransition(delta);
      return;
    }

    const totalDuration = LEVEL_APPROACH_DURATION + PLAYER_FOCUS_DURATION;
    transition.elapsed = Math.min(
      transition.elapsed + Math.min(delta, 0.1),
      totalDuration,
    );
    const fadeProgress = THREE.MathUtils.clamp(
      transition.elapsed / (LEVEL_APPROACH_DURATION * 0.55),
      0,
      1,
    );
    const starOpacity = 0.01 + 0.99 * (1 - fadeProgress) ** 3;
    this.levelStars.forEach((star) => {
      star.material.opacity = starOpacity;
    });

    const selectorCenter = transition.levelGroup.userData.selectorCenter;
    const finalGroupScale = 1 / transition.levelGroup.userData.selectorScale;
    const approachProgress = Math.min(
      transition.elapsed / LEVEL_APPROACH_DURATION,
      1,
    );
    const easedApproachProgress = approachProgress * approachProgress *
      (3 - 2 * approachProgress);
    const groupScale = Math.exp(
      Math.log(finalGroupScale) * easedApproachProgress,
    );
    this.group.scale.setScalar(groupScale);
    this.group.position.copy(selectorCenter).multiplyScalar(1 - groupScale);

    this.group.updateWorldMatrix(true, true);
    const completeButtonPosition =
      transition.completeButton.plungerMesh.getWorldPosition(new THREE.Vector3());
    const buttonCameraPosition = completeButtonPosition.clone();
    buttonCameraPosition.z = transition.startCameraPosition.z;
    const playerCameraPosition = transition.playerPosition.clone().add(
      new THREE.Vector3(
        0,
        0,
        buttonCameraPosition.z - transition.playerPosition.z,
      ),
    );

    if (approachProgress < 1) {
      this.camera.position.lerpVectors(
        transition.startCameraPosition,
        buttonCameraPosition,
        easedApproachProgress,
      );
      this.camera.lookAt(
        this.camera.position.x,
        this.camera.position.y,
        this.camera.position.z - 6,
      );
    } else {
      const focusProgress = THREE.MathUtils.clamp(
        (transition.elapsed - LEVEL_APPROACH_DURATION) /
          PLAYER_FOCUS_DURATION,
        0,
        1,
      );
      const easedFocusProgress = focusProgress * focusProgress *
        (3 - 2 * focusProgress);
      this.camera.position.lerpVectors(
        buttonCameraPosition,
        playerCameraPosition,
        easedFocusProgress,
      );
      const focusTarget = completeButtonPosition.clone()
        .lerp(transition.playerPosition, easedFocusProgress);
      this.camera.lookAt(focusTarget);
    }

    if (
      transition.elapsed >= LEVEL_APPROACH_DURATION &&
      !transition.levelStarted
    ) {
      transition.levelStarted = true;
      this.activeLevelSelectorCenter =
        transition.levelGroup.userData.selectorCenter.clone();
      this.activeLevelStartCameraPosition =
        transition.startCameraPosition.clone();
      this.lines.visible = false;
      this.selectionGlow.visible = false;
      this.onSelect({
        levelName: transition.levelGroup.userData.levelName,
        levelIndex: transition.levelIndex,
        levelOffset: transition.levelGroup.userData.levelOffset.clone(),
        selectedLevel: transition.selectedLevel,
      });
    }

    if (transition.elapsed < totalDuration) return;

    this.levelTransition = undefined;
  }

  updateReturnTransition(delta) {
    const transition = this.levelTransition;
    const cameraStartTime = LEVEL_APPROACH_DURATION * 0.5;
    const totalDuration = Math.max(
      LEVEL_APPROACH_DURATION,
      cameraStartTime + PLAYER_FOCUS_DURATION,
    );
    transition.elapsed = Math.min(
      transition.elapsed + Math.min(delta, 0.1),
      totalDuration,
    );
    const shrinkProgress = Math.min(
      transition.elapsed / LEVEL_APPROACH_DURATION,
      1,
    );
    const easedShrinkProgress = shrinkProgress * shrinkProgress *
      (3 - 2 * shrinkProgress);
    const groupScale = Math.exp(
      Math.log(transition.startGroupScale) * (1 - easedShrinkProgress),
    );
    this.group.scale.setScalar(groupScale);
    this.group.position.copy(transition.selectorCenter)
      .multiplyScalar(1 - groupScale);

    const fadeProgress = 1 - THREE.MathUtils.clamp(
      (1 - shrinkProgress) / 0.55,
      0,
      1,
    );
    const starOpacity = 0.01 + 0.99 * fadeProgress ** 3;
    this.levelStars.forEach((star) => {
      star.material.opacity = starOpacity;
    });

    const playerPosition = transition.playerMesh.getWorldPosition(
      new THREE.Vector3(),
    );
    if (
      transition.elapsed >= cameraStartTime &&
      !transition.centerCameraStartPosition
    ) {
      transition.centerCameraStartPosition = playerPosition.clone()
        .add(transition.cameraOffset);
      transition.centerCameraStartTarget = playerPosition.clone();
    }

    const cameraProgress = THREE.MathUtils.clamp(
      (transition.elapsed - cameraStartTime) / PLAYER_FOCUS_DURATION,
      0,
      1,
    );
    const easedCameraProgress = cameraProgress * cameraProgress *
      (3 - 2 * cameraProgress);
    const cameraStartPosition = transition.centerCameraStartPosition ??
      playerPosition.clone().add(transition.cameraOffset);
    const cameraStartTarget = transition.centerCameraStartTarget ??
      playerPosition;
    this.camera.position.lerpVectors(
      cameraStartPosition,
      transition.endCameraPosition,
      easedCameraProgress,
    );
    this.camera.lookAt(
      cameraStartTarget.clone().lerp(
        transition.endCameraTarget,
        easedCameraProgress,
      ),
    );

    if (transition.elapsed < totalDuration) {
      return;
    }

    this.onReturnComplete();
    this.levelTransition = undefined;
  }

  updateGlowPulse(delta) {
    if (!this.isGlowActive) return;

    this.glowElapsed = (this.glowElapsed + delta) % SELECTION_GLOW_PERIOD;
    const phase = this.glowElapsed / SELECTION_GLOW_PERIOD * Math.PI * 2;
    const pulse = (Math.sin(phase) + 1) / 2;
    this.selectionGlow.material.uniforms.opacity.value = 0.2 + pulse * 0.4;
    this.selectionGlow.material.uniforms.pointSize.value = 64 + pulse * 32;
  }

  moveGlowToSelectedLevel(glow = this.selectionGlow) {
    const levelIndex = this.hoveredLevelIndex ?? this.selectedLevelIndex;
    const position = CONSTELLATION_POINTS[levelIndex];
    glow.position.copy(position);
    glow.position.z -= 0.01;
  }

  completeLevel(levelIndex) {
    if (levelIndex !== this.unlockedLevelIndex) return;

    this.drawingLineIndex = this.unlockedLevelIndex;
    this.drawingLineElapsed = 0;
    const start = CONSTELLATION_POINTS[this.drawingLineIndex];
    const endpointOffset = this.drawingLineIndex * 6 + 3;
    this.linePositions[endpointOffset] = start.x;
    this.linePositions[endpointOffset + 1] = start.y;
    this.linePositions[endpointOffset + 2] = start.z;
    this.lines.geometry.attributes.position.needsUpdate = true;
    if (this.unlockedLevelIndex < this.levelStars.length - 1) {
      this.unlockedLevelIndex += 1;
      this.selectedLevelIndex = this.unlockedLevelIndex;
      this.moveGlowToSelectedLevel();
      this.lines.geometry.setDrawRange(0, this.unlockedLevelIndex * 2);
    } else {
      this.isGlowActive = false;
      this.selectionGlow.visible = false;
      this.lines.geometry.setDrawRange(0, this.levelStars.length * 2);
    }
  }

  hide() {
    this.isVisible = false;
    this.clearHover();
    this.scene.remove(this.group);
  }

  show() {
    this.clearHover();
    this.activeLevelSelectorCenter = undefined;
    this.activeLevelStartCameraPosition = undefined;
    this.group.position.set(0, 0, 0);
    this.group.scale.setScalar(1);
    this.levelStars.forEach((star) => {
      star.visible = true;
      star.material.opacity = 1;
    });
    this.lines.visible = true;
    this.selectionGlow.visible = this.isGlowActive;
    this.isVisible = true;
    this.scene.add(this.group);
  }

  dispose() {
    this.domElement.removeEventListener('pointermove', this.handlePointerMove);
    this.domElement.removeEventListener('pointerleave', this.handlePointerLeave);
    this.domElement.removeEventListener('click', this.handleClick);
    this.group.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    this.scene.remove(this.group);
  }
}
