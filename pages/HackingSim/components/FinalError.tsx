
import React, { useEffect } from 'react';
import { audioService } from '../services/audioService';

interface FinalErrorProps {
  onComplete: () => void;
}

const FinalError: React.FC<FinalErrorProps> = ({ onComplete }) => {
  useEffect(() => {
    audioService.playWindowsChord();
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
      <div className="bg-white border border-[#0078d7] shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_10px_30px_rgba(0,0,0,0.2)] w-[360px] rounded-md overflow-hidden font-[Segoe UI] pointer-events-auto animate-in zoom-in-95 duration-75">
          <div className="flex justify-between items-center px-3 py-2 border-b border-gray-100">
              <span className="text-xs text-gray-700">explorer.exe - 시스템 오류</span>
              <button className="text-gray-400 hover:text-red-500">✕</button>
          </div>
          <div className="p-5 flex gap-4">
              <div className="text-red-500 text-3xl shrink-0">✕</div>
              <div>
                  <p className="text-[#003399] text-[15px] mb-2">Windows가 응답하지 않습니다.</p>
                  <p className="text-gray-600 text-xs leading-relaxed">
                      시스템 리소스가 부족하거나 치명적인 하드웨어 손상이 감지되었습니다. 
                      데이터 손실을 방지하기 위해 시스템을 종료합니다.
                  </p>
              </div>
          </div>
          <div className="bg-[#f0f0f0] p-3 flex justify-end gap-2 border-t border-gray-200">
               <button 
                  onClick={onComplete}
                  className="bg-[#e1e1e1] hover:bg-[#d1d1d1] border border-[#adadad] px-6 py-1 text-sm rounded-[2px] min-w-[80px]"
                >
                  프로그램 종료
               </button>
          </div>
      </div>
    </div>
  );
};

export default FinalError;
