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
      image: "./assets/evidence/photo-west-wall.webp",
      alt:
        "Rain-darkened original brick wall and roofline of Mayor Vale's house, with no sign of a newly built west wing",
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
      audio: "./assets/audio/vale-restored-message.wav",
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
      image: "./assets/evidence/gala-photograph-v2.webp",
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
      image: "./assets/evidence/harrow-directory.webp",
      alt:
        "Tarnished brass office directory in a worn fourth-floor corridor, with its orderly tenant rows ending before the claimed final suite",
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
      image: "./assets/evidence/foundation-donor-wall.webp",
      alt:
        "Dark wood and brass humanitarian foundation donor wall displaying connected portraits of wealthy Greyhaven patrons",
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
      image: "./assets/evidence/gala-terrace.webp",
      alt:
        "Two formally dressed men holding a private conversation on a rain-dark hotel terrace while a gala continues inside",
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
  harcourt_apartment_photo: {
    id: "harcourt_apartment_photo",
    title: "Photograph of Harcourt's apartment",
    category: "photograph",
    summary:
      "Mina Harcourt's files were searched selectively before the apartment was abandoned.",
    artifact: {
      type: "photo",
      image: "./assets/scenes/saltmere-apartment.webp",
      alt:
        "Rain-darkened apartment with opened filing drawers, scattered accounting papers, and a half-packed suitcase",
      caption: "26 Saltmere Walk · Apartment 3C · 10:14 PM",
      annotations: [
        "Drawers opened in sequence rather than dumped",
        "Tax records left behind; program-advance files removed",
        "Suitcase packed before the search",
      ],
    },
  },
  mina_harcourt_statement: {
    id: "mina_harcourt_statement",
    title: "Mina Harcourt's statement",
    category: "recording",
    summary:
      "Harcourt says Brighter Horizon used temporary contractors to hide a regional secure-infrastructure program.",
    artifact: {
      type: "transcript",
      heading: "RECORDED EXCHANGE · MINA HARCOURT",
      timestamp: "10:23 PM · 26 SALTMERE WALK",
      lines: [
        ["HARCOURT", "Program advances were never relief grants. They were staging money."],
        ["ROWAN", "For Northstar and the other contractors?"],
        ["HARCOURT", "For secure rooms, private networks, and emergency sites no council ever approved."],
        ["HARCOURT", "The city archive still has the matching contract register. Rook could not alter both ledgers."],
      ],
    },
  },
  program_advance_index: {
    id: "program_advance_index",
    title: "Harcourt program-advance index",
    category: "financial",
    summary:
      "Harcourt's copied ledger matches foundation advances to five disposable contractors.",
    artifact: {
      type: "memo",
      heading: "PROGRAM ADVANCES · PRIVATE RECONCILIATION INDEX",
      body: [
        "NORTHSTAR CIVIC WORKS · GREYHAVEN ACCESS · 184,600",
        "DEEPWELL RESPONSE · REGIONAL WATER · 611,200",
        "CROWNLINE SYSTEMS · DATA RESILIENCE · 903,450",
        "VERDANT SHELTER GROUP · CONSERVATION · 428,000",
        "HARBORLIGHT LOGISTICS · MARITIME ACCESS · 1,207,900",
      ],
      handwritten: "Each advance has a matching municipal emergency contract.",
    },
  },
  archive_request_card: {
    id: "archive_request_card",
    title: "Restricted archive request",
    category: "location",
    summary:
      "Harcourt's old request card identifies the municipal emergency-contract register.",
    artifact: {
      type: "memo",
      heading: "GREYHAVEN MUNICIPAL ARCHIVE · RESEARCH REQUEST",
      body: [
        "COLLECTION: CIVIL CONTINUITY CONTRACTS",
        "REGISTER: EMERGENCY INFRASTRUCTURE · 09",
        "ACCESS: BASEMENT READING ROOM",
        "REQUESTOR: M. HARCOURT · PROGRAM AUDIT",
      ],
      handwritten: "The public ledger is false. The contract register is not.",
    },
  },
  municipal_contract_register: {
    id: "municipal_contract_register",
    title: "Emergency contract register",
    category: "financial",
    summary:
      "Municipal emergency contracts mirror Harcourt's foundation advances exactly.",
    artifact: {
      type: "memo",
      heading: "CIVIL CONTINUITY · EMERGENCY CONTRACT REGISTER 09",
      body: [
        "GREYHAVEN ACCESS NODE · NORTHSTAR CIVIC WORKS · 184,600",
        "BELLWETHER WATER RESPONSE · DEEPWELL RESPONSE · 611,200",
        "REGIONAL DATA CONTINUITY · CROWNLINE SYSTEMS · 903,450",
        "LAND PRESERVATION SECURITY · VERDANT SHELTER GROUP · 428,000",
        "HARBOR SERVICE CAPACITY · HARBORLIGHT LOGISTICS · 1,207,900",
      ],
      handwritten: "Same contractors. Same amounts. Different public stories.",
    },
  },
  secure_site_map: {
    id: "secure_site_map",
    title: "Continuity-site map",
    category: "location",
    summary:
      "A restricted city map places the five contractors at secure sites hidden inside public crisis projects.",
    artifact: {
      type: "photo",
      image: "./assets/evidence/continuity-site-map.webp",
      alt:
        "Aged municipal map photographed under an archive lamp, with five hidden infrastructure sites circled in dark red",
      caption: "Municipal Archive · Civil Continuity Map 09",
      annotations: [
        "Northstar · concealed communications room",
        "Deepwell · Bellwether water-treatment bypass",
        "Crownline · regional data-center annex",
        "Verdant · restricted conservation parcel",
        "Harborlight · private service berth",
      ],
    },
  },
  archive_destruction_order: {
    id: "archive_destruction_order",
    title: "Emergency records destruction order",
    category: "document",
    summary:
      "Silas Wren ordered the matching contract files destroyed after Mayor Vale disappeared.",
    artifact: {
      type: "memo",
      heading: "EXPEDITED RETENTION REVIEW · CONTINUITY RECORDS",
      body: [
        "DESTROY REGISTER 09 SUPPORTING FILES",
        "AUTHORITY: EMERGENCY CONTINUITY COUNSEL",
        "REQUESTOR: S. WREN",
        "DEADLINE: FRIDAY · 06:00",
      ],
      handwritten: "Someone moved the register into the wrong cage to save it.",
    },
  },
  bellwether_water_clipping: {
    id: "bellwether_water_clipping",
    title: "Bellwether water-crisis clipping",
    category: "document",
    summary:
      "A community water emergency began days after Deepwell Response received its program advance.",
    artifact: {
      type: "memo",
      heading: "GREYHAVEN LEDGER · REGIONAL DESK",
      body: [
        "BELLWETHER RESIDENTS REPORT METALLIC WATER",
        "SCHOOLS CLOSE AFTER TREATMENT FAILURE",
        "BRIGHTER HORIZON ANNOUNCES EMERGENCY RELIEF",
        "DEEPWELL RESPONSE CONTRACTED TO RESTORE SERVICE",
      ],
      handwritten: "The crisis started after the solution was funded.",
    },
  },
  rina_mercer_statement: {
    id: "rina_mercer_statement",
    title: "Rina Mercer's timeline",
    category: "recording",
    summary:
      "Bellwether organizer Rina Mercer saw Deepwell equipment arrive two nights before residents reported metallic water.",
    artifact: {
      type: "transcript",
      heading: "FIELD INTERVIEW 14 Â· RINA MERCER",
      timestamp: "06:51 AM Â· BELLWETHER RIVERSIDE",
      lines: [
        ["MERCER", "The trucks arrived Tuesday night. No city markings."],
        ["MERCER", "Thursday morning, the school taps smelled like pennies."],
        ["MERCER", "By lunch, Brighter Horizon already had cameras and bottled water here."],
      ],
    },
  },
  bellwether_tap_sample: {
    id: "bellwether_tap_sample",
    title: "Bellwether tap-field sample",
    category: "document",
    summary:
      "A fresh public-tap sample shows an industrial tracer used during treatment-system bypass maintenance.",
    artifact: {
      type: "memo",
      heading: "FIELD TEST Â· PUBLIC TAP B-17",
      body: [
        "IRON: ELEVATED",
        "CHLORIDE: ELEVATED",
        "TRACER DW-4: DETECTED",
        "CHAIN OF CUSTODY: A. ROWAN / R. MERCER",
      ],
      handwritten: "DW-4 is not naturally occurring.",
    },
  },
  relief_crate_photo: {
    id: "relief_crate_photo",
    title: "Pre-positioned relief crates",
    category: "photograph",
    summary:
      "Brighter Horizon relief crates carry freight labels dated before Bellwether's first contamination report.",
    artifact: {
      type: "photo",
      image: "./assets/scenes/bellwether-relief-station.webp",
      alt:
        "Rainy relief station with stacks of Brighter Horizon freight crates positioned before the public water emergency",
      caption: "Bellwether Relief Station Â· Freight Stack",
      annotations: [
        "Freight intake: Monday Â· 22:14",
        "First public complaint: Thursday Â· 07:30",
        "Deepwell testing van parked behind foundation awning",
      ],
    },
  },
  deepwell_pump_service_log: {
    id: "deepwell_pump_service_log",
    title: "Deepwell pump-service log",
    category: "financial",
    summary:
      "Deepwell billed a 'controlled bypass rehearsal' at Bellwether before the public emergency began.",
    artifact: {
      type: "memo",
      heading: "DEEPWELL RESPONSE Â· SERVICE LOG 44-B",
      body: [
        "SITE: BELLWETHER MUNICIPAL PUMP HOUSE",
        "WORK: CONTROLLED BYPASS REHEARSAL",
        "TRACER: DW-4",
        "BILL TO: BRIGHTER HORIZON Â· PROGRAM ADVANCE",
      ],
      handwritten: "A rehearsal for the failureâ€”or the cause of it?",
    },
  },
  university_lab_rejection: {
    id: "university_lab_rejection",
    title: "Suppressed university test request",
    category: "document",
    summary:
      "A university lab rejected Bellwether samples after a Meridian counsel threatened its emergency-response funding.",
    artifact: {
      type: "memo",
      heading: "GREYHAVEN UNIVERSITY Â· ENVIRONMENTAL LAB",
      body: [
        "REQUEST B-17: DECLINED",
        "REASON: EXTERNAL FUNDING CONFLICT",
        "COUNSEL NOTICE ATTACHED: MERIDIAN CIVIC PARTNERS",
        "CONTACT: DR. ELIAN VOSS Â· AFTER HOURS",
      ],
      handwritten: "The lab kept a duplicate sample.",
    },
  },
  university_lab_referral: {
    id: "university_lab_referral",
    title: "Dr. Voss's private lab address",
    category: "location",
    summary:
      "A handwritten referral points to the university's shuttered river annex and a duplicate Bellwether sample.",
    artifact: {
      type: "memo",
      heading: "AFTER-HOURS REFERRAL",
      body: [
        "DR. ELIAN VOSS",
        "RIVER ANNEX Â· GREYHAVEN UNIVERSITY",
        "ASK FOR SAMPLE B-17 DUPLICATE",
        "SERVICE ENTRANCE: SOUTH FLOODGATE",
        "ACCESS WINDOW: 23:00â€“02:00",
        "REFERENCE: ENVIRONMENTAL HOLD 6A",
      ],
      handwritten: "Do not call from campus.",
    },
  },
  voss_statement: {
    id: "voss_statement",
    title: "Dr. Voss's Bellwether analysis",
    category: "recording",
    summary:
      "Dr. Elian Voss says DW-4 carried an engineered biofilm that could not have entered Bellwether's system by accident.",
    artifact: {
      type: "transcript",
      heading: "RIVER ANNEX INTERVIEW Â· DR. ELIAN VOSS",
      timestamp: "12:18 AM Â· ENVIRONMENTAL HOLD 6A",
      lines: [
        ["VOSS", "DW-4 was the carrier. The contaminant attached to it by design."],
        ["ROWAN", "Could a treatment failure create that combination?"],
        ["VOSS", "No. Someone introduced a prepared culture during the bypass."],
        ["VOSS", "Its protein marker matches a watershed trial Meridian ordered buried."],
      ],
    },
  },
  annex_sample_chromatogram: {
    id: "annex_sample_chromatogram",
    title: "Duplicate B-17 sample analysis",
    category: "document",
    summary:
      "The preserved Bellwether sample contains DW-4 and an engineered biofilm tagged with Verdant trial marker VA-9.",
    artifact: {
      type: "memo",
      heading: "GREYHAVEN UNIVERSITY Â· SAMPLE B-17 DUPLICATE",
      body: [
        "INDUSTRIAL TRACER: DW-4 Â· CONFIRMED",
        "BIOFILM CULTURE: ENGINEERED",
        "PROTEIN MARKER: VA-9",
        "REFERENCE TRIAL: VERDANT WATERSHED ADAPTATION",
      ],
      handwritten: "A fingerprint left inside the poison.",
    },
  },
  meridian_funding_voicemail: {
    id: "meridian_funding_voicemail",
    title: "Meridian funding-threat voicemail",
    category: "recording",
    summary:
      "A Meridian counsel warned Voss that testing Bellwether's water would end the university's emergency grants.",
    artifact: {
      type: "transcript",
      heading: "SAVED VOICEMAIL Â· RIVER ANNEX LINE 2",
      timestamp: "THURSDAY Â· 08:03 AM",
      lines: [
        ["CALLER", "This is a courtesy before the formal conflict notice."],
        ["CALLER", "Analysis of Bellwether material falls outside your funded remit."],
        ["CALLER", "Emergency-response grants are reviewed at Meridian's discretion."],
        ["CALLER", "Destroy the intake record and there is no institutional problem."],
      ],
    },
  },
  watershed_injection_map: {
    id: "watershed_injection_map",
    title: "Verdant watershed injection map",
    category: "location",
    summary:
      "A lab map traces VA-9 testing from a restricted conservation parcel into Bellwether's upstream intake.",
    artifact: {
      type: "photo",
      image: "./assets/scenes/university-river-annex.webp",
      alt:
        "Rain-darkened environmental laboratory with an illuminated watershed map above a filing cabinet",
      caption: "River Annex Â· Watershed Trial Map",
      annotations: [
        "VA-9 trial point inside Verdant conservation parcel",
        "Floodgate release reaches Bellwether intake in ninety minutes",
        "Public monitoring station was offline during the release",
      ],
    },
  },
  verdant_freezer_transfer_log: {
    id: "verdant_freezer_transfer_log",
    title: "Verdant sample-transfer log",
    category: "financial",
    summary:
      "A transfer log shows Deepwell collected VA-9 cultures from Meridian's restricted conservation project.",
    artifact: {
      type: "memo",
      heading: "COLD STORAGE TRANSFER Â· VA-9",
      body: [
        "ORIGIN: VERDANT CONSERVATION PARCEL 6",
        "RECIPIENT: DEEPWELL RESPONSE",
        "AUTHORITY: MERIDIAN CIVIC PARTNERS",
        "PROJECT CODE: ADAPTIVE WATERSHED DEMONSTRATION",
      ],
      handwritten: "Deepwell carried the culture to the bypass.",
    },
  },
  verdant_preserve_gate_pass: {
    id: "verdant_preserve_gate_pass",
    title: "Verdant Parcel 6 gate pass",
    category: "location",
    summary:
      "Voss kept a contractor access pass for the conservation parcel where VA-9 was cultivated.",
    artifact: {
      type: "memo",
      heading: "VERDANT CONSERVATION TRUST Â· FIELD ACCESS",
      body: [
        "PARCEL 6 Â· SOUTH SERVICE GATE",
        "AUTHORIZED PROGRAM: WATERSHED ADAPTATION",
        "CONTRACTOR ACCESS: DEEPWELL RESPONSE",
        "OVERSIGHT: MERIDIAN CIVIC PARTNERS",
      ],
      handwritten: "The preserve is a laboratory with trees around it.",
    },
  },
  verdant_public_brochure: {
    id: "verdant_public_brochure",
    title: "Verdant restoration brochure",
    category: "document",
    summary:
      "Meridian presents Parcel 6 as a wildlife-restoration success with no mention of watershed adaptation trials.",
    artifact: {
      type: "memo",
      heading: "VERDANT CONSERVATION TRUST Â· PARCEL 6",
      body: [
        "A MODEL WETLAND FOR A RESILIENT REGION",
        "BIRD POPULATIONS: THRIVING",
        "WATER QUALITY: RESTORED",
        "SUPPORTED BY MERIDIAN CIVIC PARTNERS",
      ],
      handwritten: "The public version has no pipes, cages, or trial markers.",
    },
  },
  tess_arlen_statement: {
    id: "tess_arlen_statement",
    title: "Tess Arlen's field statement",
    category: "recording",
    summary:
      "Verdant ecologist Tess Arlen says Meridian ordered her to record animal deaths as storm migration.",
    artifact: {
      type: "transcript",
      heading: "FIELD INTERVIEW Â· TESS ARLEN",
      timestamp: "04:36 PM Â· VERDANT PARCEL 6",
      lines: [
        ["ARLEN", "The marsh was healthy until the VA-9 releases began."],
        ["ARLEN", "Birds stopped nesting. Fish surfaced after every injection."],
        ["ARLEN", "Meridian changed my mortality entries to storm migration."],
        ["ARLEN", "The telemetry went somewhere called Crownline in real time."],
      ],
    },
  },
  parcel_six_mortality_log: {
    id: "parcel_six_mortality_log",
    title: "Parcel 6 wildlife mortality log",
    category: "event",
    summary:
      "The original field log records animal deaths after each VA-9 release, contradicting Verdant's public restoration claims.",
    artifact: {
      type: "memo",
      heading: "PARCEL 6 Â· UNEDITED FIELD LOG",
      body: [
        "RELEASE VA-9.1 Â· 14 FISH / 3 WADERS",
        "RELEASE VA-9.2 Â· 31 FISH / 8 WADERS",
        "RELEASE VA-9.3 Â· NESTING CHANNEL ABANDONED",
        "PUBLIC REVISION: SEASONAL STORM MIGRATION",
      ],
      handwritten: "The deaths follow the injections, not the weather.",
    },
  },
  parcel_injection_rig_photo: {
    id: "parcel_injection_rig_photo",
    title: "Photograph of the VA-9 injection rig",
    category: "photograph",
    summary:
      "A concealed wetland rig matches the pressure and timing recorded during Bellwether's contamination route.",
    artifact: {
      type: "photo",
      image: "./assets/scenes/verdant-conservation-parcel.webp",
      alt:
        "Wetland conservation station with a concealed injection rig, telemetry cabinet, and damaged marsh channel",
      caption: "Verdant Parcel 6 Â· South Channel",
      annotations: [
        "Injection manifold calibrated for VA-9 cultures",
        "Deepwell service fittings",
        "Telemetry cable runs to Crownline uplink cabinet",
      ],
    },
  },
  crownline_telemetry_manifest: {
    id: "crownline_telemetry_manifest",
    title: "Crownline telemetry manifest",
    category: "financial",
    summary:
      "Parcel 6 streamed contamination, mortality, and public-response data to Crownline Regional Data Center.",
    artifact: {
      type: "memo",
      heading: "REMOTE TELEMETRY ROUTING Â· PARCEL 6",
      body: [
        "DESTINATION: CROWNLINE REGIONAL DATA CENTER",
        "STREAMS: WATER / WILDLIFE / PUBLIC SENTIMENT",
        "CLIENT: MERIDIAN CIVIC PARTNERS",
        "RETENTION: PERMANENT MODEL TRAINING",
      ],
      handwritten: "They measured the damage and the reaction at the same time.",
    },
  },
  crownline_service_badge: {
    id: "crownline_service_badge",
    title: "Crownline maintenance badge",
    category: "location",
    summary:
      "A telemetry contractor badge provides after-hours access to Crownline Regional Data Center.",
    artifact: {
      type: "memo",
      heading: "CROWNLINE REGIONAL DATA Â· SERVICE ACCESS",
      body: [
        "LEVEL: TELEMETRY MAINTENANCE",
        "ENTRY: COOLING PLANT GATE",
        "WINDOW: 01:00â€“04:00",
        "SPONSOR: MERIDIAN CIVIC PARTNERS",
      ],
      handwritten: "The data center knows what the preserve was built to learn.",
    },
  },
  crownline_public_continuity_brief: {
    id: "crownline_public_continuity_brief",
    title: "Crownline continuity-services brief",
    category: "document",
    summary:
      "Crownline publicly describes its work as neutral emergency analytics that protect essential public services.",
    artifact: {
      type: "memo",
      heading: "CROWNLINE REGIONAL DATA · CONTINUITY SERVICES",
      body: [
        "INDEPENDENT CIVIC RESILIENCE ANALYTICS",
        "PUBLIC-SERVICE AVAILABILITY MONITORING",
        "EQUITABLE EMERGENCY RESOURCE ALLOCATION",
        "NO OPERATIONAL OR POLICY AUTHORITY",
      ],
      handwritten: "The lobby version says they only watch.",
    },
  },
  nia_kade_statement: {
    id: "nia_kade_statement",
    title: "Nia Kade's operations statement",
    category: "recording",
    summary:
      "An overnight Crownline operator says Bellwether was scored as a governance-conversion exercise, not an emergency.",
    artifact: {
      type: "transcript",
      heading: "OVERNIGHT INTERVIEW · NIA KADE",
      timestamp: "02:27 AM · CROWNLINE OPERATIONS BAY",
      lines: [
        ["KADE", "Bellwether was already on the wall before the first public complaint."],
        ["KADE", "We measured trust loss, compliance, and how quickly Meridian replaced city services."],
        ["KADE", "The system called it a governance-conversion benchmark."],
        ["KADE", "Every completed exercise generated a Redoubt flight window."],
      ],
    },
  },
  crownline_crisis_dashboard_photo: {
    id: "crownline_crisis_dashboard_photo",
    title: "Photograph of Crownline's crisis dashboard",
    category: "photograph",
    summary:
      "Crownline's operations wall displays Bellwether alongside public trust, compliance, and private-service adoption metrics.",
    artifact: {
      type: "photo",
      image: "./assets/scenes/crownline-data-center.webp",
      alt:
        "Glass-walled data center with a raised operations bay and a wall of crisis-monitoring screens",
      caption: "Crownline Regional Data Center · Operations Bay",
      annotations: [
        "Bellwether timeline begins before first public complaint",
        "Public trust falls as Meridian service adoption rises",
        "Completed exercise routes data to Redoubt",
      ],
    },
  },
  bellwether_response_scorecard: {
    id: "bellwether_response_scorecard",
    title: "Bellwether governance scorecard",
    category: "event",
    summary:
      "A hidden Crownline scorecard grades Bellwether on compliance, trust collapse, and transfer of public services to Meridian.",
    artifact: {
      type: "memo",
      heading: "EXERCISE BW-17 · GOVERNANCE CONVERSION",
      body: [
        "PUBLIC TRUST DEGRADATION: 71%",
        "PRIVATE RELIEF ADOPTION: 84%",
        "MUNICIPAL AUTHORITY DISPLACEMENT: 63 HOURS",
        "DISPOSITION: SUCCESSFUL FIELD BENCHMARK",
      ],
      handwritten: "They graded the town for surrendering control.",
    },
  },
  meridian_priority_protocol: {
    id: "meridian_priority_protocol",
    title: "Meridian protected-assets protocol",
    category: "financial",
    summary:
      "Crownline's private protocol protects Meridian donors, compounds, and transport corridors before allocating aid to the public.",
    artifact: {
      type: "memo",
      heading: "MERIDIAN CONTINUITY · PRIORITY ASSET ORDER",
      body: [
        "TIER 0: BENEFACTOR HOUSEHOLDS / REDOUBT TRANSIT",
        "TIER 1: PRIVATE COMPOUNDS / DATA / FINANCIAL CUSTODY",
        "TIER 2: CONTRACTED PUBLIC LEADERSHIP",
        "TIER 4: GENERAL POPULATION RELIEF",
      ],
      handwritten: "The saviors reserve the first rescue for themselves.",
    },
  },
  redoubt_flight_sync_log: {
    id: "redoubt_flight_sync_log",
    title: "Redoubt flight synchronization log",
    category: "location",
    summary:
      "Crownline scheduled private Redoubt departures after each successful crisis exercise through Greyhaven Executive Airfield.",
    artifact: {
      type: "memo",
      heading: "REDOUBT TRANSIT · AUTOMATED FLIGHT WINDOWS",
      body: [
        "ORIGIN: GREYHAVEN EXECUTIVE AIRFIELD · HANGAR 4",
        "TRIGGER: FIELD BENCHMARK ACCEPTED",
        "PASSENGER CLASS: BENEFACTOR / CONTINUITY PRINCIPAL",
        "DESTINATION: SITE ORPHEUS · COORDINATES WITHHELD",
      ],
      handwritten: "Every successful crisis ends with the same people flying somewhere off the map.",
    },
  },
  executive_airfield_credential: {
    id: "executive_airfield_credential",
    title: "Hangar 4 airfield credential",
    category: "location",
    summary:
      "A Redoubt transit credential grants courier access to Hangar 4 at Greyhaven Executive Airfield.",
    artifact: {
      type: "memo",
      heading: "REDOUBT TRANSIT · COURIER CREDENTIAL",
      body: [
        "FACILITY: GREYHAVEN EXECUTIVE AIRFIELD",
        "ENTRY: HANGAR 4 SERVICE APRON",
        "CLEARANCE: SEALED MANIFEST DELIVERY",
        "DESTINATION AUTHORITY: SITE ORPHEUS",
      ],
      handwritten: "The next trail leaves Greyhaven by private jet.",
    },
  },
});

