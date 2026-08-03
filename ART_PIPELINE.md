# Anotherverse Pixel-Art Production Contract

Status: implementation-ready proposal for the post-v0.4 visual pass  
Audience: asset creator, gameplay/UI engineer, content designer, and playtest lead  
Scope: the three-hero management screen, compact auto-battle playback, dossiers, Bestiary, and
current four-operation slice

## 1. The recommended path

Use ordinary transparent PNG sprite strips inside the existing React/DOM battle stage. Do not add a
canvas renderer, animation library, tile engine, or runtime procedural-art system for this slice.
The simulation has already resolved the battle; art is a replay of structured `CombatEvent`s and is
never authoritative.

This is the shortest robust route because it preserves:

- exact React HP, status, and event readouts;
- keyboard and screen-reader semantics;
- deterministic replay, pause, and skip;
- GitHub Pages compatibility;
- CSS reduced-motion handling;
- graceful play when individual art files are missing.

The current gameplay direction exposes `.unit-sprite`, `data-combatant-id`, `data-role`,
`data-sprite-state`, `data-event-type`, and event classes such as `.stage-event-attack`. Those are
the integration seam. Animation timers only control presentation. They must never dispatch engine
commands or modify a `BattleReport`.

Use stable Calling IDs for generated heroes, not their generated character IDs. A hero named
`Rhea Sol` can be generated as any Calling, so `rhea-sol-1.png` would be an unstable asset key.
Resolve art in this order:

1. `character.callingId`, such as `storm-bastion`;
2. the role fallback, such as `role-vanguard`;
3. the built-in CSS silhouette.

Enemies already have stable IDs and can resolve directly by ID.

## 2. Visual target

Anotherverse should look like an original modern progression-fantasy operations game rendered in
restrained, high-contrast pixel art. The world combines contemporary civic infrastructure with
breach phenomena, licensed combat equipment, living relics, and readable supernatural geometry.
It should not look medieval, parchment-led, chibi-comedic, or like a direct recreation of a named
game, comic, show, artist, or character.

The art must improve tactical legibility before spectacle:

- A vanguard reads as wide, planted, and protective at thumbnail size.
- A striker reads as narrow, forward, and directional.
- A support reads as upright, open, and surrounded by a tool, sigil, or companion shape.
- Chargers read low and front-heavy.
- Hexers read tall, suspended, or laterally spread.
- Heroes and enemies remain identifiable in silhouette with all colour removed.
- Attacks use one strong anticipation pose and one clear impact pose. Avoid constant noise.

### Palette anchors

Art may extend these into small ramps, but it should visibly belong to the existing interface:

| Purpose               | Anchor    |
| --------------------- | --------- |
| Near-black            | `#080a0f` |
| Graphite              | `#11151d` |
| Raised slate          | `#171c26` |
| Structural line       | `#28303d` |
| Muted text/steel      | `#8e99aa` |
| Bright neutral        | `#edf1f7` |
| Calling/breach accent | `#57e5c3` |
| Vanguard              | `#65a9ff` |
| Striker               | `#ff7d86` |
| Support               | `#64dfad` |
| Enemy/danger          | `#ff6b76` |
| Warning/rank          | `#ffcb6b` |

Use at most 12 colours in one unit sprite, including transparency, and at most 24 visible colours in
one arena composition. Preserve a two-value separation between body, weapon/tool, and VFX. Do not
use role colour as the entire costume; reserve it for one readable accent so colour-blind players
still have silhouette and labels.

## 3. Pixel dimensions and export rules

All dimensions below are source pixels, not CSS pixels.

