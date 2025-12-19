
import React from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { audioService } from '../services/audioService';

interface UACPromptProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const UACPrompt: React.FC<UACPromptProps> = ({ onConfirm, onCancel }) => {
  React.useEffect(() => {
    audioService.playWindowsChord();
  }, []);

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center">
      {/* Dimmed Background */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel}></div>

      {/* UAC Dialog Box */}
      <div className="bg-[#2b2b2b] w-[480px] rounded-lg shadow-2xl border border-gray-600 text-white relative z-70 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Strip */}
        <div className="h-2 bg-yellow-500 w-full"></div>

        <div className="p-8 pb-4">
          <div className="flex gap-4">
            <div className="bg-yellow-500/10 p-2 rounded h-fit">
               <ShieldAlert className="w-10 h-10 text-yellow-500" />
            </div>
            <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">이 앱이 디바이스를 변경할 수 있도록 허용하시겠습니까?</h2>
                
                <div className="bg-white/5 p-3 rounded mb-4">
                    <p className="font-bold text-sm">CloverPit_Cheat.exe</p>
                    <p className="text-xs text-gray-400 mt-1">확인된 게시자: 알 수 없음</p>
                    <p className="text-xs text-gray-400">파일 원본: 하드 드라이브</p>
                </div>
                
                <div className="text-xs text-blue-400 hover:underline cursor-pointer mb-6">
                    자세한 내용 표시
                </div>

                <div className="flex gap-2 justify-end">
                    <button 
                        onClick={onConfirm}
                        className="bg-[#3c3c3c] hover:bg-[#454545] border border-gray-500 transition-colors px-8 py-1.5 rounded text-sm min-w-[100px]"
                    >
                        예
                    </button>
                    <button 
                        onClick={onCancel}
                        className="bg-[#3c3c3c] hover:bg-[#454545] border border-gray-500 transition-colors px-8 py-1.5 rounded text-sm min-w-[100px]"
                    >
                        아니요
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UACPrompt;
