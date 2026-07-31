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
    id: "attend_calder_gala",
    title: "Invitation only",
    objective: "Use the invitation to enter Brighter Horizon’s benefit at the Calder Grand.",
    activeWhen: {
      not: { type: "visited", location: "calder_grand_gala" },
    },
    hints: [
      "Review the Calder Grand gala invitation in the case file.",
      "The benefit is now available on the city map.",
      "Travel to the Calder Grand and begin with the coat-check attendant.",
    ],
  },
  {
    id: "identify_silas_wren",
    title: "The man outside the seating plan",
    objective: "Identify the circled guest and learn why he avoids the public ballroom.",
    activeWhen: {
      any: [
        { type: "flag", key: "identifiedSilasWren", equals: false },
        { type: "flag", key: "photographedGalaSeatingPlan", equals: false },
        { type: "flag", key: "questionedCassianRook", equals: false },
        { not: { type: "hasEvidence", id: "gala_terrace_photo" } },
      ],
    },
    hints: [
      "The attendant, seating plan, podium, and terrace each reveal a different part of the guest list.",
      "Show Imani the circled gala photograph, inspect the seating plan, and challenge Rook with the disbursement report.",
      "After Imani identifies Silas Wren, photograph his meeting with Rook by the terrace.",
    ],
  },
  {
    id: "enter_service_corridor",
    title: "Behind the ballroom",
    objective: "Recover Silas Wren’s dropped pass and follow him through the staff-only door.",
    activeWhen: {
      not: { type: "visited", location: "calder_grand_service_corridor" },
    },
    hints: [
      "Imani said Wren dropped an operations pass near coat check.",
      "Inspect the floor beside the coat-check counter after identifying Wren.",
      "Take the service pass, then use the staff door beside the seating plan.",
    ],
  },
  {
    id: "investigate_room_b",
    title: "Room B",
    objective: "Document the contractor network and identify the person Rook wants moved.",
    activeWhen: {
      any: [
        { type: "flag", key: "photographedContractorRoster", equals: false },
        { type: "flag", key: "recordedRoomBConversation", equals: false },
        { type: "flag", key: "foundAccountantForwardingSlip", equals: false },
      ],
    },
    hints: [
      "The service roster, private salon door, and security desk preserve the useful records.",
      "Photograph the Room B roster and record Rook and Wren through the salon door.",
      "After recording the conversation, take the payroll forwarding slip from the security desk.",
    ],
  },
  {
    id: "connect_contractor_network",
    title: "Disposable instruments",
    objective: "Use the board to prove Northstar was one of several foundation-financed shell contractors.",
    activeWhen: {
      type: "flag",
      key: "uncoveredContractorNetwork",
      equals: false,
    },
    hints: [
      "The gala roster has a financial twin. The Room B recording has a location twin.",
      "Connect the Brighter Horizon disbursement report to the Room B contractor roster with Blue · Financial.",
      "Connect the Meridian guest-list header to the Room B conversation with Red · Confirmed.",
    ],
  },
  {
    id: "accountant_lead",
    title: "The former accountant",
    objective: "Find Mina Harcourt at 26 Saltmere Walk, Apartment 3C.",
    activeWhen: {
      not: { type: "visited", location: "saltmere_apartment" },
    },
    hints: [
      "Review Mina Harcourt’s forwarding slip in the case file.",
      "Harcourt handled Brighter Horizon’s program advances before she was terminated.",
      "Travel to 26 Saltmere Walk from the city map.",
    ],
  },
  {
    id: "question_harcourt",
    title: "The ledger that survived",
    objective: "Earn Harcourt's trust and recover her private program-advance index.",
    activeWhen: {
      any: [
        { type: "flag", key: "questionedMinaHarcourt", equals: false },
        { type: "flag", key: "foundHarcourtLedger", equals: false },
        { type: "flag", key: "photographedHarcourtApartment", equals: false },
      ],
    },
    hints: [
      "Document the searched apartment, then show Mina why she is in danger.",
      "Photograph the opened filing drawers and play Mina the Room B conversation.",
      "After Mina trusts you, inspect the half-packed suitcase for her copied index and archive request.",
    ],
  },
  {
    id: "visit_archive",
    title: "Register 09",
    objective: "Use Harcourt's request card at the Municipal Records Archive.",
    activeWhen: {
      not: { type: "visited", location: "municipal_archive" },
    },
    hints: [
      "Harcourt's old archive request unlocks a new destination on the city map.",
      "Travel to the Municipal Records Archive basement.",
      "Begin with the microfilm reader on the research table.",
    ],
  },
  {
    id: "investigate_archive",
    title: "The city's second ledger",
    objective: "Recover the matching contract register, continuity map, and destruction order.",
    activeWhen: {
      any: [
        { type: "flag", key: "copiedMunicipalContractRegister", equals: false },
        { type: "flag", key: "photographedContinuitySiteMap", equals: false },
        { type: "flag", key: "foundArchiveDestructionOrder", equals: false },
        { type: "flag", key: "foundBellwetherClipping", equals: false },
      ],
    },
    hints: [
      "The reader, wall map, locked cage, and Deepwell box preserve different parts of the program.",
      "Copy Register 09, photograph the continuity map, and inspect the destruction queue.",
      "After photographing the map, take the Bellwether clipping from the Deepwell file box.",
    ],
  },
  {
    id: "connect_continuity_network",
    title: "Infrastructure for a crisis",
    objective: "Use the evidence board to prove the charity and city records describe one hidden network.",
    activeWhen: {
      type: "flag",
      key: "mappedContinuitySiteNetwork",
      equals: false,
    },
    hints: [
      "Match the two ledgers, place the contractors on the map, and show the attempted cover-up.",
      "Use Blue · Financial for Harcourt's index ↔ emergency register and Red · Confirmed for contractor roster ↔ continuity map.",
      "Use Black · Cover-up for the destruction order ↔ emergency contract register.",
    ],
  },
  {
    id: "visit_bellwether",
    title: "The crisis that came second",
    objective: "Travel to Bellwether and find the residents who remained after the cameras left.",
    activeWhen: {
      not: { type: "visited", location: "bellwether_relief_station" },
    },
    hints: [
      "The continuity-network deduction unlocks Bellwether on the city map.",
      "Travel to the Bellwether Relief Station.",
      "Start with the organizer standing between the public taps and the foundation camp.",
    ],
  },
  {
    id: "investigate_bellwether",
    title: "Before the cameras arrived",
    objective: "Reconstruct Bellwether's true timeline and preserve evidence from the failed water system.",
    activeWhen: {
      any: [
        { type: "flag", key: "questionedRinaMercer", equals: false },
        { type: "flag", key: "loggedBellwetherTapSample", equals: false },
        { type: "flag", key: "photographedBellwetherReliefCrates", equals: false },
        { type: "flag", key: "foundDeepwellPumpLog", equals: false },
        { type: "flag", key: "foundUniversityRejection", equals: false },
      ],
    },
    hints: [
      "Rina knows when Deepwell and Brighter Horizon arrived.",
      "After speaking to Rina, test the chained public tap and compare its tracer with the pump-house paperwork.",
      "Photograph the relief labels, recover the pump log, then inspect the residents' noticeboard.",
    ],
  },
  {
    id: "connect_bellwether",
    title: "A rescue waiting for a crisis",
    objective: "Use the evidence board to prove Bellwether's relief operation was prepared in advance.",
    activeWhen: {
      type: "flag",
      key: "provedBellwetherResponsePreplanned",
      equals: false,
    },
    hints: [
      "Connect the public story to freight that arrived before it, Deepwell's advance to its service log, and Rina's account to the field sample.",
      "Use White Â· Contradiction for crisis clipping â†” relief-crate photo and Blue Â· Financial for program index â†” pump-service log.",
      "Use Red Â· Confirmed for Rina's timeline â†” Bellwether tap-field sample.",
    ],
  },
  {
    id: "visit_university_annex",
    title: "The sample they could not destroy",
    objective: "Find Dr. Voss and the duplicate Bellwether sample at Greyhaven University's river annex.",
    activeWhen: {
      not: { type: "visited", location: "university_lab_annex" },
    },
    hints: [
      "Review Dr. Voss's private lab address in the case file.",
      "Meridian threatened the university's emergency-response funding.",
      "Enter the shuttered river annex through the south floodgate.",
    ],
  },
  {
    id: "investigate_university_annex",
    title: "Environmental Hold 6A",
    objective: "Earn Voss's trust and recover the sample analysis, funding threat, watershed map, and transfer record.",
    activeWhen: {
      any: [
        { type: "flag", key: "questionedElianVoss", equals: false },
        { type: "flag", key: "foundAnnexSampleAnalysis", equals: false },
        { type: "flag", key: "recordedMeridianFundingThreat", equals: false },
        {
          type: "flag",
          key: "photographedWatershedInjectionMap",
          equals: false,
        },
        { type: "flag", key: "foundVerdantTransferLog", equals: false },
      ],
    },
    hints: [
      "Show Voss the private referral and Bellwether field sample.",
      "After the interview, inspect the open freezer and analog recorder.",
      "The duplicate analysis unlocks the watershed map; the map leads to the transfer clipboard.",
    ],
  },
  {
    id: "connect_engineered_crisis",
    title: "A live demonstration",
    objective: "Use the evidence board to prove Meridian engineered Bellwether's contamination.",
    activeWhen: {
      type: "flag",
      key: "provedBellwetherEngineered",
      equals: false,
    },
    hints: [
      "Prove the field sample matches the duplicate, the university was silenced, and VA-9 traveled from Verdant to Deepwell.",
      "Use Red Â· Confirmed for Bellwether sample â†” duplicate analysis and Black Â· Cover-up for rejection â†” funding voicemail.",
      "Use Red Â· Confirmed for watershed injection map â†” Verdant sample-transfer log.",
    ],
  },
  {
    id: "visit_verdant_parcel",
    title: "A laboratory with trees around it",
    objective: "Use Voss's gate pass to enter Verdant Conservation Parcel 6.",
    activeWhen: {
      not: { type: "visited", location: "verdant_conservation_office" },
    },
    hints: [
      "Review the Verdant Parcel 6 gate pass in the case file.",
      "Deepwell had contractor access to Meridian's watershed trial.",
      "Travel to the conservation parcel from the city map.",
    ],
  },
  {
    id: "investigate_verdant_parcel",
    title: "The wetland that lies",
    objective: "Question Tess Arlen and recover Parcel Six's hidden field records.",
    activeWhen: {
      any: [
        { type: "flag", key: "questionedTessArlen", equals: false },
        { type: "flag", key: "foundVerdantBrochure", equals: false },
        { type: "flag", key: "foundParcelMortalityLog", equals: false },
        {
          type: "flag",
          key: "photographedParcelInjectionRig",
          equals: false,
        },
        {
          type: "flag",
          key: "foundCrownlineTelemetryManifest",
          equals: false,
        },
      ],
    },
    hints: [
      "Show Tess the Verdant gate pass, then the duplicate sample analysis.",
      "Compare the public information board with the quarantine cages.",
      "Photograph the injection rig before opening the telemetry cabinet.",
    ],
  },
  {
    id: "connect_verdant_test_range",
    title: "A crisis laboratory",
    objective: "Use the evidence board to prove Parcel Six was a controlled test range.",
    activeWhen: {
      type: "flag",
      key: "provedVerdantTestRange",
      equals: false,
    },
    hints: [
      "Prove the brochure hid the deaths, the gate pass matches the transfer route, and Crownline watched the injection rig.",
      "Use White · Contradiction for Verdant brochure ↔ Parcel Six mortality log.",
      "Use Red · Confirmed for gate pass ↔ freezer transfer log and injection-rig photo ↔ Crownline telemetry manifest.",
    ],
  },
  {
    id: "visit_crownline",
    title: "The people watching the experiment",
    objective: "Use the recovered service badge to enter Crownline Regional Data Center.",
    activeWhen: {
      not: { type: "visited", location: "crownline_data_center" },
    },
    hints: [
      "Review the Crownline service badge in the case file.",
      "The telemetry manifest points to a private data center inside Greyhaven.",
      "Enter through the cooling-plant gate during its after-hours service window.",
    ],
  },
  {
    id: "investigate_crownline",
    title: "A town reduced to numbers",
    objective: "Question Nia Kade and recover Crownline's hidden Bellwether records.",
    activeWhen: {
      any: [
        { type: "flag", key: "questionedNiaKade", equals: false },
        { type: "flag", key: "foundCrownlinePublicBrief", equals: false },
        {
          type: "flag",
          key: "photographedCrisisDashboard",
          equals: false,
        },
        { type: "flag", key: "foundBellwetherScorecard", equals: false },
        {
          type: "flag",
          key: "foundMeridianPriorityProtocol",
          equals: false,
        },
        { type: "flag", key: "foundRedoubtFlightSyncLog", equals: false },
      ],
    },
    hints: [
      "Show Nia the Crownline service badge, then the Parcel Six telemetry manifest.",
      "Photograph the operations wall and inspect the discarded printer page.",
      "The scorecard leads to the records cage; the priority protocol leads to the freight scheduler.",
    ],
  },
  {
    id: "connect_crownline_model",
    title: "The conversion score",
    objective: "Use the evidence board to prove Crownline measured the transfer of public power.",
    activeWhen: {
      type: "flag",
      key: "provedCrownlineGovernanceModel",
      equals: false,
    },
    hints: [
      "Contrast Crownline's public promise with its scorecard, verify the live feed, and trace benefactor priority to Redoubt.",
      "Use White · Contradiction for services brief / Bellwether scorecard and Red · Confirmed for telemetry manifest / dashboard photo.",
      "Use Blue · Financial for protected-assets protocol / Redoubt flight log.",
    ],
  },
  {
    id: "executive_airfield_lead",
    title: "The trail leaves Greyhaven",
    objective: "Redoubt flights depart Hangar 4 for a concealed destination called Site Orpheus.",
    activeWhen: null,
    hints: [
      "Review the Hangar 4 courier credential in the case file.",
      "Every successful crisis exercise generated a private flight window.",
      "The next investigation begins at Greyhaven Executive Airfield.",
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
  { label: "Calder Grand infiltrated", when: { type: "visited", location: "calder_grand_gala" } },
  { label: "Silas Wren identified", when: { type: "flag", key: "identifiedSilasWren" } },
  { label: "Service corridor breached", when: { type: "visited", location: "calder_grand_service_corridor" } },
  { label: "Room B contractor roster recovered", when: { type: "flag", key: "photographedContractorRoster" } },
  { label: "Rook and Wren recorded", when: { type: "flag", key: "recordedRoomBConversation" } },
  { label: "Contractor network proven", when: { type: "flag", key: "uncoveredContractorNetwork" } },
  { label: "Mina Harcourt located", when: { type: "visited", location: "saltmere_apartment" } },
  { label: "Program-advance index recovered", when: { type: "flag", key: "foundHarcourtLedger" } },
  { label: "Emergency Register 09 copied", when: { type: "flag", key: "copiedMunicipalContractRegister" } },
  { label: "Continuity sites mapped", when: { type: "flag", key: "photographedContinuitySiteMap" } },
  { label: "Archive destruction order recovered", when: { type: "flag", key: "foundArchiveDestructionOrder" } },
  { label: "Hidden continuity network proven", when: { type: "flag", key: "mappedContinuitySiteNetwork" } },
  { label: "Bellwether organizer interviewed", when: { type: "flag", key: "questionedRinaMercer" } },
  { label: "Bellwether tap sample preserved", when: { type: "flag", key: "loggedBellwetherTapSample" } },
  { label: "Pre-positioned relief freight documented", when: { type: "flag", key: "photographedBellwetherReliefCrates" } },
  { label: "Deepwell bypass log recovered", when: { type: "flag", key: "foundDeepwellPumpLog" } },
  { label: "Staged relief operation proven", when: { type: "flag", key: "provedBellwetherResponsePreplanned" } },
  { label: "University river annex entered", when: { type: "visited", location: "university_lab_annex" } },
  { label: "Dr. Voss interviewed", when: { type: "flag", key: "questionedElianVoss" } },
  { label: "Duplicate B-17 analysis recovered", when: { type: "flag", key: "foundAnnexSampleAnalysis" } },
  { label: "Meridian funding threat preserved", when: { type: "flag", key: "recordedMeridianFundingThreat" } },
  { label: "Verdant transfer route documented", when: { type: "flag", key: "foundVerdantTransferLog" } },
  { label: "Engineered Bellwether crisis proven", when: { type: "flag", key: "provedBellwetherEngineered" } },
  { label: "Verdant Parcel Six entered", when: { type: "visited", location: "verdant_conservation_office" } },
  { label: "Tess Arlen interviewed", when: { type: "flag", key: "questionedTessArlen" } },
  { label: "Parcel Six mortality log recovered", when: { type: "flag", key: "foundParcelMortalityLog" } },
  { label: "VA-9 injection rig photographed", when: { type: "flag", key: "photographedParcelInjectionRig" } },
  { label: "Crownline telemetry route recovered", when: { type: "flag", key: "foundCrownlineTelemetryManifest" } },
  { label: "Verdant crisis laboratory proven", when: { type: "flag", key: "provedVerdantTestRange" } },
  { label: "Crownline data center entered", when: { type: "visited", location: "crownline_data_center" } },
  { label: "Nia Kade interviewed", when: { type: "flag", key: "questionedNiaKade" } },
  { label: "Crisis dashboard photographed", when: { type: "flag", key: "photographedCrisisDashboard" } },
  { label: "Bellwether scorecard recovered", when: { type: "flag", key: "foundBellwetherScorecard" } },
  { label: "Meridian priority protocol recovered", when: { type: "flag", key: "foundMeridianPriorityProtocol" } },
  { label: "Redoubt flight schedule recovered", when: { type: "flag", key: "foundRedoubtFlightSyncLog" } },
  { label: "Crownline governance model proven", when: { type: "flag", key: "provedCrownlineGovernanceModel" } },
]);
