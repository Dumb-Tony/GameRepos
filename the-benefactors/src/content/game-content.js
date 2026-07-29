export const EVIDENCE = Object.freeze({
  email_meridian: {
    id: "email_meridian",
    title: "Anonymous email",
    category: "document",
    summary: "A tip alleging Mayor Vale diverted accessibility funds.",
    artifact: {
      type: "email",
      from: "undisclosed",
      to: "investigations@greyhavenledger.test",
      sent: "Tuesday · 9:41 PM",
      subject: "(no subject)",
      paragraphs: [
        "Mayor Vale diverted accessibility funds to build a private west wing.",
        "The city paid Northstar Construction. Northstar does not exist.",
        "Ask why the west wing must be ready before the Meridian guests arrive.",
        "Start with the invoice.",
      ],
      highlightedPhrase: "Meridian guests",
    },
  },
  invoice_northstar: {
    id: "invoice_northstar",
    title: "Northstar invoice",
    category: "document",
    summary: "$184,600 billed to the municipal accessibility fund.",
    artifact: {
      type: "invoice",
      invoiceNumber: "NS-8841",
      vendor: "NORTHSTAR CONSTRUCTION GROUP",
      vendorAddress: "1400 Harrow Street, Suite 410 · Greyhaven",
      billedTo: "City of Greyhaven · Municipal Accessibility Fund",
      project: "Vale Residence — West Wing Accessibility Improvement",
      issueDate: "March 14",
      dueDate: "PAID · March 17",
      lineItems: [
        ["Structural excavation and reinforcement", "$62,400.00"],
        ["Electrical and shielded communications conduit", "$47,800.00"],
        ["Acoustic isolation materials", "$28,900.00"],
        ["Secure access hardware", "$31,500.00"],
        ["Site restoration and administrative fee", "$14,000.00"],
      ],
      total: "$184,600.00",
      account: "ACCESS-IMPROVEMENT / 44-018",
      authorization: "E. VALE",
      footer: "Payment remitted to Northstar Holdings Clearing Account 7719.",
    },
  },
  permit_summary: {
    id: "permit_summary",
    title: "West-wing permit summary",
    category: "document",
    summary: "A public permit summary for an addition to Mayor Vale’s home.",
    artifact: {
      type: "permit",
      permitNumber: "18-441-W",
      status: "APPROVED — REVISION PENDING",
      address: "17 Bellweather Lane, Greyhaven",
      applicant: "Office of Mayor Evelyn Vale",
      contractor: "Northstar Construction Group",
      scope: "West-wing accessibility improvement and residential lift access.",
      filed: "March 12 · 4:16 PM",
      revised: "March 18 · 12:43 AM",
      inspection: "March 17 · 10:20 AM",
      warning:
        "Amendment history restricted. Submit Form 17-C to the Records Division.",
    },
  },
  permit_amendment_note: {
    id: "permit_amendment_note",
    title: "Permit amendment note",
    category: "document",
    summary: "An amendment authorized after midnight by someone identified as E. Marsh.",
    artifact: {
      type: "memo",
      heading: "RECORDS TERMINAL — HANDWRITTEN NOTE",
      body: [
        "Permit 18-441-W amended after inspection.",
        "Emergency authorization token: E. MARSH",
        "Timestamp: 12:43 AM",
        "Lionel insists the change came after the inspection, not before.",
      ],
      handwritten: "You did not hear this from me. — L.P.",
    },
  },
  june_statement: {
    id: "june_statement",
    title: "June Bell’s statement",
    category: "recording",
    summary: "Deliveries arrived at night, but no above-ground construction followed.",
    artifact: {
      type: "transcript",
      heading: "RECORDED STATEMENT — JUNE BELL",
      timestamp: "4:31 PM · Bellweather Lane",
      lines: [
        ["ROWAN", "How many deliveries did you see?"],
        ["JUNE BELL", "Three trucks after midnight. Men carried equipment through the side gate."],
        ["ROWAN", "And the west-wing construction?"],
        ["JUNE BELL", "There was none. I would have noticed a room appearing."],
        ["JUNE BELL", "I felt drilling through my floorboards, though. It came from below."],
      ],
    },
  },
  photo_west_wall: {
    id: "photo_west_wall",
    title: "Photograph of Vale’s west wall",
    category: "photograph",
    summary: "The original brickwork and roofline are intact. No west wing was built.",
    artifact: {
      type: "photo",
      caption: "WEST ELEVATION · 17 BELLWEATHER LANE · 4:26 PM",
      annotations: [
        "Original 1912 brickwork remains uninterrupted",
        "No new roofline, foundation, or exterior access",
        "Heavy tire marks terminate beside the side gate",
      ],
    },
  },
  study_floorplan: {
    id: "study_floorplan",
    title: "Original Vale house floorplan",
    category: "document",
    summary: "An older plan marks dead space behind the study’s western bookcase.",
    artifact: {
      type: "floorplan",
      heading: "VALE RESIDENCE — ORIGINAL GROUND FLOOR",
      revision: "Survey copy · September 1912",
      rooms: ["STUDY", "HALL", "PARLOR", "SERVICE STAIR", "WESTERN VOID"],
      note: "The current study bookcase sits 31 inches forward of the wall shown here.",
    },
  },
  vale_damaged_recording: {
    id: "vale_damaged_recording",
    title: "Mayor Vale’s damaged recorder",
    category: "recording",
    summary: "Three recovered fragments have lost their timestamps.",
    artifact: {
      type: "recording",
      heading: "E. VALE — DICTATION RECORDER",
      duration: "00:47 recovered",
      fragments: [
        "Fragment A — timestamp unreadable",
        "Fragment B — timestamp unreadable",
        "Fragment C — timestamp unreadable",
      ],
      background: ["three ambient markers detected", "sequence unavailable"],
    },
  },
  vale_reconstructed_message: {
    id: "vale_reconstructed_message",
    title: "Vale’s reconstructed message",
    category: "recording",
    summary:
      "Vale made the irregular invoice conspicuous and named Meridian as the reason.",
    artifact: {
      type: "recording",
      heading: "E. VALE — RECOVERED MESSAGE",
      duration: "00:47 continuous",
      fragments: [
        "If someone found the invoice, then the irregularity worked. I needed the payment to look wrong.",
        "Not a west wing. Beneath it. Meridian arrives Thursday.",
        "Do not trust the guest list. The names are the invitation, not the guests. Follow Northstar. If I am gone, I did not run.",
      ],
      background: ["midnight chime", "freight train", "steady rain"],
    },
  },
  meridian_guest_list_header: {
    id: "meridian_guest_list_header",
    title: "Meridian guest-list header",
    category: "document",
    summary:
      "A torn printout confirms a Meridian session beneath the Vale residence.",
    artifact: {
      type: "memo",
      heading: "MERIDIAN / GREYHAVEN SESSION",
      body: [
        "THURSDAY · 21:00",
        "HOST SITE: VALE / ROOM B",
        "ATTENDEES: [PAGE TORN]",
        "PRINT QUEUE SOURCE: TERMINAL 06",
        "RECOVERY STATUS: HEADER ONLY",
      ],
      handwritten: "Only the header survived in the printer tray.",
    },
  },
  northstar_address: {
    id: "northstar_address",
    title: "Northstar registered address",
    category: "location",
    summary: "1400 Harrow Street, Suite 410 — the next lead in Greyhaven.",
    artifact: {
      type: "memo",
      heading: "NEXT LEAD — NORTHSTAR CONSTRUCTION",
      body: [
        "1400 HARROW STREET · SUITE 410",
        "The address appears on Northstar invoice NS-8841.",
        "Vale’s reconstructed message says to follow Northstar.",
      ],
      handwritten: "Find out who collects the mail.",
    },
  },
  meridian_gala_photograph: {
    id: "meridian_gala_photograph",
    title: "Circled gala photograph",
    category: "photograph",
    summary:
      "A Brighter Horizon gala photograph delivered anonymously, with one face circled.",
    artifact: {
      type: "photo",
      image: "./assets/evidence/gala-photograph.webp",
      alt:
        "A formal humanitarian gala group photograph. A watchful man at the right edge is circled in dark red.",
      caption: "BRIGHTER HORIZON WINTER BENEFIT · PRESS PHOTOGRAPH",
      annotations: [
        "CASSIAN ROOK — founder, centered beneath the donor wall",
        "MAYOR EVELYN VALE — identified near the edge of the original print",
        "UNKNOWN MAN — circled after the photograph was printed",
        "Reverse: 1400 HARROW STREET",
      ],
    },
  },
  harrow_directory_photo: {
    id: "harrow_directory_photo",
    title: "Harrow Street directory photograph",
    category: "photograph",
    summary: "The fourth-floor directory stops at Suite 409. Suite 410 does not exist.",
    artifact: {
      type: "photo",
      caption: "1400 HARROW STREET · FOURTH-FLOOR DIRECTORY",
      annotations: [
        "SUITES 401–409 listed in sequence",
        "No blank plate or removed lettering after Suite 409",
        "Northstar invoice lists SUITE 410",
        "Directory frame predates Northstar’s city registration",
      ],
    },
  },
  harrow_manager_statement: {
    id: "harrow_manager_statement",
    title: "Oren Pike’s statement",
    category: "recording",
    summary: "The building manager never saw Northstar staff, only weekly courier pickups.",
    artifact: {
      type: "transcript",
      heading: "RECORDED STATEMENT — OREN PIKE",
      timestamp: "2:16 PM · 1400 Harrow Street",
      lines: [
        ["ROWAN", "Who worked in Suite 410?"],
        ["OREN PIKE", "Nobody. There is no 410. Never has been."],
        ["ROWAN", "Then who collected Northstar’s mail?"],
        ["OREN PIKE", "A courier came every Friday. Same green badge as the Brighter Horizon people."],
        ["OREN PIKE", "Yesterday they emptied the box and told me to return anything new."],
      ],
    },
  },
  northstar_courier_manifest: {
    id: "northstar_courier_manifest",
    title: "Northstar courier manifest",
    category: "document",
    summary: "Northstar mail was redirected through Brighter Horizon’s local office.",
    artifact: {
      type: "memo",
      heading: "HARROW STREET — COURIER PICKUP LOG",
      body: [
        "ACCOUNT: NORTHSTAR CONSTRUCTION GROUP",
        "PICKUP: FRIDAY · 17:30 · LOBBY HOLD",
        "ROUTE: BRIGHTER HORIZON / GREYHAVEN LOCAL",
        "AUTHORIZED CONTACT: E. MARSH",
        "FINAL COLLECTION: YESTERDAY · BOX CLOSED",
      ],
      handwritten: "Return all new Northstar mail to sender. — O.P.",
    },
  },
  brighter_horizon_connection: {
    id: "brighter_horizon_connection",
    title: "Brighter Horizon connection",
    category: "organization",
    summary: "Northstar’s mail and E. Marsh both route through Brighter Horizon.",
    artifact: {
      type: "memo",
      heading: "NEW LEAD — BRIGHTER HORIZON",
      body: [
        "GREYHAVEN LOCAL OFFICE · 8 CALDER SQUARE",
        "Northstar’s courier route terminates at the foundation.",
        "The pickup authorization names E. Marsh—the same token on Vale’s permit amendment.",
        "The anonymous gala photograph identifies founder Cassian Rook.",
      ],
      handwritten: "A charity receiving mail for a contractor that does not exist.",
    },
  },
  calder_donor_wall_photo: {
    id: "calder_donor_wall_photo",
    title: "Brighter Horizon donor-wall photograph",
    category: "photograph",
    summary:
      "The Calder Square donor wall quietly places Vale, Rook, and the circled gala guest in the same campaign.",
    artifact: {
      type: "photo",
      caption: "BRIGHTER HORIZON · GREYHAVEN FOUNDERS' WALL",
      annotations: [
        "CASSIAN ROOK — GLOBAL FOUNDER",
        "MAYOR EVELYN VALE — GREYHAVEN ACCESS PARTNERSHIP",
        "The circled man appears in an older campaign photograph",
        "Plaque date predates Northstar’s registration by eleven months",
      ],
    },
  },
  celia_orr_statement: {
    id: "celia_orr_statement",
    title: "Celia Orr’s statement",
    category: "recording",
    summary:
      "Brighter Horizon denies employing E. Marsh but admits its visitor system used that authorization.",
    artifact: {
      type: "transcript",
      heading: "RECORDED STATEMENT — CELIA ORR",
      timestamp: "10:42 AM · 8 Calder Square",
      lines: [
        ["ROWAN", "Who is E. Marsh?"],
        ["CELIA ORR", "No one employed by this foundation."],
        ["ROWAN", "The same name authorized Northstar’s courier route."],
        ["CELIA ORR", "Field partners sometimes use shared administrative credentials."],
        ["ROWAN", "Then the visitor terminal should show who used it."],
      ],
    },
  },
  foundation_visitor_log: {
    id: "foundation_visitor_log",
    title: "Calder Square visitor log",
    category: "document",
    summary:
      "E. Marsh repeatedly signed in for both Brighter Horizon and Northstar meetings.",
    artifact: {
      type: "memo",
      heading: "VISITOR ACCESS EXTRACT · CALDER SQUARE",
      body: [
        "CREDENTIAL: E. MARSH / TEMPORARY ADMINISTRATOR",
        "09 MAY · NORTHSTAR CIVIC WORKS · FINANCE OFFICE",
        "16 MAY · BRIGHTER HORIZON · GREYHAVEN PROGRAMS",
        "23 MAY · NORTHSTAR CIVIC WORKS · COURIER AUTHORIZATION",
        "30 MAY · MERIDIAN SESSION · CALDER GRAND SERVICE ENTRY",
      ],
      handwritten: "One credential, three organizations.",
    },
  },
  foundation_disbursement_report: {
    id: "foundation_disbursement_report",
    title: "Brighter Horizon disbursement report",
    category: "financial",
    summary:
      "A foundation emergency grant funded Northstar one day before the city paid the same invoice.",
    artifact: {
      type: "memo",
      heading: "GREYHAVEN RAPID ACCESS FUND · QUARTERLY DISBURSEMENTS",
      body: [
        "PROGRAM GY-14 · SECURE ACCESS INFRASTRUCTURE",
        "RECIPIENT: NORTHSTAR CIVIC WORKS",
        "FOUNDATION ADVANCE: $184,600",
        "DATE RELEASED: 11 MAY · 08:14",
        "MUNICIPAL REIMBURSEMENT: 12 MAY · $184,600",
        "INTERNAL ROUTING: MERIDIAN / ROOM B",
      ],
      handwritten: "The charity advanced the exact invoice amount.",
    },
  },
  calder_gala_invitation: {
    id: "calder_gala_invitation",
    title: "Calder Grand gala invitation",
    category: "event",
    summary:
      "Brighter Horizon’s closed benefit at the Calder Grand is the next chance to identify the circled man.",
    artifact: {
      type: "memo",
      heading: "BRIGHTER HORIZON · GREYHAVEN WINTER BENEFIT",
      body: [
        "THURSDAY · 7:30 PM",
        "THE CALDER GRAND · EAST BALLROOM",
        "FOUNDERS’ RECEPTION · INVITATION ONLY",
        "SERVICE ACCESS: STAFF AND APPROVED VENDORS",
        "KEYNOTE: CASSIAN ROOK",
      ],
      handwritten: "The photograph was taken at this event. Find the man in the circle.",
    },
  },
  gala_seating_plan: {
    id: "gala_seating_plan",
    title: "Calder Grand seating plan",
    category: "document",
    summary:
      "Cassian Rook has a public table. The circled guest has no assigned seat at all.",
    artifact: {
      type: "memo",
      heading: "BRIGHTER HORIZON WINTER BENEFIT · EAST BALLROOM",
      body: [
        "PODIUM: CASSIAN ROOK · FOUNDER",
        "TABLE 01: MUNICIPAL PARTNERS",
        "TABLE 02: GLOBAL RESPONSE COUNCIL",
        "TABLE 03: PRIVATE DONORS",
        "SILAS WREN: NO PUBLIC SEAT · SERVICE ACCESS",
      ],
      handwritten: "A guest important enough to enter, but not to appear.",
    },
  },
  imani_kade_statement: {
    id: "imani_kade_statement",
    title: "Imani Kade’s statement",
    category: "recording",
    summary:
      "The coat-check attendant identifies the circled guest as Silas Wren and says he used the service entrance.",
    artifact: {
      type: "transcript",
      heading: "RECORDED STATEMENT · IMANI KADE",
      timestamp: "8:14 PM · CALDER GRAND EAST BALLROOM",
      lines: [
        ["ROWAN", "Do you recognize the man in this photograph?"],
        ["IMANI KADE", "Silas Wren. He never checks a coat and never enters through the ballroom."],
        ["ROWAN", "Then why is he at a public benefit?"],
        ["IMANI KADE", "He is not here for the public part."],
      ],
    },
  },
  gala_terrace_photo: {
    id: "gala_terrace_photo",
    title: "Rook and Wren terrace photograph",
    category: "photograph",
    summary:
      "Cassian Rook quietly meets Silas Wren while the ballroom applauds the foundation’s public promises.",
    artifact: {
      type: "photo",
      caption: "CALDER GRAND · EAST TERRACE · 8:27 PM",
      annotations: [
        "CASSIAN ROOK leaves the podium during donor applause",
        "SILAS WREN waits outside the public seating plan",
        "Rook hands Wren a brass service credential",
        "Both men enter the staff corridor marked ROOM B",
      ],
    },
  },
  gala_service_pass: {
    id: "gala_service_pass",
    title: "Calder Grand service pass",
    category: "access",
    summary:
      "A dropped all-access credential opens the staff corridor behind the benefit.",
    artifact: {
      type: "memo",
      heading: "CALDER GRAND · EVENT OPERATIONS",
      body: [
        "ACCESS LEVEL: SERVICE / ALL FLOORS",
        "EVENT: BRIGHTER HORIZON WINTER BENEFIT",
        "HOLDER: TEMPORARY OPERATIONS",
        "VALID THROUGH: 02:00",
        "RETURN TO EAST BALLROOM COAT CHECK",
      ],
      handwritten: "Wren dropped it. Imani did not see you pick it up.",
    },
  },
  cassian_rook_statement: {
    id: "cassian_rook_statement",
    title: "Cassian Rook’s statement",
    category: "recording",
    summary:
      "Rook calls Northstar an emergency instrument and refuses to say who authorized it.",
    artifact: {
      type: "transcript",
      heading: "RECORDED EXCHANGE · CASSIAN ROOK",
      timestamp: "8:22 PM · CALDER GRAND",
      lines: [
        ["ROWAN", "Why did your foundation finance Northstar?"],
        ["CASSIAN ROOK", "During emergencies, useful instruments are rarely elegant."],
        ["ROWAN", "Northstar was not a contractor. It was a false identity."],
        ["CASSIAN ROOK", "Then I suggest you ask who required the instrument, not who paid for it."],
      ],
    },
  },
  gala_contractor_roster: {
    id: "gala_contractor_roster",
    title: "Room B contractor roster",
    category: "document",
    summary:
      "Northstar appears among five temporary contractors routed through Brighter Horizon programs.",
    artifact: {
      type: "memo",
      heading: "CALDER GRAND · SERVICE DELIVERY ROSTER",
      body: [
        "ROOM B · SECURE INFRASTRUCTURE SESSION",
        "NORTHSTAR CIVIC WORKS · GREYHAVEN ACCESS",
        "DEEPWELL RESPONSE · REGIONAL WATER",
        "CROWNLINE SYSTEMS · DATA RESILIENCE",
        "VERDANT SHELTER GROUP · CONSERVATION",
        "ALL ACCOUNTS ROUTED THROUGH PROGRAM ADVANCES",
      ],
      handwritten: "Northstar was not an exception. It was a template.",
    },
  },
  room_b_conversation: {
    id: "room_b_conversation",
    title: "Room B conversation",
    category: "recording",
    summary:
      "Rook and Wren discuss shutting down Northstar as one of several expendable contractor identities.",
    artifact: {
      type: "recording",
      heading: "CALDER GRAND · ROOM B · RECOVERED AUDIO",
      duration: "00:38",
      fragments: [
        "ROOK: Vale made the Greyhaven account visible. That was the failure.",
        "WREN: Northstar is closed. The other instruments remain compartmentalized.",
        "ROOK: Move Harcourt before anyone audits the program advances.",
        "WREN: Her forwarding address is already being handled.",
      ],
      background: ["ballroom applause through the wall", "freight elevator bell"],
    },
  },
  accountant_forwarding_slip: {
    id: "accountant_forwarding_slip",
    title: "Mina Harcourt forwarding slip",
    category: "location",
    summary:
      "A discarded payroll envelope names the former Brighter Horizon accountant and her last known address.",
    artifact: {
      type: "memo",
      heading: "RETURNED PAYROLL · FORWARDING REQUEST",
      body: [
        "MINA HARCOURT · FORMER PROGRAM ACCOUNTANT",
        "BRIGHTER HORIZON · GREYHAVEN",
        "FORWARD TO: 26 SALTMERE WALK · APARTMENT 3C",
        "STATUS: TERMINATED · RECORDS HOLD",
      ],
      handwritten: "Rook said to move Harcourt. Find her first.",
    },
  },
});

