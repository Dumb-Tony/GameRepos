# THE BENEFACTORS
## Game Design Document

**Version:** 1.0  
**Format:** Desktop-first HTML5 point-and-click adventure  
**Genre:** Investigative noir / conspiracy thriller / narrative puzzle  
**Primary platform:** Modern desktop web browsers  
**Secondary platform:** Tablets, after the desktop experience is complete  
**Working title:** *The Benefactors*

---

## 1. Document Purpose

This document is the source of truth for designing and implementing *The Benefactors* as a real HTML game. It is written so that a developer—or an AI coding agent such as Codex—can use it to:

1. Build a small but polished vertical slice.
2. Establish reusable systems for locations, dialogue, evidence, puzzles, and story state.
3. Expand the vertical slice into the complete game without rewriting the foundation.

When this document distinguishes between the **full game** and the **vertical slice**, build the vertical slice first.

---

## 2. High Concept

The player is an investigative journalist following an anonymous tip about a local mayor who appears to have embezzled public accessibility funds to renovate her home.

The assignment initially feels small and almost mundane. A suspicious invoice, a nonexistent contractor, and an email mentioning a mysterious group of guests lead the journalist to a concealed communications room beneath the mayor’s house. The mayor has not simply stolen money: she has left an irregular financial trail because she is frightened, compromised, and trying to attract the attention of someone capable of following it.

The investigation expands from municipal corruption to a celebrated humanitarian foundation, then to shell companies, manufactured crises, political influence, illegal research, and a secretive organization of extraordinarily wealthy public figures called the Meridian Society.

Between every investigation, the player returns to a home office. A physical evidence board fills the wall. Documents, photographs, names, maps, and yarn connections transform the room into a visual record of the growing story. The board is the central interface through which the player forms theories, unlocks locations, chooses leads, and watches an apparently minor scandal become a global conspiracy.

---

## 3. Fiction and Tone

The story is fictional. Organizations, institutions, scandals, characters, and public figures must be invented rather than presented as claims about real individuals or groups.

### Tone

- Investigative noir rather than action fantasy
- Intimate, tense, intelligent, and occasionally darkly funny
- Grounded in receipts, human motives, bureaucracy, and contradictions
- Increasingly claustrophobic as the investigation expands
- Morally complicated: some public good performed by the antagonists is genuine
- Disturbing through implication and discovery, not graphic depiction

### Tone progression

1. **Curiosity:** A suspicious but ordinary local story
2. **Intrigue:** Details do not fit the expected explanation
3. **Vindication:** The protagonist proves there is a larger story
4. **Isolation:** Sources disappear and institutions close ranks
5. **Paranoia:** The home office no longer feels secure
6. **Moral pressure:** Publishing the truth may harm vulnerable people
7. **Agency:** The player decides what truth can actually be proven

### Humor

Humor should come from character, observation, and the absurd machinery of power: officious forms, self-important gala language, bad corporate slogans, and the protagonist’s dry descriptions. Humor must not trivialize victims.

---

## 4. Player Fantasy

The player should feel like a resourceful investigative journalist who:

- Notices what other people overlook
- Gets information through observation and conversation rather than violence
- Turns ordinary objects into meaningful evidence
- Builds theories instead of receiving waypoint instructions
- Decides whom to trust
- Risks relationships and safety in pursuit of a defensible story
- Understands the conspiracy because they personally assembled it

The player is never an armed superhero. Their primary tools are attention, persistence, social judgment, a camera, a recorder, public records, and the evidence board.

---

## 5. Design Pillars

### 5.1 Every revelation is earned

Major conclusions must emerge from evidence the player found, conversations they conducted, or contradictions they identified. Avoid unexplained exposition dumps.

### 5.2 The board is the story

The evidence board is not decorative. It is the primary visualization of narrative progress, a reasoning interface, and the method for choosing destinations.

### 5.3 Locations remember

Previously visited scenes change after story events. Witnesses alter their behavior, evidence is removed, offices close, security appears, and new opportunities emerge.

### 5.4 Truth and proof are different

The player may suspect something before possessing enough corroboration to publish it. Final outcomes depend on what can be supported, not merely what is true.

### 5.5 No arbitrary “adventure-game logic”

Puzzles should have understandable motives and grounded solutions. If an unusual item combination is required, context and character commentary must make the reasoning legible.

### 5.6 Pressure without constant timers

Most exploration is untimed. Pressure comes from consequences, changing locations, unreliable sources, and occasional clearly signaled time-sensitive leads.

---

## 6. Audience and Rating

### Target audience

- Players who enjoy narrative mysteries and detective fiction
- Fans of point-and-click adventures, investigative games, and environmental storytelling
- Players comfortable reading dialogue, emails, and documents
- Approximate target age: 16+

### Content boundaries

The game may reference corruption, coercion, disappearances, intimidation, exploitation, unethical research, death, and abuse of power. Avoid explicit sexual violence, graphic torture, and imagery that exists only for shock.

---

## 7. Platform and Controls

### Required browser support

- Current Chrome
- Current Edge
- Current Firefox
- Current Safari

### Primary controls

