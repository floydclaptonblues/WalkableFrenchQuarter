import * as THREE from 'three';
import { InputController } from './Input.js';
import { TextureFactory } from './TextureFactory.js';

export class Engine {
  constructor({ canvas, titleElement, subtitleElement, hintElement, metricsElement }) {
    this.canvas = canvas;
    this.titleElement = titleElement;
    this.subtitleElement = subtitleElement;
    this.hintElement = hintElement;
    this.metricsElement = metricsElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.08, 900);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    this.renderer.shadowMap.enabled = false;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.input = new InputController(canvas);
    this.textures = new TextureFactory();
    this.clock = new THREE.Clock();
    this.yaw = 0;
    this.pitch = 0;
    this.playerHeight = 1.65;
    this.playerRadius = 0.58;
    this.moveSpeed = 5.8;
    this.colliders = [];
    this.animations = [];
    this.interactables = [];
    this.quality = 'High';
    this.running = false;
    this.frameCounter = { frames: 0, elapsed: 0, fps: 0 };
    this.lastInteractable = null;

    addEventListener('resize', () => this.resize());
  }

  setWorld(world) {
    this.world = world;
    this.clearScene();
    if (this.titleElement) this.titleElement.textContent = world.title;
    if (this.subtitleElement) this.subtitleElement.textContent = world.subtitle;
    if (this.hintElement) this.hintElement.textContent = world.hint;

    world.build({
      THREE,
      scene: this.scene,
      camera: this.camera,
      renderer: this.renderer,
      textures: this.textures,
      colliders: this.colliders,
      animations: this.animations,
      interactables: this.interactables
    });

    this.camera.position.copy(world.playerStart.position);
    this.yaw = world.playerStart.yaw;
    this.pitch = world.playerStart.pitch || 0;
    this.applyCameraRotation();
  }

  clearScene() {
    while (this.scene.children.length) this.scene.remove(this.scene.children[0]);
    this.colliders.length = 0;
    this.animations.length = 0;
    this.interactables.length = 0;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    this.animate();
  }

  resize() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
  }

  setQuality(mode) {
    this.quality = mode;
    const dpr = mode === 'High' ? Math.min(devicePixelRatio, 1.75) : Math.min(devicePixelRatio, 1.0);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(innerWidth, innerHeight);
  }

  toggleQuality() {
    this.setQuality(this.quality === 'High' ? 'Low' : 'High');
    return this.quality;
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const dt = Math.min(0.045, this.clock.getDelta());
    this.update(dt);
    this.renderer.render(this.scene, this.camera);
  }

  update(dt) {
    const look = this.input.consumeMouseDelta();
    const sensitivity = 0.00215;
    this.yaw -= look.x * sensitivity;
    this.pitch -= look.y * sensitivity;
    this.pitch = THREE.MathUtils.clamp(this.pitch, -1.35, 1.35);
    this.applyCameraRotation();

    this.move(dt);
    for (const fn of this.animations) fn(dt, this.clock.elapsedTime);
    this.updateInteractableHint();
    if (this.input.consumeAction()) this.activateNearestInteractable();
    this.updateMetrics(dt);
  }

  applyCameraRotation() {
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }

  move(dt) {
    const input = this.input.getMovementVector();
    if (input.lengthSq() < 0.0001) return;
    const speed = this.moveSpeed * (this.input.isSprinting() ? 1.75 : 1.0);
    const forward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw) * -1).normalize();
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, Math.sin(this.yaw)).normalize();
    const delta = new THREE.Vector3();
    delta.addScaledVector(forward, input.y);
    delta.addScaledVector(right, input.x);
    if (delta.lengthSq() > 1) delta.normalize();
    delta.multiplyScalar(speed * dt);

    const proposedX = this.camera.position.x + delta.x;
    const proposedZ = this.camera.position.z + delta.z;
    const canX = !this.collides(proposedX, this.camera.position.z);
    const canZ = !this.collides(this.camera.position.x, proposedZ);
    if (canX) this.camera.position.x = proposedX;
    if (canZ) this.camera.position.z = proposedZ;
  }

  collides(x, z) {
    for (const c of this.colliders) {
      if (
        x > c.minX - this.playerRadius && x < c.maxX + this.playerRadius &&
        z > c.minZ - this.playerRadius && z < c.maxZ + this.playerRadius
      ) return true;
    }
    return false;
  }

  nearestInteractable(maxDistance = 4.6) {
    let best = null;
    let bestD = maxDistance;
    for (const item of this.interactables) {
      const d = this.camera.position.distanceTo(item.position);
      if (d < bestD) {
        best = item;
        bestD = d;
      }
    }
    return best;
  }

  updateInteractableHint() {
    const target = this.nearestInteractable();
    if (target !== this.lastInteractable && this.hintElement) {
      this.hintElement.textContent = target ? `E / ACTION: ${target.label}` : this.world.hint;
      this.lastInteractable = target;
    }
  }

  activateNearestInteractable() {
    const target = this.nearestInteractable();
    if (!target) return;
    const dialogue = document.getElementById('dialogue');
    const speaker = document.getElementById('dialogue-speaker');
    const text = document.getElementById('dialogue-text');
    if (!dialogue || !speaker || !text) return;
    speaker.textContent = target.title || target.label;
    text.textContent = target.text;
    dialogue.classList.remove('hidden');
  }

  updateMetrics(dt) {
    if (!this.metricsElement || this.metricsElement.classList.contains('hidden')) return;
    this.frameCounter.frames += 1;
    this.frameCounter.elapsed += dt;
    if (this.frameCounter.elapsed > 0.35) {
      this.frameCounter.fps = Math.round(this.frameCounter.frames / this.frameCounter.elapsed);
      this.frameCounter.frames = 0;
      this.frameCounter.elapsed = 0;
    }
    const info = this.renderer.info;
    this.metricsElement.innerHTML = `FPS ${this.frameCounter.fps}<br>Draw calls ${info.render.calls}<br>Geometries ${info.memory.geometries}<br>Textures ${info.memory.textures}<br>Position ${this.camera.position.x.toFixed(1)}, ${this.camera.position.z.toFixed(1)}`;
  }
}
