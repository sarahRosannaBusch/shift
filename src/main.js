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
    -30 + random() * 70,
    -18 + random() * 36,
    -8 - random() * 4,
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
const level = loadLevel('level_0', { scene, world });
const player = createPlayer({ scene, world, position: level.spawn });
const controls = new GameControls();

const sideView = new THREE.Vector3(0, 0, 6);
const angledView = new THREE.Vector3(4, 3.5, 6);
const perspectiveCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
const sideCamera = new THREE.OrthographicCamera(-2.5, 2.5, 2.5, -2.5, 0.1, 100);
let isAngledView = false;

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
  renderer.setSize(width, height);
}

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);
window.addEventListener('resize', resize);
resize();

const fixedTimeStep = 1 / 60;
const moveForce = 5;
const brakeForce = 16;
const jumpImpulse = 4.5;
const clock = new THREE.Clock();
let accumulator = 0;
let isGrounded = true;

renderer.setAnimationLoop(() => {
  const delta = Math.min(clock.getDelta(), 0.1);
  accumulator += delta;

  while (accumulator >= fixedTimeStep) {
    if (controls.hasRestartRequest()) {
      player.reset();
      controls.reset();
      isGrounded = true;
      isAngledView = false;
    }

    if (controls.hasJumpRequest() && isGrounded) {
      player.body.applyImpulse(
        new CANNON.Vec3(0, jumpImpulse * player.body.mass, 0),
      );
      isGrounded = false;
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
    isGrounded = world.contacts.some((contact) =>
      (contact.bi === player.body || contact.bj === player.body) &&
      Math.abs(contact.ni.y) > 0.5
    );
  }

  player.syncVisual();
  const camera = isAngledView ? perspectiveCamera : sideCamera;
  camera.position.copy(isAngledView ? angledView : sideView).add(player.mesh.position);
  camera.lookAt(player.mesh.position);
  renderer.render(scene, camera);
});
