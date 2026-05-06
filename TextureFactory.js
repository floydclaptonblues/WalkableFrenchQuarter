import * as THREE from 'three';

export class TextureFactory {
  constructor(basePath = 'assets/textures/') {
    this.loader = new THREE.TextureLoader();
    this.basePath = basePath;
    this.cache = new Map();
  }

  load(name, options = {}) {
    const key = `${name}:${JSON.stringify(options)}`;
    if (this.cache.has(key)) return this.cache.get(key);
    const texture = this.loader.load(this.basePath + name);
    texture.colorSpace = options.colorSpace || THREE.SRGBColorSpace;
    texture.wrapS = options.wrapS || THREE.RepeatWrapping;
    texture.wrapT = options.wrapT || THREE.RepeatWrapping;
    const repeat = options.repeat || [1, 1];
    texture.repeat.set(repeat[0], repeat[1]);
    texture.anisotropy = options.anisotropy || 4;
    if (options.flipY === false) texture.flipY = false;
    this.cache.set(key, texture);
    return texture;
  }

  canvas(key, draw, size = 512, options = {}) {
    const cacheKey = `canvas:${key}:${size}:${JSON.stringify(options)}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    draw(ctx, size, canvas);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = options.colorSpace || THREE.SRGBColorSpace;
    texture.wrapS = options.wrapS || THREE.RepeatWrapping;
    texture.wrapT = options.wrapT || THREE.RepeatWrapping;
    const repeat = options.repeat || [1, 1];
    texture.repeat.set(repeat[0], repeat[1]);
    texture.anisotropy = options.anisotropy || 4;
    this.cache.set(cacheKey, texture);
    return texture;
  }

  stucco(base = '#6d564d', accent = '#b79a84') {
    return this.canvas(`stucco-${base}-${accent}`, (ctx, s) => {
      const g = ctx.createLinearGradient(0, 0, 0, s);
      g.addColorStop(0, base);
      g.addColorStop(1, accent);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 8200; i++) {
        const x = Math.random() * s;
        const y = Math.random() * s;
        const r = Math.random() * 2.3;
        const a = Math.random() * 0.075;
        ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = '#1f1512';
      ctx.lineWidth = 1;
      for (let y = 300; y < s; y += 28) {
        const offset = (Math.floor(y / 28) % 2) * 44;
        for (let x = -offset; x < s; x += 88) ctx.strokeRect(x, y, 84, 24);
      }
      ctx.globalAlpha = 1;
    });
  }

  wroughtIron() {
    return this.canvas('wrought-iron-lace-v2', (ctx, s) => {
      ctx.clearRect(0, 0, s, s);
      const draw = (stroke, width, alpha) => {
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        for (let x = 28; x < s; x += 64) {
          ctx.beginPath();
          ctx.arc(x, s * 0.5, 24, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, 32);
          ctx.lineTo(x, s - 32);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x - 26, s * 0.5);
          ctx.bezierCurveTo(x - 18, s * 0.28, x + 18, s * 0.72, x + 26, s * 0.5);
          ctx.stroke();
        }
      };
      draw('#020305', 13, 1);
      draw('#1b2330', 7, 1);
      draw('#435061', 2, 0.55);
      ctx.globalAlpha = 1;
    }, 256, { repeat: [4, 1] });
  }

  neonText(text, colorA = '#ff4fd8', colorB = '#4deaff') {
    return this.canvas(`neon-${text}-${colorA}-${colorB}`, (ctx, s) => {
      ctx.clearRect(0, 0, s, s);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `800 ${Math.floor(s * 0.22)}px Tahoma, Arial, sans-serif`;
      const g = ctx.createLinearGradient(0, 0, s, 0);
      g.addColorStop(0, colorA);
      g.addColorStop(1, colorB);
      ctx.shadowColor = colorA;
      ctx.shadowBlur = 28;
      ctx.lineWidth = 8;
      ctx.strokeStyle = g;
      ctx.strokeText(text, s / 2, s / 2);
      ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(255,255,255,0.26)';
      ctx.fillText(text, s / 2, s / 2);
    }, 512, { wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping });
  }

  warmWindow() {
    return this.canvas('warm-window', (ctx, s) => {
      const g = ctx.createRadialGradient(s / 2, s / 2, 10, s / 2, s / 2, s * 0.7);
      g.addColorStop(0, '#ffe2a8');
      g.addColorStop(0.55, '#d88333');
      g.addColorStop(1, '#18100b');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = '#100806';
      ctx.lineWidth = 20;
      ctx.strokeRect(10, 10, s - 20, s - 20);
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(s / 2, 10);
      ctx.lineTo(s / 2, s - 10);
      ctx.moveTo(10, s / 2);
      ctx.lineTo(s - 10, s / 2);
      ctx.stroke();
    }, 256, { wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping });
  }
}
