import * as THREE from 'three';
import * as CANNON from 'cannon-es';

const cylinderRadius = 0.45;
const cylinderLength = 0.7;

export function createPlayer({ scene, world, position }) {
  const spawn = new CANNON.Vec3(position.x, position.y, position.z);
  const mesh = new THREE.Group();
  const cylinderMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderLength, 32),
    new THREE.MeshStandardMaterial({
      color: '#ffb454',
      roughness: 0.35,
    }),
  );
  mesh.add(cylinderMesh);
  const facing = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(1, 0, 0),
    Math.PI / 2,
  );
  mesh.quaternion.copy(facing);
  mesh.position.set(position.x, position.y, position.z);
  scene.add(mesh);

  const body = new CANNON.Body({
    mass: 1,
    position: spawn.clone(),
    angularDamping: 0.2,
    linearDamping: 0.2,
  });
  const shape = new CANNON.Cylinder(cylinderRadius, cylinderRadius, cylinderLength, 64);
  const shapeRotation = new CANNON.Quaternion();
  shapeRotation.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
  body.addShape(shape, new CANNON.Vec3(), shapeRotation);
  body.linearFactor.set(1, 1, 0);
  body.angularFactor.set(0, 0, 1);
  world.addBody(body);

  return {
    body,
    mesh,
    reset() {
      body.position.copy(spawn);
      body.previousPosition.copy(spawn);
      body.interpolatedPosition.copy(spawn);
      body.velocity.setZero();
      body.angularVelocity.setZero();
      body.force.setZero();
      body.torque.setZero();
      body.quaternion.set(0, 0, 0, 1);
      body.previousQuaternion.set(0, 0, 0, 1);
      body.interpolatedQuaternion.set(0, 0, 0, 1);
      body.aabbNeedsUpdate = true;
      body.wakeUp();
      this.syncVisual();
    },
    syncVisual() {
      mesh.position.set(body.position.x, body.position.y, body.position.z);
      mesh.quaternion
        .set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)
        .multiply(facing);
    },
  };
}
