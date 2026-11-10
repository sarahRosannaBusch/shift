import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import './style.css';
import { createPhysicsWorld } from './physics.js';
import { GameControls } from './controls.js';
import { createPlayer } from './player.js';
import { loadLevel } from './levels/levelLoader.js';

const container = document.querySelector('.scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#131313');

const starPositions = [];
const starSizes = [];
let randomSeed = 42;
const random = () => {
  randomSeed = (randomSeed * 16807) % 2147483647;
  return (randomSeed - 1) / 2147483646;
};
for (let i = 0; i < 400; i += 1) {
  starPositions.push(
    -5 + random() * 48,
    -3 + random() * 16,
    -8 + random() * 16,
  );
  starSizes.push(1 + random() * 2);
}
const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(starPositions, 3),
);
starGeometry.setAttribute(
  'starSize',
  new THREE.Float32BufferAttribute(starSizes, 1),
);
const starMaterial = new THREE.PointsMaterial({
  color: '#ffffff',
  size: 1,
  sizeAttenuation: false,
});
starMaterial.onBeforeCompile = (shader) => {
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nattribute float starSize;')
    .replace('gl_PointSize = size;', 'gl_PointSize = starSize * 2.0;');
  shader.fragmentShader = shader.fragmentShader.replace(
    'void main() {',
    'void main() {\n\tif (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;',
  );
};
const stars = new THREE.Points(
  starGeometry,
  starMaterial,
);
scene.add(stars);

scene.add(new THREE.HemisphereLight('#ffffff', '#302944', 2));
const keyLight = new THREE.DirectionalLight('#ffffff', 2.5);
keyLight.position.set(-3, 6, 4);
scene.add(keyLight);

const world = createPhysicsWorld();
let level;
let player;
let currentLevelName;
let currentLevelIndex;
let unlockedLevelIndex = 0;
const controls = new GameControls();

const sideView = new THREE.Vector3(0, 0, 6);
const angledView = new THREE.Vector3(4, 3.5, 6);
const perspectiveCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
const sideCamera = new THREE.OrthographicCamera(-2.5, 2.5, 2.5, -2.5, 0.1, 100);
const selectionCamera = new THREE.OrthographicCamera(-2.5, 2.5, 2.5, -2.5, 0.1, 100);
const transitionCamera = new THREE.Camera();
selectionCamera.position.set(0, 0, 6);
selectionCamera.lookAt(0, 0, 0);
let isAngledView = false;
let viewBlend = 0;
let transitionStart = 0;
let transitionTarget = 0;
let transitionElapsed = 0;
const transitionDuration = 2;

window.addEventListener('keydown', (event) => {
  if (event.key !== 'Shift' || event.repeat) return;
  isAngledView = !isAngledView;
});

function resize() {
  const { width, height } = container.getBoundingClientRect();
  if (!width || !height) return;

  perspectiveCamera.aspect = width / height;
  perspectiveCamera.updateProjectionMatrix();
  sideCamera.left = -2.5 * (width / height);
  sideCamera.right = 2.5 * (width / height);
  sideCamera.top = 2.5;
  sideCamera.bottom = -2.5;
  sideCamera.updateProjectionMatrix();
  selectionCamera.left = sideCamera.left;
  selectionCamera.right = sideCamera.right;
  selectionCamera.top = sideCamera.top;
  selectionCamera.bottom = sideCamera.bottom;
  selectionCamera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);
window.addEventListener('resize', resize);
resize();

const selectionGroup = new THREE.Group();
const constellationPoints = [
  new THREE.Vector3(0, 1.125, 0),
  new THREE.Vector3(-1.125, 0, 0),
  new THREE.Vector3(-0.6, 0, 0),
  new THREE.Vector3(-0.6, -1.2, 0),
  new THREE.Vector3(0.6, -1.2, 0),
  new THREE.Vector3(0.6, 0, 0),
  new THREE.Vector3(1.125, 0, 0),
];
const constellationLinePositions = [];
for (let i = 0; i < constellationPoints.length; i += 1) {
  const start = constellationPoints[i];
  const end = constellationPoints[(i + 1) % constellationPoints.length];
  constellationLinePositions.push(...start.toArray(), ...end.toArray());
}
const constellationLines = new THREE.BufferGeometry();
const linePositions = new Float32Array(constellationLinePositions);
const constellationMaterial = new THREE.LineBasicMaterial({
  color: '#806fd8',
  transparent: true,
  opacity: 0.75,
});
const lines = new THREE.LineSegments(
  constellationLines.setAttribute(
    'position',
    new THREE.BufferAttribute(linePositions, 3),
  ),
  constellationMaterial,
);
lines.geometry.setDrawRange(0, 0);
selectionGroup.add(lines);
let drawingLineIndex = -1;
let drawingLineElapsed = 0;
const drawingLineDuration = 0.6;

