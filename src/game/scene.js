import * as THREE from 'three';

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#131313');
  addStarfield(scene);
  addLighting(scene);
  return scene;
}

function addStarfield(scene) {
  const starPositions = [];
  const starSizes = [];
  let randomSeed = 42;
  const random = () => {
    randomSeed = (randomSeed * 16807) % 2147483647;
    return (randomSeed - 1) / 2147483646;
  };
  for (let i = 0; i < 400; i += 1) {
    starPositions.push(
      -5 + random() * 48,
      -3 + random() * 16,
      -8 + random() * 16,
    );
    starSizes.push(1 + random() * 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(starPositions, 3),
  );
  geometry.setAttribute(
    'starSize',
    new THREE.Float32BufferAttribute(starSizes, 1),
  );
  const material = new THREE.PointsMaterial({
    color: '#ffffff',
    size: 1,
    sizeAttenuation: false,
  });
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float starSize;')
      .replace('gl_PointSize = size;', 'gl_PointSize = starSize * 2.0;');
    shader.fragmentShader = shader.fragmentShader.replace(
      'void main() {',
      'void main() {\n\tif (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;',
    );
  };
  scene.add(new THREE.Points(geometry, material));
}

function addLighting(scene) {
  scene.add(new THREE.HemisphereLight('#ffffff', '#302944', 2));
  const keyLight = new THREE.DirectionalLight('#ffffff', 2.5);
  keyLight.position.set(-3, 6, 4);
  scene.add(keyLight);
}
