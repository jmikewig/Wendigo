# 🌲 The Wendigo

**A Retro 8-Bit Survival Horror Game**
*Developed by Michael & Liam*

---

## 📖 1. Game Overview & Lore

### The Premise
*The Wendigo* is a top-down, 2D 8-bit survival horror game designed for a ~1-hour playthrough. The player assumes the role of a newly hired fire ranger deployed to a remote national park, specifically assigned to Watchtower 4. 

### The Antagonist: The Wendigo
An ancient, relentless woodland creature that stalks the player. It operates strictly in the dark and possesses a severe aversion to fire. As the game progresses, its aggression, speed, and stalking capabilities increase.

### The Lore: Crazy Carl & The Wendigo Killer
The previous occupant of Watchtower 4 was a ranger known as "Crazy Carl." Carl discovered the truth about the Wendigo and engineered a custom flamethrower dubbed the **Wendigo Killer** to destroy it. However, before Carl could execute his plan, the Wendigo infiltrated the workshop, dismantled the weapon into 5 distinct parts, and scattered them across various perilous outposts within the forest. 

**The Objective:** The player must survive the night, manage light and fire resources, explore the park to retrieve all 5 flamethrower parts, assemble the weapon at the Watchtower 4 workbench, and vanquish the Wendigo to escape the forest at dawn.

---

## 🕹️ 2. Core Gameplay Mechanics

### View & Visibility (Fog of War)
* **Perspective:** 2D top-down perspective (overhead).
* **Dynamic Lighting:** The environment is shrouded in pitch-black darkness. The player emits a localized, circular field of light when holding a torch.
* **Line of Sight:** Elements outside the torch's radius remain completely hidden (Fog of War).

### Fire & Resource Management (The Core Loop)
* **The Threat:** The Wendigo attacks when the player is engulfed in darkness. Fire is the only deterrent.
* **Torch Timer:** The player's active torch possesses a countdown timer (e.g., 15 seconds). 
* **Recharge Mechanic:** The player must press `[SPACEBAR]` to reset the torch timer. Doing so consumes **1 piece of Wood** from the inventory.
* **The Penalty:** If the timer reaches zero, the player is plunged into darkness, granting the Wendigo a massive speed boost to trigger a game-over charge.
* **Safe Zones:** Lighting specific fireplaces (like the one in Watchtower 4) establishes permanent safe zones.

---

## 🎒 3. Economy & Inventory System

The game opens with an RPG-style resource management phase. The player starts in a small, isolated town and must spend a starting budget on Main Street before entering the park. 

### Backpack Tiers & Capacity
The player's backpack dictates how many resources (Wood and Flamethrower Parts) they can carry. Flamethrower parts are heavy quest items that consume a massive amount of space (equivalent to 6 wood slots).

| Tier | Total Slots | Carry Configurations (Wood / Parts) |
| :--- | :--- | :--- |
| **Basic Backpack** | 6 Slots | • 6 Wood <br> • 1 Flamethrower Part (0 Wood) |
| **Good Backpack** | 9 Slots | • 9 Wood <br> • 1 Flamethrower Part + 3 Wood |
| **Great Backpack** | 12 Slots | • 12 Wood <br> • 1 Flamethrower Part + 6 Wood <br> • 2 Flamethrower Parts (0 Wood) |

### Additional Gear
* **Ax (Basic / Good / Great):** Determines the speed of chopping wood and potential melee knockback.
* **Food / Provisions:** Purchased at the local diner. Restores stamina and health early in the game before the player must resort to foraging.

---

## 🎬 4. The Intro & Tutorial Sequence (Step-by-Step)

The introduction seamlessly blends lore delivery, a jump-scare, and a mechanical tutorial.

### Phase 1: The Safe (Dusk) Exploration
* **Scene:** Player enters Watchtower 4. The room is bathed in dim, purple/orange dusk light. 
* **Action:** A pulsing, pixelated downward arrow floats over a journal on a desk. The player presses `[E]` to read it.
* **Lore Drop:** The journal reveals Crazy Carl’s final entry regarding the Wendigo Killer and the 5 scattered parts.

### Phase 2: The Sound of Dread
* **Trigger:** The player closes the journal. Background music halts.
* **Atmosphere:** A low, ominous, shifting wind/growl begins. 
* **Direction:** The arrow moves to the door leading to the outdoor deck. The growling intensifies as the player approaches.

