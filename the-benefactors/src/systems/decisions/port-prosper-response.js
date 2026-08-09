export const PORT_PROSPER_RESPONSES = Object.freeze({
  warn: {
    id: "warn",
    title: "Warn the city quietly",
    summary:
      "Send the portfolio to trusted utility crews and emergency officials before Meridian knows the plan is exposed.",
    consequence:
      "Port Prosper begins isolating its water and power controls without naming your source. The First Circle continues believing its operation is secret.",
    evidenceId: "port_prosper_warning_receipt",
    flag: "warnedPortProsperQuietly",
    aftermath: [
      { label: "T-minus 41 hours", title: "The warning lands", text: "A utility supervisor authenticates the portfolio and quietly segments Port Prosper's water and grid controls. No public alarm. No name attached to the source." },
      { label: "T-minus 39 hours", title: "Someone tests the locks", text: "A remote maintenance credential tries every system the crews just isolated. The rejected connection routes through a townhouse consultancy in Greyhaven: Aster House." },
      { label: "T-minus 38 hours", title: "The trigger cell leaves a fingerprint", text: "Your contact preserves the access signature before it disappears. Aster House is not advising the response. It is rehearsing the attack." },
    ],
  },
  publish: {
    id: "publish",
    title: "Publish the First Circle now",
    summary:
      "Release the recording, names, portfolio, and escrow through every newsroom and mirror you can reach.",
    consequence:
      "The story detonates globally. Port Prosper is warned in public, but Meridian begins destroying records and evacuating exposed principals.",
    evidenceId: "first_circle_publication_record",
    flag: "publishedFirstCircleEvidence",
    aftermath: [
      { label: "Four minutes after publication", title: "The mirrors multiply", text: "The recording survives its first takedown request, then its tenth. Newsrooms, civic archives, and strangers mirror the Benefactors files faster than Meridian can deny them." },
      { label: "Eleven minutes after publication", title: "The purge begins", text: "One server starts deleting Port Prosper operations traffic while every other Meridian office goes dark. Its relay belongs to Aster House, a Greyhaven crisis consultancy." },
      { label: "Seventeen minutes after publication", title: "A live wire in the wreckage", text: "A mirrored routing log preserves Aster House's connection to the planned outage. Meridian is burning the operation, but the local trigger cell has not evacuated yet." },
    ],
  },
  stay: {
    id: "stay",
    title: "Remain undercover",
    summary:
      "Delay the warning long enough to follow the principals and recover evidence that can survive their denials.",
    consequence:
      "You keep the maintenance disguise and enter the private residential wing. Port Prosper's forty-eight-hour clock continues running.",
    evidenceId: "orpheus_deep_cover_pass",
    flag: "remainedUndercoverOnOrpheus",
    aftermath: [
      { label: "Orpheus Level 09", title: "Upstairs among the owners", text: "The service pass opens a silent corridor of private suites. Behind one door, the First Circle is already ordering staff to erase its Port Prosper preparations." },
      { label: "Service channel 4", title: "One office stays on the line", text: "A secure handset repeats the purge order to Aster House in Greyhaven. The reply confirms its team will keep the Port Prosper trigger schedule active." },
      { label: "Before the security sweep", title: "A destination worth escaping for", text: "You photograph the dispatch trace and leave the residential wing before your borrowed badge is revoked. Aster House is the local hand on the switch." },
    ],
  },
});

export function applyPortProsperResponse(state, responseId) {
  const response = PORT_PROSPER_RESPONSES[responseId];
  if (!response) throw new Error(`Unknown Port Prosper response: ${responseId}`);
  if (!state.flags.provedBenefactorsSelectCrises) {
    throw new Error("The First Circle plan must be proven before choosing a response.");
  }
  if (state.progress.portProsperResponse) return state;

  const next = structuredClone(state);
  next.progress.portProsperResponse = responseId;
  next.progress.portProsperFalloutStep = 0;
  next.progress.chapter = 8;
  next.progress.officeState = 15;
  next.flags.portProsperDecisionMade = true;
  next.flags[response.flag] = true;
  if (!next.evidence.collected.includes(response.evidenceId)) {
    next.evidence.collected.push(response.evidenceId);
  }
  return next;
}

export function advancePortProsperAftermath(state) {
  const response = PORT_PROSPER_RESPONSES[state.progress.portProsperResponse];
  if (!response) {
    throw new Error("A Port Prosper response must be chosen before its aftermath.");
  }
  if (state.flags.portProsperFalloutSeen) return state;

  const next = structuredClone(state);
  const currentStep = Number(next.progress.portProsperFalloutStep) || 0;
  next.progress.portProsperFalloutStep = Math.min(
    response.aftermath.length,
    currentStep + 1,
  );

  if (next.progress.portProsperFalloutStep === response.aftermath.length) {
    next.flags.portProsperFalloutSeen = true;
    next.flags.identifiedAsterHouse = true;
    next.progress.chapter = 9;
    next.progress.officeState = 16;
    if (!next.evidence.collected.includes("aster_house_trace")) {
      next.evidence.collected.push("aster_house_trace");
    }
    if (!next.progress.unlockedLocations.includes("aster_house")) {
      next.progress.unlockedLocations.push("aster_house");
    }
  }

  return next;
}
