export class AudioVisualizerService {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private simPhase: number = 0;

  constructor() {
    // Initialized lazily on user gesture to obey browser autoplay policy
  }

  private initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 128;
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Futuristic Sound Effects using Web Audio API Oscillators
  playChime(type: 'startup' | 'listen' | 'speak' | 'confirm' | 'error') {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'startup') {
        // High-tech ascending arpeggio
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.35);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'listen') {
        // Subtle futuristic dual chirp
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'confirm') {
        // Clean high-tech positive acknowledgment
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.12); // C6
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'speak') {
        // Soft digital engage blip
        osc.type = 'sine';
        osc.frequency.setValueAtTime(783.99, now); // G5
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'error') {
        // Low electronic alert tone
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(180, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch {
      // Audio autoplay policy or hardware muted
    }
  }

  // Get Frequency Data (for central orb & waveform bars)
  getFrequencyData(isSpeaking: boolean, isListening: boolean): number[] {
    const bins = 64;
    const output: number[] = new Array(bins).fill(0);

    if (isSpeaking || isListening) {
      this.simPhase += 0.12;

      // Generate organic, fluid audio frequency spectrum
      for (let i = 0; i < bins; i++) {
        const factor = Math.sin(this.simPhase + i * 0.25);
        const factor2 = Math.cos(this.simPhase * 1.5 + i * 0.15);
        const intensity = isSpeaking ? 0.75 : 0.45;
        const base = Math.max(0, factor * 0.5 + factor2 * 0.5);
        const bellCurve = Math.exp(-Math.pow((i - bins / 3) / 14, 2));
        output[i] = Math.min(255, Math.floor((base * bellCurve * intensity + 0.1) * 255));
      }
    } else {
      // Idle ambient idle breathing pulse
      this.simPhase += 0.03;
      for (let i = 0; i < bins; i++) {
        const subtle = Math.sin(this.simPhase + i * 0.1) * 12 + 15;
        output[i] = Math.max(4, Math.floor(subtle));
      }
    }

    return output;
  }
}

export const audioVisualizer = new AudioVisualizerService();