| Asset                         |      Source canvas | Format      | Notes                               |
| ----------------------------- | -----------------: | ----------- | ----------------------------------- |
| Unit animation frame          |          `64 x 64` | RGBA PNG    | One character or enemy per cell     |
| Unit strip                    | `frames * 64 x 64` | RGBA PNG    | Horizontal, no gaps or gutters      |
| Event VFX frame               |          `96 x 96` | RGBA PNG    | Centred over a unit or impact point |
| Event VFX strip               | `frames * 96 x 96` | RGBA PNG    | Horizontal, no baked numbers/text   |
| Hero/enemy portrait           |          `96 x 96` | RGBA PNG    | Head-and-shoulders, transparent     |
| Equipment icon                |          `32 x 32` | RGBA PNG    | One object, transparent             |
| Technique/status/control icon |          `24 x 24` | RGBA PNG    | One glyph, transparent              |
| Arena backdrop                |        `320 x 180` | PNG, opaque | Single 16:9 plate per encounter     |
| Optional arena foreground     |        `320 x 180` | RGBA PNG    | Sparse occlusion only               |
| World/city plate              |        `320 x 180` | PNG, opaque | Creation and non-combat ambience    |
| Faction crest                 |          `64 x 64` | RGBA PNG    | No letters or small text            |
| Future tile cell              |          `16 x 16` | RGBA PNG    | Deferred; not used by this slice    |
| Future tile sheet             |        `128 x 128` | RGBA PNG    | `8 x 8` cells, no gaps              |

PNG requirements:

- Use straight alpha and sRGB colour. Remove colour-profile surprises on export.
- Transparent pixels must have RGB `0,0,0` to avoid coloured fringes.
- No antialiasing, subpixel edges, JPEG artefacts, soft outer glows, or semi-transparent outline
  pixels. VFX may use deliberate stepped opacity.
- Strips run left to right in playback order. Frame 0 must be a valid poster frame.
- Every `64 x 64` unit frame uses the same foot anchor at pixel `(32, 58)`.
- Leave at least two clear pixels around the frame edge. VFX and projectiles are separate assets.
- Do not bake shadows, HP bars, names, damage numbers, status labels, or screen flashes into a unit.
- Author all units facing screen-right. Mirror only the enemy sprite inner element in CSS. Never flip
  the entire readout or VFX wrapper.
- Avoid readable writing, crests, and strongly asymmetric hand-specific symbols in sprites that will
  be mirrored. Portraits and faction crests are not mirrored.

Backdrops are deliberately plates rather than a tile map. The prototype has no explorable map, and
a tile engine would add cost without improving this loop. The `16 x 16` tile convention exists only
for a later map or procedural arena compositor; do not generate tiles in the first asset batches.

## 4. Animation contract

The current battle playback advances one highlight every `520 ms`. Required one-shot animations
finish within that beat. Idle may loop continuously. A remounted event element restarts its CSS
`steps()` animation.

### Required states for Batch 1

| State    | Frames | Frame time |    Total | Loop           | Poster frame |
| -------- | -----: | ---------: | -------: | -------------- | -----------: |
| `idle`   |      4 |   `180 ms` | `720 ms` | yes            |            0 |
| `attack` |      6 |    `80 ms` | `480 ms` | no             |            0 |
| `hurt`   |      3 |   `100 ms` | `300 ms` | no             |            1 |
| `down`   |      5 |    `96 ms` | `480 ms` | no; hold final |            4 |

Keep idle movement to one or two pixels: breathing, cloth settling, controlled relic pulse, or a
single electrical arc. The attack impact/contact pose is frame 4 of 6 so an event VFX can begin at
`320 ms`. Hurt must be a readable recoil, not graphic injury. Down ends as a stable non-graphic
silhouette and does not flicker or disappear.

### Expansion states for Batch 2

| State     | Frames | Frame time |    Total | Used for                                  |
| --------- | -----: | ---------: | -------: | ----------------------------------------- |
| `skill`   |      6 |    `80 ms` | `480 ms` | heal, status, resource, ranged techniques |
| `guard`   |      4 |   `120 ms` | `480 ms` | guard and interception                    |
| `victory` |      4 |   `160 ms` | `640 ms` | result loop or held final pose            |
| `enter`   |      4 |   `100 ms` | `400 ms` | optional first reveal only                |

