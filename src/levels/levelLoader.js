import * as THREE from 'three';
import { Platform } from '../components/Platform.js';
import { ShiftButton } from '../components/ShiftButton.js';
import { level_0 } from './level_0.js';
import { level_1 } from './level_1.js';
import { level_2 } from './level_2.js';
import { level_3 } from './level_3.js';
import { level_4 } from './level_4.js';
import { level_5 } from './level_5.js';
import { level_6 } from './level_6.js';

const levels = {
  level_0,
  level_1,
  level_2,
  level_3,
  level_4,
  level_5,
  level_6,
};

const LEVEL_SIZE = 40;
const LEVEL_BACKGROUND_Z = -1.5;
let levelPatternTexture;

export function loadLevel(name, context) {
  const { scene, world, offset = new THREE.Vector3() } = context;
  const level = createLevel(name, scene, offset);
  level.createPhysics(world, scene);
  return level;
}

export function createLevel(name, scene, offset = new THREE.Vector3()) {
  const levelDefinition = levels[name];
  if (!levelDefinition) {
    throw new Error(`Unknown level: ${name}`);
  }

  const levelGroup = new THREE.Group();
  levelGroup.position.copy(offset);
  scene.add(levelGroup);
  const createComponents = (Component, components) =>
    components.map((componentConfig) => new Component({
      ...componentConfig,
      scene: levelGroup,
      visualOnly: true,
    }));

  const background = createLevelBackground(levelGroup);
  const platforms = createComponents(Platform, levelDefinition.platforms);
  const shiftButtons = createComponents(
    ShiftButton,
    levelDefinition.shiftButtons,
  );
  const spawnLocal = new THREE.Vector3(
    levelDefinition.spawn.x,
    levelDefinition.spawn.y,
    levelDefinition.spawn.z,
  );
  let physicsWorld;

  return {
    group: levelGroup,
    spawnLocal,
    get spawn() {
      return levelGroup.localToWorld(spawnLocal.clone());
    },
    shiftButtons,
    createPhysics(world, physicsScene) {
      if (physicsWorld) return;

      levelGroup.updateMatrixWorld(true);
      platforms.forEach((platform) => platform.createPhysics(world));
      shiftButtons.forEach((button) => {
        physicsScene.attach(button.plungerMesh);
        button.createPhysics(world);
      });
      physicsWorld = world;
    },
    dispose() {
      for (const platform of platforms) {
        sceneRemove(platform.mesh);
        if (physicsWorld) physicsWorld.removeBody(platform.body);
        platform.mesh.geometry.dispose();
        platform.mesh.material.dispose();
      }
      sceneRemove(background);
      background.geometry.dispose();
      background.material.dispose();
      for (const button of shiftButtons) {
        if (physicsWorld) {
          physicsWorld.removeEventListener('preStep', button.applyPlungerForces);
          physicsWorld.removeEventListener('postStep', button.syncPlungerMesh);
          physicsWorld.removeBody(button.baseBody);
          physicsWorld.removeBody(button.plungerBody);
        }
        sceneRemove(button.baseMesh);
        sceneRemove(button.plungerMesh);
        button.baseMesh.geometry.dispose();
        button.baseMesh.material.dispose();
        button.plungerMesh.geometry.dispose();
        button.plungerMesh.material.dispose();
      }
      sceneRemove(levelGroup);
    },
  };
}

function createLevelBackground(scene) {
  const background = new THREE.Mesh(
    new THREE.PlaneGeometry(LEVEL_SIZE, LEVEL_SIZE),
    new THREE.MeshBasicMaterial({
      map: getLevelPatternTexture(),
      side: THREE.DoubleSide,
    }),
  );
  background.position.set(
    LEVEL_SIZE / 2 - 1,
    LEVEL_SIZE / 2,
    LEVEL_BACKGROUND_Z,
  );
  scene.add(background);
  return background;
}

function getLevelPatternTexture() {
  if (levelPatternTexture) return levelPatternTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to create level background pattern');
  }

  context.fillStyle = '#19191f';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#292830';
  context.lineWidth = 1;
  for (let position = 32; position < canvas.width; position += 32) {
    context.beginPath();
    context.moveTo(position, 0);
    context.lineTo(position, canvas.height);
    context.stroke();
    context.beginPath();
    context.moveTo(0, position);
    context.lineTo(canvas.width, position);
    context.stroke();
  }

  context.fillStyle = '#3a3845';
  for (let y = 0; y <= canvas.height; y += 64) {
    for (let x = 0; x <= canvas.width; x += 64) {
      context.beginPath();
      context.arc(x, y, 2, 0, Math.PI * 2);
      context.fill();
    }
  }

  levelPatternTexture = new THREE.CanvasTexture(canvas);
  levelPatternTexture.wrapS = THREE.RepeatWrapping;
  levelPatternTexture.wrapT = THREE.RepeatWrapping;
  levelPatternTexture.repeat.set(5, 5);
  levelPatternTexture.colorSpace = THREE.SRGBColorSpace;
  return levelPatternTexture;
}

function sceneRemove(object) {
  object.parent?.remove(object);
}