| Input | Action |
|---|---|
| Left click / tap | Walk, interact, select, advance dialogue |
| Hover / focus | Reveal interactive hotspot label |
| Right click or Escape | Close active panel / cancel held item |
| Mouse wheel | Scroll documents, dialogue history, inventory |
| Tab | Cycle visible interactive hotspots |
| Enter / Space | Confirm focused action |
| Arrow keys | Navigate menus and board items |
| M | Toggle mute |
| H | Toggle optional hotspot assistance |

Do not require pixel hunting. Interactive areas must be large enough to select comfortably and must be keyboard reachable.

---

## 8. Core Game Loop

```text
Review the evidence board
        ↓
Choose a lead or revisit a location
        ↓
Explore, observe, question, and solve
        ↓
Collect evidence and alter story state
        ↓
Return to the home office
        ↓
Review messages and changing world reactions
        ↓
Connect evidence and form a theory
        ↓
Unlock new leads, dialogue, or publication choices
```

An outing normally lasts 10–25 minutes. A home-office phase normally lasts 3–10 minutes, with longer theory-board sequences at chapter conclusions.

---

## 9. Game Structure

The complete game contains five acts. Each act ends with a major evidence-board deduction.

### Act I: The Renovation

**Question:** Where did the accessibility money actually go?

Primary locations:

- Home office
- Newspaper office
- City hall
- Mayor Vale’s street and exterior
- Mayor Vale’s house
- Northstar Construction’s registered address

Major discovery: The alleged home addition does not exist. The funds and materials created a hidden communications room. The mayor has disappeared, and her guest list contains people far outside her social world.

### Act II: The Foundation

**Question:** Why is a humanitarian foundation connected to covert construction?

Primary locations:

- Brighter Horizon local office
- Foundation fundraising gala
- Hotel service corridors
- Former accountant’s apartment
- Municipal records archive

Major discovery: Northstar is one of many temporary contractors building secure facilities for the same network.

### Act III: The Pattern

**Question:** What do apparently unrelated humanitarian crises have in common?

Primary locations:

- Contaminated-water community
- University laboratory
- Conservation land office
- Regional data center
- Newspaper archive

Major discovery: Meridian manufactures, redirects, or exploits crises and then appears publicly as the solution.

### Act IV: St. Orison

**Question:** What is Meridian actually coordinating?

Primary locations:

- Harbor
- Service vessel
- Private island resort
- Summit halls
- Island service tunnels
- Shepherd operations center

Major discovery: Shepherd is a predictive system that identifies instability and recommends opportunities for control and profit. The island is a meeting place, not the sole center of the conspiracy.

### Act V: Publication

**Question:** What can be published, what must be protected, and what will the truth cost?

Primary locations:

- Compromised home office
- Newspaper office
- Independent print shop
- Secure archive
- Final evidence-board assembly

Major choice: Construct and publish a defensible story, release everything, make a bargain, sacrifice the protagonist’s safety, or continue a slower investigation.

---

## 10. Vertical Slice Scope

The first playable release should cover the opening of Act I and take approximately 30–45 minutes.

### Included locations

1. Home office
2. Newspaper office
3. City hall records room
4. Mayor Vale’s street
5. Mayor Vale’s study
6. Hidden communications room

### Included characters

1. The protagonist
2. Editor Mara Venn
3. City clerk Lionel Price
4. Neighbor June Bell
5. Mayor Evelyn Vale, heard in a recording
6. Anonymous source, through email only

### Included systems

- Title screen and save/continue
- Point-and-click location exploration
- Hotspots with examine, use, and talk actions
- Inventory
- Branching dialogue
- Evidence collection
- Home-office hub
- Interactive evidence board
- Map-based destination selection
- Persistent story flags
- One multi-stage document puzzle
- One environmental puzzle
- One dialogue puzzle
- Autosave and manual save
- Settings and accessibility options

### Vertical slice ending

The player enters the hidden room, plays Mayor Vale’s damaged recording, and returns home. On the evidence board, the player connects the renovation invoice, the missing addition, and the phrase “Meridian guests.” This unlocks the Northstar address.

The screen fades to black after a knock at the protagonist’s apartment door. When the player checks the hallway, no one is there. An envelope has been pushed beneath the door containing a gala photograph with one face circled.

Display: **END OF PROLOGUE**

---

## 11. Protagonist

### Player-facing identity

At the beginning, the player chooses:

- First name
- Last name
- Pronouns: she/her, he/him, or they/them
- Portrait from a small set of illustrated options

The protagonist’s surname may default to **Rowan** in promotional material, but implementation must not assume a fixed gender.

### Character

The protagonist is capable but not famous. They work for a financially struggling local paper and have enough experience to recognize evasive answers, but not enough influence to be protected from retaliation.

### Dialogue temperament

Dialogue choices generally fall into three unlabelled styles:

- **Disarming:** empathetic, casual, patient
- **Direct:** precise, challenging, confident
- **Deceptive:** withholding, flattering, or strategically dishonest

These are not morality points. Characters respond differently based on temperament, history, and what evidence the player can cite.

---

