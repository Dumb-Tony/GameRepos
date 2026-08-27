export const YARN_RELATIONSHIPS = Object.freeze(
  [
    {
      id: "confirmed",
      colorName: "Red",
      label: "Confirmed",
      description: "A verified connection supported by evidence.",
      patternLabel: "Solid line",
    },
    {
      id: "financial",
      colorName: "Blue",
      label: "Financial",
      description: "Money, ownership, contracts, or payment.",
      patternLabel: "Double line",
    },
    {
      id: "suspicion",
      colorName: "Yellow",
      label: "Suspicion",
      description: "A plausible link that is not yet proven.",
      patternLabel: "Long-dashed line",
    },
    {
      id: "personal",
      colorName: "Green",
      label: "Personal",
      description: "A family, social, professional, or private relationship.",
      patternLabel: "Braided line",
    },
    {
      id: "coverup",
      colorName: "Black",
      label: "Cover-up",
      description: "An act intended to hide, destroy, or redirect evidence.",
      patternLabel: "Zigzag line",
    },
    {
      id: "contradiction",
      colorName: "White",
      label: "Contradiction",
      description: "Claims or facts that cannot both be true.",
      patternLabel: "Dotted line",
    },
  ].map((relationship) => Object.freeze(relationship)),
);

const relationshipIds = Object.freeze(
  YARN_RELATIONSHIPS.map((relationship) => relationship.id),
);

export const TUTORIAL_STEPS = Object.freeze(
  [
    {
      id: "point-and-click",
      trigger: "office-entered",
      title: "Look around",
      text: "Move across a scene to reveal interactive people and objects. Selecting one inspects it. Some observations reveal a separate highlighted action—choose that action to pick up evidence, talk, use a tool, or continue.",
      keyboardHint: "Use Tab to move between targets and Enter to select.",
    },
    {
      id: "inspect-evidence",
      trigger: "evidence-first-collected",
      title: "Inspect the evidence",
      text: "Collected items enter the case file. Use View evidence to reopen names, dates, amounts, and contradictions.",
    },
    {
      id: "revisit-scenes",
      trigger: "location-first-exited",
      title: "Locations remember",
      text: "New evidence and story events can change hotspots, dialogue, and access. Revisit earlier locations when a lead develops.",
    },
    {
      id: "build-the-board",
      trigger: "board-first-opened",
      title: "Build the case",
      text: "Pin evidence, choose what the yarn means, then select two cards. Correct evidence and relationship types create deductions.",
      relationshipIds,
    },
  ].map((step) => Object.freeze(step)),
);

export const OPENING_MESSAGE =
  "{{firstName}}. This line is not secure. Check your email. Two files are waiting. Start with the invoice. Follow the money, and trust the paperwork before you trust anyone.";

export const CUTSCENE_BEATS = Object.freeze(
  [
    {
      id: "press-deadline",
      kind: "title",
      eyebrow: "Greyhaven · Wednesday · 12:47 a.m.",
      text: "Tomorrow’s front page locks in seventeen hours.",
    },
    {
      id: "past-due",
      kind: "narration",
      text: "Two red notices wait beneath {{possessiveAdjective}} door, both addressed to {{fullName}}. {{subjectCapitalized}} {{have}} one edition left to prove {{reflexive}} useful to a paper looking for cuts.",
    },
    {
      id: "answering-machine",
      kind: "prompt",
      text: "VALE FOLLOW-UP · 6 P.M. · BRING PROOF. Beside the note, the answering-machine light blinks.",
      action: "Select the answering machine.",
    },
    {
      id: "anonymous-call",
      kind: "audio",
      source: "answering-machine",
      speaker: "Anonymous caller",
      anonymous: true,
      text: OPENING_MESSAGE,
    },
  ].map((beat) => Object.freeze(beat)),
);
