export const GAME_STATE_VERSION = 21;

export const DEFAULT_SETTINGS = Object.freeze({
  textScale: 1,
  reducedMotion: false,
  highContrast: false,
  hotspotAssist: false,
  subtitles: true,
  musicVolume: 0.65,
  effectsVolume: 0.8,
  ambienceVolume: 0.75,
  muted: false,
});

export function createInitialState(player = {}, settings = {}) {
  const now = new Date().toISOString();

  return {
    version: GAME_STATE_VERSION,
    meta: {
      createdAt: now,
      updatedAt: now,
      playTimeSeconds: 0,
      lastSaveReason: "new-game",
    },
    player: {
      firstName: player.firstName?.trim() || "Alex",
      lastName: player.lastName?.trim() || "Rowan",
      pronouns: player.pronouns || "they",
      portrait: player.portrait || "portrait-1",
    },
    progress: {
      chapter: 1,
      officeState: 0,
      currentLocation: "home_office",
      currentScreen: "onboarding",
      previousScreen: "setup",
      unlockedLocations: ["home_office", "ledger_newsroom"],
      opening: {
        tutorialChoice: null,
        tutorialStep: 0,
        tutorialCompleted: false,
        cutsceneStep: 0,
        cutsceneCompleted: false,
      },
      prologueEndingStep: 0,
      prologueComplete: false,
    },
    flags: {
      heardOpeningMessage: false,
      openedAnonymousEmail: false,
      downloadedAttachments: false,
      visitedNewsroom: false,
      permitAcquired: false,
      mayorMissing: false,
      photographedWestWall: false,
      foundStudyFloorplan: false,
      foundValeRecording: false,
      foundWallCavity: false,
      recordingReconstructed: false,
      heardValeRecording: false,
      confirmedMeridianLead: false,
      prologueEndingReady: false,
      receivedGalaPhotograph: false,
      northstarAddressIdentified: false,
      photographedHarrowDirectory: false,
      questionedHarrowManager: false,
      foundNorthstarCourierManifest: false,
      northstarRoutesToBrighterHorizon: false,
      photographedFoundationDonorWall: false,
      questionedFoundationReceptionist: false,
      foundFoundationVisitorLog: false,
      foundFoundationDisbursementReport: false,
      brighterHorizonFundsNorthstar: false,
      photographedGalaSeatingPlan: false,
      identifiedSilasWren: false,
      questionedCassianRook: false,
      foundGalaServicePass: false,
      photographedContractorRoster: false,
      recordedRoomBConversation: false,
      foundAccountantForwardingSlip: false,
      uncoveredContractorNetwork: false,
      photographedHarcourtApartment: false,
      questionedMinaHarcourt: false,
      trustedByMinaHarcourt: false,
      foundHarcourtLedger: false,
      copiedMunicipalContractRegister: false,
      photographedContinuitySiteMap: false,
      foundArchiveDestructionOrder: false,
      foundBellwetherClipping: false,
      mappedContinuitySiteNetwork: false,
      questionedRinaMercer: false,
      loggedBellwetherTapSample: false,
      photographedBellwetherReliefCrates: false,
      foundDeepwellPumpLog: false,
      foundUniversityRejection: false,
      provedBellwetherResponsePreplanned: false,
      questionedElianVoss: false,
      foundAnnexSampleAnalysis: false,
      recordedMeridianFundingThreat: false,
      photographedWatershedInjectionMap: false,
      foundVerdantTransferLog: false,
      provedBellwetherEngineered: false,
      questionedTessArlen: false,
      foundVerdantBrochure: false,
      foundParcelMortalityLog: false,
      photographedParcelInjectionRig: false,
      foundCrownlineTelemetryManifest: false,
      provedVerdantTestRange: false,
      questionedNiaKade: false,
      foundCrownlinePublicBrief: false,
      photographedCrisisDashboard: false,
      foundBellwetherScorecard: false,
      foundMeridianPriorityProtocol: false,
      foundRedoubtFlightSyncLog: false,
      provedCrownlineGovernanceModel: false,
      questionedEllisWard: false,
      photographedHangarManifest: false,
      photographedBenefactorBoarding: false,
      foundRedoubtCargoSeal: false,
      foundOrpheusRouteStrip: false,
      provedRedoubtEvacuation: false,
      questionedTamsinPike: false,
      photographedBlackwaterLedger: false,
      foundOrpheusColdChainManifest: false,
      photographedIslandServiceLaunch: false,
      foundBlackwaterTideWindow: false,
      provedOrpheusSupplyRoute: false,
      questionedAdrianMoss: false,
      photographedOrpheusArrivalRegistry: false,
      foundBenefactorClinicTransferOrder: false,
      photographedOrpheusSecurityWall: false,
      foundSublevelElevatorDirectory: false,
      provedOrpheusCommandCenter: false,
      recordedFirstCircleVote: false,
      photographedFirstCircleRegistry: false,
      foundPortProsperPortfolio: false,
      foundCrisisInvestmentEscrow: false,
      provedBenefactorsSelectCrises: false,
    },
    inventory: ["press_credentials", "smartphone", "recorder", "notebook"],
    evidence: {
      collected: [],
      pinned: [],
      corroborated: [],
      discredited: [],
    },
    board: {
      layoutVersion: 2,
      cards: {},
      connections: [],
      zoom: 1,
      offset: { x: 0, y: 0 },
    },
    characters: {},
    dialogue: {
      activeDialogueId: null,
      activeNodeId: null,
      visitedNodes: [],
      completedDialogues: [],
    },
    journal: {
      revealedHints: {},
    },
    puzzles: {
      study_plan_alignment: {
        rotation: 90,
        attempts: 0,
        hintsRevealed: 0,
        completed: false,
      },
      vale_recording_reconstruction: {
        order: [
          "vale_recording_rain",
          "vale_recording_clock",
          "vale_recording_freight",
        ],
        attempts: 0,
        hintsRevealed: 0,
        completed: false,
      },
    },
    completedDeductions: [],
    locationVisits: {
      home_office: 0,
      ledger_newsroom: 0,
      city_hall: 0,
      mayor_street: 0,
      mayor_study: 0,
      hidden_room: 0,
      northstar_harrow: 0,
      brighter_horizon_office: 0,
      calder_grand_gala: 0,
      calder_grand_service_corridor: 0,
      saltmere_apartment: 0,
      municipal_archive: 0,
      bellwether_relief_station: 0,
      university_lab_annex: 0,
      verdant_conservation_office: 0,
      crownline_data_center: 0,
      greyhaven_executive_airfield: 0,
      blackwater_point: 0,
      orpheus_sublevel_harbor: 0,
      orpheus_first_circle: 0,
    },
    settings: {
      ...DEFAULT_SETTINGS,
      ...settings,
    },
  };
}

