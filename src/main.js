import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import './style.css';

const container = document.querySelector('.scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#10131a');

const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -7, 0),
});
world.solver.iterations = 10;
world.defaultContactMaterial.friction = 0.7;
world.defaultContactMaterial.restitution = 0;

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

function addStaticBox(position, rotation, size) {
  const body = new CANNON.Body({ mass: 0 });
  body.addShape(
    new CANNON.Box(
      new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2),
    ),
  );
  body.position.set(position.x, position.y, position.z);
  body.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
  world.addBody(body);
}

const platformWidth = 4.5;
const platformThickness = 0.25;
const platformTop = platformThickness / 2;
const platformDefinitions = [
  { x: 0, top: platformTop, width: platformWidth },
  { x: 4.2, top: 0.95, width: 2.5 },
  { x: 10.8, top: 2.55, width: 2.5 },
  { x: 5.4, top: -3.5, width: 40 },
];
platformDefinitions.forEach(({ x, top, width }) => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, platformThickness, 2.5),
    new THREE.MeshStandardMaterial({
      color: '#8b7bff',
      roughness: 0.55,
    }),
  );
  mesh.position.set(x, top - platformThickness / 2, 0);
  scene.add(mesh);
  addStaticBox(
    mesh.position,
    mesh.quaternion,
    new THREE.Vector3(width, platformThickness, 2.5),
  );
});

const catchPlatform = platformDefinitions[3];
const bumperThickness = 0.25;
const bumperHeight = 1.5;
const bumperMaterial = new THREE.MeshStandardMaterial({ color: '#67e8d2' });
for (const side of [-1, 1]) {
  const bumper = new THREE.Mesh(
    new THREE.BoxGeometry(bumperThickness, bumperHeight, 2.5),
    bumperMaterial,
  );
  bumper.position.set(
    catchPlatform.x + side * (catchPlatform.width / 2 - bumperThickness / 2),
    catchPlatform.top + bumperHeight / 2,
    0,
  );
  scene.add(bumper);
  addStaticBox(
    bumper.position,
    bumper.quaternion,
    new THREE.Vector3(bumperThickness, bumperHeight, 2.5),
  );
}

const markerSpacing = 2;
const markerMaterial = new THREE.MeshStandardMaterial({ color: '#67e8d2' });
for (
  let x = catchPlatform.x - catchPlatform.width / 2;
  x <= catchPlatform.x + catchPlatform.width / 2;
  x += markerSpacing
) {
  const isMajorMarker = Math.abs((x - catchPlatform.x) % (markerSpacing * 2)) < 0.001;
  const markerHeight = isMajorMarker ? 0.5 : 0.3;
  const marker = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, markerHeight, 0.08),
    markerMaterial,
  );
  marker.position.set(
    x,
    catchPlatform.top + markerHeight / 2,
    1.18,
  );
  scene.add(marker);
}

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
addStaticBox(
  ramp.position,
  ramp.quaternion,
  new THREE.Vector3(rampLength, platformThickness, 2.5),
);

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
const cylinderFacing = cylinder.quaternion.clone();

const cylinderBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(0, platformTop + cylinderRadius, 0),
  angularDamping: 0.2,
  linearDamping: 0.2,
});
const cylinderShape = new CANNON.Cylinder(cylinderRadius, cylinderRadius, 0.7, 64);
const cylinderShapeRotation = new CANNON.Quaternion();
cylinderShapeRotation.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
cylinderBody.addShape(cylinderShape, new CANNON.Vec3(), cylinderShapeRotation);
cylinderBody.linearFactor.set(1, 1, 0);
cylinderBody.angularFactor.set(0, 0, 1);
world.addBody(cylinderBody);

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
const fixedTimeStep = 1 / 60;
const moveForce = 5;
const jumpImpulse = 4.5;
let accumulator = 0;
let isGrounded = true;
let jumpRequested = false;

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (key === 'a' || key === 'd' || key === 'arrowleft' || key === 'arrowright') {
    event.preventDefault();
    movementKeys.add(key);
  }

  if (key === 'w' || key === ' ' || key === 'arrowup') {
    event.preventDefault();
    if (!event.repeat) jumpRequested = true;
  }
});

window.addEventListener('keyup', (event) => {
  movementKeys.delete(event.key.toLowerCase());
});

window.addEventListener('blur', () => {
  movementKeys.clear();
  jumpRequested = false;
});

renderer.setAnimationLoop(() => {
  const delta = Math.min(clock.getDelta(), 0.1);
  const camera = isAngledView ? perspectiveCamera : sideCamera;
  const direction =
    Number(movementKeys.has('d') || movementKeys.has('arrowright')) -
    Number(movementKeys.has('a') || movementKeys.has('arrowleft'));
  accumulator += delta;

  while (accumulator >= fixedTimeStep) {
    if (jumpRequested && isGrounded) {
      cylinderBody.applyImpulse(
        new CANNON.Vec3(0, jumpImpulse * cylinderBody.mass, 0),
      );
      isGrounded = false;
      jumpRequested = false;
    }

    if (direction !== 0) {
      cylinderBody.applyForce(
        new CANNON.Vec3(direction * moveForce, 0, 0),
        new CANNON.Vec3(0, 0, 0),
      );
    }

    world.step(fixedTimeStep);
    accumulator -= fixedTimeStep;
    isGrounded = world.contacts.some((contact) =>
      (contact.bi === cylinderBody || contact.bj === cylinderBody) &&
      Math.abs(contact.ni.y) > 0.5
    );
  }

  cylinder.position.set(
    cylinderBody.position.x,
    cylinderBody.position.y,
    cylinderBody.position.z,
  );
  cylinder.quaternion
    .set(
      cylinderBody.quaternion.x,
      cylinderBody.quaternion.y,
      cylinderBody.quaternion.z,
      cylinderBody.quaternion.w,
    )
    .multiply(cylinderFacing);
  camera.position.copy(isAngledView ? angledView : sideView).add(cylinder.position);
  camera.lookAt(cylinder.position);
  renderer.render(scene, camera);
});
