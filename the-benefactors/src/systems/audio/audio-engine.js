const SCENE_TONES = Object.freeze({
  title: { music: 48, ambience: 72 },
  setup: { music: 52, ambience: 78 },
  onboarding: { music: 52, ambience: 78 },
  tutorial: { music: 55, ambience: 82 },
  cutscene: { music: 46, ambience: 69 },
  home: { music: 52, ambience: 74 },
  board: { music: 49, ambience: 67 },
  map: { music: 55, ambience: 79 },
  laptop: { music: 58, ambience: 116 },
  alignment: { music: 45, ambience: 63 },
  recording: { music: 43, ambience: 60 },
  "prologue-ending": { music: 41, ambience: 57 },
  cinematic: { music: 38, ambience: 54 },
  location: { music: 50, ambience: 76 },
});

function clampVolume(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

export class AudioEngine {
  constructor({
    AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext,
  } = {}) {
    this.AudioContextClass = AudioContextClass;
    this.context = null;
    this.nodes = null;
    this.scene = "title";
    this.settings = {
      muted: false,
      musicVolume: 0.65,
      effectsVolume: 0.8,
      ambienceVolume: 0.75,
    };
  }

  get available() {
    return Boolean(this.AudioContextClass);
  }

  async unlock() {
    if (!this.available) return false;
    if (!this.context) this.#createGraph();
    if (this.context.state === "suspended") {
      await this.context.resume();
    }
    this.#applyLevels();
    return true;
  }

  setSettings(settings = {}) {
    this.settings = { ...this.settings, ...settings };
    this.#applyLevels();
  }

  setScene(scene) {
    this.scene = SCENE_TONES[scene] ? scene : "location";
    if (!this.nodes) return;
    const tones = SCENE_TONES[this.scene];
    this.nodes.musicOscillator.frequency.setTargetAtTime(
      tones.music,
      this.context.currentTime,
      0.8,
    );
    this.nodes.ambienceOscillator.frequency.setTargetAtTime(
      tones.ambience,
      this.context.currentTime,
      0.8,
    );
  }

  playEffect(kind = "paper") {
    if (!this.context || this.context.state !== "running" || this.settings.muted) {
      return false;
    }

    const frequencies = {
      paper: [520, 340],
      pin: [880, 620],
      camera: [180, 90],
      message: [660, 440],
      radio: [1180, 260],
      chapter: [196, 98],
    };
    const [start, end] = frequencies[kind] || frequencies.paper;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const now = this.context.currentTime;
    oscillator.type = kind === "camera" ? "square" : "triangle";
    oscillator.frequency.setValueAtTime(start, now);
    oscillator.frequency.exponentialRampToValueAtTime(end, now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, clampVolume(this.settings.effectsVolume) * 0.07),
      now + 0.01,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
    oscillator.connect(gain);
    gain.connect(this.nodes.masterGain);
    oscillator.start(now);
    oscillator.stop(now + 0.11);
    return true;
  }

  #createGraph() {
    const context = new this.AudioContextClass();
    const masterGain = context.createGain();
    const musicGain = context.createGain();
    const ambienceGain = context.createGain();
    const musicOscillator = context.createOscillator();
    const ambienceOscillator = context.createOscillator();
    const ambienceFilter = context.createBiquadFilter();

    masterGain.gain.value = 0;
    musicGain.gain.value = 0;
    ambienceGain.gain.value = 0;
    musicOscillator.type = "sine";
    ambienceOscillator.type = "triangle";
    ambienceFilter.type = "lowpass";
    ambienceFilter.frequency.value = 180;

    musicOscillator.connect(musicGain);
    ambienceOscillator.connect(ambienceFilter);
    ambienceFilter.connect(ambienceGain);
    musicGain.connect(masterGain);
    ambienceGain.connect(masterGain);
    masterGain.connect(context.destination);

    musicOscillator.start();
    ambienceOscillator.start();
    this.context = context;
    this.nodes = {
      masterGain,
      musicGain,
      ambienceGain,
      musicOscillator,
      ambienceOscillator,
    };
    this.setScene(this.scene);
  }

  #applyLevels() {
    if (!this.nodes || !this.context) return;
    const now = this.context.currentTime;
    const muted = Boolean(this.settings.muted);
    this.nodes.masterGain.gain.setTargetAtTime(muted ? 0 : 1, now, 0.04);
    this.nodes.musicGain.gain.setTargetAtTime(
      clampVolume(this.settings.musicVolume) * 0.035,
      now,
      0.12,
    );
    this.nodes.ambienceGain.gain.setTargetAtTime(
      clampVolume(this.settings.ambienceVolume) * 0.018,
      now,
      0.12,
    );
  }
}
