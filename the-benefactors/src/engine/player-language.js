const DEFAULT_PLAYER = Object.freeze({
  firstName: "Alex",
  lastName: "Rowan",
  pronouns: "they",
});

const PRONOUNS = Object.freeze({
  she: Object.freeze({
    subject: "she",
    object: "her",
    possessiveAdjective: "her",
    possessivePronoun: "hers",
    reflexive: "herself",
    be: "is",
    have: "has",
  }),
  he: Object.freeze({
    subject: "he",
    object: "him",
    possessiveAdjective: "his",
    possessivePronoun: "his",
    reflexive: "himself",
    be: "is",
    have: "has",
  }),
  they: Object.freeze({
    subject: "they",
    object: "them",
    possessiveAdjective: "their",
    possessivePronoun: "theirs",
    reflexive: "themselves",
    be: "are",
    have: "have",
  }),
});

const PLAYER_TOKEN = /\{\{\s*([A-Za-z][A-Za-z0-9]*)\s*\}\}/g;
const CONTROL_OR_MARKUP = /[\u0000-\u001f\u007f<>]/g;

function cleanPlayerName(value, fallback) {
  if (typeof value !== "string") return fallback;
  const cleaned = value
    .normalize("NFC")
    .replace(CONTROL_OR_MARKUP, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || fallback;
}

function capitalize(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function getPlayerLanguage(player = {}) {
  const source = player && typeof player === "object" ? player : {};
  const firstName = cleanPlayerName(source.firstName, DEFAULT_PLAYER.firstName);
  const lastName = cleanPlayerName(source.lastName, DEFAULT_PLAYER.lastName);
  const pronounId = Object.hasOwn(PRONOUNS, source.pronouns)
    ? source.pronouns
    : DEFAULT_PLAYER.pronouns;
  const pronouns = PRONOUNS[pronounId];

  return Object.freeze({
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    pronounId,
    ...pronouns,
    subjectCapitalized: capitalize(pronouns.subject),
  });
}

export function interpolatePlayerText(template, player = {}) {
  if (typeof template !== "string") {
    throw new TypeError("Player text template must be a string.");
  }

  const language = getPlayerLanguage(player);
  return template.replace(PLAYER_TOKEN, (placeholder, token) =>
    Object.hasOwn(language, token) ? language[token] : placeholder,
  );
}
