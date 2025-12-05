import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom'; // 뒤로가기 링크
// 같은 폴더 내의 파일들을 불러옵니다 (./)
import { RhythmState, COLORS, RhythmLayer, JudgmentResult } from './types';
import RhythmVisualizer from './components/RhythmVisualizer';
import Controls from './components/Controls';
import { usePolyrhythmAudio } from './hooks/usePolyrhythmAudio';

// --- Level Definitions ---
interface LevelData {
  id: number;
  name: string;
  description: string;
  bpm: number;
  layers: number[];
  difficultyRating: number;
}

const LEVELS: LevelData[] = [
  { 
    id: 1, name: "Genesis", description: "3 vs 4 Polyrhythm", 
    bpm: 90, layers: [3, 4], difficultyRating: 1 
  },
  { 
    id: 2, name: "Acceleration", description: "High Speed Training", 
    bpm: 150, layers: [3, 4], difficultyRating: 2 
  },
  { 
    id: 3, name: "Trinity", description: "Introduction to 5", 
    bpm: 110, layers: [3, 4, 5], difficultyRating: 4 
  },
  { 
    id: 4, name: "Chaos Theory", description: "Hexagonal Stability", 
    bpm: 125, layers: [4, 5, 6], difficultyRating: 6 
  },
  { 
    id: 5, name: "Grandmaster", description: "The Ultimate Challenge", 
    bpm: 110, layers: [3, 4, 5, 6, 7], difficultyRating: 10 
  }
];

