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

test("Calder Square records prove Brighter Horizon financed Northstar", () => {
  let state = createInitialState();
  state.progress.prologueComplete = true;
  state.flags.northstarRoutesToBrighterHorizon = true;
  state.completedDeductions.push(
    "vale_distress_signal",
    "northstar_mail_route",
  );
  state = applyEffects(state, [
    { type: "unlockLocation", id: "brighter_horizon_office" },
    { type: "visitLocation", id: "brighter_horizon_office" },
    { type: "collectEvidence", id: "invoice_northstar" },
    { type: "collectEvidence", id: "northstar_courier_manifest" },
    { type: "collectEvidence", id: "brighter_horizon_connection" },
  ]);

  const office = GAME_CONTENT.locations.brighter_horizon_office;
  const donorWall = office.hotspots.find(
    (hotspot) => hotspot.id === "foundation_donor_wall",
  );
  const visitorLog = office.hotspots.find(
    (hotspot) => hotspot.id === "foundation_visitor_terminal",
  );
  const report = office.hotspots.find(
    (hotspot) => hotspot.id === "foundation_recycling",
  );

  state = applyEffects(
    state,
    DIALOGUES.foundation_receptionist.nodes.marsh.onEnter,
  );
  state = applyEffects(state, donorWall.effects);
  state = applyEffects(state, visitorLog.effects);
  state = applyEffects(state, report.effects);

  assert.equal(state.locationVisits.brighter_horizon_office, 1);
  assert.equal(state.flags.questionedFoundationReceptionist, true);
  assert.equal(state.flags.photographedFoundationDonorWall, true);
  assert.equal(state.flags.foundFoundationVisitorLog, true);
  assert.equal(state.flags.foundFoundationDisbursementReport, true);
  assert.equal(state.evidence.collected.includes("celia_orr_statement"), true);
  assert.equal(state.evidence.collected.includes("calder_donor_wall_photo"), true);
  assert.equal(state.evidence.collected.includes("foundation_visitor_log"), true);
  assert.equal(
    state.evidence.collected.includes("foundation_disbursement_report"),
    true,
  );

  for (const evidenceId of [
    "invoice_northstar",
    "foundation_disbursement_report",
    "northstar_courier_manifest",
    "foundation_visitor_log",
  ]) {
    state = pinEvidence(state, evidenceId);
  }
  state = connectEvidence(
    state,
    "invoice_northstar",
    "foundation_disbursement_report",
    "financial",
  );
  state = connectEvidence(
    state,
    "northstar_courier_manifest",
    "foundation_visitor_log",
    "confirmed",
  );

  const result = evaluateBoardDeductions(state, DEDUCTIONS);
  state = result.state;

  assert.deepEqual(
    result.newlyCompleted.map((deduction) => deduction.id),
    ["foundation_funded_northstar"],
  );
  assert.equal(state.flags.brighterHorizonFundsNorthstar, true);
  assert.equal(state.evidence.collected.includes("calder_gala_invitation"), true);
});
