// Crazy Carl's journal reader.
const PAGES = [
  `<h3>WATCHTOWER 4 — LOG</h3>
   <p>Day 212. Whoever finds this: you're the new ranger. Sorry.</p>
   <p>They call me Crazy Carl down in town. Let 'em. I know what walks these woods after sundown.</p>
   <p class="scrawl">It hates the light. It hates FIRE more.</p>`,
  `<h3>THE WENDIGO KILLER</h3>
   <p>I built it. Propane, copper, a pump off the old fire truck. A flamethrower that could end it for good.</p>
   <p>Last night it got into the workshop. It didn't destroy the Killer — it took it apart. Five pieces. Hid them at the outposts.</p>
   <p class="scrawl">It's smart. It's patient. It WANTS me to go out there.</p>`,
  `<h3>IF YOU'RE READING THIS</h3>
   <ul>
     <li>Never let your torch burn out.</li>
     <li>Keep wood on you. Always.</li>
     <li>Light the fireplace. It won't come in where it's bright.</li>
     <li>Find all 5 parts. Build the Killer at my bench.</li>
   </ul>
   <p class="scrawl">It's at the bottom of the stairs again. I can hear it breathing.</p>`,
];

export class JournalModal {
  constructor(audio) {
    this.audio = audio;
    this.el = document.getElementById('journal');
    this.pageEl = document.getElementById('journalPage');
    this.numEl = document.getElementById('journalPageNum');
    this.isOpen = false;
    this.page = 0;
  }

  open(onClose) {
    this.onClose = onClose;
    this.isOpen = true;
    this.page = 0;
    this.el.classList.remove('hidden');
    this.audio.page();
    this._render();
  }

  close() {
    this.isOpen = false;
    this.el.classList.add('hidden');
    this.audio.page();
    const cb = this.onClose; this.onClose = null;
    cb?.();
  }

  handleInput(input) {
    if (input.hit('KeyE', 'Escape')) return this.close();
    if (input.hit('KeyD', 'ArrowRight') && this.page < PAGES.length - 1) { this.page++; this.audio.page(); this._render(); }
    if (input.hit('KeyA', 'ArrowLeft') && this.page > 0) { this.page--; this.audio.page(); this._render(); }
  }

  _render() {
    this.pageEl.innerHTML = PAGES[this.page];
    this.numEl.textContent = `PAGE ${this.page + 1}/${PAGES.length}`;
    const book = this.el.firstElementChild;
    book.style.animation = 'none'; void book.offsetWidth; book.style.animation = '';
  }
}
