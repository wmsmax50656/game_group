import { useEffect, useRef, useCallback, useState } from 'react';
import { RhythmState } from '../types';

export const usePolyrhythmAudio = (settings: RhythmState) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  // Track next note time for each layer separately
  const nextNoteTimeRefs = useRef<{ [id: string]: number }>({});
  const timerIDRef = useRef<number | null>(null);
  
  // Expose context for visualizer sync
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const lookahead = 25.0; 
  const scheduleAheadTime = 0.1; 

  // Initialize Audio Context
  useEffect(() => {
    if (!audioContextRef.current) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      setAudioContext(ctx);
    }
  }, []);

  // Sound Synthesis
  const playOscillator = useCallback((time: number, freq: number, decay: number = 0.1) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.value = freq;
    
    // Envelope
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    osc.start(time);
    osc.stop(time + decay);
  }, []);

  // Keyboard Hit Sound (Kick/Woodblock style)
  const playHitSound = useCallback(() => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const time = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
    
    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.start(time);
    osc.stop(time + 0.1);
  }, []);

  const scheduleNotes = useCallback(() => {
    if (!audioContextRef.current || !settings.isPlaying) return;
    const currentTime = audioContextRef.current.currentTime;
    
    // Standard 4/4 measure duration relative to BPM
    // This defines the "Loop" duration.
    const measureDuration = (60 / settings.bpm) * 4;

    settings.layers.forEach((layer) => {
      if (layer.mute) return;

      const beatDuration = measureDuration / layer.beats;

      // --- ABSOLUTE TIME SCHEDULING ---
      // Instead of scheduling relative to when "Play" was pressed,
      // we schedule based on the absolute grid of audioContext.currentTime.
      // This ensures that (Time % Duration) in visualizer always matches the audio.
      
      let nextTime = nextNoteTimeRefs.current[layer.id];

      // If we lost track (paused) or next time is in the past, snap to the next grid point
      if (nextTime == null || nextTime < currentTime) {
        nextTime = Math.ceil(currentTime / beatDuration) * beatDuration;
        nextNoteTimeRefs.current[layer.id] = nextTime;
      }

      // Schedule notes until window is full
      while (nextNoteTimeRefs.current[layer.id] < currentTime + scheduleAheadTime) {
        // Base frequency calculation based on beats
        const baseFreq = 220 + (layer.beats * 50); 
        
        playOscillator(nextNoteTimeRefs.current[layer.id], baseFreq);

        // Advance time
        nextNoteTimeRefs.current[layer.id] += beatDuration;
      }
    });
  }, [settings, playOscillator]);

  const scheduler = useCallback(() => {
    scheduleNotes();
    timerIDRef.current = window.setTimeout(scheduler, lookahead);
  }, [scheduleNotes]);

  useEffect(() => {
    if (settings.isPlaying) {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      // We DO NOT reset nextNoteTimeRefs here anymore.
      // The scheduler will automatically pick up the next absolute grid point.
      // This allows pausing and resuming without losing the "phase" of the polyrhythm relative to the global timer.

      scheduler();
    } else {
      if (timerIDRef.current !== null) {
        window.clearTimeout(timerIDRef.current);
        timerIDRef.current = null;
      }
    }

    return () => {
      if (timerIDRef.current !== null) {
        window.clearTimeout(timerIDRef.current);
      }
    };
  }, [settings.isPlaying, scheduler]);

  return { audioContext, playHitSound };
};