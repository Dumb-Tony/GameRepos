import test from "node:test";
import assert from "node:assert/strict";

import {
  getPlayerLanguage,
  interpolatePlayerText,
} from "../src/engine/player-language.js";
import {
  CUTSCENE_BEATS,
  OPENING_MESSAGE,
  TUTORIAL_STEPS,
  YARN_RELATIONSHIPS,
} from "../src/content/onboarding-content.js";

const pronounCases = [
  {
    pronouns: "she",
    subject: "she",
    possessiveAdjective: "her",
    reflexive: "herself",
    be: "is",
    have: "has",
  },
  {
    pronouns: "he",
    subject: "he",
    possessiveAdjective: "his",
    reflexive: "himself",
    be: "is",
    have: "has",
  },
  {
    pronouns: "they",
    subject: "they",
    possessiveAdjective: "their",
    reflexive: "themselves",
    be: "are",
    have: "have",
  },
];

for (const expected of pronounCases) {
  test(`builds complete ${expected.pronouns} player language`, () => {
    const language = getPlayerLanguage({
      firstName: "Nell",
      lastName: "Rowan",
      pronouns: expected.pronouns,
    });

    assert.equal(language.fullName, "Nell Rowan");
    assert.equal(language.subject, expected.subject);
    assert.equal(language.possessiveAdjective, expected.possessiveAdjective);
    assert.equal(language.reflexive, expected.reflexive);
    assert.equal(language.be, expected.be);
    assert.equal(language.have, expected.have);
  });

  test(`interpolates ${expected.pronouns} tokens with correct agreement`, () => {
    const text = interpolatePlayerText(
      "{{fullName}}: {{subject}} keeps {{possessiveAdjective}} notes by {{reflexive}}; {{subject}} {{be}} ready and {{have}} proof.",
      {
        firstName: "Nell",
        lastName: "Rowan",
        pronouns: expected.pronouns,
      },
    );

    assert.equal(
      text,
      `Nell Rowan: ${expected.subject} keeps ${expected.possessiveAdjective} notes by ${expected.reflexive}; ${expected.subject} ${expected.be} ready and ${expected.have} proof.`,
    );
  });
}

test("plain-text interpolation cleans player markup and preserves unknown tokens", () => {
  const text = interpolatePlayerText(
    "{{fullName}} {{unknownToken}}",
    {
      firstName: "<Nell>",
      lastName: "Rowan\u0000",
      pronouns: "invalid",
    },
  );

  assert.equal(text, "Nell Rowan {{unknownToken}}");
  assert.equal(getPlayerLanguage({ pronouns: "invalid" }).subject, "they");
  assert.throws(() => interpolatePlayerText(null), TypeError);
});

test("opening content has four concise beats and ends with an anonymous email lead", () => {
  assert.equal(CUTSCENE_BEATS.length, 4);
  assert.equal(CUTSCENE_BEATS.at(-1).source, "answering-machine");
  assert.equal(CUTSCENE_BEATS.at(-1).anonymous, true);
  assert.equal(CUTSCENE_BEATS.at(-1).text, OPENING_MESSAGE);
  assert.match(OPENING_MESSAGE, /check your email/i);
  assert.doesNotMatch(JSON.stringify(CUTSCENE_BEATS), /Mara/i);

  const tokenBeat = CUTSCENE_BEATS[1].text;
  for (const token of [
    "fullName",
    "subjectCapitalized",
    "possessiveAdjective",
    "reflexive",
    "have",
  ]) {
    assert.match(tokenBeat, new RegExp(`\\{\\{${token}\\}\\}`));
  }
});

test("yarn relationships expose stable meanings and accessible patterns", () => {
  const expectedIds = [
    "confirmed",
    "financial",
    "suspicion",
    "personal",
    "coverup",
    "contradiction",
  ];

  assert.deepEqual(
    YARN_RELATIONSHIPS.map((relationship) => relationship.id),
    expectedIds,
  );

  for (const relationship of YARN_RELATIONSHIPS) {
    assert.ok(relationship.colorName);
    assert.ok(relationship.label);
    assert.ok(relationship.description);
    assert.ok(relationship.patternLabel);
  }

  const boardStep = TUTORIAL_STEPS.find((step) => step.id === "build-the-board");
  assert.deepEqual(boardStep.relationshipIds, expectedIds);
});
