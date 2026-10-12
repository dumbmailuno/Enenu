/**
 * A soft pen-on-paper scribble, synthesised with Web Audio (no audio file needed).
 * Filtered noise in short, irregular strokes with small pauses. Kept quiet on purpose.
 */
const LEVEL = 0.5; // master level for the whole effect (0..1)

export class Pen {
  private ctx: AudioContext;
  private master: GainNode;
  private noise: AudioBuffer;
  private src: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private band: BiquadFilterNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private on = false;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = LEVEL;
    this.master.connect(ctx.destination);
    const len = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  setMuted(muted: boolean) {
    this.master.gain.setTargetAtTime(muted ? 0 : LEVEL, this.ctx.currentTime, 0.05);
  }

  start() {
    if (this.on) return;
    this.on = true;
    const c = this.ctx;
    if (c.state === "suspended") void c.resume();
    const src = c.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1500;
    const band = c.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 4000;
    band.Q.value = 0.9;
    const gain = c.createGain();
    gain.gain.value = 0;
    src.connect(hp);
    hp.connect(band);
    band.connect(gain);
    gain.connect(this.master);
    src.start();
    this.src = src;
    this.gain = gain;
    this.band = band;

    let pause = 0;
    this.timer = setInterval(() => {
      if (!this.gain || !this.band) return;
      const t = c.currentTime;
      if (pause > 0) {
        pause--;
        this.gain.gain.setTargetAtTime(0, t, 0.02);
        return;
      }
      if (Math.random() < 0.09) pause = 2 + Math.floor(Math.random() * 4);
      this.gain.gain.setTargetAtTime(0.02 + Math.random() * 0.05, t, 0.02);
      this.band.frequency.setTargetAtTime(3000 + Math.random() * 2600, t, 0.03);
    }, 60);
  }

  stop() {
    if (!this.on) return;
    this.on = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    const { gain, src } = this;
    this.gain = null;
    this.band = null;
    this.src = null;
    if (gain) gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.04);
    setTimeout(() => {
      try { src?.stop(); src?.disconnect(); gain?.disconnect(); } catch { /* already stopped */ }
    }, 250);
  }
}