Missing-state fallback is deterministic: `skill -> attack`, `guard -> idle`, `victory -> idle`,
`enter -> idle`, and any unknown state becomes `idle`.

### Playback mapping

| Structured event | Actor state | Target state                      | VFX cue                             |
| ---------------- | ----------- | --------------------------------- | ----------------------------------- |
| `attack`         | `attack`    | `hurt`, then `down` if HP is zero | `event-attack` at `320 ms`          |
| `heal`           | `skill`     | `idle`                            | `event-heal` around target          |
| `guard`          | `guard`     | `idle`                            | `event-guard` around protected unit |
| `status`         | `skill`     | `hurt` only when harmful          | `event-status` plus status icon     |
| `interrupt`      | `attack`    | `hurt`                            | `event-interrupt` at `240 ms`       |
| `defeat`         | `idle`      | `down`                            | `event-defeat`, restrained          |
| `resource`       | `skill`     | `idle`                            | `event-resource` around actor       |

The gameplay component currently exposes presentation states `acting`, `hit`, `healed`, `down`, and
`idle`. Its art resolver should combine that state with `event.eventType` to select the rows above.
Animations show only events present in the authoritative report. Do not infer extra hits, targets,
projectiles, status applications, or combo attacks from art.

## 5. VFX layers

VFX sit above the unit sprite and below the number/status cue. Keep each effect to six `96 x 96`
frames at `80 ms` per frame unless noted.

Required event strips:

- `event-attack`: sharp white/role-colour impact, no blood;
- `event-heal`: rising teal-green lattice, open centre so the unit stays visible;
- `event-guard`: blue-white segmented barrier arc;
- `event-status`: amber/magenta geometric lock-on ring;
- `event-interrupt`: broken cyan timing line with one hard stop frame;
- `event-defeat`: low-opacity fragments falling inward, never an explosion;
- `event-resource`: three restrained motes entering the actor's tool or weapon.

Required status icons, mapped to live engine IDs:

| Status ID   | Shape language           | Colour-independent cue |
| ----------- | ------------------------ | ---------------------- |
| `warded`    | nested shield/hexagon    | closed double outline  |
| `exposed`   | split armour plate       | central fracture       |
| `staggered` | displaced chevrons       | two offset feet/lines  |
| `strained`  | compressed diamond       | inward pressure marks  |
| `inspired`  | rising three-point flare | upward centre arrow    |
| `marked`    | reticle with open notch  | target ring and notch  |

Status tint is helpful but the icon and visible text remain authoritative. Do not produce continuous
screen particles for persistent statuses. A static `24 x 24` badge plus one apply/remove burst is
enough.

## 6. Stable asset mapping

### Heroes: key by Calling ID

Generated character IDs and names change with the campaign seed. These nine Calling IDs are stable
and appear in `src/engine/generation/campaign.ts`.

| Calling ID           | Role     | Distinct silhouette and prop                         |
| -------------------- | -------- | ---------------------------------------------------- |
| `iron-echo`          | vanguard | broad round shield, resonant iron ring, planted coat |
| `anchor-saint`       | vanguard | spectral anchor head and short chain, tall mantle    |
| `storm-bastion`      | vanguard | slab guard and forked lightning rod, swept coat      |
| `vector-edge`        | striker  | single angular blade and visible trajectory rail     |
| `red-interval`       | striker  | paired segmented short blades and split scarf        |
| `comet-thread`       | striker  | thread-blade spool and long diagonal comet line      |
| `quiet-lattice`      | support  | compact sigil projector and square lattice halo      |
| `mercy-engine`       | support  | asymmetric portable engine and rounded recovery arm  |
| `spirit-switchboard` | support  | talisman board with two small spirit sockets         |