### Phase 3: The Exterior Deck & Cutscene
* **Action:** The player steps out onto the deck. The darkness is oppressive. The arrow points to the railing.
* **Cutscene Trigger:** Reaching the railing locks player control and initiates the cinematic:
    1.  *Side Profile:* The camper looks over the wooden railing.
    2.  *Bird's-Eye Whip-Pan:* The camera snaps to a top-down view looking straight down the staircase. In the darkness at the base stands the Wendigo, looking up, its yellow eyes glowing.

### Phase 4: The Emergency Ignition (Tutorial)
* **Alert:** `LIGHT A TORCH! IT IS COMING UP THE STAIRS.`
* **Action:** An arrow highlights a piece of wood on the deck. The player collects it.
* **Ignition:** The prompt `PRESS [SPACEBAR] TO LIGHT TORCH` appears. The player taps it, erupting a warm circle of light.
* **Relief:** The Wendigo shrieks and vanishes. The noise fades. A red **Torch Bar** appears on the HUD, slowly depleting.

### Phase 5: Establishing the Hub
* **Objective:** `THIS TORCH WON'T LAST LONG. GET INSIDE.`
* **Action:** The player follows the arrow to the interior fireplace, lighting it to permanently illuminate Watchtower 4. 
* **Reveal:** The bright room reveals the **Flamethrower Blueprint** and the **Assembly Workbench**, setting the stage for the main quest.

---

## 🖼️ 5. Visual Asset References

*All concept art, original sketches, and final pixel graphics are stored locally in the project repository.*

### Original Concepts & Storyboards
* **Original Wendigo Villain Sketch:** `Wendigo - Villian Sketch.jpeg`
  ![Wendigo Villain Sketch](Wendigo%20-%20Villian%20Sketch.jpeg)
* **Original Storyboard Sketch:** `Wendigo - Sketch.jpeg`
  ![Storyboard Sketch](Wendigo%20-%20Sketch.jpeg)

### Pixel Art & Gameplay Mockups
* **Early Pixel Art Iteration Grid:** `Wendigo - Early Iteration.png`
  ![Early Iteration](Wendigo%20-%20Early%20Iteration.png)
* **Final Wendigo Sprite Concept (Cover Image):** `Wendigo - Cover Image.png`
  ![Wendigo Cover Image](Wendigo%20-%20Cover%20Image.png)
* **Watchtower 4 Intro & Deck Cutscene Storyboard:** `Wendigo - Gameplay Scenes.png`
  ![Watchtower Gameplay Scenes](Wendigo%20-%20Gameplay%20Scenes.png)
* **Overhead "Fog of War" Gameplay Concept:** `Wendigo - Gameplay Scenes v2.png`
  ![Overhead Gameplay Scenes v2](Wendigo%20-%20Gameplay%20Scenes%20v2.png)

---

## 🎥 6. Cinematics & Video Generation Prompt

For generating the 8-bit opening cutscene in Veo, use the following prompt:

> `8-bit pixel art animation, dark retro horror cutscene. Side-profile view of a park ranger on a wooden watchtower balcony looking over the railing into pitch black forest. Quick camera whip-pan to top-down bird's-eye perspective looking straight down the staircase. At the base of the stairs in total darkness, a tall bipedal Wendigo creature with a deer skull head, antlers, exposed ribcage, and subtly glowing yellow eyes looks straight up. Atmospheric fog, flickering moonlight, 16-bit color palette.`

---

## 📂 7. Proposed Code Architecture

```text
whispering-pines/
├── README.md
├── index.html
├── src/
│   ├── main.js             # Core game loop & state machine
│   ├── player.js           # Movement (WASD), health, stamina
│   ├── inventory.js        # Backpack slots, wood logic, flamethrower parts
│   ├── lighting.js         # Fog of war rendering, torch timer, spacebar tap
│   ├── wendigoAI.js        # Aggression scaling, pathfinding in darkness
│   └── environment.js      # Map generation, watchtower hub, outposts
└── assets/
    ├── concept_art/
    │   ├── Wendigo - Villian Sketch.jpeg
    │   ├── Wendigo - Sketch.jpeg
    │   ├── Wendigo - Early Iteration.png
    │   ├── Wendigo - Cover Image.png
    │   ├── Wendigo - Gameplay Scenes.png
    │   └── Wendigo - Gameplay Scenes v2.png
    ├── sprites/
    ├── audio/
    └── cutscenes/