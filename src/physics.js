import * as CANNON from 'cannon-es';

export function createPhysicsWorld() {
  const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -7, 0),
  });
  world.solver.iterations = 10;
  world.defaultContactMaterial.friction = 0.7;
  world.defaultContactMaterial.restitution = 0;
  return world;
}

export function addStaticBox(world, position, rotation, size) {
  const body = new CANNON.Body({ mass: 0 });
  body.addShape(
    new CANNON.Box(
      new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2),
    ),
  );
  body.position.set(position.x, position.y, position.z);
  body.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
  world.addBody(body);
  return body;
}