export function cloneState(state) {
  return structuredClone(state);
}

export function isGameState(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      Number.isInteger(value.version) &&
      value.meta &&
      value.player &&
      value.progress &&
      value.progress.opening &&
      typeof value.progress.opening === "object" &&
      typeof value.progress.opening.tutorialCompleted === "boolean" &&
      typeof value.progress.opening.cutsceneCompleted === "boolean" &&
      Number.isInteger(value.progress.prologueEndingStep) &&
      typeof value.progress.prologueComplete === "boolean" &&
      value.flags &&
      value.evidence &&
      value.board &&
      value.journal &&
      value.journal.revealedHints &&
      value.puzzles &&
      value.puzzles.study_plan_alignment &&
      value.puzzles.vale_recording_reconstruction &&
      value.settings,
  );
}

export class GameStore {
  #state;
  #listeners = new Set();

  constructor(initialState = createInitialState()) {
    if (!isGameState(initialState)) {
      throw new TypeError("GameStore requires a valid game state.");
    }
    this.#state = cloneState(initialState);
  }

  getState() {
    return cloneState(this.#state);
  }

  replace(nextState, reason = "replace") {
    if (!isGameState(nextState)) {
      throw new TypeError("Cannot replace state with invalid data.");
    }
    this.#state = cloneState(nextState);
    this.#state.meta.updatedAt = new Date().toISOString();
    this.#state.meta.lastSaveReason = reason;
    this.#notify(reason);
    return this.getState();
  }

  update(recipe, reason = "update") {
    const draft = cloneState(this.#state);
    const result = recipe(draft) || draft;
    return this.replace(result, reason);
  }

  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #notify(reason) {
    const snapshot = this.getState();
    this.#listeners.forEach((listener) => listener(snapshot, reason));
  }
}
