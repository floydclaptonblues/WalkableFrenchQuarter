import { Engine } from './core/Engine.js';
import { frenchQuarterWorld } from './worlds/frenchQuarterWorld.js';

const canvas = document.getElementById('world-canvas');
const boot = document.getElementById('boot-panel');
const enter = document.getElementById('enter-world');
const fullscreen = document.getElementById('fullscreen');
const quality = document.getElementById('quality');
const metricsToggle = document.getElementById('metrics-toggle');
const metrics = document.getElementById('metrics');
const dialogue = document.getElementById('dialogue');
const dialogueClose = document.getElementById('dialogue-close');

const engine = new Engine({
  canvas,
  titleElement: document.getElementById('world-title'),
  subtitleElement: document.getElementById('world-subtitle'),
  hintElement: document.getElementById('hint'),
  metricsElement: metrics
});

engine.setWorld(frenchQuarterWorld);
engine.start();

enter.addEventListener('click', () => {
  boot.classList.add('hidden');
  canvas.focus?.();
  if (!engine.input.isTouch) canvas.requestPointerLock?.();
});

dialogueClose.addEventListener('click', () => dialogue.classList.add('hidden'));

fullscreen.addEventListener('click', async () => {
  if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
  else await document.exitFullscreen?.();
});

quality.addEventListener('click', () => {
  const mode = engine.toggleQuality();
  quality.textContent = `Quality: ${mode}`;
});

metricsToggle.addEventListener('click', () => metrics.classList.toggle('hidden'));

addEventListener('keydown', (event) => {
  if (event.code === 'Escape') dialogue.classList.add('hidden');
  if (event.code === 'KeyM') metrics.classList.toggle('hidden');
});
