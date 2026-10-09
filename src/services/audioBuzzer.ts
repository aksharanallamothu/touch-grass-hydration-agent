class AudioBuzzerService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Play a square wave tone resembling a piezoceramic hardware buzzer
  public playBuzzerTone(freq: number, durationMs: number, type: OscillatorType = 'square', volume: number = 0.15) {
    if (this.isMuted) return;

    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (durationMs / 1000));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + (durationMs / 1000));
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // Sip Recorded Sound (Ascending double chirp: 1200Hz -> 1600Hz)
  public playSipChirp() {
    this.playBuzzerTone(1200, 80, 'square', 0.12);
    setTimeout(() => {
      this.playBuzzerTone(1600, 120, 'square', 0.15);
    }, 60);
  }

  // Hydration Reminder Tone (Urgent pulse: 700Hz -> 950Hz)
  public playHydrationAlert() {
    this.playBuzzerTone(700, 150, 'sawtooth', 0.2);
    setTimeout(() => {
      this.playBuzzerTone(950, 250, 'sawtooth', 0.25);
    }, 180);
  }

  // Extreme UV Shade Alert SOS (Rapid high-pitch 2400Hz alert)
  public playShadeAlert() {
    this.playBuzzerTone(2400, 90, 'square', 0.2);
    setTimeout(() => this.playBuzzerTone(2400, 90, 'square', 0.2), 120);
    setTimeout(() => this.playBuzzerTone(2400, 150, 'square', 0.25), 240);
  }

  // Touch Grass Goal Reached Fanfare
  public playGoalFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBuzzerTone(freq, 200, 'triangle', 0.2);
      }, idx * 120);
    });
  }
}

export const buzzer = new AudioBuzzerService();
