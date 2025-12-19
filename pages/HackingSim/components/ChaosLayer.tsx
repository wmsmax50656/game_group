
import React, { useEffect, useState } from 'react';
import Terminal from './Terminal';
import BSOD from './BSOD';
import { audioService } from '../services/audioService';

interface ChaosLayerProps {
  onComplete: () => void;
}

const ChaosLayer: React.FC<ChaosLayerProps> = ({ onComplete }) => {
  const [showBSOD, setShowBSOD] = useState(false);
  const [errorBoxes, setErrorBoxes] = useState<{id: number, x: number, y: number}[]>([]);

  // Flash between BSOD and Terminal
  useEffect(() => {
    const flashInterval = setInterval(() => {
      setShowBSOD(prev => !prev);
    }, 150); // Fast flashing

    return () => clearInterval(flashInterval);
  }, []);

  // Spawn Error Boxes rapidly
  useEffect(() => {
    const errorInterval = setInterval(() => {
      audioService.playWindowsChord();
      setErrorBoxes(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: Math.random() * (window.innerWidth - 300),
          y: Math.random() * (window.innerHeight - 200)
        }
      ]);
    }, 100); // New error every 100ms

    // End chaos after 3 seconds
    const timeout = setTimeout(onComplete, 3000);

    return () => {
      clearInterval(errorInterval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 pointer-events-none">
      {/* Flashing Background Layer */}
      <div className="absolute inset-0">
         {showBSOD ? (
             // Render a simplified BSOD for flashing performance
             <div className="w-full h-full bg-[#0078D7] flex items-center justify-center overflow-hidden">
                <span className="text-9xl text-white">:(</span>
             </div>
         ) : (
             <div className="w-full h-full bg-black">
                <Terminal onComplete={() => {}} />
             </div>
         )}
      </div>

      {/* Cascading Error Boxes */}
      {errorBoxes.map(box => (
        <div 
            key={box.id}
            className="absolute bg-white border border-gray-400 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] w-[300px] h-auto p-0 rounded-sm font-sans"
            style={{ left: box.x, top: box.y }}
        >
            <div className="bg-white flex justify-between items-center px-2 py-1 border-b border-gray-200">
                <span className="text-xs font-medium">System Error</span>
                <button className="text-gray-500 hover:bg-red-500 hover:text-white px-1">✕</button>
            </div>
            <div className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xl">X</div>
                <div className="text-xs">
                    <p className="mb-1">CRITICAL_PROCESS_DIED</p>
                    <p>메모리 주소 0x0000000 참조 실패.</p>
                </div>
            </div>
            <div className="bg-[#f0f0f0] p-2 flex justify-center border-t border-gray-200">
                 <button className="px-4 py-0.5 border border-gray-400 bg-white text-xs hover:bg-gray-100 shadow-sm">확인</button>
            </div>
        </div>
      ))}
    </div>
  );
};

export default ChaosLayer;
