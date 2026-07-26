export function validateGameContent({
  content,
  evidence,
  inventory,
  dialogues = {},
  deductions = {},
}) {
  const errors = [];
  const locationIds = new Set(Object.keys(content.locations));
  const evidenceIds = new Set(Object.keys(evidence));
  const inventoryIds = new Set(Object.keys(inventory));
  const hotspotIds = new Set();

  for (const [locationId, location] of Object.entries(content.locations)) {
    if (location.id !== locationId) {
      errors.push(`Location key "${locationId}" does not match id "${location.id}".`);
    }

    for (const hotspot of location.hotspots || []) {
      if (hotspotIds.has(hotspot.id)) {
        errors.push(`Duplicate hotspot id "${hotspot.id}".`);
      }
      hotspotIds.add(hotspot.id);

      for (const field of ["x", "y", "width", "height"]) {
        if (
          typeof hotspot[field] !== "number" ||
          hotspot[field] < 0 ||
          hotspot[field] > 100
        ) {
          errors.push(
            `Hotspot "${hotspot.id}" has invalid normalized ${field}: ${hotspot[field]}.`,
          );
        }
      }

      for (const effect of hotspot.effects || []) {
        if (effect.type === "collectEvidence" && !evidenceIds.has(effect.id)) {
          errors.push(
            `Hotspot "${hotspot.id}" references missing evidence "${effect.id}".`,
          );
        }
        if (effect.type === "unlockLocation" && !locationIds.has(effect.id)) {
          errors.push(
            `Hotspot "${hotspot.id}" references missing location "${effect.id}".`,
          );
        }
      }
    }
  }

  for (const [itemId, item] of Object.entries(inventory)) {
    if (item.id !== itemId) {
      errors.push(`Inventory key "${itemId}" does not match id "${item.id}".`);
    }
  }

  for (const [evidenceId, item] of Object.entries(evidence)) {
    if (item.id !== evidenceId) {
      errors.push(`Evidence key "${evidenceId}" does not match id "${item.id}".`);
    }
    if (!item.artifact?.type) {
      errors.push(`Evidence "${evidenceId}" has no viewable artifact.`);
    }
  }

  if (!inventoryIds.size) errors.push("At least one inventory tool is required.");
  if (!evidenceIds.size) errors.push("At least one evidence definition is required.");
  if (!locationIds.has("home_office")) errors.push("Home office location is required.");

  for (const [dialogueId, dialogue] of Object.entries(dialogues)) {
    if (dialogue.id !== dialogueId) {
      errors.push(`Dialogue key "${dialogueId}" does not match id "${dialogue.id}".`);
    }
    if (!dialogue.nodes[dialogue.start]) {
      errors.push(`Dialogue "${dialogueId}" has missing start node "${dialogue.start}".`);
    }
    for (const [nodeId, node] of Object.entries(dialogue.nodes)) {
      if (node.id !== nodeId) {
        errors.push(
          `Dialogue "${dialogueId}" node key "${nodeId}" does not match id "${node.id}".`,
        );
      }
      for (const choice of node.choices || []) {
        if (!choice.end && !dialogue.nodes[choice.next]) {
          errors.push(
            `Dialogue "${dialogueId}" choice "${choice.id}" points to missing node "${choice.next}".`,
          );
        }
        if (choice.evidenceId && !evidenceIds.has(choice.evidenceId)) {
          errors.push(
            `Dialogue "${dialogueId}" choice "${choice.id}" references missing evidence "${choice.evidenceId}".`,
          );
        }
      }
    }
  }

  for (const [deductionId, deduction] of Object.entries(deductions)) {
    if (deduction.id !== deductionId) {
      errors.push(
        `Deduction key "${deductionId}" does not match id "${deduction.id}".`,
      );
    }
    for (const evidenceId of deduction.requiredEvidence || []) {
      if (!evidenceIds.has(evidenceId)) {
        errors.push(
          `Deduction "${deductionId}" references missing evidence "${evidenceId}".`,
        );
      }
    }
    for (const connection of deduction.requiredConnections || []) {
      for (const evidenceId of [connection.a, connection.b]) {
        if (!evidenceIds.has(evidenceId)) {
          errors.push(
            `Deduction "${deductionId}" connection references missing evidence "${evidenceId}".`,
          );
        }
      }
    }
  }

  return errors;
}

export function assertValidGameContent(data) {
  const errors = validateGameContent(data);
  if (errors.length) {
    throw new Error(`Game content validation failed:\n- ${errors.join("\n- ")}`);
  }
}
