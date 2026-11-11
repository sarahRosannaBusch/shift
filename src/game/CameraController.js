import * as THREE from 'three';

const SIDE_VIEW = new THREE.Vector3(0, 0, 6);
const ANGLED_VIEW = new THREE.Vector3(4, 3.5, 6);
const TRANSITION_DURATION = 2;

export class CameraController {
  constructor({ container, renderer }) {
    this.container = container;
    this.renderer = renderer;
    this.perspectiveCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.sideCamera = new THREE.OrthographicCamera(-2.5, 2.5, 2.5, -2.5, 0.1, 100);
    this.selectionCamera = new THREE.OrthographicCamera(-2.5, 2.5, 2.5, -2.5, 0.1, 100);
    this.transitionCamera = new THREE.Camera();
    this.selectionCamera.position.set(0, 0, 6);
    this.selectionCamera.lookAt(0, 0, 0);

    this.isAngledView = false;
    this.viewBlend = 0;
    this.transitionStart = 0;
    this.transitionTarget = 0;
    this.transitionElapsed = 0;

    this.handleResize = () => this.resize();
    window.addEventListener('resize', this.handleResize);
    this.resize();
  }

  resize() {
    const { width, height } = this.container.getBoundingClientRect();
    if (!width || !height) return;

    this.perspectiveCamera.aspect = width / height;
    this.perspectiveCamera.updateProjectionMatrix();
    this.sideCamera.left = -2.5 * (width / height);
    this.sideCamera.right = 2.5 * (width / height);
    this.sideCamera.top = 2.5;
    this.sideCamera.bottom = -2.5;
    this.sideCamera.updateProjectionMatrix();
    this.selectionCamera.left = this.sideCamera.left;
    this.selectionCamera.right = this.sideCamera.right;
    this.selectionCamera.top = this.sideCamera.top;
    this.selectionCamera.bottom = this.sideCamera.bottom;
    this.selectionCamera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  toggleAngledView() {
    this.isAngledView = !this.isAngledView;
  }

  setAngledView(isAngledView) {
    this.isAngledView = isAngledView;
  }

  resetView() {
    this.isAngledView = false;
    this.viewBlend = 0;
    this.transitionStart = 0;
    this.transitionTarget = 0;
    this.transitionElapsed = 0;
  }

  resetSelectionCamera() {
    this.selectionCamera.position.set(0, 0, 6);
    this.selectionCamera.zoom = 1;
    this.selectionCamera.lookAt(0, 0, 0);
    this.selectionCamera.updateProjectionMatrix();
  }

  update(delta, player) {
    player.syncVisual();
    const requestedView = Number(this.isAngledView);
    if (requestedView !== this.transitionTarget) {
      this.transitionStart = this.viewBlend;
      this.transitionTarget = requestedView;
      this.transitionElapsed = 0;
    }
    this.transitionElapsed = Math.min(
      this.transitionElapsed + delta,
      TRANSITION_DURATION,
    );
    const progress = this.transitionElapsed / TRANSITION_DURATION;
    const easedProgress = progress * progress * (2 - progress);
    this.viewBlend = THREE.MathUtils.lerp(
      this.transitionStart,
      this.transitionTarget,
      easedProgress,
    );

    this.sideCamera.position.copy(SIDE_VIEW).add(player.mesh.position);
    this.sideCamera.lookAt(player.mesh.position);
    this.perspectiveCamera.position.copy(ANGLED_VIEW).add(player.mesh.position);
    this.perspectiveCamera.lookAt(player.mesh.position);

    this.transitionCamera.position.lerpVectors(
      this.sideCamera.position,
      this.perspectiveCamera.position,
      this.viewBlend,
    );
    this.transitionCamera.quaternion.slerpQuaternions(
      this.sideCamera.quaternion,
      this.perspectiveCamera.quaternion,
      this.viewBlend,
    );
    this.transitionCamera.updateMatrixWorld();
    for (let i = 0; i < 16; i += 1) {
      this.transitionCamera.projectionMatrix.elements[i] =
        THREE.MathUtils.lerp(
          this.sideCamera.projectionMatrix.elements[i],
          this.perspectiveCamera.projectionMatrix.elements[i],
          this.viewBlend,
        );
    }
    this.transitionCamera.projectionMatrixInverse
      .copy(this.transitionCamera.projectionMatrix)
      .invert();
    return this.transitionCamera;
  }
}