Create fallback sets named `role-vanguard`, `role-striker`, and `role-support` before Calling-specific
sets. They guarantee that every generated seed is visually complete while Calling art is produced.
The fallback is a deliberately anonymous licensed operative, not a lower-quality grey blob.

### Enemies: key directly by enemy ID

| Enemy ID          | Policy  | Distinct silhouette and readable counterplay           |
| ----------------- | ------- | ------------------------------------------------------ |
| `rift-hound`      | charger | glass-backed wedge quadruped; exposed chest seam       |
| `glass-weaver`    | hexer   | wide six-leg silica colony; high fragile core          |
| `storm-jackal`    | charger | narrow electric quadruped; unstable rear landing arc   |
| `signal-leech`    | hexer   | low parasite body with two upward telemetry tendrils   |
| `ironback-mauler` | charger | massive plated forequarters; visible gaps after charge |
| `veil-scribe`     | hexer   | thin suspended signage organism with quill-like limbs  |
| `survey-beast`    | charger | conditioned broad beast with obvious sensor collar     |
| `mirror-oracle`   | hexer   | hovering reflective colony anchored around a dark core |

Enemy readability must agree with ecology and counterplay already shown in the Bestiary. Do not give
a fragile hexer a heavier visual mass than `ironback-mauler`, and do not hide the Survey Beast's
observer/handling apparatus.

### Arenas: key by encounter ID

| Encounter ID             | File key                 | Required scene                                                   |
| ------------------------ | ------------------------ | ---------------------------------------------------------------- |
| `m1-glassline-breach`    | `m1-glassline-breach`    | damaged transit concourse, glass pressure seam, evacuation route |
| `m4-east-junction`       | `m4-east-junction`       | civic power junction, storm-lit relay pylons, branching lanes    |
| `m4-split-concourse`     | `m4-split-concourse`     | narrow split rail line, broken route records/signage             |
| `m4-closure-under-watch` | `m4-closure-under-watch` | surveyed closure platform, distant observers and audit devices   |

Keep the middle 45% of each arena relatively quiet so the action card and VFX stay readable. The
hero side is left, enemy side is right. Environmental lighting may point toward the breach, but the
backdrop must not contain combatants or imply an outcome.

### World plates and narrative motifs

Art must use structured IDs rather than trying to parse generated prose. Current stable world keys:

| World pack     | City/motif                                                  | Faction motif                                          |
| -------------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| `lumen-port`   | rebuilt transit, pre-Cascade records, luminous harbour haze | Meridian survey instruments and sealed archives        |
| `vanta-cross`  | public ranking displays, overlooked vertical districts      | Crownless academy tags and unsponsored training spaces |
| `halcyon-ward` | sealed infrastructure and waking living relics              | Quiet Survey barriers and concealed excavation marks   |
| `cinder-bay`   | industrial bay and illegal breach harvesting                | Ashline extraction frames and corporate containment    |

Future narrative bindings should expose `locationId`, `factionId`, `propId`, `castIds`, and
`threatIds`. The art layer can then select a world plate, crest, prop vignette, portraits, and enemy
silhouettes without inventing facts. Until those fields exist, non-combat situations should use the
current world plate plus a category emblem rather than a guessed bespoke illustration.

Current situation keys are `operation-1..4`, `personal-1..4`, `discovery-1..4`, `rival-1..4`, and
`social-1..4`. Produce one `24 x 24` category emblem for each category; do not make 20 bespoke scene
illustrations before the narrative bindings are coherent.

### Technique, equipment, and control icons

These IDs exist now and should be used as filenames:

- Techniques: `aegis-break`, `hold-the-line`, `arc-finish`, `cross-step`,
  `restorative-sigil`, `binding-shot`.
