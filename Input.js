import * as THREE from 'three';

export class InputController {
  constructor(canvas, dom = document) {
    this.canvas = canvas;
    this.dom = dom;
    this.keys = new Set();
    this.mouseDelta = { x: 0, y: 0 };
    this.joystick = { x: 0, y: 0 };
    this.lookTouchId = null;
    this.lookLast = null;
    this.actionPressed = false;
    this.pointerLocked = false;
    this.isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    if (this.isTouch) document.body.classList.add('is-touch');
    this.bindKeyboard();
    this.bindPointerLook();
    this.bindTouchControls();
  }

  bindKeyboard() {
    addEventListener('keydown', (event) => {
      if (event.repeat) return;
      this.keys.add(event.code);
      if (event.code === 'KeyE') this.actionPressed = true;
    });
    addEventListener('keyup', (event) => this.keys.delete(event.code));
  }

  bindPointerLook() {
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
    });
    document.addEventListener('mousemove', (event) => {
      if (!this.pointerLocked) return;
      this.mouseDelta.x += event.movementX || 0;
      this.mouseDelta.y += event.movementY || 0;
    });
    this.canvas.addEventListener('mousedown', (event) => {
      if (event.button !== 0 || this.isTouch) return;
      this.canvas.requestPointerLock?.();
    });
  }

  bindTouchControls() {
    const stick = document.getElementById('touch-stick');
    const nub = stick?.querySelector('span');
    const action = document.getElementById('touch-action');
    if (!stick || !nub || !action) return;

    let stickTouchId = null;
    const stickRectCenter = () => {
      const r = stick.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, radius: r.width * 0.42 };
    };
    const setStick = (clientX, clientY) => {
      const c = stickRectCenter();
      const dx = clientX - c.x;
      const dy = clientY - c.y;
      const len = Math.max(1, Math.hypot(dx, dy));
      const clamped = Math.min(c.radius, len);
      const nx = dx / len;
      const ny = dy / len;
      this.joystick.x = nx * (clamped / c.radius);
      this.joystick.y = ny * (clamped / c.radius);
      nub.style.left = `${39 + this.joystick.x * 34}px`;
      nub.style.top = `${39 + this.joystick.y * 34}px`;
    };
    const resetStick = () => {
      stickTouchId = null;
      this.joystick.x = 0;
      this.joystick.y = 0;
      nub.style.left = '39px';
      nub.style.top = '39px';
    };

    stick.addEventListener('touchstart', (event) => {
      event.preventDefault();
      const t = event.changedTouches[0];
      stickTouchId = t.identifier;
      setStick(t.clientX, t.clientY);
    }, { passive: false });
    stick.addEventListener('touchmove', (event) => {
      event.preventDefault();
      for (const t of event.changedTouches) if (t.identifier === stickTouchId) setStick(t.clientX, t.clientY);
    }, { passive: false });
    stick.addEventListener('touchend', (event) => {
      for (const t of event.changedTouches) if (t.identifier === stickTouchId) resetStick();
    });
    stick.addEventListener('touchcancel', resetStick);

    action.addEventListener('click', () => { this.actionPressed = true; });

    this.canvas.addEventListener('touchstart', (event) => {
      const rect = this.canvas.getBoundingClientRect();
      for (const t of event.changedTouches) {
        const localX = t.clientX - rect.left;
        if (localX > rect.width * 0.34 && this.lookTouchId === null) {
          this.lookTouchId = t.identifier;
          this.lookLast = { x: t.clientX, y: t.clientY };
        }
      }
    }, { passive: true });
    this.canvas.addEventListener('touchmove', (event) => {
      for (const t of event.changedTouches) {
        if (t.identifier !== this.lookTouchId || !this.lookLast) continue;
        this.mouseDelta.x += (t.clientX - this.lookLast.x) * 1.2;
        this.mouseDelta.y += (t.clientY - this.lookLast.y) * 1.2;
        this.lookLast = { x: t.clientX, y: t.clientY };
      }
    }, { passive: true });
    this.canvas.addEventListener('touchend', (event) => {
      for (const t of event.changedTouches) {
        if (t.identifier === this.lookTouchId) {
          this.lookTouchId = null;
          this.lookLast = null;
        }
      }
    });
    this.canvas.addEventListener('touchcancel', () => {
      this.lookTouchId = null;
      this.lookLast = null;
    });
  }

  consumeMouseDelta() {
    const delta = { ...this.mouseDelta };
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    return delta;
  }

  consumeAction() {
    const pressed = this.actionPressed;
    this.actionPressed = false;
    return pressed;
  }

  getMovementVector() {
    const v = new THREE.Vector2(0, 0);
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) v.y += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) v.y -= 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) v.x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) v.x += 1;
    v.x += this.joystick.x;
    v.y += -this.joystick.y;
    if (v.lengthSq() > 1) v.normalize();
    return v;
  }

  isSprinting() {
    return this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
  }
}