const PolyRhythmGame: React.FC = () => {
  // --- State ---
  const [settings, setSettings] = useState<RhythmState>({
    bpm: 90, 
    layers: [
      { id: '1', beats: 3, color: COLORS[0], mute: false },
      { id: '2', beats: 4, color: COLORS[1], mute: false },
    ],
    isPlaying: false,
    offset: 0, 
  });

  const [isGameMode, setIsGameMode] = useState(false);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  
  // Game State
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hitEffect, setHitEffect] = useState(false);
  const [feedback, setFeedback] = useState<JudgmentResult | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);

  // Calibration State
  const [isCalibrating, setIsCalibrating] = useState(false);
  const calibrationTapsRef = useRef<number[]>([]);
  const savedLayersRef = useRef<RhythmLayer[]>([]);

  // Audio Hook
  const { audioContext } = usePolyrhythmAudio(settings);

  // Apply Level Settings
  useEffect(() => {
    if (isGameMode && !isCalibrating) {
      const level = LEVELS[currentLevelIdx];
      const newLayers: RhythmLayer[] = level.layers.map((beats, idx) => ({
        id: `lvl-${level.id}-${beats}`,
        beats: beats,
        color: COLORS[idx % COLORS.length],
        mute: false
      }));

      setSettings(prev => ({
        ...prev,
        bpm: level.bpm,
        layers: newLayers,
        isPlaying: false 
      }));
      setCombo(0);
      setFeedback(null);
    }
  }, [isGameMode, currentLevelIdx, isCalibrating]);

  // --- Judgment Logic ---
  const getJudgment = useCallback((): JudgmentResult => {
    if (!audioContext || !settings.isPlaying) return { type: 'MISS', text: '', color: '', diff: 0 };
    
    const offsetSeconds = settings.offset / 1000;
    const effectiveTime = audioContext.currentTime + offsetSeconds;
    const measureDuration = (60 / settings.bpm) * 4;
    
    let minDiff = 10000;
    let closestDiffSigned = 0;

    settings.layers.forEach(layer => {
      const beatDuration = measureDuration / layer.beats;
      const currentBeatProgress = (effectiveTime % measureDuration) / beatDuration;
      const nearestBeatIndex = Math.round(currentBeatProgress);
      const beatDiff = currentBeatProgress - nearestBeatIndex;
      const timeDiff = beatDiff * beatDuration;
      
      if (Math.abs(timeDiff) < minDiff) {
        minDiff = Math.abs(timeDiff);
        closestDiffSigned = timeDiff;
      }
    });

    const diffMs = closestDiffSigned * 1000;
    const absDiffMs = Math.abs(diffMs);

    if (absDiffMs <= 40) {
      return { type: 'PURE', text: 'PURE', color: '#fbbf24', diff: diffMs }; 
    } else if (absDiffMs <= 90) {
      return { 
        type: diffMs < 0 ? 'EARLY' : 'LATE', 
        text: diffMs < 0 ? 'EARLY' : 'LATE', 
        color: diffMs < 0 ? '#10b981' : '#3b82f6', 
        diff: diffMs 
      }; 
    } else {
      return { type: 'MISS', text: 'MISS', color: '#ef4444', diff: diffMs }; 
    }
  }, [audioContext, settings]);

  // --- Calibration Logic ---
  const startCalibration = () => {
    if (!audioContext) return;
    setIsCalibrating(true);
    savedLayersRef.current = settings.layers;
    calibrationTapsRef.current = [];
    
    const calLayer: RhythmLayer = { id: 'cal', beats: 4, color: '#ffffff', mute: false };
    setSettings(prev => ({
      ...prev,
      bpm: 120,
      layers: [calLayer],
      isPlaying: true,
      offset: 0 
    }));
  };

  const finishCalibration = () => {
    if (calibrationTapsRef.current.length > 2) {
       const sum = calibrationTapsRef.current.reduce((a, b) => a + b, 0);
       const avg = sum / calibrationTapsRef.current.length;
       const finalOffset = Math.round(avg / 5) * 5;
       
       setSettings(prev => ({
          ...prev,
          offset: finalOffset,
          layers: savedLayersRef.current,
          isPlaying: false
       }));
    } else {
       setSettings(prev => ({
          ...prev,
          layers: savedLayersRef.current,
          isPlaying: false
       }));
    }
    setIsCalibrating(false);
  };

  const handleCalibrationTap = () => {
    if (!audioContext) return;
    const tapTime = audioContext.currentTime;
    const bpm = 120;
    const beatDuration = 60 / bpm;
    
    const nearestBeat = Math.round(tapTime / beatDuration) * beatDuration;
    const diff = nearestBeat - tapTime;
    calibrationTapsRef.current.push(diff * 1000);
    
    setHitEffect(true);
    setTimeout(() => setHitEffect(false), 50);
    
    if (calibrationTapsRef.current.length >= 8) {
       finishCalibration();
    }
  };

  // --- Input Handling ---
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.repeat) return;

    if (isCalibrating) {
       if (event.key === 'Escape') finishCalibration();
       if (event.key.match(/^[a-zA-Z ]$/)) { 
          handleCalibrationTap();
       }
       return;
    }

    if (event.key.match(/^[a-zA-Z]$/)) {
      setHitEffect(true);
      setTimeout(() => setHitEffect(false), 100);

      if (isGameMode && settings.isPlaying) {
        const result = getJudgment();
        
        if (result.type !== 'MISS') {
          setCombo(c => {
            const newCombo = c + 1;
            if (newCombo > maxCombo) setMaxCombo(newCombo);
            return newCombo;
          });
          setFeedback(result);
        } else {
          setCombo(0);
          setFeedback({ type: 'MISS', text: 'MISS', color: '#ef4444', diff: 0 });
        }

        if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = window.setTimeout(() => setFeedback(null), 800);
      }
    }

    if (event.code === 'Space') {
      event.preventDefault();
      setSettings(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    }
  }, [isGameMode, settings.isPlaying, getJudgment, maxCombo, isCalibrating]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const nextLevel = () => {
    if (currentLevelIdx < LEVELS.length - 1) setCurrentLevelIdx(prev => prev + 1);
  };
  const prevLevel = () => {
    if (currentLevelIdx > 0) setCurrentLevelIdx(prev => prev - 1);
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-6 py-12 bg-black text-gray-200 selection:bg-white selection:text-black overflow-x-hidden font-mono w-full relative">
      
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <Link
          to="/"
          className="px-4 py-2 font-bold text-white bg-gray-800 border border-gray-600 hover:bg-gray-700 hover:border-white transition-all text-xs uppercase tracking-widest"
        >
          ← BACK TO HUB
        </Link>
      </div>

      {/* Calibration Overlay */}
      {isCalibrating && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-8 backdrop-blur-sm">
           <h2 className="text-4xl font-bold text-white mb-4 animate-pulse">CALIBRATION MODE</h2>
           <p className="text-gray-400 mb-8 max-w-md text-center">
             Tap any key to the beat. <br/>
             The system will automatically adjust the audio/visual sync offset.
           </p>
           
           <div className="flex gap-2 mb-8">
             {[...Array(8)].map((_, i) => (
                <div key={i} className={`w-4 h-4 rounded-full ${i < calibrationTapsRef.current.length ? 'bg-white' : 'bg-gray-800'}`}></div>
             ))}
           </div>
           
           <RhythmVisualizer settings={settings} audioContext={audioContext} hitEffect={hitEffect} />
           
           <button 
             onClick={finishCalibration}
             className="mt-12 px-8 py-3 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white uppercase tracking-widest"
           >
             Cancel
           </button>
        </div>
      )}

      <main className="w-full max-w-5xl flex flex-col gap-8 relative mt-8">
        <header className="flex flex-col md:flex-row justify-between items-end border-b-2 border-white/20 pb-4 gap-4 relative z-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-white uppercase leading-none">
              PolyRhythm<br/><span className="text-gray-500 text-2xl md:text-3xl">Master</span>
            </h1>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 bg-gray-900 p-2 border border-gray-700">
              <span className={`text-xs font-bold uppercase ${isGameMode ? 'text-white' : 'text-gray-500'}`}>
                {isGameMode ? 'CAMPAIGN MODE' : 'SANDBOX MODE'}
              </span>
              <button 
                onClick={() => setIsGameMode(!isGameMode)}
                className={`w-12 h-6 flex items-center px-1 border transition-colors ${isGameMode ? 'bg-amber-500 border-amber-500 justify-end' : 'bg-black border-gray-600 justify-start'}`}
              >
                <div className="w-4 h-4 bg-white square-full"></div>
              </button>
            </div>
          
            <div className="text-right flex items-center gap-4">
               <div className="text-xs text-gray-500 uppercase tracking-widest">
                 Sys.Stat: {settings.isPlaying ? 'RUNNING' : 'HALTED'}
               </div>
               <div className={`w-2 h-2 ${settings.isPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            </div>
          </div>
        </header>

        {isGameMode && settings.isPlaying && (
          <div className="absolute top-1/2 left-0 w-full pointer-events-none z-50 flex flex-col items-center justify-center mix-blend-difference -translate-y-1/2">
            {combo > 2 && (
              <div className="animate-bounce-short text-center mb-8">
                 <div className="text-8xl font-bold text-white tracking-tighter opacity-80">
                   {combo}
                 </div>
              </div>
            )}
            
            {feedback && (
              <div className="flex flex-col items-center animate-fade-out">
                <div 
                  className="text-4xl md:text-5xl font-black italic tracking-tighter px-6 py-2 border-4 border-current bg-black"
                  style={{ color: feedback.color, borderColor: feedback.color }}
                >
                  {feedback.text}
                </div>
                {feedback.type !== 'PURE' && feedback.type !== 'MISS' && (
                  <div className="mt-2 text-sm font-bold bg-black text-white px-2">
                    {feedback.diff > 0 ? '+' : ''}{Math.round(feedback.diff)}ms
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <section aria-label="Visualizer" className="w-full min-h-[300px] flex flex-col items-center justify-center relative">
          <RhythmVisualizer 
            settings={settings}
            audioContext={audioContext}
            hitEffect={hitEffect}
          />
        </section>

        <section aria-label="Controls" className="w-full transition-all duration-300">
          {isGameMode ? (
            <div className="w-full border-t-2 border-white/20 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <button 
                  onClick={prevLevel}
                  disabled={currentLevelIdx === 0 || settings.isPlaying}
                  className="hidden md:block text-left p-4 border border-gray-800 hover:border-white disabled:opacity-30 disabled:border-gray-800 group"
                >
                   <div className="text-xs text-gray-500 group-hover:text-white">PREV OPERATION</div>
                   <div className="text-xl text-gray-700 group-hover:text-white font-bold">
                     {currentLevelIdx > 0 ? `LVL.${LEVELS[currentLevelIdx-1].id}` : '---'}
                   </div>
                </button>

                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="text-xs font-bold text-amber-500 border border-amber-500 px-3 py-1 uppercase tracking-widest">
                    Current Operation
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-white mb-1">{LEVELS[currentLevelIdx].name}</h2>
                    <p className="text-gray-400 text-sm uppercase tracking-wide">{LEVELS[currentLevelIdx].description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8 w-full border-t border-b border-gray-800 py-4">
                     <div>
                       <div className="text-2xl font-bold text-white">{LEVELS[currentLevelIdx].bpm}</div>
                       <div className="text-[10px] text-gray-500">BPM</div>
                     </div>
                     <div>
                       <div className="text-2xl font-bold text-white">{LEVELS[currentLevelIdx].difficultyRating}</div>
                       <div className="text-[10px] text-gray-500">DIFFICULTY</div>
                     </div>
                  </div>

                  <button
                    onClick={() => setSettings(p => ({...p, isPlaying: !p.isPlaying}))}
                    className={`
                       w-full py-4 text-xl font-bold uppercase tracking-widest border-2 transition-all
                       ${settings.isPlaying 
                         ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-black' 
                         : 'border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black animate-pulse'}
                    `}
                  >
                    {settings.isPlaying ? 'ABORT' : 'START MISSION'}
                  </button>
                </div>

                <button 
                  onClick={nextLevel}
                  disabled={currentLevelIdx === LEVELS.length - 1 || settings.isPlaying}
                  className="hidden md:block text-right p-4 border border-gray-800 hover:border-white disabled:opacity-30 disabled:border-gray-800 group"
                >
                   <div className="text-xs text-gray-500 group-hover:text-white">NEXT OPERATION</div>
                   <div className="text-xl text-gray-700 group-hover:text-white font-bold">
                     {currentLevelIdx < LEVELS.length - 1 ? `LVL.${LEVELS[currentLevelIdx+1].id}` : '---'}
                   </div>
                </button>

                <div className="md:hidden flex justify-between w-full">
                  <button onClick={prevLevel} disabled={currentLevelIdx === 0} className="px-4 py-2 border border-gray-600 disabled:opacity-30">PREV</button>
                  <button onClick={nextLevel} disabled={currentLevelIdx === LEVELS.length - 1} className="px-4 py-2 border border-gray-600 disabled:opacity-30">NEXT</button>
                </div>
              </div>
              
              <div className="mt-12 flex justify-center">
                 <button 
                   onClick={startCalibration}
                   className="text-xs text-gray-500 hover:text-white border-b border-gray-700 hover:border-white transition-colors pb-1 uppercase tracking-widest"
                 >
                   [ Initiate Auto-Sync Calibration ]
                 </button>
              </div>
            </div>
          ) : (
            <>
               <Controls settings={settings} setSettings={setSettings} disabled={false} />
               <div className="mt-8 flex justify-center pb-8">
                  <button 
                    onClick={startCalibration}
                    className="text-xs text-gray-500 hover:text-white border-b border-gray-700 hover:border-white transition-colors pb-1 uppercase tracking-widest"
                  >
                    [ Initiate Auto-Sync Calibration ]
                  </button>
               </div>
            </>
          )}
        </section>
      </main>
      
      <footer className="fixed bottom-4 right-4 text-right pointer-events-none opacity-50 hidden md:block">
        <p className="text-[10px] uppercase tracking-widest text-gray-500">
          [SPACE] Toggle Playback<br/>
          [ANY KEY] Trigger Hit
        </p>
      </footer>
    </div>
  );
};

export default PolyRhythmGame;
``