- Equipment: `houndglass-edge`, `weaver-ward`.
- Stances: `aggressive`, `guarded`, `tactical`, `supportive`.
- Team priorities: `focus-weakest`, `protect-rear`, `break-threat`, `conserve-power`.
- Roles: `vanguard`, `striker`, `support`.
- Situation categories: `operation`, `personal`, `discovery`, `rival`, `social`.
- Rank emblems: `unranked`, `bronze`, `silver`, `gold`.
- Resource/UI: `hp`, `action-resource`, `readiness`, `supplies`, `reputation`, `threat`.

Calling aliases reuse the canonical technique icon plus a Calling-colour frame. For example,
`Anchor Fracture` and `Thunder Brace` both use the `aegis-break` rules icon; this communicates shared
mechanics and avoids false content diversity.

## 7. Folder and naming manifest

Place production files under Vite's public directory and keep a versioned root:

```text
public/
  assets/art/v1/
    manifest.json
    units/
      heroes/
        role-vanguard/{idle,attack,hurt,down}.png
        role-striker/{idle,attack,hurt,down}.png
        role-support/{idle,attack,hurt,down}.png
        iron-echo/{idle,attack,hurt,down,skill,guard,victory}.png
        anchor-saint/...
        storm-bastion/...
        vector-edge/...
        red-interval/...
        comet-thread/...
        quiet-lattice/...
        mercy-engine/...
        spirit-switchboard/...
      enemies/
        rift-hound/{idle,attack,hurt,down}.png
        glass-weaver/...
        storm-jackal/...
        signal-leech/...
        ironback-mauler/...
        veil-scribe/...
        survey-beast/...
        mirror-oracle/...
    portraits/
      heroes/{calling-id}.png
      enemies/{enemy-id}.png
    arenas/
      {encounter-id}/bg.png
      {encounter-id}/fg.png
    worlds/{world-pack-id}.png
    factions/{world-pack-id}.png
    vfx/events/event-{event-type}.png
    icons/
      statuses/{status-id}.png
      techniques/{technique-id}.png
      equipment/{equipment-id}.png
      stances/{stance-id}.png
      priorities/{priority-id}.png
      roles/{role-id}.png
      categories/{category-id}.png
      ranks/{rank-id}.png
      ui/{resource-id}.png
```

Names are lowercase ASCII kebab-case. Do not add version numbers to individual filenames; increment
the root (`v2`) when the format changes. Optional `fg.png` is omitted rather than shipped empty.

Never form a URL as `/assets/...`; that breaks the repository subpath on GitHub Pages. Resolve with:

```ts
const artUrl = (path: string) => `${import.meta.env.BASE_URL}assets/art/v1/${path}`;
```

### Proposed manifest shape

The implementation should validate `manifest.json` once and cache it. A compact shape is enough:

```ts
type UnitState = 'idle' | 'attack' | 'hurt' | 'down' | 'skill' | 'guard' | 'victory' | 'enter';

interface SpriteStrip {
  path: string;
  frameWidth: 64 | 96;
  frameHeight: 64 | 96;
  frames: number;
  frameMs: number;
  loop: boolean;
  posterFrame: number;
}

interface UnitArt {
  states: Partial<Record<UnitState, SpriteStrip>>;
  portrait?: string;
}

interface ArtManifest {
  schemaVersion: 1;
  heroes: Record<string, UnitArt>;
  enemies: Record<string, UnitArt>;
  arenas: Record<string, { background: string; foreground?: string }>;
  vfx: Record<string, SpriteStrip>;
  icons: Record<string, string>;
}
```

Art metadata is presentation-only. Do not add it to canonical saves, combat reports, content hashes,
or deterministic state. Calling/enemy/encounter IDs in the save are sufficient to resolve the
current art pack.

## 8. Responsive rendering and accessibility

- Render the arena at `aspect-ratio: 16 / 9`, width `100%`, and keep unit positions as percentages
  of the stage. Never encode positions into the source backdrop.
- Use `image-rendering: pixelated` and `image-rendering: crisp-edges`. Scale the complete sprite
  element, not individual frames. Chunky clusters must remain readable at non-integer responsive
  scales.
