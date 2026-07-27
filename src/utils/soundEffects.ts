// Synthesized audio effects using Web Audio API for zero external file dependencies

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = false;
  private musicInterval: any = null;
  private audioTrack: HTMLAudioElement | null = null;

  // Pixabay requested music tracks
  private lobbyMusicUrl = "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8230230.mp3";
  private jazzMusicUrl = "https://cdn.pixabay.com/download/audio/2023/08/17/audio_03d2b0e6bf.mp3";

  constructor() {
    // AudioContext lazily created on first user interaction
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopSuspenseMusic();
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopSuspenseMusic();
    } else {
      this.startSuspenseMusic();
    }
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  // Play requested Pixabay audio track or fallback to Web Audio synth
  public startSuspenseMusic(trackType: 'jazz' | 'lobby' = 'jazz') {
    // Music completely removed per user request
    return;
  }

  private startSynthesizedMusic() {
    if (this.musicInterval) return;
    const ctx = this.getContext();
    if (!ctx) return;

    let step = 0;
    const bassFreqs = [130.81, 130.81, 146.83, 123.47];
    const chordFreqs = [
      [261.63, 311.13, 392.00],
      [261.63, 349.23, 392.00],
      [293.66, 349.23, 440.00],
      [246.94, 311.13, 392.00],
    ];

    this.musicInterval = setInterval(() => {
      if (!this.soundEnabled || !this.musicEnabled) {
        this.stopSuspenseMusic();
        return;
      }
      try {
        const now = ctx.currentTime;
        const bFreq = bassFreqs[step % bassFreqs.length];
        const chord = chordFreqs[step % chordFreqs.length];

        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bFreq, now);

        bassGain.gain.setValueAtTime(0.08, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 0.35);

        const tickOsc = ctx.createOscillator();
        const tickGain = ctx.createGain();
        tickOsc.type = 'square';
        tickOsc.frequency.setValueAtTime(1800 + (step % 2) * 400, now);

        tickGain.gain.setValueAtTime(0.02, now);
        tickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

        tickOsc.connect(tickGain);
        tickGain.connect(ctx.destination);
        tickOsc.start(now);
        tickOsc.stop(now + 0.05);

        if (step % 2 === 0) {
          chord.forEach((freq) => {
            const padOsc = ctx.createOscillator();
            const padGain = ctx.createGain();
            padOsc.type = 'sine';
            padOsc.frequency.setValueAtTime(freq, now);

            padGain.gain.setValueAtTime(0.025, now);
            padGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

            padOsc.connect(padGain);
            padGain.connect(ctx.destination);
            padOsc.start(now);
            padOsc.stop(now + 0.7);
          });
        }

        step++;
      } catch (e) {
        console.warn('Music loop error', e);
      }
    }, 450);
  }

  public stopSuspenseMusic() {
    if (this.audioTrack) {
      try {
        this.audioTrack.pause();
        this.audioTrack.currentTime = 0;
      } catch (e) {}
      this.audioTrack = null;
    }
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  // Answer reveal chime (Iconic ding!)
  public playDing() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Dual sine chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.15); // A6

      osc2.frequency.setValueAtTime(1320, now); // E6
      osc2.frequency.exponentialRampToValueAtTime(2640, now + 0.15); // E7

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // Wrong answer strike buzzer (BUZZ!)
  public playBuzzer() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';

      osc1.frequency.setValueAtTime(110, now); // Low A
      osc2.frequency.setValueAtTime(116.5, now); // Detuned A# for harsh buzz

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.03);
      gain.gain.setValueAtTime(0.4, now + 0.45);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // Face-off buzzer hit
  public playFaceoffBuzzer() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // Fast money timer tick
  public playTimerTick() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // Standard UI click sound
  public playClick() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // Grand victory fanfare
  public playWinFanfare() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5]; // C major arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        const noteStartTime = now + idx * 0.08;
        const duration = idx === notes.length - 1 ? 0.8 : 0.25;

        gain.gain.setValueAtTime(0, noteStartTime);
        gain.gain.linearRampToValueAtTime(0.25, noteStartTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStartTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStartTime);
        osc.stop(noteStartTime + duration);
      });
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }
}

export const soundManager = new SoundManager();
