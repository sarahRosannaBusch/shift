import * as THREE from 'three';
import { addStaticBox } from '../physics.js';

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
  }) {
    const size = new THREE.Vector3(length, thickness, width);
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
    this.body = addStaticBox(world, this.mesh.position, this.mesh.quaternion, size);
  }
}
