/**
 * Subtle procedural Web Audio synthesizer for industrial immersion
 * Zero external audio files required. Completely optional and user-mutable.
 */
export class IndustrialAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = true; // start muted by default for best user experience
    this.ambientGain = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master ambient gain
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);

      // Low frequency hum
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(55, this.ctx.currentTime); // 55Hz low hum

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(this.ambientGain);
      osc.start();

      this.isInitialized = true;
    } catch {
      // AudioContext unavailable or blocked
    }
  }

  toggleMute() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isMuted = !this.isMuted;
    if (this.ambientGain && this.ctx) {
      const targetGain = this.isMuted ? 0.0 : 0.08;
      this.ambientGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.2);
    }
    return !this.isMuted;
  }

  playClick() {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Ignore audio glitches
    }
  }

  playWhoosh() {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {
      // Ignore
    }
  }
}
