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
  next.progress.chapter = 8;
  next.progress.officeState = 15;
  next.flags.portProsperDecisionMade = true;
  next.flags[response.flag] = true;
  if (!next.evidence.collected.includes(response.evidenceId)) {
    next.evidence.collected.push(response.evidenceId);
  }
  return next;
}
