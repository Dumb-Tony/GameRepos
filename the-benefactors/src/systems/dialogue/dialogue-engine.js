import { evaluateCondition } from "../../engine/conditions.js";

export function getDialogueNode(dialogues, dialogueId, nodeId) {
  const dialogue = dialogues[dialogueId];
  if (!dialogue) throw new Error(`Unknown dialogue: ${dialogueId}`);
  const node = dialogue.nodes[nodeId];
  if (!node) throw new Error(`Unknown dialogue node: ${dialogueId}.${nodeId}`);
  return node;
}

export function getAvailableChoices(node, state) {
  return (node.choices || []).filter((choice) =>
    evaluateCondition(choice.requires, state),
  );
}

export function startDialogue(state, dialogues, dialogueId) {
  const dialogue = dialogues[dialogueId];
  if (!dialogue) throw new Error(`Unknown dialogue: ${dialogueId}`);

  const next = structuredClone(state);
  next.dialogue.activeDialogueId = dialogueId;
  next.dialogue.activeNodeId = dialogue.start;
  if (!next.dialogue.visitedNodes.includes(`${dialogueId}.${dialogue.start}`)) {
    next.dialogue.visitedNodes.push(`${dialogueId}.${dialogue.start}`);
  }
  return next;
}

export function advanceDialogue(state, dialogueId, choice) {
  const next = structuredClone(state);

  if (choice.end) {
    next.dialogue.activeDialogueId = null;
    next.dialogue.activeNodeId = null;
    if (!next.dialogue.completedDialogues.includes(dialogueId)) {
      next.dialogue.completedDialogues.push(dialogueId);
    }
    return next;
  }

  next.dialogue.activeNodeId = choice.next;
  const visitedId = `${dialogueId}.${choice.next}`;
  if (!next.dialogue.visitedNodes.includes(visitedId)) {
    next.dialogue.visitedNodes.push(visitedId);
  }
  return next;
}

export function closeDialogue(state) {
  const next = structuredClone(state);
  next.dialogue.activeDialogueId = null;
  next.dialogue.activeNodeId = null;
  return next;
}

