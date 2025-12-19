import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';
import { audioService } from '../services/audioService';

interface GameOverProps {
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ onRestart }) => {
  
  useEffect(() => {
      audioService.playAlarm();
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-4 crt font-mono text-center z-[200]">
      <div className="max-w-2xl w-full border-4 border-red-600 p-8 rounded-lg bg-red-900/10 shadow-[0_0_50px_rgba(220,38,38,0.5)]">
        
        <div className="flex justify-center mb-6">
            <ShieldAlert className="w-24 h-24 text-red-500 animate-pulse" />
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-red-500 mb-2 tracking-tighter uppercase glitch-text">
          SYSTEM COMPROMISED
        </h1>
        <p className="text-white/70 text-xl mb-8 border-b border-red-500/30 pb-4">
          해킹 시뮬레이션 종료
        </p>

        <div className="bg-black/50 p-6 rounded border border-red-500/50 mb-8 text-left space-y-4">
            <div className="flex justify-between items-center text-red-400">
                <span>은행 계좌 잔액:</span>
                <span className="font-bold line-through">$1,250.00</span>
                <span className="font-bold text-red-500 animate-pulse">$0.00</span>
            </div>
            <div className="flex justify-between items-center text-red-400">
                <span>암호화폐 지갑:</span>
                <span className="font-bold line-through">0.5 BTC</span>
                <span className="font-bold text-red-500 animate-pulse">0.00 BTC</span>
            </div>
            <div className="flex justify-between items-center text-red-400">
                <span>게임 계정 상태:</span>
                <span className="font-bold text-red-500">영구 정지 (BANNED)</span>
            </div>
             <div className="flex justify-between items-center text-red-400">
                <span>개인 파일:</span>
                <span className="font-bold text-red-500">랜섬웨어 감염됨</span>
            </div>
        </div>

        <div className="bg-blue-900/30 p-4 rounded mb-8 border-l-4 border-blue-500 text-left">
            <h3 className="text-blue-300 font-bold mb-1 flex items-center gap-2">
                <AlertTriangle size={18} />
                오늘의 교훈
            </h3>
            <p className="text-blue-100 text-sm">
                출처를 알 수 없는 파일이나 게임 치트 프로그램은 절대 다운로드하지 마세요. 
                그것들은 대부분 당신의 개인정보를 훔치는 악성코드(Malware)입니다.
            </p>
        </div>

        <button 
            onClick={onRestart}
            className="group relative px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition-all duration-200 flex items-center gap-2 mx-auto overflow-hidden"
        >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            시뮬레이터 다시 시작
        </button>
      </div>
    </div>
  );
};

export default GameOver;