import * as THREE from 'three';
import { addStaticBox } from '../game/physics.js';

export class Platform {
  constructor({
    scene,
    world,
    left,
    top,
    length,
    thickness = 0.25,
    width = 2.5,
    z = 0,
    angle = 0,
    color = '#8b7bff',
    visualOnly = false,
  }) {
    const size = new THREE.Vector3(length, thickness, width);
    this.size = size;
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size.x, size.y, size.z),
      new THREE.MeshStandardMaterial({ color, roughness: 0.55 }),
    );
    this.mesh.position.set(
      left + Math.cos(angle) * length / 2 + Math.sin(angle) * thickness / 2,
      top + Math.sin(angle) * length / 2 - Math.cos(angle) * thickness / 2,
      z,
    );
    this.mesh.rotation.z = angle;
    scene.add(this.mesh);
    if (visualOnly) return;

    this.createPhysics(world);
  }

  createPhysics(world) {
    const position = this.mesh.getWorldPosition(new THREE.Vector3());
    const rotation = this.mesh.getWorldQuaternion(new THREE.Quaternion());
    const scale = this.mesh.getWorldScale(new THREE.Vector3());
    const size = this.size.clone().multiply(scale);
    this.body = addStaticBox(world, position, rotation, size);
  }
}
