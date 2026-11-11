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

export class LevelSelection {
  constructor({ scene, camera, domElement, onSelect }) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.onSelect = onSelect;
    this.unlockedLevelIndex = 0;
    this.drawingLineIndex = -1;
    this.drawingLineElapsed = 0;
    this.isVisible = true;

    this.group = new THREE.Group();
    this.linePositions = this.createConstellationLines();
    this.levelStars = this.createLevelStars();
    this.raycaster = new THREE.Raycaster();
    this.raycaster.params.Points.threshold = 0.2;
    this.pointer = new THREE.Vector2();

    this.handlePointerMove = (event) => this.updateCursor(event);
    this.handleClick = (event) => this.selectLevel(event);
    this.domElement.addEventListener('pointermove', this.handlePointerMove);
    this.domElement.addEventListener('click', this.handleClick);
    this.scene.add(this.group);
  }

  get isAnimatingUnlock() {
    return this.drawingLineIndex >= 0;
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
      this.domElement.style.cursor = '';
      return;
    }
    this.updatePointer(event);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    this.domElement.style.cursor =
      this.raycaster.intersectObjects(this.levelStars)
        .some(({ object }) => object.userData.levelIndex <= this.unlockedLevelIndex)
        ? 'pointer'
        : '';
  }

  selectLevel(event) {
    if (!this.isVisible) return;

    this.updatePointer(event);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const clickedStar = this.raycaster.intersectObjects(this.levelStars)
      .find(({ object }) => object.userData.levelIndex <= this.unlockedLevelIndex);
    if (!clickedStar) return;

    this.onSelect({
      levelName: clickedStar.object.userData.levelName,
      levelIndex: clickedStar.object.userData.levelIndex,
    });
    this.hide();
  }

  updatePointer(event) {
    const bounds = this.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    this.pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
  }

  update(delta) {
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
      this.lines.geometry.setDrawRange(0, this.unlockedLevelIndex * 2);
    } else {
      this.lines.geometry.setDrawRange(0, this.levelStars.length * 2);
    }
  }

  hide() {
    this.isVisible = false;
    this.scene.remove(this.group);
    this.domElement.style.cursor = '';
  }

  show() {
    this.isVisible = true;
    this.scene.add(this.group);
  }

  dispose() {
    this.domElement.removeEventListener('pointermove', this.handlePointerMove);
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
