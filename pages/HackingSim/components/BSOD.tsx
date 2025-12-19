import React, { useEffect } from 'react';
import { audioService } from '../services/audioService';

interface BSODProps {
  onComplete: () => void;
}

const BSOD: React.FC<BSODProps> = ({ onComplete }) => {
  useEffect(() => {
    // Start the scary sound
    audioService.playError();
    
    // Wait for 3 seconds then go to game over
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#0078D7] text-white p-16 font-sans cursor-none z-[100] flex flex-col justify-start items-start">
      <div className="text-[10rem] mb-8">:(</div>
      <h1 className="text-4xl mb-8">PC에 문제가 발생하여 다시 시작해야 합니다.</h1>
      <p className="text-2xl mb-8">
        일부 오류 정보를 수집하고 있습니다. 그런 다음 자동으로 다시 시작합니다.
      </p>
      <p className="text-2xl mb-12">
        0% 완료
      </p>
      
      <div className="mt-auto flex items-center gap-4">
        <div className="w-32 h-32 bg-white p-1">
            {/* Fake QR Code visual */}
            <div className="w-full h-full bg-black pattern-grid-lg"></div>
        </div>
        <div className="text-sm space-y-1">
            <p>이 문제와 가능한 해결 방법에 대한 자세한 내용은 다음을 참조하세요.</p>
            <p>https://www.windows.com/stopcode</p>
            <br />
            <p>중지 코드: <span className="font-bold">CRITICAL_PROCESS_DIED</span></p>
            <p>실패한 내용: <span className="font-bold">Do_Not_Trust_Cheats.sys</span></p>
        </div>
      </div>
    </div>
  );
};

export default BSOD;