export const INVENTORY_ITEMS = Object.freeze({
  press_credentials: { id: "press_credentials", name: "Press credentials", icon: "ID" },
  smartphone: { id: "smartphone", name: "Phone & camera", icon: "CAM" },
  recorder: { id: "recorder", name: "Audio recorder", icon: "REC" },
  notebook: { id: "notebook", name: "Reporter’s notebook", icon: "NOTE" },
});

export const DIALOGUES = Object.freeze({
  lionel_records: {
    id: "lionel_records",
    character: "Lionel Price",
    portrait: "LP",
    portraitAsset: "./assets/scenes/lionel-price.webp",
    start: "intro",
    nodes: {
      intro: {
        id: "intro",
        speaker: "Lionel Price",
        text: "Everything available to the public is in the summary. If it is not in the summary, it is not available.",
        choices: [
          {
            id: "ask-amendment",
            text: "Who filed the amendment?",
            next: "denial",
          },
          {
            id: "show-invoice",
            text: "Then explain this Northstar invoice.",
            evidenceId: "invoice_northstar",
            requires: { type: "hasEvidence", id: "invoice_northstar" },
            next: "invoice",
          },
          { id: "leave", text: "That’s all for now.", end: true },
        ],
      },
      denial: {
        id: "denial",
        speaker: "Lionel Price",
        text: "There was no amendment. You are mistaking a system timestamp for a filing.",
        choices: [
          {
            id: "show-permit",
            text: "The public summary says ‘revision pending.’",
            evidenceId: "permit_summary",
            requires: { type: "hasEvidence", id: "permit_summary" },
            effects: [
              { type: "setFlag", key: "caughtLionelContradiction", value: true },
            ],
            next: "defensive",
          },
          { id: "ask-system", text: "Who can access the system after hours?", next: "system" },
          { id: "leave", text: "I’ll come back with the paperwork.", end: true },
        ],
      },
      invoice: {
        id: "invoice",
        speaker: "Lionel Price",
        text: "Northstar is a registered vendor. Or it was when the payment cleared. Vendor status is Finance, not Records.",
        choices: [
          { id: "press", text: "You checked after I arrived, didn’t you?", next: "defensive" },
          { id: "back", text: "Let’s start again.", next: "intro" },
        ],
      },
      system: {
        id: "system",
        speaker: "Lionel Price",
        text: "The mayor, the deputy clerk, Information Services, and anyone with an emergency authorization token.",
        choices: [
          { id: "ask-token", text: "Who used an emergency token?", next: "defensive" },
          { id: "back", text: "Back up.", next: "denial" },
        ],
      },
      defensive: {
        id: "defensive",
        speaker: "Lionel Price",
        text: "I did not authorize it. The log says E. Marsh, 12:43 AM. That is all I know—and you did not hear it from me.",
        onEnter: [
          { type: "setFlag", key: "lionelNamedMarsh", value: true },
          { type: "collectEvidence", id: "permit_amendment_note" },
        ],
        choices: [
          { id: "protect", text: "I’ll keep your name out of it.", next: "protected" },
          { id: "challenge", text: "You should have reported this.", next: "resentful" },
        ],
      },
      protected: {
        id: "protected",
        speaker: "Lionel Price",
        text: "Then write this down: the change came after the inspection, not before. That is not how permits work.",
        choices: [{ id: "finish", text: "Thank you, Lionel.", end: true }],
      },
      resentful: {
        id: "resentful",
        speaker: "Lionel Price",
        text: "To whom? The mayor? The deputy clerk? You still think the forms protect the people who file them.",
        choices: [{ id: "finish", text: "I have what I need.", end: true }],
      },
    },
  },
  june_window: {
    id: "june_window",
    character: "June Bell",
    portrait: "JB",
    portraitAsset: "./assets/scenes/june-bell.webp",
    start: "intro",
    nodes: {
      intro: {
        id: "intro",
        speaker: "June Bell",
        text: "If you’re selling something, I’m eighty years old and already own too much of everything.",
        choices: [
          { id: "press", text: "I’m with the Greyhaven Ledger.", next: "journalist" },
          { id: "direct", text: "Did you see construction at Mayor Vale’s house?", next: "construction" },
          { id: "leave", text: "Sorry to bother you.", end: true },
        ],
      },
      journalist: {
        id: "journalist",
        speaker: "June Bell",
        text: "A journalist? The last one who came here wanted a photograph of Evelyn planting tulips.",
        choices: [
          { id: "ask-delivery", text: "I’m interested in the nighttime deliveries.", next: "construction" },
          { id: "leave", text: "I may come back.", end: true },
        ],
      },
      construction: {
        id: "construction",
        speaker: "June Bell",
        text: "Three trucks after midnight. Men carried equipment through the side gate. But nobody built a west wing. I would have noticed a room appearing.",
        onEnter: [
          { type: "setFlag", key: "juneSawDeliveries", value: true },
          { type: "collectEvidence", id: "june_statement" },
        ],
        choices: [
          { id: "ask-sound", text: "What did you hear?", next: "sound" },
          { id: "ask-men", text: "Could you identify the workers?", next: "workers" },
        ],
      },
      sound: {
        id: "sound",
        speaker: "June Bell",
        text: "A low vibration. Not hammering—more like drilling, except it came up through the floorboards.",
        choices: [{ id: "finish", text: "May I quote you?", end: true }],
      },
      workers: {
        id: "workers",
        speaker: "June Bell",
        text: "No uniforms. One van had a compass-star logo. I sketched it because I did not trust my memory.",
        choices: [{ id: "finish", text: "I’d like to see that sketch later.", end: true }],
      },
    },
  },
  harrow_manager: {
    id: "harrow_manager",
    character: "Oren Pike",
    portrait: "OP",
    start: "intro",
    nodes: {
      intro: {
        id: "intro",
        speaker: "Oren Pike",
        text: "If you are here for 410, save yourself the walk. This floor ends at 409.",
        choices: [
          {
            id: "show-address",
            text: "Northstar lists Suite 410 as its registered office.",
            evidenceId: "northstar_address",
            requires: { type: "hasEvidence", id: "northstar_address" },
            next: "northstar",
          },
          { id: "ask-directory", text: "Was a plate removed from the directory?", next: "directory" },
          { id: "leave", text: "I’ll look around.", end: true },
        ],
      },
      directory: {
        id: "directory",
        speaker: "Oren Pike",
        text: "That brass has been there since my father ran the desk. There was never another office after 409.",
        choices: [
          {
            id: "show-address",
            text: "Then explain Northstar’s registered address.",
            evidenceId: "northstar_address",
            requires: { type: "hasEvidence", id: "northstar_address" },
            next: "northstar",
          },
          { id: "back", text: "Let me ask something else.", next: "intro" },
        ],
      },
      northstar: {
        id: "northstar",
        speaker: "Oren Pike",
        text: "Never saw an employee. Their mail sat in my hold box until a courier collected it every Friday.",
        onEnter: [
          { type: "setFlag", key: "questionedHarrowManager", value: true },
          { type: "collectEvidence", id: "harrow_manager_statement" },
        ],
        choices: [
          { id: "ask-courier", text: "Who sent the courier?", next: "courier" },
          { id: "ask-last", text: "When was the last pickup?", next: "last-pickup" },
        ],
      },
      courier: {
        id: "courier",
        speaker: "Oren Pike",
        text: "Green badge. Brighter Horizon. They run a local office near Calder Square and apparently collect mail for imaginary builders.",
        choices: [{ id: "finish", text: "I need to see the pickup record.", end: true }],
      },
      "last-pickup": {
        id: "last-pickup",
        speaker: "Oren Pike",
        text: "Yesterday. Cleared the box, canceled the route, and left that copy on my cart. Convenient timing, wouldn’t you say?",
        choices: [{ id: "finish", text: "Convenient enough to photograph.", end: true }],
      },
    },
  },
  foundation_receptionist: {
    id: "foundation_receptionist",
    character: "Celia Orr",
    portrait: "CO",
    start: "intro",
    nodes: {
      intro: {
        id: "intro",
        speaker: "Celia Orr",
        text:
          "Brighter Horizon’s grant officers work by appointment. I can offer a program brochure or a statement from our communications office.",
        choices: [
          {
            id: "ask-programs",
            text: "What does the Greyhaven office actually fund?",
            next: "programs",
          },
          {
            id: "show-connection",
            text: "Northstar’s courier route ends at this desk.",
            evidenceId: "brighter_horizon_connection",
            requires: { type: "hasEvidence", id: "brighter_horizon_connection" },
            next: "northstar",
          },
          { id: "leave", text: "I’ll look around first.", end: true },
        ],
      },
      programs: {
        id: "programs",
        speaker: "Celia Orr",
        text:
          "Emergency housing, accessibility, public health. The quarterly disbursement report is public—assuming someone has not left the internal copy beside recycling again.",
        choices: [
          {
            id: "ask-northstar",
            text: "Was Northstar one of those partners?",
            evidenceId: "brighter_horizon_connection",
            requires: { type: "hasEvidence", id: "brighter_horizon_connection" },
            next: "northstar",
          },
          { id: "back", text: "Let me ask something else.", next: "intro" },
        ],
      },
      northstar: {
        id: "northstar",
        speaker: "Celia Orr",
        text:
          "We receive correspondence for dozens of field partners. That does not make them subsidiaries, and it certainly does not make this a story.",
        choices: [
          {
            id: "show-manifest",
            text: "E. Marsh authorized Northstar’s pickups through Brighter Horizon.",
            evidenceId: "northstar_courier_manifest",
            requires: { type: "hasEvidence", id: "northstar_courier_manifest" },
            next: "marsh",
          },
          { id: "ask-marsh", text: "Who is E. Marsh?", next: "denial" },
          { id: "leave", text: "I’ll verify that independently.", end: true },
        ],
      },
      denial: {
        id: "denial",
        speaker: "Celia Orr",
        text:
          "No one employed here. Shared administrative credentials are common in emergency programs. They are not interesting.",
        choices: [
          {
            id: "show-manifest",
            text: "Then the same credential should appear in your visitor system.",
            evidenceId: "northstar_courier_manifest",
            requires: { type: "hasEvidence", id: "northstar_courier_manifest" },
            next: "marsh",
          },
          { id: "finish", text: "I’ll decide what is interesting.", end: true },
        ],
      },
      marsh: {
        id: "marsh",
        speaker: "Celia Orr",
        text:
          "The lobby terminal keeps ninety days of access records. You may inspect the public extract. You will find a credential, not an employee.",
        onEnter: [
          { type: "setFlag", key: "questionedFoundationReceptionist", value: true },
          { type: "collectEvidence", id: "celia_orr_statement" },
        ],
        choices: [
          {
            id: "finish",
            text: "A credential used by whom is still a person.",
            end: true,
          },
        ],
      },
    },
  },
  gala_attendant: {
    id: "gala_attendant",
    character: "Imani Kade",
    portrait: "IK",
    start: "intro",
    nodes: {
      intro: {
        id: "intro",
        speaker: "Imani Kade",
        text:
          "Invitation, please. The foundation prefers tonight’s generosity to remain carefully scheduled.",
        choices: [
          {
            id: "show-invitation",
            text: "I appear to be carefully scheduled.",
            evidenceId: "calder_gala_invitation",
            requires: { type: "hasEvidence", id: "calder_gala_invitation" },
            next: "welcome",
          },
          {
            id: "show-photo",
            text: "Do you recognize the man circled in this photograph?",
            evidenceId: "meridian_gala_photograph",
            requires: { type: "hasEvidence", id: "meridian_gala_photograph" },
            next: "wren",
          },
          { id: "leave", text: "I’ll come back.", end: true },
        ],
      },
      welcome: {
        id: "welcome",
        speaker: "Imani Kade",
        text:
          "East ballroom, donor reception, and no recording during the keynote. The service corridor is for staff and men who dislike being photographed.",
        choices: [
          {
            id: "show-photo",
            text: "One of those men?",
            evidenceId: "meridian_gala_photograph",
            requires: { type: "hasEvidence", id: "meridian_gala_photograph" },
            next: "wren",
          },
          { id: "finish", text: "That is remarkably specific.", end: true },
        ],
      },
      wren: {
        id: "wren",
        speaker: "Imani Kade",
        text:
          "Silas Wren. He never checks a coat and never enters through the ballroom. He dropped an operations pass when he came through tonight. I have not decided whether I saw it.",
        onEnter: [
          { type: "setFlag", key: "identifiedSilasWren", value: true },
          { type: "collectEvidence", id: "imani_kade_statement" },
        ],
        choices: [
          {
            id: "finish",
            text: "Then I won’t ask you to decide.",
            end: true,
          },
        ],
      },
    },
  },
  cassian_rook_gala: {
    id: "cassian_rook_gala",
    character: "Cassian Rook",
    portrait: "CR",
    start: "intro",
    nodes: {
      intro: {
        id: "intro",
        speaker: "Cassian Rook",
        text:
          "A local journalist. Good. Global hope is meaningless if it cannot survive local scrutiny.",
        choices: [
          {
            id: "ask-foundation",
            text: "What does tonight’s money actually fund?",
            next: "programs",
          },
          {
            id: "show-report",
            text: "Why did Brighter Horizon finance Northstar?",
            evidenceId: "foundation_disbursement_report",
            requires: {
              type: "hasEvidence",
              id: "foundation_disbursement_report",
            },
            next: "northstar",
          },
          { id: "leave", text: "Enjoy the applause.", end: true },
        ],
      },
      programs: {
        id: "programs",
        speaker: "Cassian Rook",
        text:
          "Emergency housing, water, medicine, access. The things governments promise after the moment for action has already passed.",
        choices: [
          {
            id: "show-report",
            text: "Your action included a contractor that did not exist.",
            evidenceId: "foundation_disbursement_report",
            requires: {
              type: "hasEvidence",
              id: "foundation_disbursement_report",
            },
            next: "northstar",
          },
          { id: "finish", text: "A polished answer.", end: true },
        ],
      },
      northstar: {
        id: "northstar",
        speaker: "Cassian Rook",
        text:
          "During emergencies, useful instruments are rarely elegant. If Northstar was a false identity, ask who required the instrument—not who paid for it.",
        onEnter: [
          { type: "setFlag", key: "questionedCassianRook", value: true },
          { type: "collectEvidence", id: "cassian_rook_statement" },
        ],
        choices: [
          {
            id: "finish",
            text: "I intend to ask both.",
            end: true,
          },
        ],
      },
    },
  },
});

