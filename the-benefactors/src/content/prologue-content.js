export const STUDY_ALIGNMENT_PUZZLE = Object.freeze({
  id: "study_plan_alignment",
  title: "Align the original floorplan",
  kicker: "VALE RESIDENCE · SURVEY COPY",
  objective:
    "Rotate the 1912 floorplan until its rooms match the study around you.",
  requiredEvidenceId: "study_floorplan",
  initialRotation: 90,
  solutionRotation: 270,
  rotationStep: 90,
  hints: [
    {
      level: 1,
      text: "Align the 1912 floorplan with the room as it stands now.",
    },
    {
      level: 2,
      text: "Use the compass rose and the study doorway as fixed orientation points.",
    },
    {
      level: 3,
      text: "Rotate the plan until the WESTERN VOID sits directly behind the western bookcase.",
    },
  ],
  successCopy:
    "The western void settles directly behind the bookcase. Pressing the matching compass rose releases the shelves with a heavy mechanical click.",
  completionEffects: [
    { type: "setFlag", key: "foundWallCavity", value: true },
    { type: "unlockLocation", id: "hidden_room" },
  ],
});

export const RECORDING_PUZZLE = Object.freeze({
  id: "vale_recording_reconstruction",
  title: "Reconstruct the message",
  kicker: "AUDIO RECOVERY · SOURCE: E. VALE",
  instruction:
    "The timestamps are gone. Arrange the fragments so the captioned background sounds continue without a break.",
  requiredEvidenceId: "vale_damaged_recording",
  initialOrder: [
    "vale_recording_rain",
    "vale_recording_clock",
    "vale_recording_freight",
  ],
  correctOrder: [
    "vale_recording_clock",
    "vale_recording_freight",
    "vale_recording_rain",
  ],
  fragments: [
    {
      id: "vale_recording_rain",
      label: "Fragment A",
      audio: "./assets/audio/vale-fragment-rain.wav",
      caption: "[The train recedes beneath steady rain.]",
      transcript:
        "…do not trust the guest list. The names are the invitation, not the guests. Follow Northstar. If I am gone, I did not run.",
    },
    {
      id: "vale_recording_clock",
      label: "Fragment B",
      audio: "./assets/audio/vale-fragment-clock.wav",
      caption:
        "[A clock begins twelve chimes. A freight horn sounds in the distance.]",
      transcript:
        "…if someone found the invoice, then the irregularity worked. I needed the payment to look wrong…",
    },
    {
      id: "vale_recording_freight",
      label: "Fragment C",
      audio: "./assets/audio/vale-fragment-freight.wav",
      caption:
        "[The final chime fades beneath a passing freight train. Rain begins against glass.]",
      transcript:
        "…not a west wing. Beneath it. Meridian arrives Thursday…",
    },
  ],
  hints: [
    {
      level: 1,
      text: "Vale’s words are recoverable, but their timestamps are not. Build one continuous recording from all three fragments.",
    },
    {
      level: 2,
      text: "Ignore the sentence openings. Read the captions for what changes outside the room. Each fragment hands one background sound to the next.",
    },
    {
      level: 3,
      text: "Place the clock-chime fragment first, the passing freight train second, and the steady-rain fragment last.",
    },
  ],
  incorrectCopy:
    "The ambience jumps at the cuts. Each fragment should hand one background sound into the next.",
  successCopy:
    "The waveforms lock. Forty-seven seconds become one continuous recording.",
  recoveredTranscript:
    "If someone found the invoice, then the irregularity worked. I needed the payment to look wrong. Not a west wing. Beneath it. Meridian arrives Thursday. Do not trust the guest list. The names are the invitation, not the guests. Follow Northstar. If I am gone, I did not run.",
  recoveredAudio: "./assets/audio/vale-restored-message.wav",
  completionEffects: [
    { type: "setFlag", key: "recordingReconstructed", value: true },
    { type: "setFlag", key: "heardValeRecording", value: true },
    { type: "collectEvidence", id: "vale_reconstructed_message" },
  ],
});

export const PROLOGUE_ENDING_BEATS = Object.freeze([
  {
    id: "trail_realized",
    type: "narration",
    title: "A deliberate trail",
    text: "The last line settles across the board. Vale did not hide the irregularity. She made it loud enough for a stranger to hear.",
  },
  {
    id: "door_knock",
    type: "narration",
    title: "Three knocks",
    text: "Three knocks cut through the rain. Slow. Evenly spaced.",
    actionLabel: "Check the hallway",
  },
  {
    id: "empty_hall",
    type: "narration",
    title: "No one there",
    text: "The corridor is empty. The elevator indicator has not moved.",
  },
  {
    id: "envelope",
    type: "narration",
    title: "Across the threshold",
    text: "An unmarked envelope rests against the threshold, pushed just far enough inside to be impossible to miss.",
    actionLabel: "Open the envelope",
  },
  {
    id: "gala_photo",
    type: "evidence",
    title: "A face circled in red",
    text: "A photograph from a Brighter Horizon gala. Mayor Vale stands at the edge of the frame. The smiling man beside the podium is circled in red.",
    caption: "CASSIAN ROOK · FOUNDER, BRIGHTER HORIZON",
    evidenceId: "meridian_gala_photograph",
    completionEffects: [
      { type: "collectEvidence", id: "meridian_gala_photograph" },
      { type: "setFlag", key: "receivedGalaPhotograph", value: true },
    ],
  },
  {
    id: "northstar_lead",
    type: "lead",
    title: "The address on the back",
    text: "On the back, in block capitals: 1400 HARROW STREET. The same address printed on Northstar’s invoice.",
    label: "NEW LEAD · NORTHSTAR CONSTRUCTION · 1400 HARROW STREET",
    completionEffects: [
      { type: "setFlag", key: "northstarAddressIdentified", value: true },
      { type: "collectEvidence", id: "northstar_address" },
    ],
  },
  {
    id: "end_card",
    type: "end",
    title: "END OF PROLOGUE",
    subtitle: "THE RENOVATION",
    footer: "The next lead waits at 1400 Harrow Street.",
    actions: [
      { id: "review_case_file", label: "Review case file" },
      { id: "return_to_title", label: "Return to title" },
    ],
    completionEffects: [
      { type: "setPath", path: "progress.prologueComplete", value: true },
      { type: "unlockLocation", id: "northstar_harrow" },
    ],
  },
]);
