// Workbench blueprint: the Wendigo Killer schematic with 5 part slots.
const PARTS = ['FUEL TANK', 'PRESSURE PUMP', 'FEED HOSE', 'BARREL', 'IGNITER'];

export class BlueprintModal {
  constructor(audio) {
    this.audio = audio;
    this.el = document.getElementById('blueprint');
    this.list = document.getElementById('bpParts');
    this.count = document.getElementById('bpCount');
    this.isOpen = false;
    this.found = new Set();
  }

  open(onClose) {
    this.onClose = onClose;
    this.isOpen = true;
    this.list.innerHTML = PARTS.map((p, i) =>
      `<li class="${this.found.has(i) ? 'got' : ''}"><span class="num">${i + 1}</span>${p}<em>${this.found.has(i) ? 'INSTALLED' : 'MISSING'}</em></li>`
    ).join('');
    this.count.textContent = `PARTS ${this.found.size}/5`;
    this.el.classList.remove('hidden');
    this.audio.page();
  }

  close() {
    this.isOpen = false;
    this.el.classList.add('hidden');
    this.audio.page();
    const cb = this.onClose; this.onClose = null;
    cb?.();
  }

  handleInput(input) {
    if (input.hit('KeyE', 'Escape')) this.close();
  }
}
