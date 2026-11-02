import * as THREE from 'three';
import { Platform } from '../components/Platform.js';
import { level_0 } from './level_0.js';

const levels = {
  level_0,
};

export function loadLevel(name, context) {
  const level = levels[name];
  if (!level) {
    throw new Error(`Unknown level: ${name}`);
  }

  const createComponents = (Component, configs) =>
    configs.map((config) => new Component({ ...context, ...config }));

  createComponents(Platform, level.platforms);

  return {
    spawn: new THREE.Vector3(level.spawn.x, level.spawn.y, level.spawn.z),
  };
}
