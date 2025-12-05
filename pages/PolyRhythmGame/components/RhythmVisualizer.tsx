
import React, { useEffect, useRef } from 'react';
import { RhythmState } from '../types';

interface Props {
  settings: RhythmState;
  audioContext: AudioContext | null;
  hitEffect: boolean;
}

const RhythmVisualizer: React.FC<Props> = ({ settings, audioContext, hitEffect }) => {
  const requestRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ballsRef = useRef<{ [key: string]: SVGCircleElement | null }>({});
  const lastProgressRef = useRef<number>(0);

  const updateAnimation = () => {
    if (!audioContext || !settings.isPlaying) {
      return;
    }

    const currentTime = audioContext.currentTime;
    // Apply latency offset (convert ms to seconds)
    // Positive offset = Visuals engage earlier (shifts ball forward) to compensate for visual lag
    // Negative offset = Visuals engage later (shifts ball backward)
    const effectiveTime = currentTime + (settings.offset / 1000);

    const measureDuration = (60 / settings.bpm) * 4;
    const cycleProgress = (effectiveTime % measureDuration) / measureDuration;

    // --- Screen Shake Logic ---
    // Note: Shake should also trigger on effectiveTime to match what user sees
    if (cycleProgress < 0.05 && lastProgressRef.current > 0.9) {
      if (containerRef.current) {
        containerRef.current.style.transform = `translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)`;
        setTimeout(() => {
          if (containerRef.current) containerRef.current.style.transform = 'none';
        }, 50);
      }
    }
    lastProgressRef.current = cycleProgress;

    // --- Ball Animation Logic ---
    settings.layers.forEach((layer) => {
      const ball = ballsRef.current[layer.id];
      
      if (ball) {
        const numSides = layer.beats;
        const totalSides = numSides;
        
        // Calculate position based on progress
        const currentProgress = cycleProgress * totalSides;
        const edgeIndex = Math.floor(currentProgress);
        const segmentProgress = currentProgress % 1;

        const radius = 60; 
        const center = { x: 80, y: 80 }; 
        
        const getVertex = (i: number) => {
          const angle = (Math.PI * 2 * i) / numSides - (Math.PI / 2);
          return {
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle)
          };
        };

        const p1 = getVertex(edgeIndex);
        const p2 = getVertex((edgeIndex + 1) % numSides);

        const currentX = p1.x + (p2.x - p1.x) * segmentProgress;
        const currentY = p1.y + (p2.y - p1.y) * segmentProgress;

        ball.setAttribute('cx', currentX.toString());
        ball.setAttribute('cy', currentY.toString());

        // Visual "Hit" size change
        // We make the hit visual window slightly larger than the audio hit window for visual feedback
        if (segmentProgress < 0.08 || segmentProgress > 0.92) {
           ball.setAttribute('r', '7');
           ball.setAttribute('stroke-width', '4');
        } else {
           ball.setAttribute('r', '4');
           ball.setAttribute('stroke-width', '0');
        }
      }
    });

    requestRef.current = requestAnimationFrame(updateAnimation);
  };

  useEffect(() => {
    if (settings.isPlaying) {
      requestRef.current = requestAnimationFrame(updateAnimation);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [settings, audioContext]);

  const getPolygonPoints = (sides: number) => {
    const points = [];
    const radius = 60;
    const center = { x: 80, y: 80 };
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - (Math.PI / 2);
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full transition-transform duration-75 ease-out ${hitEffect ? 'invert' : ''}`}
    >
      <div className="flex flex-wrap gap-6 justify-center items-center">
        
        {settings.layers.map((layer) => (
          <div 
            key={layer.id} 
            className="relative w-40 h-48 group"
          >
             {/* Technical Card Frame */}
             <div className="absolute inset-0 border-2 border-gray-800 bg-black z-0 transition-colors group-hover:border-gray-600"></div>
             
             {/* Header Label */}
             <div className="absolute top-0 left-0 w-full h-8 border-b-2 border-gray-800 flex items-center justify-between px-2 z-10 bg-gray-900/50">
                <span className="text-xs font-bold text-white font-mono">CH-{layer.beats}</span>
                <div className="w-2 h-2 bg-current" style={{ color: layer.color }}></div>
             </div>

             {/* Content */}
             <div className="absolute inset-0 top-8 flex items-center justify-center z-10">
                <svg viewBox="0 0 160 160" className="w-full h-full p-2">
                  <polygon
                    points={getPolygonPoints(layer.beats)}
                    fill="none"
                    stroke={layer.color}
                    strokeWidth="1"
                    className="opacity-50"
                  />
                  
                  <circle
                    ref={el => { ballsRef.current[layer.id] = el; }}
                    cx="80" cy="10" 
                    r="4"
                    fill="white"
                    stroke={layer.color}
                    strokeWidth="0"
                    shapeRendering="geometricPrecision"
                  />
                </svg>
             </div>
             
             {/* Corner Accents */}
             <div className="absolute bottom-1 right-2 text-[10px] text-gray-600 font-mono z-10">
               COORD.X{layer.beats}
             </div>
          </div>
        ))}
        
        {settings.layers.length === 0 && (
          <div className="w-64 h-32 flex items-center justify-center border-2 border-dashed border-gray-800 text-gray-600 text-sm uppercase tracking-widest">
            No Active Signals
          </div>
        )}

      </div>
      
      {!settings.isPlaying && settings.layers.length > 0 && (
         <div className="mt-8 text-center animate-pulse">
            <span className="inline-block px-4 py-1 bg-white text-black text-sm font-bold uppercase tracking-widest border border-white">
              System Paused
            </span>
         </div>
      )}
    </div>
  );
};

export default RhythmVisualizer;