- A unit should render between 52 and 80 CSS pixels tall. At mobile widths, preserve all five unit
  silhouettes and collapse labels before shrinking sprites below 48 CSS pixels.
- Animate only `transform`, `opacity`, and sprite background position. Do not animate layout, filter
  blur, width, height, or the HP number.
- Unit images use empty `alt` text because their adjacent DOM readout already gives the accessible
  name, role, and HP. The stage's live region announces the same authoritative action cue shown in
  text.
- Colour is never the only signal: actor/target outlines also use motion/shape, status badges include
  icons and labels, and defeated units retain the visible `Down` state.
- With `prefers-reduced-motion` or the in-game reduced-motion setting, show the result immediately or
  use poster frames only. Disable strip stepping, lunges, shakes, parallax, and particle movement.
- Do not flash the whole stage. No effect may alternate high-contrast states more than three times
  per second. Keep VFX below roughly 65% of the stage area and avoid rapid full-white frames.
- Do not rely on a sprite to explain mechanics. Exact HP, amount cues, action name, status text, and
  the collapsed full event log remain available.

## 9. Performance budget

| Budget                                      |                  Limit |
| ------------------------------------------- | ---------------------: |
| Art loaded for the current operation        |   `<= 2 MB` compressed |
| First meaningful battle art                 | `<= 1.5 MB` compressed |
| Complete v1 art directory                   |   `<= 8 MB` compressed |
| One unit strip                              |            `<= 160 KB` |
| One arena backdrop                          |            `<= 350 KB` |
| One portrait                                |             `<= 80 KB` |
| One icon                                    |             `<= 16 KB` |
| Simultaneously stepping sprite/VFX elements |                `<= 12` |
| DOM elements in the visual stage            |                `<= 80` |

Preload the current arena, three resolved hero sets, current enemies, and common event VFX after a
campaign is confirmed. Lazy-load portraits and Bestiary art when their drawer opens. Do not preload
all nine Callings and eight enemies. Cache successful and failed resolutions in memory so a missing
file does not trigger repeated network requests.

Use lossless PNG optimisation after export. Do not convert sprites to GIF or video. A texture atlas
across unrelated units is deliberately avoided: individual strips make lazy loading, replacement,
and fallback much simpler at this scale.

## 10. Fallback and failure handling

Art can never prevent a turn from resolving.

- Missing Calling: use the matching role fallback.
- Missing enemy: use the CSS enemy silhouette with its first letter and role shape.
- Missing state: follow the state fallback table in section 4.
- Missing arena: retain the current neutral CSS grid/gradient.
- Missing portrait: show the existing role accent and name initials.
- Missing VFX: show the existing amount/status cue with a restrained CSS outline pulse.
- Load error: mark that URL unavailable for the session; do not retry every event beat.
- Invalid manifest: log one development warning, ignore the art pack, and keep the stage playable.

The fallback must be testable by deliberately omitting an asset in a browser test. There should be
no broken-image glyph, layout shift, console-error loop, or inaccessible control.

## 11. Staged production workflow

### Stage A: style proof, no integration

1. Generate or draw one 512-pixel concept sheet for the role-vanguard, role-striker, role-support,
   Rift Hound, and Glass Weaver.
2. Review only silhouette, prop readability, palette, and clean-room originality.
3. Reduce/redraw each concept manually on the `64 x 64` grid. GenAI output is reference material,
   not a production-ready spritesheet.
4. Place all five idle sprites on the same Glassline mock stage at actual game size.
5. Reject the batch if names/labels are required to tell the three roles or two enemies apart.

### Stage B: first animated battle batch

Produce these assets first, in this order:

1. `arenas/m1-glassline-breach/bg.png`;
2. four required strips for each of `role-vanguard`, `role-striker`, `role-support`, `rift-hound`,
   and `glass-weaver` (`20` strips total);
