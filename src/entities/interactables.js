// Interaction points in Watchtower 4 (world coords; ay = arrow anchor).
export function createInteractables() {
  return {
    journal: { x: 76, y: 152, ay: 158, r: 26, box: { x0: 88, x1: 108, y0: 132, y1: 173 }, visible: true },
    door: { x: 137, y: 186, ay: 180, r: 16, visible: true },
    railing: { x: 32, y: 214, ay: 208, r: 22, visible: true },  // top of the stairs (cutscene trigger)
    wood: { x: 24, y: 34, ay: 34, r: 16, visible: true },       // top-left landing
    fireplace: { x: 137, y: 92, ay: 86, r: 24, visible: true },
    workbench: { x: 82, y: 92, ay: 72, r: 24, visible: true },
    bed: { x: 199, y: 82, ay: 82, r: 28, box: { x0: 164, x1: 192, y0: 88, y1: 126 }, visible: true },
  };
}

export function near(player, item) {
  if (!item.visible) return false;
  if (item.box) {
    const b = item.box;
    return player.x >= b.x0 && player.x <= b.x1 && player.y >= b.y0 && player.y <= b.y1;
  }
  return Math.hypot(player.x - item.x, player.y - item.y) < item.r;
}