export const DEDUCTIONS = Object.freeze({
  northstar_payment: {
    id: "northstar_payment",
    title: "The payment and permit describe the same job",
    journalText:
      "The city permit and Northstar’s invoice point to the same west-wing project—but Northstar’s existence is still unverified.",
    requiredEvidence: ["invoice_northstar", "permit_summary"],
    requiredConnections: [
      {
        a: "invoice_northstar",
        b: "permit_summary",
        type: "financial",
      },
    ],
    effects: [
      { type: "setFlag", key: "connectedInvoiceToPermit", value: true },
    ],
  },
  witness_contradiction: {
    id: "witness_contradiction",
    title: "The declared construction never happened",
    journalText:
      "June saw equipment delivered, but no west wing was built. The money purchased something hidden at the property.",
    notification:
      "Mayor Vale has disappeared. Her study is now available on the map.",
    requiredEvidence: ["permit_summary", "june_statement", "photo_west_wall"],
    requiredConnections: [
      {
        a: "permit_summary",
        b: "june_statement",
        type: "contradiction",
      },
      {
        a: "permit_summary",
        b: "photo_west_wall",
        type: "contradiction",
      },
    ],
    effects: [
      { type: "setFlag", key: "suspectsHiddenConstruction", value: true },
      { type: "setFlag", key: "mayorMissing", value: true },
      { type: "setPath", path: "progress.officeState", value: 1 },
      { type: "unlockLocation", id: "mayor_study" },
    ],
  },
  vale_distress_signal: {
    id: "vale_distress_signal",
    title: "The irregularity was Vale’s distress signal",
    journalText:
      "The false renovation was not a private luxury. Vale made the payment conspicuous so someone outside Meridian would find the room and follow Northstar.",
    notification:
      "Vale meant the invoice to be found. Three knocks sound at the door.",
    requiredDeductions: ["witness_contradiction"],
    requiredEvidence: [
      "invoice_northstar",
      "photo_west_wall",
      "email_meridian",
      "vale_reconstructed_message",
    ],
    requiredConnections: [
      {
        a: "invoice_northstar",
        b: "photo_west_wall",
        type: "contradiction",
      },
      {
        a: "email_meridian",
        b: "vale_reconstructed_message",
        type: "confirmed",
      },
    ],
    effects: [
      { type: "setFlag", key: "confirmedMeridianLead", value: true },
      { type: "setFlag", key: "prologueEndingReady", value: true },
      { type: "setPath", path: "progress.officeState", value: 2 },
    ],
  },
  northstar_mail_route: {
    id: "northstar_mail_route",
    title: "Northstar was a mailbox for Brighter Horizon",
    journalText:
      "Suite 410 never existed. Northstar’s mail was collected by Brighter Horizon under the same E. Marsh name used to alter Vale’s permit.",
    notification:
      "Northstar leads directly to Brighter Horizon’s Greyhaven office.",
    requiredDeductions: ["vale_distress_signal"],
    requiredEvidence: [
      "northstar_address",
      "harrow_directory_photo",
      "northstar_courier_manifest",
      "meridian_gala_photograph",
    ],
    requiredConnections: [
      {
        a: "northstar_address",
        b: "harrow_directory_photo",
        type: "contradiction",
      },
      {
        a: "northstar_courier_manifest",
        b: "meridian_gala_photograph",
        type: "confirmed",
      },
    ],
    effects: [
      { type: "setFlag", key: "northstarRoutesToBrighterHorizon", value: true },
      { type: "setPath", path: "progress.officeState", value: 3 },
      { type: "collectEvidence", id: "brighter_horizon_connection" },
      { type: "unlockLocation", id: "brighter_horizon_office" },
    ],
  },
  foundation_funded_northstar: {
    id: "foundation_funded_northstar",
    title: "Brighter Horizon financed its own shell contractor",
    journalText:
      "Brighter Horizon advanced Northstar the exact amount later reimbursed by the city. The same E. Marsh credential moved between the charity, contractor, and Meridian.",
    notification:
      "The paper trail leads to Brighter Horizon’s invitation-only benefit at the Calder Grand.",
    requiredDeductions: ["northstar_mail_route"],
    requiredEvidence: [
      "invoice_northstar",
      "northstar_courier_manifest",
      "foundation_visitor_log",
      "foundation_disbursement_report",
    ],
    requiredConnections: [
      {
        a: "invoice_northstar",
        b: "foundation_disbursement_report",
        type: "financial",
      },
      {
        a: "northstar_courier_manifest",
        b: "foundation_visitor_log",
        type: "confirmed",
      },
    ],
    effects: [
      { type: "setFlag", key: "brighterHorizonFundsNorthstar", value: true },
      { type: "collectEvidence", id: "calder_gala_invitation" },
      { type: "unlockLocation", id: "calder_grand_gala" },
    ],
  },
  room_b_contractor_network: {
    id: "room_b_contractor_network",
    title: "Northstar was one instrument in a contractor network",
    journalText:
      "Room B’s roster places Northstar among temporary identities financed through Brighter Horizon program advances. Rook and Wren treated each shell as disposable infrastructure.",
    notification:
      "Northstar was a template, not an exception. Former program accountant Mina Harcourt is the next lead.",
    requiredDeductions: ["foundation_funded_northstar"],
    requiredEvidence: [
      "foundation_disbursement_report",
      "gala_contractor_roster",
      "meridian_guest_list_header",
      "room_b_conversation",
      "accountant_forwarding_slip",
    ],
    requiredConnections: [
      {
        a: "foundation_disbursement_report",
        b: "gala_contractor_roster",
        type: "financial",
      },
      {
        a: "meridian_guest_list_header",
        b: "room_b_conversation",
        type: "confirmed",
      },
    ],
    effects: [
      { type: "setFlag", key: "uncoveredContractorNetwork", value: true },
      { type: "setPath", path: "progress.officeState", value: 5 },
    ],
  },
});