3. five matching `96 x 96` portraits;
4. all seven generic event VFX strips;
5. the six live status icons;
6. technique icons for `aegis-break`, `hold-the-line`, `arc-finish`, `cross-step`,
   `restorative-sigil`, and `binding-shot`;
7. equipment icons for `houndglass-edge` and `weaver-ward`.

This batch makes the first operation fully visual for every generated campaign without waiting for
all nine Calling variants. It is the batch the user should generate now.

### Stage C: Calling identity

Replace role fallbacks with the nine Calling-specific sets. Approve idle silhouettes for all nine in
one contact sheet before animating any of them. Then produce `attack`, `hurt`, `down`, `skill`,
`guard`, `victory`, and the Calling portrait for one complete role family at a time.

### Stage D: complete encounter coverage

Produce the remaining six enemies and three arena plates. Test paired enemies together so charger
and hexer silhouettes never merge. Add optional foreground layers only after every backdrop works
without them.

### Stage E: world and management identity

Produce four world plates, four faction crests, five situation-category icons, stances, priorities,
roles, ranks, and resource icons. Add narrative scene illustrations only after scenarios expose
stable `locationId`, `factionId`, and `propId` bindings.

### Stage F: polish after playtest

Add secondary VFX, `enter`, subtle environmental animation, and portrait expressions only when the
strict gameplay tester confirms that battle intent, result, and counterplay are already clear. Do
not use art volume to mask an unclear decision or incoherent scenario.

## 12. Clean-room GenAI workflow and prompts

Do not absorb or reproduce existing fantasy titles “in whole.” That would conflict with the
project's clean-room requirement and would produce derivative, inconsistent assets. References may
be reduced to broad genre observations—compact silhouettes, contemporary fantasy equipment,
dramatic ability geometry, readable party roles—but prompts must not name a living artist, title,
franchise, studio, or character.

For every asset, save the prompt, seed/model/version, source concept, edited file, and final export
beside a production log outside the shipped folder. Check outputs for copied logos, readable text,
watermarks, malformed anatomy, inconsistent light direction, and stray semitransparent pixels.

### Character concept prompt template

```text
Create an original clean-room character concept for a modern progression-fantasy operations RPG.
This is a licensed [ROLE] operative with the Calling “[CALLING NAME]”. Their combat identity is
[SIGNATURE RULE IN PLAIN LANGUAGE]. Build the silhouette around [PRIMARY PROP] and [SECONDARY
SHAPE]. Contemporary technical clothing, practical weapon handling, restrained supernatural
geometry, no medieval armour, no cape wall, no logo, no letters, no text. Three-quarter side view
facing screen-right, full body, feet visible, neutral combat-ready pose. Strong silhouette at 64 by
64 pixels. Near-black and graphite base with [ROLE ACCENT] used sparingly. Original design; do not
imitate any named title, artist, franchise, or existing character. Plain transparent background.
Output a concept reference, not a final spritesheet.
```

### Enemy concept prompt template

```text
Create an original clean-room breach creature for a modern urban progression-fantasy RPG. Creature
ID: [ENEMY ID]. Ecology: [ECOLOGY]. Behaviour: [CHARGER OR HEXER]. Its signature action is
[SIGNATURE], and its readable weakness is [COUNTERPLAY]. Shape language: [SILHOUETTE BRIEF].
Three-quarter side view facing screen-right, entire body and contact point visible. Threatening but
non-graphic. Dark graphite body, small breach-light accents, at most 12 colours when translated to
pixel art. No text, logo, armour copied from human cultures, existing monster likeness, named title,
artist, franchise, or character. Plain transparent background. Output a concept reference, not a
final spritesheet.
```

### Arena prompt template

