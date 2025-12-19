// Simple synth for 8-bit sounds using Web Audio API

let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const playCoinSound = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') ctx.resume();

  const now = ctx.currentTime;
  
  // Create two oscillators for a "bling" harmony
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'square';
  osc2.type = 'square';

  // Quick Arpeggio (B5 -> E6)
  osc1.frequency.setValueAtTime(987.77, now); 
  osc1.frequency.setValueAtTime(1318.51, now + 0.08);

  // Harmony slightly detuned
  osc2.frequency.setValueAtTime(987.77 * 1.5, now); // Fifth above
  osc2.frequency.setValueAtTime(1318.51 * 1.5, now + 0.08);

  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.4);
  osc2.stop(now + 0.4);
};

export const playSpinSound = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Low mechanical thrum
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(120, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.15);
};

export const playJackpotSound = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') ctx.resume();

  const now = ctx.currentTime;
  
  // Victory fanfare melody
  const notes = [523.25, 659.25, 783.99, 1046.50, 0, 1046.50]; // C E G C (high)
  const duration = 0.1;

  notes.forEach((freq, i) => {
    if (freq === 0) return; // rest
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0.1, now + i * duration);
    gain.gain.linearRampToValueAtTime(0.01, now + i * duration + duration - 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now + i * duration);
    osc.stop(now + i * duration + duration);
  });
};