## 12. Principal Cast

### Mara Venn — Editor

Pragmatic editor of the *Greyhaven Ledger*. She wants the truth but must keep the newspaper alive. Initially a mentor. Her caution may look like cowardice or complicity depending on the player’s interpretation.

### Mayor Evelyn Vale — Inciting figure

Popular reformist mayor accused of diverting accessibility funds. Intelligent, guarded, and increasingly frightened before her disappearance. She created a suspicious paper trail as a covert distress signal.

### Lionel Price — City clerk

Protective of procedure and resentful of journalists. He is not part of Meridian. Patient conversation can reveal that someone recently amended the building permits after hours.

### June Bell — Neighbor

Retired school librarian living opposite the mayor. Observant, lonely, and underestimated. She saw deliveries arrive but never saw construction above ground.

### Dr. Anika Saye — Scientist

An epidemiologist whose legitimate work was absorbed into Meridian’s programs. She is neither a simple villain nor an innocent bystander.

### Cassian Rook — Public benefactor

Charismatic founder of Brighter Horizon and the public face of global humanitarian optimism. He believes democratic institutions are too slow to manage civilization’s crises.

### Silas Wren — Crisis strategist

A discreet fixer who manages threats to Meridian’s reputation. Calm, courteous, and terrifying because he rarely needs to make explicit threats.

### Theo March — Rival journalist

An investigative reporter with greater reach and uncertain loyalties. Depending on player choices, Theo becomes an ally, exploiter, informant, or casualty.

---

## 13. Home Office

The office is the game’s central hub, chapter menu, emotional barometer, and visible progress record.

### Starting appearance

- Warm afternoon light
- Desk and laptop
- Telephone and answering machine
- Small evidence board
- Books, laundry, coffee, and ordinary domestic clutter
- City map beside the board
- Optional pet whose presence adds warmth and small interactions

### Story-driven changes

The office changes through defined room states:

| State | Visual and narrative changes |
|---|---|
| 0 — Ordinary | Open curtains, small board, normal clutter |
| 1 — Engaged | More files, late-night lighting, takeout containers |
| 2 — Guarded | Closed curtains, added locks, document boxes |
| 3 — Isolated | Unanswered messages, couch used as bed, board spreading |
| 4 — Compromised | Objects subtly displaced, surveillance countermeasures |
| 5 — Consumed | Evidence covers multiple walls and windows |

Room changes should be authored story states, not a physics simulation.

### Office interaction zones

- **Evidence board:** Review and connect evidence
- **Map:** Choose unlocked destinations
- **Laptop:** Email, records, articles, and publication interface
- **Telephone:** Call contacts when they are available
- **Answering machine:** Play new and archived messages
- **Desk:** Examine current case materials
- **Window:** Observe changes outside and possible surveillance
- **Door:** Receive visitors and packages
- **Archive box:** Review documents removed from the active board

### Return-home sequence

After each outing:

1. Fade or short travel transition.
2. Place newly acquired physical evidence on the desk.
3. Highlight new email or answering-machine messages without forcing them open.
4. Allow optional protagonist commentary on major changes.
5. Move new evidence into the board tray.
6. Let the player organize evidence freely.
7. Unlock destinations only after required deductions or messages.

The player must be allowed to leave the board and explore the office at any time.

---

## 14. Evidence Board System

### Goals

- Make narrative progress visible
- Let players participate in deductions
- Provide a natural mission-selection interface
- Preserve an understandable history of the investigation
- Support optional incorrect theories without permanently blocking progress

### Evidence categories

- Person
- Organization
- Location
- Document
- Photograph
- Recording
- Object
- Event
- Financial transaction
- Player note

### Evidence states

| State | Meaning |
|---|---|
| Unknown | Referenced but not yet acquired |
| Collected | Available in evidence tray |
| Pinned | Visible on active board |
| Connected | Participates in at least one player connection |
| Corroborated | Supported by the required independent evidence |
| Discredited | Shown to be false or misleading |
| Archived | Removed from active board but still reviewable |

### Connection types

| Yarn | Relationship |
|---|---|
| Red | Confirmed general connection |
| Yellow | Suspicion or incomplete theory |
| Blue | Financial or corporate connection |
| White | Personal relationship |
| Black | Intimidation, disappearance, death, or cover-up |

Color must never be the only indicator. Each yarn type needs a distinct line texture or icon for color-blind accessibility.

### Board interactions

- Drag evidence cards from the tray to the board
- Reposition and group cards
- Select one card and then another to propose a connection
- Choose a relationship type
- Remove a connection
- Open an evidence detail view
- Zoom and pan
- Filter or highlight a category
- Ask for a limited hint
- Select a location card to open it on the map

### Deduction rules

A deduction is a data-defined recipe:

```json
{
  "id": "deduction_missing_addition",
  "requiredEvidence": [
    "invoice_northstar",
    "permit_west_wing",
    "photo_mayor_house"
  ],
  "requiredConnections": [
    {
      "a": "invoice_northstar",
      "b": "permit_west_wing",
      "type": "financial"
    },
    {
      "a": "permit_west_wing",
      "b": "photo_mayor_house",
      "type": "contradiction"
    }
  ],
  "setsFlags": ["knows_addition_missing"],
  "unlocks": ["location_mayor_study"],
  "journalText": "The city paid for a west wing that was never built."
}
```

