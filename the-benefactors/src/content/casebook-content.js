export const CASEBOOK_STAGES = Object.freeze([
  {
    id: "opening_lead",
    title: "The anonymous lead",
    objective: "Open the anonymous email on the office laptop and inspect both attachments.",
    activeWhen: { type: "flag", key: "downloadedAttachments", equals: false },
    hints: [
      "The caller said to check your email. The laptop is on the office desk.",
      "Open the unread message with no sender and read the accusation carefully.",
      "Select either attachment. The invoice and email thread will both enter the case file.",
    ],
  },
  {
    id: "city_records",
    title: "The official paperwork",
    objective: "Find the complete public record for Mayor Vale’s west-wing permit.",
    activeWhen: { type: "flag", key: "permitAcquired", equals: false },
    hints: [
      "The invoice names a city-funded project. City Hall keeps the permit record.",
      "The public records terminal is available even if Lionel does not feel helpful.",
      "At City Hall, examine the public terminal and choose Search Vale permits.",
    ],
  },
  {
    id: "missing_addition",
    title: "The missing west wing",
    objective: "Document what was—and was not—built at the Vale residence.",
    activeWhen: {
      any: [
        { type: "flag", key: "photographedWestWall", equals: false },
        { not: { type: "hasEvidence", id: "june_statement" } },
      ],
    },
    hints: [
      "The permit describes a visible addition. Someone across the street had a clear view.",
      "At Bellweather Lane, inspect the western wall and speak with June Bell.",
      "Photograph the west wall, then question June about the nighttime deliveries.",
    ],
  },
  {
    id: "prove_missing_addition",
    title: "Prove the contradiction",
    objective: "Use the evidence board to prove the declared construction never happened.",
    activeWhen: { not: { type: "deductionComplete", id: "deduction_missing_addition" } },
    hints: [
      "The invoice, permit, photograph, and June’s account describe the same job differently.",
      "Pin the permit, house photograph, and June’s statement. Choose White · Contradiction.",
      "Connect the permit to June’s statement with White · Contradiction.",
    ],
  },
  {
    id: "study_search",
    title: "Vale’s intended trail",
    objective: "Search Mayor Vale’s study and find what lies beneath the west wing.",
    activeWhen: { type: "flag", key: "foundWallCavity", equals: false },
    hints: [
      "Vale’s study changed after the missing-addition deduction. Revisit the map.",
      "The crooked photograph, recorder, and western bookcase each supply part of the solution.",
      "Collect the old floorplan, align it at 270°, then check the western bookcase.",
    ],
  },
  {
    id: "restore_recording",
    title: "Restore Vale’s warning",
    objective: "Reconstruct the damaged recording found in the hidden room.",
    activeWhen: { type: "flag", key: "recordingReconstructed", equals: false },
    hints: [
      "The fragment timestamps are gone, but the background sounds survived.",
      "Follow the continuous sounds: the clock leads into the freight train, then the rain.",
      "Arrange the fragments Clock → Freight → Rain, then test the reconstruction.",
    ],
  },
  {
    id: "distress_signal",
    title: "The distress signal",
    objective: "Prove why Vale made the invoice look suspicious.",
    activeWhen: { type: "flag", key: "prologueEndingReady", equals: false },
    hints: [
      "Vale’s restored message changes the meaning of the first anonymous documents.",
      "On the board, compare the invoice with the missing addition and the email with Vale’s message.",
      "Use White · Contradiction for invoice ↔ house photo, then Red · Confirmed for anonymous email ↔ restored message.",
    ],
  },
  {
    id: "answer_knock",
    title: "Three knocks",
    objective: "Return to the evidence board and answer whoever followed Vale’s trail.",
    activeWhen: { type: "path", path: "progress.prologueComplete", equals: false },
    hints: [
      "The case is proven. The sound at the apartment door is the only lead left.",
      "Open the evidence board. A new case update is waiting above the corkboard.",
      "Choose Answer the knock to begin the end-of-prologue sequence.",
    ],
  },
  {
    id: "northstar",
    title: "Follow Northstar",
    objective: "The prologue is complete. The registered address at 1400 Harrow Street is the next lead.",
    activeWhen: null,
    hints: [
      "Review the gala photograph and Northstar address on the board.",
      "The circled man appears at a Brighter Horizon benefit.",
      "The next playable chapter will begin at 1400 Harrow Street.",
    ],
  },
]);

export const CASEBOOK_PROGRESS = Object.freeze([
  { label: "Anonymous files recovered", when: { type: "flag", key: "downloadedAttachments" } },
  { label: "City permit acquired", when: { type: "flag", key: "permitAcquired" } },
  { label: "Missing addition documented", when: { type: "flag", key: "photographedWestWall" } },
  { label: "Hidden room discovered", when: { type: "flag", key: "foundWallCavity" } },
  { label: "Vale’s message restored", when: { type: "flag", key: "recordingReconstructed" } },
  { label: "Distress signal proven", when: { type: "flag", key: "prologueEndingReady" } },
  { label: "Northstar lead recovered", when: { type: "path", path: "progress.prologueComplete", equals: true } },
]);
