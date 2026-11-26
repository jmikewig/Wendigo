// Touch overlay and mobile/tablet pointer controls.
const PLAYABLE = new Set(['DUSK', 'DREAD', 'IGNITION', 'HUB', 'COMPLETE']);

export class TouchControls {
  constructor(input) {
    this.input = input;
    this.isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    this.wrap = document.getElementById('touchControls');
    this.btnAct = document.getElementById('btnAct');
    this.btnTorch = document.getElementById('btnTorch');
    this.promptEl = document.getElementById('prompt');

    if (!this.isTouch) return;

    document.documentElement.classList.add('touch-device');
    const titlePrompt = document.getElementById('titlePrompt');
    const overPrompt = document.getElementById('gameoverPrompt');
    const endPrompt = document.getElementById('endingPrompt');
    const skipBtn = document.getElementById('cutsceneSkip');
    if (titlePrompt) titlePrompt.textContent = 'TAP TO START';
    if (overPrompt) overPrompt.textContent = 'TAP TO TRY AGAIN';
    if (endPrompt) endPrompt.textContent = 'TAP TO PLAY AGAIN';
    if (skipBtn) skipBtn.textContent = 'SKIP ▸';

    this._bindScreens();
    this._bindDpad();
    this._bindActions();
  }

  _requestFullscreen() {
    document.documentElement.requestFullscreen?.()?.catch(() => {});
    screen.orientation?.lock?.('landscape')?.catch(() => {});
  }

  _bindScreens() {
    const audioWrap = document.getElementById('audioControl');
    const title = document.getElementById('title');
    const gameover = document.getElementById('gameover');
    const ending = document.getElementById('ending');
    const skipBtn = document.getElementById('cutsceneSkip');
    const fsBtn = document.getElementById('fsBtn');

    if (fsBtn && document.fullscreenEnabled) {
      fsBtn.classList.remove('hidden');
      fsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (document.fullscreenElement) {
          document.exitFullscreen?.()?.catch(() => {});
        } else {
          this._requestFullscreen();
        }
        fsBtn.blur();
      });
    }

    title?.addEventListener('click', (e) => {
      if (audioWrap?.contains(e.target)) return;
      this._requestFullscreen();
      this.input.triggerAny();
    });

    gameover?.addEventListener('pointerdown', (e) => {
      if (audioWrap?.contains(e.target)) return;
      this.input.tap('KeyE');
    });

    ending?.addEventListener('pointerdown', (e) => {
      if (audioWrap?.contains(e.target)) return;
      this.input.tap('KeyE');
    });

    skipBtn?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.input.tap('Escape');
    });

    document.querySelectorAll('.touch-nav-btn').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (btn.dataset.key) this.input.tap(btn.dataset.key);
      });
    });
  }

  _bindDpad() {
    const dpad = document.getElementById('dpad');
    if (!dpad) return;
    const segs = {
      up: dpad.querySelector('.up'),
      down: dpad.querySelector('.down'),
      left: dpad.querySelector('.left'),
      right: dpad.querySelector('.right'),
    };
    let activePointer = null;

    const setDir = (code, on, el) => {
      if (on) this.input.press(code);
      else this.input.release(code);
      el?.classList.toggle('active', on);
    };

    const updateFromEvent = (e) => {
      const r = dpad.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dz = Math.min(r.width, r.height) * 0.16;
      setDir('KeyW', dy < -dz, segs.up);
      setDir('KeyS', dy > dz, segs.down);
      setDir('KeyA', dx < -dz, segs.left);
      setDir('KeyD', dx > dz, segs.right);
    };

    const reset = () => {
      activePointer = null;
      this.input.releaseDirections();
      Object.values(segs).forEach((el) => el?.classList.remove('active'));
    };

    dpad.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      activePointer = e.pointerId;
      dpad.setPointerCapture?.(e.pointerId);
      updateFromEvent(e);
    });

    dpad.addEventListener('pointermove', (e) => {
      if (e.pointerId === activePointer) updateFromEvent(e);
    });

    dpad.addEventListener('pointerup', (e) => {
      if (e.pointerId === activePointer) reset();
    });
    dpad.addEventListener('pointercancel', reset);
    dpad.addEventListener('lostpointercapture', reset);
  }

  _bindActions() {
    const bindBtn = (el, code) => {
      if (!el) return;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.classList.add('pressed');
        this.input.tap(code);
      });
      const clear = () => el.classList.remove('pressed');
      el.addEventListener('pointerup', clear);
      el.addEventListener('pointercancel', clear);
      el.addEventListener('pointerleave', clear);
    };
    bindBtn(this.btnAct, 'KeyE');
    bindBtn(this.btnTorch, 'Space');
  }

  sync(dir, g) {
    if (!this.isTouch || !this.wrap) return;
    const show = PLAYABLE.has(dir.phase) && !g.journal.isOpen && !g.blueprint.isOpen;
    this.wrap.classList.toggle('hidden', !show);
    if (!show) {
      this.input.releaseDirections();
      return;
    }
    const promptVisible = this.promptEl && !this.promptEl.classList.contains('hidden');
    this.btnAct?.classList.toggle('ready', Boolean(promptVisible));
    this.btnTorch?.classList.toggle('ready', g.player.wood > 0);
  }
}
