import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { addStaticBox } from '../game/physics.js';

const BASE_COLLISION_GROUP = 1 << 1;
const RELEASE_REBOUND = 0.02;
const BASE_SIZE = 0.9;
const BASE_HEIGHT = 0.25;
const PLUNGER_RADIUS = 0.35;
const PLUNGER_HEIGHT = 0.3;
const INSERTION = 0.1;

export class ShiftButton {
  constructor({
    scene,
    world,
    left,
    bottom,
    action = 'shift',
    baseColor,
    plungerColor,
    offset = new THREE.Vector3(),
    visualOnly = false,
  }) {
    const defaultColors = action === 'complete'
      ? { base: '#45b877', plunger: '#b9f27c' }
      : { base: '#8b7bff', plunger: '#ffb454' };
    baseColor ??= defaultColors.base;
    plungerColor ??= defaultColors.plunger;
    const z = offset.z;
    const centerX = left + BASE_SIZE / 2 + offset.x;
    const buttonBottom = bottom + offset.y;
    const baseTop = buttonBottom + BASE_HEIGHT;

    this.baseMesh = new THREE.Mesh(
      new THREE.BoxGeometry(BASE_SIZE, BASE_HEIGHT, BASE_SIZE),
      new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.55,
      }),
    );
    this.baseMesh.position.set(centerX, buttonBottom + BASE_HEIGHT / 2, z);
    scene.add(this.baseMesh);

    const plungerY = baseTop + PLUNGER_HEIGHT / 2 - INSERTION;
    this.plungerMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(PLUNGER_RADIUS, PLUNGER_RADIUS, PLUNGER_HEIGHT, 32),
      new THREE.MeshStandardMaterial({ color: plungerColor, roughness: 0.4 }),
    );
    this.plungerMesh.position.set(centerX, plungerY, z);
    scene.add(this.plungerMesh);
    this.action = action;
    if (visualOnly) return;

    this.createPhysics(world);
  }

  createPhysics(world) {
    this.baseBody = addStaticBox(
      world,
      this.baseMesh.getWorldPosition(new THREE.Vector3()),
      this.baseMesh.getWorldQuaternion(new THREE.Quaternion()),
      new THREE.Vector3(BASE_SIZE, BASE_HEIGHT, BASE_SIZE),
    );
    this.baseBody.collisionFilterGroup = BASE_COLLISION_GROUP;

    const plungerPosition = this.plungerMesh.getWorldPosition(new THREE.Vector3());
    const buttonBottom = this.baseMesh.getWorldPosition(new THREE.Vector3()).y -
      BASE_HEIGHT / 2;
    this.plungerBody = new CANNON.Body({
      mass: 0.2,
      position: new CANNON.Vec3(
        plungerPosition.x,
        plungerPosition.y,
        plungerPosition.z,
      ),
      collisionFilterMask: ~BASE_COLLISION_GROUP,
      angularFactor: new CANNON.Vec3(0, 0, 0),
      linearFactor: new CANNON.Vec3(0, 0, 0),
    });
    this.plungerBody.addShape(
      new CANNON.Cylinder(
        PLUNGER_RADIUS,
        PLUNGER_RADIUS,
        PLUNGER_HEIGHT,
        32,
      ),
    );
    this.plungerBody.linearFactor.y = 1;
    world.addBody(this.plungerBody);
    this.playerOnTop = false;
    this.returnPosition = plungerPosition.y;
    this.wasPressed = false;
    this.applyPlungerForces = () => {
      if (this.playerOnTop) {
        this.plungerBody.force.y += -world.gravity.y * this.plungerBody.mass * 0.8;
        return;
      }

      const returnForce =
        (this.returnPosition - this.plungerBody.position.y) * 80 -
        this.plungerBody.velocity.y * 14;
      this.plungerBody.force.y +=
        this.plungerBody.mass * (-world.gravity.y + returnForce);
    };
    this.syncPlungerMesh = () => {
      this.playerOnTop = world.contacts.some((contact) =>
        contact.bi === this.plungerBody
          ? contact.bj.mass > 0 && contact.ni.y > 0.5
          : contact.bj === this.plungerBody &&
            contact.bi.mass > 0 &&
            contact.ni.y < -0.5
      );
      if (this.playerOnTop) {
        if (this.plungerBody.position.y <= buttonBottom + PLUNGER_HEIGHT / 2 + 0.02) {
          this.wasPressed = true;
        }
      } else if (this.wasPressed) {
        this.returnPosition = this.plungerBody.position.y + RELEASE_REBOUND;
        this.wasPressed = false;
      }
      if (!this.playerOnTop && this.plungerBody.position.y > this.returnPosition) {
        this.plungerBody.position.y = this.returnPosition;
        if (this.plungerBody.velocity.y > 0) this.plungerBody.velocity.y = 0;
        this.plungerBody.aabbNeedsUpdate = true;
      }
      if (this.playerOnTop && this.plungerBody.velocity.y < -0.6) {
        this.plungerBody.velocity.y = -0.6;
      }

      this.plungerMesh.position.set(
        this.plungerBody.position.x,
        this.plungerBody.position.y,
        this.plungerBody.position.z,
      );
      this.plungerMesh.quaternion.set(
        this.plungerBody.quaternion.x,
        this.plungerBody.quaternion.y,
        this.plungerBody.quaternion.z,
        this.plungerBody.quaternion.w,
      );
    };
    world.addEventListener('preStep', this.applyPlungerForces);
    world.addEventListener('postStep', this.syncPlungerMesh);
  }
}