The exact JSON can change during implementation, but deductions must remain content-driven rather than hard-coded into interface components.

### Incorrect theories

In Investigator Mode, plausible but unsupported connections are allowed and displayed as yellow hypotheses. They do not unlock required story content. When disproven, the protagonist notes the contradiction and the connection becomes marked as discredited.

Incorrect theories must never create unwinnable states.

### Story Mode

For players who prefer narrative flow:

- Compatible evidence cards glow when one is selected.
- Relationship labels are supplied automatically.
- Required connections snap into place.
- The protagonist offers a deduction after repeated failed attempts.

### Investigator Mode

- No compatibility glow
- Player selects relationship type
- False hypotheses are allowed
- Hints remain available but optional

Difficulty mode can be changed at any time without restarting.

---

## 15. Exploration System

### Scene composition

Each location consists of:

- A background image or layered CSS scene
- Interactive hotspots
- Entry and exit points
- Foreground overlays
- Ambient audio
- Optional character sprites
- State-dependent visual variants

### Hotspot actions

Use a contextual cursor and a compact action menu:

- Examine
- Talk
- Use
- Take
- Photograph
- Record
- Exit

Only show actions valid for that hotspot. Avoid displaying a full verb wheel for objects with only one sensible interaction.

### Hotspot feedback

- Hover/focus changes cursor and shows a short label.
- Clicking produces an immediate response, even if the action fails.
- Repeated examination may produce a second, shorter line.
- Hotspot assistance temporarily outlines interactive regions.
- Completed hotspots remain available when they contain useful flavor text.

### Scene revisits

Locations use authored state variants. Example:

```text
City Hall — normal
City Hall — after records request
City Hall — after mayor disappears
City Hall — after article publication
```

State variants can alter characters, dialogue, hotspots, exits, background layers, and available evidence.

---

## 16. Inventory

Inventory contains portable tools and temporary objects.

### Permanent tools

- Press credentials
- Smartphone/camera
- Audio recorder
- Notebook
- Lockable document envelope
- UV penlight, acquired later

### Rules

- Inventory opens as a horizontal tray.
- Selecting an item changes the cursor and allows use on a hotspot.
- Combining inventory items is permitted only when narratively justified.
- Evidence documents may appear in inventory until reviewed, then move to the evidence system.
- Important story evidence cannot be discarded.
- The protagonist must explain why an attempted combination does not work.

---

## 17. Dialogue System

### Requirements

- Branching choices
- Conditional choices based on evidence and flags
- Choices that can be revisited when appropriate
- Character disposition and memory
- Optional dialogue history
- Clear indication when evidence can be cited

### Choice types

- Question
- Observation
- Evidence challenge
- Promise
- Lie or omission
- End conversation

### Evidence confrontation

When the player possesses relevant evidence, a document icon appears beside the dialogue choice. Selecting it may open a small evidence picker.

Example:

```text
LIONEL: “The permit was approved normally.”

[Ask who submitted it]
[Show the timestamped amendment]  ← evidence choice
[Back off]
```

### Disposition

Do not show a numerical relationship meter. Track internal values or flags such as:

- trusts_player
- feels_threatened
- was_caught_lying
- received_protection_promise
- believes_player_is_reckless

Disposition modifies later dialogue and availability, but no single conversation failure may permanently block the main story.

---

## 18. Puzzle Design

Every puzzle must answer four questions:

1. What does the protagonist want?
2. What prevents them from getting it?
3. What information or object makes the solution reasonable?
4. What story information does solving it reveal?

### Puzzle categories

- Document reconstruction
- Timeline comparison
- Environmental observation
- Dialogue and evidence confrontation
- Password inference
- Records search
- Photography and image comparison
- Audio repair or sequencing
- Physical access
- Evidence-board deduction

### Hint system

Hints are delivered through the protagonist’s notebook. Three levels:

1. Restate the immediate objective.
2. Point toward the relevant location, character, or evidence.
3. Describe the next concrete action.

Hints do not reduce scores or lock achievements.

---

## 19. Vertical Slice Puzzle Flow

### Opening: Anonymous email

The protagonist receives a leaked invoice and an email claiming Mayor Vale used accessibility funds for a west-wing addition.

The player can inspect:

- Invoice total
- Northstar Construction logo
- Mayor’s home address
- “Meridian guests” email phrase
- Metadata showing the file was scanned at city hall

Result: City hall and the mayor’s street unlock.

### Puzzle 1: City hall records

**Goal:** Obtain the complete building permit.

**Obstacle:** Lionel provides only the public summary and refuses access to the recent amendment.

**Solution paths:**

- Patient dialogue reveals the terminal search format.
- A posted records policy gives the correct request category.
- The player submits a correctly phrased request at a public terminal.
- Alternatively, the player notices Lionel’s contradiction and cites the invoice date, causing him to retrieve the amendment defensively.

