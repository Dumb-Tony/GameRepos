import test from "node:test";
import assert from "node:assert/strict";

import {
  DEDUCTIONS,
  DIALOGUES,
  GAME_CONTENT,
} from "../src/content/game-content.js";
import { applyEffects } from "../src/engine/events.js";
import { createInitialState } from "../src/engine/game-state.js";
import {
  connectEvidence,
  evaluateBoardDeductions,
  pinEvidence,
} from "../src/systems/evidence-board/evidence-board.js";

test("Harcourt and Register 09 expose the hidden continuity-site network", () => {
  let state = createInitialState();
  state.progress.prologueComplete = true;
  state.flags.uncoveredContractorNetwork = true;
  state.completedDeductions.push(
    "vale_distress_signal",
    "northstar_mail_route",
    "foundation_funded_northstar",
    "room_b_contractor_network",
  );
  state = applyEffects(state, [
    { type: "unlockLocation", id: "saltmere_apartment" },
    { type: "visitLocation", id: "saltmere_apartment" },
    { type: "collectEvidence", id: "accountant_forwarding_slip" },
    { type: "collectEvidence", id: "room_b_conversation" },
    { type: "collectEvidence", id: "gala_contractor_roster" },
  ]);

  const apartment = GAME_CONTENT.locations.saltmere_apartment;
  state = applyEffects(
    state,
    apartment.hotspots.find((hotspot) => hotspot.id === "searched_filing_desk")
      .effects,
  );
  state = applyEffects(state, DIALOGUES.mina_harcourt.nodes["room-b"].onEnter);
  state = applyEffects(state, DIALOGUES.mina_harcourt.nodes.proof.onEnter);
  state = applyEffects(
    state,
    apartment.hotspots.find((hotspot) => hotspot.id === "harcourt_suitcase")
      .effects,
  );

  assert.equal(state.flags.questionedMinaHarcourt, true);
  assert.equal(state.flags.trustedByMinaHarcourt, true);
  assert.equal(state.flags.foundHarcourtLedger, true);
  assert.equal(
    state.progress.unlockedLocations.includes("municipal_archive"),
    true,
  );

  state = applyEffects(state, [
    { type: "visitLocation", id: "municipal_archive" },
  ]);
  const archive = GAME_CONTENT.locations.municipal_archive;
  for (const hotspotId of [
    "archive_register_reader",
    "archive_site_map",
    "archive_retention_cage",
    "archive_deepwell_box",
  ]) {
    state = applyEffects(
      state,
      archive.hotspots.find((hotspot) => hotspot.id === hotspotId).effects,
    );
  }

  for (const evidenceId of [
    "gala_contractor_roster",
    "program_advance_index",
    "municipal_contract_register",
    "secure_site_map",
    "archive_destruction_order",
  ]) {
    state = pinEvidence(state, evidenceId);
  }
  state = connectEvidence(
    state,
    "program_advance_index",
    "municipal_contract_register",
    "financial",
  );
  state = connectEvidence(
    state,
    "gala_contractor_roster",
    "secure_site_map",
    "confirmed",
  );
  state = connectEvidence(
    state,
    "archive_destruction_order",
    "municipal_contract_register",
    "coverup",
  );

  const result = evaluateBoardDeductions(state, DEDUCTIONS);
  state = result.state;

  assert.deepEqual(
    result.newlyCompleted.map((deduction) => deduction.id),
    ["continuity_site_network"],
  );
  assert.equal(state.flags.mappedContinuitySiteNetwork, true);
  assert.equal(state.progress.chapter, 3);
  assert.equal(state.evidence.collected.includes("bellwether_water_clipping"), true);
});