const levelStars = constellationPoints.map((position, index) => {
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
  selectionGroup.add(star);

  return star;
});
scene.add(selectionGroup);

const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.2;
const pointer = new THREE.Vector2();
renderer.domElement.addEventListener('pointermove', (event) => {
  if (player) {
    renderer.domElement.style.cursor = '';
    return;
  }
  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
  raycaster.setFromCamera(pointer, selectionCamera);
  renderer.domElement.style.cursor =
    raycaster.intersectObjects(levelStars)
      .some(({ object }) => object.userData.levelIndex <= unlockedLevelIndex)
      ? 'pointer'
      : '';
});
renderer.domElement.addEventListener('click', (event) => {
  if (player) return;
  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
  raycaster.setFromCamera(pointer, selectionCamera);
  const clickedStar = raycaster.intersectObjects(levelStars)
    .find(({ object }) => object.userData.levelIndex <= unlockedLevelIndex);
  if (!clickedStar) return;

  level = loadLevel(clickedStar.object.userData.levelName, { scene, world });
  currentLevelName = clickedStar.object.userData.levelName;
  currentLevelIndex = clickedStar.object.userData.levelIndex;
  player = createPlayer({ scene, world, position: level.spawn });
  scene.remove(selectionGroup);
  renderer.domElement.style.cursor = '';
});

const fixedTimeStep = 1 / 60;
const moveForce = 5;
const brakeForce = 16;
const maxSpeed = 3;
const jumpImpulse = 4.5;
const coyoteTime = 0.25;
const clock = new THREE.Clock();
let accumulator = 0;
let isGrounded = true;
let coyoteTimeRemaining = coyoteTime;

function removePlayer() {
  world.removeBody(player.body);
  scene.remove(player.mesh);
  player.mesh.traverse((object) => {
    if (object.geometry) object.geometry.dispose();
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => material.dispose());
      } else {
        object.material.dispose();
      }
    }
  });
  player = undefined;
}

function resetView() {
  isAngledView = false;
  viewBlend = 0;
  transitionStart = 0;
  transitionTarget = 0;
  transitionElapsed = 0;
  accumulator = 0;
  isGrounded = true;
  coyoteTimeRemaining = coyoteTime;
}

function returnToMenu() {
  controls.reset();
  level.dispose();
  removePlayer();
  level = undefined;
  currentLevelName = undefined;
  scene.add(selectionGroup);
  selectionCamera.position.set(0, 0, 6);
  selectionCamera.zoom = 1;
  selectionCamera.lookAt(0, 0, 0);
  selectionCamera.updateProjectionMatrix();
  resetView();
}

