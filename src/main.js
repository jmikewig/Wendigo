// The Wendigo — vertical slice bootstrap & game loop.
import { Input } from './engine/input.js';
import { Lighting } from './engine/lighting.js';
import { AudioEngine } from './engine/audio.js';
import { Director, PHASE } from './engine/stateMachine.js';
import { Player } from './entities/player.js';
import { Wendigo } from './entities/wendigo.js';
import { createInteractables } from './entities/interactables.js';
import { HUD, drawArrow } from './UI/hud.js';
import { JournalModal } from './UI/journalModal.js';
import { BlueprintModal } from './UI/blueprintModal.js';
import { TouchControls } from './UI/touchControls.js';
import { WatchtowerMap, CABIN, WORLD_W, WORLD_H } from './world/watchtowerMap.js';

const W = 480, H = 270;                       // 16:9 viewport
const OX = (W - WORLD_W) / 2, OY = (H - WORLD_H) / 2; // fixed camera, tower centered
const FG_SPLIT_Y = 204;                       // canvas Y between open door bottom and bottom railing
const FRONT_DECK_Y = 195;                     // world foot Y separating cabin/upper deck from bottom deck

const ASSET_PATHS = {
  base1: './Assets/environment/watchtower_base_state1.png',
  base2: './Assets/environment/watchtower_base_state2.png',
  base3: './Assets/environment/watchtower_base_state3.png',
  base3a: './Assets/environment/watchtower_base_state3a.png',
  base4: './Assets/environment/watchtower_base_state4.png',
  base5: './Assets/environment/watchtower_base_state5.png',
  fg1: './Assets/environment/watchtower_foreground_state1.png',
  fg2: './Assets/environment/watchtower_foreground_state2.png',
  fg3: './Assets/environment/watchtower_foreground_state3.png',
  fg4: './Assets/environment/watchtower_foreground_state4.png',
  rangerUnlit: './Assets/sprites/ranger_unlit_sheet.png',
  rangerTorch: './Assets/sprites/ranger_torch_sheet.png',
  wendigoWalk: './Assets/sprites/wendigo_walk_sheet.png',
  wendigoCharge: './Assets/sprites/wendigo_charge_sheet.png',
  fireplaceFire: './Assets/sprites/fireplace_fire_sheet.png',
};

function loadAssets() {
  const entries = Object.entries(ASSET_PATHS).map(([key, src]) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve([key, img]);
      img.onerror = () => reject(new Error(`Failed to load asset: ${src}`));
      img.src = src;
    })
  );
  return Promise.all(entries).then(Object.fromEntries);
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

function lightState(g, dir, t) {
  const p = g.player;
  const lights = [];

  if (p.torchLit) {
    const fade = Math.min(1, p.torchTime / 3);
    const flick = Math.sin(t * 17) * 3 + Math.sin(t * 7.3) * 2;
    lights.push({
      x: p.x,
      y: p.y - 16,
      r: 44 + 16 * fade + flick,
      alpha: 0.24 * (0.5 + 0.5 * fade),
    });
  }

  if (dir.fireLit) {
    lights.push({
      x: 139,
      y: 76,
      r: 96 + Math.sin(t * 7) * 5,
      alpha: 0.18,
      clip: 'inside',
    });
  } else {
    lights.push({
      x: 70,
      y: 122,
      r: 28 + Math.sin(t * 5) * 1.5,
      alpha: 0.08,
      clip: 'inside',
    });
  }

  return { ox: OX, oy: OY, cabin: CABIN, lights };
}

function render(g, dir, t) {
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  if (g.shake > 0) ctx.translate((Math.random() - 0.5) * 6 * g.shake, (Math.random() - 0.5) * 6 * g.shake);
  ctx.fillStyle = '#000';
  ctx.fillRect(-8, -8, W + 16, H + 16);

  if (dir.phase === PHASE.CUTSCENE) {
    ctx.restore();
    return;
  }

  // 1. Base Layer
  g.map.renderBase(ctx, dir, W, H);

  // 2. Animated Fireplace (State 4 only)
  if (dir.fireLit) g.map.renderFireplaceFire(ctx, t);

  // 3. Entity Layer (Y-sorted by foot Y-coordinate, split around cabin/door vs bottom railing)
  const entities = [];
  if (!dir.sleeping) entities.push({ y: g.player.y, draw: (c) => g.player.render(c, t) });
  if (g.wendigo.active) entities.push({ y: g.wendigo.y, draw: (c) => g.wendigo.render(c, t) });
  entities.sort((a, b) => a.y - b.y);

  const drawEntities = (list) => {
    if (!list.length) return;
    ctx.save();
    ctx.translate(OX, OY);
    list.forEach((e) => e.draw(ctx));
    ctx.restore();
  };

  drawEntities(entities.filter((e) => e.y < FRONT_DECK_Y));

  // 4a. Upper Foreground Depth Overlay (skipped while sleeping so hat on wall stays visible)
  if (!dir.sleeping) g.map.renderForegroundUpper(ctx, dir, W, H, FG_SPLIT_Y);

  // 4b. Front Deck Entities (pass in front of open door & cabin wall)
  drawEntities(entities.filter((e) => e.y >= FRONT_DECK_Y));

  // 4c. Lower Foreground Depth Overlay (bottom deck railing)
  if (!dir.sleeping) g.map.renderForegroundLower(ctx, dir, W, H, FG_SPLIT_Y);

  // 5. Dynamic Lighting
  g.lighting.render(ctx, lightState(g, dir, t));

  // Guidance arrow above the lighting pass
  const tgt = dir.target();
  if (tgt && !g.journal.isOpen && !g.blueprint.isOpen) {
    ctx.save();
    ctx.translate(OX, OY);
    drawArrow(ctx, tgt.x, tgt.ay ?? tgt.y, t);
    ctx.restore();
  }

  ctx.restore();
}

loadAssets().then((assets) => {
  const audio = new AudioEngine();
  const g = {
    input: new Input(),
    audio,
    map: new WatchtowerMap(assets),
    player: new Player(132, 130, assets),
    wendigo: new Wendigo(assets),
    items: createInteractables(),
    hud: new HUD(),
    journal: new JournalModal(audio),
    blueprint: new BlueprintModal(audio),
    lighting: new Lighting(W, H),
    shake: 0,
  };
  const dir = new Director(g);
  g.director = dir;
  const touch = new TouchControls(g.input);

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    dir.update(dt);
    touch.sync(dir, g);
    g.shake = Math.max(0, g.shake - dt);
    render(g, dir, t);
    g.input.endFrame();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
});
