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
    markers = null,
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
    if (markers) this.addMarkers(scene, markers);
  }

  addMarkers(scene, { spacing, z, color = '#67e8d2' }) {
    const material = new THREE.MeshStandardMaterial({ color });
    const left = this.mesh.position.x - this.mesh.geometry.parameters.width / 2;
    const right = this.mesh.position.x + this.mesh.geometry.parameters.width / 2;
    const top = this.mesh.position.y + this.mesh.geometry.parameters.height / 2;

    for (let x = left; x <= right; x += spacing) {
      const major = Math.abs((x - this.mesh.position.x) % (spacing * 2)) < 0.001;
      const height = major ? 0.5 : 0.3;
      const marker = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, height, 0.08),
        material,
      );
      marker.position.set(x, top + height / 2, z);
      scene.add(marker);
    }
  }
}