export const GAME_CONTENT = Object.freeze({
  title: "The Benefactors",
  subtitle: "Every good lie leaves paperwork.",
  chapter: "Prologue · The Renovation",
  locations: {
    home_office: {
      id: "home_office",
      name: "Home Office",
      mapX: 51,
      mapY: 62,
      description: "Your apartment and the center of the investigation.",
    },
    ledger_newsroom: {
      id: "ledger_newsroom",
      name: "The Greyhaven Ledger",
      eyebrow: "Tomorrow's news, yesterday's computers",
      mapX: 34,
      mapY: 40,
      description:
        "The night desk glows beneath tired fluorescent lights. Mara is waiting with an assignment that should be simple.",
      sceneClass: "scene-newsroom",
      sceneArt: "./assets/scenes/newsroom.webp",
      hotspots: [
        {
          id: "mara-desk",
          label: "Mara Venn",
          x: 67,
          y: 27,
          width: 18,
          height: 47,
          title: "Mara’s desk",
          text: "Your editor has gone home. Her coffee has not.",
        },
        {
          id: "deadline-clock",
          label: "Deadline clock",
          x: 78,
          y: 8,
          width: 12,
          height: 13,
          title: "9:32 PM",
          text: "The clock is four minutes fast. Mara calls that optimism.",
        },
        {
          id: "archive-boxes",
          label: "Archive boxes",
          x: 5,
          y: 51,
          width: 27,
          height: 31,
          title: "Municipal archive",
          text: "Last year’s council minutes. Useful if the city ever starts repeating itself.",
        },
      ],
    },
    city_hall: {
      id: "city_hall",
      name: "Greyhaven City Hall",
      eyebrow: "Records Division · 10:06 AM",
      mapX: 57,
      mapY: 35,
      description:
        "Marble, fluorescent light, and the institutional confidence that no one reads the forms.",
      sceneClass: "scene-city-hall",
      sceneArt: "./assets/scenes/city-hall.webp",
      hotspots: [
        {
          id: "records-terminal",
          label: "Public records terminal",
          x: 78,
          y: 35,
          width: 20,
          height: 43,
          title: "Public records terminal",
          text: "The permit database is old enough to vote.",
          actionLabel: "Search Vale permits",
          actionWhen: { not: { type: "flag", key: "permitAcquired" } },
          effects: [
            { type: "setFlag", key: "permitAcquired", value: true },
            { type: "collectEvidence", id: "permit_summary" },
          ],
          resultText:
            "Permit 18-441: WEST WING ACCESSIBILITY IMPROVEMENT. The public summary omits the amendment history.",
        },
        {
          id: "clerk-window",
          label: "Lionel Price",
          x: 12,
          y: 27,
          width: 32,
          height: 38,
          title: "Lionel Price, city clerk",
          text: "He has already decided which questions you are allowed to ask.",
          actionLabel: "Question Lionel",
          dialogueId: "lionel_records",
        },
        {
          id: "records-policy",
          label: "Records policy",
          x: 43,
          y: 16,
          width: 19,
          height: 35,
          title: "Public records policy",
          text: "Requests for amendments require Form 17-C. Someone has underlined “amendments” in blue ink.",
        },
      ],
    },
    mayor_street: {
      id: "mayor_street",
      name: "Vale Residence",
      eyebrow: "West Greyhaven · 4:18 PM",
      mapX: 75,
      mapY: 57,
      description:
        "A respectable brick house on a quiet street. Nothing resembling a new west wing is visible from here.",
      sceneClass: "scene-mayor-street",
      sceneArt: "./assets/scenes/vale-street.webp",
      hotspots: [
        {
          id: "vale-house",
          label: "Mayor Vale’s house",
          x: 34,
          y: 17,
          width: 40,
          height: 54,
          title: "The Vale residence",
          text: "Old brick. Original roofline. No scaffolding, no fresh masonry, no obvious $184,600 addition.",
          actionLabel: "Photograph the west wall",
          actionWhen: {
            all: [
              { type: "hasInventory", id: "smartphone" },
              { not: { type: "hasEvidence", id: "photo_west_wall" } },
            ],
          },
          effects: [
            { type: "setFlag", key: "photographedWestWall", value: true },
            { type: "collectEvidence", id: "photo_west_wall" },
          ],
          resultText:
            "Your photograph captures uninterrupted original brickwork. Whatever the city paid for, it was not an above-ground addition.",
        },
        {
          id: "june-window",
          label: "Neighbor’s window",
          x: 4,
          y: 24,
          width: 17,
          height: 30,
          title: "Someone is watching",
          text: "The curtain moves. Whoever lives opposite the mayor has an excellent view.",
          actionLabel: "Knock on the neighbor’s door",
          dialogueId: "june_window",
        },
        {
          id: "delivery-marks",
          label: "Marks by the curb",
          x: 54,
          y: 69,
          width: 27,
          height: 18,
          title: "Heavy delivery marks",
          text: "Deep parallel grooves in the wet verge. Something heavy was unloaded here recently.",
        },
      ],
    },
    mayor_study: {
      id: "mayor_study",
      name: "Mayor Vale’s Study",
      eyebrow: "Vale Residence · 11:48 PM",
      mapX: 79,
      mapY: 52,
      description:
        "Police completed a hurried welfare check and left. Mayor Vale is missing. Her study looks orderly in the way a room does after someone has searched it.",
      sceneClass: "scene-study",
      sceneArt: "./assets/scenes/vale-study.webp",
      hotspots: [
        {
          id: "crooked-photograph",
          label: "Crooked photograph",
          x: 3,
          y: 8,
          width: 27,
          height: 44,
          title: "A deliberately crooked photograph",
          text: "The frame is crooked, but the dust shadow behind it is perfectly straight.",
          actionLabel: "Look behind the frame",
          actionWhen: { not: { type: "flag", key: "foundStudyFloorplan" } },
          effects: [
            { type: "setFlag", key: "foundStudyFloorplan", value: true },
            { type: "collectEvidence", id: "study_floorplan" },
          ],
          resultText:
            "A folded original floorplan is taped inside the frame. It shows a narrow void behind the western bookcase.",
        },
        {
          id: "dictation-recorder",
          label: "Dictation recorder",
          x: 43,
          y: 62,
          width: 18,
          height: 19,
          title: "A damaged dictation recorder",
          text: "The casing is cracked. Three fragments remain on its internal memory.",
          actionLabel: "Add it to the case file",
          actionWhen: { not: { type: "flag", key: "foundValeRecording" } },
          effects: [
            { type: "setFlag", key: "foundValeRecording", value: true },
            { type: "collectEvidence", id: "vale_damaged_recording" },
          ],
          resultText:
            "Three voice fragments survive, but their timestamps are gone. A proper recovery console may be able to rebuild the sequence.",
        },
        {
          id: "western-bookcase",
          label: "Western bookcase",
          x: 82,
          y: 14,
          width: 12,
          height: 59,
          title: "The western bookcase",
          text: "The shelves sit several inches forward of the wall shown on the original plan.",
          actionLabel: "Align the floorplan",
          actionWhen: {
            all: [
              { type: "hasEvidence", id: "study_floorplan" },
              { not: { type: "flag", key: "foundWallCavity" } },
            ],
          },
          route: "alignment",
        },
        {
          id: "missing-book",
          label: "Gap in the shelf",
          x: 73,
          y: 33,
          width: 8,
          height: 13,
          title: "A missing book",
          text: "Dust outlines the shape of a large atlas removed recently.",
        },
      ],
    },
    hidden_room: {
      id: "hidden_room",
      name: "Hidden Communications Room",
      eyebrow: "Beneath the Vale Residence",
      mapX: 82,
      mapY: 68,
      description:
        "A steel stair descends into a communications room that does not appear on any city plan.",
      sceneClass: "scene-hidden-room",
      sceneArt: "./assets/scenes/hidden-room.webp",
      hotspots: [
        {
          id: "dark-monitors",
          label: "Dark monitors",
          x: 8,
          y: 10,
          width: 34,
          height: 46,
          title: "Audio recovery console",
          text:
            "One monitor wakes when Vale’s recorder is connected. Its queue holds three voice fragments with no timestamps.",
          actionLabel: "Reconstruct the recording",
          actionWhen: { type: "hasEvidence", id: "vale_damaged_recording" },
          route: "recording",
        },
        {
          id: "guest-list-printer",
          label: "Printer tray",
          x: 76,
          y: 48,
          width: 23,
          height: 39,
          title: "One page remains",
          text: "The printer tray holds the torn header of a guest list: MERIDIAN / GREYHAVEN SESSION.",
          actionLabel: "Take the torn page",
          actionWhen: {
            not: { type: "hasEvidence", id: "meridian_guest_list_header" },
          },
          effects: [
            { type: "collectEvidence", id: "meridian_guest_list_header" },
          ],
          resultText:
            "The surviving header names a Thursday Meridian session at VALE / ROOM B. The attendee list has been torn away.",
        },
        {
          id: "cable-conduit",
          label: "Cable conduit",
          x: 0,
          y: 55,
          width: 39,
          height: 34,
          title: "Fresh cable conduit",
          text: "The conduit runs toward the street, not the house. This room was connected to something outside.",
        },
      ],
    },
    northstar_harrow: {
      id: "northstar_harrow",
      name: "1400 Harrow Street",
      eyebrow: "Fourth floor · 2:09 PM",
      mapX: 22,
      mapY: 65,
      description:
        "Northstar's registered address belongs to a building whose directory ends one suite too early.",
      sceneClass: "scene-northstar-harrow",
      sceneArt: "./assets/scenes/northstar-harrow.webp",
      hotspots: [
        {
          id: "harrow_directory",
          label: "Brass directory",
          x: 17,
          y: 13,
          width: 18,
          height: 34,
          title: "Fourth-floor directory",
          text: "The engraved list runs from 401 to 409. Northstar's invoices claim Suite 410.",
          actionLabel: "Photograph the directory",
          resultText:
            "The directory photograph is in the case file. There is no Suite 410.",
          effects: [
            { type: "setFlag", key: "photographedHarrowDirectory", value: true },
            { type: "collectEvidence", id: "harrow_directory_photo" },
          ],
          actionWhen: {
            not: { type: "flag", key: "photographedHarrowDirectory" },
          },
        },
        {
          id: "oren_pike",
          label: "Building manager",
          x: 9,
          y: 43,
          width: 24,
          height: 34,
          title: "Oren Pike, building manager",
          text: "He watches the elevator like it owes him rent.",
          actionLabel: "Question Oren Pike",
          dialogueId: "harrow_manager",
        },
        {
          id: "missing_suite",
          label: "Where 410 should be",
          x: 58,
          y: 21,
          width: 23,
          height: 49,
          title: "End of the fourth floor",
          text:
            "Past 409 is an exterior wall. No door, no covered number, and no room for another office.",
        },
        {
          id: "northstar_mail_cart",
          label: "Canceled pickup sheet",
          x: 81,
          y: 46,
          width: 18,
          height: 45,
          title: "Canceled pickup sheet",
          text: "A carbon copy is still clipped beneath today's outgoing mail.",
          actionLabel: "Inspect the pickup sheet",
          resultText:
            "The manifest reroutes Northstar's mail to Brighter Horizon Foundation—authorized by E. Marsh.",
          effects: [
            { type: "setFlag", key: "foundNorthstarCourierManifest", value: true },
            { type: "collectEvidence", id: "northstar_courier_manifest" },
          ],
          actionWhen: {
            not: { type: "flag", key: "foundNorthstarCourierManifest" },
          },
        },
        {
          id: "harrow_elevator",
          label: "Service elevator",
          x: 37,
          y: 24,
          width: 17,
          height: 53,
          title: "Service elevator",
          text:
            "The brass panel remembers every floor except the one Northstar claims to occupy.",
        },
      ],
    },
    brighter_horizon_office: {
      id: "brighter_horizon_office",
      name: "Brighter Horizon Foundation",
      eyebrow: "8 Calder Square · 10:31 AM",
      mapX: 78,
      mapY: 59,
      description:
        "The foundation’s Greyhaven lobby is polished enough to make every question feel like poor manners.",
      sceneClass: "scene-brighter-horizon",
      sceneArt: "./assets/scenes/brighter-horizon-office.webp",
      hotspots: [
        {
          id: "celia_orr",
          label: "Receptionist",
          x: 27,
          y: 42,
          width: 25,
          height: 31,
          title: "Celia Orr, foundation receptionist",
          text:
            "Her smile is warm, practiced, and positioned between you and every locked office in the building.",
          actionLabel: "Question Celia Orr",
          dialogueId: "foundation_receptionist",
        },
        {
          id: "foundation_donor_wall",
          label: "Founders’ wall",
          x: 36,
          y: 18,
          width: 15,
          height: 31,
          title: "Greyhaven founders’ wall",
          text:
            "The same faces recur across campaigns separated by years. Vale appears under accessibility; Rook appears under everything.",
          actionLabel: "Photograph the donor wall",
          resultText:
            "The photograph captures Vale, Cassian Rook, and the circled gala guest inside the same donor network.",
          effects: [
            { type: "setFlag", key: "photographedFoundationDonorWall", value: true },
            { type: "collectEvidence", id: "calder_donor_wall_photo" },
          ],
          actionWhen: {
            not: { type: "flag", key: "photographedFoundationDonorWall" },
          },
        },
        {
          id: "foundation_world_map",
          label: "World relief map",
          x: 51,
          y: 17,
          width: 29,
          height: 38,
          title: "A world rendered in brass",
          text:
            "Small pins mark disasters and Brighter Horizon offices with identical symbols. The crises look almost curated.",
        },
        {
          id: "foundation_visitor_terminal",
          label: "Visitor terminal",
          x: 78,
          y: 49,
          width: 13,
          height: 23,
          title: "Visitor access terminal",
          text:
            "A public-record button is available, but Celia controls which credential history it displays.",
          actionLabel: "Print the E. Marsh access log",
          resultText:
            "The access extract shows E. Marsh signing in for Northstar, Brighter Horizon, and a Meridian session.",
          effects: [
            { type: "setFlag", key: "foundFoundationVisitorLog", value: true },
            { type: "collectEvidence", id: "foundation_visitor_log" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "questionedFoundationReceptionist" },
              { type: "flag", key: "foundFoundationVisitorLog", equals: false },
            ],
          },
        },
        {
          id: "foundation_recycling",
          label: "Misfiled report",
          x: 88,
          y: 57,
          width: 11,
          height: 34,
          title: "Paper recycling console",
          text:
            "A quarterly report sits in the return slot. One page still contains an internal routing column.",
          actionLabel: "Take the public report",
          resultText:
            "Brighter Horizon advanced Northstar $184,600 one day before the city reimbursed the exact same amount.",
          effects: [
            {
              type: "setFlag",
              key: "foundFoundationDisbursementReport",
              value: true,
            },
            { type: "collectEvidence", id: "foundation_disbursement_report" },
          ],
          actionWhen: {
            not: { type: "flag", key: "foundFoundationDisbursementReport" },
          },
        },
        {
          id: "foundation_brochure_table",
          label: "Benefit brochures",
          x: 51,
          y: 62,
          width: 26,
          height: 28,
          title: "A table of immaculate promises",
          text:
            "Housing. Clean water. Emergency access. A card advertises Thursday’s invitation-only benefit at the Calder Grand.",
        },
      ],
    },
    calder_grand_gala: {
      id: "calder_grand_gala",
      name: "Calder Grand Benefit",
      eyebrow: "East Ballroom · Thursday · 8:06 PM",
      mapX: 66,
      mapY: 28,
      description:
        "Brighter Horizon’s donors applaud beneath chandeliers while the people who manage the machinery stand outside the seating plan.",
      sceneClass: "scene-calder-grand-gala",
      sceneArt: "./assets/scenes/calder-grand-gala.webp",
      hotspots: [
        {
          id: "gala_attendant",
          label: "Coat-check attendant",
          x: 3,
          y: 43,
          width: 19,
          height: 37,
          title: "Imani Kade, coat-check attendant",
          text:
            "She has watched every important guest arrive and has been trained to appear as if she noticed none of them.",
          actionLabel: "Speak with Imani Kade",
          dialogueId: "gala_attendant",
        },
        {
          id: "gala_seating_plan",
          label: "Seating plan",
          x: 76,
          y: 49,
          width: 12,
          height: 28,
          title: "The public seating plan",
          text:
            "Cassian Rook has a podium, three tables have sponsors, and one familiar face has no seat at all.",
          actionLabel: "Photograph the seating plan",
          resultText:
            "The plan names Silas Wren as service access only. He is a guest the public record is designed not to contain.",
          effects: [
            { type: "setFlag", key: "photographedGalaSeatingPlan", value: true },
            { type: "collectEvidence", id: "gala_seating_plan" },
          ],
          actionWhen: {
            not: { type: "flag", key: "photographedGalaSeatingPlan" },
          },
        },
        {
          id: "cassian_rook",
          label: "Cassian Rook",
          x: 43,
          y: 36,
          width: 13,
          height: 28,
          title: "Cassian Rook at the podium",
          text:
            "His speech makes private power sound like a public service offered at tremendous personal inconvenience.",
          actionLabel: "Question Cassian Rook",
          dialogueId: "cassian_rook_gala",
        },
        {
          id: "silas_wren_terrace",
          label: "Man by the terrace",
          x: 88,
          y: 42,
          width: 11,
          height: 39,
          title: "The circled man",
          text:
            "He watches the exits during applause. Cassian Rook leaves the podium and crosses toward him.",
          actionLabel: "Photograph the meeting",
          resultText:
            "Your camera catches Rook handing Silas Wren a brass credential before both men enter the staff corridor.",
          effects: [
            { type: "collectEvidence", id: "gala_terrace_photo" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "identifiedSilasWren" },
              { type: "hasInventory", id: "smartphone" },
              { not: { type: "hasEvidence", id: "gala_terrace_photo" } },
            ],
          },
        },
        {
          id: "dropped_service_pass",
          label: "Dropped service pass",
          x: 19,
          y: 67,
          width: 14,
          height: 17,
          title: "A brass operations pass",
          text:
            "The credential lies beneath the coat-check counter where Silas Wren refused to stop.",
          actionLabel: "Pocket the service pass",
          resultText:
            "The pass grants all-floor service access until 2:00 AM. The staff corridor is now open.",
          effects: [
            { type: "setFlag", key: "foundGalaServicePass", value: true },
            { type: "collectEvidence", id: "gala_service_pass" },
            { type: "unlockLocation", id: "calder_grand_service_corridor" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "identifiedSilasWren" },
              { type: "flag", key: "foundGalaServicePass", equals: false },
            ],
          },
        },
        {
          id: "gala_service_door",
          label: "Service door",
          x: 70,
          y: 38,
          width: 9,
          height: 37,
          title: "Staff only",
          text:
            "The ballroom’s most heavily used door is the one absent from the evening program.",
          actionLabel: "Enter the service corridor",
          resultText:
            "The brass pass flashes green. The applause dulls behind the service door.",
          effects: [
            { type: "unlockLocation", id: "calder_grand_service_corridor" },
            { type: "visitLocation", id: "calder_grand_service_corridor" },
          ],
          actionWhen: {
            type: "flag",
            key: "foundGalaServicePass",
          },
        },
        {
          id: "gala_donor_display",
          label: "Humanitarian display",
          x: 51,
          y: 16,
          width: 15,
          height: 24,
          title: "A monument to measurable compassion",
          text:
            "Every crisis has a polished photograph. Every solution has Cassian Rook standing just outside the frame.",
        },
      ],
    },
    calder_grand_service_corridor: {
      id: "calder_grand_service_corridor",
      name: "Calder Grand Service Corridor",
      eyebrow: "Behind the East Ballroom · 8:39 PM",
      mapX: 69,
      mapY: 32,
      description:
        "Beyond the chandeliers, the benefit becomes freight schedules, temporary credentials, and doors without public names.",
      sceneClass: "scene-calder-grand-service",
      sceneArt: "./assets/scenes/calder-grand-service-corridor.webp",
      hotspots: [
        {
          id: "contractor_roster",
          label: "Delivery roster",
          x: 36,
          y: 19,
          width: 15,
          height: 29,
          title: "Room B delivery roster",
          text:
            "Five contractors supplied secure infrastructure tonight. Northstar is only the first name you recognize.",
          actionLabel: "Photograph the roster",
          resultText:
            "Northstar appears beside Deepwell, Crownline, and other temporary firms—all routed through program advances.",
          effects: [
            { type: "setFlag", key: "photographedContractorRoster", value: true },
            { type: "collectEvidence", id: "gala_contractor_roster" },
          ],
          actionWhen: {
            not: { type: "flag", key: "photographedContractorRoster" },
          },
        },
        {
          id: "room_b_door",
          label: "Private salon door",
          x: 53,
          y: 25,
          width: 13,
          height: 43,
          title: "Room B",
          text:
            "Rook and Wren speak behind the unmarked salon door. The ballroom applause covers everything but the sharpest words.",
          actionLabel: "Record through the door",
          resultText:
            "The recorder captures Rook calling Northstar one of several instruments—and Wren ordering Mina Harcourt moved.",
          effects: [
            { type: "setFlag", key: "recordedRoomBConversation", value: true },
            { type: "collectEvidence", id: "room_b_conversation" },
          ],
          actionWhen: {
            all: [
              { type: "hasInventory", id: "recorder" },
              { type: "flag", key: "recordedRoomBConversation", equals: false },
            ],
          },
        },
        {
          id: "service_security_desk",
          label: "Security desk",
          x: 42,
          y: 51,
          width: 17,
          height: 26,
          title: "An unattended security desk",
          text:
            "A returned payroll envelope has been used as a coaster beneath the roster lamp.",
          actionLabel: "Take the forwarding slip",
          resultText:
            "The envelope names former program accountant Mina Harcourt and a forwarding address at 26 Saltmere Walk.",
          effects: [
            { type: "setFlag", key: "foundAccountantForwardingSlip", value: true },
            { type: "collectEvidence", id: "accountant_forwarding_slip" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "recordedRoomBConversation" },
              { type: "flag", key: "foundAccountantForwardingSlip", equals: false },
            ],
          },
        },
        {
          id: "service_linen_cart",
          label: "Linen carts",
          x: 0,
          y: 48,
          width: 28,
          height: 40,
          title: "Hotel linen and sealed crates",
          text:
            "The crates are labeled as table hardware. The weight marks suggest racks of electronics.",
        },
        {
          id: "service_freight_elevator",
          label: "Freight elevator",
          x: 82,
          y: 26,
          width: 17,
          height: 49,
          title: "A guarded freight elevator",
          text:
            "The indicator remains on basement level two. The guard is watching the ballroom door, not you.",
        },
        {
          id: "service_champagne_tray",
          label: "Abandoned champagne",
          x: 76,
          y: 72,
          width: 20,
          height: 18,
          title: "Celebration, interrupted",
          text:
            "Two untouched glasses and one empty bottle. Even the conspirators have catering minimums.",
        },
      ],
    },
  },
  officeHotspots: [
    {
      id: "evidence-board",
      label: "Evidence board",
      className: "hotspot-board",
      title: "Nothing connected. Yet.",
      text: "A clean corkboard is an optimistic thing. Soon it will hold names, receipts, photographs, and decisions you cannot take back.",
      route: "board",
    },
    {
      id: "city-map",
      label: "Greyhaven map",
      className: "hotspot-map",
      title: "Greyhaven",
      text: "City Hall. The Ledger. Mayor Vale’s house. For now, the city still fits on one wall.",
      route: "map",
    },
    {
      id: "laptop",
      label: "Laptop",
      className: "hotspot-laptop",
      title: "One unread message",
      text: "No sender. No subject. Two attachments. It arrived while you were at the Ledger.",
      route: "laptop",
    },
    {
      id: "answering-machine",
      label: "Answering machine",
      className: "hotspot-phone",
      title: "1 new message",
      text: "The red light blinks above a message from an unidentified caller.",
      action: "play-opening-message",
    },
    {
      id: "window",
      label: "Window",
      className: "hotspot-window",
      title: "Greyhaven after dark",
      text: "Rain varnishes the street. Across the road, a parked sedan keeps its lights off.",
    },
  ],
});