renderer.setAnimationLoop(() => {
  if (!player) {
    if (drawingLineIndex >= 0) {
      drawingLineElapsed = Math.min(
        drawingLineElapsed + Math.min(clock.getDelta(), 0.1),
        drawingLineDuration,
      );
      const progress = drawingLineElapsed / drawingLineDuration;
      const start = constellationPoints[drawingLineIndex];
      const end = constellationPoints[(drawingLineIndex + 1) % constellationPoints.length];
      const endpoint = start.clone().lerp(end, progress);
      const endpointOffset = drawingLineIndex * 6 + 3;
      linePositions[endpointOffset] = endpoint.x;
      linePositions[endpointOffset + 1] = endpoint.y;
      linePositions[endpointOffset + 2] = endpoint.z;
      lines.geometry.attributes.position.needsUpdate = true;
      if (progress === 1) drawingLineIndex = -1;
    }
    renderer.render(scene, selectionCamera);
    return;
  }

  const delta = Math.min(clock.getDelta(), 0.1);
  accumulator += delta;

  while (accumulator >= fixedTimeStep) {
    if (controls.hasRestartRequest()) {
      controls.reset();
      level.dispose();
      removePlayer();
      level = loadLevel(currentLevelName, { scene, world });
      player = createPlayer({ scene, world, position: level.spawn });
      resetView();
      return;
    }

    if (controls.hasMenuRequest()) {
      returnToMenu();
      return;
    }

    let jumpedThisStep = false;
    if (controls.hasJumpRequest()) {
      if (isGrounded || coyoteTimeRemaining > 0) {
        player.body.applyImpulse(
          new CANNON.Vec3(0, jumpImpulse * player.body.mass, 0),
        );
        isGrounded = false;
        coyoteTimeRemaining = 0;
        jumpedThisStep = true;
      }
      controls.clearJumpRequest();
    }

    const direction = controls.getDirection();
    if (direction !== 0) {
      player.body.applyForce(
        new CANNON.Vec3(direction * moveForce, 0, 0),
        new CANNON.Vec3(0, 0, 0),
      );
    }

    if (controls.isBraking() && Math.abs(player.body.velocity.x) > 0.01) {
      player.body.applyForce(
        new CANNON.Vec3(-Math.sign(player.body.velocity.x) * brakeForce, 0, 0),
        new CANNON.Vec3(0, 0, 0),
      );
    }
    world.step(fixedTimeStep);
    accumulator -= fixedTimeStep;
    if (level.shiftButtons.some((button) => button.action === 'complete' && button.wasPressed)) {
      if (currentLevelIndex === unlockedLevelIndex) {
        drawingLineIndex = unlockedLevelIndex;
        drawingLineElapsed = 0;
        const start = constellationPoints[drawingLineIndex];
        const endpointOffset = drawingLineIndex * 6 + 3;
        linePositions[endpointOffset] = start.x;
        linePositions[endpointOffset + 1] = start.y;
        linePositions[endpointOffset + 2] = start.z;
        lines.geometry.attributes.position.needsUpdate = true;
        if (unlockedLevelIndex < levelStars.length - 1) {
          unlockedLevelIndex += 1;
          lines.geometry.setDrawRange(0, unlockedLevelIndex * 2);
        } else {
          lines.geometry.setDrawRange(0, levelStars.length * 2);
        }
      }
      returnToMenu();
      return;
    }
    if (level.shiftButtons.some((button) => button.action === 'shift' && button.wasPressed)) {
      isAngledView = true;
    }
    player.body.velocity.x = THREE.MathUtils.clamp(
      player.body.velocity.x,
      -maxSpeed,
      maxSpeed,
    );
    isGrounded = world.contacts.some((contact) =>
      contact.bj === player.body
        ? contact.ni.y > 0.5
        : contact.bi === player.body && contact.ni.y < -0.5
    );
    if (isGrounded && !jumpedThisStep) {
      coyoteTimeRemaining = coyoteTime;
    } else if (!isGrounded) {
      coyoteTimeRemaining = Math.max(0, coyoteTimeRemaining - fixedTimeStep);
    }
  }

  player.syncVisual();
  const requestedView = Number(isAngledView);
  if (requestedView !== transitionTarget) {
    transitionStart = viewBlend;
    transitionTarget = requestedView;
    transitionElapsed = 0;
  }
  transitionElapsed = Math.min(transitionElapsed + delta, transitionDuration);
  const progress = transitionElapsed / transitionDuration;
  const easedProgress = progress * progress * (2 - progress);
  viewBlend = THREE.MathUtils.lerp(transitionStart, transitionTarget, easedProgress);
  sideCamera.position.copy(sideView).add(player.mesh.position);
  sideCamera.lookAt(player.mesh.position);
  perspectiveCamera.position.copy(angledView).add(player.mesh.position);
  perspectiveCamera.lookAt(player.mesh.position);

  transitionCamera.position.lerpVectors(
    sideCamera.position,
    perspectiveCamera.position,
    viewBlend,
  );
  transitionCamera.quaternion.slerpQuaternions(
    sideCamera.quaternion,
    perspectiveCamera.quaternion,
    viewBlend,
  );
  transitionCamera.updateMatrixWorld();
  for (let i = 0; i < 16; i += 1) {
    transitionCamera.projectionMatrix.elements[i] =
      THREE.MathUtils.lerp(
        sideCamera.projectionMatrix.elements[i],
        perspectiveCamera.projectionMatrix.elements[i],
        viewBlend,
      );
  }
  transitionCamera.projectionMatrixInverse
    .copy(transitionCamera.projectionMatrix)
    .invert();
  renderer.render(scene, transitionCamera);
});
