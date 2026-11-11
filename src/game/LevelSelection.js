import * as THREE from 'three';

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

export class LevelSelection {
  constructor({ scene, camera, domElement, onSelect }) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.onSelect = onSelect;
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
    this.raycaster.params.Points.threshold = 0.2;
    this.pointer = new THREE.Vector2();

    this.handlePointerMove = (event) => this.updateCursor(event);
    this.handlePointerLeave = () => this.clearHover();
    this.handleClick = (event) => this.selectLevel(event);
    this.domElement.addEventListener('pointermove', this.handlePointerMove);
    this.domElement.addEventListener('pointerleave', this.handlePointerLeave);
    this.domElement.addEventListener('click', this.handleClick);
    this.scene.add(this.group);
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

  createLevelStars() {
    return CONSTELLATION_POINTS.map((position, index) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(position.toArray(), 3),
      );
      const material = new THREE.PointsMaterial({
        color: '#ffffff',
        size: 5,
        sizeAttenuation: false,
      });
      material.onBeforeCompile = (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
          'void main() {',
          'void main() {\n\tif (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;',
        );
      };
      const star = new THREE.Points(geometry, material);
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
    this.onSelect({
      levelName: selectedStar.userData.levelName,
      levelIndex,
    });
    this.hide();
    return true;
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
