function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}

export function relationshipStatus(record = {}) {
  const trust = Number(record.trust) || 0;
  if (trust <= -2) return { label: "Hostile", className: "hostile" };
  if (trust < 1) return { label: "Guarded", className: "guarded" };
  if (trust < 3) return { label: "Cooperative", className: "cooperative" };
  if (trust < 5) return { label: "Trusted", className: "trusted" };
  return { label: "Committed", className: "committed" };
}

export function exposureStatus(record = {}) {
  const risk = Number(record.risk) || 0;
  if (risk < 1) return "Protected";
  if (risk < 3) return "Exposed";
  if (risk < 5) return "Threatened";
  return "In immediate danger";
}

export function getRelationshipRecord(state, profile) {
  return {
    trust: 0,
    risk: 0,
    interactions: 0,
    promises: [],
    history: [],
    events: [],
    assistance: [],
    ...(state.characters?.[profile.id] || {}),
  };
}

export function previewRelationshipMoment(profile, nodeId, choice) {
  const nodeEffect = choice?.end ? null : profile?.nodeEffects?.[choice?.next || nodeId];
  const choiceEffect = profile?.choiceEffects?.[choice?.id];
  const trust = (nodeEffect?.trust || 0) + (choiceEffect?.trust || 0) + (choice?.evidenceId ? 1 : 0);
  const risk = (nodeEffect?.risk || 0) + (choiceEffect?.risk || 0);
  return { trust, risk, promise: choiceEffect?.promise || nodeEffect?.promise || null };
}

export function applyRelationshipMoment(state, profile, nodeId, choice) {
  if (!profile) return state;
  const next = structuredClone(state);
  const record = getRelationshipRecord(next, profile);
  const moments = [
    [
      `choice:${nodeId}:${choice.id}`,
      profile.choiceEffects?.[choice.id],
    ],
    [
      `node:${choice.next || "end"}`,
      choice.end ? null : profile.nodeEffects?.[choice.next],
    ],
    [
      `evidence:${nodeId}:${choice.id}`,
      choice.evidenceId ? { trust: 1, note: `Presented credible evidence: ${choice.evidenceId}` } : null,
    ],
  ];

  let changed = false;
  for (const [eventId, effect] of moments) {
    if (!effect || record.events.includes(eventId)) continue;
    record.events.push(eventId);
    record.trust = clamp(record.trust + (effect.trust || 0), -3, 5);
    record.risk = clamp(record.risk + (effect.risk || 0), 0, 5);
    if (effect.promise && !record.promises.includes(effect.promise)) {
      record.promises.push(effect.promise);
    }
    if (effect.note) record.history.push(effect.note);
    changed = true;
  }
  if (changed) record.interactions += 1;
  next.characters[profile.id] = record;
  return next;
}

export function requestSourceHelp(state, profile, caseStageId) {
  if (!profile) return state;
  const record = getRelationshipRecord(state, profile);
  if (record.trust < 3 || record.assistance.includes(caseStageId)) return state;
  const next = structuredClone(state);
  const updated = getRelationshipRecord(next, profile);
  updated.assistance.push(caseStageId);
  updated.risk = clamp(updated.risk + 1, 0, 5);
  updated.history.push(`Helped with ${caseStageId.replaceAll("_", " ")}`);
  next.characters[profile.id] = updated;
  const currentHint = Number(next.journal.revealedHints[caseStageId]) || 0;
  next.journal.revealedHints[caseStageId] = Math.min(3, currentHint + 1);
  return next;
}
