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
    activeWhen: { not: { type: "deductionComplete", id: "witness_contradiction" } },
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
    id: "visit_northstar",
    title: "Follow Northstar",
    objective: "Visit Northstar Civic Works at its registered address: 1400 Harrow Street, Suite 410.",
    activeWhen: {
      not: { type: "visited", location: "northstar_harrow" },
    },
    hints: [
      "The address from the photograph is now marked on the city map.",
      "Travel to 1400 Harrow Street and inspect the fourth floor.",
      "Northstar claims Suite 410. Begin with the brass directory.",
    ],
  },
  {
    id: "investigate_northstar",
    title: "The office that isn't there",
    objective: "Prove Suite 410 is fictitious and learn where Northstar's mail really goes.",
    activeWhen: {
      any: [
        { type: "flag", key: "photographedHarrowDirectory", equals: false },
        { type: "flag", key: "questionedHarrowManager", equals: false },
        { type: "flag", key: "foundNorthstarCourierManifest", equals: false },
      ],
    },
    hints: [
      "The directory, building manager, and mail cart each reveal part of Northstar's arrangement.",
      "Photograph the directory, question Oren Pike, and inspect the canceled pickup sheet.",
      "The discarded manifest on the mail cart names the organization receiving Northstar's envelopes.",
    ],
  },
  {
    id: "connect_northstar",
    title: "Follow the courier route",
    objective: "Use the evidence board to connect Northstar's false office to Brighter Horizon.",
    activeWhen: {
      type: "flag",
      key: "northstarRoutesToBrighterHorizon",
      equals: false,
    },
    hints: [
      "One connection disproves the address. The other identifies who receives Northstar's mail.",
      "Connect the Northstar address to the directory photo with White · Contradiction.",
      "Connect the courier manifest to the gala photograph with Red · Confirmed.",
    ],
  },
  {
    id: "visit_foundation",
    title: "The foundation",
    objective: "Visit Brighter Horizon Foundation’s Greyhaven office at 8 Calder Square.",
    activeWhen: {
      not: { type: "visited", location: "brighter_horizon_office" },
    },
    hints: [
      "The Brighter Horizon connection is now a destination on the city map.",
      "Travel to Calder Square and inspect the foundation’s public lobby.",
      "Begin with the receptionist and the founders’ wall.",
    ],
  },
  {
    id: "investigate_foundation",
    title: "Behind the donor wall",
    objective: "Identify who used E. Marsh’s credential and trace Brighter Horizon’s payments to Northstar.",
    activeWhen: {
      any: [
        { type: "flag", key: "photographedFoundationDonorWall", equals: false },
        { type: "flag", key: "questionedFoundationReceptionist", equals: false },
        { type: "flag", key: "foundFoundationVisitorLog", equals: false },
        { type: "flag", key: "foundFoundationDisbursementReport", equals: false },
      ],
    },
    hints: [
      "The receptionist, donor wall, visitor terminal, and recycling console each preserve a different part of the trail.",
      "Show Celia the Brighter Horizon connection and Northstar manifest, then inspect the terminal and public report.",
      "Photograph the founders’ wall, confront Celia about E. Marsh, print the access log, and take the report beside recycling.",
    ],
  },
  {
    id: "connect_foundation",
    title: "The charity and its contractor",
    objective: "Use the board to prove Brighter Horizon financed and administered Northstar.",
    activeWhen: {
      type: "flag",
      key: "brighterHorizonFundsNorthstar",
      equals: false,
    },
    hints: [
      "The invoice has a financial twin. The courier manifest has an administrative twin.",
      "Connect the Northstar invoice to the disbursement report with Blue · Financial.",
      "Connect the courier manifest to the visitor log with Red · Confirmed.",
    ],
  },
  {
    id: "calder_gala",
    title: "Invitation only",
    objective: "The next lead is Brighter Horizon’s Thursday benefit at the Calder Grand.",
    activeWhen: null,
    hints: [
      "Review the Calder Grand gala invitation in the case file.",
      "The circled man and Cassian Rook will both be inside an invitation-only event.",
      "The investigation will continue at the Calder Grand in the next playable chapter.",
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
  { label: "Harrow Street investigated", when: { type: "visited", location: "northstar_harrow" } },
  { label: "Courier route recovered", when: { type: "flag", key: "foundNorthstarCourierManifest" } },
  { label: "Brighter Horizon connection proven", when: { type: "flag", key: "northstarRoutesToBrighterHorizon" } },
  { label: "Calder Square investigated", when: { type: "visited", location: "brighter_horizon_office" } },
  { label: "E. Marsh access trail recovered", when: { type: "flag", key: "foundFoundationVisitorLog" } },
  { label: "Foundation financing proven", when: { type: "flag", key: "brighterHorizonFundsNorthstar" } },
]);