**Reward:** Permit amendment, after-hours timestamp, and the name “E. Marsh” as authorizer.

### Puzzle 2: The missing addition

**Goal:** Verify whether the west wing exists.

**Obstacle:** The house is behind a wall and the player cannot trespass.

**Solution:**

- Speak with June Bell.
- Repair or reposition her bird-watching camera tripod.
- Use the elevated camera view to photograph the western side.
- Compare the new photograph with the permit footprint.

**Reward:** Evidence that no above-ground addition was built. June reports deliveries and nighttime vibration beneath the street.

### Board deduction 1

Connect:

- Invoice
- Permit
- House photograph

Conclusion: The money purchased something at the property, but not the declared addition.

Unlock: Return to the mayor’s house after Mara reports that Vale has disappeared and police left the study unsecured following an initial welfare check.

### Puzzle 3: The study

**Goal:** Locate what the mayor intended someone to find.

**Clues:**

- A framed photograph is slightly crooked.
- Dust outlines show a book was recently moved.
- A dictation recorder contains a phrase about “what is beneath the west wing.”
- The architectural plan uses an older orientation than the current house.

**Solution:** Align the old plan with the current study, identify the wall cavity, and activate a concealed mechanism.

**Reward:** Access to the hidden stairway.

### Puzzle 4: Damaged recording

**Goal:** Recover Mayor Vale’s message.

**Solution:**

- Find three recording fragments in the hidden room.
- Arrange them by background sounds: clock chime, passing freight train, then rain.
- The reconstructed message names Meridian and implies the financial irregularity was deliberate.

**Reward:** “Meridian guests” becomes a confirmed lead. The vertical slice conclusion triggers.

---

## 20. Travel and Mission Selection

The city map is physically mounted beside the evidence board.

### Location states

- Locked
- Newly available
- Available
- Contains unresolved lead
- Changed since last visit
- Time-sensitive
- Compromised
- Exhausted for now

### Unlock logic

Locations unlock through:

- Evidence-board deductions
- Calls, emails, or messages
- Dialogue revelations
- Published articles
- Changes triggered by earlier missions

The game should explain why the protagonist can visit a location. Avoid unexplained map icons.

### Time-sensitive content

Time advances only when the player begins selected outings or publishes major stories. Office exploration and evidence-board organization do not consume time.

Before a choice advances time, display a clear warning if another lead may change or expire.

---

## 21. Story State and Consequences

### State types

- Boolean flags
- Integer chapter and office state
- Character disposition
- Evidence status
- Location variant
- Completed deductions
- Article publication choices
- Source protection status
- Time-sensitive lead counters

### Example flags

```json
{
  "chapter": 1,
  "officeState": 0,
  "mayorMissing": false,
  "metJune": false,
  "lionelTrustsPlayer": false,
  "photographedWestWall": false,
  "knowsAdditionMissing": false,
  "foundHiddenRoom": false,
  "heardValeRecording": false
}
```

### Consequence philosophy

- Choices should alter access, relationships, information quality, and ending conditions.
- Consequences may be delayed.
- The main plot must remain completable.
- There should not be one obviously “correct” personality.
- A failed social approach creates another route, usually with a cost.

---

## 22. Publication System

At specific chapter points, the player writes or approves an article.

### Article construction

The player selects:

- Primary claim
- Supporting evidence
- Sources to quote
- Names to reveal or protect
- Headline tone
- Whether to publish now or investigate further

### Article validation

Claims have proof requirements. The interface distinguishes:

- **Supported:** Sufficient corroboration
- **Risky:** Some support, vulnerable to challenge
- **Unsubstantiated:** Cannot responsibly publish

The game may allow risky publication but should communicate likely consequences.

### World reaction

Published choices affect:

- Newspaper front page
- Emails and phone messages
- Character trust
- Access to sources
- Meridian countermeasures
- Public understanding
- Final ending

---

## 23. Endings

Ending availability is calculated from evidence quality, protected sources, alliances, publication decisions, and player conduct.

### The Headline

A narrow, strongly corroborated story removes several Meridian members. The network survives, but it can no longer pretend it was never exposed.

### The Data Dump

The player releases everything. Genuine evidence becomes mixed with speculation, vulnerable people are exposed, and chaos makes denial easier.

### The Bargain

The player accepts safety and access in exchange for sacrificing a disposable faction.

### The Martyr

The protagonist ensures the story survives at severe personal cost.

### The Successor

The protagonist accepts Meridian’s argument that the world requires unelected management and joins the system.

### The Long Investigation

The protagonist publishes only the first undeniable case, protects the archive, and begins dismantling the network methodically.

No ending should state that one choice completely solved global corruption.

---

## 24. User Interface

### Required screens

- Title screen
- New game setup
- Save/load
- Settings
- Location exploration
- Dialogue
- Inventory
- Evidence detail
- Evidence board
- City map
- Laptop/email
- Notebook and hints
- Pause menu
- Article construction
- Credits

### HUD philosophy

Keep the exploration screen cinematic and uncluttered. Show interface elements contextually:

