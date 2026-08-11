const DETAIL_OVERRIDES = Object.freeze({
  "mara-desk": {
    actionLabel: "Talk to Mara",
    dialogueId: "mara_field_editor",
    fieldNote:
      "Mara stayed after deadline without being asked. She expects the Vale story to become dangerous before she expects it to become publishable.",
    revisitText:
      "Mara has replaced the municipal budget on her screen with a map of every place you have visited. She is following the investigation even when she pretends not to.",
  },
  "deadline-clock": {
    fieldNote:
      "The Ledger's deadline clock runs four minutes fast. Everyone here measures truth against the press window.",
    revisitText:
      "The clock is still four minutes fast. The investigation is now several chapters late, and Mara has stopped mentioning the print deadline.",
  },
  "clerk-window": {
    actionWhen: { not: { type: "flag", key: "lionelNamedMarsh" } },
  },
  "records-policy": {
    fieldNote:
      "City Hall's public-records policy makes amendments harder to obtain than original filings—the exact records most likely to reveal who changed a decision.",
    revisitText:
      "A new laminated notice covers the line about amendments. Someone updated the policy after your first request.",
  },
  "delivery-marks": {
    fieldNote:
      "The delivery grooves at Vale's curb are too narrow for construction machinery and match a low, heavily loaded equipment van.",
    revisitText:
      "Rain has softened the grooves, but fresh chalk marks now bracket them. Someone else returned to measure the same tracks.",
  },
  "missing-book": {
    fieldNote:
      "The missing volume was an oversized maritime atlas. Vale may have removed it because a map mattered more than the book.",
    revisitText:
      "A second look reveals blue paper fibers caught in the shelf gap—the same stock used for nautical survey charts.",
  },
  "cable-conduit": {
    fieldNote:
      "The concealed room's data conduit leaves the house and joins the municipal trench beneath Bellweather Lane.",
    revisitText:
      "With the later network maps in mind, the conduit is unmistakable: this was a local terminal, never the center of Meridian's system.",
  },
  "harrow_elevator": {
    fieldNote:
      "Harrow Street's service elevator logs courier stops even though the building directory does not list Northstar.",
    revisitText:
      "A fresh service sticker covers yesterday's inspection seal. The elevator was opened after your first visit.",
  },
  "foundation_brochure_table": {
    fieldNote:
      "Brighter Horizon's newest brochure uses disaster photographs taken before several official emergency declarations.",
    revisitText:
      "The brochures you examined are gone. A blank acrylic stand now occupies the table, wiped clean of fingerprints.",
  },
  "gala_donor_display": {
    fieldNote:
      "The gala donor wall ranks benefactors by access level rather than donation amount.",
    revisitText:
      "After the gala, staff removed the names but left the brass access-level rails mounted to the wall.",
  },
  "service_champagne_tray": {
    fieldNote:
      "One untouched glass bears a wax-pencil room code instead of a guest name: ROOM B.",
    revisitText:
      "The tray has been washed, but the wax code remains beneath the rim where staff missed it.",
  },
  "saltmere_kettle": {
    fieldNote:
      "Mina packed documents and medicine but left the kettle warm. Her disappearance was hurried, not planned.",
    revisitText:
      "The power is off now. A utility seal dated this morning suggests someone wants the apartment to look abandoned.",
  },
  "archive_pneumatic_terminal": {
    fieldNote:
      "The archive's pneumatic terminal bypasses the public request desk and delivers sealed files directly to Records Cage Nine.",
    revisitText:
      "The terminal has been disconnected since your first visit. Its final routing slip was torn away, not archived.",
  },
  "community_noticeboard": {
    fieldNote:
      "Bellwether's relief notices were printed two days before residents were told the water was unsafe.",
    revisitText:
      "Someone has pinned a correction over the dates. The original staple holes still give the sequence away.",
  },
  "annex_river_windows": {
    fieldNote:
      "From the annex, the university intake pipe and Bellwether's Deepwell outlet share the same bend in the river.",
    revisitText:
      "At lower tide, a third submerged pipe becomes visible between the university intake and the Deepwell outlet.",
  },
  "verdant_outflow": {
    fieldNote:
      "The conservation parcel's outflow is fitted with sampling ports on the upstream side—designed to measure an intervention, not ordinary runoff.",
    revisitText:
      "Fresh epoxy seals one sampling port. Someone returned to remove a sensor after you photographed the rig.",
  },
  "crownline_server_hall": {
    fieldNote:
      "Crownline's supposedly redundant server rows all depend on one privately labeled continuity circuit.",
    revisitText:
      "The continuity circuit now reads as routine maintenance. The hurried relabeling is one shade brighter than every other tag.",
  },
  "airfield_convoy": {
    fieldNote:
      "The airfield convoy carries relief markings on the outward side and unmarked armored panels facing the runway.",
    revisitText:
      "The convoy is gone. Clean rectangles on the wet tarmac show where three additional vehicles waited outside the camera line.",
  },
  "working_boats": {
    fieldNote:
      "Local fishing boats keep their radios off near Blackwater Point, as if the harbor is listening.",
    revisitText:
      "One skipper has chalked a compass-star beneath the gunwale—the same warning symbol June Bell sketched in Greyhaven.",
  },
  "orpheus_launch_berth": {
    fieldNote:
      "The Orpheus launch berth has two tide gauges: one for navigation and one calibrated to the island's hidden freight elevator.",
    revisitText:
      "The freight gauge has been removed, leaving four bright bolt holes and a cable that still pulses once a minute.",
  },
  "first_circle_gallery": {
    fieldNote:
      "The observation gallery is designed so donors can watch votes without appearing in the chamber registry.",
    revisitText:
      "The gallery glass is opaque now. Meridian can erase an audience faster than it can erase a vote.",
  },
  "aster_rain_windows": {
    fieldNote:
      "Aster House overlooks three municipal relay roofs and the emergency route toward Port Prosper.",
    revisitText:
      "With the trigger cell exposed, the view reads like a targeting diagram rather than an expensive skyline.",
  },
  "port_prosper_rain_harbor": {
    fieldNote:
      "Port Prosper's harbor lights stayed on because the countermeasure reached the city in time. One dark relay marks the six-minute breach.",
    revisitText:
      "On return, the dark relay is lit again—but its traffic is being mirrored toward an offshore address.",
  },
  "port_prosper_quiet_warning_result": {
    actionLabel: "Talk to Imani Cross",
    dialogueId: "port_prosper_engineer",
  },
  "port_prosper_publication_result": {
    actionLabel: "Talk to Imani Cross",
    dialogueId: "port_prosper_engineer",
  },
  "port_prosper_deep_cover_result": {
    actionLabel: "Talk to Imani Cross",
    dialogueId: "port_prosper_engineer",
  },
});