export const INVENTORY_ITEMS = Object.freeze({
  press_credentials: {
    id: "press_credentials",
    name: "Press credentials",
    icon: "ID",
    description: "Gets you past public-information gatekeepers when a reporter still counts as the public.",
  },
  smartphone: {
    id: "smartphone",
    name: "Phone & camera",
    icon: "CAM",
    description: "Photographs scenes, copies documents, and preserves visual evidence.",
  },
  recorder: {
    id: "recorder",
    name: "Audio recorder",
    icon: "REC",
    description: "Captures conversations and interfaces with recoverable audio sources.",
  },
  notebook: {
    id: "notebook",
    name: "Reporter’s notebook",
    icon: "NOTE",
    description: "Opens the current objective, deductions, leads, and progressive hints.",
  },
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
  mina_harcourt: {
    id: "mina_harcourt",
    character: "Mina Harcourt",
    portrait: "MH",
    start: "intro",
    nodes: {
      intro: {
        id: "intro",
        speaker: "Mina Harcourt",
        text:
          "You have thirty seconds to explain how you found this address before I leave through the fire stairs.",
        choices: [
          {
            id: "show-slip",
            text: "Your forwarding slip was at the Calder Grand.",
            evidenceId: "accountant_forwarding_slip",
            requires: { type: "hasEvidence", id: "accountant_forwarding_slip" },
            next: "slip",
          },
          {
            id: "play-recording",
            text: "Rook and Wren discussed moving you.",
            evidenceId: "room_b_conversation",
            requires: { type: "hasEvidence", id: "room_b_conversation" },
            next: "room-b",
          },
          { id: "leave", text: "I can come back.", end: true },
        ],
      },
      slip: {
        id: "slip",
        speaker: "Mina Harcourt",
        text:
          "That address was supposed to expire last month. If Wren kept it, he wanted someone to follow the paper trail here.",
        choices: [
          {
            id: "play-recording",
            text: "He also ordered you moved.",
            evidenceId: "room_b_conversation",
            requires: { type: "hasEvidence", id: "room_b_conversation" },
            next: "room-b",
          },
          { id: "leave", text: "Then I was expected.", end: true },
        ],
      },
      "room-b": {
        id: "room-b",
        speaker: "Mina Harcourt",
        text:
          "They call the contractors instruments. I reconciled the advances. Every false charity project had a matching emergency contract in the city archive.",
        onEnter: [
          { type: "setFlag", key: "questionedMinaHarcourt", value: true },
          { type: "collectEvidence", id: "mina_harcourt_statement" },
        ],
        choices: [
          {
            id: "ask-proof",
            text: "What proof survived?",
            next: "proof",
          },
          {
            id: "ask-purpose",
            text: "What were they building?",
            next: "purpose",
          },
        ],
      },
      purpose: {
        id: "purpose",
        speaker: "Mina Harcourt",
        text:
          "Secure rooms, private networks, bypass systems. Infrastructure that lets Meridian enter a crisis before everyone else knows there is one.",
        choices: [
          { id: "ask-proof", text: "Show me how to prove it.", next: "proof" },
        ],
      },
      proof: {
        id: "proof",
        speaker: "Mina Harcourt",
        text:
          "My copy of the advance index is beneath the suitcase. Take the old archive request with it. Register 09 is in the basement reading room—unless Wren reached it first.",
        onEnter: [
          { type: "setFlag", key: "trustedByMinaHarcourt", value: true },
        ],
        choices: [
          {
            id: "finish",
            text: "I will keep your name out of the first story.",
            end: true,
          },
        ],
      },
    },
  },
  rina_mercer: {
    id: "rina_mercer",
    character: "Rina Mercer",
    portrait: "RM",
    start: "intro",
    nodes: {
      intro: {
        id: "intro",
        speaker: "Rina Mercer",
        text:
          "Reporters came when the cameras did. They filmed the bottled water, thanked the foundation, and left before anyone asked why the relief trucks were already here.",
        choices: [
          {
            id: "show-clipping",
            text: "I found Deepwell's Bellwether contract file.",
            evidenceId: "bellwether_water_clipping",
            requires: { type: "hasEvidence", id: "bellwether_water_clipping" },
            next: "timeline",
          },
          { id: "leave", text: "I need to look around first.", end: true },
        ],
      },
      timeline: {
        id: "timeline",
        speaker: "Rina Mercer",
        text:
          "Then write the order down correctly. Deepwell's unmarked trucks came Tuesday. The water changed Thursday. Brighter Horizon's stage and television crew were ready before lunch.",
        onEnter: [
          { type: "setFlag", key: "questionedRinaMercer", value: true },
          { type: "collectEvidence", id: "rina_mercer_statement" },
        ],
        choices: [
          {
            id: "ask-tap",
            text: "Can you show me the first tap that failed?",
            next: "tap",
          },
        ],
      },
      tap: {
        id: "tap",
        speaker: "Rina Mercer",
        text:
          "The blue one beside the noticeboard. I kept it chained off. If you take a sample, I sign the chain of custody.",
        choices: [
          { id: "finish", text: "Keep everyone away from it.", end: true },
        ],
      },
    },
  },
  elian_voss: {
    id: "elian_voss",
    character: "Dr. Elian Voss",
    portrait: "EV",
    start: "intro",
    nodes: {
      intro: {
        id: "intro",
        speaker: "Dr. Elian Voss",
        text:
          "The university closed this annex six months ago. If you found the floodgate entrance, either Rina trusts you or Meridian followed you.",
        choices: [
          {
            id: "show-referral",
            text: "Rina sent me for the duplicate B-17 sample.",
            evidenceId: "university_lab_referral",
            requires: { type: "hasEvidence", id: "university_lab_referral" },
            next: "referral",
          },
          { id: "leave", text: "I will make sure I was not followed.", end: true },
        ],
      },
      referral: {
        id: "referral",
        speaker: "Dr. Elian Voss",
        text:
          "Then lock the service door. I refused Bellwether publicly and tested it privately. The sample contains something no treatment failure could make.",
        choices: [
          {
            id: "show-field-sample",
            text: "My field sample still tests positive for DW-4.",
            evidenceId: "bellwether_tap_sample",
            requires: { type: "hasEvidence", id: "bellwether_tap_sample" },
            next: "analysis",
          },
          {
            id: "ask-threat",
            text: "Why did the university refuse the test?",
            next: "threat",
          },
        ],
      },
      threat: {
        id: "threat",
        speaker: "Dr. Elian Voss",
        text:
          "Meridian funds the emergency program, the monitoring network, and half the lab. Their counsel called before the sample courier arrived.",
        choices: [
          {
            id: "show-field-sample",
            text: "Then compare their sample with mine.",
            evidenceId: "bellwether_tap_sample",
            requires: { type: "hasEvidence", id: "bellwether_tap_sample" },
            next: "analysis",
          },
        ],
      },
      analysis: {
        id: "analysis",
        speaker: "Dr. Elian Voss",
        text:
          "DW-4 carried an engineered biofilm tagged VA-9. The tag belongs to a watershed trial at Verdant conservation land. Someone used the bypass to seed Bellwether's intake.",
        onEnter: [
          { type: "setFlag", key: "questionedElianVoss", value: true },
          { type: "collectEvidence", id: "voss_statement" },
        ],
        choices: [
          {
            id: "ask-proof",
            text: "Show me what survived.",
            next: "proof",
          },
        ],
      },
      proof: {
        id: "proof",
        speaker: "Dr. Elian Voss",
        text:
          "The duplicate is in the open freezer drawer. My recorder kept the threat. The wall map and transfer clipboard show where VA-9 came from and who collected it.",
        choices: [
          { id: "finish", text: "Keep the freezer running.", end: true },
        ],
      },
    },
  },
  tess_arlen: {
    id: "tess_arlen",
    character: "Tess Arlen",
    portrait: "TA",
    start: "intro",
    nodes: {
      intro: {
        id: "intro",
        speaker: "Tess Arlen",
        text:
          "Parcel Six is closed to the public. The wetlands are unstable, the wildlife is under quarantine, and I am done explaining Meridian's mistakes for them.",
        choices: [
          {
            id: "show-gate-pass",
            text: "Dr. Voss gave me his old Parcel Six gate pass.",
            evidenceId: "verdant_preserve_gate_pass",
            requires: { type: "hasEvidence", id: "verdant_preserve_gate_pass" },
            next: "gate",
          },
          { id: "leave", text: "I will look around first.", end: true },
        ],
      },
      gate: {
        id: "gate",
        speaker: "Tess Arlen",
        text:
          "Elian kept that? Then he kept the sample, too. Meridian erased my field reports after the Bellwether release and called the deaths a seasonal die-off.",
        choices: [
          {
            id: "show-analysis",
            text: "The duplicate sample carries Verdant marker VA-9.",
            evidenceId: "annex_sample_chromatogram",
            requires: { type: "hasEvidence", id: "annex_sample_chromatogram" },
            next: "truth",
          },
          { id: "leave", text: "I need to verify that outside.", end: true },
        ],
      },
      truth: {
        id: "truth",
        speaker: "Tess Arlen",
        text:
          "VA-9 was not conservation work. It was a controlled stress test: poison a watershed, watch a town fail, then measure how quickly Meridian's relief network could take control.",
        onEnter: [
          { type: "setFlag", key: "questionedTessArlen", value: true },
          { type: "collectEvidence", id: "tess_arlen_statement" },
        ],
        choices: [
          {
            id: "ask-proof",
            text: "What did they fail to erase?",
            next: "proof",
          },
        ],
      },
      proof: {
        id: "proof",
        speaker: "Tess Arlen",
        text:
          "The mortality sheets are still inside the quarantine cages. Photograph the injection rig, then open the telemetry cabinet. Crownline received every live result.",
        choices: [
          { id: "finish", text: "Keep the gate locked behind me.", end: true },
        ],
      },
    },
  },
  nia_kade: {
    id: "nia_kade",
    character: "Nia Kade",
    portrait: "NK",
    start: "intro",
    nodes: {
      intro: {
        id: "intro",
        speaker: "Nia Kade",
        text:
          "That cooling gate is not a public entrance. Whatever your badge says, telemetry maintenance does not happen during a locked Meridian exercise.",
        choices: [
          {
            id: "show-badge",
            text: "This service badge came from Verdant Parcel Six.",
            evidenceId: "crownline_service_badge",
            requires: { type: "hasEvidence", id: "crownline_service_badge" },
            next: "badge",
          },
          { id: "leave", text: "I must have the wrong building.", end: true },
        ],
      },
      badge: {
        id: "badge",
        speaker: "Nia Kade",
        text:
          "That contractor disappeared after Bellwether. Crownline deleted the maintenance ticket, but the Parcel Six feed is still running behind my console.",
        choices: [
          {
            id: "show-manifest",
            text: "This manifest says Crownline retained the entire trial.",
            evidenceId: "crownline_telemetry_manifest",
            requires: { type: "hasEvidence", id: "crownline_telemetry_manifest" },
            next: "truth",
          },
          { id: "leave", text: "Then I need to see what survived.", end: true },
        ],
      },
      truth: {
        id: "truth",
        speaker: "Nia Kade",
        text:
          "Bellwether was on our operations wall before anyone called it a crisis. We did not score water recovery. We scored trust collapse and how quickly Meridian replaced the city.",
        onEnter: [
          { type: "setFlag", key: "questionedNiaKade", value: true },
          { type: "collectEvidence", id: "nia_kade_statement" },
        ],
        choices: [
          {
            id: "ask-proof",
            text: "Where is the score stored?",
            next: "proof",
          },
        ],
      },
      proof: {
        id: "proof",
        speaker: "Nia Kade",
        text:
          "Photograph the wall. The printer cached Bellwether's scorecard. The records cage holds Meridian's priority order, and the freight scheduler below it generates Redoubt flight windows.",
        choices: [
          {
            id: "finish",
            text: "Keep watching the lobby camera.",
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
      { type: "unlockLocation", id: "saltmere_apartment" },
    ],
  },
  continuity_site_network: {
    id: "continuity_site_network",
    title: "The foundation financed a hidden continuity network",
    journalText:
      "Harcourt's private ledger and the municipal register describe the same five projects. Each disposable contractor concealed secure infrastructure inside a public emergency response.",
    notification:
      "Act II complete. The first matching crisis began in Bellwether—after its solution had already been funded.",
    requiredDeductions: ["room_b_contractor_network"],
    requiredEvidence: [
      "gala_contractor_roster",
      "program_advance_index",
      "municipal_contract_register",
      "secure_site_map",
      "archive_destruction_order",
    ],
    requiredConnections: [
      {
        a: "program_advance_index",
        b: "municipal_contract_register",
        type: "financial",
      },
      {
        a: "gala_contractor_roster",
        b: "secure_site_map",
        type: "confirmed",
      },
      {
        a: "archive_destruction_order",
        b: "municipal_contract_register",
        type: "coverup",
      },
    ],
    effects: [
      { type: "setFlag", key: "mappedContinuitySiteNetwork", value: true },
      { type: "setPath", path: "progress.chapter", value: 3 },
      { type: "setPath", path: "progress.officeState", value: 6 },
      { type: "unlockLocation", id: "bellwether_relief_station" },
    ],
  },
  bellwether_response_preplanned: {
    id: "bellwether_response_preplanned",
    title: "Bellwether's rescue was staged before the crisis",
    journalText:
      "Deepwell rehearsed the bypass with Brighter Horizon funding, relief freight arrived before the first complaint, and the same industrial tracer remains in Bellwether's water. Meridian did not merely exploit the emergencyâ€”its network prepared it.",
    notification:
      "The relief operation was waiting for the crisis. A suppressed university sample may prove who contaminated the system.",
    requiredDeductions: ["continuity_site_network"],
    requiredEvidence: [
      "program_advance_index",
      "bellwether_water_clipping",
      "rina_mercer_statement",
      "bellwether_tap_sample",
      "relief_crate_photo",
      "deepwell_pump_service_log",
    ],
    requiredConnections: [
      {
        a: "bellwether_water_clipping",
        b: "relief_crate_photo",
        type: "contradiction",
      },
      {
        a: "program_advance_index",
        b: "deepwell_pump_service_log",
        type: "financial",
      },
      {
        a: "rina_mercer_statement",
        b: "bellwether_tap_sample",
        type: "confirmed",
      },
    ],
    effects: [
      { type: "setFlag", key: "provedBellwetherResponsePreplanned", value: true },
      { type: "collectEvidence", id: "university_lab_referral" },
      { type: "setPath", path: "progress.officeState", value: 7 },
      { type: "unlockLocation", id: "university_lab_annex" },
    ],
  },
  bellwether_engineered_contamination: {
    id: "bellwether_engineered_contamination",
    title: "Bellwether was an engineered demonstration",
    journalText:
      "The duplicate sample contains a designed biofilm tagged to Meridian's Verdant watershed trial. Deepwell removed that culture from the conservation parcel, introduced it during the bypass, and Meridian threatened the laboratory that identified it.",
    notification:
      "Bellwether was a live demonstration. Voss's old gate pass points to Verdant Conservation Parcel 6.",
    requiredDeductions: ["bellwether_response_preplanned"],
    requiredEvidence: [
      "bellwether_tap_sample",
      "university_lab_rejection",
      "voss_statement",
      "annex_sample_chromatogram",
      "meridian_funding_voicemail",
      "watershed_injection_map",
      "verdant_freezer_transfer_log",
    ],
    requiredConnections: [
      {
        a: "bellwether_tap_sample",
        b: "annex_sample_chromatogram",
        type: "confirmed",
      },
      {
        a: "university_lab_rejection",
        b: "meridian_funding_voicemail",
        type: "coverup",
      },
      {
        a: "watershed_injection_map",
        b: "verdant_freezer_transfer_log",
        type: "confirmed",
      },
    ],
    effects: [
      { type: "setFlag", key: "provedBellwetherEngineered", value: true },
      { type: "collectEvidence", id: "verdant_preserve_gate_pass" },
      { type: "setPath", path: "progress.officeState", value: 8 },
      { type: "unlockLocation", id: "verdant_conservation_office" },
    ],
  },
  verdant_test_range: {
    id: "verdant_test_range",
    title: "Verdant was a controlled crisis laboratory",
    journalText:
      "Verdant advertised wetland recovery while Parcel Six recorded animal deaths, injected VA-9 into the watershed, and streamed the results to Crownline. Bellwether was not the trial's accident. It was its field deployment.",
    notification:
      "Parcel Six was a test range. A Crownline service badge identifies the data center that watched Bellwether fail in real time.",
    requiredDeductions: ["bellwether_engineered_contamination"],
    requiredEvidence: [
      "verdant_preserve_gate_pass",
      "verdant_freezer_transfer_log",
      "verdant_public_brochure",
      "tess_arlen_statement",
      "parcel_six_mortality_log",
      "parcel_injection_rig_photo",
      "crownline_telemetry_manifest",
    ],
    requiredConnections: [
      {
        a: "verdant_public_brochure",
        b: "parcel_six_mortality_log",
        type: "contradiction",
      },
      {
        a: "verdant_preserve_gate_pass",
        b: "verdant_freezer_transfer_log",
        type: "confirmed",
      },
      {
        a: "parcel_injection_rig_photo",
        b: "crownline_telemetry_manifest",
        type: "confirmed",
      },
    ],
    effects: [
      { type: "setFlag", key: "provedVerdantTestRange", value: true },
      { type: "collectEvidence", id: "crownline_service_badge" },
      { type: "setPath", path: "progress.officeState", value: 9 },
      { type: "unlockLocation", id: "crownline_data_center" },
    ],
  },
  crownline_governance_model: {
    id: "crownline_governance_model",
    title: "Crownline measured the transfer of public power",
    journalText:
      "Crownline's public promise of neutral analytics concealed a governance-conversion model. Bellwether was graded on trust collapse and private-service adoption while Meridian protected its benefactors first and synchronized their departure through Redoubt.",
    notification:
      "Bellwether was a governance experiment. A Redoubt courier credential points to Hangar 4 at Greyhaven Executive Airfield.",
    requiredDeductions: ["verdant_test_range"],
    requiredEvidence: [
      "crownline_service_badge",
      "crownline_telemetry_manifest",
      "crownline_public_continuity_brief",
      "nia_kade_statement",
      "crownline_crisis_dashboard_photo",
      "bellwether_response_scorecard",
      "meridian_priority_protocol",
      "redoubt_flight_sync_log",
    ],
    requiredConnections: [
      {
        a: "crownline_public_continuity_brief",
        b: "bellwether_response_scorecard",
        type: "contradiction",
      },
      {
        a: "crownline_telemetry_manifest",
        b: "crownline_crisis_dashboard_photo",
        type: "confirmed",
      },
      {
        a: "meridian_priority_protocol",
        b: "redoubt_flight_sync_log",
        type: "financial",
      },
    ],
    effects: [
      { type: "setFlag", key: "provedCrownlineGovernanceModel", value: true },
      { type: "collectEvidence", id: "executive_airfield_credential" },
      { type: "setPath", path: "progress.officeState", value: 10 },
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
          toolId: "press_credentials",
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
          toolId: "smartphone",
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
          toolId: "recorder",
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
          toolId: "smartphone",
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
          toolId: "smartphone",
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
          toolId: "smartphone",
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
          toolId: "smartphone",
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
          toolId: "smartphone",
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
          toolId: "recorder",
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
    saltmere_apartment: {
      id: "saltmere_apartment",
      name: "26 Saltmere Walk",
      eyebrow: "Apartment 3C · Friday · 10:11 PM",
      mapX: 78,
      mapY: 62,
      description:
        "Mina Harcourt's apartment has been searched with professional patience. The kettle is still warm.",
      sceneClass: "scene-saltmere-apartment",
      sceneArt: "./assets/scenes/saltmere-apartment.webp",
      hotspots: [
        {
          id: "mina_harcourt",
          label: "Woman by the bedroom",
          x: 84,
          y: 29,
          width: 15,
          height: 43,
          title: "Mina Harcourt",
          text:
            "She is dressed to leave and positioned where she can see both you and the fire stairs.",
          actionLabel: "Speak with Mina Harcourt",
          dialogueId: "mina_harcourt",
        },
        {
          id: "searched_filing_desk",
          label: "Opened filing drawers",
          x: 35,
          y: 43,
          width: 31,
          height: 37,
          title: "A selective search",
          text:
            "Personal tax records remain. Every folder marked as a program reconciliation is gone.",
          actionLabel: "Photograph the apartment",
          toolId: "smartphone",
          resultText:
            "The searchers removed only Brighter Horizon records. Harcourt had packed before they arrived.",
          effects: [
            { type: "setFlag", key: "photographedHarcourtApartment", value: true },
            { type: "collectEvidence", id: "harcourt_apartment_photo" },
          ],
          actionWhen: {
            not: { type: "flag", key: "photographedHarcourtApartment" },
          },
        },
        {
          id: "harcourt_suitcase",
          label: "Half-packed suitcase",
          x: 67,
          y: 69,
          width: 25,
          height: 25,
          title: "The copy Harcourt kept",
          text:
            "A false bottom holds a handwritten reconciliation index and an old municipal archive request.",
          actionLabel: "Take the index and request card",
          resultText:
            "Harcourt's index matches five foundation advances to contractor names. Her request card points to Emergency Register 09.",
          effects: [
            { type: "setFlag", key: "foundHarcourtLedger", value: true },
            { type: "collectEvidence", id: "program_advance_index" },
            { type: "collectEvidence", id: "archive_request_card" },
            { type: "unlockLocation", id: "municipal_archive" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "trustedByMinaHarcourt" },
              { type: "flag", key: "foundHarcourtLedger", equals: false },
            ],
          },
        },
        {
          id: "saltmere_front_door",
          label: "Front-door lock",
          x: 0,
          y: 19,
          width: 14,
          height: 57,
          title: "No sign of forced entry",
          text:
            "The lock is intact. Whoever searched the apartment carried a key or convinced Mina to open the door.",
        },
        {
          id: "saltmere_kettle",
          label: "Warm kettle",
          x: 21,
          y: 38,
          width: 18,
          height: 24,
          title: "An interrupted cup of tea",
          text:
            "The burner is off, the kettle is warm, and a second cup was placed beside the sink.",
        },
        {
          id: "saltmere_window",
          label: "Rain-streaked window",
          x: 46,
          y: 12,
          width: 20,
          height: 34,
          title: "Saltmere Walk",
          text:
            "A dark sedan idles beneath a dead streetlamp, then moves before you can photograph the plate.",
        },
      ],
    },
    municipal_archive: {
      id: "municipal_archive",
      name: "Municipal Records Archive",
      eyebrow: "Basement Reading Room · Friday · 11:08 PM",
      mapX: 41,
      mapY: 67,
      description:
        "The city's discarded memory sits beneath exposed pipes, arranged by people who assumed no one would compare it with a charity ledger.",
      sceneClass: "scene-municipal-archive",
      sceneArt: "./assets/scenes/municipal-archive.webp",
      hotspots: [
        {
          id: "archive_register_reader",
          label: "Microfilm reader",
          x: 25,
          y: 42,
          width: 27,
          height: 31,
          title: "Emergency Register 09",
          text:
            "Harcourt's request number retrieves a contract register omitted from the public database.",
          actionLabel: "Copy the contract register",
          toolId: "smartphone",
          resultText:
            "Five municipal contracts match Harcourt's five foundation advances—contractor, purpose, and amount.",
          effects: [
            { type: "setFlag", key: "copiedMunicipalContractRegister", value: true },
            { type: "collectEvidence", id: "municipal_contract_register" },
          ],
          actionWhen: {
            all: [
              { type: "hasEvidence", id: "archive_request_card" },
              { type: "flag", key: "copiedMunicipalContractRegister", equals: false },
            ],
          },
        },
        {
          id: "archive_site_map",
          label: "Continuity map",
          x: 0,
          y: 27,
          width: 20,
          height: 38,
          title: "A map that explains the register",
          text:
            "Colored grease-pencil marks connect each contractor to infrastructure hidden inside a public emergency project.",
          actionLabel: "Photograph the site map",
          toolId: "smartphone",
          resultText:
            "Northstar's room is one node. Deepwell's mark sits beneath Bellwether's water-treatment bypass.",
          effects: [
            { type: "setFlag", key: "photographedContinuitySiteMap", value: true },
            { type: "collectEvidence", id: "secure_site_map" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "copiedMunicipalContractRegister" },
              { type: "flag", key: "photographedContinuitySiteMap", equals: false },
            ],
          },
        },
        {
          id: "archive_retention_cage",
          label: "Locked records cage",
          x: 77,
          y: 14,
          width: 22,
          height: 58,
          title: "Friday destruction queue",
          text:
            "The cage inventory includes Register 09 supporting files under an expedited destruction order.",
          actionLabel: "Photograph the destruction order",
          toolId: "smartphone",
          resultText:
            "Silas Wren requested the files destroyed before sunrise. Someone hid the register in the reading room instead.",
          effects: [
            { type: "setFlag", key: "foundArchiveDestructionOrder", value: true },
            { type: "collectEvidence", id: "archive_destruction_order" },
          ],
          actionWhen: {
            not: { type: "flag", key: "foundArchiveDestructionOrder" },
          },
        },
        {
          id: "archive_deepwell_box",
          label: "Deepwell file box",
          x: 55,
          y: 37,
          width: 18,
          height: 32,
          title: "Bellwether Water Response",
          text:
            "A newspaper clipping was used as a divider in Deepwell's contract file.",
          actionLabel: "Take the Bellwether clipping",
          resultText:
            "Deepwell received its advance days before Bellwether's water became unsafe—and Brighter Horizon arrived as the savior.",
          effects: [
            { type: "setFlag", key: "foundBellwetherClipping", value: true },
            { type: "collectEvidence", id: "bellwether_water_clipping" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "photographedContinuitySiteMap" },
              { type: "flag", key: "foundBellwetherClipping", equals: false },
            ],
          },
        },
        {
          id: "archive_pneumatic_terminal",
          label: "Pneumatic terminal",
          x: 48,
          y: 27,
          width: 11,
          height: 28,
          title: "A dead municipal nervous system",
          text:
            "The brass tube once moved authorization cards between departments faster than the public could request them.",
        },
        {
          id: "archive_service_door",
          label: "Heavy service door",
          x: 68,
          y: 25,
          width: 10,
          height: 36,
          title: "Footsteps above",
          text:
            "Someone tries the archive's outer door, waits, and leaves without switching on the stairwell light.",
        },
      ],
    },
    bellwether_relief_station: {
      id: "bellwether_relief_station",
      name: "Bellwether Relief Station",
      eyebrow: "Riverside Ward Â· Saturday Â· 6:42 AM",
      mapX: 20,
      mapY: 78,
      description:
        "A foundation-branded relief camp stands between Bellwether's silent pump house and the public taps it claims to have rescued.",
      sceneClass: "scene-bellwether-relief",
      sceneArt: "./assets/scenes/bellwether-relief-station.webp",
      hotspots: [
        {
          id: "rina_mercer",
          label: "Rina Mercer",
          x: 45,
          y: 32,
          width: 15,
          height: 43,
          title: "The organizer who stayed",
          text:
            "Rina watches the foundation volunteers pack their cameras before they pack the bottled water.",
          dialogueId: "rina_mercer",
        },
        {
          id: "bellwether_public_tap",
          label: "Chained public tap",
          x: 2,
          y: 37,
          width: 20,
          height: 37,
          title: "Tap B-17",
          text:
            "Rust-colored water stains the basin beneath a municipal seal. Rina has preserved the first failed tap.",
          actionLabel: "Collect and field-test a sample",
          resultText:
            "The strip turns violet for DW-4, an industrial tracer used during controlled bypass work.",
          effects: [
            { type: "setFlag", key: "loggedBellwetherTapSample", value: true },
            { type: "collectEvidence", id: "bellwether_tap_sample" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "questionedRinaMercer" },
              { type: "flag", key: "loggedBellwetherTapSample", equals: false },
            ],
          },
        },
        {
          id: "relief_crate_stack",
          label: "Relief freight",
          x: 67,
          y: 37,
          width: 25,
          height: 33,
          title: "Crates that arrived too early",
          text:
            "The outer labels are new, but the freight-intake stickers underneath carry Monday's date.",
          actionLabel: "Photograph the labels",
          toolId: "smartphone",
          resultText:
            "The relief shipment entered Bellwether forty-eight hours before the first resident complaint.",
          effects: [
            {
              type: "setFlag",
              key: "photographedBellwetherReliefCrates",
              value: true,
            },
            { type: "collectEvidence", id: "relief_crate_photo" },
          ],
          actionWhen: {
            not: { type: "flag", key: "photographedBellwetherReliefCrates" },
          },
        },
        {
          id: "deepwell_pump_hatch",
          label: "Pump-house hatch",
          x: 23,
          y: 29,
          width: 18,
          height: 40,
          title: "Deepwell left paperwork behind",
          text:
            "A carbon copy is caught beneath the service hatch, blurred by rain but still legible.",
          actionLabel: "Recover the service log",
          resultText:
            "Deepwell billed Brighter Horizon for a controlled bypass rehearsal using tracer DW-4.",
          effects: [
            { type: "setFlag", key: "foundDeepwellPumpLog", value: true },
            { type: "collectEvidence", id: "deepwell_pump_service_log" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "loggedBellwetherTapSample" },
              { type: "flag", key: "foundDeepwellPumpLog", equals: false },
            ],
          },
        },
        {
          id: "community_noticeboard",
          label: "Community noticeboard",
          x: 55,
          y: 21,
          width: 12,
          height: 30,
          title: "A test no one was allowed to run",
          text:
            "Residents pinned rejection letters beside boil-water notices. One bears a Meridian counsel reference.",
          actionLabel: "Copy the university rejection",
          toolId: "smartphone",
          resultText:
            "The university lab kept a duplicate sample at its river annex after Meridian threatened its funding.",
          effects: [
            { type: "setFlag", key: "foundUniversityRejection", value: true },
            { type: "collectEvidence", id: "university_lab_rejection" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "foundDeepwellPumpLog" },
              { type: "flag", key: "foundUniversityRejection", equals: false },
            ],
          },
        },
        {
          id: "deepwell_testing_van",
          label: "Testing van",
          x: 83,
          y: 15,
          width: 16,
          height: 28,
          title: "No company markings",
          text:
            "Fresh paint covers a rectangular logo, but a Deepwell asset number remains etched into the rear glass.",
        },
      ],
    },
    university_lab_annex: {
      id: "university_lab_annex",
      name: "University River Annex",
      eyebrow: "South Floodgate Â· Sunday Â· 12:07 AM",
      mapX: 29,
      mapY: 82,
      description:
        "Greyhaven University's condemned environmental lab still has power, one working freezer, and a scientist who refused to destroy the truth.",
      sceneClass: "scene-university-annex",
      sceneArt: "./assets/scenes/university-river-annex.webp",
      hotspots: [
        {
          id: "elian_voss",
          label: "Dr. Elian Voss",
          x: 59,
          y: 25,
          width: 15,
          height: 51,
          title: "The scientist who kept a copy",
          text:
            "Voss watches the floodgate reflection instead of the door. He has been expecting company, but not help.",
          dialogueId: "elian_voss",
        },
        {
          id: "annex_sample_freezer",
          label: "Open sample freezer",
          x: 36,
          y: 28,
          width: 17,
          height: 45,
          title: "Environmental Hold 6A",
          text:
            "The freezer drawer is open just far enough to reveal a sealed amber vial and a fresh chromatogram.",
          actionLabel: "Document the duplicate sample",
          resultText:
            "B-17 contains DW-4 and an engineered biofilm carrying Verdant trial marker VA-9.",
          effects: [
            { type: "setFlag", key: "foundAnnexSampleAnalysis", value: true },
            { type: "collectEvidence", id: "annex_sample_chromatogram" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "questionedElianVoss" },
              { type: "flag", key: "foundAnnexSampleAnalysis", equals: false },
            ],
          },
        },
        {
          id: "annex_reel_recorder",
          label: "Reel recorder",
          x: 79,
          y: 36,
          width: 15,
          height: 28,
          title: "A courtesy before the threat",
          text:
            "Voss routed his office line through an analog recorder after the university mail server began deleting notices.",
          actionLabel: "Copy the saved voicemail",
          toolId: "recorder",
          resultText:
            "A Meridian counsel offers to preserve the university's grants if Voss destroys Bellwether's intake record.",
          effects: [
            { type: "setFlag", key: "recordedMeridianFundingThreat", value: true },
            { type: "collectEvidence", id: "meridian_funding_voicemail" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "questionedElianVoss" },
              { type: "flag", key: "recordedMeridianFundingThreat", equals: false },
            ],
          },
        },
        {
          id: "annex_watershed_map",
          label: "Watershed trial map",
          x: 69,
          y: 14,
          width: 22,
          height: 25,
          title: "The contamination route",
          text:
            "Grease-pencil arrows follow the floodgate from Verdant Parcel 6 to Bellwether's upstream intake.",
          actionLabel: "Photograph the injection route",
          toolId: "smartphone",
          resultText:
            "The VA-9 release point reaches Bellwether in ninety minutes. Its public monitor was offline for exactly two hours.",
          effects: [
            {
              type: "setFlag",
              key: "photographedWatershedInjectionMap",
              value: true,
            },
            { type: "collectEvidence", id: "watershed_injection_map" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "foundAnnexSampleAnalysis" },
              {
                type: "flag",
                key: "photographedWatershedInjectionMap",
                equals: false,
              },
            ],
          },
        },
        {
          id: "annex_transfer_clipboard",
          label: "Transfer clipboard",
          x: 48,
          y: 43,
          width: 10,
          height: 25,
          title: "Who carried VA-9",
          text:
            "A carbon transfer sheet was folded behind the freezer maintenance schedule.",
          actionLabel: "Recover the transfer log",
          resultText:
            "Deepwell signed for VA-9 cultures from Meridian's Verdant conservation project.",
          effects: [
            { type: "setFlag", key: "foundVerdantTransferLog", value: true },
            { type: "collectEvidence", id: "verdant_freezer_transfer_log" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "photographedWatershedInjectionMap" },
              { type: "flag", key: "foundVerdantTransferLog", equals: false },
            ],
          },
        },
        {
          id: "annex_river_windows",
          label: "Floodgate windows",
          x: 0,
          y: 10,
          width: 31,
          height: 52,
          title: "Someone watching the annex",
          text:
            "One headlight appears across the river, vanishes, then returns reflected in the floodgate water.",
        },
        {
          id: "annex_cold_bench",
          label: "Abandoned test bench",
          x: 2,
          y: 48,
          width: 31,
          height: 34,
          title: "An unfunded laboratory",
          text:
            "The newest instrument is twelve years old. The sample labels are newer than tonight's rain.",
        },
      ],
    },
    verdant_conservation_office: {
      id: "verdant_conservation_office",
      name: "Verdant Conservation Parcel 6",
      eyebrow: "North Watershed · Monday · 5:42 AM",
      mapX: 13,
      mapY: 63,
      description:
        "A charitable wetland project behind razor wire, where healthy reeds stop at the fence and every sensor points downstream.",
      sceneClass: "scene-verdant-parcel",
      sceneArt: "./assets/scenes/verdant-conservation-parcel.webp",
      hotspots: [
        {
          id: "tess_arlen",
          label: "Tess Arlen",
          x: 22,
          y: 28,
          width: 14,
          height: 48,
          title: "The ecologist Meridian erased",
          text:
            "A field ecologist waits beneath the office awning with a radio that has not stopped hissing.",
          dialogueId: "tess_arlen",
        },
        {
          id: "verdant_public_notice",
          label: "Public information board",
          x: 37,
          y: 18,
          width: 15,
          height: 27,
          title: "A perfect recovery, on paper",
          text:
            "A weatherproof brochure promises a thriving wetland and zero adverse wildlife events.",
          actionLabel: "Take the public brochure",
          resultText:
            "Meridian's public report claims Parcel Six restored every monitored habitat without a single recorded loss.",
          effects: [
            { type: "setFlag", key: "foundVerdantBrochure", value: true },
            { type: "collectEvidence", id: "verdant_public_brochure" },
          ],
          actionWhen: {
            type: "flag",
            key: "foundVerdantBrochure",
            equals: false,
          },
        },
        {
          id: "parcel_quarantine_cages",
          label: "Quarantine cages",
          x: 0,
          y: 49,
          width: 22,
          height: 34,
          title: "The losses behind the brochure",
          text:
            "Numbered cages sit beneath tarps. A damp clipboard records losses the public report says never happened.",
          actionLabel: "Copy the mortality sheets",
          toolId: "smartphone",
          resultText:
            "Thirty-two test animals died within hours of each VA-9 release. The cause field was overwritten as seasonal.",
          effects: [
            { type: "setFlag", key: "foundParcelMortalityLog", value: true },
            { type: "collectEvidence", id: "parcel_six_mortality_log" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "questionedTessArlen" },
              { type: "flag", key: "foundParcelMortalityLog", equals: false },
            ],
          },
        },
        {
          id: "parcel_injection_rig",
          label: "Watershed injection rig",
          x: 78,
          y: 35,
          width: 21,
          height: 39,
          title: "A release valve aimed downstream",
          text:
            "The fertilizer label peels away from a pressure vessel fitted with the same couplings shown on Voss's watershed map.",
          actionLabel: "Photograph the injection rig",
          toolId: "smartphone",
          resultText:
            "The rig's metering plate lists VA-9 release volumes and Bellwether's intake as the downstream observation point.",
          effects: [
            {
              type: "setFlag",
              key: "photographedParcelInjectionRig",
              value: true,
            },
            { type: "collectEvidence", id: "parcel_injection_rig_photo" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "questionedTessArlen" },
              {
                type: "flag",
                key: "photographedParcelInjectionRig",
                equals: false,
              },
            ],
          },
        },
        {
          id: "crownline_telemetry_cabinet",
          label: "Telemetry cabinet",
          x: 58,
          y: 30,
          width: 17,
          height: 39,
          title: "Someone watched every result",
          text:
            "A locked sensor cabinet routes the parcel's water, wildlife, and emergency-response data through a private uplink.",
          actionLabel: "Recover the routing manifest",
          resultText:
            "Every live feed terminated at Crownline Data Services. A technician left a service badge clipped inside the cabinet.",
          effects: [
            {
              type: "setFlag",
              key: "foundCrownlineTelemetryManifest",
              value: true,
            },
            { type: "collectEvidence", id: "crownline_telemetry_manifest" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "photographedParcelInjectionRig" },
              {
                type: "flag",
                key: "foundCrownlineTelemetryManifest",
                equals: false,
              },
            ],
          },
        },
        {
          id: "verdant_field_office",
          label: "Field office",
          x: 29,
          y: 9,
          width: 28,
          height: 43,
          title: "Conservation as camouflage",
          text:
            "Seed packets and school-tour posters share a desk with respirators, burner phones, and nondisclosure forms.",
        },
        {
          id: "verdant_outflow",
          label: "Outflow channel",
          x: 67,
          y: 62,
          width: 31,
          height: 25,
          title: "The river remembers",
          text:
            "White foam gathers where the outflow crosses the fence. Beyond it, the current bends toward Bellwether.",
        },
      ],
    },
    crownline_data_center: {
      id: "crownline_data_center",
      name: "Crownline Regional Data Center",
      eyebrow: "East Greyhaven · Tuesday · 2:15 AM",
      mapX: 76,
      mapY: 58,
      description:
        "A windowless continuity-services building where every city emergency becomes a private performance metric.",
      sceneClass: "scene-crownline-data-center",
      sceneArt: "./assets/scenes/crownline-data-center.webp",
      hotspots: [
        {
          id: "nia_kade",
          label: "Nia Kade",
          x: 67,
          y: 20,
          width: 14,
          height: 44,
          title: "The overnight systems operator",
          text:
            "One operator remains at the raised console, watching Bellwether's history replay beside three unnamed cities.",
          dialogueId: "nia_kade",
        },
        {
          id: "crownline_lobby_directory",
          label: "Continuity-services directory",
          x: 2,
          y: 14,
          width: 15,
          height: 34,
          title: "Neutral observers, according to the lobby",
          text:
            "A polished services brief insists Crownline monitors emergencies without influencing policy or operations.",
          actionLabel: "Take the public services brief",
          resultText:
            "The brochure promises equitable allocation and explicitly denies Crownline has operational authority.",
          effects: [
            { type: "setFlag", key: "foundCrownlinePublicBrief", value: true },
            { type: "collectEvidence", id: "crownline_public_continuity_brief" },
          ],
          actionWhen: {
            type: "flag",
            key: "foundCrownlinePublicBrief",
            equals: false,
          },
        },
        {
          id: "crownline_operations_wall",
          label: "Crisis operations wall",
          x: 73,
          y: 7,
          width: 26,
          height: 28,
          title: "Bellwether was never just a water emergency",
          text:
            "The wall aligns contamination, public anger, relief adoption, and municipal surrender on a single timeline.",
          actionLabel: "Photograph the live dashboard",
          toolId: "smartphone",
          resultText:
            "The timeline begins before the first complaint and ends when Meridian services replace the city's response.",
          effects: [
            {
              type: "setFlag",
              key: "photographedCrisisDashboard",
              value: true,
            },
            { type: "collectEvidence", id: "crownline_crisis_dashboard_photo" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "questionedNiaKade" },
              {
                type: "flag",
                key: "photographedCrisisDashboard",
                equals: false,
              },
            ],
          },
        },
        {
          id: "crownline_printer_cache",
          label: "Discarded printer page",
          x: 24,
          y: 79,
          width: 15,
          height: 15,
          title: "A town reduced to a score",
          text:
            "A single page lies face-down beside the lobby desk, still warm from the overnight print queue.",
          actionLabel: "Recover Bellwether's scorecard",
          resultText:
            "Crownline graded Bellwether as a successful governance-conversion benchmark completed in sixty-three hours.",
          effects: [
            { type: "setFlag", key: "foundBellwetherScorecard", value: true },
            { type: "collectEvidence", id: "bellwether_response_scorecard" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "photographedCrisisDashboard" },
              {
                type: "flag",
                key: "foundBellwetherScorecard",
                equals: false,
              },
            ],
          },
        },
        {
          id: "crownline_records_cage",
          label: "Locked records cage",
          x: 33,
          y: 61,
          width: 23,
          height: 31,
          title: "Who receives help first",
          text:
            "A misfiled envelope protrudes through the cage mesh beneath a row of sealed Meridian continuity cases.",
          actionLabel: "Pull the exposed protocol",
          resultText:
            "Meridian's benefactors, compounds, money, and transport routes receive protection before general public relief.",
          effects: [
            {
              type: "setFlag",
              key: "foundMeridianPriorityProtocol",
              value: true,
            },
            { type: "collectEvidence", id: "meridian_priority_protocol" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "foundBellwetherScorecard" },
              {
                type: "flag",
                key: "foundMeridianPriorityProtocol",
                equals: false,
              },
            ],
          },
        },
        {
          id: "crownline_freight_scheduler",
          label: "Freight scheduler",
          x: 60,
          y: 68,
          width: 20,
          height: 26,
          title: "Redoubt leaves when the exercise succeeds",
          text:
            "The freight-elevator terminal mirrors completed crisis scores to a private aviation scheduler.",
          actionLabel: "Copy the flight synchronization log",
          toolId: "smartphone",
          resultText:
            "Every accepted field benchmark opens a flight window from Hangar 4 to a concealed destination called Site Orpheus.",
          effects: [
            { type: "setFlag", key: "foundRedoubtFlightSyncLog", value: true },
            { type: "collectEvidence", id: "redoubt_flight_sync_log" },
          ],
          actionWhen: {
            all: [
              { type: "flag", key: "foundMeridianPriorityProtocol" },
              {
                type: "flag",
                key: "foundRedoubtFlightSyncLog",
                equals: false,
              },
            ],
          },
        },
        {
          id: "crownline_server_hall",
          label: "Glass server hall",
          x: 32,
          y: 12,
          width: 33,
          height: 50,
          title: "The memory of manufactured emergencies",
          text:
            "Cold aisles preserve years of water levels, dispatches, frightened calls, purchases, and disappearing public trust.",
        },
        {
          id: "crownline_freight_elevator",
          label: "Freight elevator",
          x: 59,
          y: 62,
          width: 20,
          height: 31,
          title: "Below the operations floor",
          text:
            "The elevator requires dual authorization. Its directory omits the basement and roof.",
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
