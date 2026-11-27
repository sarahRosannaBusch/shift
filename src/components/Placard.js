import * as THREE from 'three';

export class Placard {
  constructor({
    scene,
    left,
    bottom,
    color = '#414141',
    text,
    height = 1,
    z = 0,
  }) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Unable to create placard texture');
    }

    canvas.height = 224;
    const fontSize = 75;
    context.font = `600 ${fontSize}px sans-serif`;
    const keyWidth = 128;
    const arrowKeys = ['←', '→', '↑', '↓'];
    const parts = text.split(/([←→↑↓])/u);
    const textWidth = parts.reduce((total, part) => {
      if (arrowKeys.includes(part)) return total + keyWidth;
      return total + context.measureText(part).width;
    }, 0);
    const paddingPerSide = fontSize * 1;
    canvas.width = Math.ceil(textWidth + paddingPerSide * 2);
    const placardWidth = height * canvas.width / canvas.height;

    context.fillStyle = '#25232f';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = color;
    context.lineWidth = 12;
    context.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
    context.fillStyle = '#f5f3ff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = `600 ${fontSize}px sans-serif`;
    let x = (canvas.width - textWidth) / 2;
    for (const part of parts) {
      if (arrowKeys.includes(part)) {
        const keyHeight = 112;
        const keyTop = (canvas.height - keyHeight) / 2;
        context.fillStyle = '#25232f';
        context.fillRect(x + 8, keyTop, keyWidth - 16, keyHeight);
        context.strokeStyle = '#f5f3ff';
        context.lineWidth = 8;
        context.strokeRect(x + 8, keyTop, keyWidth - 16, keyHeight);
        context.fillStyle = '#f5f3ff';
        context.fillText(part, x + keyWidth / 2, canvas.height / 2);
        x += keyWidth;
      } else {
        const partWidth = context.measureText(part).width;
        context.fillText(part, x + partWidth / 2, canvas.height / 2);
        x += partWidth;
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.texture = texture;
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(placardWidth, height),
      new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
      }),
    );
    this.mesh.position.set(left + placardWidth / 2, bottom + height / 2, z);
    scene.add(this.mesh);
  }
}
