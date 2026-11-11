import * as THREE from 'three';
import './style.css';
import { CameraController } from './game/CameraController.js';
import { GameControls } from './game/controls.js';
import { GameSession } from './game/GameSession.js';
import { LevelSelection } from './game/LevelSelection.js';
import { createScene } from './game/scene.js';
import { createPhysicsWorld } from './game/physics.js';

function main() {
  const scene = createScene();
  const container = document.querySelector('.scene');
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const world = createPhysicsWorld();
  const camera = new CameraController({ container, renderer });
  const controls = new GameControls({ isDev: import.meta.env.DEV });
  let levelSelection;
  const gameSession = new GameSession({
    scene,
    world,
    controls,
    onLevelComplete: (levelIndex) => levelSelection.completeLevel(levelIndex),
    onReturnToMenu: () => {
      levelSelection.show();
      camera.resetSelectionCamera();
    },
    onViewReset: () => camera.resetView(),
    onShiftView: () => camera.setAngledView(true),
  });
  levelSelection = new LevelSelection({
    scene,
    camera: camera.selectionCamera,
    domElement: renderer.domElement,
    onSelect: ({ levelName, levelIndex }) =>
      gameSession.startLevel(levelName, levelIndex),
  });

  const timer = new THREE.Timer();
  timer.connect(document);
  renderer.setAnimationLoop((timestamp) => {
    timer.update(timestamp);
    if (controls.hasDevViewToggleRequest()) {
      camera.toggleAngledView();
      controls.clearDevViewToggleRequest();
    }

    if (gameSession.isActive) {
      const delta = Math.min(timer.getDelta(), 0.1);
      if (!gameSession.update(delta)) return;
      renderer.render(scene, camera.update(delta, gameSession.player));
      return;
    }

    if (levelSelection.isAnimatingUnlock) {
      levelSelection.update(timer.getDelta());
    }
    renderer.render(scene, camera.selectionCamera);
  });
}

main();