const EXTRA_HOTSPOTS = Object.freeze({
  ledger_newsroom: [
    {
      id: "newsroom-copy-desk",
      label: "Copy desk proofs",
      x: 45,
      y: 56,
      width: 22,
      height: 24,
      title: "Tomorrow's front page",
      text: "A blank strip below the fold waits for the municipal story Mara expects you to file.",
      actionLabel: "Photograph the page plan",
      toolId: "smartphone",
      actionWhen: { not: { type: "interactionComplete", id: "newsroom-copy-desk" } },
      effects: [],
      resultText:
        "The page plan preserves the original deadline and word count. If the Ledger later denies commissioning the story, you have a timestamped record.",
      fieldNote:
        "Mara reserved front-page space for the Vale investigation before anyone knew how far it would reach.",
    },
    {
      id: "newsroom-police-scanner",
      label: "Police scanner",
      x: 57,
      y: 28,
      width: 10,
      height: 25,
      title: "Muted police scanner",
      text: "The scanner is muted, but its display keeps repeating a welfare-check code for Bellweather Lane.",
      actionLabel: "Capture the dispatch loop",
      toolId: "recorder",
      actionWhen: { not: { type: "interactionComplete", id: "newsroom-police-scanner" } },
      effects: [],
      resultText:
        "The loop includes a canceled second unit. Someone downgraded the response four minutes after it was dispatched.",
      fieldNote:
        "Vale's welfare check was quietly reduced from two police units to one.",
    },
  ],
  city_hall: [
    {
      id: "finance-dropbox",
      label: "Finance dropbox",
      x: 61,
      y: 62,
      width: 14,
      height: 23,
      title: "After-hours finance dropbox",
      text: "Vendor changes can be deposited here without passing the public records window.",
      actionLabel: "Log a formal access request",
      toolId: "press_credentials",
      actionWhen: { not: { type: "interactionComplete", id: "finance-dropbox" } },
      effects: [],
      resultText:
        "Your press credentials produce a numbered receipt. The clerk cannot make this request disappear without creating another record.",
      fieldNote:
        "The Finance dropbox creates a separate paper trail for after-hours vendor changes.",
    },
    {
      id: "hall-security-camera",
      label: "Security camera",
      x: 67,
      y: 5,
      width: 12,
      height: 17,
      title: "Camera aimed at Records",
      text: "The camera covers Lionel's window and the amendment terminal, but not the public entrance.",
      fieldNote:
        "City Hall monitors the people changing records more closely than the people entering the building.",
    },
  ],
  mayor_street: [
    {
      id: "storm-drain-hum",
      label: "Storm drain",
      x: 20,
      y: 72,
      width: 16,
      height: 17,
      title: "A hum beneath the street",
      text: "A steady electronic vibration rises through the storm grate opposite Vale's side gate.",
      actionLabel: "Record the frequency",
      toolId: "recorder",
      actionWhen: { not: { type: "interactionComplete", id: "storm-drain-hum" } },
      effects: [],
      resultText:
        "The recorder isolates a repeating carrier tone beneath the rain. It is data equipment, not drainage machinery.",
      fieldNote:
        "A live data carrier runs beneath Bellweather Lane toward Vale's concealed room.",
    },
    {
      id: "unmarked-utility-box",
      label: "Utility box",
      x: 83,
      y: 45,
      width: 12,
      height: 32,
      title: "Unmarked utility cabinet",
      text: "Every cabinet on the street bears a city seal except this one.",
      fieldNote:
        "An unmarked utility cabinet sits on the same trench line as Vale's side gate.",
    },
  ],
  mayor_study: [
    {
      id: "study-telephone",
      label: "Desk telephone",
      x: 67,
      y: 64,
      width: 13,
      height: 18,
      title: "Telephone with a severed line",
      text: "The line was cut cleanly from inside the room. The handset still holds a faint burst of recorded dial tone.",
      actionLabel: "Sample the line noise",
      toolId: "recorder",
      actionWhen: { not: { type: "interactionComplete", id: "study-telephone" } },
      effects: [],
      resultText:
        "Beneath the dial tone is the same carrier frequency recorded outside. The study line was patched through the hidden room.",
      fieldNote:
        "Vale's study telephone shared the concealed room's underground data carrier.",
    },
  ],
  hidden_room: [
    {
      id: "hidden-wall-calendar",
      label: "Punctured schedule",
      x: 45,
      y: 23,
      width: 12,
      height: 35,
      title: "Schedule without appointments",
      text: "Most dates are blank. Every second Thursday has been punctured with the point of a compass.",
      actionLabel: "Photograph the pattern",
      toolId: "smartphone",
      actionWhen: { not: { type: "interactionComplete", id: "hidden-wall-calendar" } },
      effects: [],
      resultText:
        "The punctures continue for eighteen months. Meridian sessions were routine long before the Vale invoice leaked.",
      fieldNote:
        "Meridian used Vale's hidden room on a repeating second-Thursday schedule for at least eighteen months.",
    },
    {
      id: "hidden-spare-chair",
      label: "Spare chair",
      x: 62,
      y: 59,
      width: 14,
      height: 29,
      title: "A second operator's chair",
      text: "One chair faces the recovery console. This one faces the printer and the street conduit.",
      fieldNote:
        "The hidden room was staffed by at least two operators; Vale was not working alone.",
    },
  ],
});

export function getInteractiveLocation(location) {
  if (!location) return location;
  const extras = EXTRA_HOTSPOTS[location.id] || [];
  return {
    ...location,
    hotspots: [
      ...(location.hotspots || []).map((hotspot) => ({
        ...hotspot,
        ...(DETAIL_OVERRIDES[hotspot.id] || {}),
      })),
      ...extras,
    ],
  };
}

export const EXPLORATION_DETAIL_OVERRIDES = DETAIL_OVERRIDES;
export const EXTRA_LOCATION_HOTSPOTS = EXTRA_HOTSPOTS;
