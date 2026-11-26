// Tutorial director: drives the five intro phases.
import { near } from '../entities/interactables.js';

export const PHASE = {
  TITLE: 'TITLE', DUSK: 'DUSK', DREAD: 'DREAD', CUTSCENE: 'CUTSCENE',
  IGNITION: 'IGNITION', HUB: 'HUB', COMPLETE: 'COMPLETE', GAMEOVER: 'GAMEOVER',
};

const MOVABLE = [PHASE.DUSK, PHASE.DREAD, PHASE.IGNITION, PHASE.HUB, PHASE.COMPLETE];
const DECK_Y = 194; // feet below this line = outside on the bottom deck

export class Director {
  constructor(g) {
    this.g = g;
    this.phase = PHASE.TITLE;
    this.cutT = 0;
    this.stepT = 0;
    this.fireLit = false;
    this.journalRead = false;
    this.revealing = false;
    this.reveal = 0;          // 0 → 1 exterior fade-in (Stage 3)
    this.checkpoint = null;
    this.setupAudioMenu();
    this.startTitleAudio();
  }

  setupAudioMenu() {
    const { audio } = this.g;
    const wrap = document.getElementById('audioControl');
    const btn = document.getElementById('audioBtn');
    const callout = document.getElementById('musicCallout');
    const panel = document.getElementById('audioPanel');
    const musicBtn = document.getElementById('toggleMusic');
    const sfxBtn = document.getElementById('toggleSfx');
    if (!wrap || !btn || !panel || !musicBtn || !sfxBtn) return;

    const syncUI = () => {
      musicBtn.dataset.on = String(audio.musicOn);
      musicBtn.querySelector('em').textContent = audio.musicOn ? 'ON' : 'OFF';
      sfxBtn.dataset.on = String(audio.sfxOn);
      sfxBtn.querySelector('em').textContent = audio.sfxOn ? 'ON' : 'OFF';
      btn.classList.toggle('all-muted', !audio.musicOn && !audio.sfxOn);
    };
    syncUI();

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const closed = panel.classList.toggle('hidden');
      btn.setAttribute('aria-expanded', String(!closed));
      btn.blur();
    });

    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.setMusicEnabled(!audio.musicOn);
      if (audio.musicOn) callout?.classList.add('hidden');
      const titleAudio = document.getElementById('titleAudio');
      if (this.phase === PHASE.TITLE && titleAudio) {
        if (audio.musicOn) titleAudio.play().catch(() => {});
        else titleAudio.pause();
      }
      syncUI();
      musicBtn.blur();
    });

    sfxBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.setSfxEnabled(!audio.sfxOn);
      const video = document.getElementById('cutsceneVideo');
      if (this.phase === PHASE.CUTSCENE && video) {
        video.muted = !audio.sfxOn;
      }
      syncUI();
      sfxBtn.blur();
    });

    window.addEventListener('pointerdown', (e) => {
      if (!wrap.contains(e.target) && !panel.classList.contains('hidden')) {
        panel.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  startTitleAudio() {
    const audioEl = document.getElementById('titleAudio');
    if (!audioEl) return;
    audioEl.volume = 0.7;
    audioEl.loop = true;
  }

  stopTitleAudio() {
    const audioEl = document.getElementById('titleAudio');
    if (!audioEl) return;

    clearInterval(this._titleFade);
    this._titleFade = setInterval(() => {
      if (audioEl.volume > 0.05) {
        audioEl.volume = Math.max(0, audioEl.volume - 0.05);
      } else {
        clearInterval(this._titleFade);
        audioEl.pause();
        audioEl.currentTime = 0;
      }
    }, 30);
  }

  start() {
    const { audio, hud } = this.g;
    audio.init();
    audio.startMusic();
    this.stopTitleAudio();
    document.getElementById('title').classList.add('hidden');
    document.getElementById('titleVideo')?.pause();
    this.phase = PHASE.DUSK;
    hud.setObjective("READ CARL'S JOURNAL");
  }

  /** Current guide-arrow target, or null. */
  target() {
    const { items, player } = this.g;
    switch (this.phase) {
      case PHASE.DUSK: return items.journal;
      case PHASE.DREAD: return player.y < DECK_Y ? items.door : items.railing;
      case PHASE.IGNITION: return player.wood === 0 ? items.wood : null;
      case PHASE.HUB: return items.fireplace;
      case PHASE.COMPLETE: return this.benchSeen ? null : items.workbench;
      default: return null;
    }
  }

  update(dt) {
    const g = this.g;
    const { player, input, map, items, hud, audio, wendigo, journal, blueprint } = g;

    if (this.phase === PHASE.TITLE) { if (input.anyPressed) this.start(); return; }
    if (journal.isOpen) { journal.handleInput(input); return; }
    if (blueprint.isOpen) { blueprint.handleInput(input); return; }

    if (MOVABLE.includes(this.phase)) {
      player.update(dt, input, map);
      if (player.moving && (this.stepT -= dt) <= 0) { audio.step(); this.stepT = 0.28; }
    }
    if (this.revealing) this.reveal = Math.min(1, this.reveal + dt / 0.75);
    hud.setPrompt('');

    switch (this.phase) {
      case PHASE.DUSK:
        if (near(player, items.journal)) {
          hud.setPrompt('[E] READ JOURNAL');
          if (input.hit('KeyE')) journal.open(() => this.enterDread());
        }
        break;

      case PHASE.DREAD: {
        const onDeck = player.y > DECK_Y;
        if (onDeck) this.revealing = true;
        const ref = onDeck ? items.railing : items.door;
        const d = player.dist(ref);
        audio.setGrowl((onDeck ? 0.25 : 0.04) + Math.max(0, 1 - d / 220) * 0.3);
        hud.setObjective(onDeck ? 'CHECK THE STAIRS' : 'SOMETHING IS OUTSIDE...');
        if (onDeck && near(player, items.railing)) this.startCutscene();
        break;
      }

      case PHASE.CUTSCENE:
        this.cutT += dt;
        if (this.cutT > 0.5 && input.hit('Escape')) this.finishCutscene();
        break;

      case PHASE.IGNITION:
        wendigo.update(dt, player);
        audio.setGrowl(0.2 + Math.max(0, 1 - player.dist(wendigo) / 200) * 0.5);
        if (near(player, items.wood)) {
          hud.setPrompt('[E] PICK UP WOOD');
          if (input.hit('KeyE')) {
            items.wood.visible = false; player.wood++; audio.pickup();
            hud.setBanner('');
            hud.setObjective('');
          }
        }
        if (player.wood > 0) {
          hud.setPrompt('PRESS [SPACE] TO LIGHT TORCH');
          if (input.hit('Space') && player.lightTorch()) this.ignite();
        }
        if (wendigo.reached(player)) this.gameOver('IT CAME UP THE STAIRS.');
        break;

      case PHASE.HUB:
        wendigo.update(dt, player);
        if (player.torchLit) {
          player.torchTime -= dt;
          if (player.torchTime <= 0) {
            player.torchLit = false;
            audio.setGrowl(0.7); audio.shriek();
            wendigo.spawn('charge');
            hud.setBanner('YOUR TORCH BURNED OUT!', true, 2.5);
          }
        }
        if (input.hit('Space') && player.wood > 0) { player.lightTorch(); audio.ignite(); }
        if (near(player, items.fireplace)) {
          hud.setPrompt(player.torchLit ? '[E] LIGHT FIREPLACE' : 'YOU NEED A FLAME...');
          if (player.torchLit && input.hit('KeyE')) this.lightFireplace();
        }
        if (wendigo.reached(player)) this.gameOver('THE DARK TOOK YOU.');
        break;

      case PHASE.COMPLETE:
        if (near(player, items.workbench)) {
          hud.setPrompt('[E] EXAMINE WORKBENCH');
          if (input.hit('KeyE')) {
            blueprint.open(() => {
              this.benchSeen = true;
              audio.pickup();
              hud.setBanner('PARTS 0/5 — THE HUNT BEGINS… (END OF SLICE)');
              hud.setObjective('FIND THE 5 PARTS OF THE WENDIGO KILLER');
            });
          }
        }
        break;

      case PHASE.GAMEOVER:
        if (input.hit('KeyE')) this.retry();
        break;
    }

    if (this.phase !== PHASE.DUSK && MOVABLE.includes(this.phase) && near(player, items.journal) && !hud.prompt.textContent) {
      hud.setPrompt('[E] READ JOURNAL');
      if (input.hit('KeyE')) journal.open();
    }

    hud.setTorch(player.torchLit, player.torchTime / player.torchMax);
    hud.setWood(player.wood, this.phase === PHASE.IGNITION || this.phase === PHASE.HUB);
  }

  enterDread() {
    const { audio, map, hud } = this.g;
    this.journalRead = true;
    audio.stopMusic();
    audio.startWind();
    audio.startGrowl();
    audio.creak();
    map.doorLocked = false;
    this.phase = PHASE.DREAD;
    hud.setObjective('SOMETHING IS OUTSIDE...');
  }

  startCutscene() {
    const { audio, hud, player } = this.g;
    this.phase = PHASE.CUTSCENE;
    this.cutT = 0;
    hud.setObjective('');
    hud.setPrompt('');
    hud.setBanner('');
    audio.setWind(0);
    audio.setGrowl(0.55);
    this.checkpoint = { x: player.x, y: player.y };

    const overlay = document.getElementById('cutscene');
    const video = document.getElementById('cutsceneVideo');
    overlay.classList.remove('hidden');
    video.currentTime = 0;
    video.muted = !audio.sfxOn;
    video.onended = () => this.finishCutscene();
    video.onerror = () => this.finishCutscene();
    const p = video.play();
    if (p) {
      p.catch(() => {
        video.muted = true;
        video.play().catch(() => this.finishCutscene());
      });
    }
  }

  finishCutscene() {
    if (this.phase !== PHASE.CUTSCENE) return;
    const overlay = document.getElementById('cutscene');
    const video = document.getElementById('cutsceneVideo');
    video.onended = null;
    video.onerror = null;
    video.pause();
    video.currentTime = 0;
    overlay.classList.add('hidden');
    this.g.audio.setWind(0.22);
    this.enterIgnition();
  }

  enterIgnition() {
    const { items, wendigo, hud, player } = this.g;
    this.phase = PHASE.IGNITION;
    this.revealing = true; this.reveal = 1;
    items.wood.visible = true;
    player.wood = 0; player.torchLit = false;
    wendigo.spawn('stalk');
    hud.setBanner('LIGHT A TORCH! IT IS COMING UP THE STAIRS.', true, 2.5);
    hud.setObjective('GRAB THE WOOD ON THE FAR LANDING!');
  }

  ignite() {
    const { audio, wendigo, hud } = this.g;
    audio.ignite(); audio.shriek();
    audio.setGrowl(0);
    wendigo.flee();
    this.g.shake = 0.5;
    hud.setBanner('');
    hud.setObjective("THIS TORCH WON'T LAST LONG. GET INSIDE.");
    this.phase = PHASE.HUB;
  }

  lightFireplace() {
    const { audio, hud, player, wendigo } = this.g;
    this.fireLit = true;
    player.torchLit = false;
    wendigo.active = false;
    audio.ignite(); audio.setGrowl(0); audio.setWind(0.06);
    setTimeout(() => audio.startMusic(), 1200);
    hud.setBanner('WATCHTOWER 4 IS SAFE', false, 3);
    hud.setObjective("EXAMINE CARL'S WORKBENCH");
    this.phase = PHASE.COMPLETE;
  }

  gameOver(msg) {
    const { audio, hud } = this.g;
    this.phase = PHASE.GAMEOVER;
    audio.shriek(); audio.setGrowl(0);
    hud.setBanner(''); hud.setPrompt('');
    document.getElementById('gameoverMsg').textContent = msg;
    document.getElementById('gameover').classList.remove('hidden');
  }

  retry() {
    const { player } = this.g;
    document.getElementById('gameover').classList.add('hidden');
    player.x = this.checkpoint.x; player.y = this.checkpoint.y;
    this.enterIgnition();
  }
}
