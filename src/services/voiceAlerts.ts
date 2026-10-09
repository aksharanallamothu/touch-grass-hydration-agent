class VoiceAlertService {
  private isEnabled: boolean = true;
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoice();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  private initVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer clear English natural voice if available
    this.selectedVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))) || voices[0] || null;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled && this.synth) {
      this.synth.cancel();
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public speak(message: string, priority: 'NORMAL' | 'HIGH' = 'NORMAL') {
    if (!this.isEnabled || !this.synth) return;

    // High priority alerts cancel previous speech
    if (priority === 'HIGH') {
      this.synth.cancel();
    }

    try {
      const utterance = new SpeechSynthesisUtterance(message);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  // Voice Announcement Triggers
  public announceSip(volumeMl: number, totalSips: number) {
    this.speak(`Sip recorded. Total intake is ${volumeMl} milliliters across ${totalSips} sips.`, 'NORMAL');
  }

  public announceUvWarning(uvIndex: number) {
    this.speak(`Touch Grass Warning: Solar UV index is ${uvIndex.toFixed(1)}. High heat strain detected. Please take a drink from your smart bottle and seek shade immediately.`, 'HIGH');
  }

  public announceHydrationReminder() {
    this.speak(`Hydration alert: You have not taken a sip in thirty minutes. Please drink water now.`, 'HIGH');
  }

  public announceOutdoorGoal(minutes: number) {
    this.speak(`Congratulations! You have completed ${minutes} minutes of Touch Grass outdoor activity today!`, 'NORMAL');
  }
}

export const voiceAlerts = new VoiceAlertService();
