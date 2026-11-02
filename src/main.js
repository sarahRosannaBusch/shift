import * as THREE from 'three';
import './style.css';

const container = document.querySelector('.scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#10131a');

const sideView = new THREE.Vector3(0, 0, 6);
const angledView = new THREE.Vector3(4, 3.5, 6);
const perspectiveCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
const sideCamera = new THREE.OrthographicCamera(-2.5, 2.5, 2.5, -2.5, 0.1, 100);
let isAngledView = false;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

scene.add(
  new THREE.HemisphereLight('#ffffff', '#302944', 2),
);

const keyLight = new THREE.DirectionalLight('#ffffff', 2.5);
keyLight.position.set(-3, 6, 4);
scene.add(keyLight);

const platformWidth = 4.5;
const platformThickness = 0.25;
const platformTop = platformThickness / 2;
const platformDefinitions = [
  { x: 0, top: platformTop, width: platformWidth },
  { x: 4.2, top: 0.95, width: 2.5 },
  { x: 10.8, top: 2.55, width: 2.5 },
];
const platforms = platformDefinitions.map(({ x, top, width }) => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, platformThickness, 2.5),
    new THREE.MeshStandardMaterial({
      color: '#8b7bff',
      roughness: 0.55,
    }),
  );
  mesh.position.set(x, top - platformThickness / 2, 0);
  scene.add(mesh);

  return {
    left: x - width / 2,
    right: x + width / 2,
    surfaceYAt: () => top,
  };
});

const rampStart = {
  x: platformDefinitions[1].x + platformDefinitions[1].width / 2,
  y: platformDefinitions[1].top,
};
const rampEnd = {
  x: platformDefinitions[2].x - platformDefinitions[2].width / 2,
  y: platformDefinitions[2].top,
};
const rampLength = Math.hypot(rampEnd.x - rampStart.x, rampEnd.y - rampStart.y);
const rampAngle = Math.atan2(rampEnd.y - rampStart.y, rampEnd.x - rampStart.x);
const ramp = new THREE.Mesh(
  new THREE.BoxGeometry(rampLength, platformThickness, 2.5),
  new THREE.MeshStandardMaterial({
    color: '#8b7bff',
    roughness: 0.55,
  }),
);
ramp.rotation.z = rampAngle;
ramp.position.set(
  (rampStart.x + rampEnd.x) / 2 + Math.sin(rampAngle) * platformThickness / 2,
  (rampStart.y + rampEnd.y) / 2 - Math.cos(rampAngle) * platformThickness / 2,
  0,
);
scene.add(ramp);

const rampSurface = {
  left: rampStart.x,
  right: rampEnd.x,
  surfaceYAt: (x) =>
    rampStart.y + (x - rampStart.x) / (rampEnd.x - rampStart.x) * (rampEnd.y - rampStart.y),
};
const surfaces = [...platforms, rampSurface];

const cylinderRadius = 0.45;
const cylinder = new THREE.Group();
const cylinderMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, 0.7, 32),
  new THREE.MeshStandardMaterial({
    color: '#ffb454',
    roughness: 0.35,
  }),
);
cylinder.add(cylinderMesh);
cylinder.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
cylinder.position.set(0, platformTop + cylinderRadius, 0);
scene.add(cylinder);

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
  renderer.render(scene, isAngledView ? perspectiveCamera : sideCamera);
}

window.addEventListener('resize', resize);
resize();

window.addEventListener('keydown', (event) => {
  if (event.key !== 'Shift' || event.repeat) return;

  isAngledView = !isAngledView;
});

const clock = new THREE.Clock();
const movementKeys = new Set();
const rollAxis = new THREE.Vector3(0, 1, 0);
const rollRotation = new THREE.Quaternion();
const cylinderFacing = cylinder.quaternion.clone();
let rollAngle = 0;
const gravity = 9.8;
const jumpSpeed = 5.5;
let verticalVelocity = 0;
let isOnPlatform = true;
let currentPlatform = platforms[0];

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (key === 'a' || key === 'd' || key === 'arrowleft' || key === 'arrowright') {
    event.preventDefault();
    movementKeys.add(key);
  }

  if (key === 'w' || key === ' ' || key === 'arrowup') {
    event.preventDefault();
    if (!event.repeat && isOnPlatform) {
      isOnPlatform = false;
      verticalVelocity = jumpSpeed;
    }
  }
});

window.addEventListener('keyup', (event) => {
  movementKeys.delete(event.key.toLowerCase());
});

window.addEventListener('blur', () => movementKeys.clear());

renderer.setAnimationLoop(() => {
  const delta = clock.getDelta();
  const camera = isAngledView ? perspectiveCamera : sideCamera;
  const direction =
    Number(movementKeys.has('d') || movementKeys.has('arrowright')) -
    Number(movementKeys.has('a') || movementKeys.has('arrowleft'));
  const nextX = cylinder.position.x + direction * 2.5 * delta;
  const distance = nextX - cylinder.position.x;
  cylinder.position.x = nextX;

  if (distance !== 0) {
    rollAngle -= distance / cylinderRadius;
  }
  rollRotation.setFromAxisAngle(rollAxis, rollAngle);
  cylinder.quaternion.copy(cylinderFacing).multiply(rollRotation);

  if (isOnPlatform) {
    currentPlatform = surfaces.find(
      (surface) => cylinder.position.x >= surface.left && cylinder.position.x <= surface.right,
    );
    if (currentPlatform) {
      cylinder.position.y = currentPlatform.surfaceYAt(cylinder.position.x) + cylinderRadius;
    } else {
      isOnPlatform = false;
    }
  }

  if (!isOnPlatform) {
    const previousY = cylinder.position.y;
    verticalVelocity -= gravity * delta;
    cylinder.position.y += verticalVelocity * delta;

    if (verticalVelocity <= 0) {
      const landingSurface = surfaces.find((candidate) => {
        const surfaceY = candidate.surfaceYAt(cylinder.position.x) + cylinderRadius;
        return previousY >= surfaceY &&
        cylinder.position.y <= surfaceY &&
        cylinder.position.x >= candidate.left &&
        cylinder.position.x <= candidate.right;
      });

      if (landingSurface) {
        cylinder.position.y = landingSurface.surfaceYAt(cylinder.position.x) + cylinderRadius;
        verticalVelocity = 0;
        isOnPlatform = true;
        currentPlatform = landingSurface;
      }
    }
  }

  camera.position.copy(isAngledView ? angledView : sideView).add(cylinder.position);
  camera.lookAt(cylinder.position);
  renderer.render(scene, camera);
});
