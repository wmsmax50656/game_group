
class AudioService {
  private audioContext: AudioContext | null = null;

  private init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  public playClick() {
    this.init();
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  public playDataNoise() {
    this.init();
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.type = 'square';
    // Random high pitch bleeps
    const freq = 200 + Math.random() * 800;
    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

    gain.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.05);
  }

  public playError() {
    this.init();
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
    osc.frequency.linearRampToValueAtTime(50, this.audioContext.currentTime + 0.5);

    gain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.5);
  }

  public playAlarm() {
     this.init();
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    osc.frequency.setValueAtTime(0, this.audioContext.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.3);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  // Windows Critical Stop / Chord Sound Simulation
  public playWindowsChord() {
    this.init();
    if (!this.audioContext) return;

    const t = this.audioContext.currentTime;
    const gain = this.audioContext.createGain();
    gain.connect(this.audioContext.destination);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 1);

    // Create two sine waves for a chord-like effect
    [800, 1200].forEach(freq => {
        const osc = this.audioContext!.createOscillator();
        osc.connect(gain);
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.start(t);
        osc.stop(t + 1);
    });
  }

  // Fast ticking sound for money draining
  public playCoinDrain() {
      this.init();
      if (!this.audioContext) return;
      
      const t = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(2000, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
      
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.05);
      
      osc.start(t);
      osc.stop(t + 0.05);
  }
}

export const audioService = new AudioService();