```text
Create an original 16:9 pixel-art arena plate for a modern progression-fantasy operations RPG.
Encounter: [ENCOUNTER]. Location: [LOCATION]. World motifs: [WORLD MOTIFS]. Hero deployment is on
the left and enemies on the right. Keep the central 45 percent quiet and high-contrast enough for
unit sprites and a compact action card. Contemporary civic infrastructure interrupted by precise,
geometric breach phenomena. No combatants, words, signage text, UI, logos, outcome clues, parchment,
or medieval architecture. One-point or shallow perspective, horizon near 40 percent height, light
from upper left, near-black graphite palette with restrained teal breach light. Original clean-room
composition; do not imitate a named title, artist, franchise, or existing location. Output at 320 by
180 source pixels with crisp pixel clusters and no antialiasing.
```

### Animation key-pose prompt template

```text
Using the approved original [UNIT ID] design, propose key poses for [STATE]: anticipation, action,
impact/recoil, and recovery. Side view facing screen-right, fixed feet anchor, constant scale and
costume, transparent background. Motion must read at 64 by 64 pixels and finish within 480 ms. No
motion blur, baked projectile, VFX, shadow, text, extra limb, camera change, or new costume detail.
Provide separated pose references for a human pixel artist to redraw and align; do not output a
packed final spritesheet.
```

### VFX prompt template

```text
Design an original six-frame pixel-art [EVENT TYPE] effect for a modern tactical RPG. A 96 by 96
transparent frame centred on the impact or target. Shape language: [SHAPE]. Palette anchors:
[COLOURS]. The effect peaks on frame 5 of 6 and fully clears by frame 6. Keep the centre readable,
avoid a full-frame white flash, blood, smoke clouds, text, numbers, logos, gradients, and references
to named titles or artists. Output separated key frames for manual pixel cleanup and strip export.
```

## 13. Integration sequence for engineering

1. Add and validate `public/assets/art/v1/manifest.json` without touching canonical state.
2. Add an `ArtResolver` that accepts a character definition or enemy ID and returns a resolved
   state strip with role/CSS fallbacks.
3. Render an inner sprite-strip element inside the existing `.unit-sprite`; keep the name, role, HP,
   action cue, and controls as DOM text.
4. Derive the visual state from the current structured event and HP. Never parse narration.
5. Apply the current encounter background by `currentEncounter.id`.
6. Preload only resolved current-operation assets.
7. Test GitHub Pages URLs using `import.meta.env.BASE_URL`.
8. Add visual tests for missing files, reduced motion, pause/replay/skip, mobile width, and all seven
   event types.

Recommended code boundaries when implementation begins:

```text
src/ui/art/ArtResolver.ts
src/ui/art/art-manifest.ts
src/ui/components/PixelSprite.tsx
src/ui/components/BattlePlaybackStage.tsx
public/assets/art/v1/...
```

No art code belongs in `engine/`, and no art filename belongs in a `CombatEvent` or save.

## 14. Acceptance checklist

An asset batch is not accepted until all of the following are true:

- Every file has the exact dimensions, frame count, anchor, alpha, and filename in this contract.
- A contact sheet proves every unit silhouette is distinct in grayscale at 50% display scale.
- Attack contact and VFX peak occur within the `520 ms` battle beat.
- The first battle remains understandable with the detailed text log collapsed.
- Pausing freezes presentation only; replay and skip do not alter state.
- Reduced motion shows stable poster/result frames and no hidden information.
- Missing art falls back without a broken image or console-error loop.
- At 320 CSS pixels wide, five combatants and exact HP remain legible.
- At 1365 x 768, art does not create document scrolling or displace the action button.
- No effect flashes dangerously, and colour is not the only status/target signal.
- The current-operation preload remains under `2 MB`; the full pack remains under `8 MB`.
- Assets contain no copied logo, text, watermark, recognisable character, or imitated signature style.
- Bestiary silhouette, ecology, mechanics, and reward identity describe the same creature.
- A fresh campaign using any of the nine Callings finds either exact art or a deliberate role
  fallback.

The quality question is not “is there more art?” It is “can the player see who acted, what changed,
why it mattered, and which preparation they should change next?”
