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

export function loadLevel(name, context) {
  const level = levels[name];
  if (!level) {
    throw new Error(`Unknown level: ${name}`);
  }

  const { scene, world } = context;
  const createComponents = (Component, configs) =>
    configs.map((config) => new Component({ ...context, ...config }));

  const platforms = createComponents(Platform, level.platforms);
  const shiftButtons = createComponents(ShiftButton, level.shiftButtons);

  return {
    spawn: new THREE.Vector3(level.spawn.x, level.spawn.y, level.spawn.z),
    shiftButtons,
    dispose() {
      for (const platform of platforms) {
        sceneRemove(platform.mesh);
        world.removeBody(platform.body);
        platform.mesh.geometry.dispose();
        platform.mesh.material.dispose();
      }
      for (const button of shiftButtons) {
        world.removeEventListener('preStep', button.applyPlungerForces);
        world.removeEventListener('postStep', button.syncPlungerMesh);
        sceneRemove(button.baseMesh);
        sceneRemove(button.plungerMesh);
        world.removeBody(button.baseBody);
        world.removeBody(button.plungerBody);
        button.baseMesh.geometry.dispose();
        button.baseMesh.material.dispose();
        button.plungerMesh.geometry.dispose();
        button.plungerMesh.material.dispose();
      }
    },
  };
}

function sceneRemove(object) {
  object.parent?.remove(object);
}