- Inventory button
- Notebook button
- Optional objective summary
- Settings/pause
- Cursor label

### Visual hierarchy

1. Scene and characters
2. Current interactive target
3. Dialogue or active document
4. Persistent controls

### Responsive behavior

- Design baseline: 16:9 viewport at 1440 × 900
- Support down to 1024 × 700 without lost controls
- Board and documents may use scrollable panels
- Mobile phones are not required for the first release

---

## 25. Visual Direction

### Overall style

Painterly 2D illustrated environments with subtle animation. A limited-color neo-noir palette becomes colder and more desaturated as the conspiracy expands.

### Visual motifs

- Paper texture
- Photocopier artifacts
- Redactions
- Halftone newspaper imagery
- Warm desk lamps against cool window light
- Thread, pins, tape, and handwritten annotations
- Reflections and obstructed sightlines
- Humanitarian branding that is pristine to the point of menace

### Office palette progression

- Act I: amber, cream, faded teal
- Act II: amber reduced, stronger shadow
- Act III: steel blue, monitor green, muted red
- Act IV: sterile white and ocean cyan outside; deep mechanical black below
- Act V: newsprint monochrome with selective red

### Animation scope

Use restrained loops:

- Curtain movement
- Monitor flicker
- Rain on windows
- Steam from coffee
- Clock hands
- Passing headlights
- Character blinking and breathing
- Yarn settling when a new connection is made

Avoid requiring full skeletal animation for the vertical slice.

---

## 26. Audio Direction

### Music

- Minimal piano, analog synth, low strings, and processed newsroom percussion
- Music layers intensify as deductions form
- The office theme gains dissonant elements across acts
- Silence is used deliberately in threatening moments

### Ambient sound

- Newspaper office chatter and printers
- Fluorescent hum at city hall
- Suburban birds, traffic, and distant construction
- Apartment radiator, clock, rain, and neighbors
- Electrical hum in the hidden room

### Interaction sound

- Paper handling
- Camera shutter
- Recorder clicks
- Yarn tension and pin placement
- Pencil notes
- Email and answering-machine cues

### Voice

Full voice acting is optional. The architecture must support per-line audio, but the vertical slice may ship with text and selected voiced recordings only.

---

## 27. Accessibility

Required:

- Keyboard navigation for all essential interactions
- Visible focus indicators
- Remappable or alternative controls where practical
- Subtitles for all speech and meaningful audio
- Speaker labels
- Adjustable text size
- High-contrast UI option
- Color-blind-safe evidence connections
- Reduced motion option
- Separate music, effects, ambience, and voice volume
- Hotspot assistance
- Story Mode board assistance
- Pause during documents and dialogue
- No essential information communicated by sound alone
- No puzzle that depends solely on precise color perception

Preferred:

- Dyslexia-friendly font option
- Adjustable dialogue speed
- Screen-reader labels for menus and document text
- Content warning screen with spoiler-light categories

---

## 28. Technical Architecture

### Recommended stack

For the vertical slice:

- HTML5
- CSS3
- JavaScript or TypeScript
- Vite for local development and production builds
- A lightweight component framework is optional; use it only if it simplifies state and UI
- SVG or HTML/CSS for the evidence-board strings and connectors
- Web Audio API or a small audio library
- LocalStorage or IndexedDB for saves

The game must run as a static site without requiring a backend.

### Architectural rule

Separate engine code from authored content. Dialogue, hotspots, evidence, deductions, locations, and story flags should be stored in data files wherever practical.

### Suggested project structure

```text
/
├─ index.html
├─ package.json
├─ public/
│  ├─ images/
│  ├─ audio/
│  └─ fonts/
├─ src/
│  ├─ main.ts
│  ├─ styles/
│  ├─ engine/
│  │  ├─ game-state.ts
│  │  ├─ save-system.ts
│  │  ├─ conditions.ts
│  │  ├─ events.ts
│  │  └─ audio.ts
│  ├─ systems/
│  │  ├─ exploration/
│  │  ├─ dialogue/
│  │  ├─ inventory/
│  │  ├─ evidence-board/
│  │  ├─ deductions/
│  │  ├─ map/
│  │  └─ publication/
│  ├─ screens/
│  ├─ content/
│  │  ├─ characters/
│  │  ├─ dialogue/
│  │  ├─ evidence/
│  │  ├─ locations/
│  │  ├─ deductions/
│  │  └─ chapters/
│  └─ tests/
└─ README.md
```

### Rendering approach

Use one responsive game viewport. Exploration scenes can begin as layered images with normalized hotspot coordinates:

```json
{
  "id": "mayor_study",
  "background": "/images/locations/mayor-study.webp",
  "hotspots": [
    {
      "id": "crooked_photo",
      "label": "Crooked photograph",
      "shape": "rect",
      "x": 0.62,
      "y": 0.18,
      "width": 0.12,
      "height": 0.2,
      "actions": ["examine", "use"],
      "visibleWhen": ["entered_mayor_study"],
      "hiddenWhen": ["opened_wall_cavity"]
    }
  ]
}
```

Normalized coordinates allow the scene to scale while keeping hotspots aligned.

