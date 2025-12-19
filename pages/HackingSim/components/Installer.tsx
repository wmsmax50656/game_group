
import React, { useEffect, useState } from 'react';
import { X, Minus, Sparkles } from 'lucide-react';

interface InstallerProps {
  onGlitchStart: () => void;
}

const Installer: React.FC<InstallerProps> = ({ onGlitchStart }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Stop at 66% (2/3rds) and trigger chaos
        if (prev >= 66) {
          clearInterval(interval);
          onGlitchStart();
          return 66;
        }
        // Random speed increment
        return prev + Math.random() * 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onGlitchStart]);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-[#f3f3f3] text-black rounded-lg shadow-xl z-50 overflow-hidden font-sans border border-gray-300">
      {/* Title Bar */}
      <div className="h-8 bg-white flex items-center justify-between px-3 border-b border-gray-200 select-none">
        <div className="flex items-center gap-2 text-xs font-medium">
            <Sparkles size={14} className="text-purple-600" />
            <span>CloverPit Cheat Setup</span>
        </div>
        <div className="flex gap-2">
            <Minus size={14} className="text-gray-400" />
            <X size={14} className="text-gray-400" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="text-white w-8 h-8 animate-pulse" />
            </div>
            <div>
                <h3 className="font-bold text-lg">설치 중...</h3>
                <p className="text-sm text-gray-500">잠시만 기다려 주세요. 게임 파일을 변조하는 중입니다.</p>
            </div>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-300 mb-2">
            {/* Progress Fill */}
            <div 
                className="h-full bg-green-500 transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
        <div className="text-right text-xs text-gray-500 font-mono">
            {Math.floor(progress)}%
        </div>
      </div>
    </div>
  );
};

export default Installer;
