// Keyboard input: held keys + single-frame "hit" detection.
const BLOCK = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

export class Input {
  constructor() {
    this.keys = new Set();
    this.pressed = new Set();
    this.anyPressed = false;
    window.addEventListener('keydown', (e) => {
      if (BLOCK.includes(e.code)) e.preventDefault();
      if (!this.keys.has(e.code)) this.pressed.add(e.code);
      this.keys.add(e.code);
      this.anyPressed = true;
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
  }
  down(...codes) { return codes.some((c) => this.keys.has(c)); }
  hit(...codes) { return codes.some((c) => this.pressed.has(c)); }
  press(code) {
    if (!this.keys.has(code)) this.pressed.add(code);
    this.keys.add(code);
    this.anyPressed = true;
  }
  release(code) { this.keys.delete(code); }
  tap(code) {
    this.pressed.add(code);
    this.anyPressed = true;
  }
  triggerAny() { this.anyPressed = true; }
  releaseDirections() {
    this.keys.delete('KeyW');
    this.keys.delete('KeyA');
    this.keys.delete('KeyS');
    this.keys.delete('KeyD');
  }
  endFrame() { this.pressed.clear(); this.anyPressed = false; }
}
