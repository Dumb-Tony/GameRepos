import test from "node:test";
import assert from "node:assert/strict";

import { AudioEngine } from "../src/systems/audio/audio-engine.js";

class FakeParam {
  value = 0;
  targets = [];

  setTargetAtTime(value) {
    this.value = value;
    this.targets.push(value);
  }

  setValueAtTime(value) {
    this.value = value;
  }

  exponentialRampToValueAtTime(value) {
    this.value = value;
  }
}

class FakeNode {
  connections = [];

  connect(node) {
    this.connections.push(node);
  }
}

class FakeOscillator extends FakeNode {
  frequency = new FakeParam();
  started = false;
  stopped = false;

  start() {
    this.started = true;
  }

  stop() {
    this.stopped = true;
  }
}

class FakeGain extends FakeNode {
  gain = new FakeParam();
}

class FakeFilter extends FakeNode {
  frequency = { value: 0 };
}

class FakeAudioContext {
  state = "suspended";
  currentTime = 1;
  destination = {};
  oscillators = [];

  createOscillator() {
    const oscillator = new FakeOscillator();
    this.oscillators.push(oscillator);
    return oscillator;
  }

  createGain() {
    return new FakeGain();
  }

  createBiquadFilter() {
    return new FakeFilter();
  }

  async resume() {
    this.state = "running";
  }
}

test("audio remains optional when Web Audio is unavailable", async () => {
  const audio = new AudioEngine({ AudioContextClass: null });
  assert.equal(audio.available, false);
  assert.equal(await audio.unlock(), false);
  assert.equal(audio.playEffect(), false);
});

test("audio unlocks on demand and responds to scene and mute settings", async () => {
  const audio = new AudioEngine({ AudioContextClass: FakeAudioContext });

  assert.equal(await audio.unlock(), true);
  assert.equal(audio.context.state, "running");
  assert.equal(audio.context.oscillators.length, 2);

  audio.setScene("board");
  assert.equal(audio.nodes.musicOscillator.frequency.value, 49);
  assert.equal(audio.playEffect("pin"), true);
  assert.equal(audio.context.oscillators.length, 3);

  audio.setSettings({ muted: true });
  assert.equal(audio.playEffect("pin"), false);
});