### Event system

Content actions should emit declarative effects:

```json
{
  "effects": [
    { "type": "setFlag", "key": "photographedWestWall", "value": true },
    { "type": "collectEvidence", "id": "photo_mayor_house" },
    { "type": "addJournalEntry", "id": "entry_missing_wing" }
  ]
}
```

Avoid scattering direct state mutations throughout UI components.

---

## 29. Save System

### Requirements

- Autosave after acquiring evidence, completing a deduction, changing location, or publishing
- At least three manual save slots
- Continue button loads the most recent save
- Saves include a version number for future migration
- Export/import save as JSON is preferred

### Save data

Store:

- Player identity and preferences
- Current location
- Story flags
- Evidence states
- Board card positions
- Board connections
- Inventory
- Character dispositions
- Dialogue history markers
- Location variants
- Completed deductions
- Settings
- Play time

Do not store DOM state. Reconstruct the interface from serialized game state.

---

## 30. Content Schemas

### Evidence

```json
{
  "id": "invoice_northstar",
  "title": "Northstar Construction Invoice",
  "category": "document",
  "summary": "An invoice charged to the municipal accessibility fund.",
  "image": "/images/evidence/invoice-northstar.webp",
  "details": [
    {
      "id": "invoice_total",
      "label": "Total",
      "text": "$184,600"
    },
    {
      "id": "invoice_logo",
      "label": "Logo",
      "text": "A compass star inside a broken circle."
    }
  ],
  "tags": ["northstar", "mayor", "money"],
  "acquiredBy": "inspect_anonymous_attachment"
}
```

### Dialogue node

```json
{
  "id": "lionel_permit_intro",
  "speaker": "lionel",
  "text": "Everything available to the public is in that summary.",
  "choices": [
    {
      "text": "Who filed the amendment?",
      "next": "lionel_amendment_denial"
    },
    {
      "text": "Then why was it changed after midnight?",
      "requiresEvidence": ["permit_timestamp"],
      "effects": [
        { "type": "setFlag", "key": "caughtLionelContradiction", "value": true }
      ],
      "next": "lionel_defensive"
    }
  ]
}
```

### Condition model

Support reusable conditions:

- flag equals value
- possesses evidence
- evidence is corroborated
- deduction completed
- character disposition threshold
- location visit count
- chapter equals value
- all / any / not composition

---

## 31. Content Authoring Rules

- Every evidence item needs a unique stable ID.
- Every puzzle solution must be foreshadowed.
- Every required deduction needs a hint path.
- Every important document needs a text transcription.
- Every location revisit must have an authored reason.
- Every character must want something independent of delivering exposition.
- Avoid documents longer than roughly 350 words unless optional.
- Break long dialogue into interactable beats.
- Never hide required evidence in a tiny unmarked hotspot.
- Required content cannot depend on an expired optional lead.

---

## 32. Failure and Recovery

There is no traditional game-over state for ordinary mistakes.

Possible setbacks:

- A source becomes guarded.
- Evidence is removed before collection.
- The player must find an alternate route.
- A later article has weaker corroboration.
- Meridian becomes aware of the investigation sooner.
- A relationship is damaged.

True terminal failure may occur only in the final act and must follow a clearly signaled, deliberate decision. Always allow loading a recent autosave.

---

## 33. Privacy and Content Safety

- Do not collect analytics or personal data in the initial build.
- Do not request real names or email addresses.
- The protagonist’s custom name remains local to the save.
- Include a clear-fiction disclaimer.
- Do not use the names or likenesses of real politicians, billionaires, charities, or alleged criminal networks.
- Avoid stereotypes that associate secret control with a real ethnicity, religion, nationality, or other protected group.

---

## 34. Performance Targets

- Initial compressed load target: under 8 MB for the vertical slice placeholder build
- Interactive within 3 seconds on a typical broadband desktop after assets are cached
- 60 FPS for ordinary UI and board movement on a mid-range laptop
- Lazy-load location assets
- Prefer WebP or AVIF with fallbacks where needed
- Avoid large autoplay video backgrounds
- Audio must not play before user interaction

---

## 35. Testing Strategy

### Automated tests

- Condition evaluation
- Deduction recipes
- Story event effects
- Save serialization and migration
- Location unlock rules
- Dialogue branch requirements
- Prevention of duplicate evidence
- Board connection validation

### Content validation

Create a validation script that checks:

- Duplicate IDs
- Broken references
- Dialogue nodes with no destination
- Required evidence that cannot be acquired
- Locations with no valid unlock path
- Deductions with nonexistent evidence
- Assets referenced but missing

### End-to-end tests

At minimum:

1. Start a new game.
2. Inspect the anonymous email.
3. Travel to city hall.
4. acquire the permit.
5. Visit June and photograph the house.
6. Complete the first board deduction.
7. Enter the study and hidden room.
8. Reconstruct the recording.
9. Reach “End of Prologue.”
10. Reload the latest autosave and verify state.

### Accessibility testing

- Complete the vertical slice with keyboard only.
- Complete deductions without relying on color.
- Verify at 200% browser zoom.
- Verify reduced motion.
- Check text contrast.

---

## 36. Development Milestones

### Milestone 0 — Foundation

- Create project and build pipeline
- Implement screen router
- Implement central game state
- Implement content loader and condition evaluator
- Implement save/load
- Add placeholder art and audio

**Exit criterion:** The game loads, moves between placeholder screens, and preserves state after refresh.

### Milestone 1 — Exploration

- Build scalable scene renderer
- Add hotspots and contextual actions
- Add inventory
- Add location transitions
- Build newspaper office and city hall with placeholders

**Exit criterion:** The player can inspect the opening email, travel, explore, and acquire the permit.

### Milestone 2 — Dialogue

- Implement branching dialogue
- Add evidence-based choices
- Add character state
- Implement Lionel and June conversations

**Exit criterion:** Both required clues can be obtained through authored conversations.

### Milestone 3 — Home Office and Evidence Board

- Build board camera, evidence tray, card movement, and connectors
- Implement deductions
- Build map unlocking
- Persist board layout

**Exit criterion:** The missing-addition deduction unlocks the mayor’s study.

### Milestone 4 — Prologue Completion

- Add study and hidden room
- Implement plan-alignment puzzle
- Implement recording reconstruction
- Add prologue ending sequence

**Exit criterion:** A new player can complete the full vertical slice without developer tools.

### Milestone 5 — Polish

- Replace critical placeholders
- Add audio and transitions
- Implement settings and accessibility
- Add content validation
- Fix browser compatibility issues

**Exit criterion:** The vertical slice meets all acceptance criteria below.

---

## 37. Vertical Slice Acceptance Criteria

The vertical slice is complete when:

- It runs from a static production build.
- It has a title screen, new game, continue, settings, and credits.
- The player can choose a name, pronouns, and portrait.
- All six vertical-slice locations are reachable through story logic.
- All required interactions work with mouse and keyboard.
- Three puzzle types and one board deduction are functional.
- Evidence persists between locations and after refresh.
- Board positions and connections persist in saves.
- Dialogue responds to collected evidence.
- Returning locations can display changed state.
- The prologue can be completed without a walkthrough.
- A three-level hint path exists for every required puzzle.
- No required hotspot demands pixel hunting.
- Muting, subtitles, text scaling, reduced motion, and hotspot assistance work.
- The browser console contains no uncaught errors in the supported browsers.
- A complete playthrough takes approximately 30–45 minutes with final content.

---

## 38. Codex Implementation Brief

When asking Codex to build the game, use the following operating instructions:

1. Read this entire GDD before modifying files.
2. Build only the current milestone unless explicitly asked to expand scope.
3. Use placeholder visual assets where final artwork does not exist.
4. Keep authored content separate from engine and UI code.
5. Do not hard-code deductions, dialogue branches, or hotspot outcomes inside presentation components.
6. Preserve stable content IDs.
7. Add or update automated tests for state logic.
8. Validate keyboard use and responsive layout after each UI milestone.
9. Keep the project runnable after every milestone.
10. Document how to install, run, test, and build the game in the README.
11. Do not introduce a backend unless the design requirements change.
12. Do not add monetization, accounts, analytics, or online tracking.

### Recommended first Codex request

> Read `the-benefactors-game-design-document.md` in full. Implement Milestone 0 only. Create a Vite TypeScript project for a static HTML5 game, with a screen router, centralized serializable game state, a data-driven condition/event system, versioned local save/load, placeholder title screen, placeholder home office, placeholder location screen, settings, and automated tests for state and save behavior. Keep content separate from engine code. Add a README with run, test, and build instructions. Do not implement later milestones yet. Verify the production build and tests before finishing.

### Recommended second Codex request

> Read the GDD and inspect the existing project. Implement Milestone 1 only. Add the scalable exploration scene renderer, normalized hotspots, contextual actions, inventory, location transitions, and placeholder versions of the home office, newspaper office, city hall, mayor’s street, mayor’s study, and hidden room. Implement the opening anonymous email and permit-acquisition flow. Preserve the established architecture, add tests for location unlocks and hotspot conditions, and verify keyboard navigation.

---

## 39. Features Explicitly Deferred

Do not build these in the first vertical slice:

- Multiplayer or shared boards
- User accounts or cloud saves
- Procedural dialogue
- Generative AI conversations
- Real-world news integration
- Full mobile-phone layout
- Full voice acting
- 3D environments
- Physics-based yarn
- Open-world travel
- Combat
- Randomized evidence
- Chapters II–V as playable content

They may be reconsidered only after the vertical slice is tested.

---

## 40. Final Creative North Star

At the beginning of the game, the evidence board contains a mayor, an invoice, and one piece of red yarn.

By the end, it covers the wall, crosses maps and photographs, and reaches into nearly every institution the protagonist once trusted. Yet the player should still be able to trace the entire investigation back to that first modest irregularity.

The central emotional transformation is:

> “Someone stole money for a house.”

becoming:

> “The suspicious payment was a distress signal, and I was meant to find it.”

The central design promise is that the player does not merely watch that transformation. They build it, connection by connection.
